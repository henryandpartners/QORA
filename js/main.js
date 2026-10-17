import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { createScaffold } from './scaffold.js';
import { createParticleSystem } from './particles.js';
import { createExcitonTrails } from './trails.js';
import { createDust } from './dust.js';
import { createAtmosphere } from './atmosphere.js';
import { createChromophores } from './chromophores.js';
import { setupUI } from './ui.js';
import { setupSpectrum } from './spectrum.js';

// ── Scene ──────────────────────────────────
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050510, 0.03);

// ── Camera ─────────────────────────────────
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 60);
camera.position.set(0, 0, 8);
camera.lookAt(0, 0, 0);

// ── Renderer ───────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

// ── Post-processing: bloom ─────────────────
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(innerWidth, innerHeight),
  0.85,  // strength (coherence-driven each frame)
  0.55,  // radius
  0.12   // threshold
);
composer.addPass(bloomPass);

// ── Finishing pass: subtle chromatic aberration at edges + film grain ──
const finishPass = new ShaderPass({
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAberration: { value: 0.0022 },
    uGrain: { value: 0.045 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAberration;
    uniform float uGrain;
    varying vec2 vUv;
    void main() {
      vec2 dir = vUv - 0.5;
      float r2 = dot(dir, dir);
      // chromatic split grows toward the corners
      vec2 off = dir * uAberration * (0.4 + r2 * 3.0);
      vec4 col;
      col.r = texture2D(tDiffuse, vUv + off).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, vUv - off).b;
      col.a = 1.0;
      // animated film grain
      float n = fract(sin(dot(vUv * (1.0 + fract(uTime)), vec2(12.9898, 78.233)) + uTime) * 43758.5453);
      col.rgb += (n - 0.5) * uGrain;
      gl_FragColor = col;
    }
  `,
});
composer.addPass(finishPass);
composer.addPass(new OutputPass());

// ── Lighting (subtle) ──────────────────────
const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.6);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x7b61ff, 1.5, 10);
pointLight.position.set(2, 2, 4);
scene.add(pointLight);

// ── Scaffold ───────────────────────────────
const { outerScaffold, innerScaffold, core, applyThemeColors } = createScaffold(scene);

// ── Particles ──────────────────────────────
const { points, particleSystem } = createParticleSystem(scene);

// ── Exciton Trails ─────────────────────────
const { trails, updateTrails, setTrailTheme } = createExcitonTrails(scene);

// ── Background dust (depth layer) ──────────
const { updateDust } = createDust(scene);

// ── Fresnel atmosphere shell ───────────────
const { updateAtmosphere, setAtmosphereColor } = createAtmosphere(scene);

// ── FMO chromophore network (7 BChl sites) ─
const { updateChromophores, setChromophoreColor } = createChromophores(scene);

// ── UI ─────────────────────────────────────
const { updateCoherenceUI, setMode } = setupUI();

// ── Spectrum panel (C) ─────────────────────
setupSpectrum({
  scene,
  renderer,
  pointLight,
  particleSystem,
  scaffold: { applyThemeColors },
  trails: { setTrailTheme },
  atmosphere: { setAtmosphereColor },
  chromophores: { setChromophoreColor },
});

// ── State ──────────────────────────────────
let coherence = 1.0;
let currentMode = 0; // 0=coherence, 1=exciton, 2=deco
let ritualLock = false; // ritual collapse freeze
const modeNames = ['COHERENCE', 'EXCITON FLOW', 'DECOHERENCE CASCADE'];
const modeDescs = [
  'Exciton transport through FMO scaffold',
  'Energy pathways illuminate',
  'Observer-triggered collapse'
];

// ── Mouse / Interaction ────────────────────
const mouse = new THREE.Vector2(9999, 9999);
let mouseActive = false;
const raycaster = new THREE.Raycaster();
const interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const interactionPoint = new THREE.Vector3();

window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / innerHeight) * 2 + 1;
  mouseActive = true;
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(interactionPlane, interactionPoint);
});

window.addEventListener('mouseleave', () => {
  mouseActive = false;
});

// ── Keyboard ───────────────────────────────
window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'Space':
      e.preventDefault();
      particleSystem.reset();
      coherence = 1.0;
      break;
    case 'Digit1':
      setMode(0, modeNames[0], modeDescs[0]);
      currentMode = 0;
      break;
    case 'Digit2':
      setMode(1, modeNames[1], modeDescs[1]);
      currentMode = 1;
      break;
    case 'Digit3':
      setMode(2, modeNames[2], modeDescs[2]);
      currentMode = 2;
      break;
    case 'KeyF':
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.body.requestFullscreen();
      }
      break;
  }
});

// ── Quantum ritual lock ─────────────────────
// js/quantum.js dispatches these events when the enlightenment ritual
// collapses the field (decoherence cascade) and when it returns.
window.addEventListener('qora:collapse', () => {
  ritualLock = true;
  currentMode = 2;
  coherence = 0.03;
  setMode(2, 'DECOHERENCE CASCADE', 'Observer-triggered collapse');
});
window.addEventListener('qora:restore', () => {
  ritualLock = false;
  currentMode = 0;
  coherence = 1.0;
  setMode(0, 'COHERENCE', 'Exciton transport through FMO scaffold');
});

// ── Camera rig: slow orbit + scroll dolly + mouse parallax ──
let camTheta = 0;
let camRadius = 8;
let camRadiusTarget = 8;
const camParallax = new THREE.Vector2(); // smoothed mouse offset

// Intro dolly: camera eases in from far away over the first ~4 seconds
const INTRO_DOLLY = 4.0;
const camRadiusIntro = 17;
camRadius = camRadiusIntro;

window.addEventListener('wheel', (e) => {
  camRadiusTarget = THREE.MathUtils.clamp(
    camRadiusTarget + e.deltaY * 0.005,
    3,
    15
  );
});

// ── Resize ─────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  composer.setSize(innerWidth, innerHeight);
});

// ── Animation Loop ─────────────────────────
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  // Coherence dynamics
  if (ritualLock) {
    // Ritual collapse: hold the field in decoherence
    coherence = THREE.MathUtils.lerp(coherence, 0.02, 0.06);
  } else if (mouseActive) {
    const mouseDist = Math.sqrt(mouse.x ** 2 + mouse.y ** 2);
    const decayRate = currentMode === 2 ? 0.08 : 0.04;
    coherence = THREE.MathUtils.lerp(coherence, Math.max(0.03, 1 - mouseDist * 0.85), decayRate);
  } else {
    const recoveryRate = currentMode === 2 ? 0.003 : 0.008;
    coherence = THREE.MathUtils.lerp(coherence, 1.0, recoveryRate);
  }

  // Update particles
  particleSystem.update(time, coherence, mouseActive, interactionPoint, currentMode);
  points.geometry.attributes.position.needsUpdate = true;
  points.geometry.attributes.color.needsUpdate = true;
  points.geometry.attributes.size.needsUpdate = true;

  // Update trails + dust + atmosphere + chromophore network
  updateTrails(time, coherence, currentMode, camera);
  updateDust(time);
  updateAtmosphere(time, coherence);
  updateChromophores(time, coherence);

  // Scaffold: organic breathing + rotation
  const breathe = 1 + Math.sin(time * 0.5) * 0.015 * (0.3 + coherence * 0.7);
  outerScaffold.scale.setScalar(breathe);
  innerScaffold.scale.setScalar(2 - breathe);
  outerScaffold.rotation.y += 0.003;
  outerScaffold.rotation.x = Math.sin(time * 0.2) * 0.08;
  innerScaffold.rotation.y -= 0.004;
  innerScaffold.rotation.z = Math.sin(time * 0.3) * 0.1;

  // Core node: coherent pulse / decoherent jitter
  const corePulse = 1 + Math.sin(time * 1.8) * 0.22 * (0.4 + coherence * 0.6)
    + (1 - coherence) * Math.sin(time * 9.0) * 0.15;
  core.scale.setScalar(Math.max(0.4, corePulse));

  // Camera: slow orbit (faster + wilder in decoherence)
  camTheta += currentMode === 2 ? 0.0016 : 0.0005;
  // Intro dolly-in, then follow scroll target
  if (time < INTRO_DOLLY) {
    const k = time / INTRO_DOLLY;
    const eased = 1 - Math.pow(1 - k, 3); // ease-out cubic
    camRadius = camRadiusIntro + (camRadiusTarget - camRadiusIntro) * eased;
  } else {
    camRadius += (camRadiusTarget - camRadius) * 0.06;
  }
  const px = mouseActive ? mouse.x : 0;
  const py = mouseActive ? mouse.y : 0;
  camParallax.x += (px - camParallax.x) * 0.03;
  camParallax.y += (py - camParallax.y) * 0.03;
  const jitter = currentMode === 2 ? Math.sin(time * 5.1) * 0.08 * (1 - coherence) : 0;
  camera.position.set(
    Math.sin(camTheta + camParallax.x * 0.45 + jitter) * camRadius,
    camParallax.y * 1.1 + Math.sin(time * 0.07) * 0.2 + jitter * 0.5,
    Math.cos(camTheta + camParallax.x * 0.45) * camRadius
  );
  camera.lookAt(0, 0, 0);

  // Bloom: hotter and throbbing as coherence drops
  bloomPass.strength =
    0.7 + (1 - coherence) * 0.9 + Math.sin(time * 2.2) * 0.06 * (1 - coherence);

  // Finish pass: grain constant, aberration spikes with decoherence
  finishPass.uniforms.uTime.value = time;
  finishPass.uniforms.uAberration.value = 0.0022 + (1 - coherence) * 0.004;

  // Update shader uniforms
  points.material.uniforms.uTime.value = time;
  points.material.uniforms.uCoherence.value = coherence;
  points.material.uniforms.uMode.value = currentMode;

  // Update UI
  updateCoherenceUI(coherence);

  // Update mode color based on coherence
  if (currentMode === 0) {
    const r = 0.48 * (1 - coherence) + 1.0 * coherence;
    const g = 0.38 * (1 - coherence) + 0.9 * coherence;
    document.getElementById('mode-label').style.color = `rgb(${(r*100)|0},${(g*180)|0},${(160+coherence*95)|0})`;
  }

  composer.render();
}

animate();
