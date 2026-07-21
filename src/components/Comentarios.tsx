import { useState } from 'react';

interface Comentario {
  id: number;
  texto: string;
  usuario: string;
  fecha: string;
}

export const Comentarios = () => {
  const [comentarios, setComentarios] = useState<Comentario[]>([
    { 
      id: 1, 
      texto: 'Excelente máquina, la uso todos los días para rodar en la ciudad y rinde perfecto.', 
      usuario: 'Usuario de prueba', 
      fecha: new Date().toLocaleDateString() 
    }
  ]);
  const [nuevoTexto, setNuevoTexto] = useState('');

  const manejarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTexto.trim()) return;

    const nuevoComentario: Comentario = {
      id: Date.now(),
      texto: nuevoTexto,
      usuario: 'Tú', 
      fecha: new Date().toLocaleDateString(),
    };
    
    setComentarios([...comentarios, nuevoComentario]);
    setNuevoTexto(''); 
  };

  return (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Comentarios</h3>
      
      <div className="mb-6 space-y-3 max-h-60 overflow-y-auto">
        {comentarios.length === 0 ? (
          <p className="text-gray-500 italic">No hay comentarios. Sé el primero.</p>
        ) : (
          comentarios.map((c) => (
            <div key={c.id} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
              <div className="flex justify-between text-sm text-gray-500 mb-1">
                <span className="font-bold text-gray-700">{c.usuario}</span>
                <span>{c.fecha}</span>
              </div>
              <p className="text-gray-800">{c.texto}</p>
            </div>
          ))
        )}
      </div>
      
      <form onSubmit={manejarSubmit} className="flex gap-2">
        <input 
          type="text" 
          value={nuevoTexto} 
          onChange={(e) => setNuevoTexto(e.target.value)} 
          placeholder="Escribe tu opinión sobre esta moto..."
          className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:border-blue-500"
        />
        <button 
          type="submit" 
          disabled={!nuevoTexto.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 transition-colors"
        >
          Enviar
        </button>
      </form>
    </div>
  );
};