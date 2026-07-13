export const API_URL = 'http://localhost:3000'

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token')

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const body = await response.json()

  if (!response.ok) {
    throw new Error(body.message || 'Error en la petición')
  }

  return body
}
