'use client'

import { useEffect, useState } from 'react'
import { SiteNavigation } from './site-navigation'
import { Icon } from './ui/icon'
import { Modal } from './ui/modal'

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const desktop = matchMedia('(min-width: 1025px)')
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
        className="icon-button mobile-menu-trigger"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Icon name="menu" />
      </button>
      {open && (
        <Modal label="Menu" className="mobile-menu-dialog" onClose={() => setOpen(false)}>
          <SiteNavigation className="mobile-navigation" onNavigate={() => setOpen(false)} />
        </Modal>
      )}
    </>
  )
}
