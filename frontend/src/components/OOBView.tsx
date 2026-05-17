import { useState } from 'react'
import { OOB_TECHNIQUES } from '../data/oob'
import { useTargetCtx } from '../hooks/TargetContext'
import { useSupabaseData } from '../hooks/useSupabaseData'

interface OOBItem {
  id?: string
  category?: string
  title?: string
  name?: string
  description?: string
  when_to_use?: string
  setup?: string
  payload?: string
  cmd?: string
  note?: string
  tags?: string[]
  _group_desc?: string
}

const STATIC_FLAT: OOBItem[] = (OOB_TECHNIQUES as any[]).flatMap(g =>
  g.techniques.map((t: any) => ({
    id: t.name,
    category: g.category,
    title: t.name,
    description: t.desc,
    when_to_use: g.when,
    setup: g.setup || '',
    payload: t.cmd,
    note: t.note || '',
    tags: [],
    _group_desc: g.desc,
  }))
)

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200) }
  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>{copied ? '✓' : 'COPY'}</button>
  )
}

function OOBCard({ item }: { item: OOBItem }) {
  const { inject } = useTargetCtx()
  const cmd = item.payload || item.cmd || ''
  const filled = inject(cmd)

  return (
    <div style={{ marginBottom: '0.75rem', border: '1px solid #1a0a00', background: 'rgba(13,5,0,0.8)', padding: '0.75rem 1rem' }}>
      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ff9900', marginBottom: '0.3rem' }}>{item.title || item.name}</div>
      {item.description && <p style={{ fontSize: '0.68rem', color: '#ccc', marginBottom: '0.5rem' }}>{item.description}</p>}
      {item.when_to_use && (
        <div style={{ fontSize: '0.62rem', color: '#888', marginBottom: '0.4rem' }}>
          <span style={{ color: '#555' }}>WHEN: </span>{item.when_to_use}
        </div>
      )}
      {item.setup && (
        <div style={{ fontSize: '0.62rem', color: 'var(--neon)', marginBottom: '0.4rem' }}>
          <span style={{ color: '#555' }}>SETUP: </span>{item.setup}
        </div>
      )}
      {filled && (
        <div className="cmd-block" style={{ borderLeftColor: '#ff6600', fontSize: '0.72rem' }}>
          {filled.split('\n').map((line, i) => (
            <div key={i}>
              {line.startsWith('#')
                ? <span style={{ color: '#666' }}>{line}</span>
                : <><span className="cmd-prompt">$ </span>
                    {line.split(/(\{[A-Z_]+\})/g).map((p, j) =>
                      /^\{[A-Z_]+\}$/.test(p)
                        ? <span key={j} className="cmd-placeholder">{p}</span>
                        : <span key={j}>{p}</span>
                    )}
                  </>
              }
            </div>
          ))}
          <CopyBtn text={filled} />
        </div>
      )}
      {item.note && (
        <div style={{ marginTop: '0.4rem', fontSize: '0.65rem', color: '#ccc', borderLeft: '2px solid #ffcc0055', paddingLeft: '0.5rem' }}>
          💡 {item.note}
        </div>
      )}
    </div>
  )
}

function OOBGroup({ category, items }: { category: string; items: OOBItem[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`technique-card ${open ? 'open' : ''}`} style={{ marginBottom: '0.5rem', borderColor: open ? 'rgba(255,102,0,0.3)' : '' }}>
      <button className="card-header" onClick={() => setOpen(o => !o)}>
        <div>
          <span className="card-name" style={{ color: '#ff9900' }}>{category}</span>
          <span style={{ fontSize: '0.6rem', color: '#aaa', marginLeft: '0.75rem' }}>{items.length} techniques</span>
        </div>
        <span className={`card-chevron ${open ? 'open' : ''}`} style={{ color: open ? '#ff9900' : '' }}>▼</span>
      </button>
      {open && (
        <div className="card-body">
          {items.map(item => <OOBCard key={item.id || item.title} item={item} />)}
        </div>
      )}
    </div>
  )
}

export default function OOBView({ search }: { search: string }) {
  const { data: rows } = useSupabaseData<OOBItem>('oob_payloads', STATIC_FLAT)

  const q = (search || '').toLowerCase()
  const filtered = rows.filter(r =>
    !q ||
    (r.category || '').toLowerCase().includes(q) ||
    (r.title || '').toLowerCase().includes(q) ||
    (r.description || '').toLowerCase().includes(q) ||
    (r.payload || '').toLowerCase().includes(q)
  )

  const grouped: Record<string, OOBItem[]> = {}
  for (const r of filtered) {
    const cat = r.category || 'OOB'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(r)
  }

  return (
    <div>
      <div style={{ background: '#0a0500', border: '1px solid #2a1000', borderLeft: '3px solid #ff6600', padding: '0.75rem 1rem', marginBottom: '1.5rem', fontSize: '0.72rem', color: '#ccc' }}>
        <span style={{ color: '#ff9900' }}>⚠ OUT-OF-BAND TECHNIQUES</span>
        {'  '}Used when the vulnerability is blind — no output in the response. Data is exfiltrated via DNS queries or HTTP callbacks to a server you control.
        {'  '}<span style={{ color: '#aaa' }}>Set up interactsh or Burp Collaborator before testing.</span>
      </div>
      {Object.entries(grouped).map(([cat, items]) => (
        <OOBGroup key={cat} category={cat} items={items as OOBItem[]} />
      ))}
    </div>
  )
}
