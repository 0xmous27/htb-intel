import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { TargetProvider } from './hooks/TargetContext'
import { supabase } from './lib/supabase'
import MatrixRain from './components/MatrixRain'
import CrashText from './components/CrashText'
import Sidebar from './components/Sidebar'
import TargetBar from './components/TargetBar'
import TabContent from './components/TabContent'
import Footer from './components/Footer'
import CopyHistory, { initCopyTracker } from './components/CopyHistory'

const AdminPanel = lazy(() => import('./components/AdminPanel'))

const TABS = [
  // ── ATTACK ──
  { id: 'techniques', label: '⚡ TECHNIQUES', group: 'attack' },
  { id: 'services',   label: '🌐 SERVICES', group: 'attack' },
  { id: 'ports',      label: '🔌 PORTS', group: 'attack' },
  { id: 'tools',      label: '🔧 TOOLS', group: 'attack' },
  { id: 'payload',    label: '💉 PAYLOADS', group: 'attack' },
  { id: 'oob',        label: '📡 BLIND / OOB', group: 'attack' },
  { id: 'cve',        label: '💀 CVEs', group: 'attack' },
  { id: 'ad',         label: '🏢 AD', group: 'attack' },
  // ── CRACK ──
  { id: 'hash',       label: '🔐 HASH ID', group: 'crack' },
  { id: 'wordlists',  label: '📦 WORDLISTS', group: 'crack' },
  { id: 'gtfo',       label: '🐚 GTFO', group: 'crack' },
  // ── TRACK ──
  { id: 'quickref',   label: '⚡ QUICK REF', group: 'track' },
  { id: 'regex',      label: '🔍 REGEX', group: 'track' },
  { id: 'loot',       label: '🎯 LOOT', group: 'track' },
  { id: 'creds',      label: '🔑 CREDS', group: 'track' },
  { id: 'checklist',  label: '📋 CHECKLIST', group: 'track' },
  { id: 'notes',      label: '📝 NOTES', group: 'track' },
  // ── LEARN ──
  { id: 'tricks',     label: '🃏 TRICKS', group: 'learn' },
  { id: 'bugbounty',  label: '🐛 BUG BOUNTY', group: 'learn' },
  { id: 'forge',      label: '⚒ FORGE', group: 'learn' },
  { id: 'cpts',       label: '🎓 CPTS', group: 'learn' },
  // ── FUN ──
  { id: 'game',       label: '🎮 HACK GAME', group: 'fun' },
]

interface Technique {
  id: string
  name: string
  command: string
  purpose?: string
  when_to_use?: string
  tags?: string[]
}

interface Category {
  category: string
  techniques: Technique[]
}

function App() {
  const [data, setData] = useState<Category[]>([])
  const [active, setActive] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('techniques')
  const isAdmin = window.location.pathname === '/admin'
  const [loading, setLoading] = useState(true)
  const [tabSweep, setTabSweep] = useState(-1)

  // #10 — Track all copied commands
  useEffect(() => { initCopyTracker() }, [])

  // #3 — Keyboard shortcuts: 1-9 for tabs, / for search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === '/') { e.preventDefault(); document.querySelector<HTMLInputElement>('.sidebar-search input')?.focus() }
      const num = parseInt(e.key)
      if (num >= 1 && num <= 9) setTab(TABS[num - 1]?.id || tab)
      if (e.key === '0') setTab(TABS[9]?.id || tab)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [tab])

  useEffect(() => {
    const total = TABS.length
    let i = 0
    const step = setInterval(() => {
      setTabSweep(i)
      i++
      if (i >= total) { clearInterval(step); setTimeout(() => setTabSweep(-1), 500) }
    }, 160)
    return () => clearInterval(step)
  }, [])

  useEffect(() => {
    // Fetch techniques from Supabase, fall back to static JSON
    supabase.from('techniques').select('*').order('created_at', { ascending: false })
      .then(({ data: rows, error }) => {
        if (!error && rows && rows.length > 0) {
          // Group flat rows into {category, techniques:[...]}
          const grouped: Record<string, Technique[]> = {}
          for (const r of rows) {
            const cat = r.category || 'Misc'
            if (!grouped[cat]) grouped[cat] = []
            grouped[cat].push({ id: r.id, name: r.name, command: r.command, purpose: r.purpose, when_to_use: r.when_to_use, tags: r.tags || [] })
          }
          setData(Object.entries(grouped).map(([category, techniques]) => ({ category, techniques })))
          setLoading(false)
        } else {
          import('./data/techniques.json').then(m => { setData(m.default); setLoading(false) })
        }
      })
  }, [])

  const categories = useMemo(() => data.map(c => ({ category: c.category, count: c.techniques.length })), [data])

  const techniques = useMemo(() => {
    let list = active ? (data.find(c => c.category === active)?.techniques ?? []) : data.flatMap(c => c.techniques)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.command.toLowerCase().includes(q) || t.tags?.some(tag => tag.includes(q)))
    }
    return list
  }, [data, active, search])

  return (
    <>
      <MatrixRain />
      <CrashText />
      <div className="scanline" />
      {isAdmin ? (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10 }}>
          <Suspense fallback={<div style={{ padding: '2rem', color: '#888' }}>LOADING...</div>}>
            <AdminPanel />
          </Suspense>
        </div>
      ) : (
      <div className="app-layout" style={{ flexDirection: 'column' }}>
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Sidebar categories={categories} active={active} onSelect={(cat: string) => { setActive(cat); setTab('techniques') }} search={search} onSearch={setSearch} />
          <div className="main-content">
            <TargetBar />
            {/* Tab bar — 2 rows of 11 */}
            <div className="tab-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', position: 'relative' }}>
              {TABS.map((t, i) => {
                const neon = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#00ff99'
                const globalIdx = i
                const lit = tabSweep === globalIdx
                return (
                  <button
                    key={t.id}
                    className={`tab-btn ${tab === t.id ? 'active' : ''}`}
                    onClick={() => setTab(t.id)}
                    style={lit ? {
                      color: neon,
                      borderBottomColor: neon,
                      background: `${neon}12`,
                      textShadow: `0 0 12px ${neon}, 0 0 24px ${neon}66`,
                      boxShadow: `0 0 10px ${neon}33`,
                    } : {}}
                  >{t.label}</button>
                )
              })}
            </div>
            <div className="content-area">
              <TabContent tab={tab} search={search} active={active} techniques={techniques} loading={loading} TABS={TABS} />
            </div>
          </div>
        </div>
        <CopyHistory />
        <Footer />
      </div>
      )}
    </>
  )
}

export default function Root() {
  return <TargetProvider><App /></TargetProvider>
}
