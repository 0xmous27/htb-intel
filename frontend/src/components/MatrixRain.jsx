import { useEffect, useRef } from 'react'

const CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン{}[]<>/\\|!@#$%^&*'

export default function MatrixRain() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let w = canvas.width = window.innerWidth
    let h = canvas.height = window.innerHeight
    const fontSize = 13
    let cols = Math.floor(w / fontSize)
    let drops = Array(cols).fill(0).map(() => Math.random() * -50)

    const draw = () => {
      ctx.fillStyle = 'rgba(2,2,2,0.04)'
      ctx.fillRect(0, 0, w, h)
      const neon = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#00ff99'
      const dim  = getComputedStyle(document.documentElement).getPropertyValue('--neon-dim').trim() || '#00cc77'

      drops.forEach((y, i) => {
        const char = CHARS[Math.floor(Math.random() * CHARS.length)]
        const brightness = Math.random() > 0.95 ? '#ffffff' : Math.random() > 0.7 ? neon : dim
        ctx.fillStyle = brightness
        ctx.font = `${fontSize}px JetBrains Mono`
        ctx.fillText(char, i * fontSize, y * fontSize)

        if (y * fontSize > h && Math.random() > 0.975) drops[i] = 0
        drops[i] += 0.5 + Math.random() * 0.5
      })
    }

    const interval = setInterval(draw, 40)
    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      cols = Math.floor(w / fontSize)
      drops = Array(cols).fill(0).map(() => Math.random() * -50)
    }
    window.addEventListener('resize', resize)
    return () => { clearInterval(interval); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} id="matrix-bg" />
}
