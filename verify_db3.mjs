import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sckifpkgsfmrhmnoxfjn.supabase.co';
const supabaseAnonKey = 'sb_publishable_sHx886Q0QJ504o6tgVbx1g_O48IZaGy';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runVerification() {
  const email = 'impacthero.test@gmail.com';
  const password = 'Test@123456';

  console.log('--- STARTING VERIFICATION V3 ---');

  let results = {
    login: 'PENDING',
    profileTriggerAndAccess: 'PENDING',
    scoreCRUD: 'PENDING',
    dupDate: 'PENDING',
    rolling5: 'PENDING',
    authRLS: 'PENDING',
    storagePolicies: 'PENDING',
    logout: 'PENDING',
  };

  // 1. LOGIN
  console.log('\\n[TEST] 1. Login Flow');
  const { data: authData, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
  if (loginErr || !authData.user) {
    console.error('❌ FAILED: Login error', loginErr);
    results.login = 'FAIL: ' + (loginErr?.message || 'No user returned');
    console.log('Aborting further tests since auth failed.');
    console.table(results);
    return;
  }
  console.log('✅ PASSED: User logged in successfully.');
  results.login = 'PASS';
  const userId = authData.user.id;

  // 2. PROFILE TRIGGER & ACCESS
  console.log('\\n[TEST] 2. Profile Trigger & Access');
  const { data: profileData, error: profileError } = await supabase.from('profiles').select('*');
  if (profileError) {
    console.error('❌ FAILED: Could not fetch profiles', profileError);
    results.profileTriggerAndAccess = 'FAIL: ' + profileError.message;
  } else if (profileData.length === 1 && profileData[0].id === userId) {
    console.log('✅ PASSED: Profile auto-created and RLS correctly restricted view to 1 profile.');
    results.profileTriggerAndAccess = 'PASS';
  } else {
    console.error('❌ FAILED: Expected exactly 1 profile (own), found:', profileData.length);
    results.profileTriggerAndAccess = 'FAIL: RLS leaking or missing profile';
  }

  // Clear existing scores for this user to ensure clean state
  await supabase.from('scores').delete().eq('user_id', userId);

  // 3. SCORE CRUD & DUPLICATE PREVENTION
  console.log('\\n[TEST] 3. Score CRUD & Duplicate Date Prevention');
  const { error: insert1Err } = await supabase.from('scores').insert({ user_id: userId, value: 36, date: '2023-10-01' });
  if (insert1Err) {
    console.error('❌ FAILED: Score 1 insert', insert1Err);
    results.scoreCRUD = 'FAIL: ' + insert1Err.message;
  } else {
    const { error: insertDupErr } = await supabase.from('scores').insert({ user_id: userId, value: 40, date: '2023-10-01' });
    if (insertDupErr && (insertDupErr.code === '23505' || insertDupErr.message.includes('duplicate key'))) {
      console.log('✅ PASSED: Duplicate date prevented properly.');
      results.dupDate = 'PASS';
      results.scoreCRUD = 'PASS';
    } else {
      console.error('❌ FAILED: Duplicate date was NOT prevented!', insertDupErr);
      results.dupDate = 'FAIL';
    }
  }

  // 4. ROLLING 5-SCORE ENFORCEMENT
  console.log('\\n[TEST] 4. Rolling 5-Score Enforcement');
  await supabase.from('scores').insert([
    { user_id: userId, value: 37, date: '2023-10-02' },
    { user_id: userId, value: 38, date: '2023-10-03' },
    { user_id: userId, value: 39, date: '2023-10-04' },
    { user_id: userId, value: 40, date: '2023-10-05' }
  ]);
  
  await supabase.from('scores').insert({ user_id: userId, value: 45, date: '2023-10-06' });

  const { data: scoresData } = await supabase.from('scores').select('*').order('date', { ascending: true });
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

  // 5. AUTH RLS VALIDATION
  console.log('\\n[TEST] 5. Authenticated RLS Validation (Scores)');
  if (scoresData && scoresData.every(s => s.user_id === userId)) {
    console.log('✅ PASSED: User can only see their own scores.');
    results.authRLS = 'PASS';
  } else {
    console.error('❌ FAILED: User saw unauthorized scores or no scores.', scoresData);
    results.authRLS = 'FAIL: Unauthorized access allowed or no data';
  }

  // 6. STORAGE BUCKET ACCESS
  console.log('\\n[TEST] 6. Storage Bucket Access');
  const testFileName = `${userId}/test-proof-${Date.now()}.txt`;
  const fileContent = new Blob(['test content'], { type: 'text/plain' });
  const { error: uploadErr } = await supabase.storage.from('winner_proofs').upload(testFileName, fileContent);
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
    // Clean up
    await supabase.storage.from('winner_proofs').remove([testFileName]);
  }

  // 7. LOGOUT
  console.log('\\n[TEST] 7. Logout Flow');
  const { error: logoutErr } = await supabase.auth.signOut();
  if (logoutErr) {
    console.error('❌ FAILED: Logout failed', logoutErr);
    results.logout = 'FAIL: ' + logoutErr.message;
  } else {
    console.log('✅ PASSED: User logged out successfully.');
    results.logout = 'PASS';
  }

  console.log('\\n--- VERIFICATION SUMMARY ---');
  console.table(results);
}

runVerification();
