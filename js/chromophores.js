import * as THREE from 'three';

/**
 * FMO chromophore network — the 7 bacteriochlorophyll-a sites of the
 * Fenna-Matthews-Olson complex, rendered as glowing nodes inside the
 * scaffold, wired by faint filaments. Energy quanta (bright sprites)
 * hop between sites along the filaments — the actual physics the piece
 * is about: exciton transport through the pigment network.
 */

// 7 BChl sites — stylized positions, roughly the real 3-fold layout
const SITES = [
  new THREE.Vector3(0.00, 1.15, 0.00),
  new THREE.Vector3(0.95, 0.45, 0.35),
  new THREE.Vector3(0.30, 0.10, -1.00),
  new THREE.Vector3(-0.90, 0.35, -0.45),
  new THREE.Vector3(-0.55, -0.75, 0.70),
  new THREE.Vector3(0.70, -0.85, -0.30),
  new THREE.Vector3(0.00, -0.20, 0.15), // central site 6 — the hub
];

// Connectivity (site index pairs) — nearest-neighbour pigment couplings
const EDGES = [
  [0, 1], [0, 3], [0, 6],
  [1, 2], [1, 5], [1, 6],
  [2, 3], [2, 6],
  [3, 4], [3, 6],
  [4, 5], [4, 6],
  [5, 6],
  [0, 2], [2, 5], [4, 0], [5, 3],
];

const HOP_COUNT = EDGES.length; // one quantum per edge

export function createChromophores(scene) {
  const group = new THREE.Group();
  scene.add(group);

  const nodeColor = new THREE.Color(0x7b61ff);

  // ── Nodes: glowing spheres with halo sprites ──
  const nodeGeo = new THREE.SphereGeometry(0.055, 20, 20);
  const nodes = [];
  for (const p of SITES) {
    const mat = new THREE.MeshBasicMaterial({
      color: nodeColor.clone(),
      transparent: true,
      opacity: 0.95,
    });
    const node = new THREE.Mesh(nodeGeo, mat);
    node.position.copy(p);
    group.add(node);

    // halo sprite
    const haloMat = new THREE.SpriteMaterial({
      color: nodeColor.clone(),
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(0.42);
    halo.position.copy(p);
    group.add(halo);

    nodes.push({ mesh: node, mat, halo, haloMat, base: p.clone(), phase: Math.random() * Math.PI * 2 });
  }

  // ── Filaments: faint lines between coupled sites ──
  const linePositions = new Float32Array(EDGES.length * 6);
  EDGES.forEach(([a, b], i) => {
    linePositions.set([SITES[a].x, SITES[a].y, SITES[a].z, SITES[b].x, SITES[b].y, SITES[b].z], i * 6);
  });
  const lineGeo = new THREE.BufferGeometry();
  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: nodeColor.clone(),
    transparent: true,
    opacity: 0.14,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const lines = new THREE.LineSegments(lineGeo, lineMat);
  group.add(lines);

  // ── Energy quanta: sprites hopping along each filament ──
  const hopGeo = new THREE.BufferGeometry();
  const hopPos = new Float32Array(HOP_COUNT * 3);
  hopGeo.setAttribute('position', new THREE.BufferAttribute(hopPos, 3));
  const hopMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.14,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const hops = new THREE.Points(hopGeo, hopMat);
  group.add(hops);

  const hopState = EDGES.map(() => ({
    offset: Math.random(),
    speed: 0.12 + Math.random() * 0.2,
    dir: Math.random() < 0.5 ? 1 : -1,
  }));

  function updateChromophores(time, coherence) {
    // Nodes: pulse glow; each site "fires" on a slow cycle
    for (const n of nodes) {
      const pulse = 0.6 + 0.4 * Math.sin(time * 1.4 + n.phase);
      const excite = Math.pow(Math.max(0, Math.sin(time * 0.9 + n.phase * 2.1)), 8); // sharp firing
      n.mat.opacity = 0.55 + 0.45 * pulse;
      n.haloMat.opacity = (0.18 + 0.3 * excite) * (0.4 + 0.6 * coherence);
      const s = 0.34 + excite * 0.3 + pulse * 0.05;
      n.halo.scale.setScalar(s);
      n.mesh.scale.setScalar(1 + excite * 0.7);
      // slight organic drift, frozen more when decoherent
      n.mesh.position.copy(n.base).addScaledVector(
        new THREE.Vector3(
          Math.sin(time * 0.6 + n.phase),
          Math.cos(time * 0.5 + n.phase * 1.3),
          Math.sin(time * 0.4 + n.phase * 0.7)
        ),
        0.02 * coherence
      );
      n.halo.position.copy(n.mesh.position);
    }

    // Filament opacity brightens with coherence
    lineMat.opacity = 0.08 + coherence * 0.1;

    // Quanta hop: t sweeps each edge; coherent = smooth glide,
    // decoherent = stalled, flickering, scattered
    EDGES.forEach(([a, b], i) => {
      const h = hopState[i];
      let t = (time * h.speed * h.dir + h.offset) % 1;
      if (t < 0) t += 1;
      // decoherence scatters the transfer — random walk jitter on t
      t += (1 - coherence) * (Math.sin(time * 7 + i * 13.7) * 0.08);
      t = THREE.MathUtils.clamp(t, 0, 1);
      const pa = nodes[a].mesh.position;
      const pb = nodes[b].mesh.position;
      hopPos[i * 3] = pa.x + (pb.x - pa.x) * t;
      hopPos[i * 3 + 1] = pa.y + (pb.y - pa.y) * t;
      hopPos[i * 3 + 2] = pa.z + (pb.z - pa.z) * t;
    });
    hopGeo.attributes.position.needsUpdate = true;
    hopMat.opacity = 0.25 + coherence * 0.65;
    hopMat.size = 0.1 + coherence * 0.06;

    group.rotation.y = Math.sin(time * 0.08) * 0.15;
    group.rotation.x = Math.cos(time * 0.06) * 0.08;
  }

  function setChromophoreColor(hex) {
    nodeColor.setHex(hex);
    for (const n of nodes) {
      n.mat.color.setHex(hex);
      n.haloMat.color.setHex(hex);
    }
    lineMat.color.setHex(hex);
  }

  return { group, updateChromophores, setChromophoreColor };
}
