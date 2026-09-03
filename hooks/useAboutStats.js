'use client'

import useSWR from 'swr'
import { api } from '../lib/api'

/** Fetches /api/about-stats. Cached and deduped by SWR under the 'about-stats' key. */
export function useAboutStats() {
  const { data } = useSWR('about-stats', () => api.aboutStats.show())
  return data ?? null
}
