import { useState } from 'react'
import type { ChangeEvent, ComponentProps, ReactNode, SubmitEventHandler } from 'react'
import logo from '../../assets/logo/logo.svg'
import { AuthHeroArt } from '../../components/common/AuthHeroArt'

/* ----------------------------- Icons ----------------------------- */

function Svg(props: ComponentProps<'svg'>) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    />
  )
}

const MailIcon = (p: ComponentProps<'svg'>) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </Svg>
)

const LockIcon = (p: ComponentProps<'svg'>) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Svg>
)

const EyeIcon = (p: ComponentProps<'svg'>) => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

const EyeOffIcon = (p: ComponentProps<'svg'>) => (
  <Svg {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.1A9.7 9.7 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.2M6.6 6.6C3.7 8.4 2 12 2 12s3.5 7 10 7c1.6 0 3-.4 4.3-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </Svg>
)

const CheckIcon = (p: ComponentProps<'svg'>) => (
  <Svg strokeWidth={3} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
)

const ArrowLeftIcon = (p: ComponentProps<'svg'>) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
)

const GlobeIcon = (p: ComponentProps<'svg'>) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" />
  </Svg>
)

const ChevronDownIcon = (p: ComponentProps<'svg'>) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
)

/* ----------------------------- Shared styles ----------------------------- */

const inputWrapperClass =
  'flex h-9 items-center gap-2 rounded-xl border border-cornflower/30 bg-cornflower/5 px-3 text-navy/50 shadow-xs transition focus-within:border-royal focus-within:bg-white focus-within:ring-4 focus-within:ring-cornflower/25'

const inputClass =
  'h-full min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-navy/40'

const primaryButtonClass =
  'h-9 rounded-xl bg-linear-to-b from-royal to-navy text-sm font-medium text-white shadow-md shadow-royal/30 ring-1 ring-navy/40 transition hover:from-royal hover:to-ink focus-visible:ring-4 focus-visible:ring-cornflower/50 focus-visible:outline-none active:translate-y-px'

const secondaryButtonClass =
  'flex h-9 items-center justify-center gap-1.5 rounded-xl border border-cornflower/40 bg-white px-4 text-sm font-medium text-navy shadow-xs transition hover:bg-cornflower/10 focus-visible:ring-4 focus-visible:ring-cornflower/25 focus-visible:outline-none'

/* ----------------------------- Field ----------------------------- */

interface FieldProps extends ComponentProps<'input'> {
  label: string
  icon?: ReactNode
  trailing?: ReactNode
}

function Field({ label, id, icon, trailing, required, ...inputProps }: FieldProps) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1 block text-xs font-semibold text-ink">
        {label}
        {required && <span className="text-royal"> *</span>}
      </label>
      <div className={inputWrapperClass}>
        {icon}
        <input id={id} required={required} className={inputClass} {...inputProps} />
        {trailing}
      </div>
    </div>
  )
}

/* ----------------------------- Wizard data ----------------------------- */

interface FormValues {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  birthDate: string
  mobile: string
  city: string
  barangay: string
  acceptedTerms: boolean
}

type TextKey = Exclude<keyof FormValues, 'acceptedTerms'>

const INITIAL_VALUES: FormValues = {
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  birthDate: '',
  mobile: '',
  city: '',
  barangay: '',
  acceptedTerms: false,
}

const STEPS = [
  { label: 'Account', title: 'Create your account', subtitle: 'Start with your sign-in details.' },
  { label: 'Profile', title: 'Tell us about you', subtitle: 'A few details to set up your profile.' },
  { label: 'Terms', title: 'Terms and agreement', subtitle: 'Please read and accept to create your account.' },
] as const

