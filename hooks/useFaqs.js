'use client'

import useSWR from 'swr'
import { api } from '../lib/api'

/** Fetches /api/faqs. Cached and deduped by SWR under the 'faqs' key. */
export function useFaqs() {
  const { data } = useSWR('faqs', () => api.faqs.list())
  return data ?? []
}
