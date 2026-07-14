import { apiFetch } from './api'

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
  const res = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.data.access_token
}

export async function register(data: RegisterData): Promise<string> {
  const res = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return res.data.access_token
}
