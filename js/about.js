/**
 * QORA — The Organism (About)
 * ===========================
 * I key / menu button — what the visualization represents:
 * the FMO complex, real quantum biology, the observer effect,
 * and the speculative thesis underneath the artwork.
 */

const SECTIONS = [
  {
    title: 'THE ORGANISM',
    body: `What you are looking at is a living diagram of real quantum biology — the <strong>Fenna-Matthews-Olson (FMO) complex</strong>, a photosynthetic protein found in green sulfur bacteria. It is one of the only places in nature where quantum effects have been measured working inside a warm, wet, living thing.`,
  },
  {
    title: 'WHAT EACH ELEMENT REPRESENTS',
    legend: [
      ['var(--qora-accent, #7b61ff)', 'outer + inner wireframe spheres', 'the FMO protein scaffold — outer is the trimeric envelope, inner the protein core; deliberately distorted because proteins are lumpy, not geometric'],
      ['#7b61ff', 'three rings at 120°', 'the three subunits of the trimer, bound in three-fold symmetry'],
      ['var(--qora-accent2, #00e5a0)', 'the glowing central node', 'the reaction center — the destination. Energy that arrives here is used; energy that doesn’t is lost as heat'],
      ['#00d4ff', '2,000 drifting particles', 'excitons — quasiparticles of pure energy hopping between pigment molecules inside the protein'],
      ['#a855f7', '18 curved trails', 'the energy pathways between chromophores, the pigment sites where an exciton can be'],
    ],
  },
  {
    title: 'WHY IT MATTERS',
    body: `When a photon hits, the excitation doesn’t pick a route. It exists as a <strong>superposition across all pathways simultaneously</strong>, and this wavelike coherence lets it find the fastest route to the reaction center — a quantum search that beats classical random-walking. The shocking discovery (Engel et al., <em>Nature</em> 2007) was that this coherence survives at room temperature, where it shouldn’t.`,
  },
  {
    title: 'YOU ARE THE PHYSICS',
    body: `<strong>Your mouse is the observer.</strong> Moving it decoheres the field — the coherence meter (ρ(t) = |ψ⟩⟨ψ|, the density matrix of a pure state) falls, particles dim and scatter. The observer effect, made tactile.`,
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
          ${s.legend ? `
            <div class="qora-legend-list">
              ${s.legend.map(([color, el, meaning]) => `
                <div class="qora-legend-row">
                  <span class="qora-legend-dot" style="background:${color}"></span>
                  <span class="qora-legend-el">${el}</span>
                  <span class="qora-legend-meaning">${meaning}</span>
                </div>
              `).join('')}
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
