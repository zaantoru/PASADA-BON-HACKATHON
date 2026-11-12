import { createContext } from 'react'

export const ToastContext = createContext<(message: string, tone?: 'success' | 'error') => void>(() => {})
