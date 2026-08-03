'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { FiCheckCircle } from 'react-icons/fi'
import { useCart } from '../../context/cart'

/** Transient confirmation shown when an item is added to the cart. */
export default function CartToast() {
  const { toast } = useCart()
  return (
    <AnimatePresence>
      {toast && (
        <div className="cart-toast-wrap">
          <motion.div
            className="cart-toast"
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <FiCheckCircle />
            <span>{toast}</span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
