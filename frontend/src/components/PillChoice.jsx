import { useState, useRef } from 'react'

const PILLS = [
  {
    id: 'blue',
    label: 'BLUE PILL',
    color: '#0088ff',
    glow: '#0088ff',
    dim: '#003388',
    desc: 'Stay in the illusion. Ignorance is bliss.',
  },
  {
    id: 'red',
    label: 'RED PILL',
    color: '#ff3300',
    glow: '#ff3300',
    dim: '#880000',
    desc: 'See how deep the rabbit hole goes.',
  },
  {
    id: 'green',
    label: 'GREEN PILL',
    color: '#00ff99',
    glow: '#00ff99',
    dim: '#00aa66',
    desc: 'You were always in the Matrix.',
  },
]

export default function PillChoice({ onChoose }) {
  const [hovered, setHovered] = useState(null)
  const [chosen, setChosen] = useState(null)   // pill id after click
  const [step, setStep] = useState('pill')      // 'pill' | 'name'
  const [nameInput, setNameInput] = useState('')
  const [fading, setFading] = useState(false)
  const nameRef = useRef(null)

  const pill = chosen ? PILLS.find(p => p.id === chosen) : null
  const active = hovered ? PILLS.find(p => p.id === hovered) : pill

  const pickPill = (p) => {
    setChosen(p.id)
    setTimeout(() => { setStep('name'); setTimeout(() => nameRef.current?.focus(), 50) }, 600)
  }

  const submitName = (e) => {
    e.preventDefault()
    const name = nameInput.trim() || 'ANON'
    setFading(true)
    setTimeout(() => onChoose(pill, name), 800)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
      zIndex: 9999,
      opacity: fading ? 0 : 1,
      transition: 'opacity 0.8s ease',
    }}>
      {/* scanlines */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px)' }} />

      <div style={{ fontSize: '0.6rem', color: '#888', letterSpacing: '0.3em', marginBottom: '0.5rem' }}>MORPHEUS PRESENTS</div>

      <div style={{
        fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: 700, letterSpacing: '0.2em',
        color: active ? active.color : '#aaa',
        textShadow: active ? `0 0 20px ${active.glow}, 0 0 40px ${active.glow}66` : 'none',
        transition: 'all 0.3s', marginBottom: '0.5rem',
      }}>
        {step === 'pill' ? 'CHOOSE YOUR REALITY' : 'IDENTIFY YOURSELF'}
      </div>

      <div style={{ fontSize: '0.62rem', color: active ? '#ddd' : '#777', letterSpacing: '0.15em', marginBottom: '3rem', transition: 'color 0.3s', minHeight: '1rem' }}>
        {step === 'pill'
          ? (active ? active.desc : 'THIS IS YOUR LAST CHANCE_')
          : `${pill?.label} CHOSEN — ENTER YOUR CALLSIGN`}
      </div>

      {/* ── STEP 1: Pill selection ── */}
      {step === 'pill' && (
        <div className="pill-choice-pills" style={{ display: 'flex', gap: 'clamp(1.5rem, 5vw, 3.5rem)', alignItems: 'center' }}>
          {PILLS.map(p => (
            <button key={p.id}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => pickPill(p)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem',
                transform: chosen === p.id ? 'scale(1.3)' : hovered === p.id ? 'scale(1.12)' : 'scale(1)',
                transition: 'transform 0.25s ease',
              }}>
              <div style={{
                width: 'clamp(52px,10vw,72px)', height: 'clamp(26px,5vw,36px)',
                borderRadius: 999,
                background: chosen === p.id || hovered === p.id
                  ? `radial-gradient(ellipse at 35% 35%, ${p.color}cc, ${p.dim})`
                  : `radial-gradient(ellipse at 35% 35%, ${p.dim}88, #111)`,
                border: `2px solid ${p.color}`,
                boxShadow: chosen === p.id
                  ? `0 0 30px ${p.glow}, 0 0 60px ${p.glow}88, 0 0 100px ${p.glow}44`
                  : hovered === p.id
                  ? `0 0 18px ${p.glow}, 0 0 36px ${p.glow}66`
                  : `0 0 6px ${p.dim}44`,
                transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: '15%', left: '15%', width: '35%', height: '30%',
                  background: 'rgba(255,255,255,0.18)', borderRadius: 999, filter: 'blur(2px)' }} />
              </div>
              <span style={{
                fontSize: '0.62rem', letterSpacing: '0.18em',
                color: hovered === p.id || chosen === p.id ? p.color : '#aaa',
                textShadow: hovered === p.id ? `0 0 10px ${p.glow}` : 'none',
                transition: 'all 0.25s',
              }}>{p.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── STEP 2: Name input ── */}
      {step === 'name' && pill && (
        <form onSubmit={submitName} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          {/* Show chosen pill */}
          <div style={{
            width: '80px', height: '40px', borderRadius: 999,
            background: `radial-gradient(ellipse at 35% 35%, ${pill.color}cc, ${pill.dim})`,
            border: `2px solid ${pill.color}`,
            boxShadow: `0 0 30px ${pill.glow}, 0 0 60px ${pill.glow}66`,
            position: 'relative', overflow: 'hidden', marginBottom: '0.5rem',
          }}>
            <div style={{ position: 'absolute', top: '15%', left: '15%', width: '35%', height: '30%',
              background: 'rgba(255,255,255,0.18)', borderRadius: 999, filter: 'blur(2px)' }} />
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              ref={nameRef}
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="enter callsign..."
              maxLength={24}
              style={{
                background: '#030303',
                border: `1px solid ${pill.color}44`,
                borderBottom: `2px solid ${pill.color}`,
                color: pill.color,
                fontFamily: 'inherit', fontSize: '0.9rem',
                padding: '0.4rem 0.75rem', outline: 'none',
                letterSpacing: '0.15em', width: '220px',
                textShadow: `0 0 8px ${pill.glow}66`,
                caretColor: pill.color,
              }}
            />
            <button type="submit" style={{
              background: 'none',
              border: `1px solid ${pill.color}66`,
              color: pill.color,
              fontFamily: 'inherit', fontSize: '0.7rem',
              padding: '0.4rem 0.9rem', cursor: 'pointer',
              letterSpacing: '0.12em',
              boxShadow: `0 0 10px ${pill.glow}22`,
              transition: 'all 0.2s',
            }}>ENTER</button>
          </div>

          <div style={{ fontSize: '0.52rem', color: '#444', letterSpacing: '0.15em' }}>
            PRESS ENTER OR LEAVE BLANK FOR ANON
          </div>
        </form>
      )}

      {step === 'pill' && (
        <div style={{ marginTop: '3.5rem', fontSize: '0.5rem', color: '#555', letterSpacing: '0.2em' }}>
          AFTER THIS, THERE IS NO TURNING BACK
        </div>
      )}
    </div>
  )
}
