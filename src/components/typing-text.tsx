'use client'

import { useEffect, useState } from 'react'

// Types the text once with a blinking block cursor; screen readers get the full text.
export function TypingText({ text, className }: { text: string; className?: string }) {
  const [length, setLength] = useState(0)

  useEffect(() => {
    // Reduced motion shows the whole text on the first tick.
    const step = matchMedia('(prefers-reduced-motion: reduce)').matches ? text.length : 1
    const timer = setInterval(() => {
      setLength((current) => {
        if (current + step >= text.length) clearInterval(timer)
        return Math.min(current + step, text.length)
      })
    }, 45)
    return () => clearInterval(timer)
  }, [text])

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, length)}
        <span className="typing-cursor">▌</span>
      </span>
    </span>
  )
}
