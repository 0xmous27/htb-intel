import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Fetch all rows from a Supabase table, falling back to staticData if empty or error.
 * Returns { data, loading }
 */
export function useSupabaseData(table, staticData = []) {
  const [data, setData] = useState(staticData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from(table).select('*').order('created_at', { ascending: false })
      .then(({ data: rows, error }) => {
        if (!error && rows && rows.length > 0) setData(rows)
        else setData(staticData)
        setLoading(false)
      })
  }, [table])

  return { data, loading }
}
