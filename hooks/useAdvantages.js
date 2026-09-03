'use client'

import useSWR from 'swr'
import { api } from '../lib/api'

/** Fetches /api/advantages. Cached and deduped by SWR under the 'advantages' key. */
export function useAdvantages() {
  const { data } = useSWR('advantages', () => api.advantages.list())
  return data ?? []
}
