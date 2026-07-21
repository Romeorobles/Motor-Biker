import { Comentarios } from '../components/Comentarios';
import { Reserva } from '../components/Reserva';

return (
  <div className="contenedor-detalle-moto">
    {}
    
    {/* TU PARTE AÑADIDA */}
    <div className="grid md:grid-cols-2 gap-6 mt-8">
      <Reserva motoId="123" />
      <Comentarios />
    </div>
  </div>
)