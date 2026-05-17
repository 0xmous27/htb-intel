// @ts-nocheck
import { useState } from 'react'
import { BB_REPORTS, BB_CATEGORIES } from '../data/bugbountyData'
import { useSupabaseData } from '../hooks/useSupabaseData'

const neon = 'var(--neon)'

const SEV_COLOR = {
  CRITICAL: '#ff3333',
  HIGH:     '#ff9900',
  MEDIUM:   '#ffcc00',
  LOW:      'var(--neon)',
  INFO:     '#888',
}

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <button onClick={copy} style={{
      background: 'none', border: '1px solid #1a1a1a', color: copied ? neon : '#555',
      fontSize: '0.55rem', padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit',
    }}>{copied ? '✓ COPIED' : 'COPY'}</button>
  )
}

function ReportCard({ r }) {
  const [open, setOpen] = useState(false)
  const sc = SEV_COLOR[r.severity] || '#888'
  // support both static shape (r.desc) and supabase shape (r.description)
  const desc = r.description || r.desc || ''
  const steps = r.steps || ''
  const payload = r.payload || ''
  const tags = Array.isArray(r.tags) ? r.tags : (r.tags ? r.tags.split(',').map(t => t.trim()) : [])

  return (
    <div style={{ border: '1px solid #111', marginBottom: '0.4rem', background: '#050505' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
        <span style={{ color: neon, fontSize: '0.6rem', flexShrink: 0 }}>{open ? '▼' : '▶'}</span>
        <span style={{ flex: 1, fontSize: '0.7rem', color: '#ccc' }}>{r.title}</span>
        <span style={{ fontSize: '0.55rem', color: sc, border: `1px solid ${sc}33`, padding: '1px 6px', flexShrink: 0 }}>{r.severity}</span>
        {r.bounty && <span style={{ fontSize: '0.55rem', color: '#00cc66', flexShrink: 0 }}>{r.bounty}</span>}
      </div>
      {open && (
        <div style={{ padding: '0 0.75rem 0.75rem', borderTop: '1px solid #0a0a0a' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', marginTop: '0.5rem' }}>
            {r.platform && <span style={{ fontSize: '0.6rem', color: '#555' }}>📋 {r.platform}</span>}
            {r.program  && <span style={{ fontSize: '0.6rem', color: '#555' }}>🏢 {r.program}</span>}
          </div>
          {desc && <p style={{ fontSize: '0.65rem', color: '#888', margin: '0 0 0.6rem' }}>{desc}</p>}

          {steps && <>
            <div style={{ fontSize: '0.6rem', color: '#555', marginBottom: '0.25rem' }}>STEPS</div>
            <pre style={{ background: '#030303', border: '1px solid #111', padding: '0.5rem', fontSize: '0.62rem', color: '#aaa', margin: '0 0 0.6rem', fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{steps}</pre>
          </>}

          {payload && <>
            <div style={{ fontSize: '0.6rem', color: '#555', marginBottom: '0.25rem' }}>PAYLOAD / PROOF</div>
            <div style={{ position: 'relative' }}>
              <pre style={{ background: '#030303', border: `1px solid ${sc}22`, padding: '0.6rem', fontSize: '0.62rem', color: neon, margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{payload}</pre>
              <div style={{ position: 'absolute', top: '0.3rem', right: '0.3rem' }}><CopyBtn text={payload} /></div>
            </div>
          </>}

          {tags.length > 0 && (
            <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
              {tags.map(t => <span key={t} style={{ fontSize: '0.5rem', color: '#555', border: '1px solid #1a1a1a', padding: '1px 5px' }}>{t}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function BugBountyTab() {
  const [cat, setCat] = useState('ALL')
  const [search, setSearch] = useState('')
  const [sev, setSev] = useState('ALL')

  const { data: reports } = useSupabaseData('bb_reports', BB_REPORTS)

  // derive categories from live data
  const categories = [...new Set(reports.map(r => r.category))].sort()

  const filtered = reports.filter(r => {
    const matchCat = cat === 'ALL' || r.category === cat
    const matchSev = sev === 'ALL' || r.severity === sev
    const q = search.toLowerCase()
    const desc = r.description || r.desc || ''
    const matchSearch = !q || r.title.toLowerCase().includes(q) || desc.toLowerCase().includes(q) ||
      (Array.isArray(r.tags) ? r.tags : []).some(t => t.includes(q)) ||
      (r.program || '').toLowerCase().includes(q)
    return matchCat && matchSev && matchSearch
  })

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1.25rem', padding: '0.75rem', background: '#050505', border: '1px solid #1a1a1a', fontSize: '0.6rem', color: '#888', lineHeight: 1.9 }}>
        <div style={{ color: 'var(--neon)', fontSize: '0.7rem', marginBottom: '0.4rem', fontWeight: 700 }}>🎯 BUG BOUNTY METHODOLOGY</div>
        <div><b style={{color:'#ccc'}}>1. Scope</b> → Read program policy. Note in-scope domains, excluded areas, reward table.</div>
        <div><b style={{color:'#ccc'}}>2. Recon</b> → Subdomain enum (subfinder, amass) → port scan → tech fingerprint → JS analysis → param discovery</div>
        <div><b style={{color:'#ccc'}}>3. Map</b> → Crawl all endpoints. Note auth flows, file uploads, API calls, user inputs, role differences.</div>
        <div><b style={{color:'#ccc'}}>4. Test</b> → IDOR on every ID → XSS on every input → SSRF on every URL param → SQLi on every filter → Auth bypass on every role check</div>
        <div><b style={{color:'#ccc'}}>5. Chain</b> → Low-impact bugs become critical when chained. Self-XSS + CSRF = stored XSS. Info leak + IDOR = account takeover.</div>
        <div><b style={{color:'#ccc'}}>6. Report</b> → Clear title, impact statement, step-by-step repro, PoC screenshots/video, suggested fix.</div>
      </div>
      <div style={{ fontSize: '0.6rem', color: '#555', marginBottom: '0.75rem' }}>
        {filtered.length} reports from public HackerOne & Bugcrowd disclosures. Use for learning and CTF/pentest reference.
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search by title, program, tag..."
        style={{ width: '100%', background: '#030303', border: '1px solid #1a1a1a', color: neon, fontFamily: 'inherit', fontSize: '0.68rem', padding: '0.4rem 0.6rem', outline: 'none', marginBottom: '0.5rem' }} />

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.4rem' }}>
        {['ALL', ...categories].map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            background: cat === c ? '#0a0a0a' : 'none', border: `1px solid ${cat === c ? neon : '#1a1a1a'}`,
            color: cat === c ? neon : '#555', fontSize: '0.55rem', padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit',
          }}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginBottom: '0.75rem' }}>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(s => (
          <button key={s} onClick={() => setSev(s)} style={{
            background: sev === s ? '#0a0a0a' : 'none',
            border: `1px solid ${sev === s ? (SEV_COLOR[s] || neon) : '#1a1a1a'}`,
            color: sev === s ? (SEV_COLOR[s] || neon) : '#555',
            fontSize: '0.55rem', padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit',
          }}>{s}</button>
        ))}
      </div>

      <div style={{ fontSize: '0.55rem', color: '#444', marginBottom: '0.75rem' }}>{filtered.length} reports</div>

      {filtered.map(r => <ReportCard key={r.id} r={r} />)}
      {!filtered.length && <div style={{ fontSize: '0.65rem', color: '#555' }}>no reports found</div>}
    </div>
  )
}
