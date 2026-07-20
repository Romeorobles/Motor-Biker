import { Link, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import './App.css'
import MotoDetalle from './pages/MotoDetalle'
import Contacto from './pages/Contacto'
import Notificaciones from './pages/Notificaciones'

function App() {
  return (
    <>
      <nav>
        <Link to="/">Inicio</Link>
        {' | '}
        <Link to="/about">Acerca de</Link>
        {' | '}
        <Link to="/contacto">Contacto</Link>
        {' | '}
        <Link to="/notificaciones">Notificaciones</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/detalle" element={<MotoDetalle />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
      </Routes>

      <footer className="text-center mt-5 mb-3">
        Motor Bike 2026
      </footer>
    </>
  )
}

export default App
