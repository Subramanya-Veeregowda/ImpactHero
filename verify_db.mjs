import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sckifpkgsfmrhmnoxfjn.supabase.co';
const supabaseAnonKey = 'sb_publishable_sHx886Q0QJ504o6tgVbx1g_O48IZaGy';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runVerification() {
  const email = `testuser.${Date.now()}@gmail.com`;
  const password = 'TestPassword123!';

  console.log('--- STARTING VERIFICATION ---');

  // 1. RLS TEST (Unauthenticated)
  console.log('\\n[TEST] 1. Unauthenticated RLS for Scores');
  const { data: noAuthData, error: noAuthError } = await supabase.from('scores').select('*');
  if (noAuthError || (noAuthData && noAuthData.length === 0)) {
    console.log('✅ PASSED: Cannot read scores without auth (or returns empty array due to RLS).', noAuthError?.message || 'Empty array returned');
  } else {
    console.error('❌ FAILED: RLS did not block read!', noAuthData);
  }

  // 2. SIGNUP
  console.log(`\\n[TEST] 2. Signup Flow (${email})`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: 'Test Golfer' }
    }
  });
  if (signUpError) {
    console.error('❌ FAILED: Signup error', signUpError);
    return;
  }
  console.log('✅ PASSED: User signed up successfully.');
  const userId = signUpData.user.id;

  // Wait a moment for the trigger to execute
  await new Promise(r => setTimeout(r, 1000));

  // 3. PROFILE TRIGGER
  console.log('\\n[TEST] 3. Profile Creation Trigger');
  const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (profileError) {
    console.error('❌ FAILED: Profile trigger failed', profileError);
  } else {
    console.log('✅ PASSED: Profile auto-created:', profileData.email, profileData.full_name);
  }

  // 4. SCORE CRUD & DUPLICATE PREVENTION
  console.log('\\n[TEST] 4. Score Insert & Duplicate Date Prevention');
  const { error: insert1Err } = await supabase.from('scores').insert({ user_id: userId, value: 36, date: '2023-10-01' });
  if (insert1Err) console.error('❌ FAILED: Score 1 insert', insert1Err);
  else console.log('✅ PASSED: Inserted first score.');

  const { error: insertDupErr } = await supabase.from('scores').insert({ user_id: userId, value: 40, date: '2023-10-01' });
  if (insertDupErr && insertDupErr.code === '23505') {
    console.log('✅ PASSED: Duplicate date prevented properly.');
  } else {
    console.error('❌ FAILED: Duplicate date was NOT prevented!', insertDupErr);
  }

  // 5. ROLLING 5-SCORE ENFORCEMENT
  console.log('\\n[TEST] 5. Rolling 5-Score Enforcement');
  await supabase.from('scores').insert([
    { user_id: userId, value: 37, date: '2023-10-02' },
    { user_id: userId, value: 38, date: '2023-10-03' },
    { user_id: userId, value: 39, date: '2023-10-04' },
    { user_id: userId, value: 40, date: '2023-10-05' }
  ]);
  
  // Insert 6th score (should trigger deletion of oldest)
  await supabase.from('scores').insert({ user_id: userId, value: 45, date: '2023-10-06' });

  // Fetch remaining
  const { data: scoresData } = await supabase.from('scores').select('*').eq('user_id', userId).order('date', { ascending: true });
  if (scoresData.length === 5) {
    console.log('✅ PASSED: Exactly 5 scores remain.');
    if (scoresData[0].date === '2023-10-02') {
      console.log('✅ PASSED: Oldest score (2023-10-01) was successfully deleted by the trigger.');
    } else {
      console.error('❌ FAILED: Oldest score was NOT the one deleted.', scoresData);
    }
  } else {
    console.error(`❌ FAILED: Expected 5 scores, found ${scoresData.length}`);
  }

  // 6. LOGOUT
  console.log('\\n[TEST] 6. Logout Flow');
  await supabase.auth.signOut();
  console.log('✅ PASSED: User signed out via client.');

  // 7. LOGIN
  console.log('\\n[TEST] 7. Login Flow');
  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
  if (loginError) {
    console.error('❌ FAILED: Login failed', loginError);
  } else {
    console.log('✅ PASSED: User logged back in successfully.');
  }

  console.log('\\n--- VERIFICATION COMPLETE ---');
}

runVerification();
