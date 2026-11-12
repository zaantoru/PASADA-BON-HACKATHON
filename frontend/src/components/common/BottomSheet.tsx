import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * Mobile bottom sheet; on desktop it docks as a floating panel on the right.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  eyebrow?: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  const ref = useRef<HTMLElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-[1090] animate-fade-in bg-ink/35 lg:hidden" onClick={onClose} aria-hidden />
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="fixed inset-x-0 bottom-0 z-[1100] flex max-h-[86dvh] animate-sheet-up flex-col rounded-t-[28px] bg-white shadow-sheet outline-none lg:inset-x-auto lg:bottom-6 lg:right-6 lg:top-6 lg:max-h-none lg:w-[420px] lg:rounded-[28px]"
      >
        <div className="mx-auto mt-2.5 h-1.5 w-11 rounded-full bg-mist lg:hidden" aria-hidden />
        <div className="flex items-start gap-3 px-5 pb-2 pt-3">
          <div className="min-w-0 flex-1">
            {eyebrow && <div className="mb-1.5">{eyebrow}</div>}
            <h2 id={titleId} className="text-xl font-bold leading-tight text-navy">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-ink/70 hover:bg-pale"
            aria-label="Close"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
        {footer && <div className="border-t border-mist px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </section>
    </>
  )
}
