import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchCarrito, removeFromCarrito, clearCarrito, type CarritoItem } from '../services/carritoService';
import { fetchMotoById, type Moto } from '../services/api';
import { createItem } from '../services/adminService';
import Toast, { type ToastData } from '../components/Toast';

interface CartItemWithDetails {
  cartId: string;
  moto: Moto;
}

function Carrito() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  // Form states
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'transferencia'>('efectivo');
  const [cuotas, setCuotas] = useState<number>(1);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    let active = true;

    async function loadCart() {
      try {
        setLoading(true);
        const cartItems: CarritoItem[] = await fetchCarrito(userId);
        
        // Fetch details for each moto in parallel
        const detailsPromises = cartItems.map(async (item) => {
          try {
            const moto = await fetchMotoById(item.moto_id);
            if (moto) {
              return { cartId: item.id, moto };
            }
          } catch (e) {
            console.error(`Error loading moto details for ${item.moto_id}`, e);
          }
          return null;
        });

        const resolved = await Promise.all(detailsPromises);
        const filtered = resolved.filter((x): x is CartItemWithDetails => x !== null);

        if (active) {
          setItems(filtered);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error loading cart:', err);
        if (active) {
          setError('No se pudo cargar el carrito.');
          setLoading(false);
        }
      }
    }

    loadCart();

    return () => {
      active = false;
    };
  }, [user]);

  async function handleRemove(cartId: string) {
    try {
      await removeFromCarrito(cartId);
      setItems((prev) => prev.filter((item) => item.cartId !== cartId));
      setToast({ message: 'Motocicleta eliminada del carrito.', type: 'success' });
    } catch (err) {
      console.error(err);
      setToast({ message: 'No se pudo eliminar el elemento.', type: 'error' });
    }
  }

  async function handleCheckout() {
    if (!user || items.length === 0) return;
    
    setCheckingOut(true);
    try {
      // Register a sale for each item in the cart
      const salePromises = items.map((item) => {
        return createItem('/ventas', {
          usuario_id: user.id,
          moto_id: item.moto.id,
          precio_venta: item.moto.precio,
          metodo_pago: metodoPago,
          cuotas: metodoPago === 'tarjeta' ? cuotas : undefined,
          estado: 'pendiente',
          fecha_venta: new Date().toISOString(),
        });
      });

      await Promise.all(salePromises);

      // Clear cart on backend
      await clearCarrito(user.id);

      setItems([]);
      setToast({ message: '¡Compra finalizada con éxito! Pedido registrado.', type: 'success' });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      console.error('Error in checkout:', err);
      setToast({ message: 'Hubo un error al procesar tu pedido.', type: 'error' });
    } finally {
      setCheckingOut(false);
    }
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
  }

  const total = items.reduce((acc, curr) => acc + curr.moto.precio, 0);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-3 text-muted">Cargando tu carrito de compras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-danger glass-card d-inline-block p-4" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 animated-fade-in">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
      
      <header className="catalog-header mb-5">
        <h1 className="catalog-title">Mi Carrito de Compras</h1>
        <p className="catalog-subtitle">Finalizá la adquisición de tus motocicletas reservadas y confirmadas.</p>
      </header>

      {items.length === 0 ? (
        <div className="text-center py-5 glass-card d-flex flex-column align-items-center">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted mb-3">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h3 className="text-light mb-2">Tu carrito está vacío</h3>
          <p className="text-muted mb-4">Las motocicletas que reserves deben ser confirmadas por el administrador para aparecer aquí.</p>
          <button className="btn btn-outline-light px-4" onClick={() => navigate('/')}>
            Ver Catálogo
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {/* Cart items list */}
          <div className="col-12 col-lg-8">
            <div className="d-flex flex-column gap-3">
              {items.map(({ cartId, moto }) => (
                <div key={cartId} className="glass-card p-3 d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                  <div className="d-flex align-items-center gap-3 flex-column flex-sm-row text-center text-sm-start">
                    <img 
                      src={moto.imagen_url || '/sport_bike.jpg'} 
                      alt={moto.modelo} 
                      style={{ width: '100px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <div>
                      <h4 className="text-light mb-1">{moto.modelo}</h4>
                      <div className="d-flex flex-wrap gap-2 justify-content-center justify-content-sm-start text-muted small">
                        <span>Marca: <strong>{moto.marca_nombre || '—'}</strong></span>
                        <span>•</span>
                        <span>Motor: <strong>{moto.tipo_motor_nombre || '—'}</strong></span>
                        <span>•</span>
                        <span>Estado: <strong>{moto.estado_nombre || '—'}</strong></span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="d-flex align-items-center gap-3">
                    <span className="text-light fs-5 fw-bold">{formatPrice(moto.precio)}</span>
                    <button 
                      type="button" 
                      className="btn btn-outline-danger btn-sm p-2" 
                      onClick={() => handleRemove(cartId)}
                      title="Eliminar del carrito"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout summary panel */}
          <div className="col-12 col-lg-4">
            <div className="glass-card p-4">
              <h3 className="text-light mb-4">Resumen de Compra</h3>
              
              <div className="d-flex justify-content-between text-muted mb-2">
                <span>Motocicletas ({items.length})</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="d-flex justify-content-between text-light fs-4 fw-bold border-top border-secondary border-opacity-25 pt-3 mb-4">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Checkout Form */}
              <div className="mb-4">
                <label className="form-label text-muted small fw-bold text-uppercase mb-2">Método de Pago</label>
                <select 
                  className="form-select bg-dark text-light border-secondary"
                  value={metodoPago} 
                  onChange={(e) => setMetodoPago(e.target.value as 'efectivo' | 'tarjeta' | 'transferencia')}
                  style={{ borderRadius: '8px' }}
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="tarjeta">Tarjeta de Crédito</option>
                  <option value="transferencia">Transferencia Bancaria</option>
                </select>
              </div>

              {metodoPago === 'tarjeta' && (
                <div className="mb-4">
                  <label className="form-label text-muted small fw-bold text-uppercase mb-2">Cuotas</label>
                  <select 
                    className="form-select bg-dark text-light border-secondary"
                    value={cuotas} 
                    onChange={(e) => setCuotas(Number(e.target.value))}
                    style={{ borderRadius: '8px' }}
                  >
                    {[1, 3, 6, 12, 18, 24, 36].map((c) => (
                      <option key={c} value={c}>{c} {c === 1 ? 'cuota' : 'cuotas'}</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                type="button" 
                className="btn btn-primary w-100 py-3 fw-bold" 
                disabled={checkingOut}
                onClick={handleCheckout}
                style={{
                  background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-secondary) 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 0 15px var(--accent-glow)'
                }}
              >
                {checkingOut ? 'Procesando...' : 'Finalizar Compra'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Carrito;
