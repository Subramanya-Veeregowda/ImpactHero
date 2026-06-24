import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import Stripe from 'npm:stripe@^14.0.0'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!stripeKey || !endpointSecret) {
      throw new Error('Stripe environment variables are missing');
    }

    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    })

    const body = await req.text()
    let event;
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret)
    } catch (err) {
      console.error(`Webhook signature verification failed.`, err.message)
      return new Response(JSON.stringify({ error: err.message }), { status: 400 })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string
      const userId = session.client_reference_id
      
      if (!userId) {
        throw new Error('No user id in session metadata')
      }

      // Upsert the subscription using service_role bypasses RLS
      await supabaseAdmin
        .from('subscriptions')
        .upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: 'active', // we will sync actual status on subscription.updated
          updated_at: new Date().toISOString()
        })
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string
      
      // Determine plan type from the first item (e.g., month/year interval)
      let planType = 'monthly'
      if (subscription.items.data.length > 0) {
        const interval = subscription.items.data[0].price.recurring?.interval
        if (interval === 'year') planType = 'yearly'
      }

      // Find user by customerId
      const { data: subData } = await supabaseAdmin
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_customer_id', customerId)
        .single()
        
      if (subData?.user_id) {
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            stripe_subscription_id: subscription.id,
            plan_type: planType,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', subData.user_id)
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
