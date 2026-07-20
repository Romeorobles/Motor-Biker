import { useEffect, useState } from 'react'
import { deleteItem, fetchPaginated, updateItem } from '../../services/adminService'
import './admin.css'

interface Venta {
  id: string
  usuario_id: string
  moto_id: string
  precio_venta: number
  metodo_pago: string
  cuotas?: number
  estado: string
}

const ESTADOS = ['pendiente', 'confirmada', 'entregada', 'cancelada']

function VentasPanel() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState<Venta | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    fetchPaginated<Venta>('/ventas', { page, limit: 10 })
      .then((res) => {
        setVentas(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar las ventas.')
        setLoading(false)
      })
  }

  useEffect(load, [page])

  function formatPrice(price: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  async function handleEstadoChange(venta: Venta, nuevoEstado: string) {
    setUpdatingId(venta.id)
    try {
      await updateItem('/ventas', venta.id, { estado: nuevoEstado }, 'PUT')
      setVentas((prev) => prev.map((v) => (v.id === venta.id ? { ...v, estado: nuevoEstado } : v)))
    } catch (err) {
      console.error(err)
      setError('No se pudo actualizar el estado de la venta.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteItem('/ventas', deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError('No se pudo eliminar la venta.')
    }
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Ventas / Pedidos</h1>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando ventas...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : ventas.length === 0 ? (
          <div className="admin-empty">Todavía no hay ventas registradas.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Moto ID</th>
                <th>Usuario ID</th>
                <th>Precio</th>
                <th>Método de Pago</th>
                <th>Cuotas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ventas.map((v) => (
                <tr key={v.id}>
                  <td title={v.moto_id}>{v.moto_id.slice(0, 8)}...</td>
                  <td title={v.usuario_id}>{v.usuario_id.slice(0, 8)}...</td>
                  <td>{formatPrice(v.precio_venta)}</td>
                  <td>{v.metodo_pago}</td>
                  <td>{v.cuotas ?? '—'}</td>
                  <td>
                    <select
                      value={v.estado}
                      disabled={updatingId === v.id}
                      onChange={(e) => handleEstadoChange(v, e.target.value)}
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                        borderRadius: '6px',
                        padding: '0.3rem 0.5rem',
                      }}
                    >
                      {!ESTADOS.includes(v.estado) && <option value={v.estado}>{v.estado}</option>}
                      {ESTADOS.map((e) => (
                        <option key={e} value={e}>
                          {e}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button className="admin-btn-danger" onClick={() => setDeleting(v)}>
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
            <h3>¿Eliminar esta venta?</h3>
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

export default VentasPanel
