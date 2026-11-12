import { Maximize2, Minimize2, X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { useMediaQuery } from '@/utils/useMediaQuery'

/**
 * Secondary panel for the original document and extracted details.
 * Desktop: a collapsible right-side column that can widen for editing and source inspection.
 * Mobile: a full-height drawer.
 */
export function DetailsPanel({
  open,
  onClose,
  expanded,
  onToggleExpand,
  title,
  subtitle,
  children,
  footer,
  closeLabel = 'Close document details',
}: {
  open: boolean
  onClose: () => void
  expanded: boolean
  onToggleExpand: () => void
  title: ReactNode
  subtitle?: ReactNode
  children: ReactNode
  footer?: ReactNode
  closeLabel?: string
}) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const ref = useRef<HTMLElement>(null)
  const titleId = useId()

  useEffect(() => {
    if (!open || isDesktop) return
    const prev = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [open, isDesktop, onClose])

  if (!open) return null

  const header = (
    <div className="flex items-start gap-2 border-b border-mist bg-white px-4 py-3">
      <div className="min-w-0 flex-1">
        <h2 id={titleId} className="text-lg font-bold leading-tight text-navy">
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-ink/70">{subtitle}</p>}
      </div>
      {isDesktop && (
        <button
          type="button"
          onClick={onToggleExpand}
          className="grid size-11 shrink-0 place-items-center rounded-full text-ink/70 hover:bg-pale"
          aria-label={expanded ? 'Make panel narrower' : 'Expand panel for editing and source inspection'}
          aria-pressed={expanded}
        >
          {expanded ? <Minimize2 className="size-5" aria-hidden /> : <Maximize2 className="size-5" aria-hidden />}
        </button>
      )}
      <button type="button" onClick={onClose} className="grid size-11 shrink-0 place-items-center rounded-full text-ink/70 hover:bg-pale" aria-label={closeLabel}>
        <X className="size-5" aria-hidden />
      </button>
    </div>
  )

  if (isDesktop) {
    return (
      <aside
        aria-labelledby={titleId}
        className={`sticky top-0 flex h-dvh shrink-0 flex-col border-l border-mist bg-canvas transition-[width] duration-300 motion-reduce:transition-none ${
          expanded ? 'w-[min(880px,58vw)]' : 'w-[440px]'
        }`}
      >
        {header}
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="border-t border-mist bg-white px-4 py-3">{footer}</div>}
      </aside>
    )
  }

  return (
    <section
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      className="fixed inset-0 z-[1150] flex animate-sheet-up flex-col bg-canvas outline-none"
    >
      {header}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
      {footer && <div className="border-t border-mist bg-white px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">{footer}</div>}
    </section>
  )
}

/** Original document block shown at the top of the panel (or beside details when expanded). */
export function PanelOriginal({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <details id={id} open className="group scroll-mt-24 rounded-3xl bg-white p-3 shadow-card">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 px-2 text-sm font-bold text-navy">
        Original document
        <span className="text-xs font-semibold text-royal group-open:hidden">Show</span>
        <span className="hidden text-xs font-semibold text-royal group-open:inline">Hide</span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  )
}
