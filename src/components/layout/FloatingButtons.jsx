import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FaWhatsapp } from 'react-icons/fa6'
import { FiArrowUp } from 'react-icons/fi'
import { waLink } from '../../data/site'

/** Persistent floating WhatsApp button + back-to-top button. */
export default function FloatingButtons() {
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 480)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <AnimatePresence>
        {showTop && (
          <motion.button
            type="button"
            className="fab-top"
            aria-label="Kembali ke atas"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
          >
            <FiArrowUp />
          </motion.button>
        )}
      </AnimatePresence>

      <a
        href={waLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="fab-wa"
        aria-label="Hubungi via WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </>
  )
}
