import { useState } from 'react'
import { CHECKLISTS } from '../data/checklists'
import { useSupabaseData } from '../hooks/useSupabaseData'

const STORAGE_KEY = 'htb_checklist_state'

interface Phase { phase: string; items: string[] }
interface Checklist { name: string; icon: string; _dbId?: string; steps: Phase[] }

function loadState(): Record<string, boolean> {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') } catch { return {} }
}

function dbToChecklist(row: any): Checklist {
  const items = (row.items || '').split('\n').map((s: string) => s.trim()).filter(Boolean)
  return {
    name: row.title,
    icon: '📋',
    _dbId: row.id,
    steps: [{ phase: row.phase || 'Steps', items }],
  }
}

function ChecklistView({ list, checked, toggle, resetList }: {
  list: Checklist; checked: Record<string, boolean>
  toggle: (key: string) => void; resetList: (name: string) => void
}) {
  const totalItems = list.steps.reduce((s, p) => s + p.items.length, 0)
  const doneItems  = list.steps.reduce((s, p) => s + p.items.filter(item => checked[`${list.name}|${item}`]).length, 0)
  const pct = totalItems ? Math.round((doneItems / totalItems) * 100) : 0

  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neon)' }}>{list.icon} {list.name}</span>
          <span style={{ fontSize: '0.65rem', color: '#aaa', marginLeft: '1rem' }}>{doneItems}/{totalItems} completed</span>
        </div>
        <button onClick={() => resetList(list.name)} style={{ background: 'none', border: '1px solid #2a0000', color: '#ff3333', fontFamily: 'inherit', fontSize: '0.6rem', padding: '2px 8px', cursor: 'pointer' }}>
          RESET
        </button>
      </div>

      <div style={{ height: '2px', background: '#1a1a1a', marginBottom: '1.5rem' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: 'var(--neon)', transition: 'width 0.3s', boxShadow: pct > 0 ? '0 0 8px var(--neon)' : 'none' }} />
      </div>

      {list.steps.map(phase => {
        const phaseDone = phase.items.filter(item => checked[`${list.name}|${item}`]).length
        return (
          <div key={phase.phase} style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="meta-label">{phase.phase}</span>
              <span style={{ fontSize: '0.6rem', color: '#333' }}>{phaseDone}/{phase.items.length}</span>
            </div>
            {phase.items.map(item => {
              const key = `${list.name}|${item}`
              const done = !!checked[key]
              return (
                <div key={item} onClick={() => toggle(key)} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.35rem 0.5rem', cursor: 'pointer',
                  borderLeft: `2px solid ${done ? 'var(--neon)' : '#1a1a1a'}`,
                  marginBottom: '2px', transition: 'all 0.15s',
                  background: done ? 'rgba(0,255,153,0.03)' : 'transparent',
                }}>
                  <span style={{ fontSize: '0.75rem', color: done ? 'var(--neon)' : '#888', flexShrink: 0 }}>{done ? '☑' : '☐'}</span>
                  <span style={{ fontSize: '0.72rem', color: done ? '#777' : '#ccc', textDecoration: done ? 'line-through' : 'none' }}>{item}</span>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

export default function ChecklistTab() {
  const [active, setActive] = useState(0)
  const [checked, setChecked] = useState<Record<string, boolean>>(loadState)

  const { data: dbRows } = useSupabaseData('checklists', [])
  const dbChecklists = dbRows.map(dbToChecklist)
  // Only add Supabase entries not already in static (avoid empty duplicates)
  const staticNames = new Set((CHECKLISTS as Checklist[]).map(c => c.name.toLowerCase()))
  const newFromDb = dbChecklists.filter(c => !staticNames.has(c.name.toLowerCase()))
  const allLists: Checklist[] = [...(CHECKLISTS as Checklist[]), ...newFromDb]

  const toggle = (key: string) => {
    setChecked(p => {
      const next = { ...p, [key]: !p[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const resetList = (listName: string) => {
    setChecked(p => {
      const next = { ...p }
      Object.keys(next).forEach(k => { if (k.startsWith(listName + '|')) delete next[k] })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  const list = allLists[Math.min(active, allLists.length - 1)]

  return (
    <div className="checklist-layout" style={{ display: 'flex', gap: '1.5rem' }}>
      <div className="checklist-sidebar" style={{ width: '180px', flexShrink: 0 }}>
        {allLists.map((cl, i) => (
          <button key={cl.name + i} onClick={() => setActive(i)} style={{
            width: '100%', border: 'none',
            borderLeft: `2px solid ${i === active ? 'var(--neon)' : 'transparent'}`,
            color: i === active ? 'var(--neon)' : '#aaa',
            fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.5rem 0.75rem',
            textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: i === active ? 'rgba(0,0,0,0.2)' : 'none',
          }}>
            <span>{cl.icon}</span><span>{cl.name}</span>
          </button>
        ))}
      </div>

      {list && <ChecklistView list={list} checked={checked} toggle={toggle} resetList={resetList} />}
    </div>
  )
}
