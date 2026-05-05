"""
Nova-7 Scene Splitter
Teilt das 4×4 Raster-Bild in 16 einzelne Level-Bilder.
Aufruf: python split_scenes.py public/grid.jpg
"""
from PIL import Image
import os, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else "public/grid.jpg"
OUT = "public/scenes"
COLS, ROWS = 4, 4

NAMES = [
    "scene-l01.jpg", "scene-l02.jpg", "scene-l03.jpg", "scene-l04.jpg",
    "scene-l05.jpg", "scene-l06.jpg", "scene-l07.jpg", "scene-l08.jpg",
    "scene-l09.jpg", "scene-l10.jpg", "scene-l11.jpg", "scene-l12.jpg",
    "scene-l13.jpg", "scene-l14.jpg", "scene-l15.jpg", "scene-l16.jpg",
]

LABELS = [
    "L01 — Medizinstation",       "L02 — Strahlungslabor",
    "L03 — Erdbeobachtungs-Brücke","L04 — Ausrüstungsraum",
    "L05 — Dekontaminationsschleuse","L06 — Detektor-Labor",
    "L07 — Magnetkammer",          "L08 — Kernphysik-Labor",
    "L09 — Nuklearmedizin-Suite",  "L10 — Datenanalyse-Deck",
    "L11 — Nuklid-Kartenlabor",   "L12 — Notfall-Kommandozentrale",
    "L13 — Triage-Station",        "L14 — Fusionsreaktor-Ebene",
    "L15 — Abschirm-Ingenieurraum","L16 — Rettungsdock",
]

os.makedirs(OUT, exist_ok=True)
img  = Image.open(SRC)
w, h = img.size
cw, ch = w // COLS, h // ROWS

print(f"Bild: {w}×{h}px  →  Zelle: {cw}×{ch}px")

for i, (name, label) in enumerate(zip(NAMES, LABELS)):
    col = i % COLS
    row = i // COLS
    box  = (col * cw, row * ch, (col + 1) * cw, (row + 1) * ch)
    crop = img.crop(box)
    crop.save(os.path.join(OUT, name), "JPEG", quality=92)
    print(f"  ✓ {label}  →  {OUT}/{name}")

print(f"\nFertig! {len(NAMES)} Bilder gespeichert in {OUT}/")
