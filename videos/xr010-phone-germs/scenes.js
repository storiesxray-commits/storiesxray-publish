import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, M, glowMat, addMat, halo, setOpacity, lights, shake, Subject, poseStand } from '../../engine/engine.js';

// xr010 — "Your phone? Dirtier than a toilet seat!"
// Generic phone (no brand, no real app icons), generic lidless public toilet, cartoon germs (original design), generic person.
// Facts: Univ. of Arizona (Charles Gerba): phones carry ~10x more bacteria than most toilet seats; toilet seats get cleaned, phones rarely (LiveScience 2012, TIME 2017).
// CU Boulder 2022 (Crimaldi et al., Scientific Reports): a lidless commercial toilet flush shoots an aerosol plume up to ~5 ft within 8 s. Most phone microbes are harmless (TIME, U. Michigan's Emily Martin).
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);

// palette: toxic lab night — navy, slime green, magenta accents
const LIME = 0x9dff3a, SLIME = 0x4ade80, PURP = 0xb46bff, PINKG = 0xff4fa3, TEAL = 0x22d3ee, YEL = 0xffd60a, RED = 0xff3b30, WHITE = 0xf4f6f8;

function labelSprite(text, color = '#ffffff', w = 1.6) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 192; const x = cv.getContext('2d');
  x.font = '900 112px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.lineWidth = 28; x.strokeStyle = '#0b0b0f'; x.strokeText(text, 512, 100); x.fillStyle = color; x.fillText(text, 512, 100);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.scale.set(w, w * 192 / 1024, 1); s.renderOrder = 20; return s;
}
function popLabel(s, w, k) { s.scale.set(w * k, w * k * 192 / 1024, 1); s.visible = k > 0.01; }
function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData = { cv }; return t; }
function bgGrad(scene, stops) { scene.background = canvasTex(64, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); }); }
function tileTex(c1 = '#33415c', c2 = '#1b2436', n = 8) { const t = canvasTex(512, 512, (x, w, h) => { x.fillStyle = c2; x.fillRect(0, 0, w, h); const s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = c1; x.fillRect(i * s + 4, j * s + 4, s - 8, s - 8); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }

// ---------------- props ----------------
// cartoon germ: blobby body, nubs, googly eyes
function Germ(col = LIME, s = 1, seed = 1) {
  const g = new THREE.Group(), r = rnd(seed);
  const body = M(new THREE.SphereGeometry(0.1, 18, 14), col, { px: 3 }); body.scale.set(1, 0.9 + r() * 0.2, 0.9); g.add(body);
  const dark = new THREE.Color(col).multiplyScalar(0.7).getHex();
  for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2 + r(), b = (r() - 0.5) * 1.6; const n = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), toon(dark)); n.position.set(Math.cos(a) * Math.cos(b) * 0.1, Math.sin(b) * 0.1, Math.sin(a) * Math.cos(b) * 0.1); g.add(n); }
  for (const x of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), new THREE.MeshBasicMaterial({ color: 0xffffff })); e.position.set(x * 0.035, 0.03, 0.085); e.scale.z = 0.5; g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 6), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); p.position.set(x * 0.035 + (r() - 0.5) * 0.01, 0.028, 0.1); g.add(p); }
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.025, 0.006, 6, 12, Math.PI), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); mouth.rotation.z = Math.PI; mouth.position.set(0, -0.02, 0.095); g.add(mouth);
  g.userData = { body, mouth, ph: r() * 6, sp: 2 + r() * 3 }; g.scale.setScalar(s); return g;
}
function wiggle(gm, t) { const u = gm.userData; gm.rotation.set(0.2 * Math.sin(t * u.sp + u.ph), 0.3 * Math.sin(t * u.sp * 0.7 + u.ph), 0.2 * Math.sin(t * u.sp * 1.3)); u.body.scale.y = 0.95 + 0.1 * Math.sin(t * u.sp * 2 + u.ph); }
function screenTex(dirty = 1) {
  return canvasTex(400, 800, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3b1d6e'); g.addColorStop(1, '#0f3b5a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffffff'; x.font = '700 30px Inter'; x.fillText('9:41', 30, 50);
    const cols = ['#ff6b6b', '#ffd60a', '#4ade80', '#22d3ee', '#b46bff', '#ff9f43', '#ff4fa3', '#7ad7ff'];
    for (let i = 0; i < 16; i++) { x.fillStyle = cols[i % 8]; x.beginPath(); x.roundRect(36 + (i % 4) * 88, 120 + Math.floor(i / 4) * 110, 66, 66, 16); x.fill(); }
    if (dirty) { for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(200,230,140,${0.12 + Math.random() * 0.15})`; x.beginPath(); x.ellipse(Math.random() * w, Math.random() * h, 20 + Math.random() * 50, 14 + Math.random() * 30, Math.random() * 3, 0, 7); x.fill(); } }
  });
}
function Phone(dirty = 1) {
  const g = new THREE.Group();
  const body = M(RB(1.0, 2.0, 0.1, 0.13, 4), 0x23262f, { px: 5 }); g.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.88), new THREE.MeshBasicMaterial({ map: screenTex(dirty) })); scr.position.z = 0.052; g.add(scr);
  const camL = new THREE.Mesh(new THREE.CircleGeometry(0.025, 16), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); camL.position.set(0, 0.88, 0.054); g.add(camL);
  g.userData.scr = scr; return g;
}
// lidless public toilet with a chrome flush pipe
function Toilet() {
  const g = new THREE.Group();
  const pts = []; for (let i = 0; i <= 12; i++) { const u = i / 12; pts.push(new THREE.Vector2(lerp(0.13, 0.22, Math.pow(u, 0.6)), lerp(0.0, 0.38, u))); }
  const bowl = M(new THREE.LatheGeometry(pts, 32), WHITE, { px: 5 }); bowl.material.side = THREE.DoubleSide; bowl.scale.z = 1.3; g.add(bowl);
  const water = new THREE.Mesh(new THREE.CircleGeometry(0.17, 28), new THREE.MeshBasicMaterial({ color: 0x9fd8ef })); water.rotation.x = -Math.PI / 2; water.position.y = 0.3; water.scale.y = 1.3; g.add(water);
  const seat = M(new THREE.TorusGeometry(0.205, 0.045, 12, 36), 0xe9eef2, { px: 4 }); seat.rotation.x = Math.PI / 2; seat.scale.y = 1.3; seat.position.y = 0.41; g.add(seat);
  const pipe = M(new THREE.CylinderGeometry(0.025, 0.025, 0.55, 12), 0xb8c2cc, { px: 3 }); pipe.position.set(0, 0.62, -0.32); g.add(pipe);
  const valve = M(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 16), 0xc9d2da, { px: 3 }); valve.rotation.z = Math.PI / 2; valve.position.set(0, 0.88, -0.32); g.add(valve);
  const handle = M(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), 0xc9d2da, { px: 2 }); handle.rotation.z = 0.6; handle.position.set(0.1, 0.84, -0.3); g.add(handle);
  const conn = M(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 10), 0xb8c2cc, { px: 2 }); conn.rotation.x = Math.PI / 2; conn.position.set(0, 0.36, -0.24); g.add(conn);
  g.userData = { seat, handle, water }; return g;
}
function bathroom(scene, o = {}) {
  bgGrad(scene, [[0, '#070b16'], [1, '#13203a']]);
  lights(scene, { hemi: 1.0, sky: 0xd8e6ff, ground: 0x0d1424, keyI: 1.6, keyPos: [-2, 4, 4], rim: SLIME, rimI: 1.2, rimPos: [2, 3, -3], shadow: o.shadow, shadowR: 3 });
  const tx = tileTex(); tx.repeat.set(6, 4);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(12, 8), new THREE.MeshToonMaterial({ map: tx })); wall.position.set(0, 2, -0.45); scene.add(wall);
  const ft = tileTex('#2a3550', '#141c2e', 6); ft.repeat.set(6, 6);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshToonMaterial({ map: ft })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const lamp = halo(0x9ad8ff, 4, 0.25); lamp.position.set(0, 2.6, 0); scene.add(lamp);
}
function swarm(scene, n, seed, box, cols = [LIME, SLIME, PURP, PINKG]) {
  const r = rnd(seed), arr = [];
  for (let i = 0; i < n; i++) { const g = Germ(cols[i % cols.length], 0.6 + r() * 0.7, seed * 100 + i); g.userData.base = V(lerp(box[0], box[1], r()), lerp(box[2], box[3], r()), lerp(box[4], box[5], r())); g.userData.d = r() * 0.6; scene.add(g); arr.push(g); }
  return arr;
}

// =============== s01 + loop: HOOK — a germ-covered phone next to a clean toilet seat ===============
export function hook(mode = 'in') {
  const scene = new THREE.Scene(); bathroom(scene);
  const t0 = Toilet(); t0.position.set(0.55, 0, -0.1); t0.rotation.y = -0.4; scene.add(t0);
  const sparkles = []; for (let i = 0; i < 6; i++) { const s = halo(0xffffff, 0.12, 0.9); s.position.set(0.55 + (i % 3 - 1) * 0.15, 0.48 + Math.floor(i / 3) * 0.06, 0.05); scene.add(s); sparkles.push(s); }
  const ph = Phone(1); ph.scale.setScalar(0.62); ph.position.set(-0.28, 0.72, 0.35); ph.rotation.set(-0.05, 0.25, 0.08); scene.add(ph);
  const germs = swarm(scene, 26, 7, [-0.55, -0.02, 0.2, 1.3, 0.4, 0.5]);
  const glow = halo(LIME, 2.2, 0.35); glow.position.set(-0.28, 0.72, 0.2); scene.add(glow);
  const c = cam(34), P0 = V(0.1, 1.55, 5.5), P1 = V(0.08, 1.45, 4.9), TG = V(0.1, 0.8, 0);
  return {
    scene, camera: c,
    update(t, d) {
      germs.forEach((g, i) => { wiggle(g, t); const b = g.userData.base; g.position.set(b.x + 0.03 * Math.sin(t * 3 + i), b.y + 0.04 * Math.sin(t * 4 + i * 2), b.z); });
      sparkles.forEach((s, i) => { s.material.opacity = 0.5 + 0.5 * Math.sin(t * 6 + i * 1.7); s.scale.setScalar(0.08 + 0.06 * Math.abs(Math.sin(t * 5 + i))); });
      glow.material.opacity = 0.3 + 0.1 * Math.sin(t * 5);
      ph.rotation.z = 0.08 + 0.02 * Math.sin(t * 2);
      if (mode === 'in') look(c, mix(P0, P1, eio(t / d)), TG); else look(c, mix(V(-0.3, 1.0, 3.2), P0, eio(ss(0, d, t))), mix(V(-0.3, 0.9, 0.3), TG, eio(ss(0, d, t))));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s02: scientists checked — swab, petri dish, microscope ===============
export function lab(tSwab) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#04121a'], [1, '#0b2b33']]);
  lights(scene, { hemi: 1.0, sky: 0xe0fbff, ground: 0x08202a, keyI: 1.7, keyPos: [-2, 5, 4], rim: TEAL, rimI: 1.3 });
  const bench = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), toon(0xdfe7ee)); bench.rotation.x = -Math.PI / 2; scene.add(bench);
  const dish = M(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 40), 0xd9f4ff, { px: 4 }); dish.position.set(0.25, 0.03, 0.2); scene.add(dish);
  const agar = new THREE.Mesh(new THREE.CircleGeometry(0.39, 40), toon(0xf5d27a)); agar.rotation.x = -Math.PI / 2; agar.position.set(0.25, 0.062, 0.2); scene.add(agar);
  const cols = []; const r = rnd(4); for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.34; const m = new THREE.Mesh(new THREE.SphereGeometry(0.02 + r() * 0.03, 10, 8), toon([LIME, 0xffffff, PINKG, 0xffb84a][i % 4])); m.scale.y = 0.4; m.position.set(0.25 + Math.cos(a) * rr, 0.07, 0.2 + Math.sin(a) * rr); m.userData.d = r(); scene.add(m); cols.push(m); }
  const scope = new THREE.Group(); scene.add(scope); scope.position.set(-0.6, 0, -0.35);
  const base = M(RB(0.5, 0.08, 0.6, 0.03, 2), 0x5a6b80, { px: 4 }); base.position.y = 0.04; scope.add(base);
  const arm = M(RB(0.1, 0.9, 0.12, 0.03, 2), 0x5a6b80, { px: 4 }); arm.position.set(0, 0.5, -0.2); arm.rotation.x = 0.15; scope.add(arm);
  const tube = M(new THREE.CylinderGeometry(0.07, 0.06, 0.45, 16), 0xe9edf2, { px: 4 }); tube.position.set(0, 0.88, 0.0); tube.rotation.x = -0.4; scope.add(tube);
  const stage = M(RB(0.36, 0.03, 0.36, 0.01, 2), 0x5a6b80, { px: 3 }); stage.position.set(0, 0.42, 0.05); scope.add(stage);
  const swab = new THREE.Group(); const st = M(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 8), 0xf4f1ea, { px: 2 }); st.position.y = 0.35; swab.add(st); const tip = M(new THREE.CapsuleGeometry(0.03, 0.06, 4, 10), 0xffffff, { px: 2 }); swab.add(tip); scene.add(swab);
  const ph = Phone(1); ph.scale.setScalar(0.42); ph.rotation.x = -Math.PI / 2; ph.position.set(0.55, 0.03, -0.5); scene.add(ph);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const k = ss(0, tSwab, t), k2 = ss(tSwab, tSwab + 0.6, t);
      swab.position.set(lerp(0.55, 0.25, k2) + 0.08 * Math.sin(t * 9) * (1 - k2), lerp(0.25, 0.1, k) + 0.12 * k2, lerp(-0.5, 0.2, k2)); swab.rotation.set(0.6, 0, -0.4);
      cols.forEach(m => { const g = ss(tSwab + 0.4 + m.userData.d * 1.2, tSwab + 0.8 + m.userData.d * 1.2, t); m.scale.set(Math.max(0.001, g), 0.4 * Math.max(0.001, g), Math.max(0.001, g)); m.visible = g > 0.01; });
      look(c, mix(V(0.0, 3.4, 3.5), V(0.05, 3.1, 3.1), eio(t / d)), V(-0.1, 0.25, -0.15));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s03: ten times more bacteria — bar chart duel ===============
export function bars(tGrow) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#0a0620'], [1, '#1d0f3a']]);
  lights(scene, { hemi: 1.1, sky: 0xffffff, ground: 0x1d0f3a, keyI: 1.6, keyPos: [-2, 4, 5], rim: LIME, rimI: 1.2 });
  const tb = M(RB(0.7, 0.14, 0.7, 0.04, 2), 0x8fd3ff, { px: 4 }); tb.position.set(0.55, 0.07, 0); scene.add(tb);
  const pb = M(RB(0.7, 1.4, 0.7, 0.04, 2), LIME, { px: 4 }); pb.geometry.translate(0, 0.7, 0); pb.position.set(-0.55, 0, 0); scene.add(pb);
  const t0 = Toilet(); t0.scale.setScalar(0.75); t0.position.set(0.55, 0.14, 0.05); scene.add(t0);
  const ph = Phone(1); ph.scale.setScalar(0.3); scene.add(ph);
  const lT = labelSprite('TOILET SEAT', '#8fd3ff', 1.0), lP = labelSprite('PHONE', '#9dff3a', 0.85), x10 = labelSprite('×10', '#ff3b30', 1.7); scene.add(lT, lP, x10);
  lT.position.set(0.55, -0.18, 0.5); lP.position.set(-0.55, -0.18, 0.5);
  const germs = swarm(scene, 14, 3, [-0.85, -0.25, 0.2, 1.35, 0.4, 0.55]);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const k = eout(ss(tGrow - 0.4, tGrow + 0.8, t)); pb.scale.y = Math.max(0.1, k); ph.position.set(-0.55, 1.4 * Math.max(0.1, k) + 0.34, 0.1); ph.rotation.z = 0.1 * Math.sin(t * 3);
      germs.forEach((g, i) => { wiggle(g, t); const b = g.userData.base; g.position.set(b.x, Math.min(b.y, 1.4 * k), b.z); g.visible = b.y < 1.4 * k; });
      popLabel(x10, 1.7, back(clamp((t - tGrow - 0.7) / 0.3))); x10.position.set(0.5, 0.95, 0.5);
      look(c, mix(V(0, 1.1, 6.6), V(0, 1.15, 6.2), eio(t / d)), V(0, 1.15, 0));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// =============== s04: toilet seats get cleaned ===============
export function scrub(tClean) {
  const scene = new THREE.Scene(); bathroom(scene, { shadow: true });
  const t0 = Toilet(); t0.position.set(0, 0, 0); t0.rotation.y = -0.3; scene.add(t0);
  const bottle = new THREE.Group(); const bb = M(RB(0.14, 0.26, 0.09, 0.03, 2), 0x3ad1ff, { px: 3 }); bottle.add(bb); const nz = M(RB(0.06, 0.08, 0.06, 0.01, 2), 0xffffff, { px: 2 }); nz.position.y = 0.17; bottle.add(nz); const tr = M(RB(0.03, 0.08, 0.03, 0.01, 1), 0xffffff, { px: 2 }); tr.position.set(0.05, 0.12, 0); bottle.add(tr); scene.add(bottle);
  const sponge = M(RB(0.18, 0.06, 0.1, 0.02, 2), YEL, { px: 3 }); scene.add(sponge);
  const mist = []; for (let i = 0; i < 12; i++) { const m = halo(0xbfefff, 0.15, 0); scene.add(m); mist.push(m); }
  const sparkles = []; for (let i = 0; i < 10; i++) { const s = halo(0xffffff, 0.12, 0); s.position.set(Math.cos(i) * 0.22, 0.45, Math.sin(i) * 0.26); scene.add(s); sparkles.push(s); }
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      bottle.position.set(0.45, 0.85, 0.3); bottle.rotation.z = 0.5;
      mist.forEach((m, i) => { const u = ((t * 1.5 + i / 12) % 1); m.position.set(lerp(0.4, 0.05, u), lerp(0.95, 0.45, u), lerp(0.3, 0.05, u) + 0.05 * Math.sin(i)); m.material.opacity = t < tClean ? 0.5 * Math.sin(Math.PI * u) : 0; });
      const k = clamp((t - tClean) / 1.5); sponge.position.set(0.18 * Math.cos(t * 9), 0.47, 0.22 * Math.sin(t * 9)); sponge.visible = t > tClean - 0.2 && k < 1;
      sparkles.forEach((s, i) => { s.material.opacity = ss(tClean + 0.4, tClean + 0.8, t) * (0.5 + 0.5 * Math.sin(t * 7 + i)); });
      look(c, mix(V(0.4, 1.7, 3.0), V(0.35, 1.6, 2.6), eio(t / d)), V(0, 0.55, 0));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s05: your phone? almost never — dusty, germy phone, "LAST CLEANED: NEVER" ===============
export function never(tNever) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#0c0716'], [1, '#2a1238']]);
  lights(scene, { hemi: 1.0, sky: 0xffffff, ground: 0x2a1238, keyI: 1.6, keyPos: [-2, 4, 5], rim: PINKG, rimI: 1.0 });
  const ph = Phone(1); ph.position.set(0, 0.0, 0); scene.add(ph);
  const germs = swarm(scene, 22, 11, [-0.5, 0.5, -1.0, 1.0, 0.1, 0.25]);
  const tag = canvasTex(700, 220, (x, w, h) => { x.fillStyle = '#fff7ea'; x.beginPath(); x.roundRect(0, 0, w, h, 30); x.fill(); x.fillStyle = '#1d2438'; x.font = '800 54px Inter'; x.textAlign = 'center'; x.fillText('LAST CLEANED:', w / 2, 82); x.fillStyle = '#ff3b30'; x.font = '900 86px Inter'; x.fillText('NEVER', w / 2, 175); });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.38), new THREE.MeshBasicMaterial({ map: tag, transparent: true })); card.position.set(0, -0.62, 0.45); card.rotation.z = -0.06; scene.add(card);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      ph.rotation.set(-0.1, 0.2 * Math.sin(t * 0.8), 0.04 * Math.sin(t * 1.4));
      germs.forEach((g, i) => { wiggle(g, t); const b = g.userData.base; g.position.set(b.x + 0.04 * Math.sin(t * 2 + i), b.y + 0.04 * Math.cos(t * 3 + i), b.z); });
      const k = back(clamp((t - tNever) / 0.3)); card.scale.setScalar(Math.max(0.001, k)); card.visible = k > 0.01;
      look(c, mix(V(0, 0.2, 4.6), V(0, 0.15, 4.0), eio(t / d)), V(0, 0.0, 0));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// person sitting (on the toilet seat or a bench) holding a phone in front of the face
function sitPhone(g, t, seatY = 0.42) {
  const J = g.userData.J; poseStand(g, t);
  J.hips.position.y = seatY + 0.07; J.leg.L.l.rotation.set(-1.45, 0, -0.1); J.leg.R.l.rotation.set(-1.45, 0, 0.1); J.leg.L.kn.rotation.x = 1.4; J.leg.R.kn.rotation.x = 1.4;
  J.chest.rotation.x = 0.15; J.head.rotation.set(0.35, 0.05 * Math.sin(t), 0);
  J.arm.L.a.rotation.set(-0.9, 0, -0.25); J.arm.R.a.rotation.set(-0.9, 0, 0.25); J.arm.L.b.rotation.set(-1.25, 0, 0.6); J.arm.R.b.rotation.set(-1.25, 0, -0.6);
}
// =============== s06: and you take it to the bathroom ===============
export function scroll() {
  const scene = new THREE.Scene(); bathroom(scene, { shadow: true });
  const t0 = Toilet(); scene.add(t0);
  const p = Subject({ col: { torso: 0x3a86ff, upper: 0x3a86ff, fore: C.skin, hand: C.skin, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0xf4f1ea } }); p.position.set(0, 0, 0.12); scene.add(p);
  const ph = Phone(1); ph.scale.setScalar(0.16); scene.add(ph); const sg = halo(0x9ad8ff, 0.6, 0.5); scene.add(sg);
  const wp = new THREE.Vector3(), wq = new THREE.Vector3(), c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      sitPhone(p, t); p.userData.face({ open: 0.15, wide: 0.2, lookY: -0.6 });
      p.userData.J.arm.L.hand.getWorldPosition(wp); p.userData.J.arm.R.hand.getWorldPosition(wq); ph.position.copy(wp).add(wq).multiplyScalar(0.5).add(V(0, 0.08, 0.02)); ph.rotation.set(-0.7, 0, 0); sg.position.copy(ph.position).add(V(0, 0.05, 0.05)); sg.material.opacity = 0.35 + 0.1 * Math.sin(t * 6);
      look(c, mix(V(0.9, 1.35, 3.6), V(0.8, 1.3, 3.2), eio(t / d)), V(0, 0.82, 0));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s07: one flush — an invisible plume ~5 ft high in 8 seconds (lasers make it visible) ===============
export function plume(t5, t8) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#020409'], [1, '#0b1424']]);
  lights(scene, { hemi: 0.7, sky: 0xb8d0ff, ground: 0x050810, keyI: 1.0, keyPos: [-2, 4, 4], rim: SLIME, rimI: 1.4 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), toon(0x141c2e)); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const t0 = Toilet(); scene.add(t0);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.9), addMat(SLIME, 0.06)); sheet.position.set(0, 1.0, 0); scene.add(sheet);
  const N = 380, pos = new Float32Array(N * 3), seeds = [], r = rnd(9); for (let i = 0; i < N; i++) seeds.push([r(), r(), r(), r()]);
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const sprite = canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); });
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: sprite, color: LIME, size: 18, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(pts);
  // height ruler in feet (1 ft = 0.3048 m)
  const ruler = canvasTex(160, 1024, (x, w, h) => { x.fillStyle = 'rgba(10,15,25,0.0)'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffffff'; x.fillStyle = '#ffffff'; x.font = '900 46px Inter'; x.lineWidth = 6; x.beginPath(); x.moveTo(20, 0); x.lineTo(20, h); x.stroke();
    for (let f = 0; f <= 6; f++) { const y = h - f * (h / 6); x.beginPath(); x.moveTo(20, y); x.lineTo(70, y); x.stroke(); if (f > 0) x.fillText(f + ' FT', 78, y + 16); } });
  const rl = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 6 * 0.3048 / 1.0 * 1.0), new THREE.MeshBasicMaterial({ map: ruler, transparent: true })); rl.position.set(0.55, 6 * 0.3048 / 2, 0.1); scene.add(rl);
  const mark = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.012, 0.01), glowMat(YEL, 1)); mark.position.set(0.15, 5 * 0.3048, 0.1); scene.add(mark);
  const timer = canvasTex(400, 160, () => {}); const tm = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.25), new THREE.MeshBasicMaterial({ map: timer, transparent: true })); tm.position.set(-0.42, 0.25, 0.4); scene.add(tm);
  let lastSec = -1;
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      // map the 8 seconds of the real plume onto the narration (flush at 0.2 s, 5 ft at t5, timer hits 8 at t8)
      const sim = clamp((t - 0.2) / Math.max(0.5, t8 - 0.2)) * 8, H5 = 5 * 0.3048;
      t0.userData.handle.rotation.z = 0.6 - 0.5 * ss(0.1, 0.3, t) * (1 - ss(0.5, 0.8, t));
      for (let i = 0; i < N; i++) { const s = seeds[i]; const born = s[0] * 6.5, age = sim - born; const top = H5 * (0.55 + 0.45 * s[1]);
        if (age < 0) { pos[i * 3 + 1] = -5; continue; }
        const u = Math.min(1, age / 2.2), y = 0.4 + (top - 0.4) * eout(u), spread = 0.12 + 0.45 * u * s[2];
        pos[i * 3] = Math.cos(s[3] * 6.28 + age) * spread; pos[i * 3 + 1] = y + 0.03 * Math.sin(age * 3 + i); pos[i * 3 + 2] = Math.sin(s[3] * 6.28 + age) * spread * 0.6; }
      geo.attributes.position.needsUpdate = true;
      const mk = ss(t5 - 0.2, t5 + 0.2, t); mark.scale.x = Math.max(0.001, mk); mark.visible = mk > 0.01;
      const sec = Math.min(8, Math.floor(sim)); if (sec !== lastSec) { lastSec = sec; const x = timer.userData.cv.getContext('2d'); x.clearRect(0, 0, 400, 160); x.fillStyle = 'rgba(10,12,20,0.75)'; x.beginPath(); x.roundRect(10, 10, 380, 140, 30); x.fill(); x.fillStyle = sec >= 8 ? '#ff3b30' : '#ffffff'; x.font = '900 96px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('0:0' + sec, 200, 85); timer.needsUpdate = true; }
      look(c, mix(V(0.1, 1.05, 5.2), V(0.05, 1.0, 4.7), eio(t / d)), V(0.05, 0.95, 0));
    },
    ui: () => ({ vig: 0.35 }),
  };
}
// =============== s08: then your phone goes right back to your face ===============
export function face(tTouch) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#0c0716'], [1, '#22123a']]);
  lights(scene, { hemi: 1.0, sky: 0xffffff, ground: 0x22123a, keyI: 1.6, keyPos: [-2, 4, 5], rim: LIME, rimI: 1.2 });
  const p = Subject({ col: { torso: 0x3a86ff, upper: 0x3a86ff, fore: C.skin, hand: C.skin, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0xf4f1ea } }); scene.add(p); poseStand(p);
  const ph = Phone(1); ph.scale.setScalar(0.17); scene.add(ph);
  const germs = []; for (let i = 0; i < 12; i++) { const g = Germ([LIME, PURP, PINKG][i % 3], 0.35, 50 + i); g.userData.o = V((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.25, 0.02); scene.add(g); germs.push(g); }
  const wp = new THREE.Vector3(), hp = new THREE.Vector3(), c = cam(32);
  return {
    scene, camera: c,
    update(t, d) {
      poseStand(p, t); const J = p.userData.J, k = ss(tTouch - 0.6, tTouch, t);
      J.arm.R.a.rotation.set(lerp(0, -0.4, k), 0, lerp(0.16, 0.9, k)); J.arm.R.b.rotation.set(lerp(-0.12, -2.3, k), 0, 0); J.head.rotation.set(0, -0.15 * k, 0.1 * k);
      p.userData.face({ open: 0.3, wide: 0.2 + 0.6 * ss(tTouch, tTouch + 0.3, t), lookX: 0.6 * k });
      J.arm.R.hand.getWorldPosition(wp); ph.position.copy(wp).add(V(0, 0.08, 0.02)); ph.rotation.set(0, -0.6 * k - 0.2, 0.3 * (1 - k));
      J.head.getWorldPosition(hp);
      germs.forEach((g, i) => { wiggle(g, t); const u = ss(tTouch + i * 0.05, tTouch + 0.5 + i * 0.05, t); const a = ph.position.clone().add(g.userData.o), b = hp.clone().add(V(0.06 + (i % 4) * 0.03, -0.02 + Math.floor(i / 4) * 0.04, 0.12)); g.position.copy(a.lerp(b, u)); g.position.y += Math.sin(Math.PI * u) * 0.12; });
      look(c, mix(V(0.2, 1.75, 2.4), V(0.15, 1.7, 2.1), eio(t / d)), V(0.05, 1.68, 0));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s09: good news — most of those germs are harmless ===============
export function harmless(tGood) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#06140c'], [1, '#0e3020']]);
  lights(scene, { hemi: 1.1, sky: 0xffffff, ground: 0x0e3020, keyI: 1.6, keyPos: [-2, 4, 5], rim: SLIME, rimI: 1.0 });
  const germs = swarm(scene, 18, 21, [-0.9, 0.9, -0.6, 1.4, -0.3, 0.3], [PURP, PINKG, LIME]);
  const ring = []; germs.forEach((g, i) => { const h = halo(i % 6 === 0 ? RED : SLIME, 0.5, 0); g.add(h); ring.push(h); });
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      germs.forEach((g, i) => { wiggle(g, t); const b = g.userData.base; g.position.set(b.x + 0.05 * Math.sin(t * 2 + i), b.y + 0.05 * Math.cos(t * 2.5 + i), b.z);
        const k = ss(tGood + i * 0.04, tGood + 0.3 + i * 0.04, t), bad = i % 6 === 0;
        g.userData.body.material.color.setHex(k > 0.5 ? (bad ? 0xff6b5b : 0x7dffb0) : [PURP, PINKG, LIME][i % 3]); g.userData.mouth.rotation.z = (k > 0.5 && !bad) ? 0 : Math.PI; ring[i].material.opacity = 0.5 * k; });
      look(c, mix(V(0, 0.45, 4.2), V(0, 0.4, 3.7), eio(t / d)), V(0, 0.35, 0));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
