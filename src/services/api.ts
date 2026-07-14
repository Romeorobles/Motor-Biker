export interface Moto {
  id: string;
  modelo: string;
  marca_id?: string;
  marca_nombre?: string;
  anio?: number;
  cilindraje?: number;
  precio: number;
  stock: number;
  categoria_id?: string;
  tipo_motor_id?: string;
  tipo_motor_nombre?: string;
  estado_id?: string;
  estado_nombre?: string;
  imagen_url?: string;
}

export interface Marca {
  id: string;
  nombre: string;
  pais: string;
}

export interface EstadoMoto {
  id: string;
  nombre: string;
}

export interface TipoMotor {
  id: string;
  nombre: string;
  descripcion?: string;
}

export const API_URL = 'http://localhost:3000';

// Mock data of high-quality bikes with the professional images generated earlier
export const MOCK_MOTOS: Moto[] = [
  {
    id: 'f87a3b34-8c8d-4a1b-9e4f-2d7c5e8b1a3d',
    modelo: 'Panigale V4 S',
    marca_nombre: 'Ducati',
    anio: 2024,
    cilindraje: 1103,
    precio: 31500,
    stock: 3,
    tipo_motor_nombre: 'Desmosedici Stradale V4 de 4 tiempos',
    estado_nombre: 'Nueva',
    imagen_url: '/sport_bike.jpg',
  },
  {
    id: 'a91b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d',
    modelo: 'Fat Boy 114',
    marca_nombre: 'Harley-Davidson',
    anio: 2023,
    cilindraje: 1868,
    precio: 26800,
    stock: 5,
    tipo_motor_nombre: 'Milwaukee-Eight 114 V-Twin 4 tiempos',
    estado_nombre: 'Seminueva',
    imagen_url: '/cruiser_bike.jpg',
  },
  {
    id: 'c1d2e3f4-a5b6-c7d8-e9f0-1a2b3c4d5e6f',
    modelo: 'Vespa Elettrica',
    marca_nombre: 'Piaggio',
    anio: 2024,
    cilindraje: 150, // Equivalente de potencia
    precio: 7999,
    stock: 8,
    tipo_motor_nombre: 'Eléctrico sin escobillas',
    estado_nombre: 'Nueva',
    imagen_url: '/scooter_bike.jpg',
  },
  {
    id: 'e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0',
    modelo: 'R 1250 GS Adventure',
    marca_nombre: 'BMW',
    anio: 2022,
    cilindraje: 1254,
    precio: 24500,
    stock: 2,
    tipo_motor_nombre: 'Bóxer de 2 cilindros y 4 tiempos',
    estado_nombre: 'Usada',
    imagen_url: '/sport_bike.jpg', // Reusamos para simular catálogo variado
  }
];

export async function fetchMotos(): Promise<Moto[]> {
  try {
    const response = await fetch(`${API_URL}/motos`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const result = await response.json();

    // El backend devuelve SuccessResponseDto con data: Pagination<Moto>
    const motosRaw: Moto[] = result.data?.items || result.data || [];

    if (motosRaw.length === 0) {
      console.log('El backend no tiene motos registradas. Usando datos de prueba.');
      return MOCK_MOTOS;
    }

    // Opcionalmente resolvemos marcas, estados y motores si el backend provee los endpoints
    // Intentamos resolver de manera paralela con fallbacks
    const [marcas, estados, motores] = await Promise.all([
      fetchMarcas().catch(() => []),
      fetchEstados().catch(() => []),
      fetchMotores().catch(() => []),
    ]);

    const marcasMap = new Map(marcas.map(m => [m.id, m.nombre]));
    const estadosMap = new Map(estados.map(e => [e.id, e.nombre]));
    const motoresMap = new Map(motores.map(m => [m.id, m.nombre]));

    return motosRaw.map(moto => ({
      ...moto,
      marca_nombre: moto.marca_id ? marcasMap.get(moto.marca_id) || 'Marca Desconocida' : undefined,
      estado_nombre: moto.estado_id ? estadosMap.get(moto.estado_id) || 'Estado Desconocido' : undefined,
      tipo_motor_nombre: moto.tipo_motor_id ? motoresMap.get(moto.tipo_motor_id) || 'Motor Desconocido' : undefined,
      precio: Number(moto.precio),
      imagen_url: moto.imagen_url || '/sport_bike.jpg', // Imagen de stock si no tiene
    }));
  } catch (error) {
    console.warn('No se pudo conectar al backend. Cargando datos de prueba (Mock Data).', error);
    return MOCK_MOTOS;
  }
}

export async function fetchMotoById(id: string): Promise<Moto | null> {
  try {
    const response = await fetch(`${API_URL}/motos/${id}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const result = await response.json();
    const motoRaw: Moto = result.data || result;

    // Resolver relaciones de esta moto específica
    let marca_nombre = undefined;
    let estado_nombre = undefined;
    let tipo_motor_nombre = undefined;

    if (motoRaw.marca_id) {
      const responseM = await fetch(`${API_URL}/marcas/${motoRaw.marca_id}`).catch(() => null);
      if (responseM?.ok) {
        const resM = await responseM.json();
        marca_nombre = resM.data?.nombre || resM.nombre;
      }
    }

    if (motoRaw.estado_id) {
      const responseE = await fetch(`${API_URL}/estado-moto/${motoRaw.estado_id}`).catch(() => null);
      if (responseE?.ok) {
        const resE = await responseE.json();
        estado_nombre = resE.data?.nombre || resE.nombre;
      }
    }

    if (motoRaw.tipo_motor_id) {
      const responseT = await fetch(`${API_URL}/tipo-motor/${motoRaw.tipo_motor_id}`).catch(() => null);
      if (responseT?.ok) {
        const resT = await responseT.json();
        tipo_motor_nombre = resT.data?.nombre || resT.nombre;
      }
    }

    return {
      ...motoRaw,
      marca_nombre: marca_nombre || 'Marca Desconocida',
      estado_nombre: estado_nombre || 'Estado Desconocido',
      tipo_motor_nombre: tipo_motor_nombre || 'Motor Desconocido',
      precio: Number(motoRaw.precio),
      imagen_url: motoRaw.imagen_url || '/sport_bike.jpg',
    };
  } catch (error) {
    console.warn(`No se pudo buscar la moto ${id} en el backend. Buscando en Mock Data.`, error);
    const mockFound = MOCK_MOTOS.find(m => m.id === id);
    return mockFound || null;
  }
}

// Master tables endpoints fetches
async function fetchMarcas(): Promise<Marca[]> {
  const res = await fetch(`${API_URL}/marcas`);
  if (!res.ok) throw new Error();
  const json = await res.json();
  return json.data?.items || json.data || [];
}

async function fetchEstados(): Promise<EstadoMoto[]> {
  const res = await fetch(`${API_URL}/estado-moto`);
  if (!res.ok) throw new Error();
  const json = await res.json();
  return json.data?.items || json.data || [];
}

async function fetchMotores(): Promise<TipoMotor[]> {
  const res = await fetch(`${API_URL}/tipo-motor`);
  if (!res.ok) throw new Error();
  const json = await res.json();
  return json.data?.items || json.data || [];
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body.message || 'Error en la petición');
  }

  return body;
}
