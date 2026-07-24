import React from 'react';
import { Link } from 'react-router-dom';
import type { Moto } from '../services/api';
import { AwardIcon, BoltIcon, BoxIcon, CalendarIcon, DollarIcon, GaugeIcon, ShieldIcon } from './icons';

interface MotoCardProps {
  moto: Moto;
}

export const MotoCard: React.FC<MotoCardProps> = ({ moto }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getBadgeClass = (status?: string) => {
    if (!status) return 'badge-new';
    const lower = status.toLowerCase();
    if (lower.includes('nuev') && !lower.includes('semi')) return 'badge-new';
    if (lower.includes('semi')) return 'badge-semi';
    if (lower.includes('usad')) return 'badge-used';
    return 'badge-new';
  };

  const getBadgeIcon = (status?: string) => {
    if (!status) return <BoltIcon className="moto-card-badge-icon" />;
    const lower = status.toLowerCase();
    if (lower.includes('semi')) return <AwardIcon className="moto-card-badge-icon" />;
    if (lower.includes('usad')) return <ShieldIcon className="moto-card-badge-icon" />;
    return <BoltIcon className="moto-card-badge-icon" />;
  };

  return (
    <div className="moto-card animated-fade-in">
      <div className="moto-card-img-wrapper">
        <img
          src={moto.imagen_url || '/sport_bike.jpg'}
          alt={moto.modelo}
          className="moto-card-img"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/sport_bike.jpg';
          }}
        />
        {moto.estado_nombre && (
          <span className={`moto-card-badge ${getBadgeClass(moto.estado_nombre)}`}>
            {getBadgeIcon(moto.estado_nombre)}
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
          {moto.anio && (
            <span>
              <CalendarIcon className="moto-card-meta-icon" /> {moto.anio}
            </span>
          )}
          {moto.cilindraje && (
            <span>
              <GaugeIcon className="moto-card-meta-icon" /> {moto.cilindraje} cc
            </span>
          )}
          <span>
            <BoxIcon className="moto-card-meta-icon" /> Stock: {moto.stock}
          </span>
        </div>

        <div className="moto-card-price-row mb-3">
          <div>
            <span className="moto-card-price-label d-block text-start">
              <DollarIcon className="moto-card-price-icon" /> Precio
            </span>
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
