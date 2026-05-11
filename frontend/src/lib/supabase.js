import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn('Supabase env vars not set — set VITE_SUPABASE_URL and VITE_SUPABASE_KEY in .env')
}

export const supabase = createClient(SUPABASE_URL || '', SUPABASE_KEY || '')
