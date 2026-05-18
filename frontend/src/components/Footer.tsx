import { useState, useEffect } from 'react'
import { useNeon } from '../hooks/ThemeContext'
import { supabase } from '../lib/supabase'

const QUOTES = [
  '"The quieter you become, the more you are able to hear." — Kali Linux',
  '"Hackers are not criminals. They are explorers." — Unknown',
  '"Security is not a product, but a process." — Bruce Schneier',
  '"The only truly secure system is one that is powered off." — Gene Spafford',
  '"Know your enemy and know yourself." — Sun Tzu',
  '"Offense informs defense." — HTB Philosophy',
  '"Every system can be broken. The question is how long it takes." — Unknown',
  '"Root is not the goal. Understanding is." — 0xmous7',
  '"We are not breaking in. We are finding the door they forgot to lock." — 0xmous7',
]

export default function Footer() {
  const neon = useNeon()
  const [quote] = useState(() => QUOTES[Math.floor(Date.now() / 86400000) % QUOTES.length])
  const [time, setTime] = useState(new Date().toLocaleTimeString())
  const [visitors, setVisitors] = useState<number | null>(null)
  const [welcome, setWelcome] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [soft, setSoft] = useState(() => localStorage.getItem('htb-soft-mode') === '1')

  // #5 — Apply soft mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', soft ? 'soft' : '')
    localStorage.setItem('htb-soft-mode', soft ? '1' : '0')
  }, [soft])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(t)
  }, [])

  // #7 — Collapse footer on scroll down, show on scroll up
  useEffect(() => {
    let lastY = 0
    const el = document.querySelector('.content-area')
    if (!el) return
    const onScroll = () => {
      const y = el.scrollTop
      setCollapsed(y > lastY && y > 100)
      lastY = y
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!sessionStorage.getItem('htb-visited')) {
      sessionStorage.setItem('htb-visited', '1')
      supabase.rpc('increment_visits').then(({ data }) => {
        if (data) setVisitors(Number(data))
      })
    } else {
      supabase.from('site_stats').select('visits').single().then(({ data }) => {
        if (data) setVisitors(data.visits)
      })
    }
    const stored = localStorage.getItem('htb-intel-name')
    if (stored) {
      setTimeout(() => {
        setWelcome(`WELCOME BACK, ${stored.toUpperCase()}`)
        setTimeout(() => setWelcome(null), 4000)
      }, 800)
    }
  }, [])

  return (
    <>
      {welcome && (
        <div style={{
          position: 'fixed', bottom: '3.5rem', left: '50%', transform: 'translateX(-50%)',
          background: '#020202', border: `1px solid ${neon}44`,
          color: neon, fontFamily: 'inherit', fontSize: '0.72rem',
          padding: '0.5rem 1.25rem', letterSpacing: '0.12em',
          boxShadow: `0 0 20px ${neon}22`, zIndex: 9999,
          animation: 'fadeInOut 4s ease forwards', whiteSpace: 'nowrap',
        }}>{welcome}</div>
      )}

      <footer style={{
        borderTop: '1px solid #0d0d0d',
        padding: collapsed ? '0.2rem 1.5rem' : '0.5rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'rgba(4,4,4,0.98)', backdropFilter: 'blur(20px)',
        flexShrink: 0, zIndex: 2, position: 'relative',
        transition: 'padding 0.3s, opacity 0.3s',
        opacity: collapsed ? 0.4 : 1,
        maxHeight: collapsed ? '24px' : '60px',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '1px',
          background: `linear-gradient(to right, transparent, ${neon}33 30%, ${neon}66 50%, ${neon}33 70%, transparent)`,
          animation: 'border-flow 4s ease-in-out infinite' }} />
        {!collapsed && (
          <div style={{ fontSize: '0.58rem', color: '#888', fontStyle: 'italic', maxWidth: '500px', lineHeight: 1.4 }}>
            <span style={{ color: neon, opacity: 0.3 }}>❝ </span>{quote}<span style={{ color: neon, opacity: 0.3 }}> ❞</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.58rem', flexWrap: 'wrap' }}>
          {visitors !== null && (
            <span style={{ color: neon, opacity: 0.6, letterSpacing: '0.08em' }}>◈ {visitors.toLocaleString()} VISITORS</span>
          )}
          <span style={{ color: '#888' }}><span style={{ color: neon, opacity: 0.3 }}>⏱</span> {time}</span>
          {!collapsed && <>
            <span style={{ color: '#888' }}>HTB INTEL PLATFORM</span>
            <span>
              <span style={{ color: '#888' }}>CRAFTED BY </span>
              <span style={{ color: neon, textShadow: `0 0 10px ${neon}66`, fontWeight: 700, letterSpacing: '0.1em' }}>0xmous7</span>
            </span>
            <span style={{ color: '#555' }}>🩸☕</span>
            <button onClick={() => setSoft(s => !s)} title={soft ? 'Switch to dark' : 'Switch to soft'} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem', opacity: 0.5 }}>{soft ? '🌙' : '👁'}</button>
          </>}
        </div>
      </footer>
    </>
  )
}
