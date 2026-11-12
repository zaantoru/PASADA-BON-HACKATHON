import { ChevronLeft } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'
import { href } from '@/utils/router'

/**
 * Standard screen: a colored header that flows into a rounded content area.
 */
export function Screen({
  title,
  subtitle,
  back,
  backLabel = 'Back',
  actions,
  headerContent,
  children,
  footer,
  width = 'md',
  eyebrow,
}: {
  title: ReactNode
  subtitle?: ReactNode
  back?: string
  backLabel?: string
  actions?: ReactNode
  headerContent?: ReactNode
  children: ReactNode
  footer?: ReactNode
  width?: 'md' | 'lg'
  eyebrow?: ReactNode
}) {
  const h1 = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    h1.current?.focus({ preventScroll: true })
  }, [])
  const max = width === 'lg' ? 'max-w-5xl' : 'max-w-2xl'

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="on-dark relative overflow-hidden bg-gradient-to-br from-navy via-navy to-royal px-4 pb-12 pt-4 text-white sm:px-6">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-cornflower/25" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 right-24 size-40 rounded-full bg-royal/40" />
        <div className={`relative mx-auto ${max}`}>
          <div className="flex min-h-11 items-center gap-2">
            {back && (
              <a
                href={href(back)}
                className="-ml-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-white/10"
                aria-label={backLabel}
              >
                <ChevronLeft className="size-6" aria-hidden />
              </a>
            )}
            <div className="min-w-0 flex-1">
              {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-white/80">{eyebrow}</p>}
              <h1 ref={h1} tabIndex={-1} className="truncate text-xl font-bold sm:text-2xl">
                {title}
              </h1>
            </div>
            {actions}
          </div>
          {subtitle && <p className="mt-1 text-sm text-white/85">{subtitle}</p>}
          {headerContent && <div className="mt-4">{headerContent}</div>}
        </div>
      </header>
      <main className="relative -mt-7 flex-1 rounded-t-[28px] bg-canvas px-4 pb-32 pt-6 sm:px-6 lg:pb-16">
        <div className={`mx-auto ${max}`}>{children}</div>
      </main>
      {footer && (
        <div className="sticky bottom-0 z-[1040] border-t border-mist bg-white/95 px-4 py-3 backdrop-blur lg:bottom-0">
          <div className={`mx-auto ${max}`}>{footer}</div>
        </div>
      )}
    </div>
  )
}
