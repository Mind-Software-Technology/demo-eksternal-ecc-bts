'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMenu, FiX, FiShoppingCart, FiUser, FiLogOut } from 'react-icons/fi'
import { getNavItems } from '../../data/site'
import { useCart } from '../../context/cart'
import { useAuth } from '../../context/auth'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import BrandMark from './BrandMark'
import AuthModal from './AuthModal'

/** Mirrors react-router's <NavLink> active-class behavior for next/link. */
function isPathActive(pathname, href, end) {
  if (end) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [authMode, setAuthMode] = useState(null) // null | 'login' | 'register'
  const { count } = useCart()
  const { user, ready, logout } = useAuth()
  const config = useSiteConfig()
  const pathname = usePathname()

  const navItems = getNavItems(config)

  // Solidify navbar after scrolling past the hero top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the drawer/modal is open.
  useEffect(() => {
    document.body.style.overflow = open || authMode ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open, authMode])

  const cartActive = isPathActive(pathname, '/keranjang', false)

  return (
    <header className={`navbar ${scrolled ? 'navbar--solid' : 'navbar--top'}`}>
      <nav className="navbar__inner" aria-label="Navigasi utama">
        <Link href="/" aria-label="Beranda ECC-BTS">
          <BrandMark />
        </Link>

        <ul className="navbar__menu">
          {navItems.map((item) => {
            const end = item.to === '/'
            const active = isPathActive(pathname, item.to, end)
            return (
              <li key={item.to}>
                <Link
                  href={item.to}
                  className={`navbar__link ${active ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="navbar__right">
          <div className="navbar__auth navbar__cta-desktop">
            {ready && user ? (
              <>
                <span className="navbar__btn navbar__btn--login" aria-hidden="true">
                  <FiUser /> {user.name}
                </span>
                <button type="button" className="navbar__btn navbar__btn--signup" onClick={logout}>
                  <FiLogOut /> Keluar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="navbar__btn navbar__btn--login"
                  onClick={() => setAuthMode('login')}
                >
                  Login
                </button>
                <button
                  type="button"
                  className="navbar__btn navbar__btn--signup"
                  onClick={() => setAuthMode('register')}
                >
                  Daftar
                </button>
              </>
            )}
          </div>
          <Link
            href="/keranjang"
            className={`navbar__cart ${cartActive ? 'active' : ''}`}
            aria-label={`Keranjang belanja${count ? `, ${count} item` : ''}`}
          >
            <FiShoppingCart />
            {count > 0 && <span className="navbar__cart-badge">{count}</span>}
          </Link>
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
              key="overlay"
              className="drawer-overlay"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.aside
              key="drawer"
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
              {navItems.map((item) => {
                const end = item.to === '/'
                const active = isPathActive(pathname, item.to, end)
                return (
                  <Link
                    key={item.to}
                    href={item.to}
                    className={`drawer__link ${active ? 'active' : ''}`}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
              <div className="drawer__auth">
                {ready && user ? (
                  <button
                    type="button"
                    className="btn btn--outline btn--block"
                    onClick={() => {
                      setOpen(false)
                      logout()
                    }}
                  >
                    <FiLogOut /> Keluar ({user.name})
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn--outline btn--block"
                      onClick={() => {
                        setOpen(false)
                        setAuthMode('login')
                      }}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      className="btn btn--primary btn--block"
                      onClick={() => {
                        setOpen(false)
                        setAuthMode('register')
                      }}
                    >
                      Daftar
                    </button>
                  </>
                )}
              </div>
              <Link
                href="/keranjang"
                className="btn btn--outline btn--block drawer__cta"
                onClick={() => setOpen(false)}
              >
                <FiShoppingCart /> Keranjang{count > 0 ? ` (${count})` : ''}
              </Link>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {authMode && <AuthModal mode={authMode} onClose={() => setAuthMode(null)} />}
    </header>
  )
}
