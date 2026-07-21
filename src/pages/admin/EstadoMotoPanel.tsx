import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createItem, deleteItem, fetchPaginated, updateItem } from '../../services/adminService'
import './admin.css'

interface EstadoMoto {
  id: string
  nombre: string
  descripcion?: string
}

const estadoMotoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
})

type EstadoMotoFormData = z.infer<typeof estadoMotoSchema>

function EstadoMotoPanel() {
  const [estados, setEstados] = useState<EstadoMoto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<EstadoMoto | null>(null)
  const [deleting, setDeleting] = useState<EstadoMoto | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EstadoMotoFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(estadoMotoSchema) as any,
  })

  function load() {
    setLoading(true)
    fetchPaginated<EstadoMoto>('/estado-moto', {
      page,
      limit: 10,
      search: search || undefined,
      searchField: search ? 'nombre' : undefined,
    })
      .then((res) => {
        setEstados(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los estados de moto.')
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

  function openEdit(e: EstadoMoto) {
    setEditing(e)
    setSubmitError(null)
    reset({ nombre: e.nombre, descripcion: e.descripcion || '' })
    setModalOpen(true)
  }

  async function onSubmit(data: EstadoMotoFormData) {
    setSubmitError(null)
    try {
      if (editing) {
        await updateItem('/estado-moto', editing.id, data, 'PUT')
      } else {
        await createItem('/estado-moto', data)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      console.error(err)
      setSubmitError('No se pudo guardar. Revisá los datos e intentá de nuevo.')
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteItem('/estado-moto', deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError('No se pudo eliminar el estado de moto.')
    }
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Estado de Moto</h1>

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
          + Nuevo Estado
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando estados de moto...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : estados.length === 0 ? (
          <div className="admin-empty">No hay estados de moto registrados.</div>
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
              {estados.map((e) => (
                <tr key={e.id}>
                  <td>{e.nombre}</td>
                  <td>{e.descripcion || '—'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-btn-secondary" onClick={() => openEdit(e)}>
                        Editar
                      </button>
                      <button className="admin-btn-danger" onClick={() => setDeleting(e)}>
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
            <h3>{editing ? 'Editar Estado' : 'Nuevo Estado'}</h3>
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
            <h3>¿Eliminar este estado de moto?</h3>
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

export default EstadoMotoPanel
