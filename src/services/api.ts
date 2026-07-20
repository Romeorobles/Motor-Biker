import { axiosClient } from '../api/axiosClient';

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
  categoria_nombre?: string;
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

export interface Categoria {
  id: string;
  nombre: string;
  descripcion?: string;
}

export async function fetchMotos(): Promise<Moto[]> {
  const { data: result } = await axiosClient.get('/motos');

  // El backend devuelve SuccessResponseDto con data: Pagination<Moto>
  const motosRaw: Moto[] = result.data?.items || result.data || [];

  if (motosRaw.length === 0) {
    return [];
  }

  // Resolvemos marcas, estados, motores y categorías en paralelo con fallbacks
  const [marcas, estados, motores, categorias] = await Promise.all([
    fetchMarcas().catch(() => []),
    fetchEstados().catch(() => []),
    fetchMotores().catch(() => []),
    fetchCategorias().catch(() => []),
  ]);

  const marcasMap = new Map(marcas.map((m) => [m.id, m.nombre]));
  const estadosMap = new Map(estados.map((e) => [e.id, e.nombre]));
  const motoresMap = new Map(motores.map((m) => [m.id, m.nombre]));
  const categoriasMap = new Map(categorias.map((c) => [c.id, c.nombre]));

  return motosRaw.map((moto) => ({
    ...moto,
    marca_nombre: moto.marca_id ? marcasMap.get(moto.marca_id) || 'Marca Desconocida' : undefined,
    estado_nombre: moto.estado_id ? estadosMap.get(moto.estado_id) || 'Estado Desconocido' : undefined,
    tipo_motor_nombre: moto.tipo_motor_id ? motoresMap.get(moto.tipo_motor_id) || 'Motor Desconocido' : undefined,
    categoria_nombre: moto.categoria_id ? categoriasMap.get(moto.categoria_id) || 'Categoría Desconocida' : undefined,
    precio: Number(moto.precio),
    imagen_url: moto.imagen_url || '/sport_bike.jpg',
  }));
}

export async function fetchMotoById(id: string): Promise<Moto | null> {
  const { data: result } = await axiosClient.get(`/motos/${id}`);
  const motoRaw: Moto = result.data || result;

  // Resolver relaciones de esta moto específica
  let marca_nombre: string | undefined;
  let estado_nombre: string | undefined;
  let tipo_motor_nombre: string | undefined;

  if (motoRaw.marca_id) {
    marca_nombre = await axiosClient
      .get(`/marcas/${motoRaw.marca_id}`)
      .then((res) => res.data.data?.nombre || res.data.nombre)
      .catch(() => undefined);
  }

  if (motoRaw.estado_id) {
    estado_nombre = await axiosClient
      .get(`/estado-moto/${motoRaw.estado_id}`)
      .then((res) => res.data.data?.nombre || res.data.nombre)
      .catch(() => undefined);
  }

  if (motoRaw.tipo_motor_id) {
    tipo_motor_nombre = await axiosClient
      .get(`/tipo-motor/${motoRaw.tipo_motor_id}`)
      .then((res) => res.data.data?.nombre || res.data.nombre)
      .catch(() => undefined);
  }

  return {
    ...motoRaw,
    marca_nombre: marca_nombre || 'Marca Desconocida',
    estado_nombre: estado_nombre || 'Estado Desconocido',
    tipo_motor_nombre: tipo_motor_nombre || 'Motor Desconocido',
    precio: Number(motoRaw.precio),
    imagen_url: motoRaw.imagen_url || '/sport_bike.jpg',
  };
}

// Endpoints de tablas maestras
async function fetchMarcas(): Promise<Marca[]> {
  const { data: json } = await axiosClient.get('/marcas');
  return json.data?.items || json.data || [];
}

async function fetchEstados(): Promise<EstadoMoto[]> {
  const { data: json } = await axiosClient.get('/estado-moto');
  return json.data?.items || json.data || [];
}

async function fetchMotores(): Promise<TipoMotor[]> {
  const { data: json } = await axiosClient.get('/tipo-motor');
  return json.data?.items || json.data || [];
}

async function fetchCategorias(): Promise<Categoria[]> {
  const { data: json } = await axiosClient.get('/categorias');
  return json.data?.items || json.data || [];
}
