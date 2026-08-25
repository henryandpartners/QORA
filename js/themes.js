/**
 * QORA Spectrum Themes
 * ====================
 * Color systems for the quantum organism. Each theme defines:
 *  - gradient(t): per-particle exciton color along a random parameter t∈[0,1]
 *  - decoRGB / decoHue: the "energy loss" color when coherence collapses
 *  - trailHue: hue range for exciton transport trails
 *  - scaffold: outer envelope / inner core / trimer rings / reaction center
 *  - accent / accent2: UI accent (coherence meter, menus)
 */

export const THEMES = [
  {
    id: 'photosynthesis',
    name: 'PHOTOSYNTHESIS',
    swatch: ['#7b61ff', '#00d4ff', '#00e5a0'],
    gradient: (t) => [
      0.35 + Math.sin(t * Math.PI) * 0.3,
      0.3 + t * 0.6,
      0.7 + Math.cos(t * Math.PI) * 0.3,
    ],
    decoRGB: [0.48, 0.9, 0.5],
    decoHue: 0.08,
    trailHue: { min: 0.6, range: 0.25 },
    scaffold: { outer: 0x1a1a2e, inner: 0x2a1a3e, ring: 0x7b61ff, core: 0x7b61ff },
    accent: '#7b61ff',
    accent2: '#00e5a0',
  },
  {
    id: 'bioluminescence',
    name: 'BIOLUMINESCENCE',
    swatch: ['#003d5c', '#00d4ff', '#7ef9ff'],
    gradient: (t) => [
      0.08 + Math.sin(t * Math.PI) * 0.25,
      0.45 + t * 0.5,
      0.85 + Math.cos(t * Math.PI) * 0.15,
    ],
    decoRGB: [0.1, 0.35, 0.3],
    decoHue: 0.5,
    trailHue: { min: 0.45, range: 0.12 },
    scaffold: { outer: 0x0a1e26, inner: 0x0d2a3a, ring: 0x00d4ff, core: 0x00e5ff },
    accent: '#00d4ff',
    accent2: '#7ef9ff',
  },
  {
    id: 'ember',
    name: 'EMBER',
    swatch: ['#ff6b35', '#ff9e40', '#ffcf6b'],
    gradient: (t) => [
      0.95 - Math.sin(t * Math.PI) * 0.2,
      0.25 + Math.sin(t * Math.PI) * 0.45,
      0.12 + t * 0.3,
    ],
    decoRGB: [0.7, 0.15, 0.08],
    decoHue: 0.99,
    trailHue: { min: 0.02, range: 0.1 },
    scaffold: { outer: 0x2a1408, inner: 0x3a1a0a, ring: 0xff9e40, core: 0xffab40 },
    accent: '#ff6b35',
    accent2: '#ffcf6b',
  },
  {
    id: 'ultraviolet',
    name: 'ULTRAVIOLET',
    swatch: ['#8b5cf6', '#d440ff', '#ff6bd6'],
    gradient: (t) => [
      0.45 + Math.sin(t * Math.PI) * 0.35,
      0.12 + t * 0.25,
      0.75 + Math.cos(t * Math.PI) * 0.25,
    ],
    decoRGB: [0.55, 0.1, 0.35],
    decoHue: 0.92,
    trailHue: { min: 0.72, range: 0.13 },
    scaffold: { outer: 0x220a2e, inner: 0x2e0a3a, ring: 0xd440ff, core: 0xe040ff },
    accent: '#d440ff',
    accent2: '#ff6bd6',
  },
  {
    id: 'chlorophyll',
    name: 'CHLOROPHYLL',
    swatch: ['#1a7a3a', '#40ff70', '#b8ff5e'],
    gradient: (t) => [
      0.2 + Math.sin(t * Math.PI) * 0.35,
      0.55 + t * 0.4,
      0.18 + Math.cos(t * Math.PI) * 0.22,
    ],
    decoRGB: [0.2, 0.5, 0.12],
    decoHue: 0.22,
    trailHue: { min: 0.25, range: 0.13 },
    scaffold: { outer: 0x0a2210, inner: 0x0d3320, ring: 0x40ff70, core: 0x50ff80 },
    accent: '#40ff70',
    accent2: '#b8ff5e',
  },
  {
    id: 'glacial',
    name: 'GLACIAL',
    swatch: ['#3a6a9c', '#9ecfff', '#ffffff'],
    gradient: (t) => [
      0.5 + Math.sin(t * Math.PI) * 0.3,
      0.7 + t * 0.25,
      0.9 + Math.cos(t * Math.PI) * 0.1,
    ],
    decoRGB: [0.15, 0.2, 0.3],
    decoHue: 0.58,
    trailHue: { min: 0.5, range: 0.1 },
    scaffold: { outer: 0x142030, inner: 0x1a2c40, ring: 0x9ecfff, core: 0xbfe0ff },
    accent: '#9ecfff',
    accent2: '#ffffff',
  },
];

export const DEFAULT_THEME = THEMES[0];
