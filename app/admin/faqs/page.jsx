'use client'

import ResourceCrudPage from '../../../components/admin/ResourceCrudPage'
import { api } from '../../../lib/api'

const fields = [
  { name: 'question', label: 'Pertanyaan', required: true },
  { name: 'answer', label: 'Jawaban', type: 'textarea', required: true },
  { name: 'sort_order', label: 'Urutan', type: 'number' },
]

const columns = [
  { key: 'question', label: 'Pertanyaan' },
  { key: 'sort_order', label: 'Urutan' },
]

export default function AdminFaqsPage() {
  return (
    <ResourceCrudPage
      title="FAQ"
      resourceApi={api.admin.faqs}
      fields={fields}
      columns={columns}
      emptyItem={{ sort_order: 0 }}
    />
  )
}
