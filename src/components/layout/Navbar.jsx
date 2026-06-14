import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMenu, FiX, FiShoppingCart } from 'react-icons/fi'
import { site } from '../../data/site'
import { useCart } from '../../context/cart'
import BrandMark from './BrandMark'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { count } = useCart()

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
          {/* Demo-only auth buttons (no action). */}
          <div className="navbar__auth navbar__cta-desktop">
            <button type="button" className="navbar__btn navbar__btn--login">
              Login
            </button>
            <button type="button" className="navbar__btn navbar__btn--signup">
              Daftar
            </button>
          </div>
          <NavLink
            to="/keranjang"
            className="navbar__cart"
            aria-label={`Keranjang belanja${count ? `, ${count} item` : ''}`}
          >
            <FiShoppingCart />
            {count > 0 && <span className="navbar__cart-badge">{count}</span>}
          </NavLink>
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
              <div className="drawer__auth">
                <button
                  type="button"
                  className="btn btn--outline btn--block"
                  onClick={() => setOpen(false)}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="btn btn--blue btn--block"
                  onClick={() => setOpen(false)}
                >
                  Daftar
                </button>
              </div>
              <NavLink
                to="/keranjang"
                className="btn btn--outline btn--block drawer__cta"
                onClick={() => setOpen(false)}
              >
                <FiShoppingCart /> Keranjang{count > 0 ? ` (${count})` : ''}
              </NavLink>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
