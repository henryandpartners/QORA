/**
 * QORA — The Organism (About)
 * ===========================
 * I key / menu button — what the visualization represents:
 * the FMO complex, real quantum biology, the observer effect,
 * and the speculative thesis underneath the artwork.
 *
 * Every element in the legend is paired with a live SVG mini-diagram,
 * the physics equation that governs it, and the exact logic this
 * codebase runs each frame.
 */

const SECTIONS = [
  {
    title: 'THE ORGANISM',
    body: `What you are looking at is a living diagram of real quantum biology — the <strong>Fenna-Matthews-Olson (FMO) complex</strong>, a photosynthetic protein found in green sulfur bacteria. It is one of the only places in nature where quantum effects have been measured working inside a warm, wet, living thing.`,
  },
  {
    title: 'WHAT EACH ELEMENT REPRESENTS',
    note: 'Each element below is drawn with its governing equation and the logic this simulation actually runs.',
    legend: [
      {
        color: 'var(--qora-accent, #7b61ff)',
        el: 'outer + inner wireframe spheres',
        meaning: 'the FMO protein scaffold — outer is the trimeric envelope, inner the protein core; deliberately distorted because proteins are lumpy, not geometric',
        viz: 'scaffold',
        equation: 'r′ = r · (1 + 0.15 · sin 3.5x · cos 3.5y · sin 3.5z)',
        caption: 'Icosahedron radius field modulated by a trigonometric noise term — the "lumpy protein" deformation.',
        logic: [
          'Start from IcosahedronGeometry(2.0, 3) — outer envelope; (1.3, 2) — inner core.',
          'Push every vertex radially by the noise term above (0.15 outer, 0.12 inner with phase-swapped axes).',
          'Wireframe + opacity 0.12 / 0.2 — the scaffold reads as a cage the energy lives inside, never a solid.',
        ],
      },
      {
        color: '#7b61ff',
        el: 'three rings at 120°',
        meaning: 'the three subunits of the trimer, bound in three-fold symmetry',
        viz: 'rings',
        equation: 'C₃ symmetry: ring positions at θᵢ = 2πi/3, i = 0,1,2',
        caption: 'Three identical protein subunits rotated into each other — the symmetry group of the real FMO trimer.',
        logic: [
          'Three tori (R = 0.6, tube = 0.015) placed on a circle of radius 0.9 at angles 0°, 120°, 240°.',
          'Each torus lies flat (rotation.x = π/2) then twists to its subunit angle (rotation.z = θᵢ).',
          'Physically: three copies of the same chromophore network, one per subunit, related by C₃ rotation.',
        ],
      },
      {
        color: 'var(--qora-accent2, #00e5a0)',
        el: 'the glowing central node',
        meaning: 'the reaction center — the destination. Energy that arrives here is used; energy that doesn’t is lost as heat',
        viz: 'core',
        equation: 'p(reach RC) ∝ Σ_paths |ψ_path|² — coherent sum over amplitudes',
        caption: 'The quantum search target: the exciton arrives as a probability amplitude, not a chosen path.',
        logic: [
          'Sphere r = 0.12 pulsing each frame: scale = 1 + 0.22 sin(1.8t) · (0.4 + 0.6ρ) + (1−ρ) · 0.15 sin(9t).',
          'Coherent field → slow steady breath. Decoherent field → high-frequency jitter (9 Hz) — trapped, unusable energy.',
          'Bloom intensity rises as ρ falls: 0.7 + (1−ρ)·0.9 — lost energy literally radiates as screen-glow "heat".',
        ],
      },
      {
        color: '#00d4ff',
        el: '2,000 drifting particles',
        meaning: 'excitons — quasiparticles of pure energy hopping between pigment molecules inside the protein',
        viz: 'excitons',
        equation: 'iℏ dψ/dt = Hψ + L_eff — wavefunction evolving under the system Hamiltonian',
        caption: 'Each particle samples the exciton wavefunction; brightness α = 0.35 + 0.65ρ follows coherence.',
        logic: [
          '2,000 particles born in a spherical shell 1.3–2.7 units out, each with random phase φ and gradient position t.',
          'Per frame each integrates: elastic return to origin (∝ ρ·0.0018), mouse repulsion (∝ (1−ρ)/d²), mode forcing, damping 0.98.',
          'Size is velocity-reactive: s = 1.5 + min(4.5, |v|·900) — fast particles read as high-energy transfer events.',
        ],
      },
      {
        color: '#a855f7',
        el: '18 orbiting circles',
        meaning: 'the energy pathways between chromophores, the pigment sites where an exciton can be',
        viz: 'trails',
        equation: 'J_ij coupling — hopping amplitude between chromophore sites i and j',
        caption: 'The comet head is |ψᵢ|² moving through the coupling network; the faint loop is the pathway itself.',
        logic: [
          '18 ribbons, each a near-closed arc of 346° bent into a randomly oriented circle inside the scaffold.',
          'A bright comet head travels each loop; head intensity ∝ exp(−2.6t) — exponential decay behind the excitation front.',
          'Additive blending stacks overlapping pathways, the way amplitudes (not probabilities) add in quantum transport.',
        ],
      },
    ],
  },
  {
    title: 'WHY IT MATTERS',
    body: `When a photon hits, the excitation doesn’t pick a route. It exists as a <strong>superposition across all pathways simultaneously</strong>, and this wavelike coherence lets it find the fastest route to the reaction center — a quantum search that beats classical random-walking. The shocking discovery (Engel et al., <em>Nature</em> 2007) was that this coherence survives at room temperature, where it shouldn’t.`,
  },
  {
    title: 'YOU ARE THE PHYSICS',
    body: `<strong>Your mouse is the observer.</strong> Moving it decoheres the field — the coherence meter (ρ(t) = |ψ⟩⟨ψ|, the density matrix of a pure state) falls, particles dim and scatter. The observer effect, made tactile.`,
    equation: 'ρ̇ = −(i/ℏ)[H, ρ] − environmental coupling:  ρ(t) → ρ(1−0.85·d_mouse)',
    equationNote: 'The simulation drives the Lindblad picture: unitary evolution plus an environment term — and the environment is you.',
    list: [
      ['MODE 1 — COHERENCE', 'the wave exploring all paths at once'],
      ['MODE 2 — EXCITON FLOW', 'energy locked onto transport pathways'],
      ['MODE 3 — DECOHERENCE CASCADE', 'collapse into classical noise'],
    ],
  },
  {
    title: 'THE THESIS',
    body: `If biology already runs quantum computation at room temperature inside proteins — no cryogenics, no superconducting circuits — could we <strong>engineer protein scaffolds as quantum processors</strong>? That is the Quantum Organic Resonance Architecture: a speculative biological quantum computer, rendered as an organism you can disturb with your attention.`,
  },
  {
    title: 'LINEAGE',
    body: `Pillars of Creation (JACCC 2024) → Living Archive (NYUAD) → QORA`,
  },
  {
    title: 'FIELD GUIDE',
    list: [
      ['MOUSE', 'observe — decohere the field'],
      ['SCROLL', 'zoom'],
      ['1 / 2 / 3', 'modes'],
      ['SPACE', 'reset'],
      ['Q', 'quantum geometry — the real measurement'],
      ['R', 'enlightenment ritual — collapse the oracle'],
      ['C', 'spectrum — recolor the organism'],
      ['I', 'this page'],
      ['F', 'fullscreen'],
    ],
  },
];

