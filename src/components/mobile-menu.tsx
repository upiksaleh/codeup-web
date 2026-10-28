'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { siteConfig } from '@/site.config'
import { Icon } from './ui/icon'
import { Modal } from './ui/modal'

export function MobileMenu() {
  const pathname = usePathname()
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
          <nav aria-label="Main navigation">
            {siteConfig.navigation.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className={path === siteConfig.navigationCta ? 'navigation-cta' : undefined}
                aria-current={path === pathname ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </Modal>
      )}
    </>
  )
}
