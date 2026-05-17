import { useState, useEffect } from 'react'

const STORAGE_KEY = 'htb_notes'

export default function NotesTab() {
  const [notes, setNotes] = useState(() => localStorage.getItem(STORAGE_KEY) || '')
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => { localStorage.setItem(STORAGE_KEY, notes); setSaved(true) }, 600)
    setSaved(false)
    return () => clearTimeout(t)
  }, [notes])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.6rem', color: '#333', letterSpacing: '0.1em' }}>
          {saved ? '● SAVED' : '○ SAVING...'}
        </span>
        <button onClick={() => { if (confirm('Clear all notes?')) setNotes('') }}
          style={{ background: 'none', border: '1px solid #2a0000', color: '#ff3333', fontFamily: 'inherit', fontSize: '0.6rem', padding: '2px 8px', cursor: 'pointer' }}>
          CLEAR
        </button>
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder={`# Target Notes\n\n## Recon\n- IP: \n- Open ports: \n\n## Credentials Found\n- user:pass\n\n## Flags\n- user.txt: \n- root.txt: `}
        style={{ flex: 1, background: '#050505', border: '1px solid #1a1a1a',
          color: 'var(--neon)', fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.78rem', padding: '1rem', resize: 'none', outline: 'none', lineHeight: 1.6 }} />
    </div>
  )
}
