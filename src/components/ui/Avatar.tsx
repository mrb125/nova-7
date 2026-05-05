import type { AvatarConfig } from '../../types/game'

// ── Farb-Maps ─────────────────────────────────────────────────────────────────
const SKIN: Record<string, [string, string, string]> = {
  'light':        ['#FDE8D8', '#F0C5A8', '#FEF5EE'],
  'medium-light': ['#F5CBA7', '#D4A57A', '#FAE0C0'],
  'medium':       ['#D4A574', '#A8784A', '#E8C090'],
  'medium-dark':  ['#B5722A', '#8B5210', '#CF8840'],
  'dark':         ['#7D4E2D', '#5A3318', '#9A6238'],
}

const HAIR: Record<string, string> = {
  black:  '#1A1A1A',
  brown:  '#6B3A2A',
  blonde: '#D4A017',
  red:    '#C0392B',
  white:  '#D0D0D0',
  blue:   '#1A5E9B',
}

const EYES: Record<string, string> = {
  blue:   '#2980B9',
  green:  '#229954',
  brown:  '#795B2A',
  grey:   '#7A8B9A',
  hazel:  '#8B7040',
}

// [outer, inner, accent-stroke, accent-line]
const SUIT: Record<string, [string, string, string, string]> = {
  blue:   ['#0f1e3c', '#0a1628', '#1d4ed8', '#2563eb'],
  red:    ['#3c0f0f', '#280a0a', '#c81d1d', '#dc2626'],
  green:  ['#0f3c14', '#0a2810', '#16a34a', '#22c55e'],
  purple: ['#2a0f3c', '#1c0a28', '#7c3aed', '#a855f7'],
  orange: ['#3c1e0f', '#28140a', '#c2570d', '#ea580c'],
}

// ── Ausdrucks-Pfade ───────────────────────────────────────────────────────────
const EXPR_MOUTH: Record<string, { comic: string; real: string }> = {
  neutral:    { comic: 'M 49,100 Q 60,100 71,100',   real: 'M 50,99 Q 60,100 70,99' },
  smile:      { comic: 'M 47,101 Q 60,112 73,101',   real: 'M 49,100 Q 60,109 71,100' },
  determined: { comic: 'M 49,101 Q 60,97 71,101',    real: 'M 50,100 Q 60,97 70,100' },
}

const EXPR_BROW: Record<string, { left: string; right: string }> = {
  neutral:    { left: 'M 34,61 Q 44,57 54,61',   right: 'M 66,61 Q 76,57 86,61' },
  smile:      { left: 'M 34,60 Q 44,56 54,60',   right: 'M 66,60 Q 76,56 86,60' },
  determined: { left: 'M 34,63 Q 44,57 54,60',   right: 'M 66,60 Q 76,57 86,63' },
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  config: AvatarConfig
  size?: number
  className?: string
  /** Zeigt den Namens-Badge auf dem Raumanzug */
  showName?: boolean
  /** CSS-ID-Präfix für Animationen (Standard: 'av') */
  animId?: string
  /** HTML-id des SVG-Elements (für PNG-Export) */
  svgId?: string
}

