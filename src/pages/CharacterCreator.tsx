import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loadState, saveState } from '../lib/gameState'
import type {
  AvatarConfig, AvatarStyle,
  SkinTone, HairColor, HairStyle, EyeColor, SuitColor, Expression,
} from '../types/game'
import Avatar from '../components/ui/Avatar'

// ── Foto-Mapping ──────────────────────────────────────────────────────────────
const PHOTO_MAP: Record<string, string | null> = {
  'light_short':          'char_01',
  'light_long':           'char_02',
  'light_curly':          'char_03',
  'light_bun':            'char_26a',
  'light_hijab':          'char_21',
  'medium-light_short':   'char_35',
  'medium-light_long':    'char_06',
  'medium-light_curly':   'char_07',
  'medium-light_bun':     'char_08',
  'medium-light_hijab':   'char_22',
  'medium_short':         'char_31',
  'medium_long':          null,
  'medium_curly':         'char_36',
  'medium_bun':           'char_40b',
  'medium_hijab':         null,
  'medium-dark_short':    'char_27',
  'medium-dark_long':     null,
  'medium-dark_curly':    'char_28',
  'medium-dark_bun':      'char_39',
  'medium-dark_hijab':    'char_23',
  'dark_short':           'char_46',
  'dark_long':            null,
  'dark_curly':           'char_49',
  'dark_bun':             'char_50',
  'dark_hijab':           null,
}

function getPhotoSrc(skinTone: SkinTone, hairStyle: HairStyle): string | null {
  const file = PHOTO_MAP[`${skinTone}_${hairStyle}`]
  return file ? `/avatars/${file}.png` : null
}

// ── Konfigurationslisten ──────────────────────────────────────────────────────
const SKIN_TONES: { id: SkinTone; hex: string; label: string }[] = [
  { id: 'light',        hex: '#FDE8D8', label: 'Hell' },
  { id: 'medium-light', hex: '#F5CBA7', label: 'Mittel-Hell' },
  { id: 'medium',       hex: '#D4A574', label: 'Mittel' },
  { id: 'medium-dark',  hex: '#B5722A', label: 'Mittel-Dunkel' },
  { id: 'dark',         hex: '#7D4E2D', label: 'Dunkel' },
]

const HAIR_COLORS: { id: HairColor; hex: string; label: string }[] = [
  { id: 'black',  hex: '#1A1A1A', label: 'Schwarz' },
  { id: 'brown',  hex: '#6B3A2A', label: 'Braun' },
  { id: 'blonde', hex: '#D4A017', label: 'Blond' },
  { id: 'red',    hex: '#C0392B', label: 'Rot' },
  { id: 'white',  hex: '#D0D0D0', label: 'Weiß' },
  { id: 'blue',   hex: '#1A5E9B', label: 'Blau' },
]

const HAIR_STYLES: { id: HairStyle; label: string; emoji: string }[] = [
  { id: 'short',  label: 'Kurz',   emoji: '✂️' },
  { id: 'long',   label: 'Lang',   emoji: '〰️' },
  { id: 'curly',  label: 'Lockig', emoji: '🌀' },
  { id: 'bun',    label: 'Dutt',   emoji: '🎀' },
  { id: 'hijab',  label: 'Hijab',  emoji: '🧕' },
]

const EYE_COLORS: { id: EyeColor; hex: string; label: string }[] = [
  { id: 'blue',   hex: '#2980B9', label: 'Blau' },
  { id: 'green',  hex: '#229954', label: 'Grün' },
  { id: 'brown',  hex: '#795B2A', label: 'Braun' },
  { id: 'grey',   hex: '#7A8B9A', label: 'Grau' },
  { id: 'hazel',  hex: '#8B7040', label: 'Haselnuss' },
]

const SUIT_COLORS: { id: SuitColor; accent: string; label: string }[] = [
  { id: 'blue',   accent: '#2563eb', label: 'Blau' },
  { id: 'red',    accent: '#dc2626', label: 'Rot' },
  { id: 'green',  accent: '#22c55e', label: 'Grün' },
  { id: 'purple', accent: '#a855f7', label: 'Lila' },
  { id: 'orange', accent: '#ea580c', label: 'Orange' },
]

