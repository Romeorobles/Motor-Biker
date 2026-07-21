import { axiosClient } from '../api/axiosClient'

export interface LoginData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  nombre?: string
  apellido?: string
}

export async function login(data: LoginData): Promise<string> {
  const res = await axiosClient.post('/auth/login', data)
  return res.data.data.access_token
}

export async function register(data: RegisterData): Promise<string> {
  const res = await axiosClient.post('/auth/register', data)
  return res.data.data.access_token
}