// Draft wording for the pilot. Have it reviewed (legal / data privacy) before a public launch.
const TERMS = [
  {
    heading: '1. About PASADA Ligtas',
    body: 'PASADA Ligtas helps you record animal bite incidents, keep track of your treatment visits and find nearby facilities. It is not medical advice and not an emergency service. If you were bitten, wash the wound and go to a health facility right away.',
  },
  {
    heading: '2. Your account',
    body: 'Give accurate details and keep your password private. You are responsible for activity under your account. Tell us if you think someone else has accessed it.',
  },
  {
    heading: '3. Your records stay private',
    body: 'Incident reports, treatment visits and uploaded documents are visible only to your account. Do not upload files that belong to someone else unless you have their permission.',
  },
  {
    heading: '4. Community hotspot map',
    body: 'The map shows approximate, area-level information only. An area appears when enough separate accounts have reported there. It never shows your exact location or identity, and it does not confirm that rabies is present in an area.',
  },
  {
    heading: '5. Facilities and reviews',
    body: 'Facility details, hours and costs can change, so confirm with the facility before you travel. Reviews must be honest and based on your own experience. Abusive, false or spam reviews may be removed.',
  },
  {
    heading: '6. Acceptable use',
    body: 'Do not misuse the service, submit false reports, try to access other users\u2019 data, or disrupt how the app works. We may suspend accounts that do.',
  },
  {
    heading: '7. Your data',
    body: 'We collect only what is needed to run the service: your account and profile details, and the records you add. You can ask us to correct or delete your account and records at any time.',
  },
  {
    heading: '8. Changes',
    body: 'We may update these terms. Continuing to use the app after an update means you accept the new version.',
  },
] as const

const LAST_STEP = STEPS.length - 1

const STRENGTH_LABELS = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const

function passwordScore(password: string): number {
  if (password.length < 8) return 0
  let score = 1
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return score
}

/* ----------------------------- Stepper ----------------------------- */

