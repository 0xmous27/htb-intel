// @ts-nocheck
import { useState, useEffect, useRef, useCallback } from 'react'

const TAUNTS = [
  "😂 Too slow!", "🤣 Nice try!", "😈 Catch me!", "💀 LOL",
  "🏃 Byeee!", "😜 Nope!", "🤡 Really?", "😏 Not today",
  "🔐 Access denied!", "👻 Boo!", "🚀 Zoom!", "😎 Hacker? Where?",
  "🤖 Error 403", "🦆 Quack!", "⚡ Too fast!", "🎯 Missed!",
]

const FIELD_W = 220, FIELD_H = 36, BTN_W = 220, BTN_H = 38

export default function EscapeLogin() {
  const containerRef = useRef(null)
  const [bounds, setBounds] = useState({ w: 800, h: 500 })
  const [taunt, setTaunt] = useState("🔐 Log in if you can...")
  const [attempts, setAttempts] = useState(0)
  const [caught, setCaught] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Positions for each element
  const [pos, setPos] = useState({
    label1: { x: 100, y: 80 },
    user:   { x: 100, y: 100 },
    label2: { x: 100, y: 160 },
    pass:   { x: 100, y: 180 },
    btn:    { x: 100, y: 260 },
  })

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect()
        setBounds({ w: r.width, h: r.height })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const randomPos = useCallback((w, h) => ({
    x: Math.random() * (bounds.w - w - 20) + 10,
    y: Math.random() * (bounds.h - h - 20) + 10,
  }), [bounds])

  const flee = useCallback((key) => {
    if (caught) return
    setTaunt(TAUNTS[Math.floor(Math.random() * TAUNTS.length)])
    setAttempts(a => a + 1)
    setPos(p => ({
      ...p,
      [key]: randomPos(key === 'btn' ? BTN_W : FIELD_W, key === 'btn' ? BTN_H : FIELD_H),
      // Also move nearby elements
      ...(key === 'user' ? { label1: randomPos(120, 20) } : {}),
      ...(key === 'pass' ? { label2: randomPos(120, 20) } : {}),
    }))
  }, [caught, randomPos])

  const fleeAll = useCallback(() => {
    if (caught) return
    setTaunt(TAUNTS[Math.floor(Math.random() * TAUNTS.length)])
    setAttempts(a => a + 1)
    setPos({
      label1: randomPos(120, 20),
      user:   randomPos(FIELD_W, FIELD_H),
      label2: randomPos(120, 20),
      pass:   randomPos(FIELD_W, FIELD_H),
      btn:    randomPos(BTN_W, BTN_H),
    })
  }, [caught, randomPos])

  const handleLogin = () => {
    if (caught) return
    if (username === 'admin' && password === 'admin') {
      setCaught(true)
      setTaunt("😱 HOW?! You actually got me!")
    } else {
      fleeAll()
      setTaunt("😂 Wrong creds AND you can't even click me!")
    }
  }

  const reset = () => {
    setCaught(false)
    setUsername('')
    setPassword('')
    setAttempts(0)
    setTaunt("🔐 Log in if you can...")
    setPos({
      label1: { x: 100, y: 80 },
      user:   { x: 100, y: 100 },
      label2: { x: 100, y: 160 },
      pass:   { x: 100, y: 180 },
      btn:    { x: 100, y: 260 },
    })
  }

  const style = (key, w, h) => ({
    position: 'absolute',
    left: pos[key].x,
    top: pos[key].y,
    width: w,
    transition: caught ? 'none' : 'left 0.15s cubic-bezier(.17,.67,.35,1.2), top 0.15s cubic-bezier(.17,.67,.35,1.2)',
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      {/* Taunt bar */}
      <div style={{ fontSize: '1rem', color: '#00ff99', textShadow: '0 0 10px #00ff99', minHeight: '2rem', textAlign: 'center', letterSpacing: '0.05em' }}>
        {taunt}
      </div>
      <div style={{ fontSize: '0.65rem', color: '#333' }}>
        Attempts: <span style={{ color: attempts > 10 ? '#ff3333' : '#00ff99' }}>{attempts}</span>
        {'  ·  '}Hint: try <span style={{ color: '#555' }}>admin / admin</span>
        {'  ·  '}
        <button onClick={reset} style={{ background: 'none', border: 'none', color: '#444', fontFamily: 'inherit', fontSize: '0.65rem', cursor: 'pointer', textDecoration: 'underline' }}>reset</button>
      </div>

      {/* Arena */}
      <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '800px', height: '460px', background: '#050505', border: '1px solid #1a1a1a', overflow: 'hidden' }}>

        {/* Scanline overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.04) 2px,rgba(0,0,0,0.04) 4px)', pointerEvents: 'none', zIndex: 10 }} />

        {caught ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '3rem' }}>😱</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#00ff99', textShadow: '0 0 20px #00ff99' }}>ACCESS GRANTED</div>
            <div style={{ fontSize: '0.7rem', color: '#555' }}>You caught the login form after {attempts} attempts</div>
            <button onClick={reset} style={{ background: 'rgba(0,255,153,0.1)', border: '1px solid #00ff99', color: '#00ff99', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0.4rem 1.5rem', cursor: 'pointer', marginTop: '0.5rem' }}>
              PLAY AGAIN
            </button>
          </div>
        ) : (
          <>
            {/* Username label */}
            <div style={{ ...style('label1', 120, 20), fontSize: '0.65rem', color: '#444', letterSpacing: '0.1em' }}>
              USERNAME
            </div>

            {/* Username input */}
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onFocus={() => flee('user')}
              onMouseEnter={() => flee('user')}
              placeholder="username"
              style={{ ...style('user', FIELD_W, FIELD_H), height: FIELD_H, background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#00ff99', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0 0.75rem', outline: 'none', boxSizing: 'border-box' }}
            />

            {/* Password label */}
            <div style={{ ...style('label2', 120, 20), fontSize: '0.65rem', color: '#444', letterSpacing: '0.1em' }}>
              PASSWORD
            </div>

            {/* Password input */}
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => flee('pass')}
              onMouseEnter={() => flee('pass')}
              placeholder="password"
              style={{ ...style('pass', FIELD_W, FIELD_H), height: FIELD_H, background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#00ff99', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0 0.75rem', outline: 'none', boxSizing: 'border-box' }}
            />

            {/* Login button */}
            <button
              onClick={handleLogin}
              onMouseEnter={() => flee('btn')}
              style={{ ...style('btn', BTN_W, BTN_H), height: BTN_H, background: 'rgba(0,255,153,0.08)', border: '1px solid #00ff99', color: '#00ff99', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.15em' }}
            >
              LOGIN →
            </button>
          </>
        )}
      </div>

      <div style={{ fontSize: '0.6rem', color: '#222' }}>
        Elements flee on hover/focus · Correct creds: admin/admin · Can you catch them all at once?
      </div>
    </div>
  )
}
