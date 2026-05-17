import { useState } from 'react'
import { useTargetCtx } from '../hooks/TargetContext'

interface Technique {
  id: string
  name: string
  command: string
  purpose?: string
  when_to_use?: string
  tags?: string[]
}

const isEvasion = (tags?: string[]) => tags?.includes('evasion')

function renderCommand(command: string, inject: (s: string) => string) {
  const filled = inject(command)
  return filled.split(/(\{[A-Z_]+\})/g).map((part, i) =>
    /^\{[A-Z_]+\}$/.test(part)
      ? <span key={i} className="cmd-placeholder">{part}</span>
      : <span key={i}>{part}</span>
  )
}

export default function TechniqueCard({ technique }: { technique: Technique }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { inject } = useTargetCtx()
  const evasion = isEvasion(technique.tags)

  const copy = () => {
    navigator.clipboard.writeText(inject(technique.command))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={`technique-card ${open ? 'open' : ''} ${evasion ? 'evasion' : ''}`}>
      <button className="card-header" onClick={() => setOpen(o => !o)}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {evasion && <span style={{ color: '#ff3333', marginRight: '0.5rem', fontSize: '0.7rem' }}>⚠</span>}
          <span className="card-name" style={evasion ? { color: '#ff9900' } : {}}>{technique.name}</span>
        </div>
        <div className="card-tags">
          {technique.tags?.slice(0, 3).map(t => (
            <span key={t} className="tag" style={t === 'evasion' ? { borderColor: '#ff3333', color: '#ff3333' } : {}}>{t}</span>
          ))}
          <span className={`card-chevron ${open ? 'open' : ''}`}>▼</span>
        </div>
      </button>

      {open && (
        <div className="card-body">
          <div className="card-meta">
            <div>
              <div className="meta-label">PURPOSE</div>
              <div className="meta-value">{technique.purpose}</div>
            </div>
            <div>
              <div className="meta-label">WHEN TO USE</div>
              <div className="meta-value">{technique.when_to_use}</div>
            </div>
          </div>
          <div className="cmd-block" style={evasion ? { borderLeftColor: '#ff9900' } : {}}>
            {technique.command.includes('\n')
              ? technique.command.split('\n').map((line, i) => (
                  <div key={i}>
                    {line.startsWith('#')
                      ? <span style={{ color: '#555' }}>{line}</span>
                      : <><span className="cmd-prompt">$ </span>{renderCommand(line, inject)}</>
                    }
                  </div>
                ))
              : <><span className="cmd-prompt">$ </span>{renderCommand(technique.command, inject)}</>
            }
            <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>
              {copied ? '✓ COPIED' : 'COPY'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
