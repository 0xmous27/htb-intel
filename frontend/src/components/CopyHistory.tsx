// @ts-nocheck
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'htb_copy_history'
const MAX_HISTORY = 30

function getHistory() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

// Global listener — intercepts all copy events
let initialized = false
export function initCopyTracker() {
  if (initialized) return
  initialized = true
  document.addEventListener('copy', () => {
    setTimeout(() => {
      navigator.clipboard.readText().then(text => {
        if (!text || text.length > 500 || text.length < 3) return
        const history = getHistory()
        // Avoid duplicates at top
        if (history[0]?.cmd === text) return
        history.unshift({ cmd: text, ts: Date.now() })
        if (history.length > MAX_HISTORY) history.pop()
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
      }).catch(() => {})
    }, 100)
  })
}

export default function CopyHistory() {
  const [history, setHistory] = useState(getHistory)
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(null)

  // Refresh on focus (in case copies happened)
  useEffect(() => {
    const refresh = () => setHistory(getHistory())
    window.addEventListener('focus', refresh)
    const t = setInterval(refresh, 2000)
    return () => { window.removeEventListener('focus', refresh); clearInterval(t) }
  }, [])

  const copy = (text, i) => {
    navigator.clipboard.writeText(text)
    setCopied(i)
    setTimeout(() => setCopied(null), 1000)
  }

  const clear = () => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }

  if (!history.length && !open) return null

  return (
    <div style={{ position: 'fixed', bottom: '3.5rem', right: '1rem', zIndex: 50 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: '#0a0a0a', border: '1px solid #1a1a1a', color: open ? 'var(--neon)' : '#555',
        fontFamily: 'inherit', fontSize: '0.6rem', padding: '0.3rem 0.6rem', cursor: 'pointer',
        borderRadius: '2px',
      }}>
        📋 {history.length}
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: '2rem', right: 0, width: '340px', maxHeight: '300px',
          background: '#0a0a0a', border: '1px solid #1a1a1a', overflowY: 'auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.8)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0.6rem', borderBottom: '1px solid #111' }}>
            <span style={{ fontSize: '0.55rem', color: '#888', letterSpacing: '0.1em' }}>COPY HISTORY</span>
            <button onClick={clear} style={{ background: 'none', border: 'none', color: '#ff3333', fontSize: '0.5rem', cursor: 'pointer', fontFamily: 'inherit' }}>CLEAR</button>
          </div>
          {history.map((item, i) => (
            <div key={i} onClick={() => copy(item.cmd, i)} style={{
              padding: '0.35rem 0.6rem', borderBottom: '1px solid #0d0d0d', cursor: 'pointer',
              background: copied === i ? 'rgba(0,255,153,0.05)' : 'transparent',
            }}>
              <pre style={{ fontSize: '0.58rem', color: copied === i ? 'var(--neon)' : '#aaa', margin: 0, fontFamily: 'inherit', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.cmd}
              </pre>
              <span style={{ fontSize: '0.45rem', color: '#333' }}>{new Date(item.ts).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
