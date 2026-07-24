import { useEffect } from 'react'
import { CheckIcon } from './icons'

export interface ToastData {
  message: string
  type: 'success' | 'error'
}

interface ToastProps extends ToastData {
  onClose: () => void
}

function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast toast-${type}`} role="status">
      {type === 'success' && <CheckIcon className="toast-icon" />}
      <span>{message}</span>
    </div>
  )
}

export default Toast
