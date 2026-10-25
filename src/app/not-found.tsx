import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="page-state" lang="en">
      <h1>Page not found</h1>
      <Link href="/">Back to home</Link>
    </main>
  )
}
