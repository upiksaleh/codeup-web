import type { ReactNode } from 'react'

type DateValueProps = {
  data?: [string, [string, { start_date?: string }][]?][]
  schema?: { name?: string }
  pageHeader?: boolean
}

// Articles show the full Published date; project cards show Start Date as month and year.
export function propertyDateValue(
  { data, schema, pageHeader }: DateValueProps,
  fallback: () => ReactNode,
) {
  const start = data?.[0]?.[1]?.[0]?.[1]?.start_date
  const name = schema?.name?.toLowerCase()
  const isPublished = pageHeader && name === 'published'
  const isStartDate = !pageHeader && name === 'start date'
  if (!start || (!isPublished && !isStartDate)) return fallback()

  const date = new Date(`${start.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return fallback()

  return (
    <time dateTime={start}>
      {isPublished
        ? date.toLocaleDateString('en-US', { dateStyle: 'long', timeZone: 'UTC' })
        : `${date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}, ${date.getUTCFullYear()}`}
    </time>
  )
}
