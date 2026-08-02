'use client'

import ResourceCrudPage from '../../../components/admin/ResourceCrudPage'
import { api } from '../../../lib/api'

const fields = [
  { name: 'name', label: 'Nama', required: true },
  { name: 'role', label: 'Peran/Status', required: true },
  { name: 'text', label: 'Testimoni', type: 'textarea', required: true },
  { name: 'rating', label: 'Rating (0-5)', type: 'number', required: true },
  { name: 'sort_order', label: 'Urutan', type: 'number' },
]

const columns = [
  { key: 'name', label: 'Nama' },
  { key: 'role', label: 'Peran' },
  { key: 'rating', label: 'Rating' },
]

export default function AdminTestimonialsPage() {
  return (
    <ResourceCrudPage
      title="Testimoni"
      resourceApi={api.admin.testimonials}
      fields={fields}
      columns={columns}
      emptyItem={{ rating: 5, sort_order: 0 }}
    />
  )
}
