# nova-7 — U.S.S. Blankenagel

Interaktives Lernspiel zu **Radioaktivität und Kernphysik** für den NRW-Physikunterricht.
Die Schüler:innen reisen als Crew der U.S.S. Blankenagel durch Sektoren mit physikalischen Aufgaben — von Halbwertszeit über Bestrahlung bis Kernspaltung — und schalten dabei Stationen, Achievements und Crew-Ränge frei.

---

## Eckdaten

- **Stufe / Kurs:** Sekundarstufe II — Grundkurs Physik (EF/Q1), wahlweise auch als Vertiefung in Q2.
- **Dauer:** ca. 4–6 Doppelstunden (modular spielbar, jeder Sektor 5–8 Minuten)
- **Bedienung:** Webbrowser (Chrome, Edge, Firefox, Safari). Optional als PWA installierbar.
- **Modi:** Solo (Browser) oder Klassen-Modus mit Server-Sync (Highscore, Lehrer-Dashboard, Team-Codes).

## KLP-Bezug (NRW Sek II)

Inhaltsfeld **Quantenphysik / Kernphysik** — adressierte Kompetenzen u.a.:

- Beschreibung des Aufbaus des Atomkerns und der Nuklidkarte
- Halbwertszeit und Zerfallsgesetz quantitativ anwenden (C-14-Methode, medizinische Anwendungen)
- Wirkung ionisierender Strahlung auf Materie und biologische Systeme erklären
- Energiebilanz von Kernspaltung und -fusion beschreiben
- Risiken/Chancen kerntechnischer Anwendungen reflektieren (Atomkraft, Nuklearmedizin)

Detaillierte Zuordnung pro Level: siehe [`docs/nova7-levelplan.html`](./docs/nova7-levelplan.html) (im Browser öffnen).

---

## Lokal entwickeln

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # produktiver Build → dist/
npm run preview      # gebauten Build lokal testen
npm run lint         # ESLint
```

### `.env` (optional)

Für Server-Sync siehe `.env.example`. Lokal lässt man `VITE_USE_SERVER=false`,
dann läuft alles offline gegen `localStorage`.

---

## Deploy

Push auf `main` → GitHub Action baut und deployt nach lima-city.

Erforderliche **GitHub-Secrets**:

| Secret | Zweck |
|---|---|
| `FTP_SERVER` | FTP-Host (lima-city) |
| `FTP_USERNAME` | FTP-User |
| `FTP_PASSWORD` | FTP-Password |
| `VITE_SERVER_URL` | URL der nova-7-API (z.B. `https://meine-schule.de/nova7/api`) |
| `VITE_API_KEY` | API-Key — muss mit `NOVA7_API_KEY` der PHP-Seite übereinstimmen |

Ziel-URL nach Deploy: **https://mrbl.4lima.de/nova-7/**

---

## Backend (optional, PHP + SQLite)

Im Ordner `api/` liegt ein PHP-Backend für Klassen-Modus:

- `config.php` — DB-Init und API-Key-Check (SQLite, auto-schema)
- `teams.php` / `unlocks.php` / `events.php` / `credentials.php` — REST-Endpoints
- Auth über Header `X-API-Key` gegen Server-Env-Var `NOVA7_API_KEY`

**Setup auf lima-city:**

1. `api/`-Ordner via FTP nach `/html/nova-7/api/`
2. In lima-city PHP-Settings die Env-Var `NOVA7_API_KEY=<wert>` setzen
3. Im Frontend `VITE_USE_SERVER=true` und `VITE_SERVER_URL=https://mrbl.4lima.de/nova-7/api` setzen

Schreibrechte für `api/nova7.sqlite` müssen vorhanden sein (lima-city default ok).

---

## Projektstruktur

```
nova-7/
├── src/
│   ├── pages/              # Top-Level Routes (Landing, Game, Teacher, …)
│   ├── components/
│   │   ├── levels/         # 22 Sektor-Komponenten (lazy geladen)
│   │   ├── minigames/      # Mini-Spiele (Crossword etc.)
│   │   ├── interactive/    # Interaktive Bausteine
│   │   └── ui/             # Wiederverwendbare UI-Komponenten
│   ├── contexts/           # React Contexts (GameState)
│   ├── lib/                # Reine Logik (achievements, gameState, push)
│   └── types/              # TS-Types
├── api/                    # PHP-Backend (siehe oben)
├── public/                 # Statische Assets (Avatare, Szenen, Intro-Video)
├── scripts/                # Dev-Helper (Pi-Guide, Scene-Splitter)
└── .github/workflows/      # CI/CD nach lima-city
```

## Datenschutz

- **Solo-Modus** (`VITE_USE_SERVER=false`): alle Daten bleiben im `localStorage` des Browsers, **kein Server-Kontakt**.
- **Klassen-Modus** (`VITE_USE_SERVER=true`): Team-Name, Team-Passwort (gehasht), Charakter-ID, Spielfortschritt, Highscore und Events werden an die nova-7-API auf lima-city gesendet. **Keine Klarnamen** — nur frei wählbare Team-Namen.
- Server speichert in SQLite. Die DB liegt geschützt im Webspace, Zugriff nur über API-Key.
- Empfehlung: Datei `nova7.sqlite` regelmäßig (z.B. am Schuljahresende) löschen.

## Tech-Stack

React 19 · TypeScript · Vite 7 · Tailwind v4 · framer-motion · React Router · vite-plugin-pwa · PHP 8 + SQLite (Backend)

## Lizenz / Kontakt

Privates Schulprojekt — Simon Blankenagel, NRW.
