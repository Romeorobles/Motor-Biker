import { useEffect, useState } from 'react'
import { fetchPaginated } from '../../services/adminService'
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

function UsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    let active = true
    setLoading(true)

    fetchPaginated<AdminUser>('/users', {
      page,
      limit: 10,
      search: search || undefined,
      searchField: search ? 'username' : undefined,
    })
      .then((res) => {
        if (!active) return
        setUsers(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        console.error(err)
        setError('No se pudieron cargar los usuarios.')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [page, search])

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
    </div>
  )
}

export default UsersPanel
