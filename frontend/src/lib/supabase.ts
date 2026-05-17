import { createClient, SupabaseClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || ''

let supabase: SupabaseClient
try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
} catch {
  supabase = createClient('https://placeholder.supabase.co', 'placeholder')
}

export { supabase }
