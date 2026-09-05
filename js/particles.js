import * as THREE from 'three';

/**
 * Quantum exciton particle system — 2000 particles representing
 * exciton transport through the FMO protein scaffold.
 */

const PARTICLE_COUNT = 2000;

export function createParticleSystem(scene) {
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const velocities = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const colorT = new Float32Array(PARTICLE_COUNT);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const origins = new Float32Array(PARTICLE_COUNT * 3);
  const phases = new Float32Array(PARTICLE_COUNT);

  // Initialize particles in a spherical shell
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    // Shell distribution: concentrated near the inner scaffold
    const r = 1.3 + Math.random() * 1.4;

    const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    origins[i * 3] = x;
    origins[i * 3 + 1] = y;
    origins[i * 3 + 2] = z;

    velocities[i * 3] = (Math.random() - 0.5) * 0.004;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.004;

    // Color gradient: violet → cyan → emerald (photosynthetic)
    // colorT stores each particle's gradient position so themes can recolor live
    const t = Math.random();
    colorT[i] = t;
    colors[i * 3] = 0.35 + Math.sin(t * Math.PI) * 0.3;     // R: low
    colors[i * 3 + 1] = 0.3 + t * 0.6;                       // G: rises
    colors[i * 3 + 2] = 0.7 + Math.cos(t * Math.PI) * 0.3;  // B: high→med

    sizes[i] = 1.5 + Math.random() * 3.5;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  // Custom shader for quantum glow particles
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uCoherence: { value: 1.0 },
      uMode: { value: 0 },
      uPR: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      varying float vAlpha;
      uniform float uTime;
      uniform float uCoherence;
      uniform float uMode;
      uniform float uPR;

      void main() {
        vColor = color;
        // Alpha scales with coherence — decoherent = dimmer
        vAlpha = 0.35 + uCoherence * 0.65;

        // Twinkle: subtle per-particle shimmer from size + time
        float twinkle = 0.85 + 0.15 * sin(uTime * (2.0 + fract(size) * 3.0) + size * 21.0);
        vAlpha *= twinkle;

        // Sparkle: occasional bright flash (coherence events)
        float flashPhase = fract(uTime * 0.08 + fract(size * 0.731));
        if (flashPhase > 0.986) vAlpha *= 2.2;

        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float dist = length(mvPosition.xyz);

        // Point size: larger when coherent, smaller when decoherent
        float baseSize = size * uPR * (6.0 / -mvPosition.z);
        float coherenceScale = mix(0.4, 1.0, uCoherence);
        gl_PointSize = baseSize * coherenceScale * (0.9 + 0.1 * twinkle);

        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      varying vec3 vColor;
      varying float vAlpha;

      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;

        // Gaussian-like glow
        float glow = exp(-d * 6.0);
        float alpha = glow * vAlpha;

        // Inner core is brighter
        vec3 coreColor = vColor * 1.5;
        vec3 edgeColor = vColor * 0.3;
        vec3 finalColor = mix(edgeColor, coreColor, glow);

        gl_FragColor = vec4(finalColor, alpha);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  scene.add(points);

  // State object returned to main loop
  const state = {
    positions,
    velocities,
    colors,
    sizes,
    origins,
    phases,
    // Theme hook: decoRGB is the "energy loss" color used by the
    // decoherence cascade; recolor() re-derives all particle colors
    // from a theme gradient without touching positions.
    decoRGB: [0.48, 0.9, 0.5],

    recolor(gradientFn, decoRGB) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const [r, g, b] = gradientFn(colorT[i]);
        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
      }
      points.geometry.attributes.color.needsUpdate = true;
      if (decoRGB) state.decoRGB = decoRGB;
    },

    reset() {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        positions[i * 3] = origins[i * 3];
        positions[i * 3 + 1] = origins[i * 3 + 1];
        positions[i * 3 + 2] = origins[i * 3 + 2];
        velocities[i * 3] = (Math.random() - 0.5) * 0.004;
        velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.004;
        velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.004;
        sizes[i] = 1.5 + Math.random() * 3.5;
      }
    },

    update(time, coherence, mouseActive, interactionPoint, mode) {
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const ix = i * 3;
        const iy = i * 3 + 1;
        const iz = i * 3 + 2;

        // ── Return force (elastic to origin, scaled by coherence) ──
        const returnStrength = coherence * 0.0018;
        velocities[ix] += (origins[ix] - positions[ix]) * returnStrength;
        velocities[iy] += (origins[iy] - positions[iy]) * returnStrength;
        velocities[iz] += (origins[iz] - positions[iz]) * returnStrength;

        // ── Observer effect: mouse repels particles ──
        if (mouseActive) {
          const dx = positions[ix] - interactionPoint.x;
          const dy = positions[iy] - interactionPoint.y;
          const distSq = dx * dx + dy * dy + 0.08;
          const repulsion = (1 - coherence) * 0.25 / distSq;
          velocities[ix] += dx * repulsion;
          velocities[iy] += dy * repulsion;
        }

        // ── Mode-specific dynamics ──
        if (mode === 0) {
          // Coherence: gentle wave motion
          velocities[ix] += Math.sin(time * 0.4 + positions[iy] * 2.5 + phases[i]) * 0.0008 * coherence;
          velocities[iy] += Math.cos(time * 0.35 + positions[ix] * 2.5 + phases[i]) * 0.0008 * coherence;
          velocities[iz] += Math.sin(time * 0.45 + positions[iz] * 2.0 + phases[i]) * 0.0008 * coherence;
        } else if (mode === 1) {
          // Exciton flow: directed movement along pathways
          const angle = Math.atan2(positions[iy], positions[ix]) + time * 0.3;
          const pathwayR = 1.5;
          const r = Math.sqrt(positions[ix] ** 2 + positions[iy] ** 2);
          const radialForce = (pathwayR - r) * 0.0005;
          velocities[ix] += Math.cos(angle) * radialForce;
          velocities[iy] += Math.sin(angle) * radialForce;
          velocities[iz] += Math.sin(time * 0.5 + positions[iz]) * 0.001 * coherence;
        } else {
          // Decoherence cascade: chaotic turbulence
          velocities[ix] += (Math.sin(time * 3 + positions[iy] * 4) * 0.003) * (1 - coherence);
          velocities[iy] += (Math.cos(time * 2.5 + positions[ix] * 4) * 0.003) * (1 - coherence);
          velocities[iz] += (Math.sin(time * 3.5 + positions[iz] * 3) * 0.003) * (1 - coherence);
        }

        // ── Damping ──
        const damping = mode === 2 ? 0.965 : 0.98;
        velocities[ix] *= damping;
        velocities[iy] *= damping;
        velocities[iz] *= damping;

        // ── Integrate ──
        positions[ix] += velocities[ix];
        positions[iy] += velocities[iy];
        positions[iz] += velocities[iz];

        // ── Velocity-reactive size: faster particles read as energy ──
        const speed = Math.sqrt(
          velocities[ix] ** 2 + velocities[iy] ** 2 + velocities[iz] ** 2
        );
        sizes[i] = 1.5 + Math.min(4.5, speed * 900) + phases[i] * 0.2;

        // ── Color shift based on coherence ──
        if (mode === 2 && coherence < 0.3) {
          // Decoherence: shift toward the theme's energy-loss color
          colors[ix] = state.decoRGB[0] + (1 - coherence) * 0.5;
          colors[iy] = state.decoRGB[1] * coherence;
          colors[iz] = state.decoRGB[2] * coherence;
        }
      }
    },
  };

  return { points, particleSystem: state };
}
