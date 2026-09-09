'use client'

import useSWR from 'swr'
import { api } from '../lib/api'

/**
 * Fetches /api/services with the given params. Cached and deduped by SWR
 * under a key that includes the params, so identical calls (same category/
 * query/limit combo) across components — e.g. the homepage carousel and the
 * /produk page — share one request and one cache entry instead of each
 * mounting its own fetch. Also means navigating back to a page already
 * fetched in this session shows cached data instantly instead of blanking
 * out to a loading state again.
 */
export function useServices(params = {}) {
  const key = ['services', JSON.stringify(params)]
  const { data, error, isLoading } = useSWR(key, () => api.services.list(params))
  return { items: data?.items ?? [], loading: isLoading, error }
}

/**
 * Fetches /api/services/{slug}. Same SWR cache as useServices, keyed per
 * slug — revisiting a product detail page (or landing on one already seen
 * via a list) reuses the cached response instead of refetching.
 */
export function useService(slug) {
  const { data, error, isLoading } = useSWR(slug ? ['service', slug] : null, () => api.services.show(slug))
  return { service: data ?? null, loading: isLoading, notFound: !!error }
}
