// @ts-nocheck
import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import PillChoice from './components/PillChoice'
import { ThemeContext } from './hooks/ThemeContext'
import './index.css'

const PILLS_VARS = {
  blue:  { '--neon': '#0088ff', '--neon-dim': '#0055cc', '--red': '#0044aa' },
  red:   { '--neon': '#ff3300', '--neon-dim': '#cc2200', '--red': '#ff0000' },
  green: { '--neon': '#00ff99', '--neon-dim': '#00cc77', '--red': '#ff3333' },
}

function applyVars(vars) {
  Object.entries(vars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v))
}

function Root() {
  const storedPill = localStorage.getItem('htb-pill')
  const storedName = localStorage.getItem('htb-intel-name')

  const [pill, setPill] = useState(storedPill || null)
  const [name, setName] = useState(storedName || null)

  // Apply stored vars immediately on mount
  if (storedPill && PILLS_VARS[storedPill]) applyVars(PILLS_VARS[storedPill])

  const handleChoose = (p, operatorName) => {
    const vars = PILLS_VARS[p.id] || PILLS_VARS.green
    applyVars(vars)
    localStorage.setItem('htb-pill', p.id)
    localStorage.setItem('htb-pill-vars', JSON.stringify(vars))
    localStorage.setItem('htb-intel-name', operatorName)
    setPill(p.id)
    setName(operatorName)
  }

  const neon = pill ? (PILLS_VARS[pill]?.['--neon'] || '#00ff99') : '#00ff99'

  if (!pill || !name) return <PillChoice onChoose={handleChoose} />

  return (
    <ThemeContext.Provider value={neon}>
      <App />
    </ThemeContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
