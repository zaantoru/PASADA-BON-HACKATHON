import { useState } from 'react'
import type { ComponentProps, SubmitEventHandler } from 'react'

type IconProps = ComponentProps<'svg'>

const strokeProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...strokeProps} {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.5 3.1-6 7-6s7 2.5 7 6" />
    </svg>
  )
}

function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...strokeProps} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...strokeProps} {...props}>
      <rect x="5" y="11" width="14" height="9" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...strokeProps} {...props}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...strokeProps} {...props}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1" />
      <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  )
}

function GlobeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...strokeProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  )
}

function ChevronDownIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...strokeProps} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...strokeProps} strokeWidth={3} {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

function FacebookIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#1877F2"
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07c0 6.02 4.39 11.02 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.03 1.79-4.7 4.53-4.7 1.31 0 2.69.24 2.69.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.09 24 18.09 24 12.07Z"
      />
    </svg>
  )
}

function AppleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="currentColor"
        d="M16.37 12.6c-.03-2.7 2.2-4 2.3-4.06-1.25-1.83-3.2-2.08-3.9-2.11-1.66-.17-3.24.98-4.08.98-.85 0-2.14-.96-3.52-.93-1.81.03-3.48 1.05-4.41 2.67-1.88 3.26-.48 8.09 1.35 10.74.9 1.3 1.97 2.76 3.37 2.7 1.35-.05 1.86-.87 3.5-.87 1.63 0 2.1.87 3.53.84 1.46-.03 2.38-1.32 3.27-2.63 1.03-1.5 1.45-2.96 1.48-3.04-.03-.01-2.84-1.09-2.87-4.29ZM13.7 4.6c.75-.9 1.25-2.16 1.11-3.4-1.07.04-2.37.71-3.14 1.61-.69.8-1.29 2.08-1.13 3.3 1.19.09 2.41-.61 3.16-1.51Z"
      />
    </svg>
  )
}

function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.46a5.52 5.52 0 0 1-2.4 3.62v3h3.88c2.27-2.09 3.58-5.17 3.58-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.28v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.28a12 12 0 0 0 0 10.76l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.61 4.59 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.62l4.01 3.09C6.23 6.86 8.88 4.75 12 4.75Z"
      />
    </svg>
  )
}

function Logo() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-cornflower/20 ring-4 ring-cornflower/10">
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <defs>
          <linearGradient id="login-logo-a" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#68a4f1" />
            <stop offset="1" stopColor="#2b6ad0" />
          </linearGradient>
        </defs>
        <path
          d="M14 3C7.4 4.2 3.5 9.4 3.5 16s3.9 11.8 10.5 13C10.6 25.6 9 21.2 9 16s1.6-9.6 5-13Z"
          fill="url(#login-logo-a)"
        />
        <path
          d="M18 3c6.2 1.6 10 6.6 10 13s-3.8 11.4-10 13c3-3.4 4.5-7.8 4.5-13S21 6.4 18 3Z"
          fill="#1f4591"
        />
      </svg>
    </span>
  )
}

function HeroArt() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden overflow-hidden rounded-3xl bg-linear-to-br from-cornflower via-royal to-navy lg:block"
    >
      {/* Soft background glows */}
      <div className="absolute -top-24 -right-16 h-96 w-96 rounded-full bg-navy/60 blur-3xl" />
      <div className="absolute top-1/3 -left-24 h-96 w-96 rounded-full bg-cornflower/70 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-ink/60 blur-3xl" />

      {/* Wavy lower layers */}
      <div className="absolute -right-1/4 -bottom-1/4 h-3/4 w-[150%] rounded-[50%] bg-linear-to-tr from-ink via-navy to-royal opacity-95 blur-md" />
      <div className="absolute -bottom-1/3 -left-1/4 h-2/3 w-[120%] rotate-[-8deg] rounded-[50%] bg-linear-to-r from-royal via-navy to-ink opacity-90 blur-sm" />
      <div className="absolute -right-1/3 bottom-[18%] h-1/3 w-[110%] rotate-[-14deg] rounded-[50%] bg-linear-to-r from-transparent via-cornflower/50 to-royal/60 blur-md" />

      {/* Large sphere */}
      <div className="absolute top-[34%] left-[17%] aspect-square w-[55%] rounded-full bg-[radial-gradient(circle_at_70%_25%,#68a4f1_0%,#2b6ad0_40%,#1f4591_75%,#061e47_100%)] shadow-[0_30px_80px_-20px_rgba(6,30,71,0.7)]" />

      {/* Small bubbles */}
      <div className="absolute top-[31%] left-[14%] h-8 w-12 rounded-full bg-linear-to-b from-cornflower to-royal shadow-md" />
      <div className="absolute top-[28%] left-[16%] h-5 w-5 rounded-full bg-linear-to-br from-cornflower to-navy shadow" />
    </div>
  )
}

