import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createItem, deleteItem, extractErrorMessage, fetchPaginated, updateItem } from '../../services/adminService'
import './admin.css'

interface Color {
  id: string
  nombre: string
  codigo_hex?: string
  descripcion?: string
}

const colorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  codigo_hex: z
    .string()
    .regex(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, 'Debe ser un código hexadecimal válido (ej: #FF0000)')
    .optional()
    .or(z.literal('')),
  descripcion: z.string().optional(),
})

type ColorFormData = z.infer<typeof colorSchema>

function ColoresPanel() {
  const [colores, setColores] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Color | null>(null)
  const [deleting, setDeleting] = useState<Color | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ColorFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(colorSchema) as any,
  })

  function load() {
    setLoading(true)
    fetchPaginated<Color>('/colores', {
      page,
      limit: 10,
      search: search || undefined,
      searchField: search ? 'nombre' : undefined,
    })
      .then((res) => {
        setColores(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los colores.')
        setLoading(false)
      })
  }

  useEffect(load, [page, search])

  function openCreate() {
    setEditing(null)
    setSubmitError(null)
    reset({ nombre: '', codigo_hex: '', descripcion: '' })
    setModalOpen(true)
  }

  function openEdit(c: Color) {
    setEditing(c)
    setSubmitError(null)
    reset({ nombre: c.nombre, codigo_hex: c.codigo_hex || '', descripcion: c.descripcion || '' })
    setModalOpen(true)
  }

  async function onSubmit(data: ColorFormData) {
    setSubmitError(null)
    try {
      const payload = { ...data, codigo_hex: data.codigo_hex || undefined }
      if (editing) {
        await updateItem('/colores', editing.id, payload, 'PATCH')
      } else {
        await createItem('/colores', payload)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      console.error(err)
      setSubmitError(extractErrorMessage(err, 'No se pudo guardar. Revisá los datos e intentá de nuevo.'))
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteItem('/colores', deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError(extractErrorMessage(err, 'No se pudo eliminar el color.'))
    }
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Colores</h1>

      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
        />
        <button className="admin-btn-primary" onClick={openCreate}>
          + Nuevo Color
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando colores...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : colores.length === 0 ? (
          <div className="admin-empty">No hay colores registrados.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Código Hex</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {colores.map((c) => (
                <tr key={c.id}>
                  <td>{c.nombre}</td>
                  <td>
                    {c.codigo_hex ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span
                          style={{
                            display: 'inline-block',
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            background: c.codigo_hex,
                            border: '1px solid var(--text-secondary)',
                          }}
                        />
                        {c.codigo_hex}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{c.descripcion || '—'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-btn-secondary" onClick={() => openEdit(c)}>
                        Editar
                      </button>
                      <button className="admin-btn-danger" onClick={() => setDeleting(c)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && !error && totalPages > 1 && (
          <div className="admin-pagination">
            <button className="admin-btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              className="admin-btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </button>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? 'Editar Color' : 'Nuevo Color'}</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="admin-form-field">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" {...register('nombre')} />
                {errors.nombre && <span className="admin-form-error">{errors.nombre.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="codigo_hex">Código Hex</label>
                <input id="codigo_hex" placeholder="#FF0000" {...register('codigo_hex')} />
                {errors.codigo_hex && <span className="admin-form-error">{errors.codigo_hex.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="descripcion">Descripción</label>
                <input id="descripcion" {...register('descripcion')} />
              </div>

              {submitError && <span className="admin-form-error">{submitError}</span>}
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn-secondary" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="admin-btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleting && (
        <div className="admin-modal-backdrop" onClick={() => setDeleting(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar este color?</h3>
            <p style={{ color: 'var(--text-secondary)' }}>Esta acción no se puede deshacer.</p>
            <div className="admin-modal-actions">
              <button className="admin-btn-secondary" onClick={() => setDeleting(null)}>
                Cancelar
              </button>
              <button className="admin-btn-danger" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ColoresPanel
