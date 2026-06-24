import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // We also need the user client to verify who is making the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
    }

    const { drawId, winningNumbers, isSimulation } = await req.json()

    if (!drawId || !winningNumbers || winningNumbers.length !== 5) {
      throw new Error('Invalid input: drawId and an array of 5 winningNumbers are required')
    }

    // 1. Fetch Draw
    const { data: draw, error: drawError } = await supabaseAdmin
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single()

    if (drawError || !draw) throw new Error('Draw not found')
    if (draw.status === 'completed' && !isSimulation) {
      throw new Error('This draw has already been executed')
    }

    const jackpotAmount = Number(draw.jackpot_amount || 0)
    const tier2Prize = Number(draw.tier_2_prize || 0)
    const tier3Prize = Number(draw.tier_3_prize || 0)

    // 2. Fetch Eligible Users
    // Users who are not banned and have an active subscription
    const { data: eligibleUsers, error: usersError } = await supabaseAdmin
      .from('profiles')
      .select(`
        id, 
        is_banned,
        subscriptions (
          status
        )
      `)
      .eq('is_banned', false)

    if (usersError) throw usersError

    // Filter to those with an active subscription
    // Subscriptions is an array in one-to-many, but effectively 1 active
    const activeUserIds = eligibleUsers
      .filter(u => u.subscriptions && (Array.isArray(u.subscriptions) ? u.subscriptions : [u.subscriptions]).some(s => s.status === 'active'))
      .map(u => u.id)

    if (activeUserIds.length === 0) {
      return new Response(JSON.stringify({ message: 'No eligible participants found', winners: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 3. Fetch Scores
    // We only fetch scores for active users
    const { data: allScores, error: scoresError } = await supabaseAdmin
      .from('scores')
      .select('user_id, value, date')
      .in('user_id', activeUserIds)
      .order('date', { ascending: false })

    if (scoresError) throw scoresError

    // Group scores by user and take top 5
    const userScoresMap = new Map<string, number[]>()
    for (const score of allScores) {
      const current = userScoresMap.get(score.user_id) || []
      if (current.length < 5) {
        current.push(score.value)
        userScoresMap.set(score.user_id, current)
      }
    }

    // 4. Calculate Matches
    const winningSet = new Set(winningNumbers)
    const matchResults: { userId: string, matches: number }[] = []

    for (const [userId, scores] of userScoresMap.entries()) {
      // Treat user scores as a set of unique values
      const userSet = new Set(scores)
      let matchCount = 0
      for (const val of userSet) {
        if (winningSet.has(val)) {
          matchCount++
        }
      }
      
      if (matchCount >= 3) {
        matchResults.push({ userId, matches: matchCount })
      }
    }

    // 5. Group by Tier & Calculate Prize
    const tier5 = matchResults.filter(m => m.matches === 5)
    const tier4 = matchResults.filter(m => m.matches === 4)
    const tier3 = matchResults.filter(m => m.matches === 3)

    const tier5PrizePerUser = tier5.length > 0 ? jackpotAmount / tier5.length : 0
    const tier4PrizePerUser = tier4.length > 0 ? tier2Prize / tier4.length : 0
    const tier3PrizePerUser = tier3.length > 0 ? tier3Prize / tier3.length : 0

    const winnersToInsert = matchResults.map(m => ({
      draw_id: drawId,
      user_id: m.userId,
      match_type: m.matches,
      prize_amount: m.matches === 5 ? tier5PrizePerUser : (m.matches === 4 ? tier4PrizePerUser : tier3PrizePerUser),
      status: 'pending'
    }))

    const resultsPayload = {
      totalParticipants: activeUserIds.length,
      winnersCount: {
        tier5: tier5.length,
        tier4: tier4.length,
        tier3: tier3.length
      },
      payouts: {
        tier5PerUser: tier5PrizePerUser,
        tier4PerUser: tier4PrizePerUser,
        tier3PerUser: tier3PrizePerUser,
        totalPayout: (tier5.length * tier5PrizePerUser) + (tier4.length * tier4PrizePerUser) + (tier3.length * tier3PrizePerUser)
      },
      winners: winnersToInsert
    }

    if (isSimulation) {
      return new Response(JSON.stringify(resultsPayload), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // 6. Execute (Save to DB)
    // Insert winners
    if (winnersToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('winners')
        .insert(winnersToInsert)
      if (insertError) throw insertError
    }

    // Update draw status
    const { error: updateDrawError } = await supabaseAdmin
      .from('draws')
      .update({
        status: 'completed',
        winning_numbers: winningNumbers,
        executed_at: new Date().toISOString(),
        executed_by: user.id
      })
      .eq('id', drawId)
    if (updateDrawError) throw updateDrawError

    // Insert draw run log
    const { error: runError } = await supabaseAdmin
      .from('draw_runs')
      .insert({
        draw_id: drawId,
        run_type: 'execution',
        parameters: { winningNumbers },
        results: resultsPayload,
        executed_by: user.id
      })
    if (runError) throw runError

    return new Response(JSON.stringify({ success: true, results: resultsPayload }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Execution error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
