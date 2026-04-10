import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

export default function Intro() {
  const navigate    = useNavigate()
  const videoRef    = useRef<HTMLVideoElement>(null)
  const [ended,    setEnded]    = useState(false)
  const [playing,  setPlaying]  = useState(false)
  const [muted,    setMuted]    = useState(false)

  function handlePlay() {
    setPlaying(true)
    videoRef.current?.play()
  }

  function goToGame() {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden px-4">

      {/* Star field */}
      {[
        [12,8],[25,18],[40,5],[55,22],[70,10],[85,3],[95,15],
        [8,30],[20,45],[35,38],[50,50],[65,42],[80,35],[92,48],
        [5,60],[18,72],[30,65],[48,78],[60,70],[75,80],[88,68],
        [15,88],[35,92],[55,85],[72,95],[90,82],
      ].map(([x, y], i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${x}%`, top: `${y}%`,
            width: i % 3 === 0 ? '2px' : '1px',
            height: i % 3 === 0 ? '2px' : '1px',
            background: '#e2e8f0',
            opacity: 0.3 + (i % 5) * 0.1,
          }}
        />
      ))}

      {/* AURA status bar */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 px-5 py-2 rounded-full flex items-center gap-2 hud-font text-xs tracking-widest"
        style={{
          background: 'rgba(6,182,212,0.08)',
          border: '1px solid rgba(6,182,212,0.35)',
          color: '#22d3ee',
        }}
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400 blink inline-block" />
        AURA ONLINE — MISSIONSBRIEFING · U.S.S. BLANKENAGEL
      </motion.div>

      {/* Video container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgba(6,182,212,0.35)',
          boxShadow: '0 0 60px rgba(6,182,212,0.12), 0 0 120px rgba(124,58,237,0.08)',
        }}
      >
        {/* Corner brackets */}
        {(['tl','tr','bl','br'] as const).map(corner => (
          <div
            key={corner}
            className="absolute z-20"
            style={{
              top:    corner.startsWith('t') ? 8  : undefined,
              bottom: corner.startsWith('b') ? 8  : undefined,
              left:   corner.endsWith('l')   ? 8  : undefined,
              right:  corner.endsWith('r')   ? 8  : undefined,
              width: 16, height: 16,
              borderTop:    corner.startsWith('t') ? '2px solid #22d3ee' : undefined,
              borderBottom: corner.startsWith('b') ? '2px solid #22d3ee' : undefined,
              borderLeft:   corner.endsWith('l')   ? '2px solid #22d3ee' : undefined,
              borderRight:  corner.endsWith('r')   ? '2px solid #22d3ee' : undefined,
              opacity: 0.7,
            }}
          />
        ))}

        {/* Video */}
        <video
          ref={videoRef}
          src="/intro.mp4"
          className="w-full block"
          muted={muted}
          preload="none"
          onEnded={() => setEnded(true)}
          onPlay={() => setPlaying(true)}
          onError={() => setEnded(true)}
          playsInline
          style={{ aspectRatio: '16/9', background: '#000' }}
        />

        {/* Play overlay (before start) */}
        <AnimatePresence>
          {!playing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10"
              style={{ background: 'rgba(0,0,0,0.7)' }}
              onClick={handlePlay}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 0px #22d3ee00','0 0 30px #22d3ee80','0 0 0px #22d3ee00'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
                style={{ background: 'rgba(6,182,212,0.15)', border: '2px solid #22d3ee' }}
              >
                <span style={{ fontSize: 32, color: '#22d3ee', marginLeft: 4 }}>▶</span>
              </motion.div>
              <p className="hud-font text-cyan-400 tracking-widest text-sm">MISSIONSBRIEFING ABSPIELEN</p>
              <p className="hud-font text-slate-500 text-xs mt-1">Kapitän · U.S.S. Blankenagel · 2157</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mute toggle (while playing) */}
        {playing && (
          <button
            onClick={() => setMuted(m => !m)}
            className="absolute bottom-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center hud-font text-xs cursor-pointer"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: '1px solid rgba(6,182,212,0.4)',
              color: '#22d3ee',
            }}
            title={muted ? 'Ton an' : 'Ton aus'}
          >
            {muted ? '🔇' : '🔊'}
          </button>
        )}
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-8 flex flex-wrap gap-4 justify-center"
      >
        {/* Skip / continue always visible */}
        <button
          onClick={goToGame}
          className="px-6 py-2.5 rounded-lg hud-font text-xs tracking-widest cursor-pointer transition-all hover:brightness-125"
          style={{
            background: 'rgba(30,41,59,0.6)',
            border: '1px solid rgba(100,116,139,0.35)',
            color: '#64748b',
          }}
        >
          ⏭ ÜBERSPRINGEN
        </button>

        {/* Mission start – glows after video ends */}
        <motion.button
          onClick={goToGame}
          animate={ended
            ? { boxShadow: ['0 0 0px #06b6d400','0 0 24px #06b6d480','0 0 0px #06b6d400'] }
            : {}
          }
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          className="px-8 py-3 rounded-lg hud-font text-sm tracking-widest font-bold cursor-pointer transition-all"
          style={{
            background: ended
              ? 'linear-gradient(135deg, #0891b2, #7c3aed)'
              : 'rgba(8,145,178,0.15)',
            border: ended
              ? '1.5px solid rgba(6,182,212,0.6)'
              : '1px solid rgba(6,182,212,0.25)',
            color: ended ? '#fff' : '#475569',
          }}
        >
          ▶ MISSION STARTEN
        </motion.button>
      </motion.div>

      {/* Bottom label */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 hud-font text-[10px] text-slate-700 tracking-widest"
      >
        U.S.S. BLANKENAGEL · NOTFALLPROTOKOLL · JAHR 2157
      </motion.p>
    </div>
  )
}
