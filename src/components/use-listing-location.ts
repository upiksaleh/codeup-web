'use client'

import { useSyncExternalStore } from 'react'

const changeEvent = 'codeup:listing-location'

function subscribe(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(changeEvent, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(changeEvent, onChange)
  }
}

// Keep the initial gallery prerendered; URL filters take over after hydration.
export function useListingLocation() {
  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => '',
  )

  return {
    params: new URLSearchParams(search),
    navigate(href: string, replace = false) {
      if (href === `${location.pathname}${location.search}`) return
      if (replace) history.replaceState(null, '', href)
      else history.pushState(null, '', href)
      window.dispatchEvent(new Event(changeEvent))
    },
  }
}
