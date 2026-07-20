export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export interface PasswordStrength {
  score: number
  label: string
  color: string
}

const STRENGTH_LEVELS = [
  { label: 'Muy débil', color: '#dc2626' },
  { label: 'Débil', color: '#f97316' },
  { label: 'Media', color: '#eab308' },
  { label: 'Fuerte', color: '#22c55e' },
  { label: 'Muy fuerte', color: '#16a34a' },
]

export function getPasswordStrength(password: string): PasswordStrength {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++

  const level = STRENGTH_LEVELS[password ? score : 0]
  return { score: password ? score : -1, label: level.label, color: level.color }
}
