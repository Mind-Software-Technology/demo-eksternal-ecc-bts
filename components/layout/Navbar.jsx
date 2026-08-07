'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { FiMenu, FiX, FiShoppingCart, FiLogOut, FiBell } from 'react-icons/fi'
import { getNavItems } from '../../data/site'
import { useCart } from '../../context/cart'
import { useAuth } from '../../context/auth'
import { useNotifications } from '../../context/notifications'
import { useSiteConfig } from '../../hooks/useSiteConfig'
import BrandMark from './BrandMark'
import UserMenu from './UserMenu'
import NotificationBell from './NotificationBell'

/** Mirrors react-router's <NavLink> active-class behavior for next/link. */
function isPathActive(pathname, href, end) {
  if (end) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [verifySent, setVerifySent] = useState(false)
  const { count } = useCart()
  const { user, ready, logout, resendVerification } = useAuth()
  const { unreadCount, markAllRead } = useNotifications()
  const config = useSiteConfig()
  const pathname = usePathname()

  const onResendVerification = async () => {
    try {
      await resendVerification()
      setVerifySent(true)
    } catch {
      /* silently ignore — user can retry */
    }
  }

  const navItems = getNavItems(config)

  // /login and /daftar have no dark hero behind the navbar, so the
  // transparent/white "top" styling (meant to sit over a dark hero) would
  // leave the text unreadable there. /keranjang is auth-gated and renders
  // nothing (a blank white body) until the auth check resolves or redirects
  // a guest to /login, which is the same white-text-on-white problem for a
  // moment — force the solid style on all of these routes.
  const noHeroRoute = pathname === '/login' || pathname === '/daftar' || pathname === '/keranjang'

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

  const cartActive = isPathActive(pathname, '/keranjang', false)

  return (
    <header className={`navbar ${scrolled || noHeroRoute ? 'navbar--solid' : 'navbar--top'}`}>
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
              <UserMenu />
            ) : (
              <>
                <Link href="/login" className="navbar__btn navbar__btn--login">
                  Login
                </Link>
                <Link href="/daftar" className="navbar__btn navbar__btn--signup">
                  Daftar
                </Link>
              </>
            )}
          </div>
          {ready && user && <NotificationBell />}
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
                  <>
                    <div className="drawer__user">
                      <b>{user.name}</b>
                      <span>{user.email}</span>
                    </div>
                    {!user.email_verified && (
                      <button
                        type="button"
                        className="navbar__verify-pill"
                        onClick={onResendVerification}
                        disabled={verifySent}
                      >
                        {verifySent ? 'Link terkirim' : 'Verifikasi email'}
                      </button>
                    )}
                    <Link
                      href="/profil"
                      className="drawer__link"
                      onClick={() => setOpen(false)}
                    >
                      Profil Saya
                    </Link>
                    <Link
                      href="/riwayat-pembayaran"
                      className="drawer__link"
                      onClick={() => {
                        setOpen(false)
                        markAllRead()
                      }}
                    >
                      Riwayat Pembayaran
                    </Link>
                    <Link
                      href="/riwayat-pembayaran"
                      className="drawer__link"
                      onClick={() => {
                        setOpen(false)
                        markAllRead()
                      }}
                    >
                      <FiBell /> Notifikasi{unreadCount > 0 ? ` (${unreadCount})` : ''}
                    </Link>
                    <button
                      type="button"
                      className="btn btn--outline btn--block"
                      onClick={() => {
                        setOpen(false)
                        logout()
                      }}
                    >
                      <FiLogOut /> Keluar
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="btn btn--outline btn--block"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/daftar"
                      className="btn btn--primary btn--block"
                      onClick={() => setOpen(false)}
                    >
                      Daftar
                    </Link>
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
    </header>
  )
}
