'use client'

import ResourceCrudPage from '../../../components/admin/ResourceCrudPage'
import { api } from '../../../lib/api'

const fields = [
  { name: 'step_number', label: 'Nomor Langkah', type: 'number', required: true },
  { name: 'icon', label: 'Icon (nama react-icons)', required: true },
  { name: 'title', label: 'Judul', required: true },
  { name: 'description', label: 'Deskripsi', type: 'textarea', required: true },
  { name: 'sort_order', label: 'Urutan', type: 'number' },
]

const columns = [
  { key: 'step_number', label: 'No.' },
  { key: 'title', label: 'Judul' },
  { key: 'sort_order', label: 'Urutan' },
]

export default function AdminProcessStepsPage() {
  return (
    <ResourceCrudPage
      title="Alur Proses"
      resourceApi={api.admin.processSteps}
      fields={fields}
      columns={columns}
      emptyItem={{ sort_order: 0 }}
    />
  )
}