/* ── SVG mini-diagrams — static, hand-authored, style-matched ── */

const SVGS = {
  scaffold: `
    <svg viewBox="0 0 260 130" role="img" aria-label="Concentric distorted wireframe spheres">
      <circle cx="130" cy="65" r="52" fill="none" stroke="#7b61ff" stroke-opacity="0.5" stroke-width="1"/>
      <ellipse cx="130" cy="65" rx="52" ry="40" fill="none" stroke="#7b61ff" stroke-opacity="0.3" stroke-width="0.8"/>
      <ellipse cx="130" cy="65" rx="52" ry="22" fill="none" stroke="#7b61ff" stroke-opacity="0.25" stroke-width="0.8"/>
      <ellipse cx="130" cy="65" rx="40" ry="52" fill="none" stroke="#7b61ff" stroke-opacity="0.2" stroke-width="0.8" transform="rotate(-14 130 65)"/>
      <ellipse cx="130" cy="65" rx="22" ry="52" fill="none" stroke="#7b61ff" stroke-opacity="0.2" stroke-width="0.8" transform="rotate(22 130 65)"/>
      <circle cx="130" cy="65" r="30" fill="none" stroke="#00e5a0" stroke-opacity="0.55" stroke-width="1" stroke-dasharray="5 4"/>
      <circle cx="130" cy="65" r="3" fill="#00e5a0"/>
      <text x="130" y="120" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="8" font-family="ui-monospace,monospace">r′ = r(1+0.15·noise)</text>
    </svg>`,
  rings: `
    <svg viewBox="0 0 260 130" role="img" aria-label="Three rings at 120 degrees around a center">
      <line x1="130" y1="65" x2="188" y2="34" stroke="rgba(255,255,255,0.15)" stroke-width="0.7"/>
      <line x1="130" y1="65" x2="172" y2="106" stroke="rgba(255,255,255,0.15)" stroke-width="0.7"/>
      <line x1="130" y1="65" x2="72" y2="55" stroke="rgba(255,255,255,0.15)" stroke-width="0.7"/>
      <g fill="none" stroke="#7b61ff" stroke-width="1.4">
        <ellipse cx="196" cy="34" rx="17" ry="6"/>
        <ellipse cx="176" cy="105" rx="17" ry="6" transform="rotate(-60 176 105)"/>
        <ellipse cx="64" cy="52" rx="17" ry="6" transform="rotate(60 64 52)"/>
      </g>
      <circle cx="130" cy="65" r="3.5" fill="#00e5a0"/>
      <text x="130" y="122" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="8" font-family="ui-monospace,monospace">θᵢ = 2πi/3 · C₃</text>
    </svg>`,
  core: `
    <svg viewBox="0 0 260 130" role="img" aria-label="Energy pathways converging on a glowing reaction center">
      <g stroke="rgba(0,212,255,0.5)" stroke-width="1" fill="none">
        <path d="M20 40 Q 80 20 122 60"/>
        <path d="M28 100 Q 80 110 122 68"/>
        <path d="M240 35 Q 180 25 138 60"/>
        <path d="M238 98 Q 180 112 138 68"/>
        <path d="M130 8 Q 128 35 130 55"/>
        <path d="M130 122 Q 128 95 130 75"/>
      </g>
      <circle cx="130" cy="65" r="16" fill="none" stroke="#00e5a0" stroke-opacity="0.25" stroke-width="1"/>
      <circle cx="130" cy="65" r="10" fill="none" stroke="#00e5a0" stroke-opacity="0.45" stroke-width="1"/>
      <circle cx="130" cy="65" r="5" fill="#00e5a0"/>
      <circle cx="130" cy="65" r="11" fill="#00e5a0" fill-opacity="0.18"/>
      <text x="130" y="122" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="8" font-family="ui-monospace,monospace">p(reach RC) ∝ Σ|ψ_path|²</text>
    </svg>`,
  excitons: `
    <svg viewBox="0 0 260 130" role="img" aria-label="Scattered particles between wave states">
      <path d="M10 65 q 20 -22 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" fill="none" stroke="rgba(0,212,255,0.35)" stroke-width="1"/>
      <path d="M10 65 q 20 22 40 0 t 40 0 t 40 0 t 40 0 t 40 0 t 40 0" fill="none" stroke="rgba(168,85,247,0.25)" stroke-width="1"/>
      <g fill="#00d4ff">
        <circle cx="34" cy="52" r="2.4"/><circle cx="58" cy="76" r="1.6"/><circle cx="72" cy="48" r="2"/>
        <circle cx="95" cy="66" r="1.4"/><circle cx="108" cy="55" r="2.6"/><circle cx="126" cy="74" r="1.8"/>
        <circle cx="143" cy="50" r="2.2"/><circle cx="160" cy="70" r="1.5"/><circle cx="178" cy="57" r="2.4"/>
        <circle cx="196" cy="48" r="1.6"/><circle cx="208" cy="72" r="2"/><circle cx="226" cy="58" r="2.6"/>
      </g>
      <circle cx="108" cy="55" r="6" fill="none" stroke="#00d4ff" stroke-opacity="0.4" stroke-width="0.8"/>
      <circle cx="226" cy="58" r="6" fill="none" stroke="#00d4ff" stroke-opacity="0.4" stroke-width="0.8"/>
      <text x="130" y="122" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="8" font-family="ui-monospace,monospace">iℏ dψ/dt = Hψ + L_eff</text>
    </svg>`,
  trails: `
    <svg viewBox="0 0 260 130" role="img" aria-label="Orbiting comet trails on circular pathways">
      <circle cx="80" cy="62" r="34" fill="none" stroke="#a855f7" stroke-opacity="0.25" stroke-width="1"/>
      <circle cx="176" cy="66" r="42" fill="none" stroke="#a855f7" stroke-opacity="0.25" stroke-width="1"/>
      <path d="M80 28 A 34 34 0 0 1 114 62" fill="none" stroke="#a855f7" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="114" cy="62" r="3.4" fill="#e9ddff"/>
      <path d="M218 66 A 42 42 0 0 1 176 108" fill="none" stroke="#a855f7" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="176" cy="108" r="3.4" fill="#e9ddff"/>
      <text x="130" y="122" text-anchor="middle" fill="rgba(255,255,255,0.45)" font-size="8" font-family="ui-monospace,monospace">J_ij — site coupling · head ∝ exp(−2.6t)</text>
    </svg>`,
};

