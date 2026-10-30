'use client'

import { createContext } from 'react'

// The server resolves the deployment URL; the browser must use the same value during hydration.
export const SiteUrlContext = createContext('')
