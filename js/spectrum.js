/**
 * QORA Spectrum Panel
 * ===================
 * C key / menu button — live color systems + brightness.
 * Themes recolor particles, scaffold, trails, and UI accents
 * in place (no rebuild). Brightness drives renderer exposure.
 *
 * ELEMENT COLORS (advanced section): per-element color pickers —
 * particle gradient endpoints, scaffold outer/inner, rings, core,
 * trails, decoherence color, UI accents, background. Touching any
 * picker switches the system into CUSTOM mode; picking a theme
 * swatch resets all elements to that theme.
 */

import * as THREE from 'three';
import { THEMES } from './themes.js';

let ctx = null;
let activeTheme = THEMES[0];
let panelEl = null;

// ── Background ────────────────────────────────────────────────
function hexToRgb(hex) {
  let h = (hex || '#050510').replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function setBackground(hex) {
  if (!hex) return;
  document.body.style.background = hex;
  const { r, g, b } = hexToRgb(hex);
  const overlay = document.getElementById('overlay');
  if (overlay) {
    overlay.style.background = `radial-gradient(circle at 50% 50%, transparent 0%, rgba(${r},${g},${b},0.5) 50%, rgba(${r},${g},${b},0.85) 100%)`;
  }
  if (ctx && ctx.scene && ctx.scene.fog) ctx.scene.fog.color.set(hex);
  document.documentElement.style.setProperty('--qora-bg', hex);
  const picker = document.getElementById('qora-bg-picker');
  if (picker) picker.value = hex;
  const val = document.getElementById('qora-bg-val');
  if (val) val.textContent = hex;
}

// ── Per-element color state ───────────────────────────────────
// Mirrors the active theme; any picker edit flips particleCustom
// (for particles) and marks the session CUSTOM.
const els = {
  bg: '#050510',
  pA: '#7b61ff', pB: '#00e5a0',   // particle gradient endpoints
  outer: '#1a1a2e', inner: '#2a1a3e',
  ring: '#7b61ff', core: '#7b61ff',
  trail: '#00d4ff',                // trail hue source
  deco: '#7ac880',                 // decoherence energy-loss color
  accent: '#7b61ff', accent2: '#00e5a0',
  particleCustom: false,
};

const _hsl = { h: 0, s: 0, l: 0 };

function clamp01(v) { return Math.min(1, Math.max(0, v)); }

function rgbToHex(rgb) {
  return '#' + rgb.map(v => Math.round(clamp01(v) * 255).toString(16).padStart(2, '0')).join('');
}

function hexToRgb01(hex) {
  const c = new THREE.Color(hex);
  return [c.r, c.g, c.b];
}

function hexToInt(hex) {
  return parseInt(hex.replace('#', ''), 16);
}

function intToHex(n) {
  return '#' + n.toString(16).padStart(6, '0');
}

function hueFromHex(hex) {
  new THREE.Color(hex).getHSL(_hsl);
  return _hsl.h;
}

function hslHex(h, s, l) {
  return '#' + new THREE.Color().setHSL(((h % 1) + 1) % 1, s, l).getHexString();
}

function getParticleGradient() {
  if (els.particleCustom) {
    const a = hexToRgb01(els.pA);
    const b = hexToRgb01(els.pB);
    return (t) => [
      a[0] + (b[0] - a[0]) * t,
      a[1] + (b[1] - a[1]) * t,
      a[2] + (b[2] - a[2]) * t,
    ];
  }
  return activeTheme.gradient;
}

// ── Per-element appliers (all live, no rebuild) ───────────────
function applyParticles() {
  if (ctx && ctx.particleSystem) {
    ctx.particleSystem.recolor(getParticleGradient(), hexToRgb01(els.deco));
  }
}

function applyScaffold() {
  if (ctx && ctx.scaffold) {
    ctx.scaffold.applyThemeColors({
      outer: hexToInt(els.outer),
      inner: hexToInt(els.inner),
      ring: hexToInt(els.ring),
      core: hexToInt(els.core),
    });
  }
}

function applyTrails() {
  if (ctx && ctx.trails) {
    ctx.trails.setTrailTheme({
      hueMin: hueFromHex(els.trail),
      hueRange: 0.1,
      decoHue: hueFromHex(els.deco),
    });
  }
}

function applyAccents() {
  const root = document.documentElement;
  root.style.setProperty('--qora-accent', els.accent);
  root.style.setProperty('--qora-accent2', els.accent2);
}

function markCustom() {
  document.querySelectorAll('.qora-swatch').forEach(s => s.classList.remove('active'));
  const n = document.getElementById('qora-spectrum-name');
  if (n) n.textContent = 'CUSTOM';
}

// Pull every element value out of a theme (for swatch clicks).
function syncFromTheme(theme) {
  els.particleCustom = false;
  els.bg = theme.bg || '#050510';
  els.pA = rgbToHex(theme.gradient(0));
  els.pB = rgbToHex(theme.gradient(1));
  els.outer = intToHex(theme.scaffold.outer);
  els.inner = intToHex(theme.scaffold.inner);
  els.ring = intToHex(theme.scaffold.ring);
  els.core = intToHex(theme.scaffold.core);
  els.trail = hslHex(theme.trailHue.min + theme.trailHue.range / 2, 0.7, 0.55);
  els.deco = rgbToHex(theme.decoRGB);
  els.accent = theme.accent;
  els.accent2 = theme.accent2;
}

function syncPickers() {
  if (!panelEl) return;
  panelEl.querySelectorAll('input[type="color"][data-el]').forEach(inp => {
    const key = inp.dataset.el;
    if (els[key]) inp.value = els[key];
  });
}

// ── Panel ─────────────────────────────────────────────────────
export function setupSpectrum(context) {
  ctx = context;
  ensureDom();
  return { applyTheme, setBrightness };
}

function ensureDom() {
  if (document.getElementById('qora-spectrum')) return;

  const panel = document.createElement('div');
  panel.id = 'qora-spectrum';
  panel.innerHTML = `
    <div class="qora-spectrum-head">
      <span class="qora-spectrum-title">SPECTRUM</span>
      <span class="qora-spectrum-sub" id="qora-spectrum-name">${activeTheme.name}</span>
      <button class="qora-close qora-spectrum-close" aria-label="Close">ESC</button>
    </div>
    <div class="qora-spectrum-swatches" id="qora-spectrum-swatches">
      ${THEMES.map((t, i) => `
        <button class="qora-swatch ${i === 0 ? 'active' : ''}" data-theme="${t.id}"
          title="${t.name}" style="background:linear-gradient(135deg, ${t.swatch[0]}, ${t.swatch[1]}, ${t.swatch[2]})">
        </button>
      `).join('')}
    </div>
    <div class="qora-spectrum-row">
      <span class="qora-spectrum-label">BRIGHTNESS</span>
      <input type="range" id="qora-brightness" min="40" max="250" value="110" step="5">
      <span class="qora-spectrum-value" id="qora-brightness-val">110%</span>
    </div>
    <div class="qora-spectrum-row">
      <span class="qora-spectrum-label">GLOW</span>
      <input type="range" id="qora-glow" min="40" max="250" value="100" step="5">
      <span class="qora-spectrum-value" id="qora-glow-val">100%</span>
    </div>
    <div class="qora-spectrum-row">
      <span class="qora-spectrum-label">BACKGROUND</span>
      <input type="color" id="qora-bg-picker" data-el="bg" value="#050510" title="Background color">
      <span class="qora-spectrum-value" id="qora-bg-val">#050510</span>
    </div>
    <button class="qora-adv-toggle" id="qora-adv-toggle">ELEMENT COLORS ▾</button>
    <div class="qora-adv" id="qora-adv">
      <div class="qora-adv-row">
        <span class="qora-adv-label">PARTICLES</span>
        <span class="qora-adv-pickers">
          <input type="color" data-el="pA" title="Particle gradient start">
          <input type="color" data-el="pB" title="Particle gradient end">
        </span>
      </div>
      <div class="qora-adv-row">
        <span class="qora-adv-label">SCAFFOLD</span>
        <span class="qora-adv-pickers">
          <input type="color" data-el="outer" title="Outer envelope">
          <input type="color" data-el="inner" title="Inner core shell">
        </span>
      </div>
      <div class="qora-adv-row">
        <span class="qora-adv-label">RINGS·CORE</span>
        <span class="qora-adv-pickers">
          <input type="color" data-el="ring" title="Trimer rings">
          <input type="color" data-el="core" title="Reaction center">
        </span>
      </div>
      <div class="qora-adv-row">
        <span class="qora-adv-label">TRAILS</span>
        <span class="qora-adv-pickers">
          <input type="color" data-el="trail" title="Exciton trail hue">
        </span>
      </div>
      <div class="qora-adv-row">
        <span class="qora-adv-label">DECOHERENCE</span>
        <span class="qora-adv-pickers">
          <input type="color" data-el="deco" title="Energy-loss color on collapse">
        </span>
      </div>
      <div class="qora-adv-row">
        <span class="qora-adv-label">ACCENTS</span>
        <span class="qora-adv-pickers">
          <input type="color" data-el="accent" title="UI accent 1">
          <input type="color" data-el="accent2" title="UI accent 2">
        </span>
      </div>
    </div>
  `;
  document.body.appendChild(panel);
  panelEl = panel;

  // Theme swatches
  panel.addEventListener('click', (e) => {
    const swatch = e.target.closest('.qora-swatch');
    if (swatch) {
      const theme = THEMES.find(t => t.id === swatch.dataset.theme);
      if (theme) applyTheme(theme);
      document.querySelectorAll('.qora-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    }
    if (e.target.closest('.qora-spectrum-close')) togglePanel(false);
    if (e.target.closest('#qora-adv-toggle')) {
      document.getElementById('qora-adv').classList.toggle('open');
      document.getElementById('qora-adv-toggle').classList.toggle('open');
    }
  });

  // Sliders
  const brightness = document.getElementById('qora-brightness');
  brightness.addEventListener('input', () => {
    const pct = parseInt(brightness.value, 10);
    document.getElementById('qora-brightness-val').textContent = pct + '%';
    setBrightness(pct / 100);
  });

  const glow = document.getElementById('qora-glow');
  glow.addEventListener('input', () => {
    const pct = parseInt(glow.value, 10);
    document.getElementById('qora-glow-val').textContent = pct + '%';
    setGlow(pct / 100);
  });

  // Per-element color pickers
  panel.querySelectorAll('input[type="color"][data-el]').forEach(inp => {
    inp.addEventListener('input', () => {
      const key = inp.dataset.el;
      els[key] = inp.value;
      if (key === 'pA' || key === 'pB') {
        els.particleCustom = true;
        applyParticles();
      } else if (key === 'bg') {
        setBackground(inp.value);
      } else if (key === 'outer' || key === 'inner' || key === 'ring' || key === 'core') {
        applyScaffold();
      } else if (key === 'trail') {
        applyTrails();
      } else if (key === 'deco') {
        applyParticles();  // decoRGB feeds the cascade
        applyTrails();     // decoHue feeds trail collapse shift
      } else if (key === 'accent' || key === 'accent2') {
        applyAccents();
      }
      markCustom();
    });
  });

  // Initialize pickers from the default theme
  syncFromTheme(activeTheme);
  syncPickers();

  window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyC') {
      const p = document.getElementById('qora-spectrum');
      togglePanel(!p.classList.contains('open'));
    }
  });
}

export function togglePanel(open) {
  const p = document.getElementById('qora-spectrum');
  if (!p) return;
  if (open === undefined) open = !p.classList.contains('open');
  p.classList.toggle('open', open);
  const btn = document.getElementById('qora-btn-spectrum');
  if (btn) btn.classList.toggle('active', open);
}

function applyTheme(theme) {
  activeTheme = theme;
  document.getElementById('qora-spectrum-name').textContent = theme.name;

  if (ctx) {
    ctx.particleSystem.recolor(theme.gradient, theme.decoRGB);
    ctx.scaffold.applyThemeColors(theme.scaffold);
    ctx.trails.setTrailTheme({ hueMin: theme.trailHue.min, hueRange: theme.trailHue.range, decoHue: theme.decoHue });
  }

  // Sync element state + pickers + background + accents
  syncFromTheme(theme);
  syncPickers();
  if (theme.bg) setBackground(theme.bg);
  applyAccents();
}

function setBrightness(v) {
  if (ctx && ctx.renderer) ctx.renderer.toneMappingExposure = v;
}

function setGlow(v) {
  if (ctx && ctx.pointLight) ctx.pointLight.intensity = 1.5 * v;
}
