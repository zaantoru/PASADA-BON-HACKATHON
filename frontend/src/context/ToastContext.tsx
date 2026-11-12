import { ToastContext } from './toast-context'
import { CircleAlert, CircleCheck, X } from 'lucide-react'
import { useCallback, useState, type ReactNode } from 'react'

type Tone = 'success' | 'error'
interface Toast {
  id: number
  message: string
  tone: Tone
}


export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const dismiss = (id: number) => setToasts((t) => t.filter((x) => x.id !== id))
  const show = useCallback((message: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => dismiss(id), 5000)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[1300] flex flex-col items-center gap-2 px-4 lg:bottom-8"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-md animate-sheet-up items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-sm text-white shadow-card"
          >
            {t.tone === 'success' ? (
              <CircleCheck className="size-5 shrink-0 text-cornflower" aria-hidden />
            ) : (
              <CircleAlert className="size-5 shrink-0 text-red-300" aria-hidden />
            )}
            <span className="flex-1 font-medium">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="grid size-9 place-items-center rounded-full hover:bg-white/10"
              aria-label="Dismiss message"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
