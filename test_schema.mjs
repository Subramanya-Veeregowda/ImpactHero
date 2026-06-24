import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sckifpkgsfmrhmnoxfjn.supabase.co';
const supabaseAnonKey = 'sb_publishable_sHx886Q0QJ504o6tgVbx1g_O48IZaGy';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSchema() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Profiles table exists! Data:', data);
  }
}

testSchema();
