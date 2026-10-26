'use client'

import { setSiteTheme, useSiteTheme } from '@/lib/theme'
import { Icon } from './ui/icon'

export function ThemeToggle() {
  const theme = useSiteTheme()
  const label = theme
    ? `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`
    : 'Switch color theme'

  return (
    <button
      className="icon-button theme-toggle"
      type="button"
      onClick={() => setSiteTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label={label}
      title={label}
    >
      <Icon name="sun" className="theme-sun" />
      <Icon name="moon" className="theme-moon" />
    </button>
  )
}
