import { BadgeCheck, CircleAlert, FlaskConical, Info } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'
import { NOT_RECORDED } from '@/utils/format'

export function Card({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-3xl bg-white shadow-card ${className}`}>{children}</div>
}

export function NeedsCheckingBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-caution px-2.5 py-1 text-xs font-bold text-caution-ink ${className}`}>
      <CircleAlert className="size-3.5" aria-hidden />
      Needs checking
    </span>
  )
}

export function UserConfirmedBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-pale px-2.5 py-1 text-xs font-bold text-navy ${className}`}>
      <BadgeCheck className="size-3.5" aria-hidden />
      User-confirmed
    </span>
  )
}

export function DemoBadge({ children = 'Demo data', className = '' }: { children?: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-dashed border-navy/40 bg-white px-2.5 py-1 text-xs font-bold text-navy ${className}`}>
      <FlaskConical className="size-3.5" aria-hidden />
      {children}
    </span>
  )
}

export function NotRecorded() {
  return <span className="italic text-ink/70">{NOT_RECORDED}</span>
}

export function InfoRow({ label, value, raw }: { label: string; value: ReactNode | null | undefined; raw?: string | null }) {
  const empty = value === null || value === undefined || value === ''
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-4">
      <dt className="text-sm font-medium text-ink/70 sm:w-44 sm:shrink-0">{label}</dt>
      <dd className="text-sm font-semibold text-ink">
        {empty ? <NotRecorded /> : value}
        {raw && raw !== value && <span className="mt-0.5 block text-xs font-normal text-ink/70">On document: “{raw}”</span>}
      </dd>
    </div>
  )
}

export function SectionHeading({ title, description, action, id }: { title: string; description?: ReactNode; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div>
        <h2 id={id} className="text-lg font-bold text-navy">
          {title}
        </h2>
        {description && <p className="mt-0.5 text-sm text-ink/70">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function EmptyState({
  illustration,
  title,
  body,
  children,
}: {
  illustration?: ReactNode
  title: string
  body: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-4 py-6 text-center">
      {illustration}
      <h3 className="mt-3 text-lg font-bold text-navy">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-ink/70">{body}</p>
      {children && <div className="mt-5 flex w-full max-w-xs flex-col gap-2">{children}</div>}
    </div>
  )
}

export function Notice({
  tone = 'info',
  title,
  children,
  icon: Icon = Info,
  className = '',
}: {
  tone?: 'info' | 'caution' | 'error' | 'success'
  title?: ReactNode
  children?: ReactNode
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  className?: string
}) {
  const tones = {
    info: 'bg-pale text-ink',
    caution: 'bg-caution text-caution-ink',
    error: 'bg-red-50 text-red-900 ring-1 ring-red-200',
    success: 'bg-emerald-50 text-emerald-900',
  }
  const iconTones = { info: 'text-royal', caution: 'text-caution-ink', error: 'text-red-700', success: 'text-emerald-700' }
  return (
    <div className={`flex gap-3 rounded-2xl p-4 text-sm ${tones[tone]} ${className}`}>
      <Icon className={`mt-0.5 size-5 shrink-0 ${iconTones[tone]}`} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? 'mt-1 leading-relaxed' : 'leading-relaxed'}>{children}</div>}
      </div>
    </div>
  )
}

export interface ChoiceOption<T extends string> {
  value: T
  label: string
  icon?: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
}

/** Accessible radio or checkbox chips built on native inputs. */
export function ChoiceChips<T extends string>({
  name,
  options,
  value,
  onChange,
  multiple = false,
  legend,
  describedBy,
  columns = 'auto',
}: {
  name: string
  options: ChoiceOption<T>[]
  value: T | T[] | null
  onChange: (v: T) => void
  multiple?: boolean
  legend: string
  describedBy?: string
  columns?: 'auto' | 2 | 4
}) {
  const isChecked = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v)
  const grid = columns === 4 ? 'grid grid-cols-2 sm:grid-cols-4' : columns === 2 ? 'grid grid-cols-2' : 'flex flex-wrap'
  return (
    <fieldset aria-describedby={describedBy}>
      <legend className="sr-only">{legend}</legend>
      <div className={`${grid} gap-2`}>
        {options.map((o) => (
          <label key={o.value} className="relative cursor-pointer">
            <input
              type={multiple ? 'checkbox' : 'radio'}
              name={name}
              value={o.value}
              checked={isChecked(o.value)}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-mist bg-white px-4 py-2 text-sm font-semibold text-ink transition peer-checked:border-royal peer-checked:bg-royal peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-royal hover:border-cornflower">
              {o.icon && <o.icon className="size-4" aria-hidden />}
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

export function FieldError({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-red-700">
      <CircleAlert className="size-4 shrink-0" aria-hidden />
      {children}
    </p>
  )
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  onDark = false,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
  onDark?: boolean
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={`grid gap-1 rounded-full p-1 ${onDark ? 'bg-white/15' : 'bg-pale'}`}
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className={`min-h-10 rounded-full px-3 text-sm font-semibold transition ${
              active
                ? onDark
                  ? 'bg-white text-navy shadow-sm'
                  : 'bg-royal text-white shadow-sm'
                : onDark
                  ? 'text-white hover:bg-white/10'
                  : 'text-ink hover:bg-white'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

export function Stars({ rating, size = 'size-4' }: { rating: number; size?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} viewBox="0 0 20 20" className={size} aria-hidden="true">
          <path
            d="M10 1.8l2.5 5.2 5.7.8-4.1 4 1 5.6L10 14.8l-5.1 2.6 1-5.6-4.1-4 5.7-.8Z"
            fill={rating >= i - 0.25 ? '#2B6AD0' : rating >= i - 0.75 ? 'url(#half)' : '#DCE8FA'}
          />
          <defs>
            <linearGradient id="half">
              <stop offset="50%" stopColor="#2B6AD0" />
              <stop offset="50%" stopColor="#DCE8FA" />
            </linearGradient>
          </defs>
        </svg>
      ))}
    </span>
  )
}
