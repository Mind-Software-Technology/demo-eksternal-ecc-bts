'use client'

import useSWR from 'swr'
import { api } from '../lib/api'

/**
 * Fetches /api/site-config. Cached and deduped by SWR under the 'site-config'
 * key, so every caller (Navbar, Hero, Footer, ...) shares one request instead
 * of each mounting its own fetch. Returns null until it's loaded (or on
 * error, so callers can fall back to static copy).
 */
export function useSiteConfig() {
  const { data } = useSWR('site-config', () => api.siteConfig.show())
  return data ?? null
}
