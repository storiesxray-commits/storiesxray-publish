import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, outlineMat, M, fresnel, glowMat, addMat, halo, setOpacity, lights, shake, Subject, poseStand } from '../../engine/engine.js';

// xr006 — Jeanne Calment (1875–1997), the oldest verified human: 122 years, 164 days.
// She is a GENERIC elder figure from the engine (no likeness). The lawyer is a generic suited figure. No logos, no real banknotes.
// His death is symbolic only (his figure turns into an x-ray ghost and fades). Smoking is shown as a plain object, never glamorized.
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);

// palette: Provence dusk — lavender sky, ochre walls, terracotta roofs, olive green
const SKY = 0x3a2a5c, SKY2 = 0x24183f, GROUND = 0xb98d58, WALL = 0xe8c99a, WALL2 = 0xd9a873, ROOF = 0xc4562e, SHUT = 0x5f8fa8, SHUT2 = 0x7a9a4a, OLIVE = 0x6f8a3c, LAV = 0x9b7fd1, GOLD = 0xffc94a;
const DRESS = 0x5b3f8a, CARDI = 0x8a5bb0, WHITEHAIR = 0xaeb4c4, SUIT = 0x26324f, SUITL = 0x1d2438;

function labelSprite(text, color = '#ffffff', w = 1.6) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 192; const x = cv.getContext('2d');
  x.font = '900 112px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.lineWidth = 28; x.strokeStyle = '#0b0b0f'; x.strokeText(text, 512, 100); x.fillStyle = color; x.fillText(text, 512, 100);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.scale.set(w, w * 192 / 1024, 1); s.renderOrder = 20; return s;
}
function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData = { cv }; return t; }

// ---------------- characters ----------------
function Jeanne(o = {}) {
  const g = Subject({ elder: true, hair: WHITEHAIR, xray: o.xray, col: { torso: CARDI, upper: CARDI, fore: CARDI, thigh: DRESS, shin: 0x6b5a52, shoe: 0x2a2124, hand: C.skin } });
  if (!o.xray && o.skirt !== false) {
    const sk = M(new THREE.CylinderGeometry(0.2, 0.32, 0.5, 28, 1, true), DRESS, { px: 4 }); sk.material.side = THREE.DoubleSide; sk.position.y = -0.2; g.userData.J.hips.add(sk); g.userData.skirt = sk;
  }
  poseStand(g); return g;
}
function Lawyer(o = {}) {
  const g = Subject({ xray: o.xray, col: { torso: SUIT, upper: SUIT, fore: SUIT, thigh: SUITL, shin: SUITL, shoe: 0x111318, hand: C.skin } });
  if (!o.xray) {
    const tie = M(new THREE.BoxGeometry(0.05, 0.24, 0.02), C.red, { px: 3 }); tie.position.set(0, 0.36, 0.15); g.userData.J.chest.add(tie);
    const shirt = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.12), new THREE.MeshBasicMaterial({ color: 0xffffff })); shirt.position.set(0, 0.47, 0.148); g.userData.J.chest.add(shirt);
    const bc = M(RB(0.32, 0.24, 0.07, 0.02, 2), 0x5a3a24, { px: 3 }); bc.position.set(0, -0.32, 0.02); g.userData.J.arm.L.hand.add(bc); g.userData.case = bc;
  }
  poseStand(g); return g;
}
function wave(g, t, side = 'R', amp = 1) { const A = g.userData.J.arm[side], s = side === 'R' ? 1 : -1; A.a.rotation.set(-0.3, 0, s * (2.4 + 0.15 * Math.sin(t * 9) * amp)); A.b.rotation.set(-0.6, 0, 0); }
function laugh(g, t, k = 1) { const J = g.userData.J; g.userData.face({ open: 0.25 + 0.55 * k * Math.abs(Math.sin(t * 9)), wide: 0.3 * k, closed: 0.55 * k }); J.head.rotation.set(-0.18 * k + 0.05 * Math.sin(t * 9) * k, 0.1 * Math.sin(t * 1.3), 0.06 * Math.sin(t * 2)); J.chest.rotation.x = -0.06 * k; }

// ---------------- the world: a Provence street at golden hour ----------------
function sky(scene, o = {}) {
  scene.background = canvasTex(64, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#24183f'); g.addColorStop(0.55, '#5a3d78'); g.addColorStop(0.85, '#e0866a'); g.addColorStop(1, '#f2b46a'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  scene.fog = new THREE.Fog(0x8a5a7a, o.f0 || 22, o.f1 || 60);
}
function House(w, h, wall, seed) {
  const g = new THREE.Group(), r = rnd(seed);
  const b = M(RB(w, h, 2.2, 0.04, 2), wall, { px: 4 }); b.position.y = h / 2; g.add(b);
  const roof = M(new THREE.ConeGeometry(w * 0.78, 0.9, 4), ROOF, { px: 4 }); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 0.7); roof.position.y = h + 0.42; g.add(roof);
  const cols = [SHUT, SHUT2, LAV]; const sc = cols[Math.floor(r() * 3)];
  const fl = Math.max(1, Math.floor(h / 1.5));
  for (let j = 0; j < fl; j++) for (let i = 0; i < Math.max(1, Math.floor(w / 1.4)); i++) {
    const x = -w / 2 + 0.7 + i * 1.4, y = 1.0 + j * 1.45; if (x > w / 2 - 0.4) continue;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.7), new THREE.MeshBasicMaterial({ color: r() < 0.35 ? 0xffd88a : 0x3b2e4a })); win.position.set(x, y, 1.111); g.add(win);
    for (const s of [-1, 1]) { const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.74), toon(sc)); sh.position.set(x + s * 0.33, y, 1.112); g.add(sh); }
  }
  return g;
}
function Olive(seed) {
  const g = new THREE.Group(), r = rnd(seed);
  const tr = M(new THREE.CylinderGeometry(0.08, 0.13, 1.2, 10), 0x6a4a32, { px: 3 }); tr.position.y = 0.6; tr.rotation.z = (r() - .5) * 0.3; g.add(tr);
  for (let i = 0; i < 4; i++) { const b = M(new THREE.SphereGeometry(0.45 + r() * 0.2, 14, 10), OLIVE, { px: 3 }); b.position.set((r() - .5) * 0.7, 1.35 + r() * 0.35, (r() - .5) * 0.5); b.scale.y = 0.75; g.add(b); }
  return g;
}
function street(scene, o = {}) {
  sky(scene, o);
  const L = lights(scene, { hemi: 0.85, sky: 0xffe2c4, ground: 0x4a3550, keyI: 2.2, key: 0xffd9a8, keyPos: [-6, 6, 6], rim: 0xff9a6a, rimI: 1.2, rimPos: [4, 4, -6], shadow: o.shadow, shadowR: 5 });
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), toon(GROUND)); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; scene.add(gr);
  const sun = halo(0xffb56a, 30, 0.55); sun.position.set(-8, 4, -40); scene.add(sun);
  const r = rnd(o.seed || 3);
  if (o.houses !== false) {
    let x = -11;
    while (x < 11) { const w = 2.2 + r() * 1.6, h = 3 + r() * 3.2; const hs = House(w, h, r() < 0.5 ? WALL : WALL2, Math.floor(r() * 999)); hs.position.set(x + w / 2, 0, -6 - r() * 0.6); scene.add(hs); x += w + 0.15; }
  }
  if (o.trees !== false) for (let i = 0; i < (o.nTrees || 4); i++) { const t = Olive(i + 40); t.position.set(-6 + i * 4 + r() * 1.5, 0, -3.2 - r()); scene.add(t); }
  return { L };
}

