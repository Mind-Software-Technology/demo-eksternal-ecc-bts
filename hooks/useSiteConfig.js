'use client'

import { useEffect, useState } from 'react'
import { api } from '../lib/api'

/** Fetches /api/site-config once. Returns null until it's loaded (or on error, so callers can fall back to static copy). */
export function useSiteConfig() {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    api.siteConfig
      .show()
      .then(setConfig)
      .catch(() => {})
  }, [])

  return config
}
