import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createItem, deleteItem, fetchPaginated, updateItem } from '../../services/adminService'
import './admin.css'

interface Proveedor {
  id: string
  nombre: string
  pais: string
  contacto: string
  telefono?: string
  email?: string
  activo?: boolean
}

const proveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  pais: z.string().min(1, 'El país es obligatorio'),
  contacto: z.string().min(1, 'El contacto es obligatorio'),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  activo: z.boolean().optional(),
})

type ProveedorFormData = z.infer<typeof proveedorSchema>

function ProveedoresPanel() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Proveedor | null>(null)
  const [deleting, setDeleting] = useState<Proveedor | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProveedorFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(proveedorSchema) as any,
    defaultValues: { activo: true },
  })

  function load() {
    setLoading(true)
    fetchPaginated<Proveedor>('/proveedores', {
      page,
      limit: 10,
      search: search || undefined,
      searchField: search ? 'nombre' : undefined,
    })
      .then((res) => {
        setProveedores(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los proveedores.')
        setLoading(false)
      })
  }

  useEffect(load, [page, search])

  function openCreate() {
    setEditing(null)
    setSubmitError(null)
    reset({ nombre: '', pais: '', contacto: '', telefono: '', email: '', activo: true })
    setModalOpen(true)
  }

  function openEdit(p: Proveedor) {
    setEditing(p)
    setSubmitError(null)
    reset({
      nombre: p.nombre,
      pais: p.pais,
      contacto: p.contacto,
      telefono: p.telefono || '',
      email: p.email || '',
      activo: p.activo ?? true,
    })
    setModalOpen(true)
  }

  async function onSubmit(data: ProveedorFormData) {
    setSubmitError(null)
    try {
      const payload = { ...data, email: data.email || undefined }
      if (editing) {
        await updateItem('/proveedores', editing.id, payload, 'PATCH')
      } else {
        await createItem('/proveedores', payload)
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
      await deleteItem('/proveedores', deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError('No se pudo eliminar el proveedor.')
    }
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Proveedores</h1>

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
          + Nuevo Proveedor
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando proveedores...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : proveedores.length === 0 ? (
          <div className="admin-empty">No hay proveedores registrados.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>País</th>
                <th>Contacto</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Activo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id}>
                  <td>{p.nombre}</td>
                  <td>{p.pais}</td>
                  <td>{p.contacto}</td>
                  <td>{p.telefono || '—'}</td>
                  <td>{p.email || '—'}</td>
                  <td>{p.activo ? 'Sí' : 'No'}</td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-btn-secondary" onClick={() => openEdit(p)}>
                        Editar
                      </button>
                      <button className="admin-btn-danger" onClick={() => setDeleting(p)}>
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
            <h3>{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
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

              <div className="admin-form-field">
                <label htmlFor="contacto">Contacto</label>
                <input id="contacto" {...register('contacto')} />
                {errors.contacto && <span className="admin-form-error">{errors.contacto.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="telefono">Teléfono</label>
                <input id="telefono" {...register('telefono')} />
              </div>

              <div className="admin-form-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" {...register('email')} />
                {errors.email && <span className="admin-form-error">{errors.email.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="activo">
                  <input id="activo" type="checkbox" {...register('activo')} /> Activo
                </label>
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
            <h3>¿Eliminar este proveedor?</h3>
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

export default ProveedoresPanel
