import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, outlineMat, M, fresnel, glowMat, addMat, halo, setOpacity, lights, shake, Subject, poseStand } from '../../engine/engine.js';

// xr005 — The 1984 commercial-shoot accident (Shrine Auditorium, Jan 27, 1984).
// The performer is a GENERIC engine figure (no likeness, no signature outfit). No brand logos anywhere: names only in on-screen text.
// Fire is stylized (toon flames), nothing graphic; the injury is shown only as an x-ray scalp diagram.
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);

// palette: deep violet stage, magenta + teal light, orange fire
const BG = 0x120a24, BACK = 0x24143f, FLOOR = 0x1c1530, STEP = 0x3a2c5c, STEPTOP = 0xe8e2f5, MAG = 0xff4fd8, TEAL = 0x3ee6d0, FIRE = 0xff7a1a, FIRE2 = 0xffc21a;
const JACKET = 0x2b3a67, PANTS = 0x1c1f2b, CREW = 0x3a3f4a;

function labelSprite(text, color = '#ffffff', w = 1.6) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 192; const x = cv.getContext('2d');
  x.font = '900 112px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.lineWidth = 28; x.strokeStyle = '#0b0b0f'; x.strokeText(text, 512, 100); x.fillStyle = color; x.fillText(text, 512, 100);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.scale.set(w, w * 192 / 1024, 1); s.renderOrder = 20; return s;
}
function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

// ---------------- the performer (generic) ----------------
function Performer(o = {}) {
  const g = Subject({ col: { torso: JACKET, upper: JACKET, fore: JACKET, thigh: PANTS, shin: PANTS, shoe: 0x111318, hand: C.skin, ...(o.col || {}) }, xray: o.xray });
  poseStand(g); return g;
}
function poseWalk(g, ph, amt = 1) {
  const J = g.userData.J, s = Math.sin(ph), c = Math.cos(ph);
  J.leg.L.l.rotation.set(-0.45 * s * amt - 0.15, 0, -0.04); J.leg.R.l.rotation.set(0.45 * s * amt - 0.15, 0, 0.04);
  J.leg.L.kn.rotation.x = 0.25 + 0.35 * Math.max(0, c) * amt; J.leg.R.kn.rotation.x = 0.25 + 0.35 * Math.max(0, -c) * amt;
  J.arm.L.a.rotation.set(0.5 * s * amt, 0, -0.35); J.arm.R.a.rotation.set(-0.5 * s * amt, 0, 0.35);
  J.arm.L.b.rotation.set(-0.5, 0, 0); J.arm.R.b.rotation.set(-0.5, 0, 0);
  J.hips.position.y = 0.92 + 0.02 * Math.abs(c); J.chest.rotation.set(0.05, 0.08 * s, 0); J.head.rotation.set(0.05, -0.05 * s, 0);
}
function poseDance(g, t) {
  const J = g.userData.J, s = Math.sin;
  const b = s(t * 7.5), b2 = s(t * 7.5 + 1.6);
  J.arm.L.a.rotation.set(-0.6 + 0.4 * b, 0, -1.1 - 0.3 * b2); J.arm.R.a.rotation.set(-0.3 - 0.5 * b2, 0, 1.25 + 0.25 * b);
  J.arm.L.b.rotation.set(-1.1 - 0.3 * b, 0, -0.3); J.arm.R.b.rotation.set(-0.9 + 0.3 * b2, 0, 0.3);
  J.leg.L.l.rotation.set(-0.25 + 0.2 * b, 0, -0.2); J.leg.R.l.rotation.set(0.1 - 0.15 * b, 0, 0.18);
  J.leg.L.kn.rotation.x = 0.45 + 0.2 * Math.max(0, b); J.leg.R.kn.rotation.x = 0.3 + 0.2 * Math.max(0, -b);
  J.hips.position.y = 0.86 + 0.04 * Math.abs(b); J.hips.rotation.set(0, 0, 0.08 * b);
  J.chest.rotation.set(0.12, 0.25 * b2, -0.1 * b); J.head.rotation.set(-0.08, -0.2 * b2, 0.06 * b);
}
function poseSpin(g) {
  const J = g.userData.J;
  J.arm.L.a.rotation.set(-0.2, 0, -0.5); J.arm.R.a.rotation.set(-1.2, 0, 0.9); J.arm.L.b.rotation.set(-1.4, 0, 0); J.arm.R.b.rotation.set(-0.8, 0, 0);
  J.leg.L.l.rotation.set(0, 0, -0.05); J.leg.R.l.rotation.set(-0.7, 0, 0.25); J.leg.L.kn.rotation.x = 0.05; J.leg.R.kn.rotation.x = 1.3;
  J.hips.position.y = 0.95; J.chest.rotation.set(0.0, 0, 0); J.head.rotation.set(-0.15, 0, 0);
}

