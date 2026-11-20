import { THREE, RoundedBoxGeometry, W, H, clamp, lerp, ss, eio, eout, back, rnd, halo, addMat, setOpacity, shake, Subject, poseStand, fresnel } from '../../engine/engine.js';
import { mat, room, studio } from '../../engine/world.js';

// xr014 — EVERYDAY X-RAY: "Eighteen minutes. No food. But that's NOT why you're mad."
// The restaurant moment everyone knows: the couple who sat down after you gets their food first.
// Reveal: queue-psychology researcher Richard Larson (MIT) — being skipped ("slips and skips") hurts more than the wait;
// his own research started after he got skipped at a store pickup counter in 1976 (MIT News, 2008).
// Visual rules: generic restaurant (no brand, no logo), generic people only (no likeness of Larson or anyone real),
// invented phone timer UI. Render style "pro" (world.js sets + SubjectPro characters).
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 34) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 200);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.02, s = 4) => new RoundedBoxGeometry(w, h, d, s, r);
function mesh(geo, m, parent, p = [0, 0, 0], rot = null) { const o = new THREE.Mesh(geo, m); o.position.set(...p); if (rot) o.rotation.set(...rot); o.castShadow = o.receiveShadow = true; parent.add(o); return o; }
function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

// palette: warm evening bistro — terracotta walls, walnut, brass, mustard and teal clothes
const WALL = 0xb9785a, WAIN = 0x5b3b2a, BRASS = 0xd6a84f, RED = 0xff3b30, CYAN = 0x22d3ee;

// ---------------- people (generic, varied) ----------------
const HER = { gender: 'f', hairStyle: 'long', skin: 0x7d4a2c, hair: 0x1d1612, eyes: 0x3d2a1c, col: { torso: 0xd9a441, upper: 0xd9a441, fore: 0xd9a441, thigh: 0x2f3442, shin: 0x2f3442, shoe: 0x222222 } };
const MAN = { gender: 'm', hairStyle: 'side', skin: 0xf1c9a5, hair: 0x9a6a3a, eyes: 0x3f6e8f, col: { torso: 0x2c6e8a, upper: 0x2c6e8a, thigh: 0x3a3a40, shin: 0x3a3a40, shoe: 0x5a3a24 } };
const WOMAN = { gender: 'f', hairStyle: 'bob', skin: 0xe0ac86, hair: 0x2e2018, eyes: 0x5a3a22, col: { torso: 0xe24a5c, upper: 0xe24a5c, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0xf4f1ea } };
const WAITER = { gender: 'm', hairStyle: 'buzz', skin: 0xa86b45, hair: 0x1d1612, col: { torso: 0xf4f1ea, upper: 0xf4f1ea, thigh: 0x1d1d22, shin: 0x1d1d22, shoe: 0x111111 } };

// seated at a table, forearms resting on it (chair seat y = 0.47)
function sit(g, t, o = {}) {
  const J = g.userData.J; poseStand(g, t);
  J.hips.position.y = 0.57; J.leg.L.l.rotation.set(-1.5, 0, -0.08); J.leg.R.l.rotation.set(-1.5, 0, 0.08); J.leg.L.kn.rotation.x = 1.5; J.leg.R.kn.rotation.x = 1.5;
  const ph = o.ph || 0;
  J.chest.rotation.set(0.12 + (o.lean || 0), o.chestTurn || 0, 0);
  J.head.rotation.set((o.nod || 0.05) + 0.03 * Math.sin(t * 1.3 + ph), (o.turn || 0) + 0.05 * Math.sin(t * 0.9 + ph), o.tilt || 0);
  J.arm.L.a.rotation.set(-0.8, 0, -0.18); J.arm.R.a.rotation.set(-0.8, 0, 0.18); J.arm.L.b.rotation.set(-0.85, 0, 0.35); J.arm.R.b.rotation.set(-0.85, 0, -0.35);
  if (o.hold) { J.arm.L.a.rotation.set(-0.3, 0, -0.3); J.arm.R.a.rotation.set(-0.3, 0, 0.3); J.arm.L.b.rotation.set(-1.25, 0, 0.2); J.arm.R.b.rotation.set(-1.25, 0, -0.2); }
  if (o.eat) { const k = Math.max(0, Math.sin(t * 3.2 + ph)); J.arm.R.a.rotation.set(-0.3 - 0.35 * k, 0, 0.3); J.arm.R.b.rotation.set(-1.25 - 0.7 * k, 0, -0.25); J.head.rotation.x += 0.08 * k; }
  if (o.drum) { J.arm.R.b.rotation.x = -0.85 + 0.06 * Math.max(0, Math.sin(t * 14)); }
}

