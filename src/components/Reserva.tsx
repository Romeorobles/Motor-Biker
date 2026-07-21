import { useState } from 'react';

interface ReservaProps {
  motoId?: string; 
}

export const Reserva = ({ motoId = 'default-id' }: ReservaProps) => {
  const [estado, setEstado] = useState<'idle' | 'loading' | 'success'>('idle');

  const procesarReserva = () => {
    setEstado('loading');
    
    setTimeout(() => {
      console.log(`Reserva procesada para la moto ID: ${motoId}`);
      setEstado('success');
    }, 1500);
  };

  return (
    <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200 text-center shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">¿Te interesa llevarte esta moto?</h3>
      <p className="text-gray-600 mb-4 text-sm">Inicia el proceso de reserva de forma rápida y segura.</p>
      
      {estado === 'success' ? (
        <div className="bg-green-100 text-green-800 font-bold p-3 rounded border border-green-300">
          ✓ ¡Reserva iniciada exitosamente! Revisa tu perfil.
        </div>
      ) : (
        <button 
          onClick={procesarReserva}
          disabled={estado === 'loading'}
          className={`w-full font-bold py-3 px-4 rounded transition-colors ${
            estado === 'loading' 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          {estado === 'loading' ? 'Procesando reserva...' : 'Reservar Moto'}
        </button>
      )}
    </div>
  );
};