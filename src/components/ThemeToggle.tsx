import { useEffect, useState } from 'react'
import './ThemeToggle.css'

type Theme = 'night' | 'day'

function getInitialTheme(): Theme {
  return localStorage.getItem('theme') === 'day' ? 'day' : 'night'
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  function toggle() {
    setTheme((t) => (t === 'night' ? 'day' : 'night'))
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === 'night' ? 'Cambiar a modo día' : 'Cambiar a modo noche'}
      title={theme === 'night' ? 'Modo Día' : 'Modo Noche'}
    >
      {theme === 'night' ? '☀️' : '🌙'}
    </button>
  )
}

export default ThemeToggle
