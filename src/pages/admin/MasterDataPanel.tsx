import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createItem, deleteItem, fetchPaginated, updateItem } from '../../services/adminService'
import { masterDataConfigs } from './masterDataConfigs'
import './admin.css'

interface Row {
  id: string
  [key: string]: unknown
}

function MasterDataPanel() {
  const { entity } = useParams<{ entity: string }>()
  const config = entity ? masterDataConfigs[entity] : undefined

  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [deleting, setDeleting] = useState<Row | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Record<string, unknown>>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: config ? zodResolver(config.schema as any) : undefined,
  })

  useEffect(() => {
    setPage(1)
    setSearch('')
  }, [entity])

  useEffect(() => {
    if (!config) return
    let active = true
    setLoading(true)

    fetchPaginated<Row>(config.path, {
      page,
      limit: 10,
      search: search || undefined,
      searchField: search ? config.searchField : undefined,
    })
      .then((res) => {
        if (!active) return
        setRows(res.items)
        setTotalPages(res.meta.totalPages || 1)
        setLoading(false)
      })
      .catch((err) => {
        if (!active) return
        console.error(err)
        setError('No se pudo cargar la información.')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [config, page, search])

  if (!config) {
    return <div className="admin-empty">Sección no encontrada.</div>
  }

  function openCreate() {
    setEditing(null)
    setSubmitError(null)
    reset({})
    setModalOpen(true)
  }

  function openEdit(row: Row) {
    setEditing(row)
    setSubmitError(null)
    reset(row)
    setModalOpen(true)
  }

  async function onSubmit(data: Record<string, unknown>) {
    const cfg = config!
    setSubmitError(null)
    try {
      if (editing) {
        await updateItem(cfg.path, editing.id, data, cfg.updateMethod)
      } else {
        await createItem(cfg.path, data)
      }
      setModalOpen(false)
      setPage(1)
      const res = await fetchPaginated<Row>(cfg.path, { page: 1, limit: 10 })
      setRows(res.items)
      setTotalPages(res.meta.totalPages || 1)
    } catch (err) {
      console.error(err)
      setSubmitError('No se pudo guardar. Revisá los datos e intentá de nuevo.')
    }
  }

  async function confirmDelete() {
    const cfg = config!
    if (!deleting) return
    try {
      await deleteItem(cfg.path, deleting.id)
      setDeleting(null)
      const res = await fetchPaginated<Row>(cfg.path, { page, limit: 10 })
      setRows(res.items)
      setTotalPages(res.meta.totalPages || 1)
    } catch (err) {
      console.error(err)
      setDeleting(null)
      setError('No se pudo eliminar el registro.')
    }
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">{config.title}</h1>

      <div className="admin-toolbar">
        <input
          className="admin-search-input"
          placeholder={`Buscar por ${config.searchField}...`}
          value={search}
          onChange={(e) => {
            setPage(1)
            setSearch(e.target.value)
          }}
        />
        <button className="admin-btn-primary" onClick={openCreate}>
          + Nuevo
        </button>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-loading">Cargando...</div>
        ) : error ? (
          <div className="admin-empty">{error}</div>
        ) : rows.length === 0 ? (
          <div className="admin-empty">No hay registros.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                {config.columns.map((c) => (
                  <th key={c.key}>{c.label}</th>
                ))}
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((c) => (
                    <td key={c.key}>{String(row[c.key] ?? '—')}</td>
                  ))}
                  <td>
                    <div className="admin-table-actions">
                      <button className="admin-btn-secondary" onClick={() => openEdit(row)}>
                        Editar
                      </button>
                      <button className="admin-btn-danger" onClick={() => setDeleting(row)}>
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
            <h3>{editing ? `Editar ${config.title}` : `Nuevo en ${config.title}`}</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              {config.fields.map((f) => (
                <div className="admin-form-field" key={f.name}>
                  <label htmlFor={f.name}>{f.label}</label>
                  <input id={f.name} type={f.type || 'text'} {...register(f.name)} />
                  {errors[f.name] && (
                    <span className="admin-form-error">{String(errors[f.name]?.message || 'Campo inválido')}</span>
                  )}
                </div>
              ))}
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
            <h3>¿Eliminar este registro?</h3>
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

export default MasterDataPanel
