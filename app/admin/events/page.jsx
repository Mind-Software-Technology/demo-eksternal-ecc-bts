'use client'

import { useEffect, useState } from 'react'
import ResourceCrudPage from '../../../components/admin/ResourceCrudPage'
import { api } from '../../../lib/api'
import { formatEventDate } from '../../../data/format'

export default function AdminEventsPage() {
  const [categories, setCategories] = useState([])

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => setCategories([]))
  }, [])

  const fields = [
    {
      name: 'category_id',
      label: 'Kategori (opsional)',
      type: 'select',
      options: categories.map((c) => ({ value: c.id, label: c.title })),
      getValue: (item) => item.category?.id,
    },
    { name: 'title', label: 'Judul', required: true },
    { name: 'description', label: 'Deskripsi', type: 'textarea' },
    { name: 'flyer', label: 'Flyer (gambar, biarkan kosong jika tidak diganti)', type: 'file', accept: 'image/*' },
    { name: 'location', label: 'Lokasi' },
    { name: 'starts_at', label: 'Mulai', type: 'datetime-local' },
    { name: 'ends_at', label: 'Selesai', type: 'datetime-local' },
    { name: 'is_active', label: 'Tampilkan di beranda', type: 'checkbox' },
  ]

  const columns = [
    { key: 'title', label: 'Judul' },
    { key: 'starts_at', label: 'Mulai', render: (i) => formatEventDate(i.starts_at) || '—' },
    { key: 'is_active', label: 'Aktif', render: (i) => (i.is_active ? 'Ya' : 'Tidak') },
  ]

  return (
    <ResourceCrudPage
      title="Kegiatan"
      resourceApi={api.admin.events}
      fields={fields}
      columns={columns}
      emptyItem={{ is_active: true }}
      note="Flyer disimpan sebagai gambar publik — jangan unggah dokumen rahasia di sini."
    />
  )
}
