import { createContext, useContext } from 'react'

export const ThemeContext = createContext('#00ff99')
export const useNeon = () => useContext(ThemeContext)
