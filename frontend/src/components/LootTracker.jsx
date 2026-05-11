import { useState, useEffect } from 'react'

const KEY = 'htb_loot'
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] } }

const TYPES = ['flag', 'credential', 'hash', 'file', 'note']
const TYPE_COLOR = { flag: 'var(--neon)', credential: '#00ccff', hash: '#ff9900', file: '#aa44ff', note: '#555' }

export default function LootTracker() {
  const [loot, setLoot] = useState(load)
  const [form, setForm] = useState({ host: '', type: 'flag', value: '', note: '' })

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(loot)) }, [loot])

  const add = () => {
    if (!form.value.trim()) return
    setLoot(p => [{ ...form, id: Date.now(), ts: new Date().toLocaleTimeString() }, ...p])
    setForm(p => ({ ...p, value: '', note: '' }))
  }

  const remove = id => setLoot(p => p.filter(l => l.id !== id))

  const exportMd = () => {
    const lines = ['# Loot', '']
    TYPES.forEach(t => {
      const items = loot.filter(l => l.type === t)
      if (!items.length) return
      lines.push(`## ${t.toUpperCase()}S`, '')
      items.forEach(l => lines.push(`- **${l.host || 'unknown'}** — \`${l.value}\`${l.note ? ` — ${l.note}` : ''}`))
      lines.push('')
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'loot.md'; a.click()
  }

  const [copied, setCopied] = useState(null)
  const copy = (text, id) => { navigator.clipboard.writeText(text); setCopied(id); setTimeout(() => setCopied(null), 1200) }

  return (
    <div>
      {/* Add form */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '0.75rem', marginBottom: '1rem' }}>
        <div className="loot-form-grid" style={{ display: 'grid', gridTemplateColumns: '120px 100px 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
          {[{ key: 'host', ph: 'host/IP', label: 'HOST' }, { key: 'value', ph: 'value / flag / hash', label: 'VALUE' }, { key: 'note', ph: 'optional note', label: 'NOTE' }].map(f => (
            <div key={f.key} style={f.key === 'host' ? {} : f.key === 'value' ? {} : {}}>
              <div className="meta-label" style={{ marginBottom: '0.2rem' }}>{f.label}</div>
              <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph}
                onKeyDown={e => e.key === 'Enter' && add()}
                className="target-input" style={{ width: '100%' }} />
            </div>
          ))}
          <div>
            <div className="meta-label" style={{ marginBottom: '0.2rem' }}>TYPE</div>
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              style={{ background: '#050505', border: '1px solid #1a1a1a', color: TYPE_COLOR[form.type], fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.25rem 0.4rem', width: '100%' }}>
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <button onClick={add} style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid var(--neon)', color: 'var(--neon)', fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.25rem 0.75rem', cursor: 'pointer', alignSelf: 'end' }}>+ ADD</button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.65rem', color: '#888' }}>{loot.length} items</span>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={exportMd} style={{ background: 'none', border: '1px solid #1a3a1a', color: 'var(--neon-dim)', fontFamily: 'inherit', fontSize: '0.6rem', padding: '2px 8px', cursor: 'pointer' }}>EXPORT MD</button>
          <button onClick={() => { if (confirm('Clear all loot?')) setLoot([]) }} style={{ background: 'none', border: '1px solid #2a0000', color: '#ff3333', fontFamily: 'inherit', fontSize: '0.6rem', padding: '2px 8px', cursor: 'pointer' }}>CLEAR</button>
        </div>
      </div>

      {loot.length === 0 ? <div className="empty-state">No loot yet. Add flags, creds, hashes as you find them.</div> : (
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#aaa', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
              {['TIME', 'HOST', 'TYPE', 'VALUE', 'NOTE', ''].map(h => <th key={h} style={{ padding: '0.4rem 0.75rem', fontWeight: 400, textAlign: 'left' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loot.map(l => (
              <tr key={l.id} style={{ borderBottom: '1px solid #0d0d0d' }}>
                <td style={{ padding: '0.4rem 0.75rem', color: '#888', whiteSpace: 'nowrap' }}>{l.ts}</td>
                <td style={{ padding: '0.4rem 0.75rem', color: 'var(--neon)' }}>{l.host || '—'}</td>
                <td style={{ padding: '0.4rem 0.75rem' }}><span style={{ fontSize: '0.6rem', border: `1px solid ${TYPE_COLOR[l.type]}44`, color: TYPE_COLOR[l.type], padding: '0 4px' }}>{l.type}</span></td>
                <td style={{ padding: '0.4rem 0.75rem', color: '#ddd', maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={l.value}>{l.value}</td>
                <td style={{ padding: '0.4rem 0.75rem', color: '#aaa', fontSize: '0.65rem' }}>{l.note || '—'}</td>
                <td style={{ padding: '0.4rem 0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    <button onClick={() => copy(l.value, l.id)} style={{ background: 'none', border: '1px solid #1a1a1a', color: copied === l.id ? 'var(--neon)' : '#aaa', fontFamily: 'inherit', fontSize: '0.6rem', padding: '1px 5px', cursor: 'pointer' }}>{copied === l.id ? '✓' : 'COPY'}</button>
                    <button onClick={() => remove(l.id)} style={{ background: 'none', border: '1px solid #2a0000', color: '#ff3333', fontFamily: 'inherit', fontSize: '0.6rem', padding: '1px 5px', cursor: 'pointer' }}>DEL</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
