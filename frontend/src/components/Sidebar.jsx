import { useState, useEffect, useRef } from 'react'
import { useNeon } from '../hooks/ThemeContext'

const randF = (a, b) => Math.random() * (b - a) + a

function BlinkingEyes() {
  const canvasRef = useRef(null)
  const lookRef = useRef({ x: 0, y: 0 }) // normalized -1..1

  useEffect(() => {
    const canvas = canvasRef.current

    // Mouse tracking
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx, dy = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      lookRef.current = { x: dx / dist, y: dy / dist }
    }

    // Device orientation (mobile) — tilt to look
    const onTilt = (e) => {
      const x = Math.max(-1, Math.min(1, (e.gamma || 0) / 30))
      const y = Math.max(-1, Math.min(1, (e.beta  || 0) / 30))
      lookRef.current = { x, y }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('deviceorientation', onTilt)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('deviceorientation', onTilt)
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = 200
    canvas.height = 110
    let blinkT = 0
    let nextBlink = randF(2, 5)

    const drawEye = (cx, cy, rx, ry, lidFrac, lx, ly) => {
      const side = cx < 100 ? -1 : 1

      const scleraPath = () => {
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2)
      }

      // pure white sclera
      ctx.save()
      scleraPath()
      ctx.fillStyle = '#ffffff'
      ctx.fill()
      scleraPath()
      ctx.clip()

      // iris + pupil
      const ix = cx + lx * rx * 0.28
      const iy = cy + ry * 0.1 + ly * ry * 0.22
      const irisR = ry * 0.62
      ctx.beginPath()
      ctx.arc(ix, iy, irisR, 0, Math.PI * 2)
      ctx.fillStyle = '#000'
      ctx.fill()

      // glint
      ctx.beginPath()
      ctx.arc(ix - irisR * 0.28, iy - irisR * 0.3, irisR * 0.17, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fill()

      // blink — shadow only when closing
      if (lidFrac > 0) {
        ctx.fillStyle = '#000'
        ctx.fillRect(cx - rx, cy - ry, rx * 2, ry * 2 * lidFrac)
      }

      ctx.restore()

      // outline
      scleraPath()
      ctx.strokeStyle = '#222'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    const draw = () => {
      blinkT += 0.04
      let lidFrac = 0
      if (blinkT >= nextBlink) {
        const phase = blinkT - nextBlink
        if (phase < 0.15)      lidFrac = phase / 0.15
        else if (phase < 0.25) lidFrac = 1
        else if (phase < 0.45) lidFrac = 1 - (phase - 0.25) / 0.2
        else { blinkT = 0; nextBlink = randF(2, 5) }
      }

      ctx.fillStyle = '#020202'
      ctx.fillRect(0, 0, 200, 110)

      const { x, y } = lookRef.current
      drawEye(62,  56, 36, 30, lidFrac, x, y)
      drawEye(138, 56, 36, 30, lidFrac, x, y)
    }

    const id = setInterval(draw, 40)
    return () => clearInterval(id)
  }, [])

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: 110 }} />
}

const ICONS = {
  'Recon': '◈', 'Enumeration': '◉', 'Web Attacks': '◎',
  'Password Attacks': '◆', 'RDP Attacks': '▣', 'SSH Attacks': '▤',
  'SMB Attacks': '▦', 'Privilege Escalation': '▲', 'Pivoting': '◀▶',
  'File Transfer': '◫', 'Shells & Payloads': '☠', 'Active Directory': '⬡',
  'Evasion Techniques': '⚠', 'Miscellaneous': '◌',
}

const SKULL = null // replaced with animated logo

const STATUS_MSGS = [
  '> SYSTEM ONLINE_',
  '> SCANNING NETWORK_',
  '> ENUMERATING HOSTS_',
  '> AWAITING TARGET_',
]