// ---------------- stylized flames on the head ----------------
function Flame() {
  // a crown of curved toon tongues: red-orange outside, yellow inside, pale core. Nothing touches the face.
  const g = new THREE.Group(), r = rnd(31), tongues = [];
  const tongue = (rad, h) => { const geo = new THREE.ConeGeometry(rad, h, 14, 6); geo.translate(0, h / 2, 0);
    const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i) / h; p.setX(i, p.getX(i) + 0.35 * rad * Math.sin(y * 3.2) * y); } geo.computeVertexNormals(); return geo; };
  const specs = [];
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; specs.push([Math.cos(a) * 0.1, Math.sin(a) * 0.09 - 0.02, 0.075, 0.3 + r() * 0.2, 0xff4a12, a]); }
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2 + 0.4; specs.push([Math.cos(a) * 0.05, Math.sin(a) * 0.045 - 0.02, 0.06, 0.32 + r() * 0.16, 0xff9a1a, a]); }
  specs.push([0, -0.02, 0.06, 0.48, 0xff9a1a, 0]); specs.push([0, -0.02, 0.045, 0.34, 0xffd23a, 0]); specs.push([0.03, -0.01, 0.03, 0.2, 0xfff3b0, 0]);
  for (const [x, z, rad, h, col, a] of specs) {
    const m = col === 0xff4a12 ? M(tongue(rad, h), col, { px: 4, shadow: false, matOpts: { emissive: 0x801800 } })
      : col === 0xff9a1a ? M(tongue(rad, h), col, { px: 3, shadow: false, outline: false, matOpts: { emissive: 0x803a00 } }) : new THREE.Mesh(tongue(rad, h), new THREE.MeshBasicMaterial({ color: col }));
    m.position.set(x, 0, z); m.userData = { p: r() * 6, sp: 9 + r() * 6, ox: x * 2.2, oz: z * 2.2 }; g.add(m); tongues.push(m);
  }
  const glow = halo(0xff5a1a, 0.9, 0.45); glow.position.y = 0.18; g.add(glow);
  g.userData.set = (k, t) => {
    g.visible = k > 0.01;
    for (const m of tongues) { const a = m.userData, f = 0.8 + 0.25 * Math.sin(t * a.sp + a.p) + 0.1 * Math.sin(t * 23 + a.p * 3);
      m.scale.set(k * (0.9 + 0.1 * Math.sin(t * 13 + a.p)), k * f, k); m.rotation.z = -a.ox + 0.15 * Math.sin(t * 7 + a.p); m.rotation.x = a.oz - 0.2 + 0.1 * Math.sin(t * 6 + a.p); }
    glow.scale.setScalar(0.4 + 0.8 * k); glow.material.opacity = 0.45 * k;
  };
  g.userData.set(0, 0); return g;
}
function addFlame(fig) { const f = Flame(); f.position.set(0, 0.11, -0.03); fig.userData.J.head.add(f); return f; }

// ---------------- sparks (ballistic) ----------------
function Sparks(n, seed, col = [0xffe36b, 0xff9a2e, 0xffffff]) {
  const g = new THREE.Group(), r = rnd(seed), ps = [];
  for (let i = 0; i < n; i++) {
    const s = halo(col[i % col.length], 0.4, 1); g.add(s);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 4), new THREE.MeshBasicMaterial({ color: 0xffffff })); s.add(core);
    ps.push({ s, o: r(), v: V((r() - .5) * 1.4, 4.5 + r() * 2.5, (r() - .5) * 1.4), life: 0.7 + r() * 0.5 });
  }
  g.userData.ps = ps;
  // fountain from origin; k = intensity
  g.userData.fountain = (t, org, k = 1, gScale = 1) => {
    for (const p of ps) { const age = ((t / p.life + p.o) % 1) * p.life, f = age / p.life;
      p.s.position.set(org.x + p.v.x * age, org.y + p.v.y * age * gScale - 4.9 * age * age, org.z + p.v.z * age);
      p.s.material.opacity = k * (1 - f); p.s.scale.setScalar(0.4 * (1 - 0.5 * f)); p.s.visible = k > 0.01; }
  };
  return g;
}

