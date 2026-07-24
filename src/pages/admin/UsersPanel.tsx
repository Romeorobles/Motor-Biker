import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createItem, deleteItem, fetchPaginated, updateItem } from '../../services/adminService'
import './admin.css'

export interface AdminUser {
  id: string
  username: string
  email: string
  role: string
  isActive: boolean
  nombre?: string
  apellido?: string
}

const userSchema = z.object({
  username: z.string().min(1, 'El usuario es obligatorio'),
  email: z.string().email('Email inválido'),
  password: z.preprocess((v) => (v === '' ? undefined : v), z.string().min(6, 'Mínimo 6 caracteres').optional()),
  nombre: z.string().optional(),
  apellido: z.string().optional(),
  role: z.enum(['ADMIN', 'USER']).optional(),
  isActive: z.boolean().optional(),
})

type UserFormData = z.infer<typeof userSchema>

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState<AdminUser | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(userSchema) as any,
  })

  function load() {
    setLoading(true)
    fetchPaginated<AdminUser>('/users', {
      page,
      limit: 10,
      search: search || undefined,
      searchField: search ? 'username' : undefined,
    })
      .then((res) => {
        setUsers(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar los usuarios.')
        setLoading(false)
      })
  }

  useEffect(load, [page, search])

  function openCreate() {
    setEditing(null)
    setSubmitError(null)
    reset({ username: '', email: '', password: '', nombre: '', apellido: '', role: 'USER', isActive: true })
    setModalOpen(true)
  }

  function openEdit(u: AdminUser) {
    setEditing(u)
    setSubmitError(null)
    reset({
      username: u.username,
      email: u.email,
      password: '',
      nombre: u.nombre || '',
      apellido: u.apellido || '',
      role: u.role as 'ADMIN' | 'USER',
      isActive: u.isActive,
    })
    setModalOpen(true)
  }

  async function onSubmit(data: UserFormData) {
    setSubmitError(null)

    if (!editing && !data.password) {
      setSubmitError('La contraseña es obligatoria para crear un usuario.')
      return
    }

    try {
      if (editing) {
        const payload = { ...data }
        if (!payload.password) delete payload.password
        await updateItem('/users', editing.id, payload, 'PUT')
      } else {
        await createItem('/users', data)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      console.error(err)
      setSubmitError('No se pudo guardar el usuario. Revisá los datos e intentá de nuevo.')
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteItem('/users', deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError('No se pudo eliminar el usuario.')
    }
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Usuarios</h1>

      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          placeholder="Buscar por usuario..."
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
        />
        <button className="admin-btn-primary" onClick={openCreate}>
          + Nuevo Usuario
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando usuarios...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : users.length === 0 ? (
          <div className="admin-empty">No hay usuarios que coincidan con la búsqueda.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{[u.nombre, u.apellido].filter(Boolean).join(' ') || '—'}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`admin-badge ${u.isActive ? 'admin-badge-success' : 'admin-badge-danger'}`}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-btn-secondary" onClick={() => openEdit(u)}>
                        Editar
                      </button>
                      <button className="admin-btn-danger" onClick={() => setDeleting(u)}>
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
            <button
              className="admin-btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
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
            <h3>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="admin-form-field">
                <label htmlFor="username">Usuario</label>
                <input id="username" {...register('username')} />
                {errors.username && <span className="admin-form-error">{errors.username.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" {...register('email')} />
                {errors.email && <span className="admin-form-error">{errors.email.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="password">{editing ? 'Nueva Contraseña (opcional)' : 'Contraseña'}</label>
                <input id="password" type="password" {...register('password')} />
                {errors.password && <span className="admin-form-error">{errors.password.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="nombre">Nombre</label>
                <input id="nombre" {...register('nombre')} />
              </div>

              <div className="admin-form-field">
                <label htmlFor="apellido">Apellido</label>
                <input id="apellido" {...register('apellido')} />
              </div>

              <div className="admin-form-field">
                <label htmlFor="role">Rol</label>
                <select id="role" {...register('role')}>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              {editing && (
                <div className="admin-form-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input id="isActive" type="checkbox" style={{ width: 'auto' }} {...register('isActive')} />
                  <label htmlFor="isActive" style={{ margin: 0 }}>
                    Cuenta activa
                  </label>
                </div>
              )}

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
            <h3>¿Eliminar este usuario?</h3>
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

export default UsersPanel
