import { useEffect, useState } from 'react';
import { fetchMotosPaginated } from '../services/api';
import type { Moto } from '../services/api';
import { MotoCard } from '../components/MotoCard';

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
  }

  return (
    <div className="container py-4">
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
      ) : motos.length === 0 ? (
        <div className="text-center py-5 text-muted">
          Ninguna moto coincide con los filtros aplicados.
        </div>
      ) : (
        <>
          <div className="row g-4 justify-content-center">
            {motos.map((moto) => (
              <div key={moto.id} className="col-12 col-md-6 col-lg-4 col-xl-3">
                <MotoCard moto={moto} />
              </div>
            ))}
          </div>

          {/* Frontend Pagination controls styled similarly to admin panels */}
          {totalPages > 1 && (
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
  );
}

export default Home;