// ---------------- props ----------------
const M_WOOD = () => mat('wood', { color: 0x7a4a2e, repeat: [1, 1] });
function Table(w = 0.9, d = 0.8) {
  const g = new THREE.Group();
  mesh(RB(w, 0.05, d, 0.015), M_WOOD(), g, [0, 0.755, 0]);
  const legM = mat('metal', { color: 0x2a2a2e, roughness: 0.5 });
  mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.72, 16), legM, g, [0, 0.37, 0]);
  mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.03, 32), legM, g, [0, 0.015, 0]);
  return g;
}
function Chair(back = 1) {
  const g = new THREE.Group(); const wm = mat('wood', { color: 0x4a2c1c });
  mesh(RB(0.44, 0.04, 0.42, 0.012), wm, g, [0, 0.45, 0]);
  for (const [x, z] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) mesh(new THREE.CylinderGeometry(0.018, 0.016, 0.45, 10), wm, g, [x, 0.225, z]);
  if (back) { for (const x of [-0.19, 0.19]) mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.5, 10), wm, g, [x, 0.7, -0.19]); mesh(RB(0.44, 0.14, 0.03, 0.012), wm, g, [0, 0.88, -0.19]); }
  return g;
}
function Plate(food = 0) {
  const g = new THREE.Group();
  mesh(new THREE.CylinderGeometry(0.13, 0.09, 0.02, 40), mat('ceramic', { color: 0xd6d1c8 }), g, [0, 0.01, 0]);
  const steam = [];
  if (food === 1) { // burger + fries
    const bun = mat('plastic', { color: 0xc8812f, roughness: 0.7 });
    mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.02, 24), bun, g, [-0.02, 0.03, 0]);
    mesh(new THREE.CylinderGeometry(0.064, 0.064, 0.022, 24), mat('plastic', { color: 0x4a2414, roughness: 0.9 }), g, [-0.02, 0.051, 0]);
    mesh(new THREE.CylinderGeometry(0.068, 0.066, 0.008, 24), mat('plastic', { color: 0x6aa83a, roughness: 0.8 }), g, [-0.02, 0.066, 0]);
    mesh(new THREE.CylinderGeometry(0.066, 0.066, 0.006, 4), mat('plastic', { color: 0xf2b630, roughness: 0.6 }), g, [-0.02, 0.072, 0], [0, 0.4, 0]);
    mesh(new THREE.SphereGeometry(0.062, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), bun, g, [-0.02, 0.075, 0], null).scale.set(1, 0.7, 1);
    const fry = mat('plastic', { color: 0xf0c050, roughness: 0.7 }), r = rnd(4);
    for (let i = 0; i < 9; i++) mesh(new THREE.BoxGeometry(0.012, 0.012, 0.075), fry, g, [0.065 + r() * 0.03, 0.03 + r() * 0.012, -0.03 + r() * 0.06], [0.1, r() * 1.2, 0.1]);
  } else if (food === 2) { // pasta
    const pm = mat('plastic', { color: 0xf0d48a, roughness: 0.75 }), sauce = mat('plastic', { color: 0xb8321e, roughness: 0.55 }), r = rnd(9);
    for (let i = 0; i < 9; i++) mesh(new THREE.TorusGeometry(0.03 + r() * 0.03, 0.006, 6, 24), pm, g, [(r() - 0.5) * 0.05, 0.03 + i * 0.004, (r() - 0.5) * 0.05], [Math.PI / 2 + (r() - 0.5) * 0.6, 0, r() * 3]);
    mesh(new THREE.SphereGeometry(0.04, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), sauce, g, [0, 0.055, 0]).scale.set(1, 0.45, 1);
    mesh(new THREE.SphereGeometry(0.014, 12, 8), mat('plastic', { color: 0x3b7a2a }), g, [0.01, 0.07, 0.01]);
  }
  if (food) for (let i = 0; i < 4; i++) { const s = halo(0xffffff, 0.06, 0.16); s.userData.ph = i * 0.37; g.add(s); steam.push(s); }
  g.userData.steam = t => steam.forEach((s, i) => { const y = (t * 0.35 + s.userData.ph) % 0.32; s.position.set(0.02 * Math.sin(t * 2 + i), 0.08 + y, 0.01 * Math.cos(t * 3 + i)); s.material.opacity = 0.16 * (1 - y / 0.32); });
  return g;
}
const GLASS_M = new THREE.MeshPhysicalMaterial({ color: 0xe8f4ff, roughness: 0.05, metalness: 0, clearcoat: 1, transparent: true, opacity: 0.28, side: THREE.DoubleSide, depthWrite: false });
const WATER_M = new THREE.MeshPhysicalMaterial({ color: 0xbfe0f5, roughness: 0.1, transparent: true, opacity: 0.35, depthWrite: false });
function Glass() { const g = new THREE.Group(); const a = mesh(new THREE.CylinderGeometry(0.035, 0.03, 0.12, 32, 1, true), GLASS_M, g, [0, 0.06, 0]); a.castShadow = false;
  const b = mesh(new THREE.CylinderGeometry(0.031, 0.028, 0.08, 24), WATER_M, g, [0, 0.042, 0]); b.castShadow = false; return g; }
function Cutlery(g, x, z) { const cm = mat('chrome'); mesh(new THREE.BoxGeometry(0.012, 0.004, 0.17), cm, g, [x, 0.782, z]); mesh(new THREE.BoxGeometry(0.014, 0.004, 0.18), cm, g, [x + 0.03, 0.782, z]);
  mesh(new THREE.PlaneGeometry(0.1, 0.2), mat('fabric', { color: 0xf2efe8 }), g, [x + 0.015, 0.7805, z], [-Math.PI / 2, 0, 0]); }
