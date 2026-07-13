import { NavLink, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import MotoDetail from './pages/MotoDetail';

function App() {
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
        </div>
      </nav>

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/motos/:id" element={<MotoDetail />} />
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
