import { useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * Page root wrapper: sets the document title and provides the
 * enter/exit transition used by <AnimatePresence> on route change.
 */
export default function Page({ title, children }) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (title) document.title = title
  }, [title])

  if (reduce) return <>{children}</>

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
