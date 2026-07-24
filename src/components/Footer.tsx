import { Link } from 'react-router-dom'
import { MailIcon, PhoneIcon, WhatsAppIcon } from './icons'
import './Footer.css'

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-col">
          <span className="footer-brand">MOTOR-BIKER</span>
          <p className="footer-text">
            Catálogo de motocicletas nuevas y usadas, reservas en línea y atención personalizada.
          </p>
        </div>

        <div className="footer-col">
          <h4>Navegación</h4>
          <Link to="/">Catálogo</Link>
          <Link to="/about">Nosotros</Link>
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/register">Registrarme</Link>
        </div>

        <div className="footer-col">
          <h4>Contacto</h4>
          <a href="mailto:isrraelrobles742@gmail.com" className="footer-contact-item">
            <MailIcon className="footer-icon" /> isrraelrobles742@gmail.com
          </a>
          <a href="tel:+593985345265" className="footer-contact-item">
            <PhoneIcon className="footer-icon" /> 0985345265
          </a>
          <a
            href="https://wa.me/593985345265"
            target="_blank"
            rel="noreferrer"
            className="footer-contact-item"
          >
            <WhatsAppIcon className="footer-icon" /> WhatsApp
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Motor-Biker S.A. Todos los derechos reservados.
      </div>
    </footer>
  )
}

export default Footer
