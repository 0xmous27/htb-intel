import { useState, useEffect, useMemo, lazy, Suspense } from 'react'
import { TargetProvider } from './hooks/TargetContext'
import MatrixRain from './components/MatrixRain'
import CrashText from './components/CrashText'
import Sidebar from './components/Sidebar'
import TechniqueCard from './components/TechniqueCard'
import TargetBar from './components/TargetBar'
import Footer from './components/Footer'

// Lazy-loaded tab components
const ToolsView = lazy(() => import('./components/ToolsView'))
const ServicesView = lazy(() => import('./components/ServicesView'))
const RegexView = lazy(() => import('./components/RegexView'))
const OOBView = lazy(() => import('./components/OOBView'))
const CredsVault = lazy(() => import('./components/CredsVault'))
const NotesTab = lazy(() => import('./components/NotesTab'))
const ChecklistTab = lazy(() => import('./components/ChecklistTab'))
const PayloadGen = lazy(() => import('./components/PayloadGen'))
const HashID = lazy(() => import('./components/HashID'))
const WordlistsRef = lazy(() => import('./components/WordlistsRef'))
const PortRef = lazy(() => import('./components/PortRef'))
const HackGame = lazy(() => import('./components/HackGame'))
const RunnerGame = lazy(() => import('./components/EscapeLogin'))
const CPTSGuide = lazy(() => import('./components/CPTSGuide'))
const GTFOBins = lazy(() => import('./components/GTFOBins'))
const CVERef = lazy(() => import('./components/CVERef'))
const LootTracker = lazy(() => import('./components/LootTracker'))
const TemplateForge = lazy(() => import('./components/TemplateForge'))
const TricksTab = lazy(() => import('./components/TricksTab'))
const BugBountyTab = lazy(() => import('./components/BugBountyTab'))
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
    // Run sweep once on load, then stop
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
              <Suspense fallback={<div className="empty-state">LOADING...</div>}>
              {tab !== 'techniques' && (
                <div className="content-header">
                  <span className="content-title">{TABS.find(t => t.id === tab)?.label.replace(/^\S+\s/, '')}</span>
                </div>
              )}
              {tab === 'techniques' && (
                <>
                  <div className="content-header">
                    <span className="content-title">{active ?? 'ALL TECHNIQUES'}</span>
                    <span className="content-count">{techniques.length} techniques</span>
                  </div>
                  {loading && <div className="empty-state">LOADING...</div>}
                  {!loading && techniques.length === 0 && <div className="empty-state">NO TECHNIQUES FOUND</div>}
                  {techniques.map(t => <TechniqueCard key={t.id} technique={t} />)}
                </>
              )}
              {tab === 'tools'     && <ToolsView search={search} />}
              {tab === 'services'  && <ServicesView search={search} />}
              {tab === 'oob'       && <OOBView search={search} />}
              {tab === 'regex'     && <RegexView search={search} />}
              {tab === 'payload'   && <PayloadGen />}
              {tab === 'hash'      && <HashID />}
              {tab === 'ports'     && <PortRef />}
              {tab === 'wordlists' && <WordlistsRef />}
              {tab === 'gtfo'      && <GTFOBins />}
              {tab === 'cve'       && <CVERef />}
              {tab === 'loot'      && <LootTracker />}
              {tab === 'creds'     && <CredsVault />}
              {tab === 'checklist' && <ChecklistTab />}
              {tab === 'notes'     && <NotesTab />}
              {tab === 'cpts'      && <CPTSGuide />}
              {tab === 'forge'     && <TemplateForge />}
              {tab === 'tricks'    && <TricksTab />}
              {tab === 'bugbounty' && <BugBountyTab />}
              {tab === 'game'      && <HackGame />}
              {tab === 'runner'    && <RunnerGame />}
              </Suspense>
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
