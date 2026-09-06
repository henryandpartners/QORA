import * as THREE from 'three';

/**
 * Exciton transport trails — glowing circular orbits through the protein
 * scaffold, representing cyclic photosynthetic energy transfer between
 * chromophores.
 *
 * Each trail is a camera-facing ribbon bent into a near-closed circle with
 * a random orientation and radius. A bright comet head travels around the
 * ring; the rest of the circle glows faintly so the full loop reads as a
 * circle. Custom shader, additive blending (linewidth-safe, unlike
 * THREE.Line which is ignored on most platforms).
 */

const TRAIL_COUNT = 18;
const TRAIL_LENGTH = 64;
const ARC = Math.PI * 1.92; // arc coverage — nearly a closed circle

// Theme hook — updated by setTheme() from the spectrum panel
let trailTheme = { hueMin: 0.6, hueRange: 0.25, decoHue: 0.08 };

const _tangent = new THREE.Vector3();
const _side = new THREE.Vector3();
const _viewDir = new THREE.Vector3();
const _camPos = new THREE.Vector3();

function buildRibbon(scene) {
  const vertexCount = TRAIL_LENGTH * 2;
  const positions = new Float32Array(vertexCount * 3);
  const tCoord = new Float32Array(vertexCount); // 0=head, 1=tail

  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const t = i / (TRAIL_LENGTH - 1);
    tCoord[i * 2] = t;
    tCoord[i * 2 + 1] = t;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('tCoord', new THREE.BufferAttribute(tCoord, 1));

  // Index strip triangles
  const indices = [];
  for (let i = 0; i < TRAIL_LENGTH - 1; i++) {
    const a = i * 2, b = i * 2 + 1, c = (i + 1) * 2, d = (i + 1) * 2 + 1;
    indices.push(a, b, c, b, d, c);
  }
  geometry.setIndex(indices);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color().setHSL(0.7, 0.7, 0.55) },
      uOpacity: { value: 0.4 },
      uWidth: { value: 0.045 },
    },
    vertexShader: /* glsl */ `
      attribute float tCoord;
      varying float vT;
      void main() {
        vT = tCoord;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vT;
      void main() {
        // Comet head (vT=0) rides a faintly glowing full ring
        float headGlow = exp(-vT * 2.6);
        float ringBase = 0.32;
        float endFade = 1.0 - smoothstep(0.92, 1.0, vT);
        float a = uOpacity * (ringBase + (1.0 - ringBase) * headGlow) * endFade;
        // Hot white-ish core at the head
        vec3 col = mix(uColor * 1.6, uColor, clamp(vT * 4.0, 0.0, 1.0));
        gl_FragColor = vec4(col, a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  scene.add(mesh);
  return { mesh, positions, material };
}

export function createExcitonTrails(scene) {
  const trails = [];

  for (let t = 0; t < TRAIL_COUNT; t++) {
    const ribbon = buildRibbon(scene);

    const points = [];
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      points.push(new THREE.Vector3());
    }

    // Random circle orientation: orthonormal basis (u, v) from a random quaternion
    const quat = new THREE.Quaternion().setFromEuler(new THREE.Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    ));
    const u = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
    const v = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);

    const hue = trailTheme.hueMin + Math.random() * trailTheme.hueRange;

    trails.push({
      ribbon,
      points,
      center: new THREE.Vector3(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.5
      ),
      u,
      v,
      radius: 0.9 + Math.random() * 1.2,
      phase: Math.random() * Math.PI * 2,
      speed: (0.25 + Math.random() * 0.5) * (Math.random() < 0.5 ? -1 : 1),
      life: 0.6 + Math.random() * 0.4,
      baseOpacity: 0.2 + Math.random() * 0.3,
      hue,
    });
  }

  function updateTrails(time, coherence, mode, camera) {
    _camPos.setFromMatrixPosition(camera.matrixWorld);
    const step = ARC / (TRAIL_LENGTH - 1);

    for (const tr of trails) {
      // Head angle advances with time; coherence speeds the orbit up
      const headAngle = tr.phase + time * tr.speed * (0.5 + coherence * 0.5);
      const dir = Math.sign(tr.speed) || 1;

      // Sample the circle: head first, tail trailing behind along the arc
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const ang = headAngle - dir * i * step;
        const ca = Math.cos(ang) * tr.radius;
        const sa = Math.sin(ang) * tr.radius;
        tr.points[i]
          .copy(tr.center)
          .addScaledVector(tr.u, ca)
          .addScaledVector(tr.v, sa);
      }

      // Rebuild ribbon: each point extruded along a camera-facing side vector
      const { positions } = tr.ribbon;
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const p = tr.points[i];
        if (i < TRAIL_LENGTH - 1) {
          _tangent.subVectors(tr.points[i + 1], p);
        } else {
          _tangent.subVectors(p, tr.points[i - 1]);
        }
        _viewDir.subVectors(_camPos, p);
        _side.crossVectors(_tangent, _viewDir);
        if (_side.lengthSq() < 1e-10) _side.set(0, 1, 0);
        _side.normalize();

        // Width tapers toward the tail
        const t = i / (TRAIL_LENGTH - 1);
        const w = (0.35 + (1 - t) * 0.65) * 0.05;

        const ix = i * 6;
        positions[ix] = p.x + _side.x * w;
        positions[ix + 1] = p.y + _side.y * w;
        positions[ix + 2] = p.z + _side.z * w;
        positions[ix + 3] = p.x - _side.x * w;
        positions[ix + 4] = p.y - _side.y * w;
        positions[ix + 5] = p.z - _side.z * w;
      }
      tr.ribbon.mesh.geometry.attributes.position.needsUpdate = true;

      // Opacity: coherence-dependent + slow life breathing
      tr.life = 0.7 + 0.3 * Math.sin(time * 0.3 + tr.phase);
      const lifeAlpha = tr.life;
      const coherentAlpha = tr.baseOpacity + coherence * 0.5;
      let modeAlpha = 1.0;
      if (mode === 0) modeAlpha = 0.8;
      else if (mode === 2) modeAlpha = 1.3; // brighter in decoherence

      tr.ribbon.material.uniforms.uOpacity.value =
        Math.min(0.85, lifeAlpha * coherentAlpha * modeAlpha);

      // Color shift in decoherence mode
      if (mode === 2 && coherence < 0.4) {
        tr.ribbon.material.uniforms.uColor.value.setHSL(
          trailTheme.decoHue + (1 - coherence) * 0.08, // shift toward energy-loss hue
          0.8,
          0.4 + coherence * 0.3
        );
      } else {
        tr.ribbon.material.uniforms.uColor.value.setHSL(tr.hue, 0.7, 0.45 + coherence * 0.3);
      }
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
