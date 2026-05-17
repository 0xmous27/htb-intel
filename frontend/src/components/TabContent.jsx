import { lazy, Suspense } from 'react'
import TechniqueCard from './TechniqueCard'

const ToolsView = lazy(() => import('./ToolsView'))
const ServicesView = lazy(() => import('./ServicesView'))
const RegexView = lazy(() => import('./RegexView'))
const OOBView = lazy(() => import('./OOBView'))
const CredsVault = lazy(() => import('./CredsVault'))
const NotesTab = lazy(() => import('./NotesTab'))
const ChecklistTab = lazy(() => import('./ChecklistTab'))
const PayloadGen = lazy(() => import('./PayloadGen'))
const HashID = lazy(() => import('./HashID'))
const WordlistsRef = lazy(() => import('./WordlistsRef'))
const PortRef = lazy(() => import('./PortRef'))
const HackGame = lazy(() => import('./HackGame'))
const RunnerGame = lazy(() => import('./EscapeLogin'))
const CPTSGuide = lazy(() => import('./CPTSGuide'))
const GTFOBins = lazy(() => import('./GTFOBins'))
const CVERef = lazy(() => import('./CVERef'))
const LootTracker = lazy(() => import('./LootTracker'))
const TemplateForge = lazy(() => import('./TemplateForge'))
const TricksTab = lazy(() => import('./TricksTab'))
const BugBountyTab = lazy(() => import('./BugBountyTab'))

export default function TabContent({ tab, search, active, techniques, loading, TABS }) {
  return (
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
  )
}
