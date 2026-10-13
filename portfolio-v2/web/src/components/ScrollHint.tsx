import type {ReactNode} from 'react'
import './ScrollHint.css'

export const ScrollHint = ({children, className = '', id, direction = 'down', onClick}: {
  children: ReactNode
  className?: string
  id?: string
  direction?: 'up' | 'down'
  onClick?: () => void
}) => {
  const props = {id, className: `scroll-hint scroll-hint--${direction} ${className}`}
  const content = <>
    <span className="scroll-hint-arrow" aria-hidden="true">{direction === 'up' ? '↑' : '↓'}</span>
    <span>{children}</span>
  </>
  return onClick
    ? <button type="button" {...props} onClick={onClick}>{content}</button>
    : <p {...props}>{content}</p>
}
