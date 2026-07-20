import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { fetchPaginated, fetchAllPages } from '../../services/adminService'
import { fetchMotos } from '../../services/api'
import type { AdminUser } from './UsersPanel'
import './admin.css'

interface Venta {
  id: string
  usuario_id: string
  moto_id: string
  precio_venta: number
  estado: string
}

const PIE_COLORS = ['#60a5fa', '#a78bfa', '#ec4899', '#f59e0b', '#10b981', '#f87171']

function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [totalMotos, setTotalMotos] = useState(0)
  const [totalVentas, setTotalVentas] = useState(0)
  const [totalCategorias, setTotalCategorias] = useState(0)

  const [motosPorCategoria, setMotosPorCategoria] = useState<{ nombre: string; total: number }[]>([])
  const [ventasPorEstado, setVentasPorEstado] = useState<{ nombre: string; total: number }[]>([])
  const [ultimosUsuarios, setUltimosUsuarios] = useState<AdminUser[]>([])

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const [usuariosPage, categoriasPage, ventas, motos] = await Promise.all([
          fetchPaginated<AdminUser>('/users', { page: 1, limit: 5 }),
          fetchPaginated('/categorias', { page: 1, limit: 1 }),
          fetchAllPages<Venta>('/ventas'),
          fetchMotos(),
        ])

        if (!active) return

        setTotalUsuarios(usuariosPage.meta.totalItems)
        setTotalCategorias(categoriasPage.meta.totalItems)
        setTotalVentas(ventas.length)
        setTotalMotos(motos.length)
        setUltimosUsuarios(usuariosPage.items)

        const porCategoria = new Map<string, number>()
        motos.forEach((m) => {
          const nombre = m.categoria_nombre || 'Sin categoría'
          porCategoria.set(nombre, (porCategoria.get(nombre) || 0) + 1)
        })
        setMotosPorCategoria(
          Array.from(porCategoria.entries()).map(([nombre, total]) => ({ nombre, total })),
        )

        const porEstado = new Map<string, number>()
        ventas.forEach((v) => {
          const nombre = v.estado || 'Sin estado'
          porEstado.set(nombre, (porEstado.get(nombre) || 0) + 1)
        })
        setVentasPorEstado(
          Array.from(porEstado.entries()).map(([nombre, total]) => ({ nombre, total })),
        )

        setLoading(false)
      } catch (err) {
        if (!active) return
        console.error(err)
        setError('No se pudo cargar la información del dashboard.')
        setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  if (loading) {
    return <div className="admin-loading">Cargando dashboard...</div>
  }

  if (error) {
    return <div className="admin-empty">{error}</div>
  }

  return (
    <div className="animated-fade-in">
      <h1 className="admin-page-title">Dashboard</h1>

      <div className="admin-cards">
        <div className="admin-card">
          <div className="admin-card-label">Total Usuarios</div>
          <div className="admin-card-value">{totalUsuarios}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Total Motos</div>
          <div className="admin-card-value">{totalMotos}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Total Ventas</div>
          <div className="admin-card-value">{totalVentas}</div>
        </div>
        <div className="admin-card">
          <div className="admin-card-label">Total Categorías</div>
          <div className="admin-card-value">{totalCategorias}</div>
        </div>
      </div>

      <div className="admin-charts">
        <div className="chart-card">
          <h3>Motos por Categoría</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={motosPorCategoria}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="nombre" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#161c2d', border: '1px solid rgba(255,255,255,0.1)' }} />
              <Bar dataKey="total" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Ventas por Estado</h3>
          {ventasPorEstado.length === 0 ? (
            <div className="admin-empty">Todavía no hay ventas registradas.</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={ventasPorEstado}
                  dataKey="total"
                  nameKey="nombre"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {ventasPorEstado.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#161c2d', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="chart-card">
        <h3>Últimos usuarios registrados</h3>
        <div className="admin-table-wrap" style={{ border: 'none' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {ultimosUsuarios.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
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
        </div>
      </div>
    </div>
  )
}

export default Dashboard
