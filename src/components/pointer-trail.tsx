'use client'

import { useEffect, useRef } from 'react'

const cell = 14
const lifetime = 1100
const glyphs = '01{}[]<>/\\=+-*;:$#&|!?abcdefxyz'

// Random code characters on glow-colored cells left behind a mouse pointer, fading out.
// Draws on the canvas across its parent element; returns a cleanup function.
// Ambient mode also scatters characters across random cells while the pointer is away.
export function attachPointerTrail(canvas: HTMLCanvasElement, { ambient = false } = {}) {
  const area = canvas.parentElement
  const context = canvas.getContext('2d')
  if (!area || !context) return
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const finePointer = matchMedia('(pointer: fine)').matches
  if (!ambient && !finePointer) return

  const marks = new Map<
    string,
    { x: number; y: number; glyph: string; born: number; strength: number }
  >()
  let frame = 0

  const resize = () => {
    const ratio = devicePixelRatio
    canvas.width = area.clientWidth * ratio
    canvas.height = area.clientHeight * ratio
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
  }

  const draw = (now: number) => {
    const style = getComputedStyle(canvas)
    context.clearRect(0, 0, canvas.width, canvas.height)
    // CSS resolves the light-dark() theme colors into these properties.
    const from = style.color
    const to = style.outlineColor
    context.font = `${cell - 2}px ${style.fontFamily}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'

    for (const [key, mark] of marks) {
      const age = (now - mark.born) / lifetime
      if (age >= 1) {
        marks.delete(key)
        continue
      }
      // The cell fades first; the glyph lingers faintly, as if printed on the grid.
      if (age < 0.5) {
        context.globalAlpha = (1 - age / 0.5) * 0.85 * mark.strength
        context.fillStyle = age < 0.2 ? from : to
        context.fillRect(mark.x + 1, mark.y + 1, cell - 2, cell - 2)
      }
      context.globalAlpha = (age < 0.5 ? 1 - age * 1.4 : (1 - age) * 0.6) * mark.strength
      context.fillStyle = '#ffffff'
      context.fillText(mark.glyph, mark.x + cell / 2, mark.y + cell / 2)
    }
    frame = marks.size ? requestAnimationFrame(draw) : 0
  }

  const mark = (x: number, y: number, strength = 1) => {
    const key = `${x},${y}`
    if (marks.has(key)) return
    const glyph = glyphs[Math.floor(Math.random() * glyphs.length)]
    marks.set(key, { x, y, glyph, born: performance.now(), strength })
    if (!frame) frame = requestAnimationFrame(draw)
  }

  let hovering = false
  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    hovering = true
    const bounds = area.getBoundingClientRect()
    mark(
      Math.floor((event.clientX - bounds.left) / cell) * cell,
      Math.floor((event.clientY - bounds.top) / cell) * cell,
    )
  }
  const onLeave = () => {
    hovering = false
  }

  const scatter = () => {
    if (hovering || document.hidden) return
    const columns = Math.floor(area.clientWidth / cell)
    const rows = Math.floor(area.clientHeight / cell)
    for (let i = 0; i < 3; i++) {
      // Scattered characters stay dim so the pointer trail stands out.
      mark(
        Math.floor(Math.random() * columns) * cell,
        Math.floor(Math.random() * rows) * cell,
        0.35,
      )
    }
  }
  const timer = ambient ? setInterval(scatter, 80) : undefined

  resize()
  const observer = new ResizeObserver(resize)
  observer.observe(area)
  if (finePointer) {
    area.addEventListener('pointermove', onMove, { passive: true })
    area.addEventListener('pointerleave', onLeave)
  }
  return () => {
    clearInterval(timer)
    observer.disconnect()
    area.removeEventListener('pointermove', onMove)
    area.removeEventListener('pointerleave', onLeave)
    cancelAnimationFrame(frame)
  }
}

export function PointerTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => attachPointerTrail(canvasRef.current!), [])

  return <canvas ref={canvasRef} className="pointer-trail" aria-hidden="true" />
}
