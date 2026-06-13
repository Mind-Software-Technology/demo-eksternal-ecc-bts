import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa6'
import { site, waLink } from '../../data/site'
import BrandMark from './BrandMark'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  // Solidify navbar after scrolling past the hero top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header className={`navbar ${scrolled ? 'navbar--solid' : 'navbar--top'}`}>
      <nav className="navbar__inner" aria-label="Navigasi utama">
        <NavLink to="/" aria-label="Beranda ECC-BTS">
          <BrandMark />
        </NavLink>

        <ul className="navbar__menu">
          {site.nav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} end={item.to === '/'} className="navbar__link">
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar__right">
          <a
            href={waLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn--wa navbar__cta-desktop"
          >
            <FaWhatsapp /> Hubungi Kami
          </a>
          <button
            type="button"
            className="navbar__toggle"
            aria-label="Buka menu"
            aria-expanded={open}
            onClick={() => setOpen(true)}
          >
            <FiMenu />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="drawer-overlay"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              className="drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
            >
              <div className="drawer__head">
                <BrandMark />
                <button
                  type="button"
                  className="drawer__close"
                  aria-label="Tutup menu"
                  onClick={() => setOpen(false)}
                >
                  <FiX />
                </button>
              </div>
              {site.nav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className="drawer__link"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </NavLink>
              ))}
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--wa btn--block drawer__cta"
              >
                <FaWhatsapp /> Hubungi via WhatsApp
              </a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