function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center" aria-label="Registration progress">
      {STEPS.map((step, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={step.label}
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-2 ${index < LAST_STEP ? 'flex-1' : ''}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition ${
                done
                  ? 'border-royal bg-royal text-white'
                  : active
                    ? 'border-royal bg-white text-royal ring-4 ring-cornflower/25'
                    : 'border-cornflower/40 bg-white text-navy/50'
              }`}
            >
              {done ? <CheckIcon className="h-3 w-3" /> : index + 1}
            </span>
            <span className={`text-xs font-medium ${active || done ? 'text-ink' : 'text-navy/50'}`}>
              {step.label}
            </span>
            {index < LAST_STEP && (
              <span
                className={`h-px flex-1 transition ${done ? 'bg-royal' : 'bg-cornflower/30'}`}
                aria-hidden="true"
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ----------------------------- Page ----------------------------- */

export default function Register() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<FormValues>(INITIAL_VALUES)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const isLastStep = step === LAST_STEP
  const score = passwordScore(values.password)
  const today = new Date().toISOString().slice(0, 10)

  const bind = (key: TextKey) => ({
    value: values[key],
    onChange: (event: ChangeEvent<HTMLInputElement>) => {
      setValues((prev) => ({ ...prev, [key]: event.target.value }))
    },
  })

  const goBack = () => {
    setError('')
    setStep((current) => Math.max(0, current - 1))
  }

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    setError('')

    if (step === 0 && values.password !== values.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (!isLastStep) {
      setStep((current) => current + 1)
      return
    }

    // TODO: call supabase.auth.signUp({ email, password, options: { data: profile } }).
    console.log('Register submitted', {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
    })
  }

  return (
    <main className="flex h-dvh items-center justify-center overflow-hidden bg-linear-to-br from-cornflower/20 via-white to-royal/15 p-2">
      <div className="grid h-full max-h-[44rem] w-full max-w-5xl grid-cols-1 gap-2 overflow-hidden rounded-3xl bg-white p-2 shadow-xl shadow-navy/15 lg:grid-cols-2">
        {/* Left: wizard */}
        <section className="flex min-h-0 flex-col px-4 py-1 sm:px-6">
          <header className="flex items-center justify-between">
            <img src={logo} alt="PASADA Ligtas" className="h-10 w-10" />
            <p className="flex items-center gap-3 text-xs text-navy/80">
              Already have an account?
              <a
                href="/login"
                className="rounded-lg border border-cornflower/40 bg-white px-2.5 py-1 font-medium text-navy shadow-xs transition hover:bg-cornflower/10"
              >
                Log in
              </a>
            </p>
          </header>

          <div className="mx-auto flex min-h-0 w-full max-w-sm flex-1 flex-col justify-center py-1">
            <Stepper current={step} />

            <h1 className="mt-4 text-center text-xl font-semibold tracking-tight text-ink">
              {STEPS[step].title}
            </h1>
            <p className="mt-0.5 text-center text-xs text-navy/70">{STEPS[step].subtitle}</p>

            <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
              {step === 0 && (
                <>
                  <Field
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    required
                    icon={<MailIcon className="h-4 w-4 shrink-0" />}
                    {...bind('email')}
                  />

                  <div>
                    <Field
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      label="Password"
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      minLength={8}
                      required
                      icon={<LockIcon className="h-4 w-4 shrink-0" />}
                      trailing={
                        <button
                          type="button"
                          onClick={() => setShowPassword((visible) => !visible)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                          className="shrink-0 rounded text-navy/50 transition hover:text-royal focus-visible:outline-2 focus-visible:outline-royal"
                        >
                          {showPassword ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      }
                      {...bind('password')}
                    />
                    <div className="mt-1.5 flex items-center gap-2" aria-live="polite">
                      <div className="flex flex-1 gap-1" aria-hidden="true">
                        {[1, 2, 3, 4].map((segment) => (
                          <span
                            key={segment}
                            className={`h-1 flex-1 rounded-full transition ${
                              segment <= score ? 'bg-royal' : 'bg-cornflower/25'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="w-14 text-right text-[11px] text-navy/70">
                        {values.password ? STRENGTH_LABELS[score] : ''}
                      </span>
                    </div>
                  </div>

                  <Field
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    label="Confirm password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    required
                    icon={<LockIcon className="h-4 w-4 shrink-0" />}
                    {...bind('confirmPassword')}
                  />
                </>
              )}

              {step === 1 && (
                <>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      id="firstName"
                      name="firstName"
                      label="First name"
                      autoComplete="given-name"
                      placeholder="Juan"
                      required
                      {...bind('firstName')}
                    />
                    <Field
                      id="lastName"
                      name="lastName"
                      label="Last name"
                      autoComplete="family-name"
                      placeholder="Dela Cruz"
                      required
                      {...bind('lastName')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      id="birthDate"
                      name="birthDate"
                      type="date"
                      label="Birth date"
                      autoComplete="bday"
                      max={today}
                      required
                      {...bind('birthDate')}
                    />
                    <Field
                      id="mobile"
                      name="mobile"
                      type="tel"
                      label="Mobile number"
                      autoComplete="tel"
                      inputMode="tel"
                      placeholder="09123456789"
                      pattern="(\+63|0)9\d{9}"
                      title="Use a Philippine mobile number, e.g. 09123456789 or +639123456789"
                      required
                      {...bind('mobile')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <Field
                      id="city"
                      name="city"
                      label="City / Municipality"
                      autoComplete="address-level2"
                      placeholder="Quezon City"
                      required
                      {...bind('city')}
                    />
                    <Field
                      id="barangay"
                      name="barangay"
                      label="Barangay"
                      autoComplete="address-level3"
                      placeholder="Batasan Hills"
                      required
                      {...bind('barangay')}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div
                    role="region"
                    aria-label="Terms and agreement"
                    tabIndex={0}
                    className="h-40 space-y-2.5 overflow-y-auto rounded-xl border border-cornflower/30 bg-cornflower/5 px-3 py-2.5 text-xs leading-relaxed text-navy/80 focus-visible:ring-4 focus-visible:ring-cornflower/25 focus-visible:outline-none"
                  >
                    {TERMS.map((section) => (
                      <section key={section.heading}>
                        <h2 className="font-semibold text-ink">{section.heading}</h2>
                        <p>{section.body}</p>
                      </section>
                    ))}
                  </div>

                  <label className="flex cursor-pointer items-start gap-2 text-xs text-navy/80 select-none">
                    <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                      <input
                        type="checkbox"
                        required
                        checked={values.acceptedTerms}
                        onChange={(event) =>
                          setValues((prev) => ({ ...prev, acceptedTerms: event.target.checked }))
                        }
                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-cornflower/60 bg-white transition checked:border-royal checked:bg-royal focus-visible:ring-4 focus-visible:ring-cornflower/25 focus-visible:outline-none"
                      />
                      <CheckIcon className="pointer-events-none absolute h-3 w-3 text-white opacity-0 peer-checked:opacity-100" />
                    </span>
                    <span>I have read and agree to the terms and agreement above.</span>
                  </label>
                </>
              )}

              <p role="alert" className="min-h-4 text-xs text-red-600">
                {error}
              </p>

              <div className="flex gap-2">
                {step > 0 && (
                  <button type="button" onClick={goBack} className={secondaryButtonClass}>
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back
                  </button>
                )}
                <button type="submit" className={`${primaryButtonClass} flex-1`}>
                  {isLastStep ? 'Create account' : 'Continue'}
                </button>
              </div>
            </form>
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
        <AuthHeroArt />
      </div>
    </main>
  )
}
