const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
// ANON key: for user-facing auth (signUp / signInWithPassword) and RLS-aware queries
const supabaseKey = process.env.SUPABASE_ANON_KEY;
// SERVICE_ROLE key: bypasses RLS for admin/backend operations
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseAdminKey) {
  console.warn("Missing Supabase URL, Anon Key, or Service Role Key in environment variables.");
}

const supabase = createClient(supabaseUrl || "http://placeholder.com", supabaseKey || "placeholder", {
  auth: { persistSession: false }
});

const supabaseAdmin = createClient(supabaseUrl || "http://placeholder.com", supabaseAdminKey || "placeholder", {
  auth: { autoRefreshToken: false, persistSession: false }
});

module.exports = { supabase, supabaseAdmin };
