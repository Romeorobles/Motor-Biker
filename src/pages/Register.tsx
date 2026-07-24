import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Toast, { type ToastData } from '../components/Toast'
import { UserIcon, MailIcon, LockIcon, EyeIcon, EyeOffIcon, IdIcon, CheckIcon } from '../components/icons'
import MotoSilhouette from '../components/MotoSilhouette'
import { isValidEmail, getPasswordStrength } from '../utils/validation'
import './Auth.css'

const BENEFITS = [
  'Reservá la moto que más te guste',
  'Dejá comentarios y calificaciones',
  'Seguimiento de tus compras y reservas',
  'Acceso a ofertas exclusivas',
]

function Register() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    nombre: '',
    apellido: '',
  })
  const [touched, setTouched] = useState({ username: false, email: false, password: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleBlur(field: keyof typeof touched) {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  const errors = {
    username: touched.username && !form.username.trim() ? 'El usuario es obligatorio' : '',
    email: touched.email && !isValidEmail(form.email) ? 'Ingresá un correo válido' : '',
    password: touched.password && form.password.length < 6 ? 'Mínimo 6 caracteres' : '',
  }

  const isValid =
    form.username.trim() !== '' && isValidEmail(form.email) && form.password.length >= 6

  const strength = getPasswordStrength(form.password)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setTouched({ username: true, email: true, password: true })
    if (!isValid) return

    setLoading(true)
    try {
      await register(form)
      setToast({ message: '¡Cuenta creada con éxito!', type: 'success' })
      setTimeout(() => navigate('/'), 700)
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Error al registrarse',
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
            Unite a la <span>ruta</span>
          </h1>
          <p className="auth-brand-text">
            Creá tu cuenta para reservar motos, dejar comentarios y llevar el control de tus compras.
          </p>
          <ul className="auth-benefits">
            {BENEFITS.map((benefit) => (
              <li key={benefit}>
                <CheckIcon className="benefit-icon" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="auth-panel">
        <form className="auth-card" onSubmit={handleSubmit} noValidate>
          <h1>Crear cuenta</h1>
          <p className="auth-subtitle">Sumate a la comunidad Motor-Biker</p>

          <div className={`auth-field ${errors.username ? 'invalid' : ''}`}>
            <label htmlFor="username">Usuario</label>
            <div className="auth-input-wrap">
              <UserIcon className="auth-input-icon" />
              <input
                id="username"
                name="username"
                value={form.username}
                onChange={handleChange}
                onBlur={() => handleBlur('username')}
              />
            </div>
            {errors.username && <span className="auth-field-error">{errors.username}</span>}
          </div>

          <div className={`auth-field ${errors.email ? 'invalid' : ''}`}>
            <label htmlFor="email">Email</label>
            <div className="auth-input-wrap">
              <MailIcon className="auth-input-icon" />
              <input
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
              />
            </div>
            {errors.email && <span className="auth-field-error">{errors.email}</span>}
          </div>

          <div className={`auth-field has-toggle ${errors.password ? 'invalid' : ''}`}>
            <label htmlFor="password">Contraseña</label>
            <div className="auth-input-wrap">
              <LockIcon className="auth-input-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
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

            {form.password && (
              <div className="auth-strength">
                <div className="auth-strength-bars">
                  {[0, 1, 2, 3].map((i) => (
                    <span
                      key={i}
                      style={{
                        background: i <= strength.score ? strength.color : undefined,
                      }}
                    />
                  ))}
                </div>
                <span className="auth-strength-label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="nombre">Nombre</label>
            <div className="auth-input-wrap">
              <IdIcon className="auth-input-icon" />
              <input
                id="nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="auth-field">
            <label htmlFor="apellido">Apellido</label>
            <div className="auth-input-wrap">
              <IdIcon className="auth-input-icon" />
              <input
                id="apellido"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
          </button>

          <p className="auth-switch">
            ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register
