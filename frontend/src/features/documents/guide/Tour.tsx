import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { useMediaQuery } from '@/utils/useMediaQuery'
import { STRINGS } from '@/features/documents/guide/strings'
import type { Lang } from '@/features/documents/guide/types'

export interface TourStep {
  targetId: string
  title: string
  body: string
}

const POP_W = 340

/**
 * Restrained spotlight tour: scrolls each target into view, outlines it, and shows a nearby
 * popover (bottom sheet on small screens). The rest of the page stays visible and usable.
 */
export function Tour({
  steps,
  step,
  lang,
  onStep,
  onDone,
  onSkip,
}: {
  steps: TourStep[]
  step: number
  lang: Lang
  onStep: (n: number) => void
  onDone: () => void
  onSkip: () => void
}) {
  const t = STRINGS[lang]
  const small = !useMediaQuery('(min-width: 640px)')
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)')
  const pop = useRef<HTMLDivElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const titleId = useId()
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const current = steps[step]
  const last = step === steps.length - 1

  const place = useCallback(() => {
    const el = current && document.getElementById(current.targetId)
    if (!el || small) return setPos(null)
    const r = el.getBoundingClientRect()
    const h = pop.current?.offsetHeight ?? 220
    const vw = window.innerWidth
    const vh = window.innerHeight
    const clampTop = (y: number) => Math.min(Math.max(y, 16), vh - h - 16)
    // Keep clear of the desktop navigation rail.
    const minLeft = (document.querySelector('nav[aria-label="Main"]')?.getBoundingClientRect().right ?? 0) + 16
    const top = clampTop(Math.max(r.top, 16))
    if (vw - r.right >= POP_W + 32) setPos({ left: r.right + 16, top })
    else if (r.left - POP_W - 16 >= minLeft) setPos({ left: r.left - POP_W - 16, top })
    // No room beside the topic: anchor inside its lower-right corner so the heading stays visible.
    else setPos({ left: Math.max(minLeft, Math.min(r.right - POP_W - 16, vw - POP_W - 16)), top: clampTop(Math.min(r.bottom - h - 16, vh - h - 24)) })
  }, [current, small])

  // Emphasize and scroll to the current target.
  useEffect(() => {
    const el = current && document.getElementById(current.targetId)
    if (!el) return
    el.setAttribute('data-tour-active', 'true')
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    heading.current?.focus({ preventScroll: true })
    return () => el.removeAttribute('data-tour-active')
  }, [current, reduced, small])

  useLayoutEffect(() => {
    let raf = requestAnimationFrame(place)
    const onMove = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(place)
    }
    window.addEventListener('scroll', onMove, true)
    window.addEventListener('resize', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [place])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip()
      const inField = (e.target as HTMLElement).closest('input,textarea,select')
      if (inField) return
      if (e.key === 'ArrowRight') {
        if (last) onDone()
        else onStep(step + 1)
      }
      if (e.key === 'ArrowLeft' && step > 0) onStep(step - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, last, onStep, onDone, onSkip])

  if (!current) return null

  return (
    <div
      ref={pop}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className={`fixed z-[1120] rounded-3xl bg-white p-5 shadow-sheet ring-1 ring-mist ${reduced ? '' : 'animate-fade-in'} ${
        small ? 'inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))]' : ''
      }`}
      style={small ? undefined : { width: POP_W, top: pos?.top ?? 96, left: pos?.left ?? 16 }}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-wider text-royal" aria-live="polite">
          {t.step(step + 1, steps.length)}
        </p>
        <button type="button" onClick={onSkip} className="-mr-2 inline-flex min-h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold text-ink/70 hover:bg-pale">
          <X className="size-4" aria-hidden /> {t.skip}
        </button>
      </div>
      <div className="mt-1 flex gap-1" aria-hidden>
        {steps.map((_, i) => (
          <span key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-royal' : 'bg-mist'}`} />
        ))}
      </div>
      <h2 id={titleId} ref={heading} tabIndex={-1} className="mt-3 text-lg font-bold leading-snug text-navy outline-none">
        {current.title}
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-ink">{current.body}</p>
      <div className="mt-4 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => onStep(step - 1)}
          disabled={step === 0}
          className="btn btn-ghost min-h-11 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-3 text-navy disabled:bg-transparent"
        >
          <ArrowLeft className="size-4" aria-hidden /> {t.back}
        </button>
        <button type="button" onClick={() => (last ? onDone() : onStep(step + 1))} className="btn btn-primary min-h-11 flex-nowrap gap-1.5 whitespace-nowrap rounded-full px-5">
          {last ? t.finish : t.next} {!last && <ArrowRight className="size-4" aria-hidden />}
        </button>
      </div>
    </div>
  )
}
