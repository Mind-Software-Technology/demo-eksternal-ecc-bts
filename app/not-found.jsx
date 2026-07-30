'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/** Unknown routes redirect home, mirroring the old catch-all <Navigate to="/" />. */
export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/')
  }, [router])

  return null
}
