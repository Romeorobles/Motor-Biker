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

  // States for backend pagination, search, sorting and limit
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('modelo');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState<Stats>({ motos: 0, marcas: 0, categorias: 0, stock: 0 });
  const [marcasList, setMarcasList] = useState<Option[]>([]);
  const [todasLasMotos, setTodasLasMotos] = useState<Moto[]>([]);

  // Sidebar de filtros (marca / precio / cilindraje)
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<Set<string>>(new Set());
  const [precioMax, setPrecioMax] = useState<number | null>(null);
  const [cilindrajeMin, setCilindrajeMin] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetchAllPages<Moto>('/motos', 100),
      fetchAllPages<Option>('/marcas', 100),
      fetchAllPages<Option>('/categorias', 100),
    ])
      .then(([allMotos, marcas, categorias]) => {
        setStats({
          motos: allMotos.length,
          marcas: marcas.length,
          categorias: categorias.length,
          stock: allMotos.reduce((sum, m) => sum + (m.stock || 0), 0),
        });
        setMarcasList(marcas);
        setTodasLasMotos(allMotos);
      })
      .catch((err) => console.error('No se pudieron cargar las estadísticas', err));
  }, []);

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
    setSearch('');
    setSort('modelo');
    setOrder('ASC');
    setPage(1);
    setLimit(8);
    setMarcasSeleccionadas(new Set());
    setPrecioMax(null);
    setCilindrajeMin(null);
  }

  function toggleMarca(nombre: string) {
    setMarcasSeleccionadas((prev) => {
      const next = new Set(prev);
      if (next.has(nombre)) next.delete(nombre);
      else next.add(nombre);
      return next;
    });
  }

  const motosFiltradas = motos.filter((moto) => {
    if (marcasSeleccionadas.size > 0 && !marcasSeleccionadas.has(moto.marca_nombre || '')) return false;
    if (precioMax !== null && moto.precio > precioMax) return false;
    if (cilindrajeMin !== null && (moto.cilindraje || 0) < cilindrajeMin) return false;
    return true;
  });

  const filtrosSidebarActivos = marcasSeleccionadas.size > 0 || precioMax !== null || cilindrajeMin !== null;

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

        {/* Advanced Catalog Filters */}
        <div className="filter-bar animated-fade-in">
          {/* Search by Model */}
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por modelo"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset page on search change
            }}
          />

          {/* Sort Field */}
          <select
            className="filter-input"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
          >
            <option value="modelo">Ordenar por Modelo</option>
            <option value="precio">Ordenar por Precio</option>
            <option value="anio">Ordenar por Año</option>
            <option value="stock">Ordenar por Stock</option>
          </select>

          {/* Sort Order */}
          <select
            className="filter-input"
            value={order}
            onChange={(e) => {
              setOrder(e.target.value as 'ASC' | 'DESC');
              setPage(1);
            }}
          >
            <option value="ASC">Orden Ascendente</option>
            <option value="DESC">Orden Descendente</option>
          </select>

          {/* Limit Selector */}
          <select
            className="filter-input"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={4}>4 por página</option>
            <option value={8}>8 por página</option>
            <option value={12}>12 por página</option>
            <option value={16}>16 por página</option>
          </select>

          <button type="button" className="btn-clear-filters" onClick={limpiarFiltros}>
            Limpiar filtros
          </button>
        </div>

        <div className="catalog-layout">
          {/* Sidebar de filtros */}
          <aside className="catalog-sidebar animated-fade-in">
            <h3 className="sidebar-title">Filtrar por</h3>

            <div className="sidebar-group">
              <h4>Marca</h4>
              {marcasList.map((m) => (
                <label key={m.id} className="sidebar-checkbox">
                  <input
                    type="checkbox"
                    checked={marcasSeleccionadas.has(m.nombre)}
                    onChange={() => toggleMarca(m.nombre)}
                  />
                  {m.nombre}
                </label>
              ))}
              {marcasList.length === 0 && <p className="sidebar-empty">Sin marcas cargadas</p>}
            </div>

            <div className="sidebar-group">
              <h4>Precio máximo</h4>
              {[3000, 6000, 10000].map((p) => (
                <label key={p} className="sidebar-checkbox">
                  <input
                    type="radio"
                    name="precioMax"
                    checked={precioMax === p}
                    onChange={() => setPrecioMax(p)}
                  />
                  Hasta ${p.toLocaleString()}
                </label>
              ))}
              <label className="sidebar-checkbox">
                <input type="radio" name="precioMax" checked={precioMax === null} onChange={() => setPrecioMax(null)} />
                Cualquier precio
              </label>
            </div>

            <div className="sidebar-group">
              <h4>Cilindraje mínimo</h4>
              {[125, 250, 600].map((c) => (
                <label key={c} className="sidebar-checkbox">
                  <input
                    type="radio"
                    name="cilindrajeMin"
                    checked={cilindrajeMin === c}
                    onChange={() => setCilindrajeMin(c)}
                  />
                  Desde {c}cc
                </label>
              ))}
              <label className="sidebar-checkbox">
                <input
                  type="radio"
                  name="cilindrajeMin"
                  checked={cilindrajeMin === null}
                  onChange={() => setCilindrajeMin(null)}
                />
                Cualquier cilindraje
              </label>
            </div>
          </aside>

          {/* Catálogo */}
          <div className="catalog-main">
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
              <>
                <div className="row g-4 justify-content-center">
                  {motosFiltradas.map((moto, i) => (
                    <div
                      key={moto.id}
                      className="col-12 col-md-6 col-xl-4"
                      style={{ animationDelay: `${i * 0.06}s` }}
                    >
                      <MotoCard moto={moto} />
                    </div>
                  ))}
                </div>

                {!filtrosSidebarActivos && totalPages > 1 && (
                  <div className="d-flex justify-content-center align-items-center gap-3 mt-5">
                    <button
                      className="btn btn-outline-light px-4"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Anterior
                    </button>
                    <span className="text-muted">
                      Página <strong>{page}</strong> de {totalPages}
                    </span>
                    <button
                      className="btn btn-outline-light px-4"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <FinancingCalculator />

      {/* Marcas */}
      {marcasList.length > 0 && (
        <section className="brands-section">
          <div className="container">
            <h2 className="brands-title">Marcas con las que trabajamos</h2>
            <div className="brands-list">
              {marcasList.map((m) => (
                <span key={m.id} className="brand-pill">
                  {m.nombre}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default Home;
