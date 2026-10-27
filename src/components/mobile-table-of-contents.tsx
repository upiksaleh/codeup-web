'use client'

import { useEffect, useState } from 'react'
import type { TableOfContentsState } from './table-of-contents'
import { Icon } from './ui/icon'
import { Modal } from './ui/modal'

export function MobileTableOfContents({ toc }: { toc: TableOfContentsState }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const desktop = matchMedia('(min-width: 960px)')
    function closeOnDesktop() {
      if (desktop.matches) setOpen(false)
    }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  return (
    <>
      <button
        type="button"
        className="mobile-contents-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="contents" />
        Contents
      </button>
      {open && (
        <Modal
          label="Table of contents"
          className="mobile-contents-dialog"
          onClose={() => setOpen(false)}
        >
          <h2>Table of contents</h2>
          <nav aria-label="Table of contents" lang="id">
            {toc.entries.map(({ id, text, indentLevel }) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={toc.activeId === id ? 'location' : undefined}
                style={{ paddingLeft: 12 + indentLevel * 16 }}
                onClick={(event) => {
                  event.preventDefault()
                  const target = document.getElementById(id)
                  toc.select(id)
                  setOpen(false)
                  requestAnimationFrame(() => {
                    if (!target) return
                    history.pushState(null, '', `#${id}`)
                    target.tabIndex = -1
                    target.focus({ preventScroll: true })
                    target.scrollIntoView({
                      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
                        ? 'instant'
                        : 'smooth',
                    })
                  })
                }}
              >
                <span>{text}</span>
              </a>
            ))}
          </nav>
        </Modal>
      )}
    </>
  )
}
