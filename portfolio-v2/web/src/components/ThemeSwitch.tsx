import {useEffect, useId, useRef, useState} from 'react'
import type {Theme} from '../hooks/useTheme'
import './ThemeSwitch.css'

const ThemeIcon = ({value}: {value: Theme | null}) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {value === 'light' ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
      : value === 'dark' ? <path d="M20.5 14a8.5 8.5 0 0 1-10.5-10.5A8.5 8.5 0 1 0 20.5 14Z" />
      : <><rect x="3" y="4" width="18" height="13" rx="2" /><path d="M12 17v3m-4 0h8" /></>}
  </svg>
)

export const ThemeSwitch = ({preference, onChange}: {
  preference: Theme | null; onChange: (value: Theme | null) => void
}) => {
  const [open, setOpen] = useState(false)
  const controlRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!open) return
    controlRef.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]')?.focus()
    const outside = (event: PointerEvent) => {
      if (!controlRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('keydown', escape)
    }
  }, [open])

  return (
    <div className="theme-control" ref={controlRef} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
    }}>
      <button ref={triggerRef} type="button" className="theme-trigger" aria-label="Appearance"
        title={`Appearance: ${preference ?? 'system'}`} aria-expanded={open} aria-controls={menuId}
        onClick={() => setOpen(!open)}>
        <ThemeIcon value={preference} />
      </button>
      {open && <div className="theme-menu" id={menuId} role="group" aria-label="Theme options">
        {(['light', 'dark', null] as const).map((value) => (
          <button key={value ?? 'system'} type="button" className="theme-option" aria-pressed={preference === value}
            onClick={() => {
              onChange(value)
              setOpen(false)
              triggerRef.current?.focus()
            }}>
            <ThemeIcon value={value} />
            <span>{value === 'light' ? 'Light' : value === 'dark' ? 'Dark' : 'System'}</span>
            {preference === value && <span className="theme-selected" aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>}
    </div>
  )
}