// ---------------- the set ----------------
const STEPS = 10, RISE = 0.28, RUN = 0.5, TOPY = STEPS * RISE, Z0 = -STEPS * RUN;   // stairs from (y=TOPY, z=Z0) down to (0, 0)
const stairY = z => z <= Z0 ? TOPY : z >= 0 ? 0 : TOPY * (1 - (z - Z0) / -Z0) + 0.12;
function stageSet(scene, o = {}) {
  scene.background = new THREE.Color(BG); scene.fog = new THREE.Fog(BG, 16, 40);
  const L = lights(scene, { hemi: 0.75, sky: 0xd9c8ff, ground: 0x241a3a, keyI: 2.0, key: 0xfff0e0, keyPos: [-3, 7, 8], rim: MAG, rimI: 1.4, rimPos: [3, 5, -6] });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), toon(FLOOR)); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  // stage edge strip
  const edge = new THREE.Mesh(new THREE.BoxGeometry(18, 0.06, 0.08), glowMat(TEAL, 0.9)); edge.position.set(0, 0.03, 3.2); scene.add(edge);
  // backdrop with vertical light bars
  const bd = M(new THREE.BoxGeometry(22, 12, 0.3), BACK, { px: 4, outline: false }); bd.position.set(0, 6, -7.5); scene.add(bd);
  const bars = [];
  for (let i = -5; i <= 5; i++) { if (Math.abs(i) < 2) continue;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.22, 7.5, 0.05), glowMat(i % 2 ? MAG : TEAL, 0.85)); b.position.set(i * 1.25, 4.6, -7.3); scene.add(b); bars.push(b); }
  // staircase
  const stairs = new THREE.Group(); scene.add(stairs);
  const plat = M(RB(3.4, TOPY, 2.2, 0.04, 2), STEP, { px: 5 }); plat.position.set(0, TOPY / 2, Z0 - 1.1); stairs.add(plat);
  const platTop = new THREE.Mesh(new THREE.BoxGeometry(3.42, 0.04, 2.22), toon(STEPTOP)); platTop.position.set(0, TOPY + 0.01, Z0 - 1.1); stairs.add(platTop);
  for (let i = 0; i < STEPS; i++) {
    const h = TOPY - (i + 1) * RISE + RISE, z = Z0 + (i + 0.5) * RUN;
    const s = M(RB(3.0, h, RUN, 0.02, 2), STEP, { px: 4 }); s.position.set(0, h / 2, z); stairs.add(s);
    const nose = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.035, 0.06), glowMat(i % 2 ? 0xffffff : 0xffe7a8, 0.95)); nose.position.set(0, h + 0.005, z + RUN / 2 - 0.03); stairs.add(nose);
  }
  // pyro canisters at the top of the stairs
  const cans = [];
  for (const sx of [-1, 1]) {
    const cn = M(new THREE.CylinderGeometry(0.16, 0.2, 0.42, 20), 0x2b2b33, { px: 4 }); cn.position.set(sx * 1.3, TOPY + 0.21, Z0 + 0.05); scene.add(cn);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 6, 20), glowMat(C.red, 1)); ring.rotation.x = Math.PI / 2; ring.position.set(sx * 1.3, TOPY + 0.43, Z0 + 0.05); scene.add(ring);
    cans.push(V(sx * 1.3, TOPY + 0.45, Z0 + 0.05));
  }
  // truss + light beams
  const truss = M(new THREE.BoxGeometry(16, 0.3, 0.3), 0x3b3550, { px: 3 }); truss.position.set(0, 10, -1.5); scene.add(truss);
  const beams = [];
  for (const [x, col, aim] of [[-5, MAG, [-1.2, -2.5]], [-2.2, 0xfff1d6, [0, -4]], [2.2, 0xfff1d6, [0.2, -4]], [5, TEAL, [1.4, -2.5]]]) {
    const hgt = 11, geo = new THREE.ConeGeometry(1.5, hgt, 32, 1, true); geo.translate(0, -hgt / 2, 0);
    const bm = new THREE.Mesh(geo, addMat(col, 0.09)); bm.position.set(x, 10, -1.5);
    bm.lookAt(V(aim[0], 0, aim[1])); bm.rotateX(-Math.PI / 2); scene.add(bm); beams.push(bm);
    const lamp = halo(col, 1.6, 0.9); lamp.position.set(x, 10, -1.5); scene.add(lamp);
  }
  return { L, bars, beams, cans, stairs };
}
function crowd(scene, o = {}) {
  const r = rnd(o.seed || 12), g = new THREE.Group(); scene.add(g);
  const body = [0x1a1530, 0x221a3c, 0x161226], hair = [0x0d0b12, 0x2a1d14, 0x3a2a1a, 0x101014];
  const rows = o.rows || 4, per = o.per || 10;
  for (let j = 0; j < rows; j++) for (let i = 0; i < per; i++) {
    const p = new THREE.Group(); const x = (i - (per - 1) / 2) * 0.9 + (r() - .5) * 0.3 + (j % 2) * 0.45, z = (o.z || 6) + j * 0.9;
    p.position.set(x, (o.y || 0) + j * 0.18, z); g.add(p);
    const sh = M(new THREE.CapsuleGeometry(0.26, 0.3, 6, 14), body[Math.floor(r() * 3)], { px: 3 }); sh.rotation.z = Math.PI / 2; sh.scale.set(1, 1, 0.7); sh.position.y = 1.15; p.add(sh);
    const hd = M(new THREE.SphereGeometry(0.17, 18, 12), 0x2a2238, { px: 3 }); hd.position.y = 1.52; p.add(hd);
    const hr = M(new THREE.SphereGeometry(0.178, 18, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), hair[Math.floor(r() * 4)], { px: 3 }); hr.position.y = 1.53; p.add(hr);
    if (r() < 0.3) { const arm = M(new THREE.CapsuleGeometry(0.06, 0.55, 4, 10), body[0], { px: 3 }); const s = r() < 0.5 ? -1 : 1; arm.position.set(s * 0.3, 1.6, 0); arm.rotation.z = -s * 0.35; p.add(arm); p.userData.arm = arm; }
    p.userData.ph = r() * 6;
  }
  g.userData.update = t => { for (const p of g.children) { p.position.y += 0.0; const a = p.userData.arm; if (a) a.rotation.z = Math.sign(a.position.x) * -(0.35 + 0.2 * Math.sin(t * 5 + p.userData.ph)); } };
  return g;
}
function pulseSet(S, t) {
  S.bars.forEach((b, i) => b.material.opacity = 0.55 + 0.4 * Math.max(0, Math.sin(t * 3 + i * 0.9)));
  S.beams.forEach((b, i) => b.rotation.z = 0.06 * Math.sin(t * 0.8 + i));
}
// performer walking down the stairs: u 0..1 along the stairs
function onStairs(fig, u, t) {
  const z = lerp(Z0 - 0.4, 0.5, u); fig.position.set(0, stairY(z), z); fig.rotation.y = 0; poseWalk(fig, t * 6.5, 0.8);
}

