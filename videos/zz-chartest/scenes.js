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
import { mat, room, ground, sky, studio } from '../../engine/world.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const box = (w, h, d, m, p, r = 0.02) => { const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m); b.position.set(...p); b.castShadow = b.receiveShadow = true; return b; };
export function interior() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x111318);
  room(scene, { w: 5, d: 5, h: 3, floor: 'wood', walls: 'plaster', wallColor: 0xcfc6b6, window: { x: -1.1, y: 1.7 } });
  const counter = new THREE.Group(); scene.add(counter);
  counter.add(box(2.2, 0.9, 0.6, mat('wood', { color: 0x8a6a4a, repeat: [2, 1] }), [0.9, 0.45, -2.15]));
  counter.add(box(2.3, 0.05, 0.65, mat('concrete', { color: 0xe8e4dc, roughness: 0.6, clearcoat: 0.6, clearcoatRoughness: 0.2 }), [0.9, 0.925, -2.15]));
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 0.1, 32), mat('ceramic', { color: 0xc8402e })); mug.position.set(0.5, 1.0, -2.05); mug.castShadow = true; scene.add(mug);
  const pot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 16), mat('metal')); pot.position.set(1.3, 1.05, -2.1); pot.castShadow = true; scene.add(pot);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), mat('carpet', { color: 0x7a3b3b, repeat: [2, 2] })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.005, 0.2); rug.receiveShadow = true; scene.add(rug);
  const a = Subject(PEOPLE[0]), b = Subject(PEOPLE[1]); a.position.set(-0.35, 0, 0); b.position.set(0.4, 0, -0.3); a.rotation.y = 0.5; b.rotation.y = -0.5; scene.add(a, b);
  const c = new THREE.PerspectiveCamera(32, 1080 / 1920, 0.05, 100);
  return { scene, camera: c, update(t) { poseStand(a, t); poseStand(b, t + 1); a.userData.face({ open: 0.4, wide: 0.3, lookX: 0.5 }); b.userData.face({ open: 0.2, wide: 0.1, lookX: -0.5 }); c.position.set(0.3, 1.45, 3.3); c.lookAt(0, 1.15, -0.4); } };
}
export function street() {
  const scene = new THREE.Scene(); sky(scene, 'sunset', { shadowR: 8 }); ground(scene, 'asphalt', { size: 60 });
  const walk = box(60, 0.15, 2.5, mat('concrete', { color: 0xb8b4ac, repeat: [20, 1] }), [0, 0.075, -3]); scene.add(walk);
  for (let i = -3; i <= 3; i++) { const bd = box(3.6, 6 + (i * 7 % 4), 3, mat('brick', { color: [0xa0533d, 0x8a6a5a, 0xb07a52][(i + 3) % 3], repeat: [2, 3] }), [i * 3.8, (6 + (i * 7 % 4)) / 2, -6], 0.01); scene.add(bd);
    for (let k = 0; k < 3; k++) { const w = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1), new THREE.MeshPhysicalMaterial({ color: 0x223040, roughness: 0.05, metalness: 0.2, emissive: k % 2 ? 0xffb060 : 0x000000, emissiveIntensity: 0.6 })); w.position.set(i * 3.8 - 1 + k, 3.5, -4.49); scene.add(w); } }
  const p = Subject(PEOPLE[2]); p.position.set(0, 0, 0.5); scene.add(p);
  const c = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.05, 300);
  return { scene, camera: c, update(t) { poseStand(p, t); p.userData.face({ open: 0.3, wide: 0.6 }); c.position.set(0.6, 1.3, 4.2); c.lookAt(0, 1.3, -1); } };
}
export function product() {
  const scene = new THREE.Scene(); studio(scene, { color: 0x232a3a, rim: 0xffb27a });
  const ph = new THREE.Group(); scene.add(ph);
  ph.add(box(0.36, 0.74, 0.04, mat('chrome'), [0, 0, 0], 0.05));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.7), mat('screen')); scr.position.z = 0.021; ph.add(scr);
  ph.position.set(0, 0.6, 0); ph.rotation.set(-0.15, 0.5, 0.08);
  const cube = box(0.3, 0.3, 0.3, mat('gold'), [-0.5, 0.15, 0.3], 0.03); scene.add(cube);
  const gl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 48, 32), mat('glass')); gl.position.set(0.5, 0.16, 0.4); scene.add(gl);
  const c = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.05, 100);
  return { scene, camera: c, update(t) { ph.rotation.y = 0.5 + t * 0.3; c.position.set(0, 0.9, 3.2); c.lookAt(0, 0.45, 0); } };
}
