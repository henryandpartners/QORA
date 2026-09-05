/**
 * QORA — The Descent: scroll-reactive canvas background.
 * One continuous field that evolves chapter by chapter:
 *   prologue  → sparse stars (classical stillness)
 *   ch1 clockwork → ordered orbits (deterministic machine)
 *   ch2 quantum    → probability cloud / wave (blur of possibilities)
 *   ch3 biology    → breathing organic lattice (warm interconnected cells)
 *   ch4+finale     → converging particle stream (accretion into the organism)
 * No libraries — a single 2D canvas, ~60fps.
 */
(() => {
  const canvas = document.getElementById('journey-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, DPR;
  const resize = () => {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * DPR; canvas.height = H * DPR;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  resize(); addEventListener('resize', resize);

  const N = 260;
  const pts = Array.from({ length: N }, () => ({
    a: Math.random() * Math.PI * 2,   // angle
    r: 0.3 + Math.random() * 0.7,     // radius fraction
    sp: (0.05 + Math.random() * 0.25) * (Math.random() < 0.5 ? 1 : -1), // speed
    s: 0.6 + Math.random() * 1.6,     // size
    ph: Math.random() * Math.PI * 2,  // phase for breathing
  }));

  // chapter blending: each style has a weight that eases toward target
  const styles = ['stars', 'clockwork', 'quantum', 'organic', 'converge'];
  const wts = { stars: 1, clockwork: 0, quantum: 0, organic: 0, converge: 0 };
  const targets = {
    prologue: 'stars', ch1: 'clockwork', ch2: 'quantum', ch3: 'organic', ch4: 'converge', finale: 'converge',
  };

  let t = 0;
  const ACCENT = '123, 97, 255', ACCENT2 = '0, 229, 160';

  function center() {
    if (wts.converge > 0.5) return { x: W / 2, y: H / 2 };      // accretion pulls to center
    return { x: W * 0.72, y: H * 0.5 };                          // field sits right of text
  }

  function draw() {
    t += 0.008;
    // ease weights toward current chapter target
    const target = targets[document.body.dataset.chapter] || 'stars';
    for (const s of styles) {
      const goal = s === target ? 1 : 0;
      wts[s] += (goal - wts[s]) * 0.03;
    }

    ctx.clearRect(0, 0, W, H);
    const c = center();
    const R = Math.min(W, H) * 0.42;

    for (let i = 0; i < N; i++) {
      const p = pts[i];
      let x, y, alpha = 0.5, size = p.s, color = ACCENT;

      // --- stars: static scattered field
      const sx = ((p.a / (Math.PI * 2)) + p.r) % 1 * W;
      const sy = (p.ph / (Math.PI * 2)) * H;
      const sX = sx, sY = sy;

      // --- clockwork: concentric orbits
      const oR = p.r * R;
      const oa = p.a + t * p.sp * 2;
      const oX = c.x + Math.cos(oa) * oR, oY = c.y + Math.sin(oa) * oR * 0.98;

      // --- quantum: probability blur (jittered cloud)
      const qj = Math.sin(t * 3 + p.ph) * 30 * p.r;
      const qX = c.x + Math.cos(oa + qj * 0.01) * (oR + qj);
      const qY = c.y + Math.sin(oa + qj * 0.013) * (oR + qj) * 0.98;

      // --- organic: breathing lattice nodes
      const breathe = Math.sin(t * 1.2 + p.ph) * 14;
      const gX = c.x + Math.cos(p.a) * (oR * 0.7 + breathe);
      const gY = c.y + Math.sin(p.a * 1.3) * (oR * 0.7 + breathe);

      // --- converge: spiral inward
      const cvR = ((p.r * 1.2 - t * 0.08 * p.sp) % 1.2 + 1.2) % 1.2 * R * 1.1;
      const cvX = c.x + Math.cos(p.a + cvR * 0.04) * cvR;
      const cvY = c.y + Math.sin(p.a + cvR * 0.04) * cvR;

      x = sX * wts.stars + oX * wts.clockwork + qX * wts.quantum + gX * wts.organic + cvX * wts.converge;
      y = sY * wts.stars + oY * wts.clockwork + qY * wts.quantum + gY * wts.organic + cvY * wts.converge;

      const act = wts.stars + wts.clockwork + wts.quantum + wts.organic + wts.converge;
      x /= act || 1; y /= act || 1;

      alpha = 0.15 + wts.stars * 0.35 + wts.clockwork * 0.4 + wts.quantum * 0.25
            + wts.organic * 0.45 + wts.converge * (1 - cvR / (R * 1.1)) * 0.8;
      size = p.s * (1 + wts.organic * 0.6 * (0.5 + 0.5 * Math.sin(t * 1.2 + p.ph)));
      color = (wts.organic + wts.converge > 0.9 && i % 5 === 0) ? ACCENT2 : ACCENT;

      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color},${Math.min(alpha, 0.85)})`;
      ctx.fill();
    }

    // quantum connective web (strongest in ch2, fades elsewhere)
    const webA = wts.quantum * 0.5 + wts.organic * 0.3 + wts.converge * 0.35;
    if (webA > 0.02) {
      ctx.lineWidth = 0.5;
      const step = Math.floor(N / 70);
      for (let i = 0; i < N; i += step) {
        const a = pts[i];
        const ax = c.x + Math.cos(a.a + t * a.sp * 2) * a.r * R;
        const ay = c.y + Math.sin(a.a + t * a.sp * 2) * a.r * R;
        for (let j = i + step; j < Math.min(i + step * 3, N); j += step) {
          const b = pts[j];
          const bx = c.x + Math.cos(b.a + t * b.sp * 2) * b.r * R;
          const by = c.y + Math.sin(b.a + t * b.sp * 2) * b.r * R;
          const d = Math.hypot(ax - bx, ay - by);
          if (d < R * 0.55) {
            ctx.strokeStyle = `rgba(${ACCENT},${webA * (1 - d / (R * 0.55)) * 0.5})`;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          }
        }
      }
    }

    // clockwork orbit rings
    if (wts.clockwork > 0.05) {
      ctx.strokeStyle = `rgba(${ACCENT},${wts.clockwork * 0.18})`;
      ctx.lineWidth = 0.6;
      for (let k = 1; k <= 4; k++) {
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, R * k / 4, R * k / 4 * 0.98, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();
