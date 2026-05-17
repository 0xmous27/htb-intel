// @ts-nocheck
import { useState } from 'react'
import { CVES } from '../data/cves'
import { useTargetCtx } from '../hooks/TargetContext'
import { useSupabaseData } from '../hooks/useSupabaseData'

const SEV_COLOR = { CRITICAL: '#ff3333', HIGH: '#ff9900', MEDIUM: '#ffcc00', LOW: 'var(--neon)' }

export default function CVERef() {
  const [search, setSearch] = useState('')
  const [active, setActive] = useState(null)
  const [copied, setCopied] = useState(null)
  const { inject } = useTargetCtx()

  const { data: cves } = useSupabaseData('cves', CVES)

  const filtered = cves.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    const id   = (c.id || '').toLowerCase()
    const name = (c.name || '').toLowerCase()
    const svc  = (c.service || '').toLowerCase()
    const tags = Array.isArray(c.tags) ? c.tags : []
    return id.includes(q) || name.includes(q) || svc.includes(q) || tags.some(t => t.includes(q))
  })

  const copy = (text, id) => {
    navigator.clipboard.writeText(inject(text))
    setCopied(id)
    setTimeout(() => setCopied(null), 1200)
  }

  // normalize field names (static uses c.desc, supabase uses c.description)
  const norm = c => ({
    ...c,
    desc: c.description || c.desc || '',
    exploit: c.exploit || '',
    affected: c.affected || '',
    tags: Array.isArray(c.tags) ? c.tags : [],
  })

  const a = active ? norm(active) : null

  return (
    <div className="cve-layout" style={{ display: 'flex', gap: '1rem' }}>
      {/* List */}
      <div className="cve-list" style={{ width: '260px', flexShrink: 0 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search CVE, service, tag..."
          style={{ width: '100%', background: '#050505', border: '1px solid #1a1a1a', color: 'var(--neon)', fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.4rem 0.6rem', outline: 'none', marginBottom: '0.5rem', boxSizing: 'border-box' }} />
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 260px)' }}>
          {filtered.map(c => (
            <button key={c.id} onClick={() => setActive(c)}
              style={{ width: '100%', background: active?.id === c.id ? 'rgba(0,0,0,0.3)' : 'none', border: 'none', borderLeft: `2px solid ${active?.id === c.id ? SEV_COLOR[c.severity] : 'transparent'}`, color: active?.id === c.id ? '#fff' : '#aaa', fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.5rem 0.75rem', textAlign: 'left', cursor: 'pointer' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: SEV_COLOR[c.severity], fontWeight: 700 }}>{c.name}</span>
                <span style={{ fontSize: '0.55rem', color: SEV_COLOR[c.severity] }}>{c.severity}</span>
              </div>
              <div style={{ fontSize: '0.6rem', color: '#888', marginTop: '1px' }}>{c.id} · {c.service}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detail */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {!a ? (
          <div className="empty-state">Select a CVE from the list</div>
        ) : (
          <>
            <div style={{ marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid #1a1a1a' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '1rem', fontWeight: 700, color: SEV_COLOR[a.severity] }}>{a.name}</span>
                <span style={{ fontSize: '0.65rem', color: SEV_COLOR[a.severity], border: `1px solid ${SEV_COLOR[a.severity]}44`, padding: '1px 6px' }}>{a.severity}</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: '#aaa' }}>{a.id} · {a.service}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <div className="meta-label" style={{ marginBottom: '0.25rem' }}>AFFECTED</div>
                <div style={{ fontSize: '0.7rem', color: '#ccc' }}>{a.affected}</div>
              </div>
              <div>
                <div className="meta-label" style={{ marginBottom: '0.25rem' }}>DESCRIPTION</div>
                <div style={{ fontSize: '0.7rem', color: '#ccc', lineHeight: 1.4 }}>{a.desc}</div>
              </div>
            </div>

            {a.exploit && <>
              <div className="meta-label" style={{ marginBottom: '0.4rem' }}>EXPLOIT / USAGE</div>
              <div className="cmd-block" style={{ marginBottom: '0.75rem', borderLeftColor: SEV_COLOR[a.severity] }}>
                {inject(a.exploit).split('\n').map((line, i) => (
                  <div key={i}>
                    {line.startsWith('#') ? <span style={{ color: '#666' }}>{line}</span>
                      : <><span className="cmd-prompt">$ </span>{line.split(/(\{[A-Z_]+\})/g).map((p, k) => /^\{[A-Z_]+\}$/.test(p) ? <span key={k} className="cmd-placeholder">{p}</span> : <span key={k}>{p}</span>)}</>}
                  </div>
                ))}
                <button className={`copy-btn ${copied === 'exploit' ? 'copied' : ''}`} onClick={() => copy(a.exploit, 'exploit')}>
                  {copied === 'exploit' ? '✓' : 'COPY'}
                </button>
              </div>
            </>}

            {a.manual && <>
              <div className="meta-label" style={{ marginBottom: '0.4rem' }}>MANUAL EXPLOIT</div>
              <div className="cmd-block" style={{ marginBottom: '0.75rem', borderLeftColor: '#ff6600' }}>
                {inject(a.manual).split('\n').map((line, i) => (
                  <div key={i}>
                    {line.startsWith('#') ? <span style={{ color: '#666' }}>{line}</span>
                      : <><span className="cmd-prompt">$ </span>{line.split(/(\{[A-Z_]+\})/g).map((p, k) => /^\{[A-Z_]+\}$/.test(p) ? <span key={k} className="cmd-placeholder">{p}</span> : <span key={k}>{p}</span>)}</>}
                  </div>
                ))}
                <button className={`copy-btn ${copied === 'manual' ? 'copied' : ''}`} onClick={() => copy(a.manual, 'manual')}>
                  {copied === 'manual' ? '✓' : 'COPY'}
                </button>
              </div>
            </>}

            {a.msf && <>
              <div className="meta-label" style={{ marginBottom: '0.4rem' }}>METASPLOIT MODULE</div>
              <div className="cmd-block" style={{ marginBottom: '0.75rem', borderLeftColor: '#aa44ff' }}>
                <span className="cmd-prompt">msf6 &gt; </span>use {a.msf}
                <button className={`copy-btn ${copied === 'msf' ? 'copied' : ''}`} onClick={() => copy(`use ${a.msf}\nset RHOSTS {TARGET_IP}\nrun`, 'msf')}>
                  {copied === 'msf' ? '✓' : 'COPY'}
                </button>
              </div>
            </>}

            {a.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.5rem' }}>
                {a.tags.map(t => <span key={t} className="tag" style={{ borderColor: `${SEV_COLOR[a.severity]}33`, color: SEV_COLOR[a.severity] }}>{t}</span>)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
