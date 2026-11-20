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
import { mat, room, ground, sky, studio, plant, table, chair, lamp, laptop, mug, flask, beaker, burger, pizzaSlice, car, building, bookshelf } from '../../engine/world.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const box = (w, h, d, m, p, r = 0.02) => { const b = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 4, r), m); b.position.set(...p); b.castShadow = b.receiveShadow = true; return b; };
export function interior() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x111318);
  room(scene, { w: 5, d: 5, h: 3, floor: 'wood', walls: 'plaster', wallColor: 0xcfc6b6, window: { x: -1.1, y: 1.7 } });
  const sh = bookshelf(); sh.position.set(1.6, 0, -2.3); scene.add(sh);
  const pl = plant(); pl.position.set(-2.0, 0, -2.0); scene.add(pl);
  const tb = table(); tb.position.set(0.9, 0, -1.2); scene.add(tb);
  const lp = laptop(); lp.position.set(0.8, 0.75, -1.2); lp.rotation.y = 0.3; scene.add(lp);
  const mg = mug({ color: 0xc8402e }); mg.position.set(1.15, 0.75, -1.05); scene.add(mg);
  const ch = chair(); ch.position.set(0.9, 0, -0.55); ch.rotation.y = Math.PI; scene.add(ch);
  const lm = lamp(); lm.position.set(-1.6, 0, -1.4); scene.add(lm);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), mat('carpet', { color: 0x7a3b3b, repeat: [2, 2] })); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.005, 0.2); rug.receiveShadow = true; scene.add(rug);
  const a = Subject(PEOPLE[0]), b = Subject(PEOPLE[1]); a.position.set(-0.35, 0, 0); b.position.set(0.4, 0, -0.3); a.rotation.y = 0.5; b.rotation.y = -0.5; scene.add(a, b);
  const c = new THREE.PerspectiveCamera(32, 1080 / 1920, 0.05, 100);
  return { scene, camera: c, update(t) { poseStand(a, t); poseStand(b, t + 1); a.userData.face({ open: 0.4, wide: 0.3, lookX: 0.5 }); b.userData.face({ open: 0.2, wide: 0.1, lookX: -0.5 }); c.position.set(0.3, 1.45, 3.3); c.lookAt(0, 1.15, -0.4); } };
}
export function street() {
  const scene = new THREE.Scene(); sky(scene, 'sunset', { shadowR: 8 }); ground(scene, 'asphalt', { size: 60 });
  const walk = box(60, 0.15, 2.5, mat('concrete', { color: 0xb8b4ac, repeat: [20, 1] }), [0, 0.075, -3]); scene.add(walk);
  [[0xa0533d, 'brick'], [0xd8cfc0, 'plaster'], [0x8a6a5a, 'brick'], [0x6f7f8f, 'concrete']].forEach(([c, w], i) => { const b = building({ color: c, wall: w, w: 4.2, h: 7 + (i % 2) * 3, seed: i + 2, lit: 0.45 }); b.position.set(-6.3 + i * 4.2, 0, -4.3); scene.add(b); });
  const cr = car({ color: 0x1f4fa8 }); cr.position.set(1.9, 0, -1.4); cr.rotation.y = 2.2; scene.add(cr);
  const p = Subject(PEOPLE[2]); p.position.set(0, 0, 0.5); scene.add(p);
  const c = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.05, 300);
  return { scene, camera: c, update(t) { poseStand(p, t); p.userData.face({ open: 0.3, wide: 0.6 }); c.position.set(0.6, 1.3, 4.2); c.lookAt(0, 1.3, -1); } };
}
export function product() {
  const scene = new THREE.Scene(); studio(scene, { color: 0x232a3a, rim: 0xffb27a });
  const ph = new THREE.Group(); scene.add(ph);
  ph.add(box(0.36, 0.74, 0.04, mat('metal', { color: 0x5a5e66 }), [0, 0, 0], 0.05));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.7), mat('screen')); scr.position.z = 0.021; ph.add(scr);
  ph.position.set(0, 0.6, 0); ph.rotation.set(-0.15, 0.5, 0.08);
  const bg = burger(); bg.scale.setScalar(2.2); bg.position.set(-0.5, 0, 0.35); scene.add(bg);
  const fl = flask({ liquid: 0xff4fa3 }); fl.scale.setScalar(1.6); fl.position.set(0.55, 0, 0.1); scene.add(fl);
  const pz = pizzaSlice(); pz.scale.setScalar(1.8); pz.position.set(0.1, 0, 0.7); pz.rotation.y = 0.6; scene.add(pz);
  const gl = new THREE.Mesh(new THREE.SphereGeometry(0.16, 48, 32), mat('glass')); gl.position.set(0.85, 0.16, 0.6); scene.add(gl);
  const c = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.05, 100);
  return { scene, camera: c, update(t) { ph.rotation.y = 0.5 + t * 0.3; c.position.set(0, 1.0, 3.8); c.lookAt(0, 0.4, 0); } };
}
export function carShow() {
  const scene = new THREE.Scene(); sky(scene, 'day', { shadowR: 6 }); ground(scene, 'asphalt', { size: 40 });
  const cr = car({ color: 0xb3202a }); cr.rotation.y = 0.7; scene.add(cr);
  const p = Subject({ gender: 'f', hairStyle: 'ponytail', seed: 5, col: { torso: 0xf2efe6, upper: 0xf2efe6, thigh: 0x2b2f3c, shin: 0x2b2f3c } }); p.position.set(-1.6, 0, 1.6); scene.add(p);
  const pl = plant(); pl.position.set(-2.6, 0, -1.5); scene.add(pl);
  const c = new THREE.PerspectiveCamera(32, 1080 / 1920, 0.05, 300);
  return { scene, camera: c, pro: { focus: 6 }, update(t) { poseStand(p, t); c.position.set(-3.5, 1.7, 10.5); c.lookAt(-0.6, 0.8, 0); } };
}
