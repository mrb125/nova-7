const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
  PageNumber, Header, Footer, LevelFormat
} = require('docx');
const fs = require('fs');

const CYAN   = '0891B2';
const DARK   = '1E293B';
const LIGHT  = 'F1F5F9';
const GREEN  = '16A34A';
const ORANGE = 'EA580C';
const border = { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' };
const borders = { top: border, bottom: border, left: border, right: border };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 120 },
    children: [new TextRun({ text, bold: true, size: 32, font: 'Arial', color: CYAN })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 80 },
    children: [new TextRun({ text, bold: true, size: 26, font: 'Arial', color: DARK })]
  });
}
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [new TextRun({ text, font: 'Arial', size: 22, ...opts })]
  });
}
function tip(emoji, text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: emoji + '  ', font: 'Arial', size: 22 }),
      new TextRun({ text, font: 'Arial', size: 22 })
    ]
  });
}
function code(text) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    indent: { left: 360, right: 360 },
    shading: { type: ShadingType.CLEAR, fill: '1E293B' },
    children: [new TextRun({ text, font: 'Courier New', size: 20, color: '7DD3FC' })]
  });
}
function li(text, num = false) {
  return new Paragraph({
    spacing: { after: 80 },
    numbering: { reference: num ? 'nums' : 'bullets', level: 0 },
    children: [new TextRun({ text, font: 'Arial', size: 22 })]
  });
}
function spacer() {
  return new Paragraph({ spacing: { after: 80 }, children: [new TextRun('')] });
}
function badge(label, color) {
  return new TableCell({
    borders,
    shading: { type: ShadingType.CLEAR, fill: color },
    margins: { top: 60, bottom: 60, left: 120, right: 120 },
    width: { size: 2200, type: WidthType.DXA },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: label, font: 'Arial', size: 18, bold: true, color: 'FFFFFF' })]
    })]
  });
}
function infoBox(title, lines, fill = 'EFF6FF') {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: [9026],
    rows: [new TableRow({ children: [new TableCell({
      borders,
      shading: { type: ShadingType.CLEAR, fill },
      margins: { top: 120, bottom: 120, left: 200, right: 200 },
      width: { size: 9026, type: WidthType.DXA },
      children: [
        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: title, font: 'Arial', size: 22, bold: true, color: DARK })] }),
        ...lines.map(l => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: l, font: 'Arial', size: 20 })] }))
      ]
    })]})],
  });
}

