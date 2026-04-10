import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MatchingGame from '../components/minigames/MatchingGame'
import FillInBlanks from '../components/minigames/FillInBlanks'
import SortingGame from '../components/minigames/SortingGame'
import Crossword from '../components/minigames/Crossword'

interface GameCard {
  id: string
  title: string
  subtitle: string
  icon: string
  color: string
  border: string
  description: string
}

const GAMES: GameCard[] = [
  {
    id: 'matching',
    title: 'Zuordnungs-Spiel',
    subtitle: 'Begriffe & Erklärungen',
    icon: '🔗',
    color: 'rgba(6,182,212,0.12)',
    border: 'rgba(6,182,212,0.4)',
    description: 'Verbinde jeden Fachbegriff mit der richtigen Definition. Klicke Begriff + Erklärung.',
  },
  {
    id: 'fillblanks',
    title: 'Lückentext',
    subtitle: 'Fachtexte vervollständigen',
    icon: '✏️',
    color: 'rgba(124,58,237,0.12)',
    border: 'rgba(124,58,237,0.4)',
    description: 'Fülle die Lücken in Fachtexten zur Strahlenphysik. Wähle aus der Wortbank.',
  },
  {
    id: 'sorting',
    title: 'Reihenfolge sortieren',
    subtitle: 'Zerfallsketten & Vergleiche',
    icon: '↕️',
    color: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.4)',
    description: 'Bringe Zerfallsreihen, Strahlungsarten und Lebensmittel in die richtige Reihenfolge.',
  },
  {
    id: 'crossword',
    title: 'Kreuzworträtsel',
    subtitle: 'Strahlenphysik A–Z',
    icon: '⬛',
    color: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.4)',
    description: 'Löse das physikalische Kreuzworträtsel mit Begriffen rund um ionisierende Strahlung.',
  },
]

export default function MiniGames() {
  const navigate = useNavigate()
  const [active, setActive] = useState<string | null>(null)

  const activeGame = GAMES.find(g => g.id === active)

  return (
    <div className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => active ? setActive(null) : navigate('/')}
          className="text-slate-400 hover:text-white transition-colors cursor-pointer text-sm hud-font">
          ← {active ? 'ZURÜCK ZUR AUSWAHL' : 'HAUPTMENÜ'}
        </button>
      </div>

      {!active ? (
        <>
          <div className="mb-6">
            <h1 className="hud-font text-3xl font-black mb-1"
              style={{ background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              MINI-SPIELE
            </h1>
            <p className="text-slate-400 text-sm">Wiederhole und festige dein Wissen zur ionisierenden Strahlung.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GAMES.map(game => (
              <button key={game.id} onClick={() => setActive(game.id)}
                className="p-5 rounded-xl text-left transition-all cursor-pointer hover:brightness-110 hover:scale-[1.02]"
                style={{
                  background: game.color,
                  border: `1px solid ${game.border}`,
                }}>
                <div className="text-3xl mb-3">{game.icon}</div>
                <div className="hud-font text-white font-bold text-base mb-0.5">{game.title}</div>
                <div className="text-xs hud-font mb-2" style={{ color: game.border.replace('0.4', '0.9') }}>{game.subtitle}</div>
                <div className="text-slate-400 text-xs leading-relaxed">{game.description}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4">
          {/* Game header */}
          <div className="glass-panel p-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{activeGame?.icon}</span>
              <div>
                <h2 className="hud-font text-lg font-bold text-white">{activeGame?.title}</h2>
                <p className="text-slate-400 text-xs">{activeGame?.subtitle}</p>
              </div>
            </div>
          </div>

          {/* Game content */}
          <div className="glass-panel p-5">
            {active === 'matching' && <MatchingGame />}
            {active === 'fillblanks' && <FillInBlanks />}
            {active === 'sorting' && <SortingGame />}
            {active === 'crossword' && <Crossword />}
          </div>
        </div>
      )}
    </div>
  )
}
