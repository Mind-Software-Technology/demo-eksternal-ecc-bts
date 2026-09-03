'use client'

import useSWR from 'swr'
import { api } from '../lib/api'

/** Fetches /api/stats. Cached and deduped by SWR under the 'stats' key. */
export function useStats() {
  const { data } = useSWR('stats', () => api.stats.list())
  return data ?? []
}
