# A83 Nav Modularization

Modularer, builder-unabhängiger Off-Canvas-Header für **abteilung83**:
- **Zero-Jump Overlay** (kein Scroll-Sprung)
- **Scroll-Tone Bridge** (Wordmark/Burger passen sich per `data-tone` an)
- **Deterministische Platzierung** der Menükarte am Burger
- **A11y**: ESC, Backdrop-Close, Fokus-Rückgabe, Tab-Trap
- **Dekorativ**: Watermark/Brandmark, dezente Micro-Effects – hart von der Logik getrennt

> Zielt auf WordPress **Breakdance** (Theme disabled), funktioniert aber in jedem Setup.

---

## Inhalt

- [Schnellstart (lokal)](#schnellstart-lokal)
- [Ordnerstruktur](#ordnerstruktur)
- [Wie es funktioniert](#wie-es-funktioniert)
- [Integration in Breakdance](#integration-in-breakdance)
- [Module](#module)
- [A11y-Details](#a11y-details)
- [Troubleshooting](#troubleshooting)
- [Branch/Workflow](#branchworkflow)
- [Lizenz](#lizenz)

---

## Schnellstart (lokal)

```bash
# ins Repo wechseln
cd a83-nav-modularization

# einfacher Testserver (Variante A: im Repo-Root)
python3 -m http.server 5173
# Browser: http://localhost:5173/isolate/index.html

# oder Variante B: direkt im isolate/
cd isolate
python3 -m http.server 5173
# Browser: http://localhost:5173/index.html