import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

function initSupabase() {
  if (supabase) {
    return supabase;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase credentials in environment variables. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env');
  }

  // Create Supabase client with service role key (for server-side operations)
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  });

  return supabase;
}

// Lazy initialization - export a getter function
export function getSupabase() {
  return initSupabase();
}

export default getSupabase();
