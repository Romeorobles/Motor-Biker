import { useEffect, useState } from 'react'
import type { Moto } from '../services/api'
import './HeroCarousel.css'

const FRASES = [
  'La libertad tiene dos ruedas',
  'Cada kilómetro cuenta una historia',
  'Vive la aventura sobre ruedas',
  'Tu pasión, nuestra pasión',
  'El camino te está esperando',
  'Hecho para quienes aman conducir',
]

interface Props {
  motos: Moto[]
}

function HeroCarousel({ motos }: Props) {
  const slides = motos.slice(0, 6)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 4500)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null

  function goTo(i: number) {
    setIndex((i + slides.length) % slides.length)
  }

  return (
    <section className="hero-carousel">
      {slides.map((moto, i) => (
        <div key={moto.id} className={`carousel-slide ${i === index ? 'active' : ''}`}>
          <img
            src={moto.imagen_url || '/sport_bike.jpg'}
            alt={moto.modelo}
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/sport_bike.jpg'
            }}
          />
          <div className="carousel-overlay" />
          <div className="carousel-caption">
            <span className="carousel-phrase">{FRASES[i % FRASES.length]}</span>
            <h3 className="carousel-moto-title">{moto.modelo}</h3>
            {moto.marca_nombre && <p className="carousel-moto-brand">{moto.marca_nombre}</p>}
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-left"
            onClick={() => goTo(index - 1)}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="carousel-arrow carousel-arrow-right"
            onClick={() => goTo(index + 1)}
            aria-label="Siguiente"
          >
            ›
          </button>

          <div className="carousel-dots">
            {slides.map((moto, i) => (
              <button
                key={moto.id}
                type="button"
                className={`carousel-dot ${i === index ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Ir a la moto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}

export default HeroCarousel
