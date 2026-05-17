// @ts-nocheck
import { useEffect, useRef } from 'react'

export default function CrashText() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const getNeon = () => getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#00ff99'

    let animId = null

    // Recursive jagged bolt — very fast, one call draws the whole thing
    const bolt = (x1, y1, x2, y2, spread, depth) => {
      if (depth === 0) {
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke()
        return
      }
      const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread
      const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread * 0.3
      bolt(x1, y1, mx, my, spread / 2, depth - 1)
      bolt(mx, my, x2, y2, spread / 2, depth - 1)
      // random branch
      if (depth > 2 && Math.random() > 0.55) {
        const angle = Math.atan2(y2 - y1, x2 - x1) + (Math.random() - 0.5) * 1.4
        const len = spread * (0.4 + Math.random() * 0.4)
        bolt(mx, my, mx + Math.cos(angle) * len, my + Math.sin(angle) * len, spread / 3, depth - 2)
      }
    }

    const drawBolt = (x1, y1, x2, y2, alpha) => {
      ctx.save()
      // outer glow
      ctx.globalAlpha = alpha * 0.4
      ctx.strokeStyle = '#aaaaff'
      ctx.lineWidth = 8
      ctx.shadowColor = '#ffffff'
      ctx.shadowBlur = 40
      bolt(x1, y1, x2, y2, 120, 5)
      // bright core
      ctx.globalAlpha = alpha
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.shadowBlur = 20
      bolt(x1, y1, x2, y2, 120, 5)
      ctx.restore()
    }

    const runCrash = () => {
      if (animId) cancelAnimationFrame(animId)
      const W = canvas.width, H = canvas.height
      const neon = getNeon()
      const stored = localStorage.getItem('htb-intel-name')
      const text = stored ? stored.toUpperCase() : '0xmous7'
      const fontSize = Math.min(W / 5, 160)
      ctx.font = `900 ${fontSize}px JetBrains Mono, monospace`
      const tw = ctx.measureText(text).width
      const tx = (W - tw) / 2
      const textY = H * 0.58
      const strikeX = tx + tw / 2 + (Math.random() - 0.5) * tw * 0.3
      const strikeY = textY - fontSize * 0.15

      // Pre-measure each letter position for explosion
      const letters = []
      let cx = tx
      for (const ch of text) {
        const cw = ctx.measureText(ch).width
        const angle = Math.random() * Math.PI * 2
        const speed = 3 + Math.random() * 6
        letters.push({ ch, x: cx, y: textY, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3, life: 1 })
        cx += cw
      }

      // phases: 0=bolt 1=flash 2=explode
      let phase = 0
      let flashA = 1.0
      let t = 0

      const draw = () => {
        ctx.clearRect(0, 0, W, H)
        t++

        if (phase === 0) {
          // Single instant bolt — drawn for just 3 frames
          drawBolt(strikeX + (Math.random() - 0.5) * 30, 0, strikeX, strikeY, 1)
          // white flash overlay
          ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore()
          if (t > 3) { phase = 1; t = 0 }

        } else if (phase === 1) {
          // flash fades fast
          flashA -= 0.12
          ctx.save(); ctx.globalAlpha = Math.max(0, flashA); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore()
          // residual bolt glow
          if (flashA > 0.3) drawBolt(strikeX, 0, strikeX, strikeY, flashA * 0.5)
          if (flashA <= 0) { phase = 2; t = 0 }

        } else {
          // letters explode and fade
          ctx.font = `900 ${fontSize}px JetBrains Mono, monospace`
          let alive = false
          for (const l of letters) {
            l.x += l.vx; l.y += l.vy; l.vy += 0.25
            l.life -= 0.022
            if (l.life <= 0) continue
            alive = true
            ctx.save()
            ctx.globalAlpha = l.life * 0.55  // never full opacity — doesn't interfere
            ctx.fillStyle = neon
            ctx.shadowColor = neon
            ctx.shadowBlur = 6
            ctx.fillText(l.ch, l.x, l.y)
            ctx.restore()
          }
          if (!alive) { ctx.clearRect(0, 0, W, H); cancelAnimationFrame(animId); return }
        }

        animId = requestAnimationFrame(draw)
      }
      animId = requestAnimationFrame(draw)
    }

    const delay = setTimeout(runCrash, 3000)
    const interval = setInterval(runCrash, 300000)
    return () => { clearTimeout(delay); clearInterval(interval); cancelAnimationFrame(animId); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 500 }} />
}
