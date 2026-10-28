import { createClient } from '@supabase/supabase-js'

// Browser-side Supabase client for the Parva 26 registration forms.
// Uses the PUBLIC anon key: row-level security lets it INSERT into the
// literacy_* tables and nothing else. Never use the service-role key here.
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// null (not a throw) when unconfigured, so a missing env var cannot take the
// whole site down; the form shows an error instead.
export const supabase =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    : null
