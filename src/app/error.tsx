'use client'

export default function Error({ retry }: { retry: () => void }) {
  return (
    <main className="page-state" role="alert" lang="en">
      <h1>Could not load page</h1>
      <button type="button" onClick={() => retry()}>
        Retry
      </button>
    </main>
  )
}
