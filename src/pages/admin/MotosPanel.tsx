import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createItem, deleteItem, fetchAllPages, fetchPaginated, updateItem } from '../../services/adminService'
import type { Moto } from '../../services/api'
import './admin.css'

interface Option {
  id: string
  nombre: string
}

interface Color extends Option {
  codigo_hex?: string
}

const optionalUuid = z.preprocess((v) => (v === '' ? undefined : v), z.string().uuid().optional())
const optionalNumber = z.preprocess((v) => (v === '' || v === undefined ? undefined : Number(v)), z.number().optional())
const requiredNumber = (msg: string) => z.preprocess((v) => (v === '' ? undefined : Number(v)), z.number().min(0, msg))

const motoSchema = z.object({
  modelo: z.string().min(1, 'El nombre de la moto es obligatorio'),
  marca_id: optionalUuid,
  categoria_id: optionalUuid,
  tipo_motor_id: optionalUuid,
  estado_id: optionalUuid,
  color_id: optionalUuid,
  anio: optionalNumber,
  cilindraje: optionalNumber,
  precio: requiredNumber('El precio es obligatorio'),
  stock: requiredNumber('El stock es obligatorio'),
  imagen_url: z.string().optional(),
})

type MotoFormData = z.infer<typeof motoSchema>

function MotosPanel() {
  const [motos, setMotos] = useState<Moto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [marcas, setMarcas] = useState<Option[]>([])
  const [categorias, setCategorias] = useState<Option[]>([])
  const [tiposMotor, setTiposMotor] = useState<Option[]>([])
  const [estados, setEstados] = useState<Option[]>([])
  const [colores, setColores] = useState<Color[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Moto | null>(null)
  const [deleting, setDeleting] = useState<Moto | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MotoFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(motoSchema) as any,
  })

  useEffect(() => {
    Promise.all([
      fetchAllPages<Option>('/marcas'),
      fetchAllPages<Option>('/categorias'),
      fetchAllPages<Option>('/tipo-motor'),
      fetchAllPages<Option>('/estado-moto'),
      fetchAllPages<Color>('/colores'),
    ])
      .then(([m, c, t, e, col]) => {
        setMarcas(m)
        setCategorias(c)
        setTiposMotor(t)
        setEstados(e)
        setColores(col)
      })
      .catch((err) => console.error('No se pudieron cargar las listas de referencia', err))
  }, [])

  function load() {
    setLoading(true)
    fetchPaginated<Moto>('/motos', {
      page,
      limit: 10,
      search: search || undefined,
      searchField: search ? 'modelo' : undefined,
    })
      .then((res) => {
        setMotos(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('No se pudieron cargar las motos.')
        setLoading(false)
      })
  }

  useEffect(load, [page, search])

  function openCreate() {
    setEditing(null)
    setSubmitError(null)
    reset({
      modelo: '',
      marca_id: '',
      categoria_id: '',
      tipo_motor_id: '',
      estado_id: '',
      color_id: '',
      imagen_url: '',
    } as unknown as MotoFormData)
    setModalOpen(true)
  }

  function openEdit(moto: Moto) {
    setEditing(moto)
    setSubmitError(null)
    reset({
      modelo: moto.modelo,
      marca_id: moto.marca_id || '',
      categoria_id: moto.categoria_id || '',
      tipo_motor_id: moto.tipo_motor_id || '',
      estado_id: moto.estado_id || '',
      color_id: (moto as unknown as { color_id?: string }).color_id || '',
      anio: moto.anio,
      cilindraje: moto.cilindraje,
      precio: moto.precio,
      stock: moto.stock,
      imagen_url: moto.imagen_url || '',
    } as unknown as MotoFormData)
    setModalOpen(true)
  }

  async function onSubmit(data: MotoFormData) {
    setSubmitError(null)
    try {
      if (editing) {
        await updateItem('/motos', editing.id, data, 'PATCH')
      } else {
        await createItem('/motos', data)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      console.error(err)
      setSubmitError('No se pudo guardar la moto. Revisá los datos e intentá de nuevo.')
    }
  }

  async function confirmDelete() {
    if (!deleting) return
    try {
      await deleteItem('/motos', deleting.id)
      setDeleting(null)
      load()
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError('No se pudo eliminar la moto.')
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Motos</h1>

      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          placeholder="Buscar por modelo..."
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
        />
        <button className="admin-btn-primary" onClick={openCreate}>
          + Nueva Moto
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando motos...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : motos.length === 0 ? (
          <div className="admin-empty">No hay motos registradas.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Marca</th>
                <th>Categoría</th>
                <th>Año</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {motos.map((m) => (
                <tr key={m.id}>
                  <td>{m.modelo}</td>
                  <td>{m.marca_nombre || '—'}</td>
                  <td>{m.categoria_nombre || '—'}</td>
                  <td>{m.anio || '—'}</td>
                  <td>{formatPrice(m.precio)}</td>
                  <td>{m.stock}</td>
                  <td>{m.estado_nombre || '—'}</td>
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
          <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <h3>{editing ? 'Editar Moto' : 'Nueva Moto'}</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="admin-form-field">
                <label htmlFor="modelo">Nombre de la Moto</label>
                <input id="modelo" {...register('modelo')} />
                {errors.modelo && <span className="admin-form-error">{errors.modelo.message}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <div className="admin-form-field">
                  <label htmlFor="marca_id">Marca</label>
                  <select id="marca_id" {...register('marca_id')}>
                    <option value="">Sin especificar</option>
                    {marcas.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="categoria_id">Categoría</label>
                  <select id="categoria_id" {...register('categoria_id')}>
                    <option value="">Sin especificar</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="tipo_motor_id">Tipo de Motor</label>
                  <select id="tipo_motor_id" {...register('tipo_motor_id')}>
                    <option value="">Sin especificar</option>
                    {tiposMotor.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="estado_id">Estado de la Moto</label>
                  <select id="estado_id" {...register('estado_id')}>
                    <option value="">Sin especificar</option>
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="color_id">Color</label>
                  <select id="color_id" {...register('color_id')}>
                    <option value="">Sin especificar</option>
                    {colores.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-form-field">
                  <label htmlFor="anio">Año Modelo</label>
                  <input id="anio" type="number" {...register('anio')} />
                  {errors.anio && <span className="admin-form-error">{errors.anio.message}</span>}
                </div>

                <div className="admin-form-field">
                  <label htmlFor="cilindraje">Cilindraje</label>
                  <input id="cilindraje" type="number" {...register('cilindraje')} />
                  {errors.cilindraje && <span className="admin-form-error">{errors.cilindraje.message}</span>}
                </div>

                <div className="admin-form-field">
                  <label htmlFor="precio">Precio</label>
                  <input id="precio" type="number" step="0.01" {...register('precio')} />
                  {errors.precio && <span className="admin-form-error">{errors.precio.message}</span>}
                </div>

                <div className="admin-form-field">
                  <label htmlFor="stock">Disponibilidad (Stock)</label>
                  <input id="stock" type="number" {...register('stock')} />
                  {errors.stock && <span className="admin-form-error">{errors.stock.message}</span>}
                </div>
              </div>

              <div className="admin-form-field">
                <label htmlFor="imagen_url">URL de Imagen</label>
                <input id="imagen_url" placeholder="/sport_bike.jpg" {...register('imagen_url')} />
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
            <h3>¿Eliminar esta moto?</h3>
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

export default MotosPanel
