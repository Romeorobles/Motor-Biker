import { MailIcon, PhoneIcon } from '../components/icons'
import './About.css'

function About() {
  return (
    <div className="container about-page animated-fade-in">
      <header className="about-header">
        <h1 className="about-title">Sobre Motor-Biker</h1>
        <p className="about-subtitle">
          Proyecto integrador de venta de motocicletas: catálogo, reservas y gestión, construido con
          ReactJS y NestJS.
        </p>
      </header>

      <div className="about-card">
        <h2>¿Qué es Motor-Biker?</h2>
        <p>
          Motor-Biker es una aplicación web para explorar un catálogo de motocicletas, reservar la
          moto que más te guste y, del lado administrativo, gestionar el inventario, las ventas y
          los usuarios del sistema. Es un proyecto académico desarrollado como parte del proyecto
          integrador universitario.
        </p>
      </div>

      <div className="about-card">
        <h2>Contacto</h2>
        <p className="about-contact-lead">¿Tenés preguntas o sugerencias? Escribinos.</p>
        <div className="about-contact-list">
          <a className="about-contact-item" href="mailto:isrraelrobles742@gmail.com">
            <MailIcon className="about-contact-icon" />
            <span>isrraelrobles742@gmail.com</span>
          </a>
          <a className="about-contact-item" href="tel:+593985345265">
            <PhoneIcon className="about-contact-icon" />
            <span>0985345265</span>
          </a>
        </div>
      </div>
    </div>
  )
}

export default About