// phone lying on the table with an invented timer screen
function Phone() {
  const g = new THREE.Group();
  mesh(RB(0.075, 0.008, 0.15, 0.006), mat('metal', { color: 0x1c1c20 }), g, [0, 0.004, 0]);
  const tx = canvasTex(300, 600, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#16213a'); gr.addColorStop(1, '#0b0f1c'); x.fillStyle = gr; x.fillRect(0, 0, w, h);
    x.textAlign = 'center'; x.fillStyle = '#9fb3d9'; x.font = '600 34px Inter, sans-serif'; x.fillText('WAITING', w / 2, 170);
    x.fillStyle = '#ffffff'; x.font = '800 104px Inter, sans-serif'; x.fillText('18:00', w / 2, 300);
    x.strokeStyle = '#ff3b30'; x.lineWidth = 10; x.beginPath(); x.arc(w / 2, 420, 60, -Math.PI / 2, Math.PI * 1.3); x.stroke(); });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.068, 0.142), new THREE.MeshBasicMaterial({ map: tx, toneMapped: false })); scr.rotation.x = -Math.PI / 2; scr.position.y = 0.0085; g.add(scr);
  return g;
}
function Pendant(scene, x, z, y = 2.15, I = 0) {
  const g = new THREE.Group(); g.position.set(x, y, z); scene.add(g);
  mesh(new THREE.CylinderGeometry(0.005, 0.005, 1.2, 6), mat('metal', { color: 0x111111 }), g, [0, 0.6, 0]);
  const sh = mesh(new THREE.ConeGeometry(0.17, 0.2, 32, 1, true), mat('gold', { color: BRASS, side: THREE.DoubleSide }), g, [0, 0, 0]); sh.castShadow = false;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff1c8 })); bulb.position.y = -0.09; g.add(bulb);
  const hl = halo(0xffd48a, 0.9, 0.35); hl.position.y = -0.1; g.add(hl);
  if (I) { const pl = new THREE.PointLight(0xffd7a0, I, 6, 2); pl.position.y = -0.15; pl.userData.proScaled = true; g.add(pl); }
  return g;
}
function Frame(scene, x, y, z, w, h, seed, ry = 0) {
  const tx = canvasTex(256, 320, (c, W2, H2) => { const r = rnd(seed); c.fillStyle = '#efe6d4'; c.fillRect(0, 0, W2, H2);
    for (let i = 0; i < 5; i++) { c.fillStyle = ['#c0573e', '#2c6e8a', '#d9a441', '#3b5a3a', '#7a4a2e'][(i + seed) % 5]; c.globalAlpha = 0.85; c.beginPath(); c.arc(40 + r() * 180, 40 + r() * 240, 30 + r() * 60, 0, 7); c.fill(); } });
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; scene.add(g);
  mesh(RB(w + 0.06, h + 0.06, 0.03, 0.01), mat('wood', { color: 0x2a1a12 }), g, [0, 0, 0]);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.8 })); p.position.z = 0.017; g.add(p); return g;
}
function Plant(scene, x, z) {
  const pot = mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.36, 24), mat('ceramic', { color: 0x2f3a33 }), scene, [x, 0.18, z]);
  const lm = mat('plastic', { color: 0x3f7a3a, roughness: 0.7 }), r = rnd(12);
  for (let i = 0; i < 14; i++) { const l = mesh(new THREE.SphereGeometry(0.12, 12, 8), lm, scene, [x + (r() - 0.5) * 0.35, 0.55 + r() * 0.55, z + (r() - 0.5) * 0.3]); l.scale.set(0.5, 1.2, 0.18); l.rotation.set(r() * 0.6, r() * 3, (r() - 0.5) * 1.2); }
  return pot;
}

