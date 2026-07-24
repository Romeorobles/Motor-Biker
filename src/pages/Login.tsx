import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Toast, { type ToastData } from '../components/Toast'
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon } from '../components/icons'
import MotoSilhouette from '../components/MotoSilhouette'
import './Auth.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ username: false, password: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const { login } = useAuth()
  const navigate = useNavigate()

  const errors = {
    username: touched.username && !username.trim() ? 'El usuario es obligatorio' : '',
    password: touched.password && !password ? 'La contraseña es obligatoria' : '',
  }

  const isValid = username.trim() !== '' && password !== ''

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ username: true, password: true })
    if (!isValid) return

    setLoading(true)
    try {
      await login({ username, password })
      setToast({ message: '¡Bienvenido de nuevo!', type: 'success' })
      setTimeout(() => navigate('/'), 700)
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error al iniciar sesión',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="auth-brand">
        <MotoSilhouette className="auth-moto-silhouette" />
        <div className="auth-brand-content">
          <span className="auth-brand-tag">Motor · Biker</span>
          <h1 className="auth-brand-title">
            Encendé tu <span>pasión</span> por las motos
          </h1>
          <p className="auth-brand-text">
            Accedé a tu cuenta para reservar, comentar y seguir tus motos favoritas del catálogo.
          </p>
        </div>
      </div>

      <div className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h1>Iniciar sesión</h1>
          <p className="auth-subtitle">Entrá con tu cuenta de Motor-Biker</p>

          <div className={`auth-field ${errors.username ? 'invalid' : ''}`}>
            <label htmlFor="username">Usuario</label>
            <div className="auth-input-wrap">
              <UserIcon className="auth-input-icon" />
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, username: true }))}
              />
            </div>
            {errors.username && <span className="auth-field-error">{errors.username}</span>}
          </div>

          <div className={`auth-field has-toggle ${errors.password ? 'invalid' : ''}`}>
            <label htmlFor="password">Contraseña</label>
            <div className="auth-input-wrap">
              <LockIcon className="auth-input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, password: true }))}
              />
              <button
                type="button"
                className="auth-toggle-visibility"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password && <span className="auth-field-error">{errors.password}</span>}
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="auth-switch">
            ¿No tenés cuenta? <Link to="/register">Registrate</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login
