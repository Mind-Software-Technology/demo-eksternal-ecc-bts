'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  FiGrid,
  FiLogOut,
  FiFolder,
  FiBox,
  FiMessageSquare,
  FiHelpCircle,
  FiAward,
  FiList,
  FiCalendar,
  FiSettings,
  FiShoppingBag,
  FiCreditCard,
  FiMail,
  FiChevronDown,
} from 'react-icons/fi'
import { useAuth } from '../../context/auth'

const DASHBOARD = { href: '/admin', label: 'Dashboard', icon: FiGrid, end: true }

const NAV_GROUPS = [
  {
    label: 'Katalog & Konten',
    items: [
      { href: '/admin/categories', label: 'Kategori', icon: FiFolder },
      { href: '/admin/services', label: 'Layanan', icon: FiBox },
      { href: '/admin/testimonials', label: 'Testimoni', icon: FiMessageSquare },
      { href: '/admin/faqs', label: 'FAQ', icon: FiHelpCircle },
      { href: '/admin/advantages', label: 'Keunggulan', icon: FiAward },
      { href: '/admin/process-steps', label: 'Alur Proses', icon: FiList },
      { href: '/admin/events', label: 'Kegiatan', icon: FiCalendar },
      { href: '/admin/site-config', label: 'Konfigurasi Situs', icon: FiSettings },
    ],
  },
  {
    label: 'Transaksi',
    items: [
      { href: '/admin/orders', label: 'Pesanan', icon: FiShoppingBag },
      { href: '/admin/payments', label: 'Pembayaran', icon: FiCreditCard },
      { href: '/admin/contact-messages', label: 'Pesan Kontak', icon: FiMail },
    ],
  },
]

const isActive = (pathname, href, end) => (end ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))

function activeGroupLabel(pathname) {
  return NAV_GROUPS.find((g) => g.items.some((i) => isActive(pathname, i.href)))?.label
}

export default function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [openGroups, setOpenGroups] = useState(() => new Set([activeGroupLabel(pathname)].filter(Boolean)))

  // Keep whichever group holds the current page expanded, without collapsing groups the user opened manually.
  useEffect(() => {
    const label = activeGroupLabel(pathname)
    if (!label) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- expand the group containing the newly-navigated page
    setOpenGroups((prev) => (prev.has(label) ? prev : new Set(prev).add(label)))
  }, [pathname])

  const toggleGroup = (label) => {
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(label)) next.delete(label)
      else next.add(label)
      return next
    })
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__brand">ECC Admin</div>

      <nav className="admin-sidebar__nav">
        <Link
          href={DASHBOARD.href}
          className={`admin-sidebar__link ${isActive(pathname, DASHBOARD.href, DASHBOARD.end) ? 'active' : ''}`}
        >
          <DASHBOARD.icon /> {DASHBOARD.label}
        </Link>

        {NAV_GROUPS.map((group) => {
          const open = openGroups.has(group.label)
          return (
            <div className="admin-sidebar__group" key={group.label}>
              <button
                type="button"
                className="admin-sidebar__group-head"
                onClick={() => toggleGroup(group.label)}
                aria-expanded={open}
              >
                {group.label}
                <FiChevronDown className={`admin-sidebar__chevron ${open ? 'open' : ''}`} />
              </button>

              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {group.items.map(({ href, label, icon: Icon }) => (
                      <Link key={href} href={href} className={`admin-sidebar__link ${isActive(pathname, href) ? 'active' : ''}`}>
                        <Icon /> {label}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </nav>

      <div className="admin-sidebar__user">
        <div>
          <b>{user.name}</b>
          <span>{user.email}</span>
        </div>
        <button type="button" onClick={logout} aria-label="Keluar">
          <FiLogOut />
        </button>
      </div>
    </aside>
  )
}