// the bistro: her table (center, she faces +z) and the couple's table ahead of her (z = +2.25)
function bistro(o = {}) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a110c);
  room(scene, { w: 7, d: 9, h: 3.2, floor: 'wood', floorColor: 0x8a5a3a, walls: 'plaster', wallColor: WALL, ceilingLight: false });
  // night window on the back wall (no light: a pane + frame only)
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.4), new THREE.MeshBasicMaterial({ color: 0x23335c })); pane.position.set(-2.0, 1.7, -4.49); scene.add(pane);
  mesh(RB(1.7, 1.5, 0.04, 0.01), mat('wood', { color: 0x2a1a12 }), scene, [-2.0, 1.7, -4.51]);
  // warm room fill (no shadow) + one soft key with shadows from above the tables
  const fill = new THREE.HemisphereLight(0xffe0bf, 0x3a2418, 0.9); fill.userData.proScaled = true; scene.add(fill);
  const key = new THREE.DirectionalLight(0xffe2bd, 1.6); key.position.set(-1.5, 4.5, 1.5); key.target.position.set(0.3, 0, 1.0); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  { const sc = key.shadow.camera; sc.left = sc.bottom = -3.5; sc.right = sc.top = 3.5; sc.far = 12; } key.shadow.radius = 4; key.shadow.blurSamples = 8; key.userData.proScaled = true; scene.add(key, key.target);
  // wainscoting on the back and side walls
  const wm = mat('wood', { color: WAIN, repeat: [6, 1] });
  mesh(new THREE.BoxGeometry(7, 1.0, 0.04), wm, scene, [0, 0.5, -4.47]);
  for (const s of [-1, 1]) mesh(new THREE.BoxGeometry(0.04, 1.0, 9), wm, scene, [s * 3.47, 0.5, 0]);
  // a back wall behind the couple too (the room is open toward +z): close it with a wall at z = +4.5
  const fw = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.2), mat('plaster', { color: WALL, repeat: [3, 2] })); fw.position.set(0, 1.6, 4.5); fw.rotation.y = Math.PI; fw.receiveShadow = true; scene.add(fw);
  mesh(new THREE.BoxGeometry(7, 1.0, 0.04), wm, scene, [0, 0.5, 4.47]);
  Frame(scene, 1.3, 1.75, 4.44, 0.55, 0.7, 2, Math.PI); Frame(scene, -0.4, 1.8, 4.44, 0.45, 0.55, 5, Math.PI);
  Frame(scene, 0.6, 1.8, -4.44, 0.6, 0.75, 7); Frame(scene, -0.6, 1.7, -4.44, 0.4, 0.5, 3);
  Plant(scene, 2.6, 3.6); Plant(scene, -2.7, -3.8);
  // her table
  const t1 = Table(); scene.add(t1);
  const c1 = Chair(); c1.position.set(0, 0, -0.62); scene.add(c1);
  const c1b = Chair(); c1b.position.set(0, 0, 0.62); c1b.rotation.y = Math.PI; if (o.frontChair !== false) scene.add(c1b);
  const empty = Plate(0); empty.position.set(0.0, 0.78, -0.1); scene.add(empty);
  Cutlery(scene, -0.25, -0.12); const gl = Glass(); gl.position.set(0.24, 0.78, -0.22); scene.add(gl);
  const phone = Phone(); phone.position.set(0.18, 0.78, 0.12); phone.rotation.y = -0.35; scene.add(phone);
  const her = Subject(HER); her.position.set(0, 0, -0.6); scene.add(her);
  // the couple's table, ahead of her and a little to her left (+x)
  const t2 = Table(1.0, 0.8); t2.position.set(0.55, 0, 2.25); scene.add(t2);
  for (const [x, ry] of [[0.0, Math.PI / 2], [1.1, -Math.PI / 2]]) { const ch = Chair(); ch.position.set(x - 0.05 * Math.sign(x - 0.55), 0, 2.25); ch.rotation.y = ry; scene.add(ch); }
  const man = Subject(MAN); man.position.set(0.02, 0, 2.25); man.rotation.y = Math.PI / 2; scene.add(man);
  const wom = Subject(WOMAN); wom.position.set(1.08, 0, 2.25); wom.rotation.y = -Math.PI / 2; scene.add(wom);
  const gl2 = Glass(); gl2.position.set(0.55, 0.78, 2.5); scene.add(gl2);
  const waiter = Subject(WAITER); scene.add(waiter);
  const apron = mesh(RB(0.36, 0.5, 0.03, 0.02), mat('fabric', { color: 0x1d1d22 }), waiter.userData.J.hips, [0, -0.15, 0.16]);
  const plates = [Plate(1), Plate(2)]; plates.forEach(p => scene.add(p));
  const P1 = Pendant(scene, 0.0, 0.0, 2.2, 2.2), P2 = Pendant(scene, 0.55, 2.25, 2.55, 1.6);
  Pendant(scene, -2.2, -2.5); Pendant(scene, 2.3, -2.0);
  // background tables (empty, just set) for depth
  for (const [x, z] of [[-2.0, -2.4], [2.2, -2.2], [-2.1, 2.6]]) { const tb = Table(0.8, 0.8); tb.position.set(x, 0, z); scene.add(tb); const ch = Chair(); ch.position.set(x, 0, z - 0.6); scene.add(ch); const g2 = Glass(); g2.position.set(x + 0.15, 0.78, z); scene.add(g2); }
  // couple food: on the table (served) or in the waiter's hands
  const served = (k, t) => {   // k: 0 = in waiter's hands far away, 1 = on the table
    const a = clamp(k);
    const wx = lerp(2.6, 0.55, eout(clamp(a * 1.6))), wz = 2.95;
    waiter.position.set(wx, 0, wz); waiter.rotation.y = Math.PI;
    poseStand(waiter, t); const J = waiter.userData.J; const reach = ss(0.55, 1.0, a);
    J.arm.L.a.rotation.set(-1.0 - 0.35 * reach, 0, -0.25); J.arm.R.a.rotation.set(-1.0 - 0.35 * reach, 0, 0.25); J.arm.L.b.rotation.set(-0.5 + 0.3 * reach, 0, 0); J.arm.R.b.rotation.set(-0.5 + 0.3 * reach, 0, 0);
    J.chest.rotation.x = 0.25 * reach; J.head.rotation.x = 0.2 * reach;
    waiter.userData.face({ open: 0.25, wide: 0.1, lookY: -0.4 });
    const walk = a < 0.62 ? Math.sin(t * 9) : 0; J.leg.L.l.rotation.x = 0.3 * walk; J.leg.R.l.rotation.x = -0.3 * walk; waiter.position.y = 0.015 * Math.abs(walk);
    const hand = [V(0, 0, 0), V(0, 0, 0)]; waiter.updateMatrixWorld(true); J.arm.R.hand.getWorldPosition(hand[0]); J.arm.L.hand.getWorldPosition(hand[1]);
    const dest = [V(0.3, 0.78, 2.12), V(0.8, 0.78, 2.38)];
    plates.forEach((p, i) => { const k2 = ss(0.78, 1.0, a); p.position.copy(mix(hand[i].clone().add(V(0, 0.02, -0.05)), dest[i], k2)); });
  };
  return { scene, her, man, wom, waiter, plates, served, phone, P1, P2 };
}

