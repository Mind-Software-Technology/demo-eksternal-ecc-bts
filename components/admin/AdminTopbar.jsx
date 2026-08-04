'use client'

import { FiExternalLink } from 'react-icons/fi'
import { useAuth } from '../../context/auth'

const fmtDate = (d) =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(d)

export default function AdminTopbar() {
  const { user } = useAuth()
  const firstName = user.name?.split(' ')[0]

  return (
    <header className="admin-topbar">
      <div>
        <p className="admin-topbar__greeting">Halo, {firstName} 👋</p>
        <p className="admin-topbar__date">{fmtDate(new Date())}</p>
      </div>
      <a href="/" target="_blank" rel="noopener" className="admin-topbar__site-link">
        Lihat Situs <FiExternalLink />
      </a>
    </header>
  )
}
