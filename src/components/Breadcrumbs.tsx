import { Link, useLocation } from 'react-router-dom'
import './Breadcrumbs.css'

const LABELS: Record<string, string> = {
  admin: 'Panel Admin',
  motos: 'Motos',
  categorias: 'Categorías',
  usuarios: 'Usuarios',
  ventas: 'Ventas',
  reservas: 'Reservas',
  about: 'Nosotros',
  login: 'Iniciar Sesión',
  register: 'Registrarme',
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0) return null

  let path = ''
  const crumbs = segments.map((segment, i) => {
    path += `/${segment}`
    return {
      path,
      label: LABELS[segment] || (isUuid(segment) ? 'Detalle' : segment),
      isLast: i === segments.length - 1,
    }
  })

  return (
    <nav className="breadcrumbs" aria-label="breadcrumb">
      <Link to="/" className="breadcrumb-link">
        Inicio
      </Link>
      {crumbs.map((c) => (
        <span key={c.path}>
          <span className="breadcrumb-sep">/</span>
          {c.isLast ? (
            <span className="breadcrumb-current">{c.label}</span>
          ) : (
            <Link to={c.path} className="breadcrumb-link">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

export default Breadcrumbs