// =============== s01 / s02 / s08 / s10: her, close — 18 minutes, empty plate ===============
// mode 'hook' (frame 0), 'not' (push-in, eyes slide to the side), 'strike', 'end' (loop back to the hook framing)
export function waiting(mode = 'hook', tLook = 0.4, tStrike = 0) {
  const B = bistro(); const { scene, her } = B;
  B.served(1, 0); B.plates.forEach(p => p.visible = mode !== 'hook');   // in the hook their food is not there yet (off-screen anyway)
  const c = cam(mode === 'not' ? 30 : mode === 'strike' ? 32 : 38);
  const shots = {
    hook: [V(0.36, 1.5, 1.6), V(0.28, 1.47, 1.32), V(0.0, 1.17, -0.45)],
    not: [V(0.2, 1.46, 0.98), V(0.14, 1.44, 0.8), V(0.0, 1.3, -0.5)],
    strike: [V(-0.32, 1.47, 1.28), V(-0.24, 1.45, 1.06), V(0.05, 1.24, -0.45)],
    end: [V(0.22, 1.45, 1.0), V(0.36, 1.5, 1.6), V(0.0, 1.17, -0.45)],
  }[mode];
  return {
    scene, camera: c,
    update(t, d) {
      const side = mode === 'hook' ? 0 : mode === 'not' ? ss(tLook, tLook + 0.3, t) : mode === 'strike' ? 1 : 0.4 + 0.6 * ss(0.3, 1.0, t) * (1 - ss(d - 0.9, d - 0.3, t));
      sit(her, t, { lean: 0.08, turn: 0.28 * side, chestTurn: 0.08 * side, tilt: mode === 'end' ? 0.08 * Math.sin(t * 1.2) : 0.04, drum: mode === 'hook', ph: 0.4 });
      // annoyed: narrowed eyes, tight mouth; glances at the couple (+x, ahead of her)
      her.userData.face({ open: mode === 'end' ? 0.12 + 0.18 * Math.max(0, Math.sin(t * 5)) * ss(0.5, 1, t) : 0.08, wide: mode === 'not' ? 0.25 * side : 0, closed: mode === 'strike' ? 0.4 : 0.32, lookX: 0.35 + 0.65 * side, lookY: mode === 'hook' ? -0.35 + 0.4 * ss(0.6, 1.0, t) : 0 });
      B.plates.forEach(p => p.userData.steam(t));
      look(c, mix(shots[0], shots[1], eio(clamp(t / d))), shots[2]);
      if (mode === 'not') shake(c, t, tLook, 0.012, 0.25);
    },
    ui: (t) => ({ vig: 0.22, strike: tStrike ? eout(clamp((t - tStrike) / 0.25)) : 0 }),
  };
}
// =============== s03 / s09: over her shoulder — the couple who came later gets served ===============
export function couple(mode = 'served', tServe = 2.0) {
  const B = bistro({ frontChair: false }); const { scene, her, man, wom } = B;
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      const a = mode === 'served' ? clamp((t - (tServe - 1.6)) / 1.6) : 1;
      B.served(a, t);
      if (mode !== 'served') B.waiter.position.set(5, 0, 5);   // waiter gone, they are eating
      B.plates.forEach(p => p.userData.steam(t));
      sit(her, t, { lean: 0.05, turn: 0.18, ph: 0.4 });
      her.userData.face({ open: 0.08, closed: 0.3, lookX: 0.4 });
      const eating = mode !== 'served' || a >= 1;
      sit(man, t, { turn: 0.15, hold: true, eat: eating, ph: 0 }); sit(wom, t, { turn: -0.1, hold: true, eat: eating, ph: 1.6 });
      man.userData.face({ open: eating ? 0.35 + 0.3 * Math.max(0, Math.sin(t * 3.2)) : 0.4, wide: 0.15, lookX: 0.1 }); wom.userData.face({ open: eating ? 0.5 : 0.35, wide: 0.25, lookX: -0.1 });
      if (mode === 'served') look(c, mix(V(0.24, 1.56, -1.6), V(0.22, 1.53, -1.3), eio(clamp(t / d))), V(0.56, 1.2, 2.25));
      else look(c, mix(V(-0.5, 1.5, -1.05), V(-0.42, 1.47, -0.8), eio(clamp(t / d))), V(0.55, 1.24, 2.25));
    },
    ui: () => ({ vig: 0.22 }),
  };
}

