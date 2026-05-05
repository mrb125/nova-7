import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loadState, createInitialState, saveState, loginTeam, getAllCredentials } from '../lib/gameState'
import USSBlankenageLogo from '../components/ui/USSBlankenageLogo'

type Mode = 'menu' | 'register' | 'login'

export default function Landing() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('menu')
  const [teamName, setTeamName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleResume() {
    const s = loadState()
    if (s) navigate('/spiel')
  }

  function handleRegister() {
    if (!teamName.trim() || !password.trim()) { setError('Teamname und Passwort eingeben.'); return }
    if (password.length < 3) { setError('Passwort: mindestens 3 Zeichen.'); return }
    const existing = getAllCredentials()
    if (existing.some(c => c.teamName.toLowerCase() === teamName.trim().toLowerCase())) {
      setError('Dieser Teamname ist bereits vergeben.'); return
    }
    sessionStorage.setItem('nova7_teamname', teamName.trim())
    sessionStorage.setItem('nova7_password', password.trim())
    navigate('/charakter')
  }

  function handleLogin() {
    if (!teamName.trim() || !password.trim()) { setError('Teamname und Passwort eingeben.'); return }
    const creds = loginTeam(teamName.trim(), password.trim())
    if (!creds) { setError('Teamname oder Passwort falsch.'); return }
    // Check multi-team storage first
    const all = JSON.parse(localStorage.getItem('nova7_teams') ?? '{}')
    if (all[creds.teamName]) {
      localStorage.setItem('nova7_team', JSON.stringify(all[creds.teamName]))
      navigate('/spiel')
    } else {
      // Fresh game
      const state = createInitialState(creds.teamName, creds.characterId)
      saveState(state)
      navigate('/spiel')
    }
  }

  const activeGame = loadState()
  const hasTeams = getAllCredentials().length > 0

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 z-10">
      {/* Earth orb */}
      <div className="fixed bottom-[-150px] right-[-100px] w-[500px] h-[500px] rounded-full opacity-20"
        style={{ background: 'radial-gradient(circle at 30% 40%, #1e40af, #1d4ed8, #0284c7, #064e3b)', boxShadow: '0 0 80px rgba(6,182,212,0.3)' }} />

      {/* AURA notification */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
        className="mb-8 px-4 py-2 rounded-full border border-cyan-500/40 bg-cyan-900/20 text-cyan-400 text-sm hud-font flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-cyan-400 blink inline-block" />
        AURA ONLINE — NOTFALLPROTOKOLL AKTIV
      </motion.div>

      {/* Title / Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="text-center mb-10"
      >
        <USSBlankenageLogo size={230} />
        <div className="mt-5 text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Jahr 2157. Reaktorversagen auf der Orbitalstation U.S.S. Blankenagel.
          Du musst 16 Sektoren überwinden und Dr. Kern retten — bevor dein Dosimeter die kritische Grenze erreicht.
        </div>
      </motion.div>

      {/* Main card */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-panel p-8 w-full max-w-md">

        {mode === 'menu' && (
          <div className="space-y-4">
            {activeGame && (
              <button onClick={handleResume}
                className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
                style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: '1px solid rgba(16,185,129,0.4)', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}>
                ▶ MISSION FORTSETZEN ({activeGame.teamName})
              </button>
            )}

            <button onClick={() => { setMode('register'); setError('') }}
              className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'linear-gradient(135deg, #0891b2, #7c3aed)', border: '1px solid rgba(6,182,212,0.4)', boxShadow: '0 0 20px rgba(6,182,212,0.2)' }}>
              ✦ NEUES TEAM REGISTRIEREN
            </button>

            {hasTeams && (
              <button onClick={() => { setMode('login'); setError('') }}
                className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
                style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(6,182,212,0.3)', color: '#94a3b8' }}>
                ↩ TEAM-LOGIN
              </button>
            )}

            <button onClick={() => navigate('/intro')}
              className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold cursor-pointer transition-all hover:brightness-110"
              style={{ background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.3)', color: '#67e8f9' }}>
              🎬 MISSIONSBRIEFING
            </button>

<button onClick={() => navigate('/lehrer')}
              className="w-full py-2 rounded-lg hud-font text-xs tracking-wider cursor-pointer transition-all"
              style={{ background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(100,116,139,0.2)', color: '#64748b' }}>
              🔒 LEHRERBEREICH
            </button>
          </div>
        )}

        {(mode === 'register' || mode === 'login') && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => { setMode('menu'); setError('') }} className="text-slate-400 hover:text-white cursor-pointer transition-colors text-sm">←</button>
              <h3 className="hud-font text-lg font-bold text-white">
                {mode === 'register' ? 'TEAM REGISTRIEREN' : 'TEAM-LOGIN'}
              </h3>
            </div>

            <div>
              <label className="block text-cyan-300 text-xs hud-font mb-1 tracking-wider">TEAMNAME</label>
              <input type="text" value={teamName} onChange={e => { setTeamName(e.target.value); setError('') }}
                placeholder="z.B. Die Elektronen" maxLength={30}
                className="w-full bg-slate-900/60 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                autoFocus />
            </div>

            <div>
              <label className="block text-cyan-300 text-xs hud-font mb-1 tracking-wider">PASSWORT</label>
              <input type="password" value={password} onChange={e => { setPassword(e.target.value); setError('') }}
                placeholder={mode === 'register' ? 'Einfaches Gruppenpasswort' : 'Passwort eingeben'}
                className="w-full bg-slate-900/60 border border-cyan-500/30 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                onKeyDown={e => e.key === 'Enter' && (mode === 'register' ? handleRegister() : handleLogin())} />
            </div>

            {error && (
              <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm text-center">
                {error}
              </motion.p>
            )}

            <button onClick={mode === 'register' ? handleRegister : handleLogin}
              disabled={!teamName.trim() || !password.trim()}
              className="w-full py-3 rounded-lg hud-font text-sm tracking-wider font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              style={{
                background: (teamName.trim() && password.trim()) ? 'linear-gradient(135deg, #0891b2, #7c3aed)' : '#1e293b',
                border: '1px solid rgba(6,182,212,0.4)',
                boxShadow: (teamName.trim() && password.trim()) ? '0 0 20px rgba(6,182,212,0.3)' : 'none',
              }}>
              {mode === 'register' ? 'WEITER ZUR CHARAKTERWAHL →' : 'EINLOGGEN →'}
            </button>
          </div>
        )}
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="mt-8 flex gap-6 text-xs text-slate-500 hud-font">
        <span>16 SEKTOREN</span><span>·</span><span>3 CHARAKTERE</span><span>·</span><span>DOSIMETER: 0 mSv</span>
      </motion.div>
    </div>
  )
}
