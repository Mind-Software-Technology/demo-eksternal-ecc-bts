'use client'

import ResourceCrudPage from '../../../components/admin/ResourceCrudPage'
import { api } from '../../../lib/api'

const fields = [
  { name: 'icon', label: 'Icon (nama react-icons)', required: true },
  { name: 'title', label: 'Judul', required: true },
  { name: 'description', label: 'Deskripsi', type: 'textarea', required: true },
  { name: 'sort_order', label: 'Urutan', type: 'number' },
]

const columns = [
  { key: 'title', label: 'Judul' },
  { key: 'icon', label: 'Icon' },
  { key: 'sort_order', label: 'Urutan' },
]

export default function AdminAdvantagesPage() {
  return (
    <ResourceCrudPage
      title="Keunggulan"
      resourceApi={api.admin.advantages}
      fields={fields}
      columns={columns}
      emptyItem={{ sort_order: 0 }}
    />
  )
}
