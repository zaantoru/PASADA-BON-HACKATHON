/** Flat, friendly illustrations used for welcome and empty states only. */

function Paw({ x, y, s = 1, fill }: { x: number; y: number; s?: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <ellipse cx="0" cy="6" rx="9" ry="7.5" />
      <ellipse cx="-10" cy="-5" rx="3.6" ry="4.6" />
      <ellipse cx="-3.8" cy="-11" rx="3.6" ry="4.8" />
      <ellipse cx="3.8" cy="-11" rx="3.6" ry="4.8" />
      <ellipse cx="10" cy="-5" rx="3.6" ry="4.6" />
    </g>
  )
}

export function WelcomeIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 190" className={className} aria-hidden="true">
      <path d="M38 120c-14-46 22-92 74-98 46-5 98 14 112 58 14 46-22 92-84 96-56 4-90-14-102-56Z" fill="#DCE8FA" />
      <circle cx="214" cy="38" r="6" fill="#68A4F1" />
      <circle cx="34" cy="62" r="4" fill="#68A4F1" />
      <path d="M226 132l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#68A4F1" />
      <g transform="rotate(-8 112 98)">
        <rect x="62" y="44" width="104" height="122" rx="14" fill="#fff" />
        <rect x="62" y="44" width="104" height="26" rx="14" fill="#2B6AD0" />
        <rect x="62" y="58" width="104" height="12" fill="#2B6AD0" />
        <rect x="74" y="54" width="46" height="6" rx="3" fill="#fff" opacity=".85" />
        <rect x="76" y="84" width="58" height="6" rx="3" fill="#DCE8FA" />
        <rect x="76" y="98" width="76" height="6" rx="3" fill="#DCE8FA" />
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <circle cx="80" cy={122 + i * 14} r="4.5" fill={i < 2 ? '#2B6AD0' : '#DCE8FA'} />
            <rect x="92" y={119 + i * 14} width={i === 2 ? 34 : 52} height="6" rx="3" fill={i < 2 ? '#68A4F1' : '#DCE8FA'} />
          </g>
        ))}
      </g>
      <g transform="translate(150 86)">
        <path d="M40 0l38 13v28c0 26-17 44-38 52C19 85 2 67 2 41V13Z" fill="#1F4591" />
        <path d="M40 9l29 10v22c0 20-13 34-29 41-16-7-29-21-29-41V19Z" fill="#2B6AD0" />
        <Paw x={40} y={44} s={1.15} fill="#fff" />
      </g>
      <circle cx="70" cy="150" r="15" fill="#fff" />
      <path d="M63 150l5 5 10-11" stroke="#2B6AD0" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function EmptyRecordsIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 170" className={className} aria-hidden="true">
      <ellipse cx="110" cy="152" rx="78" ry="10" fill="#DCE8FA" />
      <path d="M30 96c-6-40 28-76 74-80 44-4 86 22 88 64 2 40-36 64-82 66-42 2-74-12-80-50Z" fill="#EEF4FD" />
      <rect x="66" y="26" width="88" height="118" rx="14" fill="#fff" stroke="#DCE8FA" strokeWidth="2" />
      <rect x="88" y="18" width="44" height="18" rx="9" fill="#2B6AD0" />
      <line x1="86" y1="60" x2="86" y2="124" stroke="#DCE8FA" strokeWidth="3" strokeDasharray="4 6" strokeLinecap="round" />
      {[60, 92, 124].map((y, i) => (
        <g key={y}>
          <circle cx="86" cy={y} r="6" fill={i === 0 ? '#2B6AD0' : '#fff'} stroke={i === 0 ? '#2B6AD0' : '#68A4F1'} strokeWidth="2.5" />
          <rect x="100" y={y - 4} width={i === 0 ? 40 : 30} height="8" rx="4" fill={i === 0 ? '#68A4F1' : '#DCE8FA'} />
        </g>
      ))}
      <Paw x={176} y={52} s={1.1} fill="#68A4F1" />
      <Paw x={40} y={124} s={0.8} fill="#DCE8FA" />
      <circle cx="160" cy="126" r="16" fill="#1F4591" />
      <path d="M160 119v14M153 126h14" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

export function EmptyMapIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 160" className={className} aria-hidden="true">
      <ellipse cx="110" cy="146" rx="70" ry="8" fill="#DCE8FA" />
      <path d="M40 40l44-14 52 14 44-14v96l-44 14-52-14-44 14Z" fill="#fff" stroke="#DCE8FA" strokeWidth="2" />
      <path d="M84 26v96M136 40v96" stroke="#DCE8FA" strokeWidth="2" />
      <path d="M52 92c18-6 30 10 48 2s30-20 46-8 22 4 28 0" stroke="#68A4F1" strokeWidth="3" fill="none" strokeDasharray="5 6" strokeLinecap="round" />
      <path d="M110 30c-14 0-24 10-24 23 0 17 24 39 24 39s24-22 24-39c0-13-10-23-24-23Z" fill="#2B6AD0" />
      <circle cx="110" cy="53" r="8" fill="#fff" />
      <circle cx="164" cy="100" r="16" fill="#fff" stroke="#1F4591" strokeWidth="5" />
      <path d="M176 112l14 14" stroke="#1F4591" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/** Small assistant avatar ("Gabay") for the AI guide. */
export function GuideAvatar({ className = 'size-14' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="32" fill="#DCE8FA" />
      <path d="M14 30c0-10 8-17 18-17s18 7 18 17v4c0 9-8 16-18 16-3 0-5-.4-7-1.2L16 52l2.6-7.4C15.7 41.8 14 38 14 34Z" fill="#2B6AD0" />
      <rect x="20" y="22" width="24" height="18" rx="9" fill="#fff" />
      <circle cx="27" cy="30" r="2.6" fill="#1F4591" />
      <circle cx="37" cy="30" r="2.6" fill="#1F4591" />
      <path d="M27.5 35c2.6 2 6.4 2 9 0" stroke="#1F4591" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <path d="M50 10l1.6 3.4L55 15l-3.4 1.6L50 20l-1.6-3.4L45 15l3.4-1.6z" fill="#68A4F1" />
    </svg>
  )
}

/** Illustration for the "card has been read" step. */
export function CardReadIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 120" className={className} aria-hidden="true">
      <ellipse cx="80" cy="110" rx="56" ry="6" fill="#DCE8FA" />
      <g transform="rotate(-6 70 60)">
        <rect x="28" y="18" width="84" height="88" rx="12" fill="#fff" stroke="#DCE8FA" strokeWidth="2" />
        <rect x="28" y="18" width="84" height="20" rx="12" fill="#2B6AD0" />
        <rect x="28" y="30" width="84" height="8" fill="#2B6AD0" />
        <rect x="40" y="50" width="48" height="6" rx="3" fill="#DCE8FA" />
        <rect x="40" y="62" width="60" height="6" rx="3" fill="#DCE8FA" />
        <rect x="40" y="74" width="36" height="6" rx="3" fill="#68A4F1" />
        <rect x="40" y="86" width="52" height="6" rx="3" fill="#DCE8FA" />
      </g>
      <circle cx="118" cy="70" r="22" fill="#fff" stroke="#1F4591" strokeWidth="6" />
      <path d="M133 86l14 14" stroke="#1F4591" strokeWidth="8" strokeLinecap="round" />
      <path d="M110 70l6 6 10-12" stroke="#2B6AD0" strokeWidth="4.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
