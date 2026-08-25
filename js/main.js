import * as THREE from 'three';
import { createScaffold } from './scaffold.js';
import { createParticleSystem } from './particles.js';
import { createExcitonTrails } from './trails.js';
import { setupUI } from './ui.js';
import { setupSpectrum } from './spectrum.js';

// ── Scene ──────────────────────────────────
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050510, 0.03);

// ── Camera ─────────────────────────────────
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.1, 50);
camera.position.set(0, 0, 8);
camera.lookAt(0, 0, 0);

// ── Renderer ───────────────────────────────
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
document.body.appendChild(renderer.domElement);

// ── Lighting (subtle) ──────────────────────
const ambientLight = new THREE.AmbientLight(0x1a1a3e, 0.6);
scene.add(ambientLight);
const pointLight = new THREE.PointLight(0x7b61ff, 1.5, 10);
pointLight.position.set(2, 2, 4);
scene.add(pointLight);

// ── Scaffold ───────────────────────────────
const { outerScaffold, innerScaffold, applyThemeColors } = createScaffold(scene);

// ── Particles ──────────────────────────────
const { points, particleSystem } = createParticleSystem(scene);

// ── Exciton Trails ─────────────────────────
const { trails, updateTrails, setTrailTheme } = createExcitonTrails(scene);

// ── UI ─────────────────────────────────────
const { updateCoherenceUI, setMode } = setupUI();

// ── Spectrum panel (C) ─────────────────────
setupSpectrum({
  renderer,
  pointLight,
  particleSystem,
  scaffold: { applyThemeColors },
  trails: { setTrailTheme },
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

// ── Scroll zoom ────────────────────────────
window.addEventListener('wheel', (e) => {
  camera.position.z = THREE.MathUtils.clamp(
    camera.position.z + e.deltaY * 0.005,
    3,
    15
  );
});

// ── Resize ─────────────────────────────────
window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
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

  // Update trails
  updateTrails(time, coherence, currentMode);

  // Rotate scaffold
  outerScaffold.rotation.y += 0.003;
  outerScaffold.rotation.x = Math.sin(time * 0.2) * 0.08;
  innerScaffold.rotation.y -= 0.004;
  innerScaffold.rotation.z = Math.sin(time * 0.3) * 0.1;

  // Camera drift
  const camDrift = currentMode === 2 ? 0.3 : 0.1;
  camera.position.x += (Math.sin(time * 0.15) * camDrift - camera.position.x) * 0.01;
  camera.position.y += (Math.cos(time * 0.12) * camDrift * 0.7 - camera.position.y) * 0.01;
  camera.lookAt(0, 0, 0);

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

  renderer.render(scene, camera);
}

animate();
