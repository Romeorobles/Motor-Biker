import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createItem, deleteItem, fetchAllPages, fetchPaginated, updateItem } from '../../services/adminService'
import type { Moto } from '../../services/api'
import type { AdminUser } from './UsersPanel'
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
const METODOS_PAGO = ['efectivo', 'tarjeta', 'transferencia']

const ventaSchema = z.object({
  usuario_id: z.string().uuid('Seleccioná un usuario'),
  moto_id: z.string().uuid('Seleccioná una moto'),
  precio_venta: z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().min(0, 'El precio es obligatorio')),
  metodo_pago: z.enum(['efectivo', 'tarjeta', 'transferencia']),
  cuotas: z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().int().min(1).optional()),
  estado: z.string().min(1),
})

type VentaFormData = z.infer<typeof ventaSchema>

function VentasPanel() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [usuarios, setUsuarios] = useState<Map<string, AdminUser>>(new Map())
  const [motos, setMotos] = useState<Map<string, Moto>>(new Map())
  const [usuariosList, setUsuariosList] = useState<AdminUser[]>([])
  const [motosList, setMotosList] = useState<Moto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState<Venta | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VentaFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(ventaSchema) as any,
  })

  useEffect(() => {
    Promise.all([fetchAllPages<AdminUser>('/users', 100), fetchAllPages<Moto>('/motos', 100)])
      .then(([users, ms]) => {
        setUsuarios(new Map(users.map((u) => [u.id, u])))
        setMotos(new Map(ms.map((m) => [m.id, m])))
        setUsuariosList(users)
        setMotosList(ms)
      })
      .catch((err) => console.error('No se pudieron cargar usuarios/motos', err))
  }, [])

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

  function nombreUsuario(id: string) {
    const u = usuarios.get(id)
    return u ? u.username : id
  }

  function nombreMoto(id: string) {
    const m = motos.get(id)
    return m ? m.modelo : id
  }

  function openCreate() {
    setSubmitError(null)
    reset({ usuario_id: '', moto_id: '', precio_venta: 0, metodo_pago: 'efectivo', estado: 'pendiente' } as unknown as VentaFormData)
    setModalOpen(true)
  }

  async function onSubmit(data: VentaFormData) {
    setSubmitError(null)
    try {
      await createItem('/ventas', data)
      setModalOpen(false)
      load()
    } catch (err) {
      console.error(err)
      setSubmitError('No se pudo crear la venta. Revisá los datos e intentá de nuevo.')
    }
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

      <div className="admin-toolbar">
        <div />
        <button className="admin-btn-primary" onClick={openCreate}>
          + Nueva Venta
        </button>
      </div>

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
                <th>Moto</th>
                <th>Usuario</th>
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
                  <td>{nombreMoto(v.moto_id)}</td>
                  <td>{nombreUsuario(v.usuario_id)}</td>
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

      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal admin-modal-ventas" onClick={(e) => e.stopPropagation()}>
            <h3>Nueva Venta</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="admin-form-field">
                <label htmlFor="usuario_id">Usuario</label>
                <select id="usuario_id" {...register('usuario_id')}>
                  <option value="">Seleccionar...</option>
                  {usuariosList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.username}
                    </option>
                  ))}
                </select>
                {errors.usuario_id && <span className="admin-form-error">{errors.usuario_id.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="moto_id">Moto</label>
                <select id="moto_id" {...register('moto_id')}>
                  <option value="">Seleccionar...</option>
                  {motosList.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.modelo}
                    </option>
                  ))}
                </select>
                {errors.moto_id && <span className="admin-form-error">{errors.moto_id.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="precio_venta">Precio de Venta</label>
                <input id="precio_venta" type="number" step="0.01" {...register('precio_venta')} />
                {errors.precio_venta && <span className="admin-form-error">{errors.precio_venta.message}</span>}
              </div>

              <div className="admin-form-field">
                <label htmlFor="metodo_pago">Método de Pago</label>
                <select id="metodo_pago" {...register('metodo_pago')}>
                  {METODOS_PAGO.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-field">
                <label htmlFor="cuotas">Cuotas (opcional)</label>
                <input id="cuotas" type="number" {...register('cuotas')} />
              </div>

              <div className="admin-form-field">
                <label htmlFor="estado">Estado</label>
                <select id="estado" {...register('estado')}>
                  {ESTADOS.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
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
