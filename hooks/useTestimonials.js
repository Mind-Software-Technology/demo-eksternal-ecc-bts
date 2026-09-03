'use client'

import useSWR from 'swr'
import { api } from '../lib/api'

/** Fetches /api/testimonials. Cached and deduped by SWR under the 'testimonials' key. */
export function useTestimonials() {
  const { data } = useSWR('testimonials', () => api.testimonials.list())
  return data ?? []
}
