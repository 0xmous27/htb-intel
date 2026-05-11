import { useEffect, useRef, useState } from 'react'

const W = 800, H = 220
const GROUND = H - 40
const GRAVITY = 0.6
const JUMP_FORCE = -13
const SPEED_INIT = 5
const COLORS = { neon: '#00ff99', red: '#ff3333', orange: '#ff9900', dim: '#00cc77', dark: '#030303', grid: '#0a1a0a' }

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }

// Obstacle types
const OBSTACLES = [
  { w: 20, h: 40, label: 'FW', color: COLORS.red },      // firewall
  { w: 14, h: 60, label: 'IDS', color: COLORS.orange },  // IDS
  { w: 30, h: 25, label: 'WAF', color: '#ff44ff' },      // WAF
]

export default function RunnerGame() {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const rafRef = useRef(null)
  const [status, setStatus] = useState('idle') // idle | running | dead
  const [hi, setHi] = useState(() => parseInt(localStorage.getItem('runner_hi') || '0'))

  function initState() {
    return {
      player: { x: 80, y: GROUND, vy: 0, onGround: true, w: 24, h: 32 },
      obstacles: [],
      particles: [],
      pickups: [],
      score: 0,
      speed: SPEED_INIT,
      frame: 0,
      nextObs: rand(60, 120),
      nextPickup: rand(80, 160),
      bgOffset: 0,
    }
  }

  function jump(s) {
    if (s.player.onGround) {
      s.player.vy = JUMP_FORCE
      s.player.onGround = false
    }
  }

  function start() {
    stateRef.current = initState()
    setStatus('running')
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (status === 'idle' || status === 'dead') { start(); return }
        if (stateRef.current) jump(stateRef.current)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [status])

  useEffect(() => {
    if (status !== 'running') return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    function drawGrid() {
      ctx.strokeStyle = COLORS.grid
      ctx.lineWidth = 0.5
      const s = stateRef.current
      const off = s.bgOffset % 40
      for (let x = -off; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke()
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke()
      }
    }

    function drawPlayer(p) {
      // Body
      ctx.fillStyle = COLORS.neon
      ctx.fillRect(p.x, p.y, p.w, p.h)
      // Visor
      ctx.fillStyle = COLORS.dark
      ctx.fillRect(p.x + 4, p.y + 6, 16, 8)
      ctx.fillStyle = '#00ffff'
      ctx.fillRect(p.x + 6, p.y + 8, 12, 4)
      // Legs animation
      const leg = Math.floor(stateRef.current.frame / 6) % 2
      ctx.fillStyle = COLORS.dim
      ctx.fillRect(p.x + (leg ? 4 : 12), p.y + p.h, 8, 8)
      ctx.fillRect(p.x + (leg ? 12 : 4), p.y + p.h - 4, 8, 4)
    }

    function drawObstacle(o) {
      ctx.fillStyle = o.color
      ctx.fillRect(o.x, o.y, o.w, o.h)
      // Label
      ctx.fillStyle = COLORS.dark
      ctx.font = 'bold 8px JetBrains Mono'
      ctx.textAlign = 'center'
      ctx.fillText(o.label, o.x + o.w / 2, o.y + o.h / 2 + 3)
      // Glow
      ctx.shadowColor = o.color
      ctx.shadowBlur = 8
      ctx.strokeStyle = o.color
      ctx.lineWidth = 1
      ctx.strokeRect(o.x, o.y, o.w, o.h)
      ctx.shadowBlur = 0
    }

    function drawPickup(pk) {
      ctx.fillStyle = '#ffcc00'
      ctx.shadowColor = '#ffcc00'
      ctx.shadowBlur = 10
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('⬡', pk.x + 8, pk.y + 12)
      ctx.shadowBlur = 0
    }

    function drawParticles(particles) {
      particles.forEach(p => {
        ctx.globalAlpha = p.life / p.maxLife
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size)
      })
      ctx.globalAlpha = 1
    }

    function spawnParticles(x, y, color, count = 8) {
      const s = stateRef.current
      for (let i = 0; i < count; i++) {
        s.particles.push({
          x, y,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6,
          size: rand(2, 5),
          color,
          life: 20, maxLife: 20,
        })
      }
    }

    function tick() {
      const s = stateRef.current
      if (!s) return

      s.frame++
      s.bgOffset += s.speed * 0.5
      s.score++
      s.speed = SPEED_INIT + s.score / 500

      // Player physics
      const p = s.player
      p.vy += GRAVITY
      p.y += p.vy
      if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.onGround = true }

      // Spawn obstacles
      s.nextObs--
      if (s.nextObs <= 0) {
        const t = OBSTACLES[rand(0, OBSTACLES.length - 1)]
        s.obstacles.push({ ...t, x: W + 10, y: GROUND + p.h - t.h })
        s.nextObs = rand(Math.max(40, 90 - s.score / 100), Math.max(70, 140 - s.score / 100))
      }

      // Spawn pickups (data fragments)
      s.nextPickup--
      if (s.nextPickup <= 0) {
        s.pickups.push({ x: W + 10, y: GROUND - rand(20, 60) })
        s.nextPickup = rand(80, 160)
      }

      // Move obstacles
      s.obstacles = s.obstacles.filter(o => {
        o.x -= s.speed
        // Collision
        if (p.x + p.w - 4 > o.x && p.x + 4 < o.x + o.w && p.y + p.h > o.y && p.y < o.y + o.h) {
          spawnParticles(p.x, p.y, COLORS.red, 12)
          const score = Math.floor(s.score / 10)
          if (score > hi) { setHi(score); localStorage.setItem('runner_hi', score) }
          setStatus('dead')
          return false
        }
        return o.x > -o.w
      })

      // Move pickups
      s.pickups = s.pickups.filter(pk => {
        pk.x -= s.speed
        if (p.x + p.w > pk.x && p.x < pk.x + 16 && p.y + p.h > pk.y && p.y < pk.y + 16) {
          spawnParticles(pk.x, pk.y, '#ffcc00', 6)
          s.score += 50
          return false
        }
        return pk.x > -20
      })

      // Particles
      s.particles = s.particles.filter(pt => {
        pt.x += pt.vx; pt.y += pt.vy; pt.life--
        return pt.life > 0
      })

      // Draw
      ctx.fillStyle = COLORS.dark
      ctx.fillRect(0, 0, W, H)
      drawGrid()

      // Ground line
      ctx.strokeStyle = COLORS.neon
      ctx.lineWidth = 1
      ctx.shadowColor = COLORS.neon
      ctx.shadowBlur = 4
      ctx.beginPath(); ctx.moveTo(0, GROUND + p.h + 8); ctx.lineTo(W, GROUND + p.h + 8); ctx.stroke()
      ctx.shadowBlur = 0

      s.obstacles.forEach(drawObstacle)
      s.pickups.forEach(drawPickup)
      drawPlayer(p)
      drawParticles(s.particles)

      // Score
      ctx.fillStyle = COLORS.neon
      ctx.font = '12px JetBrains Mono'
      ctx.textAlign = 'left'
      ctx.fillText(`SCORE: ${Math.floor(s.score / 10).toString().padStart(5, '0')}`, 10, 20)
      ctx.textAlign = 'right'
      ctx.fillText(`HI: ${hi.toString().padStart(5, '0')}`, W - 10, 20)
      ctx.textAlign = 'left'
      ctx.fillStyle = '#333'
      ctx.fillText(`SPD: ${s.speed.toFixed(1)}`, 10, 36)

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [status])

  const handleClick = () => {
    if (status === 'idle' || status === 'dead') { start(); return }
    if (stateRef.current) jump(stateRef.current)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
      <div style={{ position: 'relative', cursor: 'pointer' }} onClick={handleClick}>
        <canvas ref={canvasRef} width={W} height={H}
          style={{ border: '1px solid #1a1a1a', display: 'block', imageRendering: 'pixelated' }}
        />

        {status === 'idle' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,3,3,0.85)' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00ff99', textShadow: '0 0 20px #00ff99', marginBottom: '0.5rem', letterSpacing: '0.2em' }}>PACKET RUNNER</div>
            <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '1.5rem' }}>Dodge firewalls. Collect data fragments.</div>
            <div style={{ fontSize: '0.75rem', color: '#00ff99', border: '1px solid #00ff99', padding: '0.4rem 1.5rem', animation: 'pulse-glow 1.5s infinite' }}>
              PRESS SPACE / CLICK TO START
            </div>
          </div>
        )}

        {status === 'dead' && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(3,3,3,0.85)' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#ff3333', marginBottom: '0.25rem' }}>CONNECTION LOST</div>
            <div style={{ fontSize: '0.7rem', color: '#555', marginBottom: '0.25rem' }}>SCORE: {Math.floor((stateRef.current?.score || 0) / 10).toString().padStart(5, '0')}</div>
            <div style={{ fontSize: '0.7rem', color: '#00ff99', marginBottom: '1rem' }}>HI: {hi.toString().padStart(5, '0')}</div>
            <div style={{ fontSize: '0.75rem', color: '#00ff99', border: '1px solid #00ff99', padding: '0.4rem 1.5rem' }}>
              PRESS SPACE / CLICK TO RETRY
            </div>
          </div>
        )}
      </div>

      <div style={{ fontSize: '0.65rem', color: '#333', display: 'flex', gap: '2rem' }}>
        <span>SPACE / CLICK — Jump</span>
        <span>⬡ — Data fragment (+50pts)</span>
        <span style={{ color: COLORS.red }}>FW — Firewall</span>
        <span style={{ color: COLORS.orange }}>IDS — Intrusion Detection</span>
        <span style={{ color: '#ff44ff' }}>WAF — Web App Firewall</span>
      </div>
    </div>
  )
}
