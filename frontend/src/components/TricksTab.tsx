import { useState } from 'react'
import { TRICKS } from '../data/tricksData'
import { useSupabaseData } from '../hooks/useSupabaseData'

const neon = 'var(--neon)'

interface Trick {
  id: string
  category: string
  title: string
  source?: string
  description?: string
  desc?: string
  cmd?: string
  tags?: string[] | string
}

const SRC_COLOR: Record<string, string> = {
  HackTricks: '#ff6600',
  'coffinxp / LostSec': neon,
  community: '#00ccff',
  'tomnomnom / community': '#cc88ff',
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return (
    <button onClick={copy} style={{
      background: 'none', border: '1px solid #1a1a1a', color: copied ? neon : '#555',
      fontSize: '0.55rem', padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit',
    }}>{copied ? '✓ COPIED' : 'COPY'}</button>
  )
}

function TrickCard({ trick }: { trick: Trick }) {
  const [open, setOpen] = useState(false)
  const srcColor = SRC_COLOR[trick.source || ''] || '#888'
  const desc = trick.description || trick.desc || ''
  const cmd  = trick.cmd || ''
  const tags: string[] = Array.isArray(trick.tags) ? trick.tags : (trick.tags ? trick.tags.split(',').map(t => t.trim()) : [])

  return (
    <div style={{ border: '1px solid #111', marginBottom: '0.4rem', background: '#050505' }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', cursor: 'pointer' }}>
        <span style={{ color: neon, fontSize: '0.6rem', flexShrink: 0 }}>{open ? '▼' : '▶'}</span>
        <span style={{ flex: 1, fontSize: '0.7rem', color: '#ccc' }}>{trick.title}</span>
        <span style={{ fontSize: '0.55rem', color: srcColor, flexShrink: 0, border: `1px solid ${srcColor}33`, padding: '1px 6px' }}>{trick.source}</span>
      </div>
      {open && (
        <div style={{ padding: '0 0.75rem 0.75rem', borderTop: '1px solid #0a0a0a' }}>
          {desc && <p style={{ fontSize: '0.65rem', color: '#888', margin: '0.5rem 0 0.6rem' }}>{desc}</p>}
          {cmd && (
            <div style={{ position: 'relative' }}>
              <pre style={{ background: '#030303', border: '1px solid #111', padding: '0.6rem', fontSize: '0.62rem', color: neon, overflowX: 'auto', margin: 0, fontFamily: 'inherit', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{cmd}</pre>
              <div style={{ position: 'absolute', top: '0.3rem', right: '0.3rem' }}><CopyBtn text={cmd} /></div>
            </div>
          )}
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

export default function TricksTab() {
  const [cat, setCat] = useState('ALL')
  const [search, setSearch] = useState('')

  const { data: tricks } = useSupabaseData<Trick>('tricks', TRICKS as Trick[])
  const categories = [...new Set(tricks.map(t => t.category))].sort()

  const filtered = tricks.filter(t => {
    const matchCat = cat === 'ALL' || t.category === cat
    const q = search.toLowerCase()
    const desc = t.description || t.desc || ''
    const matchSearch = !q || t.title.toLowerCase().includes(q) || desc.toLowerCase().includes(q) ||
      (Array.isArray(t.tags) ? t.tags : []).some((tag: string) => tag.includes(q))
    return matchCat && matchSearch
  })

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ fontSize: '0.6rem', color: '#555', marginBottom: '0.5rem' }}>
          Tricks from HackTricks, coffinxp, LostSec, tomnomnom & community.
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search tricks..."
          style={{ width: '100%', background: '#030303', border: '1px solid #1a1a1a', color: neon, fontFamily: 'inherit', fontSize: '0.68rem', padding: '0.4rem 0.6rem', outline: 'none', marginBottom: '0.5rem' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {['ALL', ...categories].map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              background: cat === c ? '#0a0a0a' : 'none',
              border: `1px solid ${cat === c ? neon : '#1a1a1a'}`,
              color: cat === c ? neon : '#555',
              fontSize: '0.55rem', padding: '2px 8px', cursor: 'pointer', fontFamily: 'inherit',
            }}>{c}</button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '0.55rem', color: '#444', marginBottom: '0.75rem' }}>{filtered.length} tricks</div>

      {filtered.map(t => <TrickCard key={t.id} trick={t} />)}
      {!filtered.length && <div style={{ fontSize: '0.65rem', color: '#555' }}>no tricks found</div>}
    </div>
  )
}
