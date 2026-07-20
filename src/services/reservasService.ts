import { axiosClient } from '../api/axiosClient'

export async function createReserva(usuarioId: string, motoId: string): Promise<void> {
  await axiosClient.post('/reservas', {
    usuario_id: usuarioId,
    moto_id: motoId,
    fecha_reserva: new Date().toISOString(),
    estado: 'pendiente',
  })
}
