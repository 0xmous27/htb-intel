import { useState } from 'react'
import { TOOLS } from '../data/tools'
import { useTargetCtx } from '../hooks/TargetContext'
import { useSupabaseData } from '../hooks/useSupabaseData'

interface Tool {
  id?: string
  name: string
  category?: string
  description?: string
  desc?: string
  install?: string
  usage?: string
  use?: string
}

const STATIC_FLAT: Tool[] = TOOLS.flatMap((g: any) => g.tools.map((t: any) => ({ ...t, category: g.category })))

function ToolCard({ tool }: { tool: Tool }) {
  const [copied, setCopied] = useState(false)
  const { inject } = useTargetCtx()
  const usage = tool.usage || tool.use || ''
  const filled = inject(usage)

  const copy = () => { navigator.clipboard.writeText(filled); setCopied(true); setTimeout(() => setCopied(false), 1500) }

  return (
    <div className="tool-card">
      <div className="tool-header">
        <span className="tool-name">{tool.name}</span>
        <span className="tool-desc">{tool.description || tool.desc}</span>
      </div>
      {(tool.install) && (
        <div className="tool-install">
          <span className="meta-label">INSTALL </span>
          <span style={{ color: '#555', fontSize: '0.7rem' }}>{tool.install}</span>
        </div>
      )}
      {filled && (
        <div className="cmd-block" style={{ marginTop: '0.5rem' }}>
          {filled.split('\n').map((line, i) => (
            <div key={i}>
              {line.startsWith('#')
                ? <span style={{ color: '#444' }}>{line}</span>
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
          <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
            {copied ? '✓' : 'COPY'}
          </button>
        </div>
      )}
    </div>
  )
}

export default function ToolsView({ search }: { search: string }) {
  const { data: dbTools } = useSupabaseData<Tool>('tools', STATIC_FLAT)

  const grouped: Record<string, Tool[]> = {}
  for (const t of dbTools) {
    const cat = t.category || 'Misc'
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(t)
  }

  const q = (search || '').toLowerCase()
  const entries = Object.entries(grouped).map(([cat, tools]) => ({
    category: cat,
    tools: tools.filter(t => !q || t.name.toLowerCase().includes(q) || (t.description || t.desc || '').toLowerCase().includes(q) || cat.toLowerCase().includes(q))
  })).filter(g => g.tools.length > 0)

  return (
    <div>
      {entries.map(group => (
        <div key={group.category} style={{ marginBottom: '2rem' }}>
          <div className="tools-group-header">{group.category}</div>
          <div className="tools-grid">
            {group.tools.map(tool => <ToolCard key={tool.id || tool.name} tool={tool} />)}
          </div>
        </div>
      ))}
    </div>
  )
}
