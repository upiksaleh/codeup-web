'use client'

import { useEffect, useState } from 'react'
import { Icon } from './ui/icon'

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  useEffect(() => {
    if (status === 'idle') return
    const timeout = window.setTimeout(() => setStatus('idle'), 2_000)
    return () => window.clearTimeout(timeout)
  }, [status])

  return (
    <button
      type="button"
      className="copy-button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value)
          setStatus('copied')
        } catch {
          setStatus('failed')
        }
      }}
    >
      <Icon name={status === 'copied' ? 'check' : 'copy'} width={16} height={16} />
      <span aria-live="polite">
        {status === 'copied' ? 'Copied' : status === 'failed' ? 'Copy failed' : label}
      </span>
    </button>
  )
}
