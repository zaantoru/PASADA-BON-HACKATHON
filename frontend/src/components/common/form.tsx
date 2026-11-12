import type { ReactNode } from 'react'
import { FieldError } from '@/components/common/ui'

export const inputClass =
  'input h-12 w-full rounded-2xl border-mist bg-white text-base text-ink placeholder:text-ink/45 focus:border-royal focus:outline-2 focus:outline-royal/30 aria-[invalid=true]:border-red-600'
export const selectClass =
  'select h-12 w-full rounded-2xl border-mist bg-white text-base text-ink focus:border-royal focus:outline-2 focus:outline-royal/30 aria-[invalid=true]:border-red-600'
export const textareaClass =
  'textarea min-h-24 w-full rounded-2xl border-mist bg-white text-base text-ink placeholder:text-ink/45 focus:border-royal focus:outline-2 focus:outline-royal/30 aria-[invalid=true]:border-red-600'

export interface FieldIds {
  id: string
  describedBy: string | undefined
  invalid: boolean
}

/** Visible label + hint + error wiring for a single control. */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  badge,
  children,
}: {
  id: string
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  optional?: boolean
  badge?: ReactNode
  children: (ids: FieldIds) => ReactNode
}) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-bold text-ink">
          {label}
          {optional && <span className="ml-1.5 font-medium text-ink/70">(optional)</span>}
        </label>
        {badge}
      </div>
      {hint && (
        <p id={hintId} className="mb-2 text-xs leading-relaxed text-ink/70">
          {hint}
        </p>
      )}
      {children({ id, describedBy, invalid: !!error })}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}

/** Same as Field but for grouped controls (radio/checkbox chips) labeled by a legend-like heading. */
export function GroupField({
  id,
  label,
  hint,
  error,
  optional,
  badge,
  children,
}: {
  id: string
  label: ReactNode
  hint?: ReactNode
  error?: string | null
  optional?: boolean
  badge?: ReactNode
  children: ReactNode
}) {
  return (
    <div role="group" aria-labelledby={`${id}-label`} aria-describedby={[hint ? `${id}-hint` : '', error ? `${id}-error` : ''].join(' ').trim() || undefined} id={id} tabIndex={-1} className="outline-none">
      <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2">
        <p id={`${id}-label`} className="text-sm font-bold text-ink">
          {label}
          {optional && <span className="ml-1.5 font-medium text-ink/70">(optional)</span>}
        </p>
        {badge}
      </div>
      {hint && (
        <p id={`${id}-hint`} className="mb-2 text-xs leading-relaxed text-ink/70">
          {hint}
        </p>
      )}
      {children}
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}
