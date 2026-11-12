import { useEffect, useRef, type ReactNode } from 'react'
import { useMediaQuery } from '@/utils/useMediaQuery'

/** Map screens: stacked on mobile (header → map → list), side-by-side on desktop. */
export function MapLayout({
  title,
  subtitle,
  controls,
  map,
  children,
}: {
  title: string
  subtitle: string
  controls: ReactNode
  map: ReactNode
  children: ReactNode
}) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const h1 = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    h1.current?.focus({ preventScroll: true })
  }, [])

  const header = (
    <header className="on-dark relative overflow-hidden bg-gradient-to-br from-navy via-navy to-royal px-4 pb-12 pt-4 text-white sm:px-6">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-cornflower/25" />
      <div className="relative mx-auto max-w-2xl">
        <h1 ref={h1} tabIndex={-1} className="flex min-h-11 items-center text-xl font-bold sm:text-2xl">
          {title}
        </h1>
        <p className="text-sm text-white/85">{subtitle}</p>
        <div className="mt-4 flex flex-col gap-3">{controls}</div>
      </div>
    </header>
  )

  if (isDesktop) {
    return (
      <div className="grid h-dvh grid-cols-[minmax(380px,440px)_1fr]">
        <div className="min-h-0 overflow-y-auto bg-canvas">
          {header}
          <div className="relative -mt-7 rounded-t-[28px] bg-canvas px-5 pb-10 pt-6">{children}</div>
        </div>
        <div className="relative min-h-0">{map}</div>
      </div>
    )
  }
  return (
    <div className="flex min-h-dvh flex-col">
      {header}
      <main className="relative -mt-7 flex-1 rounded-t-[28px] bg-canvas px-4 pb-32 pt-4 sm:px-6">
        <div className="mx-auto max-w-2xl">
          <div className="h-[40dvh] min-h-64 overflow-hidden rounded-3xl shadow-card">{map}</div>
          <div className="mt-5">{children}</div>
        </div>
      </main>
    </div>
  )
}