const EXPRESSIONS: { id: Expression; emoji: string; label: string }[] = [
  { id: 'neutral',    emoji: '😐', label: 'Neutral' },
  { id: 'smile',      emoji: '😊', label: 'Lächeln' },
  { id: 'determined', emoji: '😤', label: 'Entschlossen' },
]

// ── Zufalls-Helfer ─────────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)] }

// ── Komponente ────────────────────────────────────────────────────────────────
export default function CharacterCreator() {
  const navigate = useNavigate()
  const teamName = sessionStorage.getItem('nova7_teamname') ?? loadState()?.teamName ?? 'Team'

  const [style,      setStyle]      = useState<AvatarStyle>('comic')
  const [skinTone,   setSkinTone]   = useState<SkinTone>('medium-light')
  const [hairColor,  setHairColor]  = useState<HairColor>('brown')
  const [hairStyle,  setHairStyle]  = useState<HairStyle>('short')
  const [eyeColor,   setEyeColor]   = useState<EyeColor>('blue')
  const [suitColor,  setSuitColor]  = useState<SuitColor>('blue')
  const [expression, setExpression] = useState<Expression>('smile')
  const [avatarName, setAvatarName] = useState('')
  const [photoOk,    setPhotoOk]    = useState(false)

  const config: AvatarConfig = {
    style, skinTone, hairColor, hairStyle, eyeColor,
    suitColor, expression, avatarName,
  }

  const photoSrc = getPhotoSrc(skinTone, hairStyle)
  const showPhoto = style === 'realistic' && photoSrc !== null

  // ── PNG-Export ─────────────────────────────────────────────────────────────
  function downloadPNG() {
    const svgEl = document.getElementById('avatar-export-svg') as SVGSVGElement | null
    if (!svgEl) return
    const size = 340
    const svgStr = new XMLSerializer().serializeToString(svgEl)
    const blob   = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url    = URL.createObjectURL(blob)
    const img    = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = size
      canvas.height = Math.round(size * 1.25)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      const a = document.createElement('a')
      a.href     = canvas.toDataURL('image/png')
      a.download = `${avatarName || 'avatar'}.png`
      a.click()
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  function handleConfirm() {
    const state = loadState()
    if (!state) { navigate('/'); return }
    saveState({ ...state, avatarConfig: config })
    navigate('/spiel')
  }

  function randomize() {
    setSkinTone(pick(SKIN_TONES).id)
    setHairColor(pick(HAIR_COLORS).id)
    setHairStyle(pick(HAIR_STYLES).id)
    setEyeColor(pick(EYE_COLORS).id)
    setSuitColor(pick(SUIT_COLORS).id)
    setExpression(pick(EXPRESSIONS).id)
    setPhotoOk(false)
  }

  // ── UI-Helfer ──────────────────────────────────────────────────────────────
  const swatch = (active: boolean, hex: string, onClick: () => void, label: string) => (
    <button
      key={hex}
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-9 h-9 rounded-full cursor-pointer transition-all"
      style={{
        background: hex,
        border:     active ? '3px solid #06b6d4' : '2px solid rgba(100,116,139,0.35)',
        boxShadow:  active ? '0 0 10px rgba(6,182,212,0.55)' : 'none',
        transform:  active ? 'scale(1.15)' : 'scale(1)',
      }}
    />
  )

  const rowLabel = (text: string) => (
    <div className="text-cyan-400/70 hud-font text-xs tracking-widest mb-3">{text}</div>
  )

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-8 z-10">

      {/* Titel */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="text-cyan-400/70 hud-font text-sm tracking-widest mb-2">
          TEAM: {teamName.toUpperCase()}
        </div>
        <h2 className="hud-font text-3xl font-bold text-white mb-2">Charakter erstellen</h2>
        <p className="text-slate-400 text-sm">Gestalte den Avatar deines Teams – rein kosmetisch</p>
      </motion.div>

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Links: Optionen ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel p-6 space-y-5"
        >
          {/* Stil + Zufall */}
          <div>
            {rowLabel('STIL')}
            <div className="flex gap-2">
              {(['comic', 'realistic'] as AvatarStyle[]).map(s => (
                <button
                  key={s}
                  onClick={() => { setStyle(s); setPhotoOk(false) }}
                  className="flex-1 py-2.5 rounded-lg hud-font text-xs tracking-wider font-bold cursor-pointer transition-all"
                  style={{
                    background: style === s ? 'rgba(6,182,212,0.18)' : 'rgba(30,41,59,0.45)',
                    border:     `1px solid ${style === s ? '#06b6d4' : 'rgba(100,116,139,0.3)'}`,
                    color:      style === s ? '#22d3ee' : '#64748b',
                  }}
                >
                  {s === 'comic' ? '🎨 COMIC' : '📷 FOTO'}
                </button>
              ))}
              {/* Zufalls-Button */}
              <button
                onClick={randomize}
                title="Zufälliger Charakter"
                className="px-3 py-2.5 rounded-lg hud-font text-sm font-bold cursor-pointer transition-all hover:scale-110 active:scale-95"
                style={{
                  background: 'rgba(124,58,237,0.18)',
                  border:     '1px solid rgba(124,58,237,0.4)',
                  color:      '#a78bfa',
                }}
              >
                🎲
              </button>
            </div>
          </div>

          {/* Hautton */}
          <div>
            {rowLabel('HAUTTON')}
            <div className="flex gap-3 flex-wrap">
              {SKIN_TONES.map(t => swatch(
                skinTone === t.id, t.hex,
                () => { setSkinTone(t.id); setPhotoOk(false) },
                t.label,
              ))}
            </div>
          </div>

          {/* Haarfarbe / Hijab-Farbe */}
          <div>
            {rowLabel(hairStyle === 'hijab' ? 'HIJAB-FARBE' : 'HAARFARBE')}
            <div className="flex gap-3 flex-wrap">
              {HAIR_COLORS.map(h => swatch(hairColor === h.id, h.hex, () => setHairColor(h.id), h.label))}
            </div>
          </div>

          {/* Haarstil */}
          <div>
            {rowLabel('HAARSTIL')}
            <div className="grid grid-cols-5 gap-2">
              {HAIR_STYLES.map(h => (
                <button
                  key={h.id}
                  onClick={() => { setHairStyle(h.id); setPhotoOk(false) }}
                  className="py-2.5 rounded-lg hud-font text-xs cursor-pointer transition-all"
                  style={{
                    background: hairStyle === h.id ? 'rgba(6,182,212,0.15)' : 'rgba(30,41,59,0.4)',
                    border:     `1px solid ${hairStyle === h.id ? '#06b6d4' : 'rgba(100,116,139,0.3)'}`,
                    color:      hairStyle === h.id ? '#22d3ee' : '#94a3b8',
                  }}
                >
                  <div className="text-base mb-0.5">{h.emoji}</div>
                  <div>{h.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Augenfarbe */}
          <div>
            {rowLabel('AUGENFARBE')}
            <div className="flex gap-3 flex-wrap">
              {EYE_COLORS.map(e => swatch(eyeColor === e.id, e.hex, () => setEyeColor(e.id), e.label))}
            </div>
          </div>

          {/* Raumanzug-Farbe */}
          <div>
            {rowLabel('RAUMANZUG')}
            <div className="flex gap-3 flex-wrap">
              {SUIT_COLORS.map(s => swatch(
                suitColor === s.id, s.accent,
                () => setSuitColor(s.id),
                s.label,
              ))}
            </div>
          </div>

          {/* Ausdruck */}
          <div>
            {rowLabel('AUSDRUCK')}
            <div className="grid grid-cols-3 gap-2">
              {EXPRESSIONS.map(ex => (
                <button
                  key={ex.id}
                  onClick={() => setExpression(ex.id)}
                  className="py-2.5 rounded-lg hud-font text-xs cursor-pointer transition-all"
                  style={{
                    background: expression === ex.id ? 'rgba(6,182,212,0.15)' : 'rgba(30,41,59,0.4)',
                    border:     `1px solid ${expression === ex.id ? '#06b6d4' : 'rgba(100,116,139,0.3)'}`,
                    color:      expression === ex.id ? '#22d3ee' : '#94a3b8',
                  }}
                >
                  <div className="text-xl mb-0.5">{ex.emoji}</div>
                  <div>{ex.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            {rowLabel('CHARAKTERNAME (OPTIONAL)')}
            <input
              type="text"
              value={avatarName}
              onChange={e => setAvatarName(e.target.value)}
              placeholder="Name deines Charakters …"
              maxLength={20}
              className="w-full px-4 py-2 rounded-lg text-sm text-white placeholder-slate-500 outline-none transition-colors"
              style={{
                background: 'rgba(15,23,42,0.7)',
                border:     '1px solid rgba(6,182,212,0.2)',
              }}
              onFocus={e => (e.target.style.borderColor = 'rgba(6,182,212,0.6)')}
              onBlur={e  => (e.target.style.borderColor = 'rgba(6,182,212,0.2)')}
            />
          </div>
        </motion.div>

        {/* ── Rechts: Vorschau ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-6 flex flex-col items-center justify-center gap-4"
        >
          <div className="text-cyan-400/70 hud-font text-xs tracking-widest">VORSCHAU</div>

          <div className="relative" style={{ filter: 'drop-shadow(0 0 24px rgba(6,182,212,0.35))' }}>
            {/* Foto-Modus */}
            {showPhoto && (
              <img
                key={photoSrc}
                src={photoSrc!}
                onLoad={() => setPhotoOk(true)}
                onError={() => setPhotoOk(false)}
                alt="Avatar"
                style={{
                  width: 170, height: 170,
                  objectFit: 'cover',
                  borderRadius: 14,
                  display: photoOk ? 'block' : 'none',
                  border: '1px solid rgba(6,182,212,0.3)',
                }}
              />
            )}

            {/* SVG-Fallback (mit ID für PNG-Export) */}
            {(!showPhoto || !photoOk) && (
              <Avatar config={config} size={170} showName={!!avatarName}
                animId="preview" svgId="avatar-export-svg" />
            )}

            {showPhoto && !photoOk && (
              <div className="absolute bottom-0 left-0 right-0 text-center hud-font pb-1"
                style={{ fontSize: 9, color: '#475569' }}>
                FOTO FOLGT
              </div>
            )}
          </div>

          {/* PNG-Download (nur Comic/SVG) */}
          {style === 'comic' && (
            <button
              onClick={downloadPNG}
              title="Avatar als PNG speichern"
              className="px-4 py-1.5 rounded-lg hud-font text-xs tracking-wider cursor-pointer transition-all hover:brightness-110"
              style={{
                background: 'rgba(6,182,212,0.1)',
                border:     '1px solid rgba(6,182,212,0.3)',
                color:      '#67e8f9',
              }}
            >
              ⬇ PNG speichern
            </button>
          )}

          <div className="text-center">
            <div className="hud-font text-white text-xl font-bold tracking-wide">
              {avatarName || '— kein Name —'}
            </div>
            <div className="text-slate-400 text-sm mt-1">
              {style === 'comic' ? '🎨 Comic-Stil' : '📷 Foto-Stil'}
              {' · '}
              {EXPRESSIONS.find(e => e.id === expression)?.emoji}
              {' · '}
              <span style={{ color: SUIT_COLORS.find(s => s.id === suitColor)?.accent }}>
                ● {suitColor.charAt(0).toUpperCase() + suitColor.slice(1)}
              </span>
            </div>
            <div className="text-slate-600 text-xs mt-2 hud-font tracking-wider">
              TEAM: {teamName.toUpperCase()}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bestätigen */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        onClick={handleConfirm}
        className="mt-6 px-10 py-4 rounded-xl hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
        style={{
          background: 'linear-gradient(135deg, #0891b2, #7c3aed)',
          border:     '1px solid rgba(6,182,212,0.4)',
          boxShadow:  '0 0 30px rgba(6,182,212,0.3)',
        }}
      >
        WEITER ZUR MISSION →
      </motion.button>

      <button
        onClick={handleConfirm}
        className="mt-3 text-slate-600 text-xs hud-font hover:text-slate-400 transition-colors cursor-pointer"
      >
        Überspringen
      </button>
    </div>
  )
}
