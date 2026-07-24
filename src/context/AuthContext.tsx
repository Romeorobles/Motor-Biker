import { createContext, useContext, useState, type ReactNode } from 'react'
import * as authService from '../services/authService'
import type { LoginData, RegisterData } from '../services/authService'

interface JwtPayload {
  id: string
  username: string
  role: string
}

interface AuthContextType {
  user: JwtPayload | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function decodeToken(token: string): JwtPayload {
  return JSON.parse(atob(token.split('.')[1]))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<JwtPayload | null>(() => {
    const token = localStorage.getItem('token')
    return token ? decodeToken(token) : null
  })

  function saveToken(token: string) {
    localStorage.setItem('token', token)
    setUser(decodeToken(token))
  }

  async function login(data: LoginData) {
    const token = await authService.login(data)
    saveToken(token)
  }

  async function register(data: RegisterData) {
    const token = await authService.register(data)
    saveToken(token)
  }

  function logout() {
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}
