import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchMotoById } from '../services/api';
import type { Moto } from '../services/api';

function MotoDetail() {
  const { id } = useParams<{ id: string }>();
  const [moto, setMoto] = useState<Moto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    fetchMotoById(id)
      .then((data) => {
        if (active) {
          if (data) {
            setMoto(data);
          } else {
            setError('La motocicleta solicitada no existe.');
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error(err);
          setError('Ocurrió un error al obtener los detalles.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  // Format price helper
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Determine badge styling class based on state name
  const getBadgeClass = (status?: string) => {
    if (!status) return 'badge-new';
    const lower = status.toLowerCase();
    if (lower.includes('nuev') && !lower.includes('semi')) return 'badge-new';
    if (lower.includes('semi')) return 'badge-semi';
    if (lower.includes('usad')) return 'badge-used';
    return 'badge-new';
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando especificaciones técnicas...</p>
      </div>
    );
  }

  if (error || !moto) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger glass-card d-inline-block p-4" role="alert">
          <h4 className="alert-heading">¡Atención!</h4>
          <p>{error || 'No se pudo encontrar la motocicleta.'}</p>
          <hr />
          <Link to="/" className="btn btn-outline-light btn-sm">
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container detail-container animated-fade-in">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10">
          <div className="detail-card">
            <div className="row g-0">
              {/* Left Column: Image */}
              <div className="col-12 col-md-6">
                <div className="detail-img-wrapper">
                  <img
                    src={moto.imagen_url || '/sport_bike.jpg'}
                    alt={moto.modelo}
                    className="detail-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/sport_bike.jpg';
                    }}
                  />
                  {moto.estado_nombre && (
                    <span className={`detail-badge-float ${getBadgeClass(moto.estado_nombre)}`}>
                      {moto.estado_nombre}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Spec details */}
              <div className="col-12 col-md-6">
                <div className="detail-info">
                  <span className="detail-brand">{moto.marca_nombre || 'Marca No Especificada'}</span>
                  <h1 className="detail-title">{moto.modelo}</h1>

                  <div className="detail-price-box">
                    <span className="d-block text-start text-secondary fs-6 mb-1">Precio sugerido</span>
                    <span className="detail-price-val">{formatPrice(moto.precio)}</span>
                  </div>

                  <div className="specs-grid">
                    <div className="spec-item">
                      <div className="spec-label">Marca</div>
                      <div className="spec-value">{moto.marca_nombre || 'No Definido'}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Estado de la Moto</div>
                      <div className="spec-value">{moto.estado_nombre || 'No Definido'}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Tipo de Motor</div>
                      <div className="spec-value">{moto.tipo_motor_nombre || 'No Definido'}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Cilindraje</div>
                      <div className="spec-value">{moto.cilindraje ? `${moto.cilindraje} cc` : 'N/A'}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Año Modelo</div>
                      <div className="spec-value">{moto.anio || 'N/A'}</div>
                    </div>
                    <div className="spec-item">
                      <div className="spec-label">Disponibilidad (Stock)</div>
                      <div className="spec-value">{moto.stock} unidades</div>
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <Link to="/" className="btn-back-custom">
                      Volver al Catálogo
                    </Link>
                    <button className="btn-detail flex-grow-1" onClick={() => alert('¡Reserva iniciada! (Simulación de funcionalidad)')}>
                      Reservar Ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MotoDetail;
