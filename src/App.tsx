import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import './App.css'

function App() {
  const { user, logout } = useAuth()

  return (
    <>
      <nav>
        <Link to="/">Inicio</Link>
        {' | '}
        <Link to="/about">Acerca de</Link>
        {' | '}
        {user ? (
          <>
            <span>Hola, {user.username}</span>
            {' '}
            <button type="button" onClick={logout}>Salir</button>
          </>
        ) : (
          <Link to="/login">Iniciar sesión</Link>
        )}
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  )
}

export default App
