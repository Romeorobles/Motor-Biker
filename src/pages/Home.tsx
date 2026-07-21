import { Comentarios } from '../components/Comentarios';
import { Reserva } from '../components/Reserva';

export const Home = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Prueba de Integración - Parte 3
      </h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold mb-2">Moto de Prueba</h2>
        <p className="text-gray-600 mb-6 bg-yellow-100 p-3 rounded border border-yellow-300">
          ⚠️ Nota: Aquí arriba irían las fotos y los detalles que está haciendo la Persona 2. 
          Lo de abajo es tu código funcionando:
        </p>
        
        <hr className="my-6 border-gray-300" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Flujo de Reserva</h3>
            <Reserva motoId="moto-123" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Sección de Comentarios</h3>
            <Comentarios />
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Home;