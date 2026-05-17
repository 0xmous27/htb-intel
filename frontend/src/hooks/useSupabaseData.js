import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CACHE_TTL = 60_000 // 60s
const cache = {}

/**
 * Fetch all rows from a Supabase table with in-memory cache (60s TTL).
 * Falls back to staticData if empty, error, or timeout (5s).
 * Returns { data, loading, stale }
 */
export function useSupabaseData(table, staticData = []) {
  const cached = cache[table]
  const [data, setData] = useState(cached?.rows || staticData)
  const [loading, setLoading] = useState(!cached)
  const [stale, setStale] = useState(!cached)

  useEffect(() => {
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.rows)
      setLoading(false)
      setStale(false)
      return
    }

    let done = false
    const timeout = setTimeout(() => {
      if (!done) {
        done = true
        setData(staticData)
        setStale(true)
        setLoading(false)
      }
    }, 5000)

    supabase.from(table).select('*').order('created_at', { ascending: false })
      .then(({ data: rows, error }) => {
        if (done) return
        done = true
        clearTimeout(timeout)
        if (!error && rows && rows.length > 0) {
          cache[table] = { rows, ts: Date.now() }
          setData(rows)
          setStale(false)
        } else {
          setData(staticData)
          setStale(true)
        }
        setLoading(false)
      })

    return () => { done = true; clearTimeout(timeout) }
  }, [table])

  return { data, loading, stale }
}