// ---------------- props ----------------
function Cake(num) {
  const g = new THREE.Group();
  const t1 = M(new THREE.CylinderGeometry(1.1, 1.1, 0.6, 40), 0xf6e2ef, { px: 5 }); t1.position.y = 0.3; g.add(t1);
  const t2 = M(new THREE.CylinderGeometry(0.75, 0.75, 0.45, 40), 0xf6e2ef, { px: 5 }); t2.position.y = 0.82; g.add(t2);
  for (const [y, rr] of [[0.6, 1.1], [1.05, 0.75]]) { const ic = M(new THREE.TorusGeometry(rr, 0.07, 10, 40), 0xd06aa6, { px: 3 }); ic.rotation.x = Math.PI / 2; ic.position.y = y; g.add(ic); }
  const plate = M(new THREE.CylinderGeometry(1.35, 1.35, 0.06, 40), 0xe8e6ee, { px: 4 }); plate.position.y = 0.0; g.add(plate);
  const tex = canvasTex(512, 200, (x, w, h) => { x.font = '900 170px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.lineWidth = 22; x.strokeStyle = '#3a1030'; x.strokeText(num, w / 2, h / 2 + 6); x.fillStyle = '#FFD60A'; x.fillText(num, w / 2, h / 2 + 6); });
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(1.112, 1.112, 0.5, 40, 1, true, -0.75, 1.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); lab.position.y = 0.3; g.add(lab);
  const flames = [], r = rnd(9);
  for (let i = 0; i < 9; i++) { const a = i / 9 * Math.PI * 2, rr = i % 2 ? 0.5 : 0.3;
    const cd = M(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 10), i % 3 ? 0x8fd0ff : 0xffe07a, { px: 2.5 }); cd.position.set(Math.cos(a) * rr, 1.2, Math.sin(a) * rr); g.add(cd);
    const f = halo(0xffb03a, 0.32, 0.95); f.position.set(cd.position.x, 1.43, cd.position.z); g.add(f); const core = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0xfff3c0 })); core.scale.y = 1.7; core.position.copy(f.position); g.add(core);
    flames.push({ f, ph: r() * 6 }); }
  g.userData.update = t => { for (const q of flames) q.f.scale.setScalar(0.28 + 0.06 * Math.sin(t * 13 + q.ph)); };
  return g;
}
function billTex() { return canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#e9dfc4'; x.fillRect(0, 0, w, h); x.fillStyle = '#9fb7d6'; x.fillRect(8, 8, w - 16, h - 16); x.fillStyle = '#e9dfc4'; x.beginPath(); x.ellipse(w * 0.7, h / 2, 30, 38, 0, 0, 7); x.fill(); x.fillStyle = '#2b3a5c'; x.font = '900 52px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('F', w * 0.7, h / 2 + 2); x.font = '900 34px Inter'; x.fillText('500', w * 0.28, h / 2 + 2); }); }
function Bills(scene, n, seed) {
  const tex = billTex(), r = rnd(seed), arr = [];
  for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.21), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); b.userData = { o: i / n + r() * 0.05, sp: 3 + r() * 4, ry: r() * 6, dy: (r() - .5) * 0.3 }; scene.add(b); arr.push(b); }
  // flow from A to B along an arc; rate = bills per second; k = 0..1 visibility
  return (t, A, B, rate = 1, k = 1, arc = 0.8) => { arr.forEach(b => { const u = ((t * rate / n * 1.0 + b.userData.o) % 1); const p = mix(A, B, u); p.y += Math.sin(u * Math.PI) * arc + b.userData.dy; b.position.copy(p); b.rotation.set(t * b.userData.sp, b.userData.ry + t * 2, 0.3); b.visible = k > 0.01 && u > 0.04 && u < 0.96; }); };
}
function Cigarette() {
  const g = new THREE.Group();
  const body = M(new THREE.CylinderGeometry(0.12, 0.12, 2.0, 24), 0xf4f1ea, { px: 5 }); body.rotation.z = Math.PI / 2; g.add(body);
  const filt = M(new THREE.CylinderGeometry(0.122, 0.122, 0.6, 24), 0xd99a4e, { px: 5 }); filt.rotation.z = Math.PI / 2; filt.position.x = -1.3; g.add(filt);
  const ash = M(new THREE.CylinderGeometry(0.115, 0.12, 0.18, 24), 0x8a8a90, { px: 4 }); ash.rotation.z = Math.PI / 2; ash.position.x = 1.09; g.add(ash);
  const ember = new THREE.Mesh(new THREE.CircleGeometry(0.1, 20), new THREE.MeshBasicMaterial({ color: 0xff6a1a })); ember.rotation.y = Math.PI / 2; ember.position.x = 1.185; g.add(ember);
  const glow = halo(0xff5a1a, 0.9, 0.7); glow.position.x = 1.2; g.add(glow);
  const puffs = []; for (let i = 0; i < 12; i++) { const s = halo(0xd8d4e8, 0.6, 0); g.add(s); puffs.push(s); }
  g.userData.update = t => { glow.material.opacity = 0.55 + 0.25 * Math.sin(t * 5); puffs.forEach((s, i) => { const k = ((t * 0.35 + i / 12) % 1); s.position.set(1.25 + 0.4 * Math.sin(k * 6 + i), k * 2.4, 0.2 * Math.cos(k * 5 + i)); s.scale.setScalar(0.3 + k * 1.3); s.material.opacity = 0.3 * Math.sin(Math.PI * k); }); };
  return g;
}
function ChocoBar() {
  const g = new THREE.Group();
  const b = M(RB(0.9, 0.12, 0.45, 0.03, 2), 0x5a3220, { px: 4 }); g.add(b);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const s = M(RB(0.19, 0.06, 0.19, 0.02, 2), 0x6e3f28, { px: 2, outline: false }); s.position.set(-0.32 + i * 0.213, 0.08, -0.1 + j * 0.2); g.add(s); }
  const wr = M(RB(0.46, 0.14, 0.47, 0.02, 2), 0xc8a03a, { px: 3 }); wr.position.x = 0.24; g.add(wr);
  return g;
}
function Scale() {
  const g = new THREE.Group();
  const base = M(RB(2.0, 0.5, 1.6, 0.08, 3), 0xe9e4da, { px: 5 }); base.position.y = 0.25; g.add(base);
  const dial = M(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 32), 0xffffff, { px: 4 }); dial.rotation.x = Math.PI / 2; dial.position.set(0, 0.25, 0.81); g.add(dial);
  const needle = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.34, 0.02), new THREE.MeshBasicMaterial({ color: C.red })); needle.geometry.translate(0, 0.15, 0); needle.position.set(0, 0.25, 0.85); g.add(needle);
  const pan = M(new THREE.CylinderGeometry(1.0, 0.9, 0.1, 40), 0xc0c6cf, { px: 4 }); pan.position.y = 0.56; g.add(pan);
  g.userData = { needle, pan }; return g;
}
function Foil() {
  const g = new THREE.Group();
  const bl = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, 0.95, 8), new THREE.MeshBasicMaterial({ color: 0xdfe6ee })); bl.position.y = -0.55; g.add(bl);
  const bo = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), toon(0xc9ced6)); bo.rotation.x = Math.PI; bo.position.y = -0.06; g.add(bo);
  const tipH = halo(0xffffff, 0.18, 0.8); tipH.position.y = -1.03; g.add(tipH);
  return g;
}
function Bike() {
  const g = new THREE.Group(), wheels = [];
  for (const z of [-0.58, 0.58]) {
    const w = new THREE.Group(); w.position.set(0, 0.36, z); g.add(w); wheels.push(w);
    const tyre = M(new THREE.TorusGeometry(0.34, 0.035, 10, 40), 0x1a1a1f, { px: 3 }); tyre.rotation.y = Math.PI / 2; w.add(tyre);
    for (let i = 0; i < 6; i++) { const sp = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.66, 0.008), new THREE.MeshBasicMaterial({ color: 0xbfc6d0 })); sp.rotation.x = i / 6 * Math.PI; w.add(sp); }
  }
  const tube = (a, b, r = 0.025, col = 0x2f8f8a) => { const m = M(new THREE.CylinderGeometry(r, r, a.distanceTo(b), 10), col, { px: 3 }); m.position.copy(a.clone().add(b).multiplyScalar(0.5)); m.lookAt(b); m.rotateX(Math.PI / 2); g.add(m); return m; };
  const hub = V(0, 0.36, -0.58), front = V(0, 0.36, 0.58), seat = V(0, 0.82, -0.2), head = V(0, 0.95, 0.42), crank = V(0, 0.36, -0.02);
  tube(hub, seat); tube(seat, crank); tube(crank, head); tube(head, front); tube(hub, crank); tube(seat, head);
  const sad = M(RB(0.14, 0.05, 0.26, 0.02, 2), 0x3a2a24, { px: 3 }); sad.position.set(0, 0.86, -0.22); g.add(sad);
  const bar = M(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8), 0x2a2a30, { px: 3 }); bar.rotation.z = Math.PI / 2; bar.position.set(0, 1.0, 0.4); g.add(bar);
  const bask = M(RB(0.34, 0.2, 0.26, 0.03, 2), 0xb98a4a, { px: 3 }); bask.position.set(0, 0.88, 0.62); g.add(bask);
  const bread = M(new THREE.CapsuleGeometry(0.04, 0.38, 4, 10), 0xd9a45a, { px: 2.5 }); bread.position.set(0.05, 1.05, 0.6); bread.rotation.x = 0.4; g.add(bread);
  const cr = new THREE.Group(); cr.position.copy(crank); g.add(cr);
  const arm = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.32, 0.03), new THREE.MeshBasicMaterial({ color: 0x55596a })); cr.add(arm);
  g.userData = { wheels, cr }; return g;
}
function ridePose(fig, t) {
  const J = fig.userData.J, a = t * 7;
  J.hips.position.y = 0.97; J.chest.rotation.set(0.32, 0, 0); J.head.rotation.set(-0.25, 0, 0);
  J.arm.L.a.rotation.set(-0.85, 0, -0.12); J.arm.R.a.rotation.set(-0.85, 0, 0.12); J.arm.L.b.rotation.set(-0.35, 0, 0); J.arm.R.b.rotation.set(-0.35, 0, 0);
  J.leg.L.l.rotation.set(-1.0 - 0.35 * Math.sin(a), 0, -0.06); J.leg.R.l.rotation.set(-1.0 + 0.35 * Math.sin(a), 0, 0.06);
  J.leg.L.kn.rotation.x = 1.15 + 0.45 * Math.sin(a + 1.2); J.leg.R.kn.rotation.x = 1.15 - 0.45 * Math.sin(a + 1.2);
  if (fig.userData.skirt) fig.userData.skirt.scale.set(1, 0.7, 1.15);
}
function Building(signTex) {
  const g = new THREE.Group();
  const b = M(RB(5.2, 6.6, 3, 0.05, 2), WALL, { px: 5 }); b.position.y = 3.3; g.add(b);
  const roof = M(RB(5.6, 0.3, 3.3, 0.05, 2), ROOF, { px: 4 }); roof.position.y = 6.75; g.add(roof);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    const x = -1.6 + i * 1.6, y = 2.2 + j * 1.6;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.95), new THREE.MeshBasicMaterial({ color: (i + j) % 2 ? 0xffd88a : 0x3b2e4a })); win.position.set(x, y, 1.51); g.add(win);
    for (const s of [-1, 1]) { const sh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 1.0), toon(SHUT)); sh.position.set(x + s * 0.48, y, 1.512); g.add(sh); }
    if (j === 1) { const bal = M(RB(0.95, 0.08, 0.35, 0.02, 2), 0x2a2a30, { px: 3 }); bal.position.set(x, y - 0.55, 1.65); g.add(bal); }
  }
  const door = M(RB(1.1, 1.6, 0.1, 0.03, 2), 0x6a3a2a, { px: 4 }); door.position.set(0, 0.8, 1.52); g.add(door);
  return g;
}
function Contract() {
  const g = new THREE.Group();
  const tex = canvasTex(600, 800, (x, w, h) => {
    x.fillStyle = '#f6efdc'; x.fillRect(0, 0, w, h); x.fillStyle = '#2b2440'; x.font = '900 64px Inter'; x.textAlign = 'center'; x.fillText('CONTRACT', w / 2, 100);
    x.fillStyle = '#b8ad95'; for (let i = 0; i < 11; i++) x.fillRect(70, 170 + i * 42, (i % 4 === 3 ? 300 : 460), 14);
    x.fillStyle = '#2b2440'; x.font = '800 40px Inter'; x.fillText('2,500 F / MONTH', w / 2, 680);
    x.strokeStyle = '#2b2440'; x.lineWidth = 4; x.beginPath(); x.moveTo(60, 750); x.lineTo(260, 750); x.moveTo(340, 750); x.lineTo(540, 750); x.stroke();
  });
  const paper = M(RB(1.5, 2.0, 0.02, 0.01, 1), 0xf6efdc, { px: 4 }); g.add(paper);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.48, 1.98), new THREE.MeshBasicMaterial({ map: tex })); face.position.z = 0.012; g.add(face);
  const seal = M(new THREE.CylinderGeometry(0.2, 0.2, 0.04, 32), 0xc8243a, { px: 3 }); seal.rotation.x = Math.PI / 2; seal.position.set(0.48, -0.55, 0.04); g.add(seal);
  const pen = new THREE.Group(); g.add(pen);
  const pb = M(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 12), 0x1d2438, { px: 3 }); pb.position.y = 0.45; pen.add(pb);
  const nib = M(new THREE.ConeGeometry(0.035, 0.12, 12), GOLD, { px: 2 }); nib.rotation.x = Math.PI; nib.position.y = -0.04; pen.add(nib);
  const ink = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.02), new THREE.MeshBasicMaterial({ color: 0x1d2a6a })); ink.position.set(-0.3, -0.84, 0.014); ink.geometry.translate(0.5, 0, 0); g.add(ink);
  g.userData = { pen, seal, ink }; return g;
}
function Calendar() {
  const g = new THREE.Group();
  const draw = (x, w, h, yr) => { x.fillStyle = '#fbf7ee'; x.fillRect(0, 0, w, h); x.fillStyle = '#c8243a'; x.fillRect(0, 0, w, 150); x.fillStyle = '#ffffff'; x.font = '900 90px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('YEAR', w / 2, 80); x.fillStyle = '#1d2438'; x.font = '900 230px Inter'; x.fillText(String(yr), w / 2, 330); };
  let cur = 1965; const tex = canvasTex(600, 480, (x, w, h) => draw(x, w, h, cur));
  const blk = M(RB(3.0, 2.4, 0.4, 0.06, 2), 0xfbf7ee, { px: 6 }); g.add(blk);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.32), new THREE.MeshBasicMaterial({ map: tex })); face.position.z = 0.205; g.add(face);
  for (const s of [-1, 1]) { const ring = M(new THREE.TorusGeometry(0.12, 0.03, 8, 20), 0x55596a, { px: 2 }); ring.position.set(s * 0.8, 1.2, 0.1); g.add(ring); }
  const page = new THREE.Mesh(new THREE.PlaneGeometry(2.9, 2.32), new THREE.MeshBasicMaterial({ color: 0xfbf7ee, side: THREE.DoubleSide })); page.geometry.translate(0, -1.16, 0); page.position.set(0, 1.16, 0.21); g.add(page);
  g.userData.set = (yr, flip) => { if (yr !== cur) { cur = yr; draw(tex.userData.cv.getContext('2d'), 600, 480, yr); tex.needsUpdate = true; } page.rotation.x = -flip * Math.PI * 0.95; page.visible = flip > 0.02 && flip < 0.98; };
  return g;
}
function Mic(col) {
  const g = new THREE.Group();
  const st = M(new THREE.CylinderGeometry(0.04, 0.05, 1.4, 10), 0x2a2a30, { px: 3 }); st.position.y = -0.7; g.add(st);
  const hd = M(new THREE.SphereGeometry(0.12, 16, 12), 0x55596a, { px: 3 }); g.add(hd);
  const fl = M(RB(0.18, 0.12, 0.18, 0.02, 2), col, { px: 3 }); fl.position.y = -0.2; g.add(fl);
  return g;
}

