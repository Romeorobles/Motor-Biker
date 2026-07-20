import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createItem, deleteItem, fetchAllPages, fetchPaginated, updateItem } from '../../services/adminService'
import type { Moto } from '../../services/api'
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

const reservaSchema = z.object({
  usuario_id: z.string().uuid('Seleccioná un usuario'),
  moto_id: z.string().uuid('Seleccioná una moto'),
  estado: z.string().min(1),
})

type ReservaFormData = z.infer<typeof reservaSchema>

function ReservasPanel() {
  const [reservas, setReservas] = useState<Reserva[]>([])
  const [usuarios, setUsuarios] = useState<Map<string, AdminUser>>(new Map())
  const [motos, setMotos] = useState<Map<string, Moto>>(new Map())
  const [usuariosList, setUsuariosList] = useState<AdminUser[]>([])
  const [motosList, setMotosList] = useState<Moto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [deleting, setDeleting] = useState<Reserva | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReservaFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(reservaSchema) as any,
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
    fetchPaginated<Reserva>('/reservas', { page, limit: 10 })
      .then((res) => {
        setReservas(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar las reservas.')
        setLoading(false)
      })
  }

  useEffect(load, [page])

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
    reset({ usuario_id: '', moto_id: '', estado: 'pendiente' })
    setModalOpen(true)
  }

  async function onSubmit(data: ReservaFormData) {
    setSubmitError(null)
    try {
      await createItem('/reservas', { ...data, fecha_reserva: new Date().toISOString() })
      setModalOpen(false)
      load()
    } catch (err) {
      console.error(err)
      setSubmitError('No se pudo crear la reserva. Revisá los datos e intentá de nuevo.')
    }
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

      <div className="admin-toolbar">
        <div />
        <button className="admin-btn-primary" onClick={openCreate}>
          + Nueva Reserva
        </button>
      </div>

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
                <th>Moto</th>
                <th>Usuario</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservas.map((r) => (
                <tr key={r.id}>
                  <td>{nombreMoto(r.moto_id)}</td>
                  <td>{nombreUsuario(r.usuario_id)}</td>
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

      {modalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nueva Reserva</h3>
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
