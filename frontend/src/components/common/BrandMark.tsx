export function BrandMark({ className = 'size-11' }: { className?: string }) {
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
