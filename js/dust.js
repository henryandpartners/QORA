import * as THREE from 'three';

/**
 * Background dust — a distant, dim particle field that gives the
 * scene depth behind the protein scaffold.
 */

const DUST_COUNT = 600;

export function createDust(scene) {
  const positions = new Float32Array(DUST_COUNT * 3);
  const sizes = new Float32Array(DUST_COUNT);
  const phases = new Float32Array(DUST_COUNT);

  for (let i = 0; i < DUST_COUNT; i++) {
    // Sparse spherical shell far behind the scaffold
    const phi = Math.random() * Math.PI * 2;
    const theta = Math.acos(2 * Math.random() - 1);
    const r = 7 + Math.random() * 12;
    positions[i * 3] = r * Math.sin(theta) * Math.cos(phi);
    positions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    positions[i * 3 + 2] = r * Math.cos(theta);
    sizes[i] = 0.8 + Math.random() * 2.0;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('phase', new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uPR: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: /* glsl */ `
      attribute float size;
      attribute float phase;
      uniform float uTime;
      uniform float uPR;
      varying float vTwinkle;
      void main() {
        vTwinkle = 0.5 + 0.5 * sin(uTime * 0.7 + phase * 6.2831);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * uPR * (5.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: /* glsl */ `
      varying float vTwinkle;
      void main() {
        float d = length(gl_PointCoord - vec2(0.5));
        if (d > 0.5) discard;
        float glow = exp(-d * 7.0);
        vec3 col = vec3(0.55, 0.55, 0.85);
        gl_FragColor = vec4(col * glow, glow * 0.18 * vTwinkle);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const dust = new THREE.Points(geometry, material);
  scene.add(dust);

  function updateDust(time) {
    dust.rotation.y = time * 0.008;
    dust.rotation.x = Math.sin(time * 0.05) * 0.05;
    material.uniforms.uTime.value = time;
  }

  return { dust, updateDust };
}
