'use client'

import { useState, useSyncExternalStore } from 'react'
import { CopyButton } from './copy-button'
import { Icon } from './ui/icon'

const coarsePointer = '(pointer: coarse)'

function subscribeToPointer(onChange: () => void) {
  const query = matchMedia(coarsePointer)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

// Touch devices get the system share sheet, which reaches chat apps directly.
function hasNativeShare() {
  return typeof navigator.share === 'function' && matchMedia(coarsePointer).matches
}

export function EntryShare({
  kind,
  url,
  title,
}: {
  kind: 'article' | 'project'
  url: string
  title: string
}) {
  const canShareNatively = useSyncExternalStore(subscribeToPointer, hasNativeShare, () => false)
  const [shareFailed, setShareFailed] = useState(false)
  const nativeShare = canShareNatively && !shareFailed

  const encodedUrl = encodeURIComponent(url)
  const targets = [
    {
      label: 'Facebook',
      icon: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      label: 'X',
      icon: 'x',
      href: `https://x.com/intent/post?url=${encodedUrl}&text=${encodeURIComponent(title)}`,
    },
    {
      label: 'LinkedIn',
      icon: 'linkedin',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ] as const

  return (
    <footer className="entry-share">
      <span>Share this {kind}</span>
      {nativeShare ? (
        <button
          type="button"
          className="entry-share-native"
          onClick={async () => {
            try {
              await navigator.share({ title, url })
            } catch (error) {
              // Dismissing the sheet aborts; any other failure falls back to the links.
              if (!(error instanceof DOMException && error.name === 'AbortError')) {
                setShareFailed(true)
              }
            }
          }}
        >
          <Icon name="share" width={16} height={16} />
          Share
        </button>
      ) : (
        <div className="entry-share-links">
          <CopyButton value={url} label="Copy link" icon="link" />
          {targets.map(({ label, icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Share on ${label}`}
              title={`Share on ${label}`}
            >
              <Icon name={icon} width={16} height={16} />
            </a>
          ))}
        </div>
      )}
    </footer>
  )
}