function ensureDom() {
  if (document.getElementById('qora-about-overlay')) return;

  const overlay = document.createElement('div');
  overlay.id = 'qora-about-overlay';
  overlay.className = 'qora-overlay';
  overlay.innerHTML = `
    <div class="qora-overlay-head">
      <div class="qora-overlay-title">THE ORGANISM</div>
      <div class="qora-overlay-meta">Quantum Organic Resonance Architecture</div>
      <button class="qora-close" id="qora-about-close" aria-label="Close">ESC</button>
    </div>
    <div class="qora-overlay-scroll">
      ${SECTIONS.map((s, i) => `
        <div class="qora-about-section qora-fade" style="--d:${i * 90}ms">
          <div class="qora-section-label">${s.title}</div>
          ${s.body ? `<div class="qora-about-body">${s.body}</div>` : ''}
          ${s.note ? `<div class="qora-about-note">${s.note}</div>` : ''}
          ${s.equation ? `<div class="qora-equation">${s.equation}</div>` : ''}
          ${s.equationNote ? `<div class="qora-about-note">${s.equationNote}</div>` : ''}
          ${s.legend ? `
            <div class="qora-legend-list">
              ${s.legend.map((row) => {
                if (Array.isArray(row)) {
                  const [color, el, meaning] = row;
                  return `
                    <div class="qora-legend-row">
                      <span class="qora-legend-dot" style="background:${color}"></span>
                      <span class="qora-legend-el">${el}</span>
                      <span class="qora-legend-meaning">${meaning}</span>
                    </div>`;
                }
                const { color, el, meaning, viz, equation, caption, logic } = row;
                return `
                  <div class="qora-element-card">
                    <div class="qora-legend-row">
                      <span class="qora-legend-dot" style="background:${color}"></span>
                      <span class="qora-legend-el">${el}</span>
                    </div>
                    <div class="qora-legend-meaning">${meaning}</div>
                    ${SVGS[viz] ? `<div class="qora-element-viz">${SVGS[viz]}</div>` : ''}
                    <div class="qora-equation">${equation}</div>
                    ${caption ? `<div class="qora-about-note">${caption}</div>` : ''}
                    <div class="qora-logic">
                      ${logic.map((line) => `<div class="qora-logic-line">${line}</div>`).join('')}
                    </div>
                  </div>`;
              }).join('')}
            </div>
          ` : ''}
          ${s.list ? `
            <div class="qora-guide-list">
              ${s.list.map(([k, v]) => `
                <div class="qora-guide-row"><span class="qora-guide-key">${k}</span><span class="qora-guide-val">${v}</span></div>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById('qora-about-close').addEventListener('click', closeAbout);
}

export function openAbout() {
  ensureDom();
  document.getElementById('qora-about-overlay').classList.add('open');
}

export function closeAbout() {
  const o = document.getElementById('qora-about-overlay');
  if (o) o.classList.remove('open');
}

export function toggleAbout() {
  const o = document.getElementById('qora-about-overlay');
  if (o && o.classList.contains('open')) closeAbout();
  else openAbout();
}

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyI') toggleAbout();
  if (e.code === 'Escape') closeAbout();
});
