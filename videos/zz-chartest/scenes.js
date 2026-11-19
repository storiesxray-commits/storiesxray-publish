import { THREE, C, Subject, poseStand, lights } from '../../engine/engine.js';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function stage(scene) {
  scene.background = new THREE.Color(0x1b2130);
  lights(scene, { shadow: true, shadowR: 3 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x3a4152, roughness: 0.8 })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
}
const PEOPLE = [
  { gender: 'm', hairStyle: 'short', skin: 0xe0ac86, col: { torso: 0x3a86ff, upper: 0x3a86ff, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0xf4f1ea } },
  { gender: 'f', hairStyle: 'long', skin: 0xf1c9a5, hair: 0x6b4428, eyes: 0x3f6e8f, col: { torso: 0xe24a5c, upper: 0xe24a5c, thigh: 0x3d5f94, shin: 0x3d5f94, shoe: 0xf4f1ea } },
  { gender: 'm', hairStyle: 'curly', skin: 0x7d4a2c, beard: true, col: { torso: 0x2c6e49, upper: 0x2c6e49, fore: 0x2c6e49, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0x222222 } },
  { gender: 'f', elder: true, skin: 0xf1c9a5, col: { torso: 0x8a5a9e, upper: 0x8a5a9e, fore: 0x8a5a9e, thigh: 0x444a55, shin: 0x444a55, shoe: 0x5a3a24 } },
];
export function lineup() {
  const scene = new THREE.Scene(); stage(scene);
  const ps = PEOPLE.map((o, i) => { const p = Subject(o); p.position.set(-1.05 + i * 0.7, 0, 0); p.rotation.y = 0.15 - i * 0.1; scene.add(p); return p; });
  const c = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.05, 100);
  return { scene, camera: c, update(t) { ps.forEach((p, i) => { poseStand(p, t + i); p.userData.face({ open: 0.25, wide: 0.2 * i }); }); c.position.set(0, 1.25, 6.2); c.lookAt(0, 1.0, 0); } };
}
export function close(i) {
  const scene = new THREE.Scene(); stage(scene);
  const p = Subject(PEOPLE[i]); scene.add(p);
  const c = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.05, 100);
  return { scene, camera: c, update(t) { poseStand(p, t); p.userData.face({ open: 0.35, wide: 0.5, lookX: 0.3 }); p.userData.J.head.rotation.y = 0.35; p.userData.J.arm.R.a.rotation.set(-1.0, 0, 0.3); p.userData.J.arm.R.b.rotation.set(-1.2, 0, 0); c.position.set(0.25, 1.62, 1.6); c.lookAt(0, 1.55, 0); } };
}
