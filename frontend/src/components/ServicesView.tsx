import { useState } from 'react'
import { SERVICES } from '../data/services'
import { useSupabaseData } from '../hooks/useSupabaseData'

interface Service {
  id?: string
  name: string
  port?: string
  protocol?: string
  description?: string
  enum_cmd?: string
  attacks?: string | string[]
  cves_list?: string
  notes?: string
  tags?: string[]
  category?: string
  _group?: string
  // static shape fields
  desc?: string
  proto?: string
  cves?: string[]
  tools?: string[]
}

const STATIC_FLAT: Service[] = (SERVICES as any[]).flatMap(g => g.services.map((s: any) => ({ ...s, _group: g.category })))

function normSvc(s: Service): any {
  if (s.enum_cmd !== undefined || (typeof s.attacks === 'string')) {
    const attacks = typeof s.attacks === 'string' ? s.attacks.split('\n').filter(Boolean) : (s.attacks || [])
    const cves    = s.cves_list ? s.cves_list.split('\n').filter(Boolean) : []
    const tools   = Array.isArray(s.tags) ? s.tags : []
    return { ...s, desc: s.description || '', attacks, cves, tools, proto: s.protocol || '', notes: s.notes || '' }
  }
  return s
}

function ServiceCard({ svc }: { svc: Service }) {
  const [open, setOpen] = useState(false)
  const s = normSvc(svc)

  return (
    <div className={`technique-card ${open ? 'open' : ''}`} style={{ marginBottom: '0.4rem' }}>
      <button className="card-header" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span className="card-name">{s.name}</span>
          {s.port && <span style={{ fontSize: '0.65rem', color: 'var(--neon)', opacity: 0.7, fontFamily: 'inherit' }}>:{s.port}</span>}
          {s.proto && <span style={{ fontSize: '0.6rem', color: '#aaa' }}>{s.proto}</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#aaa', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.desc}</span>
          <span className={`card-chevron ${open ? 'open' : ''}`}>▼</span>
        </div>
      </button>

      {open && (
        <div className="card-body">
          {s.desc && <p style={{ fontSize: '0.72rem', color: '#ccc', marginBottom: '1rem', lineHeight: 1.5 }}>{s.desc}</p>}

          {s.enum_cmd && (
            <div style={{ marginBottom: '1rem' }}>
              <div className="meta-label" style={{ marginBottom: '0.4rem' }}>🔍 ENUM COMMAND</div>
              <pre style={{ background: '#030303', border: '1px solid #111', padding: '0.5rem', fontSize: '0.65rem', color: 'var(--neon)', margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap' }}>{s.enum_cmd}</pre>
            </div>
          )}

          <div className="services-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {s.attacks?.length > 0 && (
              <div>
                <div className="meta-label" style={{ marginBottom: '0.4rem' }}>⚔ ATTACK VECTORS</div>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {s.attacks.map((a: string, i: number) => (
                    <li key={i} style={{ fontSize: '0.7rem', color: '#ccc', padding: '2px 0', borderLeft: '2px solid #ff333355', paddingLeft: '0.5rem', marginBottom: '3px' }}>{a}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              {s.cves?.length > 0 && (
                <>
                  <div className="meta-label" style={{ marginBottom: '0.4rem' }}>🔴 NOTABLE CVEs</div>
                  <ul style={{ listStyle: 'none', padding: 0, marginBottom: '0.75rem' }}>
                    {s.cves.map((c: string, i: number) => <li key={i} style={{ fontSize: '0.68rem', color: '#ff6666', padding: '2px 0' }}>{c}</li>)}
                  </ul>
                </>
              )}
              {s.tools?.length > 0 && (
                <>
                  <div className="meta-label" style={{ marginBottom: '0.4rem' }}>🔧 TOOLS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {s.tools.map((t: string) => <span key={t} className="tag" style={{ borderColor: 'var(--neon-dim)', color: 'var(--neon)' }}>{t}</span>)}
                  </div>
                </>
              )}
            </div>
          </div>

          {s.notes && (
            <div style={{ background: '#0a0a00', border: '1px solid #2a2a00', borderLeft: '2px solid #ffcc00', padding: '0.6rem 0.75rem' }}>
              <span style={{ fontSize: '0.6rem', color: '#aaa', letterSpacing: '0.1em' }}>💡 NOTE  </span>
              <span style={{ fontSize: '0.7rem', color: '#ddd' }}>{s.notes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ServicesView({ search }: { search: string }) {
  const { data: dbServices } = useSupabaseData<Service>('services', STATIC_FLAT)

  const q = (search || '').toLowerCase()

  const grouped: Record<string, Service[]> = {}
  for (const s of dbServices) {
    const cat = s._group || s.category || 'Services'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(s)
  }

  const entries = Object.entries(grouped).map(([cat, services]) => ({
    category: cat,
    services: services.filter(s => {
      if (!q) return true
      const n = normSvc(s)
      return n.name.toLowerCase().includes(q) || n.desc.toLowerCase().includes(q) ||
        (n.attacks || []).some((a: string) => a.toLowerCase().includes(q)) ||
        (n.tools || []).some((t: string) => t.toLowerCase().includes(q)) ||
        cat.toLowerCase().includes(q)
    })
  })).filter(g => g.services.length > 0)

  return (
    <div>
      {entries.map(group => (
        <div key={group.category} style={{ marginBottom: '2rem' }}>
          <div className="tools-group-header">{group.category}</div>
          {group.services.map(svc => <ServiceCard key={svc.id || svc.name} svc={svc} />)}
        </div>
      ))}
    </div>
  )
}
