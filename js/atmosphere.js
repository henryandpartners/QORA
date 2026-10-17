import * as THREE from 'three';

/**
 * Fresnel atmosphere shell — a soft edge-glow membrane around the
 * protein scaffold. Reads as the organism's "field": bright at the
 * silhouette rim, transparent face-on, with slow interference bands
 * that flatten as coherence drops.
 */
export function createAtmosphere(scene) {
  const geo = new THREE.SphereGeometry(2.65, 64, 64);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0x7b61ff) },
      uTime: { value: 0 },
      uCoherence: { value: 1 },
      uIntensity: { value: 0.55 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vViewDir = normalize(-mv.xyz);
        vWorldPos = position;
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uTime;
      uniform float uCoherence;
      uniform float uIntensity;
      varying vec3 vNormal;
      varying vec3 vViewDir;
      varying vec3 vWorldPos;
      void main() {
        float fresnel = pow(1.0 - abs(dot(vNormal, vViewDir)), 2.6);
        // slow interference bands drifting over the membrane —
        // crisp while coherent, noisy as the field decoheres
        float bands = sin(vWorldPos.y * 9.0 - uTime * 1.1 + sin(vWorldPos.x * 4.0 + uTime * 0.4) * 1.5);
        float bandMix = mix(0.55, 1.0, (0.5 + 0.5 * bands) * (0.25 + 0.75 * uCoherence));
        float jitter = mix(1.0, 0.85 + 0.3 * fract(sin(dot(vWorldPos.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453), (1.0 - uCoherence) * 0.5);
        float a = fresnel * uIntensity * bandMix * jitter * (0.35 + 0.65 * uCoherence);
        gl_FragColor = vec4(uColor * (0.75 + fresnel * 0.9), a);
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
  });

  const shell = new THREE.Mesh(geo, mat);
  scene.add(shell);

  function updateAtmosphere(time, coherence) {
    mat.uniforms.uTime.value = time;
    mat.uniforms.uCoherence.value = coherence;
    // breathe slightly out of phase with the scaffold
    const s = 1 + Math.sin(time * 0.4) * 0.02 + (1 - coherence) * 0.05;
    shell.scale.setScalar(s);
    shell.rotation.y = time * 0.02;
  }

  function setAtmosphereColor(hex) {
    mat.uniforms.uColor.value.setHex(hex);
  }

  return { shell, updateAtmosphere, setAtmosphereColor };
}
