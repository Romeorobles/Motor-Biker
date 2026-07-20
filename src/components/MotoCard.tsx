import React from 'react';
import { Link } from 'react-router-dom';
import type { Moto } from '../services/api';

interface MotoCardProps {
  moto: Moto;
}

export const MotoCard: React.FC<MotoCardProps> = ({ moto }) => {
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

  return (
    <div className="moto-card animated-fade-in">
      <div className="moto-card-img-wrapper">
        {/* Aquí se asigna la URL de la imagen. Cambiar esta URL por la imagen real de la motocicleta o usar fallback. */}
        <img 
          src={moto.imagen_url || '/https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5nJBaAhmf9x9_INbOUxcMR4BySNZzBH9v-UDyD5sSHw&s=10'} 
          alt={moto.modelo} 
          className="moto-card-img"
          onError={(e) => {
            // URL de la imagen de la motocicleta en caso de error. Reemplazar por la URL correspondiente.
            (e.target as HTMLImageElement).src = '/https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5nJBaAhmf9x9_INbOUxcMR4BySNZzBH9v-UDyD5sSHw&s=10';
          }}
        />
        {moto.estado_nombre && (
          <span className={`moto-card-badge ${getBadgeClass(moto.estado_nombre)}`}>
            {moto.estado_nombre}
          </span>
        )}
      </div>

      <div className="moto-card-body">
        {moto.marca_nombre && (
          <span className="moto-card-brand">{moto.marca_nombre}</span>
        )}
        <h3 className="moto-card-title">{moto.modelo}</h3>

        <div className="moto-card-meta">
          {moto.anio && <span>Año: {moto.anio}</span>}
          {moto.cilindraje && <span>{moto.cilindraje} cc</span>}
          <span>Stock: {moto.stock}</span>
        </div>

        <div className="moto-card-price-row mb-3">
          <div>
            <span className="moto-card-price-label d-block text-start">Precio</span>
            <span className="moto-card-price-val">{formatPrice(moto.precio)}</span>
          </div>
        </div>

        <Link to={`/motos/${moto.id}`} className="btn-detail mt-auto">
          Ver Detalles
        </Link>
      </div>
    </div>
  );
};
