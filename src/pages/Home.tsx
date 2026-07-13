import { useEffect, useState } from 'react';
import { Moto, fetchMotos } from '../services/api';
import { MotoCard } from '../components/MotoCard';

function Home() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="container py-4">
      <header className="catalog-header animated-fade-in">
        <h1 className="catalog-title">Motor-Biker Catálogo</h1>
        <p className="catalog-subtitle">
          Explora nuestra selección exclusiva de motocicletas de alto rendimiento y estilo inigualable.
        </p>
      </header>

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
      ) : (
        <div className="row g-4 justify-content-center">
          {motos.map((moto) => (
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
