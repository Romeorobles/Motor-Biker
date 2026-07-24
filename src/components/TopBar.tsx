import { MapPinIcon, PhoneIcon, ShieldIcon, TruckIcon } from './icons'
import './TopBar.css'

function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <a href="tel:+593985345265" className="top-bar-item">
          <PhoneIcon className="top-bar-icon" />
          <span>+593 98 534 5265</span>
        </a>
        <span className="top-bar-item">
          <MapPinIcon className="top-bar-icon" />
          <span>Quito, Ecuador</span>
        </span>
        <span className="top-bar-item top-bar-hide-sm">
          <TruckIcon className="top-bar-icon" />
          <span>Envíos a todo el país</span>
        </span>
        <span className="top-bar-item top-bar-hide-sm">
          <ShieldIcon className="top-bar-icon" />
          <span>Garantía en todas las motos</span>
        </span>
      </div>
    </div>
  )
}

export default TopBar
