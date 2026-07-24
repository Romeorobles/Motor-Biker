import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createItem, deleteItem, extractErrorMessage, fetchPaginated, updateItem } from '../../services/adminService'
import './admin.css'

interface Marca {
  id: string
  nombre: string
  pais: string
}

const marcaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  pais: z.string().min(1, 'El país es obligatorio'),
})

type MarcaFormData = z.infer<typeof marcaSchema>

function MarcasPanel() {
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Marca | null>(null)
  const [deleting, setDeleting] = useState<Marca | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MarcaFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(marcaSchema) as any,
  })

  function load() {
    setLoading(true)
    fetchPaginated<Marca>('/marcas', {
      page,
      limit: 10,
      search: search || undefined,
      searchField: search ? 'nombre' : undefined,
    })
      .then((res) => {
        setMarcas(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar las marcas.')
        setLoading(false)
      })
  }

  useEffect(load, [page, search])

  function openCreate() {
    setEditing(null)
    setSubmitError(null)
    reset({ nombre: '', pais: '' })
    setModalOpen(true)
  }

  function openEdit(m: Marca) {
    setEditing(m)
    setSubmitError(null)
    reset({ nombre: m.nombre, pais: m.pais })
    setModalOpen(true)
  }

  async function onSubmit(data: MarcaFormData) {
    setSubmitError(null)
    try {
      if (editing) {
        await updateItem('/marcas', editing.id, data, 'PUT')
      } else {
        await createItem('/marcas', data)
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
      await deleteItem('/marcas', deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError(extractErrorMessage(err, 'No se pudo eliminar la marca.'))
    }
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Marcas</h1>

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
          + Nueva Marca
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando marcas...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : marcas.length === 0 ? (
          <div className="admin-empty">No hay marcas registradas.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>País</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((m) => (
                <tr key={m.id}>
                  <td>{m.nombre}</td>
                  <td>{m.pais}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-btn-secondary" onClick={() => openEdit(m)}>
                        Editar
                      </button>
                      <button className="admin-btn-danger" onClick={() => setDeleting(m)}>
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
            <h3>{editing ? 'Editar Marca' : 'Nueva Marca'}</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="admin-form-field">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" {...register('nombre')} />
                {errors.nombre && <span className="admin-form-error">{errors.nombre.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="pais">País</label>
                <input id="pais" {...register('pais')} />
                {errors.pais && <span className="admin-form-error">{errors.pais.message}</span>}
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
            <h3>¿Eliminar esta marca?</h3>
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

export default MarcasPanel
