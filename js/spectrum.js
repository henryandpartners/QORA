/**
 * QORA Spectrum Panel
 * ===================
 * C key / menu button — live color systems + brightness.
 * Themes recolor particles, scaffold, trails, and UI accents
 * in place (no rebuild). Brightness drives renderer exposure.
 */

import { THEMES } from './themes.js';

let ctx = null;
let activeTheme = THEMES[0];

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
      <input type="color" id="qora-bg-picker" value="#050510" title="Background color">
      <span class="qora-spectrum-value" id="qora-bg-val">#050510</span>
    </div>
  `;
  document.body.appendChild(panel);

  panel.addEventListener('click', (e) => {
    const swatch = e.target.closest('.qora-swatch');
    if (swatch) {
      const theme = THEMES.find(t => t.id === swatch.dataset.theme);
      if (theme) applyTheme(theme);
      document.querySelectorAll('.qora-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
    }
    if (e.target.closest('.qora-spectrum-close')) togglePanel(false);
  });

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

  const bgPicker = document.getElementById('qora-bg-picker');
  bgPicker.addEventListener('input', () => {
    const hex = bgPicker.value;
    document.getElementById('qora-bg-val').textContent = hex;
    setBackground(hex);
  });

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

  // UI accents
  const root = document.documentElement;
  root.style.setProperty('--qora-accent', theme.accent);
  root.style.setProperty('--qora-accent2', theme.accent2);

  // Background (theme-linked; the color picker overrides independently)
  if (theme.bg) setBackground(theme.bg);
}

function setBrightness(v) {
  if (ctx && ctx.renderer) ctx.renderer.toneMappingExposure = v;
}

function setGlow(v) {
  if (ctx && ctx.pointLight) ctx.pointLight.intensity = 1.5 * v;
}