export default function Avatar({ config, size = 120, className, showName = false, animId, svgId }: Props) {
  const [skinBase, skinShade, skinLight] = SKIN[config.skinTone] ?? SKIN['medium-light']
  const hairCol  = HAIR[config.hairColor]  ?? HAIR.brown
  const eyeCol   = EYES[config.eyeColor]   ?? EYES.blue
  const suitCols = SUIT[config.suitColor ?? 'blue']
  const expr     = config.expression ?? 'smile'
  const comic    = config.style === 'comic'
  const sw       = comic ? 2.5 : 1.2
  const sc       = comic ? '#111' : '#3a2010'
  const isHijab  = config.hairStyle === 'hijab'

  const uid = `${animId ?? 'av'}-${config.skinTone}-${config.hairColor}-${comic ? 'c' : 'r'}`

  // ── Frisur-Pfade ─────────────────────────────────────────────────────────────
  type HairDef = { cap: string; extra?: string }
  const hairPaths: Record<string, HairDef> = {
    short: {
      cap: 'M 22,64 Q 22,20 60,20 Q 98,20 98,64 Z',
    },
    long: {
      cap:   'M 22,64 Q 22,20 60,20 Q 98,20 98,64 Z',
      extra: 'M 22,64 Q 18,90 20,118 Q 26,128 37,128 L 38,104 Q 31,92 27,72 Z ' +
             'M 98,64 Q 102,90 100,118 Q 94,128 83,128 L 82,104 Q 89,92 93,72 Z',
    },
    curly: {
      cap: 'M 23,62 Q 16,48 22,36 Q 30,22 42,19 Q 50,11 58,15 Q 60,10 62,15 Q 70,11 78,19 Q 90,22 98,36 Q 104,48 97,62 Z',
    },
    bun: {
      cap:   'M 30,66 Q 30,26 60,22 Q 90,26 90,66 Z',
      extra: 'M 48,12 a 12,12 0 1,0 24,0 a 12,12 0 1,0 -24,0',
    },
    hijab: {
      cap:   'M 20,112 Q 8,82 10,50 Q 14,20 60,14 Q 106,20 110,50 Q 112,82 100,112 Q 80,132 60,134 Q 40,132 20,112 Z',
      extra: 'M 16,104 Q 8,122 12,140 Q 34,152 60,152 Q 86,152 108,140 Q 112,122 104,104 Q 88,120 60,122 Q 32,120 16,104 Z',
    },
  }
  const hair  = hairPaths[config.hairStyle] ?? hairPaths.short
  const eyeR  = comic ? 9 : 7.5
  const eyeRy = comic ? 9.5 : 7
  const mouth = EXPR_MOUTH[expr] ?? EXPR_MOUTH.smile
  const brow  = EXPR_BROW[expr]  ?? EXPR_BROW.neutral

  // Namens-Badge: max 12 Zeichen, ggf. abschneiden
  const badgeName = (config.avatarName ?? '').trim().substring(0, 12)

  return (
    <svg
      id={svgId}
      viewBox="0 0 120 150"
      width={size}
      height={Math.round(size * 1.25)}
      className={className}
    >
      <defs>
        <radialGradient id={uid} cx="38%" cy="28%" r="65%">
          <stop offset="0%"   stopColor={skinLight} />
          <stop offset="60%"  stopColor={skinBase} />
          <stop offset="100%" stopColor={skinShade} />
        </radialGradient>
        <radialGradient id={`${uid}-e`} cx="35%" cy="30%" r="60%">
          <stop offset="0%"   stopColor={eyeCol} />
          <stop offset="100%" stopColor={eyeCol} stopOpacity="0.5" />
        </radialGradient>
        {/* Blink-Animation */}
        <style>{`
          @keyframes ${uid}-blink {
            0%,92%,100% { transform: scaleY(1); }
            96%          { transform: scaleY(0.08); }
          }
          @keyframes ${uid}-breathe {
            0%,100% { transform: translateY(0); }
            50%     { transform: translateY(1px); }
          }
          .${uid}-face  { animation: ${uid}-breathe 3.5s ease-in-out infinite; }
          .${uid}-eyes  { animation: ${uid}-blink 4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        `}</style>
      </defs>

      {/* Hintergrund */}
      <rect width="120" height="150" rx="12" fill="#060d1f" />

      {/* Raumanzug – Schultern */}
      <ellipse cx="60" cy="156" rx="58" ry="26" fill={suitCols[0]} />
      <ellipse cx="60" cy="149" rx="44" ry="20" fill={suitCols[1]}
        stroke={suitCols[2]} strokeWidth={comic ? 2 : 1} />
      <path d="M 18,142 Q 60,155 102,142"
        fill="none" stroke={suitCols[3]} strokeWidth={comic ? 1.5 : 0.8} />

      {/* Namens-Badge auf dem Anzug */}
      {showName && badgeName && (
        <text
          x="60" y="148"
          textAnchor="middle"
          fontSize="5.5"
          fontFamily="monospace"
          fontWeight="bold"
          fill={suitCols[3]}
          opacity="0.9"
        >
          {badgeName.toUpperCase()}
        </text>
      )}

      {/* Hals */}
      <rect x="50" y="112" width="20" height="18" rx="6"
        fill={isHijab ? hairCol : (comic ? skinBase : `url(#${uid})`)}
        stroke={sc} strokeWidth={sw * 0.8} />

      {/* Haar (hinter Gesicht) */}
      <path d={hair.cap} fill={hairCol} stroke={sc} strokeWidth={sw} />
      {hair.extra && <path d={hair.extra} fill={hairCol} stroke={sc} strokeWidth={sw} />}

      {/* Gesicht (mit Atem-Animation) */}
      <g className={`${uid}-face`}>
        <ellipse cx="60" cy="74" rx="36" ry="44"
          fill={comic ? skinBase : `url(#${uid})`}
          stroke={sc} strokeWidth={sw} />

        {/* Ohren */}
        {!isHijab && <>
          <ellipse cx="24" cy="74" rx="5.5" ry="8"
            fill={comic ? skinBase : `url(#${uid})`} stroke={sc} strokeWidth={sw * 0.7} />
          <ellipse cx="96" cy="74" rx="5.5" ry="8"
            fill={comic ? skinBase : `url(#${uid})`} stroke={sc} strokeWidth={sw * 0.7} />
        </>}

        {/* Augenbrauen (ausdrucks-abhängig) */}
        <path d={brow.left}  stroke={hairCol} strokeWidth={comic ? 2.8 : 1.8} fill="none" strokeLinecap="round" />
        <path d={brow.right} stroke={hairCol} strokeWidth={comic ? 2.8 : 1.8} fill="none" strokeLinecap="round" />

        {/* Augen (mit Blink-Animation) */}
        <g className={`${uid}-eyes`}>
          {/* Links */}
          <ellipse cx="44" cy="70" rx={eyeR} ry={eyeRy}
            fill="white" stroke={sc} strokeWidth={sw} />
          <circle cx="44" cy="70" r={eyeR * 0.6}
            fill={comic ? eyeCol : `url(#${uid}-e)`} />
          <circle cx="44" cy="70" r={eyeR * 0.3} fill="#0a0a0a" />
          <circle cx={44 + eyeR * 0.22} cy={70 - eyeR * 0.22} r={comic ? 2 : 1.5} fill="white" />
          {/* Rechts */}
          <ellipse cx="76" cy="70" rx={eyeR} ry={eyeRy}
            fill="white" stroke={sc} strokeWidth={sw} />
          <circle cx="76" cy="70" r={eyeR * 0.6}
            fill={comic ? eyeCol : `url(#${uid}-e)`} />
          <circle cx="76" cy="70" r={eyeR * 0.3} fill="#0a0a0a" />
          <circle cx={76 + eyeR * 0.22} cy={70 - eyeR * 0.22} r={comic ? 2 : 1.5} fill="white" />
        </g>

        {/* Nase */}
        {comic
          ? <path d="M 58,83 Q 55,91 58,94 Q 62,97 66,94"
              stroke={skinShade} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          : <path d="M 59,81 Q 56,89 59,92 Q 63,95 67,92"
              stroke={skinShade} strokeWidth="0.9" fill="none" strokeLinecap="round" />
        }

        {/* Mund (ausdrucks-abhängig) */}
        <path
          d={comic ? mouth.comic : mouth.real}
          stroke={comic ? sc : '#6b3a2a'}
          strokeWidth={comic ? 2.2 : 1.2}
          fill="none"
          strokeLinecap="round"
        />

        {/* Comic-Wangen */}
        {comic && <>
          <circle cx="32" cy="86" r="7" fill="#ff9b9b" opacity="0.35" />
          <circle cx="88" cy="86" r="7" fill="#ff9b9b" opacity="0.35" />
        </>}

        {/* Realistischer Mund-Schimmer */}
        {!comic &&
          <path d="M 50,100 Q 60,104 70,100"
            stroke={skinShade} strokeWidth="0.5" fill="none" opacity="0.5" />
        }
      </g>
    </svg>
  )
}
