'use client'

import useSWR from 'swr'
import { api } from '../lib/api'

/** Fetches /api/process-steps. Cached and deduped by SWR under the 'process-steps' key. */
export function useProcessSteps() {
  const { data } = useSWR('process-steps', () => api.processSteps.list())
  return data ?? []
}
