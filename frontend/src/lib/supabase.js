import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || ''

let supabase
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
} catch {
  // env vars not set — all queries will fail gracefully and fall back to static data
  supabase = createClient('https://placeholder.supabase.co', 'placeholder')
}

export { supabase }