// =============== s01 + loop: HOOK — "Do you want to live to 100? Or more?" ===============
export function hook(mode = 'in') {
  const scene = new THREE.Scene(); street(scene, { shadow: true });
  const j = Jeanne(); scene.add(j); j.position.set(0, 0, 0);
  const cake = Cake(mode === 'end' ? '120' : '100'); cake.scale.setScalar(0.36); scene.add(cake);
  const table = M(new THREE.CylinderGeometry(0.62, 0.62, 0.07, 36), 0xe8e6ee, { px: 4 }); table.position.set(0.15, 0.72, 0.85); scene.add(table);
  const leg = M(new THREE.CylinderGeometry(0.06, 0.1, 0.72, 12), 0x6a4a32, { px: 3 }); leg.position.set(0.15, 0.36, 0.85); scene.add(leg);
  cake.position.set(0.15, 0.755, 0.85);
  const conf = []; const r = rnd(5); for (let i = 0; i < 40; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 0.1), new THREE.MeshBasicMaterial({ color: [0xffd60a, 0xff3b30, 0x22d3ee, 0xff7ad9, 0x7dff9a][i % 5], side: THREE.DoubleSide })); p.userData = { x: (r() - .5) * 3.5, z: (r() - .5) * 2 + 1, o: r(), sp: 2 + r() * 4 }; scene.add(p); conf.push(p); }
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      cake.userData.update(t); poseStand(j, t); wave(j, t, 'R', 1); j.userData.face({ open: 0.35 + 0.2 * Math.sin(t * 3), wide: 0.25 }); j.userData.J.head.rotation.set(0.0, 0.08 * Math.sin(t * 1.2), 0.04 * Math.sin(t * 1.7));
      conf.forEach(p => { const u = ((t * 0.28 + p.userData.o) % 1); p.position.set(p.userData.x + 0.2 * Math.sin(t * 2 + p.userData.o * 9), lerp(3.6, 0.2, u), p.userData.z); p.rotation.set(t * p.userData.sp, t * 2, p.userData.o * 6); });
      look(c, mix(V(0.5, 1.75, 5.6), V(0.35, 1.7, 4.7), eio(t / d)), V(0.05, 1.36, 0.4));
    },
    ui: () => ({ vig: 0.2 }),
  };
}
// =============== s02: "lived to 122" — x-ray scan, the oldest verified human ===============
export function xray(tX) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(C.bg);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.5, key: 0xffffff, rimI: 1.1 });
  const bh = halo(0x0f5f78, 8, 0.55); bh.position.set(0, 1.2, -3); scene.add(bh);
  const solid = Jeanne(), ghost = Jeanne({ xray: true }); scene.add(solid, ghost);
  const heart = halo(0xff4a5a, 0.35, 0); ghost.userData.J.chest.add(heart); heart.position.set(0.05, 0.32, 0.06);
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 10), new THREE.MeshBasicMaterial({ color: 0xff6a7a, transparent: true })); heart.add(core); core.scale.set(1 / 0.35, 1 / 0.35, 1 / 0.35);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.014), glowMat(C.cyan, 1)); scene.add(scan);
  const rings = []; for (let i = 0; i < 3; i++) { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.55 + i * 0.22, 0.008, 6, 64), glowMat(C.cyan, 0.6)); rg.rotation.x = Math.PI / 2; scene.add(rg); rings.push(rg); }
  const c = cam(33);
  return {
    scene, camera: c,
    update(t, d) {
      const k = ss(tX, tX + 0.6, t); setOpacity(solid, 1 - k); setOpacity(ghost, k);
      poseStand(solid, t); poseStand(ghost, t); solid.userData.face({ open: 0.2, wide: 0.2 });
      solid.rotation.y = ghost.rotation.y = -0.35 + 0.25 * eio(t / d);
      const beat = Math.pow(Math.max(0, Math.sin(t * 7.5)), 6); heart.material.opacity = 0.9 * k; heart.scale.setScalar(0.35 + 0.12 * beat);
      scan.visible = k > 0.01 && k < 0.99; scan.position.set(0, lerp(0.05, 1.9, k), 0.35);
      rings.forEach((rg, i) => { rg.position.y = 0.05 + ((t * 0.5 + i / 3) % 1) * 1.8; rg.material.opacity = 0.5 * k; });
      look(c, mix(V(0.0, 1.5, 5.6), V(0.0, 1.45, 5.0), eio(t / d)), V(0, 1.32, 0));
    },
    ui: (t) => ({ flash: Math.max(0, 0.3 - Math.abs(t - tX - 0.1) * 1.6) }),
  };
}
// =============== s03: born in France, 1875 — sepia street ===============
export function born() {
  const scene = new THREE.Scene(); street(scene, { seed: 11, nTrees: 5 });
  const lamp = M(new THREE.CylinderGeometry(0.06, 0.08, 3.2, 10), 0x2a2a30, { px: 3 }); lamp.position.set(1.8, 1.6, -1.5); scene.add(lamp);
  const lh = halo(0xffd27a, 1.2, 0.8); lh.position.set(1.8, 3.25, -1.5); scene.add(lh);
  const cart = new THREE.Group(); scene.add(cart);
  const cb = M(RB(1.4, 0.5, 0.8, 0.04, 2), 0x8a5a32, { px: 4 }); cb.position.y = 0.75; cart.add(cb);
  for (const s of [-1, 1]) { const wh = M(new THREE.TorusGeometry(0.42, 0.05, 8, 24), 0x4a3424, { px: 3 }); wh.position.set(0, 0.45, s * 0.45); cart.add(wh); }
  const c = cam(38);
  return {
    scene, camera: c,
    update(t, d) { cart.position.set(lerp(-4, -1.2, t / d), 0, 0.8); look(c, mix(V(-1.5, 2.6, 9.5), V(0.5, 2.9, 8.2), eio(t / d)), V(0, 2.6, -3)); },
    ui: () => ({ sepia: 0.85, vig: 0.25 }),
  };
}
// =============== s04: smoked until 117 — one plain cigarette, a counter ===============
export function smoke() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1d1430);
  lights(scene, { hemi: 1.0, sky: 0xffe9d0, ground: 0x2a1d45, keyI: 1.8, keyPos: [-3, 4, 5], rim: LAV, rimI: 1.2 });
  const bh = halo(0x6a3fb0, 10, 0.45); bh.position.set(0, 0, -3); scene.add(bh);
  const cg = Cigarette(); scene.add(cg); cg.position.set(-0.15, -0.6, 0); cg.rotation.set(0.15, 0.35, 0.18);
  const tray = M(new THREE.CylinderGeometry(1.1, 0.9, 0.22, 32), 0x8a8fa0, { px: 5 }); tray.position.set(0.1, -1.15, -0.2); scene.add(tray);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) { cg.userData.update(t); cg.rotation.y = 0.35 + 0.15 * Math.sin(t * 0.7); look(c, mix(V(0.4, 1.2, 8.6), V(0.2, 0.9, 7.6), eio(t / d)), V(0, 0.15, 0)); },
  };
}
// =============== s05: two pounds of chocolate a week — bars drop on a scale ===============
export function choco(tLand) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2b1a2e);
  lights(scene, { hemi: 1.0, sky: 0xfff2e0, ground: 0x2a1d2e, keyI: 2.0, keyPos: [-3, 6, 5], rim: 0xff9a6a, rimI: 1.0 });
  const bh = halo(0x8a3f5a, 12, 0.45); bh.position.set(0, 1, -4); scene.add(bh);
  const sc = Scale(); scene.add(sc);
  const bars = []; const r = rnd(8);
  for (let i = 0; i < 9; i++) { const b = ChocoBar(); b.userData = { x: (i % 3 - 1) * 0.55 + (r() - .5) * 0.1, y: 0.68 + Math.floor(i / 3) * 0.17, ry: (r() - .5) * 0.6, d: i * 0.12 }; b.scale.setScalar(0.62); scene.add(b); bars.push(b); }
  
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      let n = 0;
      for (const b of bars) { const a = clamp((t - 0.1 - b.userData.d) / 0.3); b.position.set(b.userData.x, b.userData.y + (1 - eout(a)) * 3.5, 0); b.rotation.set(0, b.userData.ry + (1 - a) * 1.5, (1 - a) * 0.5); b.visible = a > 0; if (a >= 1) n++; }
      sc.userData.needle.rotation.z = -lerp(0, 2.4, eout(n / 9));
      look(c, mix(V(2.0, 3.4, 7.6), V(1.5, 3.0, 6.8), eio(t / d)), V(0, 0.75, 0));
    },
  };
}
// =============== s06: fencing at 85 — a lunge at a target ===============
export function fence(tLunge) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x221a38);
  lights(scene, { hemi: 0.95, sky: 0xe8e0ff, ground: 0x2a2440, keyI: 2.0, keyPos: [-4, 6, 5], rim: C.cyan, rimI: 1.2, shadow: true, shadowR: 4 });
  const strip = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 14), toon(0x8a84a8)); strip.rotation.x = -Math.PI / 2; strip.rotation.z = Math.PI / 2; strip.receiveShadow = true; scene.add(strip);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(0x3a3358)); fl.rotation.x = -Math.PI / 2; fl.position.y = -0.01; scene.add(fl);
  for (const x of [-2.5, 2.5]) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 1.6), glowMat(0xffffff, 0.8)); ln.rotation.x = -Math.PI / 2; ln.position.set(x, 0.005, 0); scene.add(ln); }
  const j = Jeanne(); scene.add(j); j.rotation.y = Math.PI / 2; j.position.set(-1.0, 0, 0);
  const foil = Foil(); j.userData.J.arm.R.hand.add(foil); foil.rotation.x = 0;
  const dummy = new THREE.Group(); scene.add(dummy); dummy.position.set(1.15, 0, 0);
  const pole = M(new THREE.CylinderGeometry(0.05, 0.05, 1.2, 10), 0x55596a, { px: 3 }); pole.position.y = 0.6; dummy.add(pole);
  const pad = M(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 28), 0xf2f0ea, { px: 4 }); pad.rotation.z = Math.PI / 2; pad.position.y = 1.3; dummy.add(pad);
  const bull = new THREE.Mesh(new THREE.CircleGeometry(0.12, 20), new THREE.MeshBasicMaterial({ color: C.red })); bull.rotation.y = -Math.PI / 2; bull.position.set(-0.065, 1.3, 0); dummy.add(bull);
  const hit = halo(0xffffff, 1.0, 0); hit.position.set(1.08, 1.3, 0); scene.add(hit);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      const J = j.userData.J, k = ss(tLunge - 0.25, tLunge, t) * (1 - 0.6 * ss(tLunge + 0.5, tLunge + 1.0, t));
      poseStand(j, t); j.userData.face({ open: 0.2 + 0.3 * k, wide: 0.4 * k });
      J.hips.position.y = lerp(0.9, 0.72, k); j.position.x = lerp(-1.1, -0.65, k);
      J.leg.R.l.rotation.set(lerp(-0.35, -1.05, k), 0, 0.05); J.leg.R.kn.rotation.x = lerp(0.35, 1.0, k);
      J.leg.L.l.rotation.set(lerp(0.25, 0.75, k), 0, -0.05); J.leg.L.kn.rotation.x = lerp(0.3, 0.1, k);
      J.arm.R.a.rotation.set(lerp(-0.9, -1.55, k), 0, 0.05); J.arm.R.b.rotation.set(lerp(-0.6, 0, k), 0, 0);
      J.arm.L.a.rotation.set(0.3, 0, lerp(-1.7, -2.3, k)); J.arm.L.b.rotation.set(-1.2, 0, 0);
      J.chest.rotation.set(0, lerp(0.15, 0.3, k), 0); J.head.rotation.set(0, -0.25, 0);
      foil.rotation.set(0, 0, 0);
      hit.material.opacity = 0.9 * Math.max(0, 1 - Math.abs(t - tLunge - 0.05) * 5);
      look(c, mix(V(0.0, 1.6, 8.2), V(-0.1, 1.45, 7.4), eio(t / d)), V(-0.15, 1.0, 0)); shake(c, t, tLunge, 0.025, 0.2);
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// =============== s07: riding her bike at 100 — past olive trees ===============
export function bike() {
  const scene = new THREE.Scene(); street(scene, { seed: 21, nTrees: 0, f0: 18, f1: 50 });
  const bk = Bike(); scene.add(bk);
  const j = Jeanne(); bk.add(j); j.position.set(0, -0.12, -0.2);
  const trees = []; for (let i = 0; i < 7; i++) { const tr = Olive(60 + i); scene.add(tr); trees.push(tr); }
  const road = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 120), toon(0xd8b27a)); road.rotation.x = -Math.PI / 2; road.position.y = 0.005; scene.add(road);
  bk.rotation.y = Math.PI / 2;
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      ridePose(j, t); j.userData.face({ open: 0.3, wide: 0.15, closed: 0.2 });
      bk.userData.wheels.forEach(w => w.rotation.x = -t * 8); bk.userData.cr.rotation.x = -t * 7;
      bk.position.set(lerp(-1.2, 1.2, t / d), 0, 0.6); bk.position.y = 0.01 * Math.sin(t * 14);
      trees.forEach((tr, i) => { tr.position.set(((i * 3.2 - t * 4.5) % 22 + 22) % 22 - 11, 0, -2.4 - (i % 2) * 1.4); });
      look(c, mix(V(-0.8, 1.5, 7.2), V(0.6, 1.45, 6.4), eio(t / d)), V(bk.position.x, 0.95, 0.6));
    },
    ui: () => ({ vig: 0.2 }),
  };
}
// =============== s08: "her best move was a deal" — the contract gets signed ===============
export function deal(tSign) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x231a33);
  lights(scene, { hemi: 1.0, sky: 0xfff0dc, ground: 0x2a1d45, keyI: 2.0, keyPos: [-2, 5, 6], rim: GOLD, rimI: 1.0 });
  const bh = halo(0x7a4fd0, 10, 0.45); bh.position.set(0, 0, -3); scene.add(bh);
  const desk = M(RB(5, 0.2, 3, 0.04, 2), 0x6a4a32, { px: 5 }); desk.position.y = -1.15; scene.add(desk);
  const ct = Contract(); scene.add(ct); ct.rotation.set(-0.95, 0, 0.08); ct.position.set(0, -0.98, 0.1);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const { pen, seal, ink } = ct.userData, k = ss(tSign - 0.3, tSign + 0.6, t);
      pen.position.set(lerp(-0.3, 0.7, k), lerp(-0.84, -0.84, k) + 0.05 * Math.sin(k * 30) * (k > 0 && k < 1), 0.02); pen.rotation.set(0, 0, -0.5);
      ink.scale.x = Math.max(0.001, k); seal.scale.setScalar(t > tSign + 0.7 ? back(clamp((t - tSign - 0.7) / 0.3)) : 0.001);
      look(c, mix(V(0.5, 2.6, 3.8), V(0.3, 2.2, 3.1), eio(t / d)), V(0.1, -0.85, 0));
    },
  };
}
// =============== s09: she's 90, he's 47 — in front of her apartment building ===============
export function ages(tHe) {
  const scene = new THREE.Scene(); street(scene, { seed: 31, houses: false, nTrees: 2, shadow: true });
  const bd = Building(); bd.position.set(0, 0, -3.6); scene.add(bd);
  for (const x of [-6, 6]) { const hs = House(3.5, 4.5, WALL2, 77 + x); hs.position.set(x, 0, -4.6); scene.add(hs); }
  const j = Jeanne(); scene.add(j); j.position.set(-0.75, 0, 0.6); j.rotation.y = 0.45;
  const l = Lawyer(); scene.add(l); l.position.set(0.85, 0, 0.6); l.rotation.y = -0.45;
  
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      poseStand(j, t); poseStand(l, t); j.userData.face({ open: 0.25, wide: 0.1 }); l.userData.face({ open: 0.3 + 0.2 * Math.sin(t * 6), wide: 0.2 });
      l.userData.J.arm.R.a.rotation.set(-0.7, 0, 0.25); l.userData.J.arm.R.b.rotation.set(-0.6, 0, 0);
      j.userData.J.arm.L.a.rotation.set(-0.1, 0, -0.35);
      look(c, mix(V(0.2, 1.9, 6.4), V(0.1, 1.8, 5.6), eio(t / d)), V(0, 1.35, -0.3));
    },
    ui: () => ({ vig: 0.2 }),
  };
}
// =============== s10: he pays every month; then the place would be his ===============
export function monthly(tHis) {
  const scene = new THREE.Scene(); street(scene, { seed: 41, houses: false, nTrees: 3 });
  const bd = Building(); bd.position.set(0, 0, -4.2); scene.add(bd);
  const j = Jeanne(); scene.add(j); j.position.set(-1.3, 0, 0.6); j.rotation.y = 0.6;
  const l = Lawyer(); scene.add(l); l.position.set(1.3, 0, 0.6); l.rotation.y = -0.6;
  const flow = Bills(scene, 14, 3);
  const key = new THREE.Group(); scene.add(key);
  const kr = M(new THREE.TorusGeometry(0.16, 0.05, 8, 20), GOLD, { px: 3 }); key.add(kr);
  const ks = M(new THREE.BoxGeometry(0.5, 0.07, 0.05), GOLD, { px: 3 }); ks.position.x = 0.38; key.add(ks);
  const kt = M(new THREE.BoxGeometry(0.07, 0.14, 0.05), GOLD, { px: 2 }); kt.position.set(0.55, -0.08, 0); key.add(kt);
  const kh = halo(0xffd27a, 0.9, 0.6); key.add(kh);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      poseStand(j, t); poseStand(l, t); j.userData.face({ open: 0.4, wide: 0.3 }); l.userData.face({ open: 0.2 });
      j.userData.J.arm.R.a.rotation.set(-0.9, 0, 0.3); j.userData.J.arm.R.b.rotation.set(-0.5, 0, 0);
      l.userData.J.arm.R.a.rotation.set(-1.0, 0, -0.2); l.userData.J.arm.R.b.rotation.set(-0.3, 0, 0);
      const A = V(1.0, 1.25, 1.0), B = V(-1.0, 1.25, 1.0);
      flow(t, A, B, 3.2, t < tHis ? 1 : 0);
      const kk = ss(tHis, tHis + 0.4, t); key.visible = kk > 0; key.position.set(0, lerp(2.6, 1.7, eout(kk)), 1.0); key.rotation.set(0, t * 2, 0.2); key.scale.setScalar(1.5 * kk);
      look(c, mix(V(0.0, 1.8, 7.4), V(0.0, 1.8, 6.8), eio(t / d)), V(0, 1.3, -0.2));
    },
    ui: () => ({ vig: 0.2 }),
  };
}
// =============== s11: he paid for thirty years — calendar 1965 → 1995 ===============
export function years(t0, t1) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1d1838);
  lights(scene, { hemi: 1.0, sky: 0xfff0dc, ground: 0x2a1d45, keyI: 2.0, keyPos: [-3, 5, 6], rim: LAV, rimI: 1.0 });
  const bh = halo(0x5a3fb0, 12, 0.5); bh.position.set(0, 0.5, -4); scene.add(bh);
  const cal = Calendar(); scene.add(cal); cal.position.set(0, -0.75, 0); cal.rotation.set(-0.08, -0.15, 0); cal.scale.setScalar(0.85);
  const flow = Bills(scene, 18, 9);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const u = ss(t0, t1, t), yr = Math.round(lerp(1965, 1995, u)); const fp = (u * 30) % 1;
      cal.userData.set(yr, u > 0 && u < 1 ? fp : 0);
      flow(t, V(2.2, -2.3, 0.9), V(-2.2, -2.3, 0.9), 4.5, 1, 0.5);
      look(c, mix(V(0.2, 0.9, 10.5), V(0.1, 0.8, 9.6), eio(t / d)), V(0, 0.55, 0));
    },
  };
}
// =============== s12: then he died first — his figure turns to an x-ray ghost and fades (symbolic) ===============
export function first(tGo) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(C.bg);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.6, key: 0xffffff, rimI: 1.1 });
  const bh = halo(0x0f5f78, 9, 0.5); bh.position.set(0, 1.2, -3); scene.add(bh);
  const fl = new THREE.Mesh(new THREE.CircleGeometry(3.5, 48), toon(0x16222e)); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const j = Jeanne(); scene.add(j); j.position.set(-0.55, 0, 0.3); j.rotation.y = 0.35;
  const l = Lawyer(), lg = Lawyer({ xray: true }); scene.add(l, lg); for (const f of [l, lg]) { f.position.set(0.6, 0, 0.3); f.rotation.y = -0.35; }
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.012), glowMat(C.cyan, 1)); scene.add(scan);
  const c = cam(35);
  return {
    scene, camera: c,
    update(t, d) {
      poseStand(j, t); poseStand(l, t); poseStand(lg, t);
      const k = ss(tGo, tGo + 0.5, t), up = ss(tGo + 0.5, tGo + 1.6, t);
      setOpacity(l, 1 - k); setOpacity(lg, k * (1 - up));
      lg.position.y = up * 1.2; scan.visible = k > 0.01 && k < 0.99; scan.position.set(0.6, lerp(0.05, 1.9, k), 0.75);
      j.userData.face({ open: 0.2 + 0.4 * up, wide: 0.6 * up }); j.userData.J.head.rotation.set(0, 0.35 * up, 0); j.userData.J.arm.L.a.rotation.set(-0.15, 0, -0.35 - 0.2 * up); j.userData.J.arm.R.a.rotation.set(-0.15, 0, 0.35 + 0.2 * up);
      look(c, mix(V(0.1, 1.6, 7.0), V(0.0, 1.5, 6.3), eio(t / d)), V(0, 0.95, 0.2));
    },
    ui: (t) => ({ flash: Math.max(0, 0.25 - Math.abs(t - tGo - 0.1) * 1.4) }),
  };
}
// =============== s13: his family kept paying — envelopes keep arriving ===============
export function family() {
  const scene = new THREE.Scene(); street(scene, { seed: 51, houses: false, nTrees: 3 });
  const bd = Building(); bd.position.set(0, 0, -4.2); scene.add(bd);
  const j = Jeanne(); scene.add(j); j.position.set(-0.9, 0, 0.8); j.rotation.y = 0.5;
  const fam = []; for (let i = 0; i < 2; i++) { const f = Lawyer(); f.scale.setScalar(i ? 0.85 : 1); scene.add(f); f.position.set(1.0 + i * 0.75, 0, 0.6 - i * 0.3); f.rotation.y = -0.5; fam.push(f); }
  fam[1].userData.J.torso.material.color.setHex(0x6a4a7a);
  const flow = Bills(scene, 16, 7);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      poseStand(j, t); laugh(j, t, 0.5); j.userData.J.arm.R.a.rotation.set(-1.0, 0, 0.25); j.userData.J.arm.R.b.rotation.set(-0.4, 0, 0);
      fam.forEach((f, i) => { poseStand(f, t + i); f.userData.face({ open: 0.15, closed: 0.3 }); f.userData.J.arm.R.a.rotation.set(-0.9, 0, -0.2); });
      flow(t, V(0.8, 1.25, 1.0), V(-0.6, 1.25, 1.2), 3.6, 1);
      look(c, mix(V(0.3, 2.0, 7.2), V(0.1, 1.9, 6.4), eio(t / d)), V(0, 1.6, 0));
    },
    ui: () => ({ vig: 0.2 }),
  };
}
// =============== s14: more than double what it was worth — two bars ===============
export function double(tGrow) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1f1636);
  lights(scene, { hemi: 1.0, sky: 0xfff0dc, ground: 0x2a1d45, keyI: 2.0, keyPos: [-3, 6, 6], rim: C.cyan, rimI: 1.0 });
  const bh = halo(0x5a3fb0, 12, 0.5); bh.position.set(0, 1.5, -4); scene.add(bh);
  const base = M(RB(4.4, 0.16, 1.6, 0.04, 2), 0x3a2c5c, { px: 4 }); base.position.y = -0.08; scene.add(base);
  const bA = M(RB(1.3, 1, 1.0, 0.05, 2), WALL2, { px: 5 }), bB = M(RB(1.3, 1, 1.0, 0.05, 2), 0x4fbf6b, { px: 5 }); scene.add(bA, bB);
  const house = House(1.0, 0.8, WALL, 5); house.scale.setScalar(0.55); scene.add(house);
  const lA = labelSprite('APARTMENT', '#ffffff', 1.5), lB = labelSprite('SHE GOT', '#FFD60A', 1.5), x2 = labelSprite('×2+', '#FFD60A', 2.2); scene.add(lA, lB, x2);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const hA = 1.35 * eout(clamp(t / 0.5)), hB = 1.35 * lerp(0.02, 2.15, eout(ss(tGrow, tGrow + 1.2, t)));
      bA.scale.y = Math.max(0.01, hA); bA.position.set(-1.0, hA / 2, 0); bB.scale.y = Math.max(0.01, hB); bB.position.set(1.0, hB / 2, 0);
      house.position.set(-1.0, hA, 0); lA.position.set(-1.0, -0.42, 0.7); lB.position.set(1.0, -0.42, 0.7);
      x2.position.set(1.0, hB * 0.62, 0.75); x2.visible = t > tGrow + 1.0; x2.scale.set(2.2 * back(clamp((t - tGrow - 1.0) / 0.3)), 2.2 * 192 / 1024 * back(clamp((t - tGrow - 1.0) / 0.3)), 1);
      look(c, mix(V(0.4, 2.0, 11.5), V(0.2, 1.9, 10.6), eio(t / d)), V(0, 1.15, 0));
    },
  };
}
// =============== s15: at 120, reporters ask about her future ===============
export function press() {
  const scene = new THREE.Scene(); street(scene, { seed: 61, nTrees: 2, shadow: true });
  const j = Jeanne(); scene.add(j);
  const cake = Cake('120'); cake.scale.setScalar(0.36); cake.position.set(0.15, 0.755, 0.85); scene.add(cake);
  const table = M(new THREE.CylinderGeometry(0.62, 0.62, 0.07, 36), 0xe8e6ee, { px: 4 }); table.position.set(0.15, 0.72, 0.85); scene.add(table);
  const leg = M(new THREE.CylinderGeometry(0.06, 0.1, 0.72, 12), 0x6a4a32, { px: 3 }); leg.position.set(0.15, 0.36, 0.85); scene.add(leg);
  const mics = []; [[-1, C.red], [1, 0x2c6fd6], [-1, 0x4fbf6b]].forEach(([s, col], i) => { const m = Mic(col); m.rotation.z = s * 0.9; m.userData = { s, i }; scene.add(m); mics.push(m); });
  const flashes = []; for (let i = 0; i < 3; i++) { const h = halo(0xffffff, 1.6, 0); scene.add(h); flashes.push(h); }
  const c = cam(35);
  return {
    scene, camera: c,
    update(t, d) {
      cake.userData.update(t); poseStand(j, t); j.userData.face({ open: 0.15, wide: 0.15 }); j.userData.J.head.rotation.set(0, 0.15 * Math.sin(t * 0.9), 0);
      mics.forEach(m => { const { s, i } = m.userData, a = eout(clamp((t - 0.15 - i * 0.2) / 0.5)); m.position.set(s * lerp(2.6, 0.5, a), 1.45 - i * 0.12 + 0.03 * Math.sin(t * 3 + i), 0.5); });
      flashes.forEach((h, i) => { const ph = (t * 1.3 + i * 0.37) % 1; h.position.set((i - 1) * 2.4, 1.9 + i * 0.3, 3.5); h.material.opacity = ph < 0.08 ? 0.9 : 0; });
      look(c, mix(V(0.2, 1.8, 5.4), V(0.1, 1.75, 4.6), eio(t / d)), V(0, 1.34, 0.3));
    },
    ui: () => ({ vig: 0.2 }),
  };
}
// =============== s16: "A very short one." — she laughs ===============
export function answer(tLaugh) {
  const scene = new THREE.Scene(); street(scene, { shadow: true });
  const j = Jeanne(); scene.add(j);
  const cake = Cake('100'); cake.scale.setScalar(0.36); cake.position.set(0.15, 0.755, 0.85); scene.add(cake);
  const table = M(new THREE.CylinderGeometry(0.62, 0.62, 0.07, 36), 0xe8e6ee, { px: 4 }); table.position.set(0.15, 0.72, 0.85); scene.add(table);
  const leg = M(new THREE.CylinderGeometry(0.06, 0.1, 0.72, 12), 0x6a4a32, { px: 3 }); leg.position.set(0.15, 0.36, 0.85); scene.add(leg);
  const c = cam(30);
  return {
    scene, camera: c,
    update(t, d) {
      poseStand(j, t); const k = ss(tLaugh, tLaugh + 0.25, t);
      if (k > 0) laugh(j, t, k); else { j.userData.face({ open: 0.15, wide: 0.1 }); j.userData.J.head.rotation.set(0, 0, 0); }
      j.userData.J.arm.R.a.rotation.set(-0.6 * k, 0, 0.3 + 0.2 * k); j.userData.J.arm.R.b.rotation.set(-1.4 * k, 0, 0);
      cake.userData.update(t); const pb = ss(d - 1.1, d - 0.05, t); c.fov = lerp(30, 34, pb); c.updateProjectionMatrix();
      look(c, mix(mix(V(0.2, 1.62, 2.3), V(0.15, 1.6, 1.9), eio(t / (d - 1.1))), V(0.5, 1.75, 5.6), eio(pb)), mix(V(0, 1.55, 0), V(0.05, 1.36, 0.4), eio(pb)));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