export default function Sidebar({ categories, active, onSelect, search, onSearch }) {
  const neon = useNeon()
  const [statusIdx, setStatusIdx] = useState(0)
  const [open, setOpen] = useState(false)
  const [sweepIdx, setSweepIdx] = useState(-1)  // which nav item is lit

  useEffect(() => {
    const t = setInterval(() => setStatusIdx(i => (i + 1) % STATUS_MSGS.length), 3000)
    return () => clearInterval(t)
  }, [])

  // Piano sweep: every 5s, light up items 0..N in sequence, 80ms apart
  useEffect(() => {
    const total = categories.length + 1 // +1 for ALL TECHNIQUES
    const runSweep = () => {
      let i = 0
      const step = setInterval(() => {
        setSweepIdx(i)
        i++
        if (i >= total) {
          clearInterval(step)
          setTimeout(() => setSweepIdx(-1), 300)
        }
      }, 80)
    }
    const id = setInterval(runSweep, 5000)
    return () => clearInterval(id)
  }, [categories.length])
  const close = () => setOpen(false)

  return (
    <>
      <button className="sidebar-toggle" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
        {open ? '✕' : '☰'}
      </button>
      {open && <div className="sidebar-overlay" onClick={close} />}
    <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
      <div className="sidebar-logo">
        <div className="logo-text glitch">HTB INTEL</div>
        <div style={{ margin: '0.4rem 0 0.25rem', border: '1px solid #1a0000', background: '#020202', overflow: 'hidden' }}>
          <BlinkingEyes />
        </div>
        <div className="logo-sub">COMMAND INTELLIGENCE v1.0</div>
        <div style={{ fontSize: '0.55rem', color: neon, opacity: 0.25, marginTop: '0.4rem', letterSpacing: '0.05em', minHeight: '0.8rem' }}>
          {STATUS_MSGS[statusIdx]}
        </div>
      </div>

      <div className="sidebar-search">
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="> search..."
        />
      </div>

      <nav className="sidebar-nav">
        {(() => {
          const neon = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#00ff99'
          return (
            <>
              <button
                onClick={() => { onSelect(null); close() }}
                className={`nav-item ${!active ? 'active' : ''}`}
                style={sweepIdx === 0 ? { color: neon, borderLeftColor: neon, background: `linear-gradient(to right, ${neon}30, transparent)`, textShadow: `0 0 12px ${neon}, 0 0 24px ${neon}66`, boxShadow: `inset 0 0 12px ${neon}18` } : {}}
              >
                <span>⚡ ALL TECHNIQUES</span>
                <span className="nav-count">{categories.reduce((s, c) => s + c.count, 0)}</span>
              </button>

              {categories.map(({ category, count }, i) => {
                const lit = sweepIdx === i + 1
                const isEvasion = category === 'Evasion Techniques'
                const c = isEvasion ? '#ffaa00' : neon
                return (
                  <button
                    key={category}
                    onClick={() => { onSelect(category); close() }}
                    className={`nav-item ${active === category ? 'active' : ''}`}
                    style={lit ? {
                      color: c, borderLeftColor: c,
                      background: `linear-gradient(to right, ${c}30, transparent)`,
                      textShadow: `0 0 12px ${c}, 0 0 24px ${c}66`,
                      boxShadow: `inset 0 0 12px ${c}18`,
                    } : isEvasion ? {
                      color: active === category ? '#ff9900' : '#331500',
                      borderLeftColor: active === category ? '#ff9900' : 'transparent',
                    } : {}}
                  >
                    <span>{ICONS[category] || '◌'} {category.toUpperCase()}</span>
                    <span className="nav-count">{count}</span>
                  </button>
                )
              })}
            </>
          )
        })()}
      </nav>

      {/* Bottom status */}
      <div style={{ padding: '0.75rem', borderTop: '1px solid #0d0d0d', fontSize: '0.55rem', color: '#555', lineHeight: 1.8 }}>
        <div style={{ color: neon, opacity: 0.3 }}>● CONNECTED</div>
        <div>BY <span style={{ color: neon, opacity: 0.4 }}>0xmous7</span></div>
      </div>
    </aside>
    </>
  )
}
