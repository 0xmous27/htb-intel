import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CACHE_TTL = 60_000
const cache: Record<string, { rows: unknown[]; ts: number }> = {}

/**
 * Fetch all rows from a Supabase table with in-memory cache (60s TTL).
 * Falls back to staticData if empty, error, or timeout (5s).
 */
export function useSupabaseData<T = Record<string, unknown>>(table: string, staticData: T[] = []) {
  const cached = cache[table]
  const [data, setData] = useState<T[]>((cached?.rows as T[]) || staticData)
  const [loading, setLoading] = useState(!cached)
  const [stale, setStale] = useState(!cached)

  useEffect(() => {
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setData(cached.rows as T[])
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
          setData(rows as T[])
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
