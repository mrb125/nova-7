interface Props {
  size?: number
}

export default function USSBlankenageLogo({ size = 220 }: Props) {
  return (
    <svg
      viewBox="0 0 300 300"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="U.S.S. Blankenagel Logo"
      style={{ display: 'block', margin: '0 auto' }}
    >
      <defs>
        <radialGradient id="uss-bg-grad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0e1e3c" />
          <stop offset="100%" stopColor="#020817" />
        </radialGradient>
        <linearGradient id="uss-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <linearGradient id="uss-ring-grad-r" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="uss-glow-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="uss-glow-strong" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Background */}
      <circle cx="150" cy="150" r="148" fill="url(#uss-bg-grad)" />

      {/* Outer gradient ring */}
      <circle cx="150" cy="150" r="144" fill="none" stroke="url(#uss-ring-grad)" strokeWidth="3" />

      {/* Dashed accent ring */}
      <circle
        cx="150" cy="150" r="139"
        fill="none" stroke="#22d3ee" strokeWidth="0.7"
        opacity="0.3" strokeDasharray="4 9"
      />

      {/* Star field */}
      <circle cx="58"  cy="75"  r="1.2" fill="#e2e8f0" opacity="0.7" />
      <circle cx="232" cy="66"  r="0.9" fill="#e2e8f0" opacity="0.6" />
      <circle cx="253" cy="200" r="1.4" fill="#94a3b8" opacity="0.6" />
      <circle cx="46"  cy="213" r="1.0" fill="#e2e8f0" opacity="0.5" />
      <circle cx="77"  cy="244" r="0.8" fill="#94a3b8" opacity="0.4" />
      <circle cx="219" cy="247" r="1.1" fill="#e2e8f0" opacity="0.5" />
      <circle cx="97"  cy="50"  r="0.9" fill="#e2e8f0" opacity="0.6" />
      <circle cx="197" cy="56"  r="1.0" fill="#94a3b8" opacity="0.5" />
      <circle cx="263" cy="126" r="0.7" fill="#e2e8f0" opacity="0.5" />
      <circle cx="32"  cy="152" r="0.8" fill="#94a3b8" opacity="0.4" />
      <circle cx="71"  cy="118" r="0.6" fill="#fff"    opacity="0.4" />
      <circle cx="229" cy="180" r="0.7" fill="#fff"    opacity="0.3" />
      <circle cx="120" cy="40"  r="0.8" fill="#e2e8f0" opacity="0.5" />
      <circle cx="182" cy="263" r="0.9" fill="#94a3b8" opacity="0.4" />
      <circle cx="265" cy="175" r="0.6" fill="#fff"    opacity="0.3" />

      {/* Orbital rings (atom motif – 3 ellipses) */}
      <g filter="url(#uss-glow-soft)" opacity="0.52">
        <ellipse cx="150" cy="150" rx="90" ry="28"
          fill="none" stroke="#22d3ee" strokeWidth="1.3" />
        <ellipse cx="150" cy="150" rx="90" ry="28"
          fill="none" stroke="#22d3ee" strokeWidth="1.3"
          transform="rotate(60, 150, 150)" />
        <ellipse cx="150" cy="150" rx="90" ry="28"
          fill="none" stroke="#22d3ee" strokeWidth="1.3"
          transform="rotate(-60, 150, 150)" />
      </g>

      {/* Ship silhouette – pointing right */}
      <g filter="url(#uss-glow-soft)">
        {/* Hull (elongated teardrop) */}
        <path
          d="M 88,150 C 102,135 136,124 176,150 C 136,176 102,165 88,150 Z"
          fill="#22d3ee" opacity="0.82"
        />
        {/* Nose / cockpit spike */}
        <path
          d="M 176,150 L 213,142 L 204,150 L 213,158 Z"
          fill="#22d3ee" opacity="0.92"
        />
        {/* Top wing sweep */}
        <path
          d="M 120,139 L 108,122 L 140,132 Z"
          fill="#22d3ee" opacity="0.55"
        />
        {/* Bottom wing sweep */}
        <path
          d="M 120,161 L 108,178 L 140,168 Z"
          fill="#22d3ee" opacity="0.55"
        />
      </g>

      {/* Engine glow (left) */}
      <circle cx="90" cy="150" r="9"  fill="#7c3aed" filter="url(#uss-glow-strong)" opacity="0.85" />
      <circle cx="90" cy="150" r="4"  fill="#c4b5fd" />
      <circle cx="90" cy="150" r="1.8" fill="#fff" opacity="0.9" />

      {/* Atom nucleus (center) */}
      <circle cx="150" cy="150" r="6"   fill="#22d3ee" opacity="0.12" />
      <circle cx="150" cy="150" r="2.8" fill="#fff" opacity="0.88" filter="url(#uss-glow-soft)" />

      {/* Horizontal accent lines */}
      <line x1="40"  y1="197" x2="260" y2="197" stroke="#22d3ee" strokeWidth="0.5" opacity="0.22" />
      <line x1="40"  y1="106" x2="260" y2="106" stroke="#22d3ee" strokeWidth="0.5" opacity="0.22" />

      {/* Corner tick marks */}
      <line x1="40" y1="103" x2="40" y2="110"  stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
      <line x1="260" y1="103" x2="260" y2="110" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
      <line x1="40"  y1="194" x2="40"  y2="201" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />
      <line x1="260" y1="194" x2="260" y2="201" stroke="#22d3ee" strokeWidth="1" opacity="0.4" />

      {/* Top curved text: U.S.S. BLANKENAGEL */}
      <path id="uss-top-arc" d="M 20,150 A 130,130 0 0,1 280,150" fill="none" />
      <text
        fontFamily="'Courier New', Courier, monospace"
        fontSize="20"
        fontWeight="bold"
        fill="#22d3ee"
        letterSpacing="1"
        filter="url(#uss-glow-soft)"
      >
        <textPath href="#uss-top-arc" startOffset="50%" textAnchor="middle">
          U.S.S. BLANKENAGEL
        </textPath>
      </text>

      {/* Bottom subtitle */}
      <text
        x="150" y="226"
        textAnchor="middle"
        fontFamily="'Courier New', Courier, monospace"
        fontSize="10"
        fill="#8b5cf6"
        letterSpacing="3"
        opacity="0.88"
      >
        ORBITALSTATION · 2157
      </text>

      {/* Dots flanking subtitle */}
      <circle cx="52"  cy="224" r="1.5" fill="#7c3aed" opacity="0.55" />
      <circle cx="248" cy="224" r="1.5" fill="#7c3aed" opacity="0.55" />
    </svg>
  )
}
