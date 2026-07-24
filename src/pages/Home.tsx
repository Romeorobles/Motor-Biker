import { useEffect, useState } from 'react';
import { fetchMotosPaginated } from '../services/api';
import type { Moto } from '../services/api';
import { MotoCard } from '../components/MotoCard';
import HeroCarousel from '../components/HeroCarousel';
import FinancingCalculator from '../components/FinancingCalculator';
import { fetchAllPages } from '../services/adminService';
import { MotorcycleIcon, TagIcon, LayersIcon, BoxIcon } from '../components/icons';
import './Home.css';

interface Option {
  id: string;
  nombre: string;
}

interface Stats {
  motos: number;
  marcas: number;
  categorias: number;
  stock: number;
}

function Home() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [buscar, setBuscar] = useState('');
  const [marca, setMarca] = useState('');
  const [categoria, setCategoria] = useState('');
  const [motor, setMotor] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);

    fetchMotosPaginated({
      page,
      limit,
      search: search || undefined,
      searchField: search ? 'modelo' : undefined,
      sort,
      order,
    })
      .then((data) => {
        if (active) {
          setMotos(data.items);
          setTotalPages(data.meta.totalPages || 1);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error(err);
          setError('No se pudieron cargar las motocicletas.');
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [page, limit, search, sort, order]);

  function limpiarFiltros() {
    setBuscar('');
    setMarca('');
    setCategoria('');
    setMotor('');
  }

  return (
    <>
      {/* Hero */}
      <section className="hero-banner">
        <div className="hero-overlay" />
        <div className="hero-content container">
          <h1 className="hero-title">La moto de tus sueños te está esperando</h1>
          <p className="hero-subtitle">
            {stats.motos > 0
              ? `${stats.motos} modelos disponibles en nuestro catálogo, nuevos y usados`
              : 'Explorá nuestro catálogo de motocicletas nuevas y usadas'}
          </p>
          <div className="hero-cta">
            <a href="#catalogo" className="hero-btn-primary">
              Ver Catálogo
            </a>
            <a
              href="https://wa.me/593985345265"
              target="_blank"
              rel="noreferrer"
              className="hero-btn-secondary"
            >
              Cotizar Ahora
            </a>
          </div>
        </div>
      </section>

      <HeroCarousel motos={todasLasMotos} />

      {/* Estadísticas reales */}
      <section className="stats-bar">
        <div className="container stats-grid">
          <div className="stat-item">
            <MotorcycleIcon className="stat-icon" />
            <span className="stat-value">{stats.motos}</span>
            <span className="stat-label">Motos disponibles</span>
          </div>
          <div className="stat-item">
            <TagIcon className="stat-icon" />
            <span className="stat-value">{stats.marcas}</span>
            <span className="stat-label">Marcas</span>
          </div>
          <div className="stat-item">
            <LayersIcon className="stat-icon" />
            <span className="stat-value">{stats.categorias}</span>
            <span className="stat-label">Categorías</span>
          </div>
          <div className="stat-item">
            <BoxIcon className="stat-icon" />
            <span className="stat-value">{stats.stock}</span>
            <span className="stat-label">Unidades en stock</span>
          </div>
        </div>
      </section>

      <div className="container py-4" id="catalogo">
        <header className="catalog-header animated-fade-in">
          <h1 className="catalog-title">Motor-Biker Catálogo</h1>
          <p className="catalog-subtitle">
            Explora nuestra selección exclusiva de motocicletas de alto rendimiento y estilo inigualable.
          </p>
        </header>

      <div className="filter-bar animated-fade-in">
        <input
          type="text"
          className="filter-input"
          placeholder="Buscar por modelo"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <input
          type="text"
          className="filter-input"
          placeholder="Buscar por marca"
          value={marca}
          onChange={(e) => setMarca(e.target.value)}
        />
        <input
          type="text"
          className="filter-input"
          placeholder="Buscar por categoría"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        />
        <input
          type="text"
          className="filter-input"
          placeholder="Buscar por motor"
          value={motor}
          onChange={(e) => setMotor(e.target.value)}
        />
        <button type="button" className="btn-clear-filters" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Buscando las mejores motos para ti...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger text-center glass-card my-4" role="alert">
          {error}
        </div>
      ) : motosFiltradas.length === 0 ? (
        <div className="text-center py-5 text-muted">
          Ninguna moto coincide con los filtros aplicados.
        </div>
      ) : (
        <div className="row g-4 justify-content-center">
          {motosFiltradas.map((moto) => (
            <div key={moto.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
              <MotoCard moto={moto} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;
