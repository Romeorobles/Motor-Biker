import { useEffect, useMemo, useState } from 'react';
import { fetchMotos } from '../services/api';
import type { Moto } from '../services/api';
import { MotoCard } from '../components/MotoCard';

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
    fetchMotos()
      .then((data) => {
        if (active) {
          setMotos(data);
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
  }, []);

  const motosFiltradas = useMemo(() => {
    return motos.filter((moto) => {
      return (
        moto.modelo.toLowerCase().includes(buscar.toLowerCase()) &&
        (moto.marca_nombre ?? '').toLowerCase().includes(marca.toLowerCase()) &&
        (moto.categoria_nombre ?? '').toLowerCase().includes(categoria.toLowerCase()) &&
        (moto.tipo_motor_nombre ?? '').toLowerCase().includes(motor.toLowerCase())
      );
    });
  }, [motos, buscar, marca, categoria, motor]);

  function limpiarFiltros() {
    setBuscar('');
    setMarca('');
    setCategoria('');
    setMotor('');
  }

  return (
    <div className="container py-4">
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
