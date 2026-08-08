'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FiBell } from 'react-icons/fi'
import { useNotifications } from '../../context/notifications'

/** Transient popup shown when an admin finishes pricing one of the customer's orders. */
export default function NotificationToast() {
  const { toast } = useNotifications()
  return (
    <AnimatePresence>
      {toast && (
        <div className="notif-toast-wrap">
          <motion.div
            className="notif-toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <FiBell />
            <span>{toast}</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
