import { useState } from 'react'
import { GTFO } from '../data/gtfo'
import { useTargetCtx } from '../hooks/TargetContext'
import { useSupabaseData } from '../hooks/useSupabaseData'

const TYPE_COLORS = { shell: 'var(--neon)', 'file-read': '#00ccff', 'file-write': '#ff9900', execute: '#ff6600', 'file-transfer': '#aa44ff' }

// Normalize static GTFO shape vs supabase shape
// Static: { name, type, os, desc, uses:[{label,cmd}] }
// Supabase: { id, bin_name, bin_function, os, description, cmd, tags }
function normGtfo(b) {
  if (b.bin_name) {
    return {
      id: b.id,
      name: b.bin_name,
      type: b.bin_function,
      os: b.os || 'linux',
      desc: b.description || '',
      uses: b.cmd ? [{ label: b.bin_function, cmd: b.cmd }] : [],
      tags: Array.isArray(b.tags) ? b.tags : [],
    }
  }
  return b
}

export default function GTFOBins() {
  const [os, setOs] = useState('all')
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(null)
  const [copied, setCopied] = useState(null)
  const { inject } = useTargetCtx()

  const { data: rawData } = useSupabaseData('gtfobins', GTFO)
  const bins = rawData.map(normGtfo)

  const filtered = bins.filter(b =>
    (os === 'all' || b.os === os) &&
    (!search || b.name.includes(search.toLowerCase()) || b.desc.toLowerCase().includes(search.toLowerCase()) || b.type.includes(search.toLowerCase()))
  )

  const copy = (text, id) => {
    navigator.clipboard.writeText(inject(text))
    setCopied(id)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <div className="gtfo-layout" style={{ display: 'flex', gap: '1rem' }}>
      {/* List */}
      <div className="gtfo-list" style={{ width: '220px', flexShrink: 0 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search binary..."
          style={{ width: '100%', background: '#050505', border: '1px solid #1a1a1a', color: 'var(--neon)', fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.4rem 0.6rem', outline: 'none', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
        <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.75rem' }}>
          {['all','linux','windows'].map(o => (
            <button key={o} onClick={() => setOs(o)} style={{ flex: 1, background: os === o ? 'rgba(0,0,0,0.3)' : 'none', border: `1px solid ${os === o ? 'var(--neon)' : '#2a2a2a'}`, color: os === o ? 'var(--neon)' : '#888', fontFamily: 'inherit', fontSize: '0.6rem', padding: '3px', cursor: 'pointer' }}>
              {o.toUpperCase()}
            </button>
          ))}
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 280px)' }}>
          {filtered.map(b => (
            <button key={b.id || b.name} onClick={() => setActive(b)}
              style={{ width: '100%', background: active?.name === b.name ? 'rgba(0,0,0,0.3)' : 'none', border: 'none', borderLeft: `2px solid ${active?.name === b.name ? 'var(--neon)' : 'transparent'}`, color: active?.name === b.name ? 'var(--neon)' : '#aaa', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0.4rem 0.75rem', textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{b.name}</span>
              <span style={{ fontSize: '0.55rem', color: TYPE_COLORS[b.type] || '#888', border: `1px solid ${TYPE_COLORS[b.type] || '#888'}44`, padding: '0 4px' }}>{b.type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!active ? (
          <div className="empty-state">Select a binary from the list</div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1a1a1a', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neon)' }}>{active.name}</span>
              <span style={{ fontSize: '0.65rem', color: TYPE_COLORS[active.type], border: `1px solid ${TYPE_COLORS[active.type]}44`, padding: '1px 6px' }}>{active.type}</span>
              <span style={{ fontSize: '0.65rem', color: '#aaa', border: '1px solid #2a2a2a', padding: '1px 6px' }}>{active.os}</span>
            </div>
            {active.desc && <p style={{ fontSize: '0.72rem', color: '#bbb', marginBottom: '1.25rem' }}>{active.desc}</p>}
            {(active.uses || []).map((u, i) => (
              <div key={i} style={{ marginBottom: '0.75rem' }}>
                <div className="meta-label" style={{ marginBottom: '0.3rem' }}>{u.label}</div>
                <div className="cmd-block">
                  {inject(u.cmd).split('\n').map((line, j) => (
                    <div key={j}>
                      {line.startsWith('#') ? <span style={{ color: '#666' }}>{line}</span>
                        : <><span className="cmd-prompt">$ </span>{line.split(/(\{[A-Z_]+\})/g).map((p, k) => /^\{[A-Z_]+\}$/.test(p) ? <span key={k} className="cmd-placeholder">{p}</span> : <span key={k}>{p}</span>)}</>}
                    </div>
                  ))}
                  <button className={`copy-btn ${copied === `${active.name}-${i}` ? 'copied' : ''}`} onClick={() => copy(u.cmd, `${active.name}-${i}`)}>
                    {copied === `${active.name}-${i}` ? '✓' : 'COPY'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
