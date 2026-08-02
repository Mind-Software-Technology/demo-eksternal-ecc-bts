'use client'

import { useEffect, useState } from 'react'
import ResourceCrudPage from '../../../components/admin/ResourceCrudPage'
import { api } from '../../../lib/api'
import { formatIDR } from '../../../data/format'

export default function AdminServicesPage() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => setCategories([]))
  }, [])

  const fields = [
    { name: 'slug', label: 'Slug', required: true },
    {
      name: 'category_id',
      label: 'Kategori',
      type: 'select',
      required: true,
      options: categories.map((c) => ({ value: c.id, label: c.title })),
      getValue: (item) => item.category?.id,
    },
    { name: 'title', label: 'Judul', required: true },
    { name: 'tagline', label: 'Tagline', required: true },
    { name: 'description', label: 'Deskripsi', type: 'textarea', required: true },
    { name: 'points', label: 'Poin Layanan (satu per baris)', type: 'array' },
    { name: 'icon', label: 'Icon (nama react-icons)', required: true },
    { name: 'accent', label: 'Warna Aksen', required: true },
    { name: 'image_url', label: 'URL Gambar' },
    { name: 'image_alt', label: 'Alt Gambar' },
    { name: 'price', label: 'Harga (Rp)', type: 'number', required: true },
    { name: 'rating', label: 'Rating (0-5)', type: 'number' },
    { name: 'reviews_count', label: 'Jumlah Review', type: 'number' },
    { name: 'badge', label: 'Badge (mis. Terlaris)' },
    { name: 'sort_order', label: 'Urutan', type: 'number' },
    { name: 'is_active', label: 'Aktif', type: 'checkbox' },
    { name: 'requires_attachment', label: 'Wajib upload file saat checkout', type: 'checkbox' },
  ]

  const columns = [
    { key: 'title', label: 'Judul' },
    { key: 'category', label: 'Kategori', render: (i) => i.category?.title || '—' },
    { key: 'price', label: 'Harga', render: (i) => formatIDR(i.price) },
    { key: 'is_active', label: 'Aktif', render: (i) => (i.is_active ? 'Ya' : 'Tidak') },
  ]

  return (
    <ResourceCrudPage
      title="Layanan"
      resourceApi={api.admin.services}
      fields={fields}
      columns={columns}
      emptyItem={{ is_active: true, requires_attachment: false, rating: 5, reviews_count: 0, sort_order: 0 }}
    />
  )
}
