import { axiosClient } from '../api/axiosClient';

export interface CarritoItem {
  id: string;
  usuario_id: string;
  moto_id: string;
  fecha_agregado: string;
}

export async function fetchCarrito(usuario_id: string): Promise<CarritoItem[]> {
  const res = await axiosClient.get(`/carrito/usuario/${usuario_id}`);
  return res.data.data as CarritoItem[];
}

export async function addToCarrito(usuario_id: string, moto_id: string): Promise<CarritoItem> {
  const res = await axiosClient.post('/carrito', { usuario_id, moto_id });
  return res.data.data as CarritoItem;
}

export async function removeFromCarrito(id: string): Promise<CarritoItem> {
  const res = await axiosClient.delete(`/carrito/${id}`);
  return res.data.data as CarritoItem;
}

export async function removeByMotoAndUser(usuario_id: string, moto_id: string): Promise<CarritoItem> {
  const res = await axiosClient.delete(`/carrito/usuario/${usuario_id}/moto/${moto_id}`);
  return res.data.data as CarritoItem;
}

export async function clearCarrito(usuario_id: string): Promise<void> {
  await axiosClient.delete(`/carrito/usuario/${usuario_id}/clear`);
}