function BrandMark({ className = 'size-11' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <rect width="48" height="48" rx="14" fill="#fff" />
      <path d="M24 8l13 4.6v10c0 9.6-6 16.2-13 19.4-7-3.2-13-9.8-13-19.4v-10Z" fill="#2B6AD0" />
      <g fill="#fff" transform="translate(24 24)">
        <ellipse cx="0" cy="3.6" rx="5" ry="4.2" />
        <ellipse cx="-5.6" cy="-2.8" rx="2" ry="2.6" />
        <ellipse cx="-2" cy="-6.4" rx="2" ry="2.7" />
        <ellipse cx="2" cy="-6.4" rx="2" ry="2.7" />
        <ellipse cx="5.6" cy="-2.8" rx="2" ry="2.6" />
      </g>
    </svg>
  )
}


const inputWrapperClass =
  'group flex h-9 items-center gap-2 rounded-xl border border-cornflower/30 bg-cornflower/5 px-3 text-navy/50 shadow-xs transition focus-within:border-royal focus-within:bg-white focus-within:ring-4 focus-within:ring-cornflower/25'

const inputClass =
  'h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-navy/40'

const socialButtonClass =
  'flex h-9 items-center justify-center rounded-xl border border-cornflower/30 bg-white shadow-xs transition hover:bg-cornflower/10 focus-visible:ring-4 focus-visible:ring-cornflower/25 focus-visible:outline-none'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    // TODO: connect to the auth service (Supabase) once it is wired up.
    console.log('Login submitted', { email, remember })
  }

  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-linear-to-br from-cornflower/20 via-white to-royal/15 p-2">
      <div className="grid h-full max-h-[44rem] w-full max-w-5xl grid-cols-1 gap-2 overflow-hidden rounded-3xl bg-white p-2 shadow-xl shadow-navy/15 lg:grid-cols-2">
        {/* Left: form */}
        <section className="flex min-h-0 flex-col px-4 py-1 sm:px-6">
          <header className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <BrandMark/>
            </div>
            <p className="flex items-center gap-3 text-xs text-navy/80">
              Don't have an account?
              <a
                href="/register"
                className="rounded-lg border border-cornflower/40 bg-white px-2.5 py-1 font-medium text-navy shadow-xs transition hover:bg-cornflower/10"
              >
                Register
              </a>
            </p>
          </header>

          <div className="mx-auto flex min-h-0 w-full max-w-xs flex-1 flex-col justify-center py-1">
            {/* Icon badge (hidden on short screens) */}
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full border border-cornflower/20 bg-linear-to-b from-cornflower/10 to-white [@media(max-height:600px)]:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cornflower/40 bg-white text-royal shadow-sm">
                <UserIcon className="h-4 w-4" />
              </div>
            </div>

            <h1 className="text-center text-xl font-semibold tracking-tight text-ink">
              Welcome back
            </h1>
            <p className="mt-0.5 text-center text-xs text-navy/70">
              Enter your details to log in PASADA: Ligtas
            </p>

            <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold text-ink">
                  Email <span className="text-royal">*</span>
                </label>
                <div className={inputWrapperClass}>
                  <MailIcon className="h-4 w-4 shrink-0" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-semibold text-ink">
                  Password <span className="text-royal">*</span>
                </label>
                <div className={inputWrapperClass}>
                  <LockIcon className="h-4 w-4 shrink-0" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    className="shrink-0 rounded text-navy/50 transition hover:text-royal focus-visible:outline-2 focus-visible:outline-royal"
                  >
                    {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-ink select-none">
                  <span className="relative flex h-4 w-4 items-center justify-center">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-cornflower/60 bg-white transition checked:border-royal checked:bg-royal focus-visible:ring-4 focus-visible:ring-cornflower/25 focus-visible:outline-none"
                    />
                    <CheckIcon className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
                  </span>
                  Remember me
                </label>
                <a href="/forgot-password" className="text-xs font-medium text-royal hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                className="mt-1 h-9 w-full rounded-xl bg-linear-to-b from-royal to-navy text-sm font-medium text-white shadow-md shadow-royal/30 ring-1 ring-navy/40 transition hover:from-royal hover:to-ink focus-visible:ring-4 focus-visible:ring-cornflower/50 focus-visible:outline-none active:translate-y-px"
              >
                Log in
              </button>
            </form>

            <div className="my-3 flex items-center gap-4 text-[11px] font-medium text-navy/70">
              <span className="h-px flex-1 bg-cornflower/30" />
              OR
              <span className="h-px flex-1 bg-cornflower/30" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button type="button" aria-label="Continue with Facebook" className={socialButtonClass}>
                <FacebookIcon className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Continue with Apple" className={socialButtonClass}>
                <AppleIcon className="h-5 w-5 text-ink" />
              </button>
              <button type="button" aria-label="Continue with Google" className={socialButtonClass}>
                <GoogleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <footer className="flex items-center justify-between text-xs text-navy/70">
            <span>© {new Date().getFullYear()} PASADA Ligtas</span>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 transition hover:bg-cornflower/10"
            >
              <GlobeIcon className="h-4 w-4" />
              ENG
              <ChevronDownIcon className="h-3.5 w-3.5" />
            </button>
          </footer>
        </section>

        {/* Right: artwork */}
        <HeroArt />
      </div>
    </main>
  )
}
