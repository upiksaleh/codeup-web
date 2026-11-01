import Link from 'next/link'
import type { ComponentProps } from 'react'

// react-notion-x 8 renders page links as plain anchors; route them client-side.
export function NotionPageLink({ href = '', ...props }: ComponentProps<'a'>) {
  return <Link href={href} {...props} />
}
