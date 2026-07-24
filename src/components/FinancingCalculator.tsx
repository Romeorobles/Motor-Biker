import { useState } from 'react'
import { DollarIcon } from './icons'
import './FinancingCalculator.css'

const TASA_ANUAL_REFERENCIAL = 0.12

function formatPrice(value: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function FinancingCalculator() {
  const [precio, setPrecio] = useState(6490)
  const [entrada, setEntrada] = useState(1000)
  const [meses, setMeses] = useState(24)

  const montoFinanciado = Math.max(precio - entrada, 0)
  const interes = montoFinanciado * TASA_ANUAL_REFERENCIAL * (meses / 12)
  const totalAPagar = montoFinanciado + interes
  const cuotaMensual = meses > 0 ? totalAPagar / meses : 0

  return (
    <section className="financing-section">
      <div className="container">
        <h2 className="financing-title">
          <DollarIcon className="financing-title-icon" /> Calculadora de Financiamiento
        </h2>
        <p className="financing-note">Estimación referencial (tasa 12% anual) — no constituye una oferta de crédito formal.</p>

        <div className="financing-card">
          <div className="financing-inputs">
            <div className="financing-field">
              <label>Precio de la moto (USD)</label>
              <input
                type="number"
                min={0}
                value={precio}
                onChange={(e) => setPrecio(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className="financing-field">
              <label>Entrada (USD)</label>
              <input
                type="number"
                min={0}
                value={entrada}
                onChange={(e) => setEntrada(Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className="financing-field">
              <label>Plazo: {meses} meses</label>
              <input
                type="range"
                min={6}
                max={48}
                step={6}
                value={meses}
                onChange={(e) => setMeses(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="financing-result">
            <span className="financing-result-label">Cuota mensual estimada</span>
            <span className="financing-result-value">{formatPrice(cuotaMensual)}</span>
            <span className="financing-result-detail">
              Monto a financiar: {formatPrice(montoFinanciado)} · Total con interés: {formatPrice(totalAPagar)}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FinancingCalculator
