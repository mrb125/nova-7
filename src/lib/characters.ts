import type { Character } from '../types/game'

export const CHARACTERS: Character[] = [
  {
    id: 'leon',
    name: 'Dr. Leon Hartmann',
    title: 'Kernphysik-Trainee',
    description: 'Promoviert über radioaktive Zerfallsreihen. Kennt jede Formel auswendig.',
    backstory: 'Leon hat seine gesamte Jugend in Bibliotheken verbracht und könnte die Zerfallsgleichungen im Schlaf aufschreiben. Auf der U.S.S. Blankenagel ist er für seine erste Mission — und sein erster Test ist bereits ein Notfall.',
    motto: '„Die Gleichung lügt nie."',
    bonusLevels: [11, 12, 13, 16, 20],
    bonusWP: 3,
    passiveName: 'Rechenbonus',
    passiveDescription: '+1 min Zeitlimit in Rechen-/Graph-Leveln (L11, L12, L13, L16, L20)',
    color: '#06b6d4',
    icon: '🔬',
  },
  {
    id: 'mia',
    name: 'Cmdr. Mia Schneider',
    title: 'Medizin-Offizierin',
    description: '12 Jahre Erfahrung mit Strahlungsopfern. Kennt jeden Grenzwert aus dem Schlaf.',
    backstory: 'Mia war beim Titan-Vorfall 2143 dabei. Sie hat gesehen, was Strahlung mit Menschen macht — und hat geschworen, dass so etwas nie wieder passiert, wenn sie dabei ist.',
    motto: '„Schütze zuerst, frag dann."',
    bonusLevels: [1, 4, 14, 17],
    bonusWP: 3,
    passiveName: 'Strahlenschutzbonus',
    passiveDescription: '−2 mSv Dosimeter bei optimaler Schutzentscheidung (L1, L4, L14, L17)',
    color: '#10b981',
    icon: '💊',
  },
  {
    id: 'kenji',
    name: 'Kenji Nakamura',
    title: 'Chefingenieur',
    description: 'Hat den Reaktor der U.S.S. Blankenagel selbst mitgebaut. Baut aus Schrottteilen funktionsfähige Geräte.',
    backstory: 'Kenji hat 23 Jahre in Kerntechnik verbracht. Er kennt jeden Sensor, jedes Rohr und jede Schwachstelle der U.S.S. Blankenagel. Wenn jemand weiß, wie man Strahlung abschirmt — dann er.',
    motto: '„Wenn\'s kaputt ist, baue ich was Besseres."',
    bonusLevels: [2, 6, 7, 8, 18],
    bonusWP: 3,
    passiveName: 'Dosimeter-Abschirmung',
    passiveDescription: 'Maximale Dosimetererhöhung pro Level −2 mSv (L2, L6, L7, L8, L18)',
    color: '#f59e0b',
    icon: '🔧',
  },
]

export function getCharacter(id: string): Character {
  return CHARACTERS.find(c => c.id === id) ?? CHARACTERS[0]
}
