'use client'

import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'

const EMPTY = Symbol('empty')

/** Converts a stored value to the string an <input>/<textarea> can hold. */
function toFieldValue(field, value) {
  if (field.type === 'checkbox') return Boolean(value)
  if (field.type === 'array') return (value || []).join('\n')
  if (field.type === 'file') return undefined
  if (field.type === 'datetime-local') return value ? value.slice(0, 16) : ''
  return value ?? ''
}

/** Converts form state back to the shape the API expects. */
function toPayloadValue(field, value) {
  if (field.type === 'number') return value === '' ? undefined : Number(value)
  if (field.type === 'datetime-local') return value === '' ? null : value
  if (field.type === 'array') {
    return value
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  }
  return value
}

/**
 * Generic list + create/edit modal + delete for the katalog/konten admin
 * resources — they all share the same { list, create, update, remove } API
 * shape (see lib/api.js `adminCrud`), so one component drives all of them
 * off a `fields`/`columns` config instead of one bespoke page each.
 */
export default function ResourceCrudPage({ title, resourceApi, fields, columns, emptyItem, note }) {
  const [items, setItems] = useState(null)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(EMPTY) // EMPTY = closed, null = new, object = editing
  const [form, setForm] = useState({})
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState(null)

  const refresh = () => resourceApi.list().then(setItems).catch((e) => setError(e.message))
  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time fetch per mounted resource page
  }, [])

  const openCreate = () => {
    const initial = {}
    for (const f of fields) initial[f.name] = toFieldValue(f, emptyItem?.[f.name])
    setForm(initial)
    setFormError(null)
    setEditing(null)
  }

  const openEdit = (item) => {
    const initial = {}
    for (const f of fields) initial[f.name] = toFieldValue(f, f.getValue ? f.getValue(item) : item[f.name])
    setForm(initial)
    setFormError(null)
    setEditing(item)
  }

  const close = () => setEditing(EMPTY)

  const onFieldChange = (field, raw) => {
    setForm((prev) => ({ ...prev, [field.name]: raw }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setFormError(null)
    try {
      const payload = {}
      for (const f of fields) {
        if (f.type === 'file') {
          if (form[f.name] instanceof File) payload[f.name] = form[f.name]
          continue
        }
        payload[f.name] = toPayloadValue(f, form[f.name])
      }
      if (editing) await resourceApi.update(editing.id, payload)
      else await resourceApi.create(payload)
      close()
      refresh()
    } catch (err) {
      setFormError(err.message || 'Gagal menyimpan data.')
    } finally {
      setBusy(false)
    }
  }

  const onDelete = async (item) => {
    if (!window.confirm('Hapus data ini? Tindakan ini tidak bisa dibatalkan.')) return
    try {
      await resourceApi.remove(item.id)
      refresh()
    } catch (err) {
      setError(err.message || 'Gagal menghapus data.')
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1 className="admin-page-title">{title}</h1>
        <button type="button" className="btn btn--primary" onClick={openCreate}>
          <FiPlus /> Tambah
        </button>
      </div>

      {note && <p className="admin-page-note">{note}</p>}
      {error && <p className="admin-form-error">{error}</p>}

      {items === null ? (
        <p className="empty-note">Memuat data…</p>
      ) : items.length === 0 ? (
        <p className="empty-note">Belum ada data.</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th aria-label="Aksi" />
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {columns.map((c) => (
                    <td key={c.key}>{c.render ? c.render(item) : String(item[c.key] ?? '')}</td>
                  ))}
                  <td className="admin-table__actions">
                    <button type="button" onClick={() => openEdit(item)} aria-label="Edit">
                      <FiEdit2 />
                    </button>
                    <button type="button" onClick={() => onDelete(item)} aria-label="Hapus">
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== EMPTY && (
        <div className="admin-modal-overlay" onClick={close}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__head">
              <h2>{editing ? 'Edit' : 'Tambah'} {title}</h2>
              <button type="button" onClick={close} aria-label="Tutup">
                <FiX />
              </button>
            </div>

            {formError && <p className="admin-form-error">{formError}</p>}

            <form onSubmit={onSubmit}>
              {fields.map((f) => (
                <div
                  className={`field ${['textarea', 'array'].includes(f.type) ? 'field--full' : ''}`}
                  key={f.name}
                >
                  {f.type !== 'checkbox' && <label htmlFor={`f-${f.name}`}>{f.label}</label>}

                  {f.type === 'textarea' || f.type === 'array' ? (
                    <textarea
                      id={`f-${f.name}`}
                      required={f.required}
                      value={form[f.name] ?? ''}
                      onChange={(e) => onFieldChange(f, e.target.value)}
                      rows={f.type === 'array' ? 4 : 3}
                      placeholder={f.type === 'array' ? 'Satu poin per baris' : undefined}
                    />
                  ) : f.type === 'checkbox' ? (
                    <label className="admin-checkbox">
                      <input
                        id={`f-${f.name}`}
                        type="checkbox"
                        checked={Boolean(form[f.name])}
                        onChange={(e) => onFieldChange(f, e.target.checked)}
                      />
                      {f.label}
                    </label>
                  ) : f.type === 'select' ? (
                    <select
                      id={`f-${f.name}`}
                      required={f.required}
                      value={form[f.name] ?? ''}
                      onChange={(e) => onFieldChange(f, e.target.value)}
                    >
                      <option value="">— Pilih —</option>
                      {(f.options || []).map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : f.type === 'file' ? (
                    <input
                      id={`f-${f.name}`}
                      type="file"
                      accept={f.accept}
                      onChange={(e) => onFieldChange(f, e.target.files?.[0] || null)}
                    />
                  ) : (
                    <input
                      id={`f-${f.name}`}
                      type={f.type || 'text'}
                      required={f.required}
                      value={form[f.name] ?? ''}
                      onChange={(e) => onFieldChange(f, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <button type="submit" className="btn btn--primary btn--block field--full" disabled={busy}>
                {busy ? 'Menyimpan…' : 'Simpan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
