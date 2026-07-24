import { WhatsAppIcon } from './icons'
import './WhatsAppButton.css'

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/593985345265?text=Hola%2C%20quiero%20consultar%20por%20una%20moto"
      target="_blank"
      rel="noreferrer"
      className="whatsapp-button"
      aria-label="Chatear por WhatsApp"
      title="¿Necesitas ayuda? Escribinos"
    >
      <WhatsAppIcon className="whatsapp-icon" />
    </a>
  )
}

export default WhatsAppButton
