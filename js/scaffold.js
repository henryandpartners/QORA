import * as THREE from 'three';

/**
 * FMO Protein Scaffold — icosahedron-based wireframe model
 * representing the Fenna-Matthews-Olson trimeric complex.
 */

export function createScaffold(scene) {
  // Outer scaffold — trimeric envelope
  const outerGeo = new THREE.IcosahedronGeometry(2.0, 3);
  // Deform to make it more organic
  const outerPos = outerGeo.attributes.position;
  for (let i = 0; i < outerPos.count; i++) {
    const x = outerPos.getX(i);
    const y = outerPos.getY(i);
    const z = outerPos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z);
    const noise = 1 + Math.sin(x * 3.5) * Math.cos(y * 3.5) * Math.sin(z * 3.5) * 0.15;
    outerPos.setXYZ(i, x * noise, y * noise, z * noise);
  }
  outerGeo.computeVertexNormals();

  const outerMat = new THREE.MeshBasicMaterial({
    color: 0x1a1a2e,
    wireframe: true,
    transparent: true,
    opacity: 0.12,
  });
  const outerScaffold = new THREE.Mesh(outerGeo, outerMat);
  scene.add(outerScaffold);

  // Inner scaffold — protein core
  const innerGeo = new THREE.IcosahedronGeometry(1.3, 2);
  const innerPos = innerGeo.attributes.position;
  for (let i = 0; i < innerPos.count; i++) {
    const x = innerPos.getX(i);
    const y = innerPos.getY(i);
    const z = innerPos.getZ(i);
    const len = Math.sqrt(x * x + y * y + z * z);
    const noise = 1 + Math.cos(x * 4.2) * Math.sin(y * 3.8) * Math.cos(z * 4.2) * 0.12;
    innerPos.setXYZ(i, x * noise, y * noise, z * noise);
  }
  innerGeo.computeVertexNormals();

  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x2a1a3e,
    wireframe: true,
    transparent: true,
    opacity: 0.2,
  });
  const innerScaffold = new THREE.Mesh(innerGeo, innerMat);
  scene.add(innerScaffold);

  // Trimer connection rings (3 rings at 120°)
  const ringGeo = new THREE.TorusGeometry(0.6, 0.015, 16, 48);
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
      color: 0x7b61ff,
      transparent: true,
      opacity: 0.15,
    }));
    ring.position.set(Math.cos(angle) * 0.9, Math.sin(angle) * 0.9, 0);
    ring.rotation.x = Math.PI / 2;
    ring.rotation.z = angle;
    scene.add(ring);
  }

  // Central node
  const coreGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x7b61ff,
    transparent: true,
    opacity: 0.4,
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  return { outerScaffold, innerScaffold };
}
