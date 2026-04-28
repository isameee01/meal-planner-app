import { supabase } from '@/lib/supabaseClient';

export async function testDB() {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*')
    .single();

  console.log('DATA:', data);
  console.log('ERROR:', error);

  return { data, error };
}