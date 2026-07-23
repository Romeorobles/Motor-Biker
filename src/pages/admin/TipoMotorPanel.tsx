import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createItem, deleteItem, extractErrorMessage, fetchPaginated, updateItem } from '../../services/adminService'
import './admin.css'

interface TipoMotor {
  id: string
  nombre: string
  descripcion?: string
}

const tipoMotorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
})

type TipoMotorFormData = z.infer<typeof tipoMotorSchema>

function TipoMotorPanel() {
  const [tipos, setTipos] = useState<TipoMotor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<TipoMotor | null>(null)
  const [deleting, setDeleting] = useState<TipoMotor | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TipoMotorFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tipoMotorSchema) as any,
  })

  function load() {
    setLoading(true)
    fetchPaginated<TipoMotor>('/tipo-motor', {
      page,
      limit: 10,
      search: search || undefined,
      searchField: search ? 'nombre' : undefined,
    })
      .then((res) => {
        setTipos(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los tipos de motor.')
        setLoading(false)
      })
  }

  useEffect(load, [page, search])

  function openCreate() {
    setEditing(null)
    setSubmitError(null)
    reset({ nombre: '', descripcion: '' })
    setModalOpen(true)
  }

  function openEdit(t: TipoMotor) {
    setEditing(t)
    setSubmitError(null)
    reset({ nombre: t.nombre, descripcion: t.descripcion || '' })
    setModalOpen(true)
  }

  async function onSubmit(data: TipoMotorFormData) {
    setSubmitError(null)
    try {
      if (editing) {
        await updateItem('/tipo-motor', editing.id, data, 'PUT')
      } else {
        await createItem('/tipo-motor', data)
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
      await deleteItem('/tipo-motor', deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError(extractErrorMessage(err, 'No se pudo eliminar el tipo de motor.'))
    }
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Tipo de Motor</h1>

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
          + Nuevo Tipo de Motor
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando tipos de motor...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : tipos.length === 0 ? (
          <div className="admin-empty">No hay tipos de motor registrados.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tipos.map((t) => (
                <tr key={t.id}>
                  <td>{t.nombre}</td>
                  <td>{t.descripcion || '—'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-btn-secondary" onClick={() => openEdit(t)}>
                        Editar
                      </button>
                      <button className="admin-btn-danger" onClick={() => setDeleting(t)}>
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
            <h3>{editing ? 'Editar Tipo de Motor' : 'Nuevo Tipo de Motor'}</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="admin-form-field">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" {...register('nombre')} />
                {errors.nombre && <span className="admin-form-error">{errors.nombre.message}</span>}
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
            <h3>¿Eliminar este tipo de motor?</h3>
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

export default TipoMotorPanel
