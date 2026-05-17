import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useSupabaseData } from '../hooks/useSupabaseData'

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [{ id: '1', name: 'test' }], error: null })
      })
    })
  }
}))

describe('useSupabaseData', () => {
  it('returns static data initially then fetches from supabase', async () => {
    const staticData = [{ id: 'static', name: 'fallback' }]
    const { result } = renderHook(() => useSupabaseData('tools', staticData))

    // Initially shows static data
    expect(result.current.data).toEqual(staticData)

    // After fetch resolves, shows supabase data
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toEqual([{ id: '1', name: 'test' }])
    expect(result.current.stale).toBe(false)
  })

  it('falls back to static data on error', async () => {
    vi.resetModules()
    vi.doMock('../lib/supabase', () => ({
      supabase: {
        from: () => ({
          select: () => ({
            order: () => Promise.resolve({ data: null, error: { message: 'fail' } })
          })
        })
      }
    }))

    const { useSupabaseData: hook } = await import('../hooks/useSupabaseData')
    const staticData = [{ id: 'fallback' }]
    const { result } = renderHook(() => hook('tools_err', staticData))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
    expect(result.current.data).toEqual(staticData)
    expect(result.current.stale).toBe(true)
  })
})
