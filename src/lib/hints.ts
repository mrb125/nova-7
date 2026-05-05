export interface LevelHint {
  index: number
  cost: number
  label: string
  text: string
}

export const LEVEL_HINTS: Record<number, LevelHint[]> = {
  1: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Alpha-Strahlung wird bereits durch ein Blatt Papier oder die Hornhaut der Haut gestoppt – sie ist nur bei Inhalation oder Ingestion gefährlich.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Eine Filtermaske schützt vor der Inhalation von Alpha-Strahlern. Gamma-Strahlung erfordert schwere Abschirmung (Blei/Beton).' },
  ],
  2: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Je größer die Masse und Ladung eines Teilchens, desto mehr ionisiert es – aber desto weniger dringt es durch Materie.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Gamma-Strahlung hat keine Ladung und keine Masse → höchstes Durchdringungsvermögen, geringstes Ionisierungsvermögen.' },
  ],
  3: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Radon-222 ist ein radioaktives Edelgas, das aus dem natürlichen Uranzerfall im Erdboden entsteht und in schlecht belüfteten Räumen akkumuliert.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Der größte Anteil der natürlichen Strahlenbelastung in Deutschland kommt von Radon (ca. 1,1 mSv/Jahr von 2,1 mSv gesamt).' },
  ],
  4: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Externe Strahlung kommt von außerhalb – Abstand halten und Abschirmung helfen. Interne Belastung (Inhalation/Ingestion) ist schwerer zu schützen.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Alpha-Strahler intern sind besonders gefährlich, da sie auf kurzer Strecke alle Energie im Gewebe abgeben.' },
  ],
  5: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Bestrahlung: Strahlung trifft den Körper von außen. Kontamination: radioaktive Substanz gelangt auf oder in den Körper.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Kontamination ist gefährlicher, weil der Körper dauerhaft bestrahlt wird. Dekontamination (Waschen, Kleidung wechseln) ist essenziell.' },
  ],
  6: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Im Zählrohr ionisiert Strahlung das Füllgas → Elektronen wandern zur Anode, erzeugen einen messbaren Stromimpuls.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Die angelegte Spannung verstärkt den Ionisationsprozess (Gasverstärkung). Jeder Einzel-Impuls entspricht einem detektierten Strahlungsereignis.' },
  ],
  7: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Lorentzkraft: F = q·v·B. Je größer q und kleiner m, desto stärker die Ablenkung (kleiner Radius).' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Alpha-Teilchen (schwer, doppelt geladen) werden weniger abgelenkt als Beta-Teilchen (leicht, einfach geladen).' },
  ],
  8: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Beim Alpha-Zerfall: Massenzahl A → A-4, Ordnungszahl Z → Z-2. Es wird ein Helium-4-Kern emittiert.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Beim Beta-minus-Zerfall: Z → Z+1, A bleibt gleich. Ein Neutron wandelt sich in ein Proton um.' },
  ],
  9: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Leichte Kerne sind stabil bei N≈Z. Schwere Kerne brauchen mehr Neutronen für Stabilität (N > Z).' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Neutronenüberschuss → β⁻-Zerfall. Protonenüberschuss → β⁺-Zerfall. Zu schwer (A > 200) → α-Zerfall.' },
  ],
  10: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Diagnostisch: kurze Halbwertszeit (Stunden), Gamma-Emission (von außen messbar), kein Gewebeschaden.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Therapeutisch: lokal wirkende Strahlung (beta/alpha), längere Halbwertszeit, gezielte Gewebezerstörung (z.B. Tumor).' },
  ],
  11: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Die Halbwertszeit ist der Zeitraum, in dem die Hälfte aller instabilen Kerne zerfallen ist. Der Zerfall ist statistisch, nicht vorhersagbar pro Atom.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'N(t) = N₀ · (1/2)^(t/T½). Der Graph fällt exponentiell – nähert sich nie null, weil immer eine endliche Anzahl Kerne übrig bleibt.' },
  ],
  12: [
    { index: 0, cost: 2, label: 'Hinweis 1', text: 'Radioaktivität hört nie vollständig auf, weil immer eine (wenn auch kleine) Anzahl instabiler Kerne vorhanden ist.' },
    { index: 1, cost: 4, label: 'Hinweis 2', text: 'Die Zerfallswahrscheinlichkeit pro Kern ist konstant und hängt nicht vom Alter des Atoms oder äußeren Bedingungen ab.' },
  ],
}

export function getHintsForLevel(levelNumber: number): LevelHint[] {
  return LEVEL_HINTS[levelNumber] ?? []
}
