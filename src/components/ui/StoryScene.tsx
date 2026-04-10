import { motion } from 'framer-motion'

interface Props {
  levelNumber: number
}

interface SceneMeta {
  room: string
  log: string
  color: string
}

const META: Record<number, SceneMeta> = {
  1:  { room: 'MEDIZINSTATION',   log: 'AURA: Strahlenopfer in Abteil Alpha-3. Sofortmaßnahmen erforderlich.',                       color: '#ef4444' },
  2:  { room: 'ISOTOPENLABOR',    log: 'AURA: Kontaminierte Isotopen-Proben sichergestellt. Beta-Sektor gesichert.',                  color: '#10b981' },
  3:  { room: 'MONITORING-DECK',  log: 'AURA: Strahlenbelastungs-Dashboard geladen. Quellenanalyse erforderlich.',                   color: '#64748b' },
  4:  { room: 'AUSRÜSTUNGSDEPOT', log: 'AURA: Alpha- und Gamma-Strahlung aktiv. Kombinierter Schutz zwingend.',                      color: '#06b6d4' },
  5:  { room: 'SCHLEUSENBEREICH', log: 'AURA: Schadensmeldungen eingegangen. Dekontaminationsprotokoll wird initiiert.',              color: '#f97316' },
  6:  { room: 'TECHNIKMODUL',     log: 'AURA: Systemausfall in Delta-4. Kühlkreislauf unterbrochen.',                                color: '#f59e0b' },
  7:  { room: 'HOLOGRAPHIELABOR', log: 'AURA: Holodaten zeigen Reaktorzustand. Analyse wird vorbereitet.',                           color: '#a78bfa' },
  8:  { room: 'QUANTENARCHIV',    log: 'AURA: Historische Messwerte geladen. Vergleichsdaten verfügbar.',                            color: '#06b6d4' },
  9:  { room: 'MEDIZIN-LABOR',    log: 'AURA: Radiopharmaka-Inventar geprüft. Isotop-Zuweisung für Behandlungen erforderlich.',      color: '#a78bfa' },
  10: { room: 'DATENNETZ-HUB',    log: 'AURA: Netzwerkknoten überlastet. Verbindung instabil — priorisiere Daten.',                  color: '#818cf8' },
  11: { room: 'QUANTENSERVER',    log: 'AURA: Quantenrechner initialisiert. Zerfallsberechnungen starten.',                          color: '#22d3ee' },
  12: { room: 'HYDROPONICS-BAY',  log: 'AURA: Zerfallsdaten gesichert. Route durch Hydroponics — Kontaminationscheck erforderlich.', color: '#10b981' },
  13: { room: 'TRIAGESTATION',    log: 'AURA: Dosimeter-Auswertung läuft. Triage für Crew-Mitglieder einleiten.',                    color: '#f59e0b' },
  14: { room: 'FUSIONSREAKTOR',   log: 'AURA: WARNUNG — Reaktorkern instabil. Kritischer Zustand erreicht.',                         color: '#ef4444' },
  15: { room: 'NOTSCHLEUSE',      log: 'AURA: Evakuierungskapsel angefordert. Wähle sicheren Unterschlupf bis Ankunft.',             color: '#f59e0b' },
  16: { room: 'RETTUNGSDOCK',     log: 'AURA: Letzte Mission. Rettungskapsel startklar. Alles hängt davon ab.',                      color: '#10b981' },
}

export default function StoryScene({ levelNumber }: Props) {
  const meta = META[levelNumber]
  if (!meta) return null

  const pad    = String(levelNumber).padStart(2, '0')
  const imgSrc = `/scenes/scene-l${pad}.jpg`

  return (
    <motion.div
      key={levelNumber}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-3"
    >
      <div
        className="rounded-xl overflow-hidden relative"
        style={{ border: `1px solid ${meta.color}30` }}
      >
        {/* Scene image */}
        <img
          src={imgSrc}
          alt={meta.room}
          className="w-full block"
          style={{ aspectRatio: '3 / 2', objectFit: 'cover', maxHeight: '200px' }}
          draggable={false}
        />

        {/* Dark gradient at bottom for text readability */}
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
            padding: '28px 12px 8px',
          }}
        >
          <span
            className="block font-mono"
            style={{ fontSize: '9px', color: meta.color, opacity: 0.85, marginBottom: '2px' }}
          >
            ▶ AURA-LOG:
          </span>
          <span
            className="block font-mono"
            style={{ fontSize: '9px', color: '#94a3b8', lineHeight: 1.4 }}
          >
            {meta.log.length > 90 ? meta.log.slice(0, 90) + '…' : meta.log}
          </span>
        </div>

        {/* Room label top-right */}
        <div
          className="absolute top-2 right-2 font-mono font-bold"
          style={{
            fontSize: '9px',
            color: meta.color,
            background: 'rgba(0,0,0,0.65)',
            padding: '3px 8px',
            borderRadius: '4px',
            border: `1px solid ${meta.color}40`,
            letterSpacing: '0.08em',
          }}
        >
          {meta.room}
        </div>
      </div>
    </motion.div>
  )
}
