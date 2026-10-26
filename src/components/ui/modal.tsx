'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon } from './icon'

export function Modal({
  label,
  className = '',
  onClose,
  children,
}: {
  label: string
  className?: string
  onClose: () => void
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current!
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.showModal()

    return () => {
      dialog.close()
      document.body.style.overflow = previousOverflow
    }
  }, [])

  return createPortal(
    <dialog
      ref={ref}
      className={`site-dialog ${className}`}
      aria-label={label}
      onClose={(event) => {
        if (!event.currentTarget.open) onClose()
      }}
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close()
      }}
    >
      <div className="dialog-content">
        {children}
        <button
          type="button"
          className="icon-button dialog-close"
          aria-label={`Close ${label.toLowerCase()}`}
          onClick={() => ref.current?.close()}
        >
          <Icon name="close" />
        </button>
      </div>
    </dialog>,
    document.body,
  )
}
