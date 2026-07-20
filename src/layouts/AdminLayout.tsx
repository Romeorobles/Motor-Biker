import { NavLink, Outlet } from 'react-router-dom'
import './AdminLayout.css'

const LINKS = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/motos', label: 'Motos' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/ventas', label: 'Ventas' },
  { to: '/admin/reservas', label: 'Reservas / Pedidos' },
]

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-title">Panel Admin</div>
        <nav className="admin-sidebar-nav">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin-sidebar-link ${isActive ? 'active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AdminLayout
