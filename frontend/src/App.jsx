import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { TargetProvider } from './hooks/TargetContext'
import MatrixRain from './components/MatrixRain'
import CrashText from './components/CrashText'
import Sidebar from './components/Sidebar'
import TargetBar from './components/TargetBar'
import TabContent from './components/TabContent'
import Footer from './components/Footer'

const AdminPanel = lazy(() => import('./components/AdminPanel'))

const TABS = [
  { id: 'techniques', label: '⚡ TECHNIQUES' },
  { id: 'tools',      label: '🔧 TOOLS' },
  { id: 'services',   label: '🌐 SERVICES' },
  { id: 'oob',        label: '📡 OOB' },
  { id: 'regex',      label: '⌥ REGEX' },
  { id: 'payload',    label: '💉 PAYLOADS' },
  { id: 'hash',       label: '🔐 HASH ID' },
  { id: 'ports',      label: '🔌 PORTS' },
  { id: 'wordlists',  label: '📦 WORDLISTS' },
  { id: 'gtfo',       label: '🐚 GTFOBins' },
  { id: 'cve',        label: '💀 CVEs' },
  { id: 'loot',       label: '🎯 LOOT' },
  { id: 'creds',      label: '🔑 CREDS' },
  { id: 'checklist',  label: '📋 CHECKLIST' },
  { id: 'notes',      label: '📝 NOTES' },
  { id: 'cpts',       label: '🎓 CPTS' },
  { id: 'forge',      label: '⚒ TEMPLATE FORGE' },
  { id: 'tricks',     label: '🃏 TRICKS' },
  { id: 'bugbounty',  label: '🐛 BUG BOUNTY' },
  { id: 'game',       label: '🎮 HACK GAME' },
  { id: 'runner',     label: '😂 CATCH ME' },
]

function App() {
  const [data, setData] = useState([])
  const [active, setActive] = useState(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('techniques')
  const isAdmin = window.location.pathname === '/admin'
  const [loading, setLoading] = useState(true)
  const [tabSweep, setTabSweep] = useState(-1)

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
    fetch('/api/techniques')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => {
        import('./data/techniques.json').then(m => { setData(m.default); setLoading(false) })
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
        <div className="app-layout" style={{ flexDirection: 'column' }}>
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            <div className="main-content">
              <Suspense fallback={<div className="empty-state">LOADING...</div>}>
                <AdminPanel />
              </Suspense>
            </div>
          </div>
        </div>
      ) : (
      <div className="app-layout" style={{ flexDirection: 'column' }}>
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Sidebar categories={categories} active={active} onSelect={(cat) => { setActive(cat); setTab('techniques') }} search={search} onSearch={setSearch} />
          <div className="main-content">
            <TargetBar />
            <div className="tab-bar" style={{ flexWrap: 'wrap' }}>
              {TABS.map((t, i) => {
                const neon = getComputedStyle(document.documentElement).getPropertyValue('--neon').trim() || '#00ff99'
                const lit = tabSweep === i
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
        <Footer />
      </div>
      )}
    </>
  )
}

export default function Root() {
  return <TargetProvider><App /></TargetProvider>
}
