import { createContext, useContext } from 'react'
import { useTarget } from '../hooks/useTarget'

const TargetCtx = createContext(null)

export function TargetProvider({ children }) {
  const value = useTarget()
  return <TargetCtx.Provider value={value}>{children}</TargetCtx.Provider>
}

export const useTargetCtx = () => useContext(TargetCtx)
