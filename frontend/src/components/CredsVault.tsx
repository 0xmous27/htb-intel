// @ts-nocheck
import { useState, useEffect } from 'react'
import { useTargetCtx } from '../hooks/TargetContext'

const STORAGE_KEY = 'htb_creds'

export default function CredsVault() {
  const [creds, setCreds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [] } catch { return [] }
  })
  const [form, setForm] = useState({ username: '', password: '', hash: '', source: '', type: 'plaintext' })
  const { setTarget } = useTargetCtx()

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(creds))
  }, [creds])

  const add = () => {
    if (!form.username && !form.password && !form.hash) return
    setCreds(p => [{ ...form, id: Date.now() }, ...p])
    setForm({ username: '', password: '', hash: '', source: '', type: 'plaintext' })
  }

  const remove = (id) => setCreds(p => p.filter(c => c.id !== id))

  const inject = (cred) => {
    setTarget(p => ({
      ...p,
      ...(cred.username ? { USERNAME: cred.username } : {}),
      ...(cred.password ? { PASSWORD: cred.password } : {}),
      ...(cred.hash ? { PASSWORD: cred.hash } : {}),
    }))
  }

  const [copied, setCopied] = useState(null)
  const copy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1200)
  }

  return (
    <div>
      {/* Add form */}
      <div style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="meta-label" style={{ marginBottom: '0.75rem' }}>ADD CREDENTIAL</div>
        <div className="creds-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '0.5rem', alignItems: 'end' }}>
          {[
            { key: 'username', ph: 'username' },
            { key: 'password', ph: 'password' },
            { key: 'hash', ph: 'NTLM hash' },
            { key: 'source', ph: 'source (e.g. /etc/shadow)' },
          ].map(f => (
            <div key={f.key}>
              <div className="meta-label" style={{ marginBottom: '0.25rem' }}>{f.key.toUpperCase()}</div>
              <input
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.ph}
                className="target-input"
                style={{ width: '100%' }}
                onKeyDown={e => e.key === 'Enter' && add()}
              />
            </div>
          ))}
          <div>
            <div className="meta-label" style={{ marginBottom: '0.25rem' }}>TYPE</div>
            <select
              value={form.type}
              onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              style={{ background: '#050505', border: '1px solid #1a1a1a', color: 'var(--neon)', fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.25rem 0.5rem', width: '100%' }}
            >
              <option>plaintext</option>
              <option>ntlm</option>
              <option>netntlmv2</option>
              <option>kerberos</option>
              <option>ssh-key</option>
            </select>
          </div>
          <button onClick={add} style={{ background: 'rgba(0,0,0,0.1)', border: '1px solid var(--neon)', color: 'var(--neon)', fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.25rem 1rem', cursor: 'pointer', alignSelf: 'end' }}>
            + ADD
          </button>
        </div>
      </div>

      {/* Creds table */}
      {creds.length === 0 ? (
        <div className="empty-state">No credentials stored yet. Add found creds above.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#aaa', textAlign: 'left' }}>
              {['USERNAME', 'PASSWORD', 'HASH', 'TYPE', 'SOURCE', 'ACTIONS'].map(h => (
                <th key={h} style={{ padding: '0.4rem 0.75rem', fontWeight: 400, letterSpacing: '0.1em', fontSize: '0.6rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {creds.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #111' }}>
                <td style={{ padding: '0.5rem 0.75rem', color: 'var(--neon)' }}>{c.username || '—'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#ddd' }}>{c.password || '—'}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#ff9900', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={c.hash}>{c.hash || '—'}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}><span className="tag">{c.type}</span></td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#aaa' }}>{c.source || '—'}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => inject(c)} style={{ background: 'none', border: '1px solid var(--neon-dim)', color: 'var(--neon)', fontFamily: 'inherit', fontSize: '0.6rem', padding: '2px 6px', cursor: 'pointer' }}>
                      INJECT
                    </button>
                    <button onClick={() => copy(c.password || c.hash, c.id)} style={{ background: 'none', border: '1px solid #1a1a1a', color: copied === c.id ? 'var(--neon)' : '#aaa', fontFamily: 'inherit', fontSize: '0.6rem', padding: '2px 6px', cursor: 'pointer' }}>
                      {copied === c.id ? '✓' : 'COPY'}
                    </button>
                    <button onClick={() => remove(c.id)} style={{ background: 'none', border: '1px solid #2a0000', color: '#ff3333', fontFamily: 'inherit', fontSize: '0.6rem', padding: '2px 6px', cursor: 'pointer' }}>
                      DEL
                    </button>
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
