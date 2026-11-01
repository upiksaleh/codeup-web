import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

function getTheme(): Theme {
  const selected = document.documentElement.dataset.theme
  return selected === 'light' || selected === 'dark'
    ? selected
    : window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  media.addEventListener('change', onChange)

  function syncStorage(event: StorageEvent) {
    if (event.key !== 'codeup-theme' && event.key !== null) return
    if (event.newValue === 'light' || event.newValue === 'dark') {
      document.documentElement.dataset.theme = event.newValue
    } else {
      delete document.documentElement.dataset.theme
    }
  }
  window.addEventListener('storage', syncStorage)

  return () => {
    observer.disconnect()
    media.removeEventListener('change', onChange)
    window.removeEventListener('storage', syncStorage)
  }
}

export function useSiteTheme() {
  return useSyncExternalStore(subscribe, getTheme, () => undefined)
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('codeup-theme', theme)
  } catch {
    // Theme changes still work when storage is unavailable.
  }
}

export function setSiteTheme(theme: Theme, origin?: { x: number; y: number }) {
  const root = document.documentElement
  if (
    !document.startViewTransition ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    applyTheme(theme)
    return
  }
  const x = origin?.x ?? window.innerWidth / 2
  const y = origin?.y ?? 0
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  root.style.setProperty('--theme-x', `${x}px`)
  root.style.setProperty('--theme-y', `${y}px`)
  root.style.setProperty('--theme-r', `${radius}px`)
  document.startViewTransition(() => applyTheme(theme))
}
