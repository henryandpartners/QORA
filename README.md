# QORA — Quantum Organic Resonance Architecture

WebGL prototype: real-time quantum coherence visualization.

## Quick Start

```bash
npx serve .
# or
python3 -m http.server 8000
```

Open `http://localhost:8000` (or `http://localhost:3000` with serve).

## Controls

- **Mouse move** — Decohere the quantum field (observer effect)
- **Scroll** — Zoom in/out
- **Space** — Reset coherence
- **1/2/3** — Switch visualization modes (Coherence / Exciton Flow / Decoherence Cascade)
- **F** — Toggle fullscreen

## Concept

Based on the Fenna-Matthews-Olson (FMO) photosynthetic complex — where quantum coherence was first observed in biology at room temperature.

The visualization simulates exciton transport through a trimeric protein scaffold, responding to the observer's presence. Quantum states collapse upon observation — this is not a bug, it's the artwork.

## Structure

```
index.html     — Entry point
css/
  style.css    — Overlay, UI, typography
js/
  main.js      — Three.js setup, scene, animation loop
  particles.js — Particle system (2000 exciton particles)
  trails.js    — Exciton transport trails
  scaffold.js  — FMO protein scaffold wireframe
  ui.js        — Coherence meter, mode display
```

## Color Palette

| Zone | Primary | Secondary | Accent |
|------|---------|-----------|--------|
| Coherent | #0d1b2a | #00e5a0 | #7b61ff |
| Decoherent | #1a0a0a | #ff6b35 | #ff4444 |

## Tech

- Three.js 0.163 (ES modules via CDN)
- No build step, no dependencies
- Works on any static server