const doc = new Document({
  numbering: {
    config: [
      { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '\u2022', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
      { reference: 'nums',    levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] },
    ]
  },
  styles: {
    default: { document: { run: { font: 'Arial', size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, font: 'Arial', color: CYAN }, paragraph: { spacing: { before: 360, after: 120 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, font: 'Arial', color: DARK }, paragraph: { spacing: { before: 240, after: 80 }, outlineLevel: 1 } },
    ]
  },
  sections: [{
    properties: {
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: CYAN } },
        children: [
          new TextRun({ text: 'U.S.S. Blankenagel  \u2014  Raspberry Pi Zero 2 Setup', font: 'Arial', size: 18, color: '64748B' }),
        ]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'Seite ', font: 'Arial', size: 18, color: '94A3B8' }), new TextRun({ children: [PageNumber.CURRENT], font: 'Arial', size: 18, color: '94A3B8' })]
      })] })
    },
    children: [

      // ═══════════════════ TITEL ═══════════════════
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 100 },
        children: [new TextRun({ text: 'U.S.S. Blankenagel', font: 'Arial', size: 52, bold: true, color: CYAN })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Raspberry Pi Zero 2 W \u2014 Setup-Anleitung', font: 'Arial', size: 28, color: '475569' })]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 480 },
        children: [new TextRun({ text: 'Schritt-f\u00fcr-Schritt \u2022 Auch f\u00fcr Einsteiger', font: 'Arial', size: 22, color: '94A3B8', italics: true })]
      }),

      // ═══════════════════ WAS DU BRAUCHST ═══════════════════
      h1('Was du brauchst'),
      spacer(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [4000, 5026],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, shading: { type: ShadingType.CLEAR, fill: '0C4A6E' }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Teil', font: 'Arial', size: 20, bold: true, color: 'FFFFFF' })] })] }),
            new TableCell({ borders, shading: { type: ShadingType.CLEAR, fill: '0C4A6E' }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, width: { size: 5026, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Details', font: 'Arial', size: 20, bold: true, color: 'FFFFFF' })] })] }),
          ]}),
          ...([
            ['Raspberry Pi Zero 2 W', 'Das Mini-Computer-Board (ca. 18 \u20ac)'],
            ['Micro-SD-Karte', 'Mindestens 8 GB, besser 16 GB (Class 10)'],
            ['SD-Kartenleser', 'F\u00fcr den normalen PC/Laptop'],
            ['Micro-USB-Netzteil', '5V / 2,5A \u2013 normales Handy-Ladeger\u00e4t reicht oft'],
            ['WLAN-Netzwerk', 'Pi und Sch\u00fcler-Tablets m\u00fcssen im selben WLAN sein'],
            ['Windows-PC', 'Zum Vorbereiten der SD-Karte und Bauen des Projekts'],
          ]).map(([a, b], i) => new TableRow({ children: [
            new TableCell({ borders, shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? LIGHT : 'FFFFFF' }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: a, font: 'Arial', size: 20, bold: true })] })] }),
            new TableCell({ borders, shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? LIGHT : 'FFFFFF' }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, width: { size: 5026, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: b, font: 'Arial', size: 20 })] })] }),
          ]}))
        ]
      }),
      spacer(),

      // ═══════════════════ SCHRITT 1 ═══════════════════
      h1('Schritt 1 \u2014 Raspberry Pi OS auf die SD-Karte'),
      p('Das ist wie Windows installieren \u2013 aber einfacher.'),
      spacer(),
      li('Geh auf: raspberry.com/software \u2192 lade den "Raspberry Pi Imager" herunter und installiere ihn', true),
      li('Stecke die SD-Karte in den Kartenleser und den Kartenleser in den PC', true),
      li('Starte den Raspberry Pi Imager', true),
      spacer(),
      p('Im Imager folgendes ausw\u00e4hlen:'),
      tip('\u2460', 'Ger\u00e4t: "Raspberry Pi Zero 2 W"'),
      tip('\u2461', 'Betriebssystem: "Raspberry Pi OS Lite (64-bit)"  \u2190 kein Desktop n\u00f6tig!'),
      tip('\u2462', 'Speichermedium: deine SD-Karte'),
      spacer(),
      li('Klicke auf "Weiter" \u2013 dann erscheint ein Fenster: "OS Einstellungen bearbeiten?" \u2192 JA klicken!', true),
      spacer(),
      infoBox('\u2699\uFE0F  OS-Einstellungen (wichtig!)', [
        'Hostname:       blankenagel',
        'Benutzername:   pi',
        'Passwort:       (beliebig, z.B. nova7mission)',
        'WLAN-SSID:      (Name deines Schul-WLANs)',
        'WLAN-Passwort:  (WLAN-Passwort)',
        'Zeitzone:       Europe/Berlin',
        'SSH aktivieren: JA (Passwort-Authentifizierung)',
      ], 'FFF7ED'),
      spacer(),
      li('Klicke "Speichern", dann "Ja" zum Schreiben \u2013 warte bis es fertig ist (~2-5 Min)', true),
      li('SD-Karte sicher auswerfen', true),
      spacer(),

      // ═══════════════════ SCHRITT 2 ═══════════════════
      h1('Schritt 2 \u2014 Pi zum ersten Mal starten'),
      li('SD-Karte in den Pi stecken (Unterseite des Boards, kleiner Slot)', true),
      li('Netzteil anstecken \u2013 die gr\u00fcne LED blinkt, der Pi startet', true),
      li('2-3 Minuten warten bis der Boot fertig ist', true),
      spacer(),
      p('Jetzt verbinden wir uns vom PC mit dem Pi \u00fcber SSH (wie eine Fernbedienung):'),
      spacer(),
      p('Windows: Dr\u00fccke Win+R, tippe cmd, Enter \u2013 das \u00f6ffnet die Kommandozeile', { bold: true }),
      spacer(),
      code('ssh pi@blankenagel.local'),
      spacer(),
      tip('\u2139\uFE0F', 'Falls das nicht klappt: ssh pi@<IP-Adresse>  (IP siehst du im Router unter verbundene Ger\u00e4te)'),
      spacer(),
      p('Beim ersten Verbinden erscheint eine Sicherheitsfrage \u2192 "yes" eintippen und Enter dr\u00fccken'),
      p('Dann Passwort eingeben (das du in Schritt 1 festgelegt hast)'),
      spacer(),
      infoBox('\u2705  Ziel erreicht, wenn du das siehst:', ['pi@blankenagel:~ $'], 'F0FDF4'),
      spacer(),

      // ═══════════════════ SCHRITT 3 ═══════════════════
      h1('Schritt 3 \u2014 Nginx installieren (der Webserver)'),
      p('Nginx ist das Programm, das die App sp\u00e4ter im Browser bereitstellt. Kopiere diese Befehle GENAU so in die SSH-Verbindung:'),
      spacer(),
      p('Erst alles aktualisieren:'),
      code('sudo apt update && sudo apt upgrade -y'),
      spacer(),
      p('Dann nginx installieren:'),
      code('sudo apt install nginx -y'),
      spacer(),
      p('Nginx starten und f\u00fcr den Autostart aktivieren:'),
      code('sudo systemctl enable nginx'),
      code('sudo systemctl start nginx'),
      spacer(),
      tip('\u2705', 'Teste es: \u00d6ffne im Browser auf deinem PC: http://blankenagel.local  \u2192 du siehst eine Nginx-Willkommensseite'),
      spacer(),

      // ═══════════════════ SCHRITT 4 ═══════════════════
      h1('Schritt 4 \u2014 Projekt bauen (auf dem PC)'),
      p('Das machst du auf deinem normalen Windows-PC, NICHT auf dem Pi.'),
      p('Navigiere im Terminal (Win+R \u2192 cmd) in den Projektordner:'),
      spacer(),
      code('cd C:\\Users\\simon\\Projekte\\nova-7'),
      spacer(),
      p('Dann das Projekt f\u00fcr den Produktionsbetrieb bauen:'),
      code('npm run build'),
      spacer(),
      p('Danach gibt es einen neuen Ordner: nova-7\\dist\\'),
      tip('\u2139\uFE0F', 'Dieser dist-Ordner enth\u00e4lt die fertige App als reine HTML/CSS/JS-Dateien. Den kopieren wir auf den Pi.'),
      spacer(),

      // ═══════════════════ SCHRITT 5 ═══════════════════
      h1('Schritt 5 \u2014 App auf den Pi \u00fcbertragen'),
      p('Wir kopieren den dist-Ordner \u00fcber das Netzwerk auf den Pi. Im PC-Terminal:'),
      spacer(),
      code('scp -r C:\\Users\\simon\\Projekte\\nova-7\\dist pi@blankenagel.local:/home/pi/nova7'),
      spacer(),
      p('Passwort eingeben \u2013 dann werden alle Dateien kopiert (~30 Sekunden).'),
      spacer(),
      p('Jetzt sagen wir nginx, wo die App liegt. Zur\u00fcck in der SSH-Verbindung zum Pi:'),
      spacer(),
      p('Nginx-Konfiguration \u00f6ffnen:'),
      code('sudo nano /etc/nginx/sites-available/default'),
      spacer(),
      p('Den Inhalt komplett l\u00f6schen (Strg+K mehrmals dr\u00fccken) und folgendes einf\u00fcgen:'),
      spacer(),
      new Table({ width: { size: 9026, type: WidthType.DXA }, columnWidths: [9026], rows: [new TableRow({ children: [new TableCell({ borders, shading: { type: ShadingType.CLEAR, fill: '1E293B' }, margins: { top: 120, bottom: 120, left: 200, right: 200 }, width: { size: 9026, type: WidthType.DXA }, children: [
        new Paragraph({ spacing: { after: 20 }, children: [new TextRun({ text: 'server {', font: 'Courier New', size: 20, color: '7DD3FC' })] }),
        new Paragraph({ spacing: { after: 20 }, indent: { left: 360 }, children: [new TextRun({ text: 'listen 80;', font: 'Courier New', size: 20, color: '7DD3FC' })] }),
        new Paragraph({ spacing: { after: 20 }, indent: { left: 360 }, children: [new TextRun({ text: 'root /home/pi/nova7;', font: 'Courier New', size: 20, color: '7DD3FC' })] }),
        new Paragraph({ spacing: { after: 20 }, indent: { left: 360 }, children: [new TextRun({ text: 'index index.html;', font: 'Courier New', size: 20, color: '7DD3FC' })] }),
        new Paragraph({ spacing: { after: 20 }, indent: { left: 360 }, children: [new TextRun({ text: 'location / {', font: 'Courier New', size: 20, color: '7DD3FC' })] }),
        new Paragraph({ spacing: { after: 20 }, indent: { left: 720 }, children: [new TextRun({ text: 'try_files $uri $uri/ /index.html;', font: 'Courier New', size: 20, color: '7DD3FC' })] }),
        new Paragraph({ spacing: { after: 20 }, indent: { left: 360 }, children: [new TextRun({ text: '}', font: 'Courier New', size: 20, color: '7DD3FC' })] }),
        new Paragraph({ spacing: { after: 0 },  children: [new TextRun({ text: '}', font: 'Courier New', size: 20, color: '7DD3FC' })] }),
      ] })] })] }),
      spacer(),
      p('Speichern: Strg+O, Enter, dann Strg+X'),
      spacer(),
      p('Nginx neu laden:'),
      code('sudo systemctl reload nginx'),
      spacer(),
      tip('\u2705', '\u00d6ffne jetzt im Browser: http://blankenagel.local  \u2013 du solltest die App sehen!'),
      spacer(),

      // ═══════════════════ SCHRITT 6 ═══════════════════
      h1('Schritt 6 \u2014 Intro-Video einbinden'),
      p('Das Missionsbriefing-Video muss auch auf den Pi.'),
      spacer(),
      code('scp "C:\\Users\\simon\\Downloads\\U.S.S. Blankenagel.mp4" pi@blankenagel.local:/home/pi/nova7/intro.mp4'),
      spacer(),
      tip('\u2139\uFE0F', 'Die App erwartet das Video unter /intro.mp4 \u2013 passt so!'),
      spacer(),

      // ═══════════════════ SCHRITT 7 ═══════════════════
      h1('Schritt 7 \u2014 IP-Adresse f\u00fcr Tablets herausfinden'),
      p('Tablets und Handys der Sch\u00fcler k\u00f6nnen "blankenagel.local" meist nicht aufl\u00f6sen. Deshalb brauchen wir die richtige IP-Adresse:'),
      spacer(),
      p('Im SSH-Fenster:'),
      code('hostname -I'),
      spacer(),
      p('Du siehst etwas wie: 192.168.1.42'),
      tip('\ud83d\udcf1', 'Auf Tablets/Handys im Browser eingeben:  http://192.168.1.42'),
      tip('\ud83d\udcbb', 'Auf PCs im selben WLAN auch m\u00f6glich:       http://blankenagel.local'),
      spacer(),

      // ═══════════════════ UPDATE ═══════════════════
      h1('App aktualisieren (wenn du \u00c4nderungen gemacht hast)'),
      p('Auf dem PC (Projektordner):'),
      code('npm run build'),
      spacer(),
      p('Dann wieder auf den Pi kopieren:'),
      code('scp -r C:\\Users\\simon\\Projekte\\nova-7\\dist\\* pi@blankenagel.local:/home/pi/nova7/'),
      spacer(),
      tip('\u2705', 'Kein Neustart n\u00f6tig \u2013 nginx liefert die Dateien sofort aus!'),
      spacer(),

      // ═══════════════════ TROUBLESHOOTING ═══════════════════
      h1('\ud83d\udd27  Wenn etwas nicht funktioniert'),
      spacer(),
      new Table({
        width: { size: 9026, type: WidthType.DXA },
        columnWidths: [3500, 5526],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, shading: { type: ShadingType.CLEAR, fill: '1E3A5F' }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Problem', font: 'Arial', size: 20, bold: true, color: 'FFFFFF' })] })] }),
            new TableCell({ borders, shading: { type: ShadingType.CLEAR, fill: '1E3A5F' }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, width: { size: 5526, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'L\u00f6sung', font: 'Arial', size: 20, bold: true, color: 'FFFFFF' })] })] }),
          ]}),
          ...([
            ['SSH: "Connection refused"', 'Pi noch nicht fertig gebootet \u2013 weitere 2 Min warten'],
            ['SSH: "Host not found"', 'IP-Adresse direkt nutzen (im Router nachschauen)'],
            ['App l\u00e4dt nicht', 'sudo systemctl status nginx  \u2013 Fehlermeldung lesen'],
            ['Leere Seite im Browser', 'dist-Ordner neu kopieren, scp-Befehl nochmal ausf\u00fchren'],
            ['Video spielt nicht ab', 'scp des Videos wiederholen; Dateigr\u00f6\u00dfe pr\u00fcfen'],
            ['Pi reagiert nicht', 'Netzteil kurz ziehen und wieder einstecken (Neustart)'],
            ['Schüler-Tabs trennen sich', 'Alle Ger\u00e4te m\u00fcssen im SELBEN WLAN sein'],
          ]).map(([prob, sol], i) => new TableRow({ children: [
            new TableCell({ borders, shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? LIGHT : 'FFFFFF' }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: prob, font: 'Arial', size: 20, bold: true })] })] }),
            new TableCell({ borders, shading: { type: ShadingType.CLEAR, fill: i % 2 === 0 ? LIGHT : 'FFFFFF' }, margins: { top: 80, bottom: 80, left: 140, right: 140 }, width: { size: 5526, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: sol, font: 'Arial', size: 20 })] })] }),
          ]}))
        ]
      }),
      spacer(),
      spacer(),

      // ═══════════════════ SCHNELLÜBERSICHT ═══════════════════
      h1('\u26a1  Schnell\u00fcbersicht (f\u00fcr den Unterrichtstag)'),
      infoBox('Vor dem Unterricht einmal erledigen:', [
        '1.  Raspberry Pi einschalten (Netzteil rein)',
        '2.  2 Minuten warten',
        '3.  Fertig \u2013 der Pi l\u00e4uft automatisch!',
      ], 'F0FDF4'),
      spacer(),
      infoBox('Sch\u00fcler \u00f6ffnen im Browser:', [
        'http://192.168.x.x    (deine Pi-IP-Adresse)',
        '',
        'Tipp: Adresse auf die Tafel schreiben oder als QR-Code ausdrucken!',
      ], 'EFF6FF'),
      spacer(),
      infoBox('\ud83d\udcf2  QR-Code erstellen (optional):', [
        'Geh auf: qr-code-generator.com',
        'Text eingeben: http://192.168.x.x',
        'QR-Code herunterladen und ausdrucken',
        'Sch\u00fcler scannen und sind sofort auf der App!',
      ], 'FFF7ED'),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync('C:/Users/simon/Downloads/Pi-Setup-Anleitung.docx', buf);
  console.log('Fertig: Pi-Setup-Anleitung.docx');
}).catch(e => console.error(e));
