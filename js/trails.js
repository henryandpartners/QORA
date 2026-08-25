import * as THREE from 'three';

/**
 * Exciton transport trails — curved paths through the protein scaffold
 * representing photosynthetic energy transfer between chromophores.
 */

const TRAIL_COUNT = 18;
const TRAIL_LENGTH = 40;

// Theme hook — updated by setTheme() from the spectrum panel
let trailTheme = { hueMin: 0.6, hueRange: 0.25, decoHue: 0.08 };

export function createExcitonTrails(scene) {
  const trails = [];

  for (let t = 0; t < TRAIL_COUNT; t++) {
    const pts = [];
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      pts.push(new THREE.Vector3());
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(pts);
    const hue = trailTheme.hueMin + Math.random() * trailTheme.hueRange;
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color().setHSL(hue, 0.7, 0.45 + Math.random() * 0.2),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      linewidth: 1,
    });

    const line = new THREE.Line(geometry, material);
    scene.add(line);

    trails.push({
      line,
      points: pts,
      head: new THREE.Vector3(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3
      ),
      target: new THREE.Vector3(
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 3.5,
        (Math.random() - 0.5) * 3.5
      ),
      speed: 0.015 + Math.random() * 0.04,
      life: Math.random(),
      baseOpacity: 0.2 + Math.random() * 0.3,
      hue,
    });
  }

  function updateTrails(time, coherence, mode) {
    for (const tr of trails) {
      // Move head toward target
      tr.head.lerp(tr.target, tr.speed * (0.5 + coherence * 0.5));

      // Pick new target when close
      if (tr.head.distanceTo(tr.target) < 0.25) {
        // New target: prefer scaffold surface (r ≈ 1.5-2.2)
        const phi = Math.random() * Math.PI * 2;
        const theta = Math.acos(2 * Math.random() - 1);
        const r = 1.2 + Math.random() * 1.4;
        tr.target.set(
          r * Math.sin(theta) * Math.cos(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(theta)
        );
        tr.life = 1.0;
      }

      // Shift trail points (snake-like)
      for (let i = tr.points.length - 1; i > 0; i--) {
        tr.points[i].copy(tr.points[i - 1]);
      }
      tr.points[0].copy(tr.head);

      // Update line geometry
      tr.line.geometry.setFromPoints(tr.points);

      // Opacity: coherence-dependent + life fade
      const lifeAlpha = tr.life;
      const coherentAlpha = tr.baseOpacity + coherence * 0.5;
      let modeAlpha = 1.0;
      if (mode === 0) modeAlpha = 0.8;
      else if (mode === 2) modeAlpha = 1.3; // brighter in decoherence

      tr.line.material.opacity = Math.min(0.7, lifeAlpha * coherentAlpha * modeAlpha);

      // Color shift in decoherence mode
      if (mode === 2 && coherence < 0.4) {
        tr.line.material.color.setHSL(
          trailTheme.decoHue + (1 - coherence) * 0.08, // shift toward energy-loss hue
          0.8,
          0.4 + coherence * 0.3
        );
      } else {
        tr.line.material.color.setHSL(tr.hue, 0.7, 0.45 + coherence * 0.3);
      }

      tr.life -= 0.003;
    }
  }

  // Live theme change — re-roll hues into the theme's range
  function setTheme(theme) {
    trailTheme = theme;
    for (const tr of trails) {
      tr.hue = trailTheme.hueMin + Math.random() * trailTheme.hueRange;
    }
  }

  return { trails, updateTrails, setTrailTheme: setTheme };
}
