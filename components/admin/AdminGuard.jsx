'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '../../context/auth'

/** Blocks /admin/* behind a logged-in admin session; bounces everyone else to /login. */
export default function AdminGuard({ children }) {
  const { user, ready } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!ready) return
    if (!user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`)
    } else if (user.role !== 'admin') {
      router.replace('/')
    }
  }, [ready, user, pathname, router])

  if (!ready || !user || user.role !== 'admin') {
    return <div className="admin-guard-loading">Memuat…</div>
  }

  return children
}
