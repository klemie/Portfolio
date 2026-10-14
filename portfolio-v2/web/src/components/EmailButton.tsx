import {useEffect, useState} from 'react'
import './EmailButton.css'

export const EmailButton = ({email}: {email: string}) => {
  const address = email.trim()
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  useEffect(() => {
    if (status === 'idle') return
    const timer = window.setTimeout(() => setStatus('idle'), 2000)
    return () => window.clearTimeout(timer)
  }, [status])

  const copy = async () => {
    setStatus('idle')
    try {
      await navigator.clipboard.writeText(address)
      setStatus('copied')
    } catch {
      setStatus('error')
    }
  }

  return <button type="button" className="email-button" onClick={copy}
    aria-label={`Copy email address: ${address}`} title={address}>
    <span aria-live="polite">{status === 'copied' ? 'Copied' : status === 'error' ? 'Copy failed' : 'Email'}</span>
  </button>
}
