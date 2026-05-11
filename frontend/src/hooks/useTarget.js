import { useState, useCallback } from 'react'

// Global target state — shared across the app via context or prop drilling
export function useTarget() {
  const [target, setTarget] = useState({
    TARGET_IP: '',
    TARGET_DOMAIN: '',
    USERNAME: '',
    PASSWORD: '',
    PIVOT_IP: '',
  })

  const inject = useCallback((command) => {
    if (!command) return command
    return Object.entries(target).reduce(
      (cmd, [key, val]) => (val ? cmd.replaceAll(`{${key}}`, val) : cmd),
      command
    )
  }, [target])

  return { target, setTarget, inject }
}
