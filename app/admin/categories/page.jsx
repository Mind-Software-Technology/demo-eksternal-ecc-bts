'use client'

import ResourceCrudPage from '../../../components/admin/ResourceCrudPage'
import { api } from '../../../lib/api'

const fields = [
  { name: 'slug', label: 'Slug', required: true },
  { name: 'title', label: 'Judul', required: true },
  { name: 'short_desc', label: 'Deskripsi Singkat', required: true },
  { name: 'description', label: 'Deskripsi', type: 'textarea', required: true },
  { name: 'icon', label: 'Icon (nama react-icons)', required: true },
  { name: 'accent', label: 'Warna Aksen', required: true },
  { name: 'sort_order', label: 'Urutan', type: 'number' },
]

const columns = [
  { key: 'sort_order', label: 'Urutan' },
  { key: 'title', label: 'Judul' },
  { key: 'slug', label: 'Slug' },
  { key: 'accent', label: 'Aksen' },
]

export default function AdminCategoriesPage() {
  return (
    <ResourceCrudPage
      title="Kategori"
      resourceApi={api.admin.categories}
      fields={fields}
      columns={columns}
      emptyItem={{ sort_order: 0 }}
    />
  )
}
