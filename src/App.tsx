import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import MotoDetail from './pages/MotoDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="main-nav">
        <NavLink to="/" className="nav-brand">
          MOTOR-BIKER
        </NavLink>
        <div className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
          >
            Catálogo
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
          >
            Nosotros
          </NavLink>
          {user ? (
            <span className="nav-user">
              <span className="nav-link-custom">Hola, {user.username}</span>
              <button type="button" className="nav-link-custom nav-logout-btn" onClick={logout}>
                Salir
              </button>
            </span>
          ) : (
            <>
              <NavLink to="/login" className="nav-link-custom">
                Iniciar sesión
              </NavLink>
              <NavLink to="/register" className="nav-link-custom">
                Registrarme
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/motos/:id" element={<MotoDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>

      <footer className="py-4 text-center border-top border-secondary border-opacity-10 mt-auto text-muted small">
        <div className="container">
          &copy; {new Date().getFullYear()} Motor-Biker S.A. Todos los derechos reservados.
        </div>
      </footer>
    </>
  );
}

export default App;
