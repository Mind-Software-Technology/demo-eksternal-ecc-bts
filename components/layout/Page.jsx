'use client'

import { useEffect } from 'react'

/**
 * Page root wrapper: sets the document title. Enter/exit route transitions
 * are handled by <PageTransition> in the surrounding layout (App Router has
 * no single <Routes> tree to key an <AnimatePresence> off, so the transition
 * moved up a level — see components/layout/PageTransition.jsx).
 */
export default function Page({ title, children }) {
  useEffect(() => {
    if (title) document.title = title
  }, [title])

  return <>{children}</>
}
