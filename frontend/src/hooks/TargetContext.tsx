import { createContext, useContext, ReactNode } from 'react'
import { useTarget } from './useTarget'

type TargetContextType = ReturnType<typeof useTarget>

const TargetCtx = createContext<TargetContextType | null>(null)

export function TargetProvider({ children }: { children: ReactNode }) {
  const value = useTarget()
  return <TargetCtx.Provider value={value}>{children}</TargetCtx.Provider>
}

export const useTargetCtx = () => useContext(TargetCtx)!