// =============== s04 / s05 / s06: the queue lab — a line of people on a studio floor ===============
const LINE = [
  { gender: 'f', hairStyle: 'ponytail', skin: 0xf1c9a5, hair: 0xc9a36a, col: { torso: 0x3a86ff, upper: 0x3a86ff, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0xf4f1ea } },
  { gender: 'm', hairStyle: 'curly', skin: 0x5a341f, beard: true, col: { torso: 0x2c6e49, upper: 0x2c6e49, fore: 0x2c6e49, thigh: 0x3d3d44, shin: 0x3d3d44, shoe: 0x222222 } },
  { gender: 'f', hairStyle: 'bun', skin: 0xc68a62, hair: 0x2a2a2e, col: { torso: 0x8a5a9e, upper: 0x8a5a9e, thigh: 0x3d5f94, shin: 0x3d5f94, shoe: 0x5a3a24 } },
  { gender: 'm', hairStyle: 'short', skin: 0xe0ac86, hair: 0x4a3020, col: { torso: 0xd9a441, upper: 0xd9a441, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0xf4f1ea } },   // our guy (index 3)
  { gender: 'f', hairStyle: 'long', skin: 0xa86b45, hair: 0x1d1612, col: { torso: 0xe24a5c, upper: 0xe24a5c, thigh: 0x2f3442, shin: 0x2f3442, shoe: 0x222222 } },
  { gender: 'm', hairStyle: 'buzz', skin: 0xf1c9a5, hair: 0x6b4428, col: { torso: 0x5f6b7a, upper: 0x5f6b7a, fore: 0x5f6b7a, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0xf4f1ea } },
];
const CUTTER = { gender: 'm', hairStyle: 'side', skin: 0xc68a62, hair: 0x2e2018, col: { torso: 0x111111, upper: 0x111111, thigh: 0x6b5a45, shin: 0x6b5a45, shoe: 0xf4f1ea } };
function Stanchion(scene, x, z) { const g = new THREE.Group(); g.position.set(x, 0, z); scene.add(g); const ch = mat('chrome');
  mesh(new THREE.CylinderGeometry(0.15, 0.17, 0.03, 32), ch, g, [0, 0.015, 0]); mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.95, 16), ch, g, [0, 0.49, 0]); mesh(new THREE.SphereGeometry(0.035, 16, 12), ch, g, [0, 0.98, 0]); return g; }
function Rope(scene, a, b) { const curve = new THREE.QuadraticBezierCurve3(V(a[0], 0.93, a[1]), V((a[0] + b[0]) / 2, 0.8, (a[1] + b[1]) / 2), V(b[0], 0.93, b[1]));
  return mesh(new THREE.TubeGeometry(curve, 24, 0.018, 8), mat('fabric', { color: 0x9e1b2c }), scene); }
