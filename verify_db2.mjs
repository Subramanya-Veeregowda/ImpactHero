import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sckifpkgsfmrhmnoxfjn.supabase.co';
const supabaseAnonKey = 'sb_publishable_sHx886Q0QJ504o6tgVbx1g_O48IZaGy';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runVerification() {
  const email = `testuser.${Date.now()}@test.com`;
  const password = 'TestPassword123!';

  console.log('--- STARTING VERIFICATION V2 ---');

  let results = {
    unauthRLS: 'PENDING',
    signup: 'PENDING',
    profileTrigger: 'PENDING',
    loginLogout: 'PENDING',
    scoreCRUD: 'PENDING',
    dupDate: 'PENDING',
    rolling5: 'PENDING',
    storagePolicies: 'PENDING',
    authRLS: 'PENDING',
  };

  // 1. Unauth RLS
  console.log('\\n[TEST] 1. Unauthenticated RLS');
  const { data: noAuthScores, error: noAuthError } = await supabase.from('scores').select('*');
  const { data: noAuthProfiles, error: noAuthProfErr } = await supabase.from('profiles').select('*');
  if (noAuthError || noAuthProfErr) {
    if (noAuthError?.message.includes('infinite recursion') || noAuthProfErr?.message.includes('infinite recursion')) {
      console.error('❌ FAILED: RLS infinite recursion still present!');
      results.unauthRLS = 'FAIL: Infinite recursion';
    } else {
      console.error('❌ FAILED: Unexpected error', noAuthError || noAuthProfErr);
      results.unauthRLS = 'FAIL: Unexpected error';
    }
  } else if (noAuthScores.length === 0 && noAuthProfiles.length === 0) {
    console.log('✅ PASSED: Cannot read scores or profiles without auth (returned empty).');
    results.unauthRLS = 'PASS';
  } else {
    console.error('❌ FAILED: Unauth user could read data!');
    results.unauthRLS = 'FAIL: Data leaked';
  }

  // 2. SIGNUP
  console.log(`\\n[TEST] 2. Signup Flow (${email})`);
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: 'Test Golfer' } }
  });
  if (signUpError) {
    console.error('❌ FAILED: Signup error', signUpError);
    results.signup = 'FAIL: ' + signUpError.message;
    console.log('Aborting further tests since auth failed.');
    return;
  }
  console.log('✅ PASSED: User signed up successfully.');
  results.signup = 'PASS';
  const userId = signUpData.user.id;

  await new Promise(r => setTimeout(r, 1500));

  // 3. PROFILE TRIGGER
  console.log('\\n[TEST] 3. Profile Creation Trigger');
  const { data: profileData, error: profileError } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (profileError || !profileData) {
    console.error('❌ FAILED: Profile trigger failed', profileError);
    results.profileTrigger = 'FAIL: ' + (profileError?.message || 'No profile data');
  } else {
    console.log('✅ PASSED: Profile auto-created:', profileData.email, profileData.full_name);
    results.profileTrigger = 'PASS';
  }

  // 4. SCORE CRUD & DUPLICATE PREVENTION
  console.log('\\n[TEST] 4. Score CRUD & Duplicate Date Prevention');
  const { error: insert1Err } = await supabase.from('scores').insert({ user_id: userId, value: 36, date: '2023-10-01' });
  if (insert1Err) {
    console.error('❌ FAILED: Score 1 insert', insert1Err);
    results.scoreCRUD = 'FAIL: ' + insert1Err.message;
  } else {
    const { error: insertDupErr } = await supabase.from('scores').insert({ user_id: userId, value: 40, date: '2023-10-01' });
    if (insertDupErr && (insertDupErr.code === '23505' || insertDupErr.message.includes('duplicate key'))) {
      console.log('✅ PASSED: Duplicate date prevented properly.');
      results.dupDate = 'PASS';
      results.scoreCRUD = 'PASS'; // basic insert works
    } else {
      console.error('❌ FAILED: Duplicate date was NOT prevented!', insertDupErr);
      results.dupDate = 'FAIL';
    }
  }

  // 5. ROLLING 5-SCORE ENFORCEMENT
  console.log('\\n[TEST] 5. Rolling 5-Score Enforcement');
  await supabase.from('scores').insert([
    { user_id: userId, value: 37, date: '2023-10-02' },
    { user_id: userId, value: 38, date: '2023-10-03' },
    { user_id: userId, value: 39, date: '2023-10-04' },
    { user_id: userId, value: 40, date: '2023-10-05' }
  ]);
  
  await supabase.from('scores').insert({ user_id: userId, value: 45, date: '2023-10-06' });

  const { data: scoresData } = await supabase.from('scores').select('*').eq('user_id', userId).order('date', { ascending: true });
  if (scoresData && scoresData.length === 5) {
    if (scoresData[0].date === '2023-10-02') {
      console.log('✅ PASSED: Exactly 5 scores remain. Oldest score (2023-10-01) was successfully deleted.');
      results.rolling5 = 'PASS';
    } else {
      console.error('❌ FAILED: Oldest score was NOT the one deleted.', scoresData);
      results.rolling5 = 'FAIL: Wrong score deleted';
    }
  } else {
    console.error(`❌ FAILED: Expected 5 scores, found ${scoresData?.length}`);
    results.rolling5 = 'FAIL: Trigger did not delete old scores';
  }

  // Auth RLS Validation (Can we see other's data?)
  console.log('\\n[TEST] 6. Authenticated RLS Validation');
  const { data: allScores, error: allScoresErr } = await supabase.from('scores').select('*');
  if (allScoresErr) {
    results.authRLS = 'FAIL: ' + allScoresErr.message;
  } else if (allScores.length > 0 && allScores.every(s => s.user_id === userId)) {
    console.log('✅ PASSED: User can only see their own scores.');
    results.authRLS = 'PASS';
  } else {
    console.error('❌ FAILED: User saw unauthorized scores or no scores.', allScores);
    results.authRLS = 'FAIL: Unauthorized access allowed';
  }

  // 6. STORAGE BUCKET ACCESS
  console.log('\\n[TEST] 7. Storage Bucket Access');
  const testFileName = `${userId}/test-proof.txt`;
  const { error: uploadErr } = await supabase.storage.from('winner_proofs').upload(testFileName, 'test content');
  if (uploadErr) {
    console.error('❌ FAILED: Storage upload failed', uploadErr);
    results.storagePolicies = 'FAIL: ' + uploadErr.message;
  } else {
    const { data: fileData, error: downloadErr } = await supabase.storage.from('winner_proofs').download(testFileName);
    if (downloadErr) {
      console.error('❌ FAILED: Storage download failed', downloadErr);
      results.storagePolicies = 'FAIL: ' + downloadErr.message;
    } else {
      console.log('✅ PASSED: Storage upload & download successful.');
      results.storagePolicies = 'PASS';
    }
  }

  // 7. LOGOUT & LOGIN
  console.log('\\n[TEST] 8. Login & Logout Flow');
  const { error: logoutErr } = await supabase.auth.signOut();
  if (logoutErr) {
    results.loginLogout = 'FAIL on Logout: ' + logoutErr.message;
  } else {
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    if (loginError) {
      console.error('❌ FAILED: Login failed', loginError);
      results.loginLogout = 'FAIL on Login: ' + loginError.message;
    } else {
      console.log('✅ PASSED: User logged out and logged back in successfully.');
      results.loginLogout = 'PASS';
    }
  }

  console.log('\\n--- VERIFICATION SUMMARY ---');
  console.table(results);
}

runVerification();
