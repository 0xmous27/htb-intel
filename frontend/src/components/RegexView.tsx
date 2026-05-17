// @ts-nocheck
import { useState } from 'react'
import { REGEX_TOOLS } from '../data/regex'
import { useSupabaseData } from '../hooks/useSupabaseData'

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1200) }
  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>{copied ? '✓' : 'COPY'}</button>
  )
}

function CmdRow({ entry }) {
  return (
    <div className="regex-row">
      <span className="regex-desc">{entry.desc}</span>
      <div className="cmd-block regex-cmd">
        <span className="cmd-prompt">$ </span>{entry.cmd}
        <CopyBtn text={entry.cmd} />
      </div>
    </div>
  )
}

function ToolBlock({ tool, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false)
  return (
    <div className={`technique-card ${open ? 'open' : ''}`} style={{ marginBottom: '0.5rem' }}>
      <button className="card-header" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--neon)', fontSize: '0.9rem' }}>{tool.icon}</span>
          <span className="card-name">{tool.tool}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.65rem', color: '#444', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tool.desc}</span>
          <span className={`card-chevron ${open ? 'open' : ''}`}>▼</span>
        </div>
      </button>
      {open && (
        <div className="card-body">
          {tool.sections.map(section => (
            <div key={section.title} style={{ marginBottom: '1.25rem' }}>
              <div className="meta-label" style={{ marginBottom: '0.5rem', color: 'var(--neon-dim)' }}>{section.title}</div>
              {section.entries.map((entry, i) => <CmdRow key={i} entry={entry} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Supabase regex_ref entries displayed as a grouped block
function DbRegexBlock({ rows }) {
  const [open, setOpen] = useState(false)
  if (!rows.length) return null

  const grouped = rows.reduce((acc, r) => {
    const cat = r.category || 'Custom'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(r)
    return acc
  }, {})

  return (
    <div className={`technique-card ${open ? 'open' : ''}`} style={{ marginBottom: '0.5rem', borderColor: open ? 'var(--neon-dim)' : '' }}>
      <button className="card-header" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--neon)', fontSize: '0.9rem' }}>⚡</span>
          <span className="card-name">CUSTOM PATTERNS</span>
          <span style={{ fontSize: '0.6rem', color: '#555' }}>{rows.length} patterns from database</span>
        </div>
        <span className={`card-chevron ${open ? 'open' : ''}`}>▼</span>
      </button>
      {open && (
        <div className="card-body">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} style={{ marginBottom: '1.25rem' }}>
              <div className="meta-label" style={{ marginBottom: '0.5rem', color: 'var(--neon-dim)' }}>{cat}</div>
              {items.map(r => (
                <div key={r.id} className="regex-row">
                  <div>
                    <span className="regex-desc">{r.name}</span>
                    {r.description && <div style={{ fontSize: '0.58rem', color: '#555', marginTop: '2px' }}>{r.description}</div>}
                  </div>
                  <div className="cmd-block regex-cmd">
                    {r.pattern}
                    <CopyBtn text={r.pattern} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function RegexView({ search }) {
  const { data: dbRows } = useSupabaseData('regex_ref', [])

  const q = (search || '').toLowerCase()
  const filtered = REGEX_TOOLS.filter(t =>
    !q ||
    t.tool.toLowerCase().includes(q) ||
    t.desc.toLowerCase().includes(q) ||
    t.sections.some(s =>
      s.title.toLowerCase().includes(q) ||
      s.entries.some(e => e.desc.toLowerCase().includes(q) || e.cmd.toLowerCase().includes(q))
    )
  )

  const filteredDb = dbRows.filter(r =>
    !q ||
    (r.name || '').toLowerCase().includes(q) ||
    (r.pattern || '').toLowerCase().includes(q) ||
    (r.description || '').toLowerCase().includes(q) ||
    (r.category || '').toLowerCase().includes(q)
  )

  return (
    <div>
      <DbRegexBlock rows={filteredDb} />
      {filtered.map(tool => <ToolBlock key={tool.tool} tool={tool} />)}
    </div>
  )
}
