#!/usr/bin/env bash
set -euo pipefail

SRC="assets/a83/css/_source/off-canvas-v13_5.css"
DEST="assets/a83/css"
[ -f "$SRC" ] || { echo "Source not found: $SRC"; exit 1; }

grab() { awk -v s="$1" -v e="$2" 'f; $0~s {f=1} $0~e && f {print; exit} f{print}' "$SRC"; }
grab_from() { awk -v s="$1" 'f; $0~s {f=1; print; next} f{print}' "$SRC"; }

# 1) header.css
grab '/\* ===== SITE HEADER ===== \*/' '/\* ===== WORDMARK ===== \*/' > "$DEST/a83.header.css"

# 2) WORDMARK -> an header anhängen
awk 'f; /\* ===== WORDMARK ===== \*/{f=1; print; next} /\* ===== BURGER ===== \*/{exit} f{print}' "$SRC" >> "$DEST/a83.header.css"

# 3) burger.css
grab '/\* ===== BURGER ===== \*/' '/\* ===== OVERLAY \/ BACKDROP ===== \*/' > "$DEST/a83.burger.css"

# 4) overlay.css
grab '/\* ===== OVERLAY \/ BACKDROP ===== \*/' '/\* ===== CARD ===== \*/' > "$DEST/a83.overlay.css"

# 5) card.css (CARD bis vor HINT)
awk 'f; /\* ===== CARD ===== \*/{f=1; print; next} /\* ===== HINT ===== \*/{exit} f{print}' "$SRC" > "$DEST/a83.card.css"

# 6) hints.css
grab '/\* ===== HINT ===== \*/' '/\* Glitch effects \*/' > "$DEST/a83.hints.css"

# 7) effects.glitch.css (Glitches + Slices)
awk 'f; /\* Glitch effects \*/{f=1; print; next} /\* Reduced motion \*/{exit} f{print}' "$SRC" > "$DEST/a83.effects.glitch.css"

# 8) a11y-locks.css (Reduced motion + Body lock + Safe-Area)
awk 'f; /\* Reduced motion \*/{f=1; print; next} /\* ===== BRAND WATERMARK/{exit} f{print}' "$SRC" > "$DEST/a83.a11y-locks.css"

# 9) effects.watermark.css
grab '/\* ===== BRAND WATERMARK/' '/\* === A83 Nav-Card Anti-Center Hardening/' > "$DEST/a83.effects.watermark.css"

# 10) overrides.css (Anti-Center Hardening bis vor Tone Bridge)
awk 'f; /\* === A83 Nav-Card Anti-Center Hardening/{f=1; print; next} /\* === A83 Tone Bridge/{exit} f{print}' "$SRC" > "$DEST/a83.overrides.css"

# 11) tone-bridge.css (ab Tone Bridge bis Ende)
grab_from '/\* === A83 Tone Bridge' > "$DEST/a83.tone-bridge.css"

# 12) tokens: alle :root{}-Blöcke einsammeln
awk '
/^:root\s*\{/ {lvl=1; cap=1; print; next}
cap && /\{/ {lvl++}
cap && /\}/ {lvl--; print; if(lvl==0){cap=0; next} }
cap {print}
' "$SRC" > "$DEST/a83.tokens.css"

echo "Split done. Bitte Inhalte prüfen (Duplikate ggf. entfernen)."
