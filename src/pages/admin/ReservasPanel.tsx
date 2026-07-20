import { useEffect, useState } from 'react'
import { deleteItem, fetchAllPages, fetchPaginated, updateItem } from '../../services/adminService'
import type { AdminUser } from './UsersPanel'
import './admin.css'

interface Reserva {
  id: string
  usuario_id: string
  moto_id: string
  fecha_reserva: string
  estado: string
}

const ESTADOS = ['pendiente', 'confirmada', 'cancelada']

function ReservasPanel() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [usuarios, setUsuarios] = useState<Map<string, AdminUser>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState<Reserva | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    Promise.all([
      fetchPaginated<Reserva>('/reservas', { page, limit: 10 }),
      fetchAllPages<AdminUser>('/users', 100).catch(() => []),
    ])
      .then(([res, users]) => {
        setReservas(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setUsuarios(new Map(users.map((u) => [u.id, u])))
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar las reservas.')
        setLoading(false)
      })
  }

  useEffect(load, [page])

  function nombreUsuario(usuarioId: string) {
    const u = usuarios.get(usuarioId)
    if (!u) return usuarioId
    return [u.nombre, u.apellido].filter(Boolean).join(' ') || u.username
  }

  async function handleEstadoChange(reserva: Reserva, nuevoEstado: string) {
    setUpdatingId(reserva.id)
    try {
      await updateItem('/reservas', reserva.id, { estado: nuevoEstado }, 'PATCH')
      setReservas((prev) => prev.map((r) => (r.id === reserva.id ? { ...r, estado: nuevoEstado } : r)))
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar el estado de la reserva.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteItem('/reservas', deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError('No se pudo eliminar la reserva.')
    }
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Reservas</h1>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando reservas...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : reservas.length === 0 ? (
          <div className="admin-empty">Todavía no hay reservas registradas.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Moto ID</th>
                <th>Usuario</th>
                <th>Usuario ID</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id}>
                  <td>{r.moto_id}</td>
                  <td>{nombreUsuario(r.usuario_id)}</td>
                  <td>{r.usuario_id}</td>
                  <td>{new Date(r.fecha_reserva).toLocaleString('es-EC')}</td>
                  <td>
                    <select
                      value={r.estado}
                      disabled={updatingId === r.id}
                      onChange={(e) => handleEstadoChange(r, e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        borderRadius: '6px',
                        padding: '0.3rem 0.5rem',
                      }}
                    >
                      {!ESTADOS.includes(r.estado) && <option value={r.estado}>{r.estado}</option>}
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="admin-btn-danger" onClick={() => setDeleting(r)}>
                      Eliminar
                    </button>
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

      {deleting && (
        <div className="admin-modal-backdrop" onClick={() => setDeleting(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>¿Eliminar esta reserva?</h3>
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

export default ReservasPanel