// people stand along x (facing -x, toward the counter at the left); z = 0
export function queue(mode = 'wide', tSkip = 1.0, tMad = 2.0) {
  const scene = new THREE.Scene(); studio(scene, { color: 0x24324a, rim: 0xffb27a, key: 2.4 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 6), mat('concrete', { color: 0x8b8f96, repeat: [5, 2], roughness: 0.6, clearcoat: 0.3, clearcoatRoughness: 0.4 })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.002; floor.receiveShadow = true; scene.add(floor);
  // counter at the far left with a "NEXT" light
  const counter = new THREE.Group(); counter.position.set(-3.1, 0, 0); scene.add(counter);
  mesh(RB(0.7, 1.05, 1.6, 0.03), mat('wood', { color: 0x6b4a32, repeat: [1, 2] }), counter, [0, 0.525, 0]);
  mesh(RB(0.8, 0.05, 1.7, 0.02), mat('concrete', { color: 0xe8e4dc, clearcoat: 0.6 }), counter, [0, 1.07, 0]);
  const nextTx = canvasTex(256, 96, (x, w, h) => { x.fillStyle = '#0b0f14'; x.fillRect(0, 0, w, h); x.fillStyle = '#4dff88'; x.font = '900 70px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NEXT', w / 2, h / 2 + 4); });
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.225), new THREE.MeshBasicMaterial({ map: nextTx, toneMapped: false })); sign.position.set(-2.95, 1.75, 0); sign.rotation.y = Math.PI / 2; scene.add(sign);
  const posts = []; for (let i = 0; i < 6; i++) for (const z of [-0.42, 0.42]) posts.push(Stanchion(scene, -2.4 + i * 0.9, z));
  for (let i = 0; i < 5; i++) for (const z of [-0.42, 0.42]) if (!(i === 2 && z > 0)) Rope(scene, [-2.4 + i * 0.9, z], [-1.5 + i * 0.9, z]);
  const ppl = LINE.map((o, i) => { const p = Subject(o); p.position.set(-2.2 + i * 0.75, 0, 0); p.rotation.y = -Math.PI / 2; scene.add(p); return p; });
  const guy = ppl[3];
  const watch = mesh(RB(0.045, 0.012, 0.04, 0.005), mat('metal', { color: 0x222226 }), guy.userData.J.arm.L.hand, [0, 0.02, 0]);
  // the cutter slides in from the front (+z) between person 2 and our guy
  const cut = Subject(CUTTER); scene.add(cut);
  // x-ray double of our guy (anger reveal): cyan body + a red-hot glow in the head
  const xr = Subject({ xray: true }); xr.scale.setScalar(0.97); xr.rotation.y = -Math.PI / 2; scene.add(xr); xr.visible = false;
  const hot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 24, 16), addMat(RED, 0.95)); xr.userData.J.head.add(hot); hot.position.set(0, 0.03, 0.0);
  const hotH = halo(RED, 0.9, 0.85); xr.userData.J.head.add(hotH);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.03), addMat(CYAN, 0.9)); scan.rotation.y = 0; scene.add(scan); scan.visible = false;
  const c = cam(mode === 'wide' ? 36 : 30);
  return {
    scene, camera: c,
    update(t, d) {
      ppl.forEach((p, i) => { poseStand(p, t + i * 0.9); p.userData.face({ open: 0.12, wide: 0.05, closed: 0.15, lookX: 0.1 * Math.sin(t + i) }); p.userData.J.head.rotation.y = 0.15 * Math.sin(t * 0.6 + i * 1.3); });
      // the line shuffles forward a little in the wide shot
      if (mode === 'wide') ppl.forEach((p, i) => { p.position.x = -2.2 + i * 0.75 - 0.25 * eio(clamp(t / d)); });
      const J = guy.userData.J;
      if (mode === 'watch') {   // our guy checks his watch and sighs
        const k = ss(0.15, 0.55, t); J.arm.L.a.rotation.set(-1.25 * k, 0, -0.16 - 0.35 * k); J.arm.L.b.rotation.set(-1.6 * k, 0.6 * k, 0); J.head.rotation.set(0.45 * k, 0.25 * k, 0);
        guy.userData.face({ open: 0.1 + 0.35 * ss(1.0, 1.3, t) * (1 - ss(1.6, 2.0, t)), closed: 0.35, lookY: -0.6 * k, lookX: 0.4 * k });
        J.chest.rotation.x = -0.06 * ss(1.0, 1.3, t) * (1 - ss(1.6, 2.0, t));
      }
      let mad = 0;
      if (mode === 'skip') {
        const k = eio(clamp((t - tSkip + 0.9) / 0.9));       // cutter walks in
        cut.position.set(-0.33, 0, lerp(1.6, 0.0, k)); cut.rotation.y = lerp(Math.PI, -Math.PI / 2, ss(0.6, 1, k));
        poseStand(cut, t); const w = k < 1 ? Math.sin(t * 10) : 0; cut.userData.J.leg.L.l.rotation.x = 0.35 * w; cut.userData.J.leg.R.l.rotation.x = -0.35 * w;
        cut.userData.face({ open: 0.2, wide: 0.1, lookX: -0.4 });
        mad = ss(tMad - 0.2, tMad + 0.15, t);
        J.head.rotation.set(-0.05, -0.35 * ss(tSkip - 0.3, tSkip + 0.2, t), 0);
        J.arm.L.a.rotation.set(0, 0, -0.16 - 0.25 * mad); J.arm.R.a.rotation.set(0, 0, 0.16 + 0.25 * mad);
        guy.userData.face({ open: 0.15 + 0.45 * ss(tSkip, tSkip + 0.3, t), wide: 0.7 * ss(tSkip, tSkip + 0.3, t), lookX: -0.6 });
        // x-ray reveal at "furious"
        const sw = clamp((t - tMad + 0.25) / 0.35); scan.visible = sw > 0 && sw < 1; scan.position.set(guy.position.x, 2.0 - 2.0 * sw, 0.35);
        const on = t > tMad; xr.visible = on; guy.visible = !on;
        if (on) { xr.position.copy(guy.position); poseStand(xr, t); xr.userData.J.head.rotation.copy(J.head.rotation); xr.userData.J.arm.L.a.rotation.copy(J.arm.L.a.rotation); xr.userData.J.arm.R.a.rotation.copy(J.arm.R.a.rotation);
          const p = 1 + 0.18 * Math.sin(t * 16); hot.scale.setScalar(p); hotH.material.opacity = 0.6 + 0.3 * Math.sin(t * 16); }
      } else { cut.position.set(9, 0, 9); }
      const views = {
        wide: [V(-1.9, 2.5, 4.0), V(-1.5, 2.3, 3.6), V(0.0, 1.05, 0)],
        watch: [V(-0.62, 1.66, 1.32), V(-0.52, 1.64, 1.12), V(0.05, 1.52, 0)],
        skip: [V(-1.15, 1.66, 2.55), V(-0.95, 1.62, 2.2), V(-0.1, 1.42, 0)],
      }[mode];
      look(c, mix(views[0], views[1], eio(clamp(t / d))), views[2]);
      if (mode === 'skip') shake(c, t, tMad, 0.03, 0.3);
    },
    ui: (t) => ({ vig: 0.25, flash: mode === 'skip' ? 0.55 * clamp(1 - Math.abs(t - tMad) / 0.12) : 0 }),
  };
}

