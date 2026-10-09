import {useLayoutEffect, useState} from 'react'
import {useMediaQuery} from './useMediaQuery'

export type Theme = 'light' | 'dark'
const key = 'portfolio-theme'
export const storedTheme = (): Theme | null => {
  try {
    const value = localStorage.getItem(key)
    return value === 'light' || value === 'dark' ? value : null
  } catch { return null }
}
export const useTheme = () => {
  const [preference, setPreference] = useState<Theme | null>(storedTheme)
  const systemDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme: Theme = preference ?? (systemDark ? 'dark' : 'light')
  useLayoutEffect(() => {
    if (preference) document.documentElement.dataset.theme = preference
    else delete document.documentElement.dataset.theme
  }, [preference])
  const change = (value: Theme | null) => {
    setPreference(value)
    try {
      if (value) localStorage.setItem(key, value)
      else localStorage.removeItem(key)
    } catch { /* The switch still works when storage is unavailable. */ }
  }
  return {theme, preference, change}
}
