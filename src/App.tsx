import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import MotoDetail from './pages/MotoDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRoute from './components/AdminRoute';
import ProtectedRoute from './components/ProtectedRoute';
import Breadcrumbs from './components/Breadcrumbs';
import ThemeToggle from './components/ThemeToggle';
import TopBar from './components/TopBar';
import WhatsAppButton from './components/WhatsAppButton';
import Footer from './components/Footer';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import UsersPanel from './pages/admin/UsersPanel';
import VentasPanel from './pages/admin/VentasPanel';
import ReservasPanel from './pages/admin/ReservasPanel';
import MotosPanel from './pages/admin/MotosPanel';
import CategoriasPanel from './pages/admin/CategoriasPanel';
import Profile from './pages/Profile';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, logout } = useAuth();

  return (
    <>
      <ThemeToggle />
      <WhatsAppButton />
      <TopBar />
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
              {user.role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
                >
                  Panel Admin
                </NavLink>
              )}
              <NavLink
                to="/perfil"
                className={({ isActive }) => `nav-link-custom ${isActive ? 'active' : ''}`}
              >
                Mi Perfil
              </NavLink>
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

      <Breadcrumbs />

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/motos/:id" element={<MotoDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="motos" element={<MotosPanel />} />
            <Route path="categorias" element={<CategoriasPanel />} />
            <Route path="usuarios" element={<UsersPanel />} />
            <Route path="ventas" element={<VentasPanel />} />
            <Route path="reservas" element={<ReservasPanel />} />
          </Route>
        </Routes>
      </main>

      <Footer />
    </>
  );
}

export default App;