// =============== s01 / loop end: HOOK — hair ablaze, still dancing (close, low angle) ===============
export function hook(mode) {
  const scene = new THREE.Scene(); const S = stageSet(scene); crowd(scene, { z: 5.2, rows: 1, per: 8, y: -0.6, seed: 4 });
  const fig = Performer(); scene.add(fig); fig.position.set(0, 0, 0.6); const fl = addFlame(fig);
  const sp = Sparks(22, 5, [0xffb03a, 0xff7a1a]); scene.add(sp);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      pulseSet(S, t); poseDance(fig, t); fig.rotation.y = 0.25 * Math.sin(t * 1.3);
      fl.userData.set(1, t);
      const hp = new THREE.Vector3(); fig.userData.J.head.getWorldPosition(hp); sp.userData.fountain(t, hp.clone().add(V(0, 0.2, 0)), 0.5, 0.3);
      look(c, mix(V(0.5, 1.2, 5.6), V(0.3, 1.3, 4.9), eio(t / d)), V(0, 1.38, 0.4));
      shake(c, t, 0.05, 0.03, 0.3);
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// =============== s02: date — empty stage, lights sweep, stairs waiting ===============
export function establish() {
  const scene = new THREE.Scene(); const S = stageSet(scene); const cr = crowd(scene, { z: 5.5, rows: 3, per: 12, seed: 9 });
  const c = cam(40);
  return {
    scene, camera: c,
    update(t, d) { pulseSet(S, t); cr.userData.update(t); look(c, mix(V(-2.5, 3.2, 14), V(1.5, 3.6, 12.5), eio(t / d)), V(0, 3.2, -3)); },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s03: a film camera on a tripod aimed at the set ===============
function FilmCam() {
  const g = new THREE.Group();
  const body = M(RB(0.9, 0.6, 1.3, 0.06, 3), 0x5a6072, { px: 5 }); body.position.y = 1.7; g.add(body);
  const lens = M(new THREE.CylinderGeometry(0.2, 0.24, 0.5, 24), 0x1a1c22, { px: 5 }); lens.rotation.x = Math.PI / 2; lens.position.set(0, 1.7, -0.85); g.add(lens);
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), new THREE.MeshBasicMaterial({ color: 0x6fd6ff })); glass.position.set(0, 1.7, -1.11); glass.rotation.y = Math.PI; g.add(glass);
  const reels = [];
  for (const z of [-0.3, 0.35]) { const rl = M(new THREE.CylinderGeometry(0.36, 0.36, 0.12, 32), 0x3a3e4a, { px: 4 }); rl.rotation.z = Math.PI / 2; rl.position.set(0, 2.35, z); g.add(rl); reels.push(rl);
    for (let k = 0; k < 3; k++) { const hole = new THREE.Mesh(new THREE.CircleGeometry(0.07, 12), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); hole.position.set(0.065, Math.cos(k * 2.09) * 0.18, Math.sin(k * 2.09) * 0.18); hole.rotation.y = Math.PI / 2; rl.add(hole); } }
  const tally = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: C.red })); tally.position.set(0.3, 2.04, -0.5); g.add(tally);
  const th = halo(C.red, 0.5, 0.8); th.position.copy(tally.position); g.add(th);
  for (let k = 0; k < 3; k++) { const a = k * 2.09 + 0.5, leg = M(new THREE.CylinderGeometry(0.035, 0.035, 1.6, 8), 0x55596a, { px: 3 }); leg.position.set(Math.cos(a) * 0.35, 0.7, Math.sin(a) * 0.35); leg.rotation.set(Math.sin(a) * 0.4, 0, -Math.cos(a) * 0.4); g.add(leg); }
  g.userData = { reels, tally: th }; return g;
}
export function filmcam() {
  const scene = new THREE.Scene(); const S = stageSet(scene);
  const fc = FilmCam(); fc.position.set(-0.15, 0, 4.4); fc.rotation.y = 0.25; fc.scale.setScalar(0.78); scene.add(fc);
  const fig = Performer(); scene.add(fig); fig.position.set(0, TOPY, Z0 - 0.6); poseStand(fig);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      pulseSet(S, t); for (const r of fc.userData.reels) r.rotation.x = t * 3; fc.userData.tally.material.opacity = 0.5 + 0.5 * (Math.sin(t * 8) > 0 ? 1 : 0);
      poseStand(fig, t); fig.userData.J.arm.R.a.rotation.z = 0.5 + 0.1 * Math.sin(t * 3);
      look(c, mix(V(0.5, 3.0, 9.6), V(0.25, 2.9, 8.9), eio(t / d)), V(-0.2, 2.45, -2));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// =============== s04: thousands of fans — from behind the crowd ===============
export function fans() {
  const scene = new THREE.Scene(); const S = stageSet(scene); const cr = crowd(scene, { z: 4.5, rows: 6, per: 14, seed: 21 });
  const fig = Performer(); scene.add(fig); fig.position.set(0, TOPY, Z0 - 0.6);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t, d) { pulseSet(S, t); cr.userData.update(t); poseStand(fig, t); look(c, mix(V(0, 4.4, 11.2), V(0, 4.0, 10.0), eio(t / d)), V(0, 2.4, -3.5)); },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s05: clapperboard — TAKE 6 ===============
export function clapper(tSnap) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG);
  lights(scene, { hemi: 1.0, sky: 0xe9ddff, ground: 0x2a1d45, keyI: 1.8, keyPos: [-2, 3, 5], rim: MAG, rimI: 1.2 });
  const bh = halo(0x6a2fb0, 14, 0.5); bh.position.set(0, 0, -4); scene.add(bh);
  const tex = canvasTex(1024, 768, (x, w, h) => {
    x.fillStyle = '#16151c'; x.fillRect(0, 0, w, h); x.strokeStyle = '#f2f0ea'; x.lineWidth = 8;
    x.strokeRect(30, 30, w - 60, h - 60); x.beginPath(); x.moveTo(30, 300); x.lineTo(w - 30, 300); x.moveTo(512, 300); x.lineTo(512, h - 30); x.stroke();
    x.fillStyle = '#f2f0ea'; x.font = '900 86px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('COMMERCIAL', 512, 170); x.font = '800 64px Inter, sans-serif'; x.fillText('SCENE', 270, 380); x.fillText('TAKE', 760, 380);
    x.font = '900 230px Inter, sans-serif'; x.fillText('1', 270, 560); x.fillStyle = '#FFD60A'; x.fillText('6', 760, 560);
  });
  const g = new THREE.Group(); g.position.y = 1.1; scene.add(g);
  const board = M(RB(4, 3, 0.16, 0.05, 2), 0x16151c, { px: 6 }); g.add(board);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(3.86, 2.86), new THREE.MeshBasicMaterial({ map: tex })); face.position.z = 0.085; g.add(face);
  const stripes = canvasTex(512, 64, (x, w, h) => { for (let i = 0; i < 9; i++) { x.fillStyle = i % 2 ? '#f2f0ea' : '#16151c'; x.beginPath(); x.moveTo(i * 64 - 30, h); x.lineTo(i * 64 + 10, 0); x.lineTo(i * 64 + 74, 0); x.lineTo(i * 64 + 34, h); x.fill(); } });
  const base = M(RB(4, 0.45, 0.18, 0.03, 2), 0x16151c, { px: 5 }); base.position.y = 1.72; g.add(base);
  const bs = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 0.38), new THREE.MeshBasicMaterial({ map: stripes })); bs.position.set(0, 1.72, 0.095); g.add(bs);
  const hinge = new THREE.Group(); hinge.position.set(-2, 1.95, 0); g.add(hinge);
  const stick = M(RB(4, 0.42, 0.16, 0.03, 2), 0x16151c, { px: 5 }); stick.position.set(2, 0.21, 0); hinge.add(stick);
  const ss_ = new THREE.Mesh(new THREE.PlaneGeometry(3.9, 0.36), new THREE.MeshBasicMaterial({ map: stripes })); ss_.position.set(2, 0.21, 0.085); hinge.add(ss_);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const k = t < tSnap ? 1 - ss(tSnap - 0.5, tSnap, t) * 0 : 0; hinge.rotation.z = t < tSnap ? lerp(0.0, 0.22, ss(0, tSnap - 0.25, t)) * (1 - ss(tSnap - 0.12, tSnap, t)) : 0;
      g.rotation.set(-0.08, 0.18 * Math.sin(t * 0.7) - 0.12, 0.05 + (t > tSnap ? 0.03 * Math.exp(-(t - tSnap) * 8) * Math.sin((t - tSnap) * 60) : 0));
      look(c, V(0, 0.2, 15.6 - 0.8 * t / d), V(0, 0.25, 0)); shake(c, t, tSnap, 0.05, 0.25);
    },
  };
}
// =============== s06: down the staircase (wide, slightly high) ===============
export function descend() {
  const scene = new THREE.Scene(); const S = stageSet(scene);
  const fig = Performer(); scene.add(fig);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t, d) { pulseSet(S, t); onStairs(fig, lerp(0.0, 0.18, t / d), t); look(c, mix(V(3.2, 3.6, 7.5), V(2.6, 3.9, 6.4), eio(t / d)), V(0, 2.4, -3.4)); },
    ui: () => ({ vig: 0.25 }),
  };
}
// =============== s07: pyro fires too early — fountains over his head ===============
export function pyro(tFire) {
  const scene = new THREE.Scene(); const S = stageSet(scene);
  const fig = Performer(); scene.add(fig);
  const spL = Sparks(40, 7), spR = Sparks(40, 8); scene.add(spL, spR);
  const flashL = halo(0xffd27a, 2.4, 0), flashR = halo(0xffd27a, 2.4, 0); flashL.position.copy(S.cans[0]); flashR.position.copy(S.cans[1]); scene.add(flashL, flashR);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      pulseSet(S, t); onStairs(fig, lerp(0.18, 0.3, t / d), t);
      const k = ss(tFire, tFire + 0.15, t);
      spL.userData.fountain(t, S.cans[0], k); spR.userData.fountain(t + 0.37, S.cans[1], k);
      const f = Math.max(0, 1 - Math.abs(t - tFire - 0.08) * 4); flashL.material.opacity = flashR.material.opacity = 0.9 * f;
      look(c, mix(V(-2.4, 3.0, 5.2), V(-2.0, 3.2, 4.4), eio(t / d)), V(0, 3.5, -2.8)); shake(c, t, tFire, 0.04, 0.35);
    },
    ui: (t) => ({ flash: Math.max(0, 0.3 - Math.abs(t - tFire - 0.05) * 2) }),
  };
}
// =============== s08: sparks land in his hair — it ignites (close on the head) ===============
export function ignite(tLand, tFire) {
  const scene = new THREE.Scene(); const S = stageSet(scene);
  const fig = Performer(); scene.add(fig); const fl = addFlame(fig);
  const fall = Sparks(16, 13); scene.add(fall); const sp = Sparks(30, 14); scene.add(sp);
  const c = cam(32);
  return {
    scene, camera: c,
    update(t, d) {
      pulseSet(S, t); onStairs(fig, lerp(0.3, 0.42, t / d), t);
      const hp = new THREE.Vector3(); fig.userData.J.head.getWorldPosition(hp);
      sp.userData.fountain(t, S.cans[0], 1);
      // a cluster of sparks drifting down onto the hair
      fall.userData.ps.forEach((p, i) => { const a = clamp((t - tLand + 0.9 - p.o * 0.4) / 0.9); const st = V(hp.x - 0.9 + p.v.x * 0.3, hp.y + 1.3 + p.o * 0.4, hp.z - 0.3 + p.v.z * 0.2);
        p.s.position.copy(mix(st, V(hp.x + (p.v.x) * 0.06, hp.y + 0.16, hp.z - 0.02), eio(a))); p.s.material.opacity = a < 1 ? 1 : 0; p.s.visible = t < tFire + 0.3; p.s.scale.setScalar(0.22); });
      fl.userData.set(ss(tFire - 0.1, tFire + 0.7, t), t);
      look(c, mix(V(1.4, hp.y + 0.05, hp.z + 4.3), V(1.0, hp.y + 0.0, hp.z + 3.7), eio(t / d)), V(hp.x, hp.y - 0.08, hp.z));
    },
    ui: (t) => ({ flash: Math.max(0, 0.22 - Math.abs(t - tFire) * 1.5), vig: 0.3 }),
  };
}
// =============== s09: he doesn't notice — reaches the bottom and spins ===============
export function spin(tSpin) {
  const scene = new THREE.Scene(); const S = stageSet(scene); crowd(scene, { z: 5.0, rows: 1, per: 9, y: -0.7, seed: 6 });
  const fig = Performer(); scene.add(fig); const fl = addFlame(fig);
  const trail = []; for (let i = 0; i < 10; i++) { const h = halo(i % 2 ? FIRE : FIRE2, 0.35, 0.8); scene.add(h); trail.push(h); }
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      pulseSet(S, t); fl.userData.set(1, t);
      if (t < tSpin) { onStairs(fig, lerp(0.62, 1.0, clamp(t / tSpin)), t); }
      else { const k = t - tSpin; fig.position.set(0, 0, 0.5); poseSpin(fig); fig.rotation.y = eout(clamp(k / 0.9)) * Math.PI * 2 * 1.5 + k * 0.6; }
      const hp = new THREE.Vector3(); fig.userData.J.head.getWorldPosition(hp);
      trail.forEach((h, i) => { const a = (t - tSpin) * 9 - i * 0.35; h.visible = t > tSpin && i < 10; h.position.set(hp.x + Math.sin(a) * 0.12, hp.y + 0.2 - i * 0.01, hp.z + Math.cos(a) * 0.12); h.material.opacity = 0.7 * (1 - i / 10); });
      look(c, mix(V(-1.6, 1.5, 6.6), V(-1.1, 1.4, 5.0), eio(t / d)), V(0, 1.45, 0));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// =============== s10: the crew rushes in and smothers the flames (wide, symbolic) ===============
export function crew(tTackle, tOut) {
  const scene = new THREE.Scene(); const S = stageSet(scene);
  const fig = Performer(); scene.add(fig); fig.position.set(0, 0, 0.5); const fl = addFlame(fig);
  const men = [];
  for (const sx of [-1, 1]) { const m = Subject({ col: { torso: 0x6b7385, upper: 0x6b7385, fore: 0x6b7385, thigh: 0x2a2d36, shin: 0x2a2d36 } }); poseStand(m); scene.add(m); men.push({ m, sx }); }
  // a jacket thrown over his head to smother the flames
  const jk = M(new THREE.SphereGeometry(0.26, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), 0x9aa0ad, { px: 4 }); jk.material.side = THREE.DoubleSide; scene.add(jk);
  const smoke = []; for (let i = 0; i < 9; i++) { const s = halo(0x8a8fa0, 0.8, 0); scene.add(s); smoke.push(s); }
  const c = cam(38);
  return {
    scene, camera: c,
    update(t, d) {
      pulseSet(S, t);
      const down = ss(tTackle, tTackle + 0.45, t), J = fig.userData.J;
      poseSpin(fig); fig.rotation.set(0, 0.25, 0);
      // he drops to his knees, head down
      J.hips.position.y = lerp(0.95, 0.55, down); J.leg.L.l.rotation.set(lerp(0, -0.25, down), 0, -0.08); J.leg.R.l.rotation.set(lerp(-0.7, -0.25, down), 0, 0.08);
      J.leg.L.kn.rotation.x = lerp(0.05, 1.55, down); J.leg.R.kn.rotation.x = lerp(1.3, 1.55, down); J.chest.rotation.x = lerp(0, 0.55, down); J.head.rotation.x = lerp(-0.15, 0.3, down);
      J.arm.L.a.rotation.set(lerp(-0.2, -1.6, down), 0, -0.4); J.arm.R.a.rotation.set(lerp(-1.2, -1.6, down), 0, 0.4); J.arm.L.b.rotation.set(-1.8 * down, 0, 0); J.arm.R.b.rotation.set(-1.8 * down, 0, 0);
      fl.userData.set(1 - ss(tOut - 0.1, tOut + 0.35, t), t);
      men.forEach(({ m, sx }, i) => { const a = eout(ss(0, tTackle + 0.15, t - i * 0.1)); m.position.set(sx * lerp(4.2, 0.62, a), 0, 0.55 + sx * 0.05); m.rotation.y = -sx * Math.PI / 2;
        poseWalk(m, t * 11 + i * 2, 1.1 * (1 - down)); const MJ = m.userData.J; MJ.chest.rotation.x = 0.15 + 0.45 * down; MJ.hips.position.y = lerp(0.92, 0.8, down);
        MJ.arm.L.a.rotation.set(lerp(0.3, -1.25, down), 0, -0.15); MJ.arm.R.a.rotation.set(lerp(-0.3, -1.25, down), 0, 0.15); MJ.arm.L.b.rotation.set(-0.4, 0, 0); MJ.arm.R.b.rotation.set(-0.4, 0, 0); });
      scene.updateMatrixWorld(true);
      const hp = new THREE.Vector3(); J.head.getWorldPosition(hp);
      const jk_ = ss(tOut - 0.2, tOut + 0.05, t); jk.visible = jk_ > 0; jk.position.set(hp.x, lerp(hp.y + 0.35, hp.y + 0.02, jk_), hp.z); jk.rotation.set(0.3 * (1 - jk_), 0, 0.2 * (1 - jk_)); jk.scale.set(1, lerp(0.6, 1, jk_), 1);
      smoke.forEach((s, i) => { const k = clamp((t - tOut - 0.1 - i * 0.06) / 1.6); s.position.set(hp.x + (i - 4) * 0.08 * (0.3 + k), hp.y + 0.35 + k * 1.3, hp.z); s.scale.setScalar(0.5 + k * 1.6); s.material.opacity = 0.28 * Math.sin(Math.PI * k); });
      look(c, mix(V(0.6, 2.2, 6.4), V(0.4, 2.0, 5.6), eio(t / d)), V(0, 1.05, 0.5)); shake(c, t, tTackle + 0.3, 0.03, 0.3);
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s11: x-ray — 2nd and 3rd degree burns on the back of the scalp (diagram) ===============
export function scalp(tX) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(C.bg);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.4, key: 0xffffff, rimI: 1.0 });
  const bh = halo(0x0f5f78, 6, 0.55); bh.position.set(0, 1.7, -2); scene.add(bh);
  const solid = Performer(); scene.add(solid);
  const ghost = Performer({ xray: true }); scene.add(ghost);
  const sk = new THREE.Group(); ghost.userData.J.head.add(sk); sk.scale.set(0.95, 1.06, 1);
  // patches on the top-back of the skull: amber = 2nd degree, red = 3rd degree (small)
  const p2 = new THREE.Mesh(new THREE.SphereGeometry(0.162, 32, 16, Math.PI * 1.5 - 0.75, 1.5, 0.3, 0.75), new THREE.MeshBasicMaterial({ color: 0xffa21a, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
  const p3 = new THREE.Mesh(new THREE.SphereGeometry(0.165, 24, 12, Math.PI * 1.5 - 0.22, 0.44, 0.62, 0.26), new THREE.MeshBasicMaterial({ color: 0xff3b30, side: THREE.DoubleSide }));
  sk.add(p2, p3);
  const l2 = labelSprite('2ND DEGREE', '#FFB020', 0.44); const l3 = labelSprite('3RD DEGREE', '#FF3B30', 0.44); scene.add(l2, l3);
  const line2 = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 1), glowMat(0xffb020, 1)), line3 = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 1), glowMat(C.red, 1)); scene.add(line2, line3);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.012), glowMat(C.cyan, 1)); scene.add(scan);
  const c = cam(32);
  const a2 = V(), a3 = V();
  return {
    scene, camera: c,
    update(t, d) {
      const k = ss(tX, tX + 0.55, t); setOpacity(solid, 1 - k); setOpacity(ghost, k);
      p2.visible = p3.visible = k > 0.5; const pk = ss(tX + 0.5, tX + 0.9, t);
      p2.material.opacity = 0.85 * pk * (0.85 + 0.15 * Math.sin(t * 6)); p3.scale.setScalar(lerp(0.6, 1, pk));
      poseStand(solid, t); poseStand(ghost, t); solid.userData.J.head.rotation.x = ghost.userData.J.head.rotation.x = 0.25;
      solid.rotation.y = ghost.rotation.y = Math.PI + 0.55 + 0.1 * Math.sin(t * 0.6);
      scene.updateMatrixWorld(true);
      p2.localToWorld(a2.set(0, 0.155, -0.06)); p3.localToWorld(a3.set(0, 0.13, -0.1));
      const L2 = V(-0.1, 2.15, 0.0), L3 = V(0.12, 2.02, 0.05);
      l2.position.copy(L2); l3.position.copy(L3); l2.visible = l3.visible = line2.visible = line3.visible = pk > 0.6;
      for (const [ln, a, b] of [[line2, a2, L2.clone().add(V(0, -0.035, 0))], [line3, a3, L3.clone().add(V(0, -0.035, 0))]]) { ln.position.copy(a.clone().add(b).multiplyScalar(0.5)); ln.lookAt(b); ln.scale.z = a.distanceTo(b); }
      scan.visible = k > 0.01 && k < 0.99; scan.position.set(0, lerp(1.25, 2.1, k), 0.3);
      look(c, mix(V(0.15, 2.25, 3.2), V(0.1, 2.15, 2.85), eio(t / d)), V(0, 1.8, 0));
    },
    ui: (t) => ({ flash: Math.max(0, 0.35 - Math.abs(t - tX - 0.1) * 1.6) }),
  };
}
// =============== s12: the settlement — $1.5 million in cash stacks ===============
function cashTex() { return canvasTex(256, 128, (x, w, h) => { x.fillStyle = '#7fbf7a'; x.fillRect(0, 0, w, h); x.fillStyle = '#5e9e5a'; x.fillRect(10, 10, w - 20, h - 20); x.fillStyle = '#a8dca2'; x.beginPath(); x.ellipse(w / 2, h / 2, 34, 40, 0, 0, 7); x.fill(); x.fillStyle = '#2e5a2b'; x.font = '900 46px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('$', w / 2, h / 2 + 2); }); }
function Brick(tex) {
  const g = new THREE.Group();
  const b = M(RB(1.0, 0.32, 0.5, 0.02, 2), 0x6aa866, { px: 4 }); g.add(b);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.46), new THREE.MeshBasicMaterial({ map: tex })); top.rotation.x = -Math.PI / 2; top.position.y = 0.162; g.add(top);
  const band = M(new THREE.BoxGeometry(0.2, 0.33, 0.51), 0xf2e6c4, { px: 3, outline: false }); g.add(band);
  return g;
}
export function cash(tLand) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a1033);
  lights(scene, { hemi: 1.0, sky: 0xfff4dc, ground: 0x2a1d45, keyI: 2.1, keyPos: [-3, 6, 5], rim: TEAL, rimI: 1.0 });
  const bh = halo(0x7a3fd0, 12, 0.45); bh.position.set(0, 1, -4); scene.add(bh);
  const table = M(new THREE.CylinderGeometry(3.2, 3.2, 0.2, 48), 0x3a2c5c, { px: 5 }); table.position.y = -0.1; scene.add(table);
  const tex = cashTex(), bricks = [];
  for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) { const b = Brick(tex); const x = (i - 1) * 1.05, y = 0.16 + j * 0.33; b.userData = { x, y, z: 0, d: (j * 3 + i) * 0.07 }; scene.add(b); bricks.push(b); }
  const lab = labelSprite('$1,500,000', '#FFD60A', 3.0); lab.position.set(0, 2.45, 0.4); scene.add(lab);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      for (const b of bricks) { const a = clamp((t - 0.15 - b.userData.d) / 0.35); b.position.set(b.userData.x, b.userData.y + (1 - eout(a)) * 4, b.userData.z); b.visible = a > 0; b.rotation.y = (1 - a) * 0.6; }
      lab.visible = t > tLand; lab.scale.set(3.0 * back(clamp((t - tLand) / 0.3)), 3.0 * 192 / 1024 * back(clamp((t - tLand) / 0.3)), 1);
      look(c, mix(V(3.0, 4.0, 10.4), V(2.2, 3.6, 9.2), eio(t / d)), V(0, 1.5, 0));
    },
  };
}
// =============== s13/s14: he gives it all away — to the hospital burn center ===============
function Hospital(signTex) {
  const g = new THREE.Group();
  const body = M(RB(6, 4.2, 3, 0.06, 2), 0xe9e4da, { px: 5 }); body.position.y = 2.1; g.add(body);
  const wing = M(RB(3, 3, 2.6, 0.06, 2), 0xd9d3c8, { px: 5 }); wing.position.set(-4.3, 1.5, 0.2); g.add(wing);
  const wing2 = wing.clone(); wing2.position.x = 4.3; g.add(wing2);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) { if (j === 0 && (i === 2 || i === 3)) continue;
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.6), new THREE.MeshBasicMaterial({ color: (i + j) % 3 ? 0x7fb6d9 : 0xffe7a8 })); w.position.set(-2.3 + i * 0.92, 0.9 + j * 1.15, 1.51); g.add(w); }
  const door = M(RB(1.5, 1.4, 0.1, 0.03, 2), 0x6fa8c8, { px: 4 }); door.position.set(0, 0.7, 1.52); g.add(door);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 1.3), new THREE.MeshBasicMaterial({ map: signTex })); sign.position.set(0, 4.75, 1.4); g.add(sign);
  const sb = M(RB(5.4, 1.45, 0.12, 0.03, 2), 0x1d2f4a, { px: 4 }); sb.position.set(0, 4.75, 1.32); g.add(sb);
  const hs = M(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 32), 0x2c6fd6, { px: 4 }); hs.rotation.x = Math.PI / 2; hs.position.set(-4.3, 3.6, 1.6); g.add(hs);
  const ht = labelSprite('H', '#ffffff', 2.6); ht.material.depthTest = true; ht.renderOrder = 0; ht.position.set(-4.3, 3.6, 1.7); g.add(ht);
  return g;
}
export function giveaway(mode, tSign) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2b2252); scene.fog = new THREE.Fog(0x2b2252, 20, 50);
  lights(scene, { hemi: 1.0, sky: 0xffe9d0, ground: 0x2a2440, keyI: 2.0, key: 0xffe2b8, keyPos: [-6, 9, 9], rim: MAG, rimI: 0.9 });
  const sun = halo(0xff9d5c, 24, 0.5); sun.position.set(6, 3, -20); scene.add(sun);
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), toon(0x3a3358)); gr.rotation.x = -Math.PI / 2; scene.add(gr);
  const path = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 12), toon(0x8a84a0)); path.rotation.x = -Math.PI / 2; path.position.set(0, 0.01, 7.5); scene.add(path);
  const signTex = canvasTex(1040, 260, (x, w, h) => { x.fillStyle = '#1d2f4a'; x.fillRect(0, 0, w, h); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#FFD60A'; x.font = '900 70px Inter'; x.fillText('MICHAEL JACKSON', w / 2, 82); x.fillStyle = '#ffffff'; x.font = '900 104px Inter'; x.fillText('BURN CENTER', w / 2, 182); });
  const blank = canvasTex(1040, 260, (x, w, h) => { x.fillStyle = '#1d2f4a'; x.fillRect(0, 0, w, h); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#ffffff'; x.font = '900 120px Inter'; x.fillText('HOSPITAL', w / 2, h / 2 + 4); });
  const hosp = Hospital(blank); scene.add(hosp);
  const sign = hosp.children.find(m => m.material && m.material.map === blank);
  const tex = cashTex(), bills = [], r = rnd(17);
  for (let i = 0; i < 26; i++) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.25), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide })); b.userData = { o: r(), x: (r() - .5) * 2.4, sp: 2 + r() * 3, rz: r() * 6 }; scene.add(b); bills.push(b); }
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      if (mode === 'give') {
        bills.forEach(b => { const a = ((t * 0.55 + b.userData.o) % 1); b.position.set(b.userData.x * (1 - a) + 0, lerp(1.0, 2.2, Math.sin(a * Math.PI)) + a * 0.4, lerp(10.5, 1.8, a)); b.rotation.set(t * b.userData.sp, b.userData.rz + t, 0.4); b.visible = true; });
        look(c, mix(V(3.5, 2.4, 16), V(2.2, 2.6, 14.5), eio(t / d)), V(0, 3.9, 0));
      } else {
        bills.forEach(b => b.visible = false);
        if (t > tSign) sign.material.map = signTex;
        sign.scale.setScalar(t > tSign ? back(clamp((t - tSign) / 0.35)) : 1);
        look(c, mix(V(1.2, 3.2, 19), V(0.4, 3.6, 16.2), eio(t / d)), V(0, 3.9, 0));
      }
    },
  };
}
// =============== loop end: back to the top of the stairs — sparks hit the hair ===============
export function loopEnd() {
  const scene = new THREE.Scene(); const S = stageSet(scene); crowd(scene, { z: 5.2, rows: 1, per: 8, y: -0.6, seed: 4 });
  const fig = Performer(); scene.add(fig); fig.position.set(0, 0, 0.6); const fl = addFlame(fig);
  const sp = Sparks(22, 5, [0xffb03a, 0xff7a1a]); scene.add(sp);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      pulseSet(S, t); poseDance(fig, t + 3); fig.rotation.y = 0.25 * Math.sin((t + 3) * 1.3);
      const k = ss(d - 0.9, d - 0.15, t); fl.userData.set(k, t);
      const hp = new THREE.Vector3(); fig.userData.J.head.getWorldPosition(hp); sp.userData.fountain(t, hp.clone().add(V(0, 0.2, 0)), 0.2 + 0.4 * k, 0.3);
      look(c, mix(V(0.9, 1.7, 7.4), V(0.5, 1.2, 5.6), eio(t / d)), V(0, 1.38, 0.4));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
