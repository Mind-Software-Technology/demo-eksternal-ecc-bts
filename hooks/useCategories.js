'use client'

import useSWR from 'swr'
import { api } from '../lib/api'

/**
 * Fetches /api/categories. Cached and deduped by SWR under the 'categories'
 * key, so every caller (Hero, CategoryBar, /produk, /kategori, /kegiatan)
 * shares one request instead of each mounting its own fetch. Returns [] until
 * loaded (or on error).
 */
export function useCategories() {
  const { data } = useSWR('categories', () => api.categories.list())
  return data ?? []
}
