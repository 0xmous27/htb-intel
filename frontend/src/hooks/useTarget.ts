import { useState, useCallback } from 'react'

export interface TargetState {
  TARGET_IP: string
  TARGET_DOMAIN: string
  USERNAME: string
  PASSWORD: string
  PIVOT_IP: string
}

export function useTarget() {
  const [target, setTarget] = useState<TargetState>({
    TARGET_IP: '',
    TARGET_DOMAIN: '',
    USERNAME: '',
    PASSWORD: '',
    PIVOT_IP: '',
  })

  const inject = useCallback((command: string) => {
    if (!command) return command
    return Object.entries(target).reduce(
      (cmd, [key, val]) => (val ? cmd.replaceAll(`{${key}}`, val) : cmd),
      command
    )
  }, [target])

  return { target, setTarget, inject }
}