// =============== s07: 1976 — a store pickup counter; a man gets skipped while a kid's bike goes to someone else ===============
export function counter1976() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1b140e);
  room(scene, { w: 6, d: 6, h: 3, floor: 'tile', floorColor: 0xcfc3a8, walls: 'plaster', wallColor: 0x9a8a6a, light: 5, lightColor: 0xffe2b0 });
  // pickup counter across the room
  const ctr = new THREE.Group(); ctr.position.set(0, 0, -1.2); scene.add(ctr);
  mesh(RB(3.2, 1.0, 0.6, 0.02), mat('wood', { color: 0x6b4a32, repeat: [3, 1] }), ctr, [0, 0.5, 0]);
  mesh(RB(3.3, 0.05, 0.7, 0.02), mat('plastic', { color: 0xd8c9a0 }), ctr, [0, 1.025, 0]);
  const tx = canvasTex(512, 128, (x, w, h) => { x.fillStyle = '#7a2a1c'; x.fillRect(0, 0, w, h); x.fillStyle = '#f3e3b8'; x.font = '900 80px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PICK-UP', w / 2, h / 2 + 4); });
  // shelves of boxes behind the counter
  for (let i = 0; i < 3; i++) { mesh(RB(3.4, 0.04, 0.4, 0.01), mat('wood', { color: 0x5a3a24 }), scene, [0, 0.7 + i * 0.6, -2.75]);
    const r = rnd(20 + i); for (let k = 0; k < 7; k++) { const bw = 0.25 + r() * 0.2, bh = 0.2 + r() * 0.25; mesh(RB(bw, bh, 0.3, 0.01), mat('paper', { color: [0xc9a46a, 0xb8875a, 0xd8c08a][k % 3] }), scene, [-1.5 + k * 0.48, 0.72 + i * 0.6 + bh / 2, -2.75]); } }
  // the kid's bike, lifted over the counter toward the OTHER customer
  const bike = new THREE.Group(); scene.add(bike); const red = mat('plastic', { color: 0xd7263d, roughness: 0.35, clearcoat: 0.8 }), tyre = mat('rubber'), ch = mat('chrome');
  for (const x of [-0.32, 0.32]) { mesh(new THREE.TorusGeometry(0.2, 0.025, 12, 40), tyre, bike, [x, 0, 0]); mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 12), ch, bike, [x, 0, 0], [Math.PI / 2, 0, 0]); }
  const bar = (a, b, r = 0.018) => { const A = V(...a), Bv = V(...b), L = A.distanceTo(Bv); const m = mesh(new THREE.CylinderGeometry(r, r, L, 10), red, bike); m.position.copy(A.clone().add(Bv).multiplyScalar(0.5)); m.quaternion.setFromUnitVectors(V(0, 1, 0), Bv.clone().sub(A).normalize()); };
  bar([-0.32, 0, 0], [-0.02, 0.0, 0]); bar([-0.32, 0, 0], [-0.1, 0.25, 0]); bar([-0.1, 0.25, 0], [0.22, 0.27, 0]); bar([-0.02, 0, 0], [0.22, 0.27, 0]); bar([-0.02, 0, 0], [-0.1, 0.25, 0]); bar([0.32, 0, 0], [0.22, 0.27, 0]);
  bar([0.22, 0.27, 0], [0.2, 0.4, 0], 0.014); mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.34, 10), ch, bike, [0.2, 0.4, 0], [Math.PI / 2, 0, 0]);
  mesh(RB(0.16, 0.035, 0.07, 0.015), mat('leather', { color: 0x1c1c1e }), bike, [-0.1, 0.28, 0]);
  const clerk = Subject({ gender: 'f', hairStyle: 'bob', skin: 0xe0ac86, hair: 0x6b4428, col: { torso: 0x2f5d8a, upper: 0x2f5d8a, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0x222222 } }); clerk.position.set(-0.35, 0, -1.75); scene.add(clerk);
  const other = Subject({ gender: 'm', hairStyle: 'curly', skin: 0xa86b45, hair: 0x1d1612, col: { torso: 0x8e5b2a, upper: 0x8e5b2a, fore: 0x8e5b2a, thigh: 0x3d5f94, shin: 0x3d5f94, shoe: 0x5a3a24 } }); other.position.set(-0.6, 0, -0.4); other.rotation.y = Math.PI * 1.08; scene.add(other);
  const him = Subject({ gender: 'm', hairStyle: 'side', skin: 0xf1c9a5, hair: 0x4a3020, col: { torso: 0x4e6b3a, upper: 0x4e6b3a, fore: 0x4e6b3a, thigh: 0x6b5a45, shin: 0x6b5a45, shoe: 0x3a2a1c } }); him.position.set(0.62, 0, -0.05); him.rotation.y = -0.3; scene.add(him);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t, d) {
      poseStand(clerk, t); poseStand(other, t + 1); poseStand(him, t + 2);
      const k = eio(clamp(t / 1.3));
      const cj = clerk.userData.J; cj.arm.L.a.rotation.set(-1.3, 0, -0.2); cj.arm.R.a.rotation.set(-1.3, 0, 0.2); cj.arm.L.b.rotation.set(-0.4, 0, 0); cj.arm.R.b.rotation.set(-0.4, 0, 0); clerk.userData.face({ open: 0.35, wide: 0.2 });
      bike.position.set(lerp(-0.25, -0.5, k), 1.42 - 0.12 * k, lerp(-1.3, -0.95, k)); bike.rotation.set(0, 0.15, 0.05 * Math.sin(t * 2));
      const oj = other.userData.J; oj.arm.L.a.rotation.set(-1.2 * k, 0, -0.2); oj.arm.R.a.rotation.set(-1.2 * k, 0, 0.2); other.userData.face({ open: 0.4, wide: 0.3 });
      // him: arms crossed, jaw tight, glaring at the bike
      const hj = him.userData.J; hj.arm.L.a.rotation.set(0.05, 0, -0.1); hj.arm.R.a.rotation.set(0.05, 0, 0.1); hj.arm.L.b.rotation.set(-0.25, 0, 0); hj.arm.R.b.rotation.set(-0.25, 0, 0);
      hj.head.rotation.set(0.08, -0.6 - 0.05 * Math.sin(t * 2), 0); him.userData.face({ open: 0.05 + 0.25 * ss(1.0, 1.3, t), closed: 0.35 * (1 - ss(1.0, 1.3, t)), wide: 0.5 * ss(1.0, 1.3, t), lookX: -0.8 });
      look(c, mix(V(0.3, 1.66, 3.3), V(0.24, 1.64, 2.95), eio(clamp(t / d))), V(0.0, 1.3, -0.7));
    },
    ui: () => ({ vig: 0.3, sepia: 0.55 }),
  };
}
