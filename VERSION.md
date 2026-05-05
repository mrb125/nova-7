# nova-7 — v2 (Skill-konform refactored)

**Snapshot:** 2026-05-05, nach `app-anlegen`-Skill-Review
**Basis:** Commit `dfb375d` + Verbesserungen siehe unten

Diese v2 entstand durch eine Konformitäts-Prüfung gegen den `app-anlegen`-Skill (`~/.claude/skills/app-anlegen/SKILL.md`).

## Was sich v1 → v2 geändert hat

### 1. README.md komplett neu
- v1: Vite-Default-Boilerplate
- v2: Eckdaten, KLP-Bezug (Quantenphysik/Kernphysik NRW Sek II), Setup, Deploy mit Secrets-Tabelle, Backend-Setup, Datenschutz für Solo + Klassen-Modus, Tech-Stack

### 2. `vite.config.ts`
- `base: '/'` → **`base: './'`** (für Subdir-Deploy auf lima-city)
- `manualChunks` als hartkodierte Liste → **als Funktion** (automatisches Chunking by-path, neue Levels brauchen keine Config-Änderung mehr)
- PWA-`start_url`: `/` → `./`

### 3. `src/pages/Game.tsx`
- 21 eager `import` → **`React.lazy(() => import(...))`**
- Level-Renderzonen + Endscreen mit **`<Suspense fallback={<LevelLoader/>}>`** umschlossen
- Effekt: Initial-Bundle drastisch kleiner, jeder Level wird erst beim Betreten geladen

### 4. Repo-Aufräumen
- `make-pi-guide.cjs`, `split_scenes.py` → **`scripts/`**
- `nova7-levelplan.html` → **`docs/`** (Link im README angepasst)

## Bundle-Größen v2 (gemessen 2026-05-05, beide Builds verifiziert)

| Chunk | v1 (KB) | v2 (KB) | v2 gzipped |
|---|---|---|---|
| `index.js` (Initial) | **381** | **95** | 26 |
| `motion.js` | 124 | 32 | 11 |
| `vendor.js` | 48 | 192 | 60 |
| `levels.js` | 140 (eager) | 167 (lazy) | 41 |
| `deps.js` | — | 93 | 31 |
| `teacher.js` | (in index) | 52 | 16 |
| `minigames.js` | (in index) | 33 | 10 |
| `router.js` | (in vendor) | 36 | 13 |

**Effektiver Initial-Load (gzipped, ohne Lehrer-Dashboard und Levels):**
- v1: index 111 + vendor 17 + motion 41 = **~169 KB**
- v2: index 26 + vendor 60 + router 13 + deps 31 = **~130 KB** (−23%)

**Wichtigste Verbesserung:** Der `index.js` schrumpft von **381 KB auf 95 KB (−75%)**. Das Hauptbundle, das jeder Schüler beim ersten Aufruf lädt, ist drastisch kleiner. Lehrer-Dashboard (52 KB) und Mini-Spiele (33 KB) sind eigene Chunks — Schüler im Game-Modus laden die nie.

**Nicht im Initial-Load mehr (lazy):** Alle 22 Levels (167 KB), das Lehrer-Dashboard (52 KB), die Mini-Spiele (33 KB).

## Setup

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # Build verifizieren
npm run preview
```

## Was bewusst NICHT geändert wurde

Diese Refactorings sind größere Strukturveränderungen, die separater Diskussion bedürfen:

- `Teacher.tsx` (1341 Zeilen) → in Sub-Routes splitten
- `Game.tsx` (782 Zeilen) → `useGameRouter`-Hook + `useReducer`
- `Endscreen.tsx` (768 Zeilen) → in Sub-Komponenten zerlegen
- `UnitCircleApp` als eigenes Repo herauslösen
- Echte PNG-Icons für PWA generieren
- Tests einführen (Vitest + RTL + PHPUnit)

## Vergleichen

```bash
# Aus dem Projekte/-Ordner:
diff -r --brief nova-7-v1-original/ nova-7-v2/ | grep -v node_modules
```
