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

export function setSiteTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
  try {
    localStorage.setItem('codeup-theme', theme)
  } catch {
    // Theme changes still work when storage is unavailable.
  }
}
