'use client'

export function ThemeToggle() {
  function toggleTheme() {
    const root = document.documentElement
    const isDark =
      root.dataset.theme === 'dark' ||
      (!root.dataset.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const theme = isDark ? 'light' : 'dark'

    root.dataset.theme = theme

    try {
      localStorage.setItem('codeup-theme', theme)
    } catch {
      // The selected theme still works when browser storage is unavailable.
    }
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label="Switch color theme"
    >
      <svg
        viewBox="0 0 24 24"
        width="19"
        height="19"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6.5 6.5 0 1 0 9 9 9 9 0 1 1-9-9Z" />
        <path d="M17 3v2m4 2h-2m-1-3 1.5-1.5" />
      </svg>
    </button>
  )
}
