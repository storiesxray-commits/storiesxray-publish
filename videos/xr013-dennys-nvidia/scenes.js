import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, M, glowMat, addMat, halo, setOpacity, lights, shake, Subject, poseStand } from '../../engine/engine.js';

// xr013 — "Nvidia was born at Denny's?!" (news peg: Jensen Huang resigned as Nvidia CEO on 12 Nov 2026; the San Jose Denny's
// plaque was taken down after it and reinstalled by Denny's days later).
// Visual rules: generic 1990s diner (neon "DINER" sign, no Denny's logo, no brand colours/sign shape), generic chip (no Nvidia logo),
// generic people only (no likeness of Huang or anyone real), the resignation shown only as an empty chair + falling "CEO" nameplate.
// Plaque text = the real wording reported by Nvidia's blog / Inc: "The booth that launched a $1 trillion company".
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);

// palette: late-night diner — cherry vinyl, teal walls, neon pink, gold
const CHERRY = 0xd7263d, CHERRY_D = 0x9e1b2c, TEALW = 0x1f6f78, CREAM = 0xf3ead8, GOLD = 0xffc83d, NEON = 0xff4fa3, CYAN = 0x22d3ee, YEL = 0xffd60a, RED = 0xff3b30, CHROME = 0xc9d2da, PCB = 0x1d5b3f;

function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.userData = { cv }; return t; }
function bgGrad(scene, stops) { scene.background = canvasTex(64, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); }); }
function labelSprite(text, color = '#ffffff', w = 1.6, font = 112) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 192; const x = cv.getContext('2d');
  x.font = `900 ${font}px Inter, sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.lineWidth = 28; x.strokeStyle = '#0b0b0f'; x.strokeText(text, 512, 100); x.fillStyle = color; x.fillText(text, 512, 100);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.scale.set(w, w * 192 / 1024, 1); s.renderOrder = 20; return s;
}
function popLabel(s, w, k) { s.scale.set(w * k, w * k * 192 / 1024, 1); s.visible = k > 0.01; }

// ---------------- props ----------------
function checkerTex(n = 10) { const t = canvasTex(512, 512, (x, w, h) => { const s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = (i + j) % 2 ? '#1a1c22' : '#e9e4d8'; x.fillRect(i * s, j * s, s, s); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function neonSign(text = 'DINER') {
  const g = new THREE.Group();
  const plate = M(RB(1.5, 0.48, 0.06, 0.06, 3), 0x14161d, { px: 4 }); g.add(plate);
  const tx = canvasTex(1024, 320, (x, w, h) => { x.font = '900 230px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.shadowColor = '#ff4fa3'; x.shadowBlur = 40; x.fillStyle = '#ffd1ea'; x.fillText(text, w / 2, h / 2 + 10); x.shadowBlur = 0; x.lineWidth = 8; x.strokeStyle = '#ff4fa3'; x.strokeText(text, w / 2, h / 2 + 10); });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.44), new THREE.MeshBasicMaterial({ map: tx, transparent: true })); face.position.z = 0.035; g.add(face);
  const gl = halo(NEON, 2.4, 0.45); gl.position.z = 0.1; g.add(gl); g.userData = { face, gl }; return g;
}
function Mug(col = 0xf4f1ea) {
  const g = new THREE.Group();
  const body = M(new THREE.CylinderGeometry(0.06, 0.055, 0.12, 20), col, { px: 3 }); body.position.y = 0.06; g.add(body);
  const coffee = new THREE.Mesh(new THREE.CircleGeometry(0.052, 20), toon(0x3b2314)); coffee.rotation.x = -Math.PI / 2; coffee.position.y = 0.112; g.add(coffee);
  const hd = M(new THREE.TorusGeometry(0.035, 0.012, 8, 16), col, { px: 2 }); hd.position.set(0.065, 0.06, 0); g.add(hd);
  g.userData = { coffee }; return g;
}
function CoffeePot() {
  const g = new THREE.Group();
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.11, 20, 16), new THREE.MeshToonMaterial({ color: 0xbfe6f2, transparent: true, opacity: 0.55 })); glass.scale.set(1, 0.9, 1); g.add(glass);
  const liquid = M(new THREE.SphereGeometry(0.095, 18, 12, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55), 0x4a2a14, { px: 2 }); g.add(liquid);
  const neck = M(new THREE.CylinderGeometry(0.05, 0.07, 0.07, 18), 0x2b2b2b, { px: 3 }); neck.position.y = 0.11; g.add(neck);
  const collar = M(new THREE.TorusGeometry(0.055, 0.014, 8, 20), 0xff8a1f, { px: 2 }); collar.rotation.x = Math.PI / 2; collar.position.y = 0.13; g.add(collar);
  const handle = M(RB(0.03, 0.14, 0.04, 0.012, 2), 0x2b2b2b, { px: 3 }); handle.position.set(-0.13, 0.03, 0); g.add(handle);
  const spout = M(new THREE.ConeGeometry(0.025, 0.06, 10), 0x2b2b2b, { px: 2 }); spout.rotation.z = -Math.PI / 2; spout.position.set(0.1, 0.11, 0); g.add(spout);
  g.userData = { spout }; return g;
}
function Coin(s = 1) { const c = M(new THREE.CylinderGeometry(0.07, 0.07, 0.016, 24), GOLD, { px: 3 }); c.scale.setScalar(s); return c; }
// generic GPU-style chip: green board, gold pins, steel lid, glowing die (no logo)
function Chip(s = 1) {
  const g = new THREE.Group();
  const traces = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#1d5b3f'; x.fillRect(0, 0, w, h); x.strokeStyle = '#e8c35a'; x.lineWidth = 5; const r = rnd(5);
    for (let i = 0; i < 46; i++) { let px = r() * w, py = r() * h; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 3; k++) { if (r() < 0.5) px += (r() - 0.5) * 220; else py += (r() - 0.5) * 220; x.lineTo(px, py); } x.stroke(); x.fillStyle = '#e8c35a'; x.beginPath(); x.arc(px, py, 7, 0, 7); x.fill(); } });
  const board = M(RB(1.0, 0.06, 1.0, 0.03, 2), PCB, { px: 5 }); g.add(board);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.96), new THREE.MeshToonMaterial({ map: traces })); top.rotation.x = -Math.PI / 2; top.position.y = 0.031; g.add(top);
  const lid = M(RB(0.58, 0.06, 0.58, 0.03, 2), CHROME, { px: 4 }); lid.position.y = 0.06; g.add(lid);
  const die = M(RB(0.32, 0.03, 0.32, 0.015, 2), 0x0d1118, { px: 3 }); die.position.y = 0.1; g.add(die);
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.26, 0.26), addMat(CYAN, 0.9)); glow.rotation.x = -Math.PI / 2; glow.position.y = 0.117; g.add(glow);
  for (let i = 0; i < 4; i++) for (let k = 0; k < 9; k++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.02, 0.06), toon(GOLD)); const u = -0.4 + k * 0.1;
    if (i === 0) p.position.set(u, 0, 0.52); if (i === 1) p.position.set(u, 0, -0.52); if (i === 2) { p.position.set(0.52, 0, u); p.rotation.y = Math.PI / 2; } if (i === 3) { p.position.set(-0.52, 0, u); p.rotation.y = Math.PI / 2; } g.add(p); }
  const h = halo(CYAN, 1.6, 0.5); h.position.y = 0.2; g.add(h);
  g.userData = { glow, h }; g.scale.setScalar(s); return g;
}
// back bench + table of a diner booth (seat top at y = 0.47, table top at y = 0.8)
function Booth(wid = 2.0) {
  const g = new THREE.Group();
  const base = M(RB(wid, 0.4, 0.55, 0.03, 2), 0x3a2a24, { px: 4 }); base.position.set(0, 0.2, -0.62); g.add(base);
  const seat = M(RB(wid, 0.1, 0.56, 0.05, 3), CHERRY, { px: 4 }); seat.position.set(0, 0.45, -0.6); g.add(seat);
  const rest = M(RB(wid, 0.78, 0.18, 0.07, 3), CHERRY, { px: 5 }); rest.position.set(0, 0.86, -0.92); g.add(rest);
  for (let i = 0; i < 6; i++) { const ch = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.62, 0.01), toon(CHERRY_D)); ch.position.set(-wid / 2 + (i + 0.5) * wid / 6, 0.86, -0.825); g.add(ch); }
  const cap = M(RB(wid + 0.04, 0.05, 0.22, 0.02, 2), CHROME, { px: 3 }); cap.position.set(0, 1.27, -0.92); g.add(cap);
  const table = new THREE.Group(); table.position.set(0, 0, -0.05); g.add(table);
  const top = M(RB(1.7, 0.06, 0.78, 0.03, 2), CREAM, { px: 5 }); top.position.y = 0.8; table.add(top);
  const edge = M(new THREE.BoxGeometry(1.72, 0.035, 0.8), CHROME, { px: 3, outline: false }); edge.position.y = 0.775; table.add(edge);
  const ped = M(new THREE.CylinderGeometry(0.06, 0.06, 0.75, 14), CHROME, { px: 3 }); ped.position.y = 0.4; table.add(ped);
  const foot = M(new THREE.CylinderGeometry(0.28, 0.32, 0.04, 24), CHROME, { px: 3 }); foot.position.y = 0.02; table.add(foot);
  g.userData = { table, top }; return g;
}
function diner(scene, o = {}) {
  bgGrad(scene, [[0, '#0b0d18'], [1, '#191a2c']]);
  lights(scene, { hemi: 1.05, sky: 0xffe9d6, ground: 0x241a26, keyI: 1.9, keyPos: [-2.5, 4.5, 4], rim: NEON, rimI: 1.0, rimPos: [3, 3, -3], shadow: o.shadow, shadowR: 3.5 });
  const ft = checkerTex(); ft.repeat.set(4, 4);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshToonMaterial({ map: ft })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), toon(TEALW)); wall.position.set(0, 3, -1.05); scene.add(wall);
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.12), toon(CHROME)); stripe.position.set(0, 1.42, -1.04); scene.add(stripe);
  // night window behind the booth
  const win = new THREE.Group(); win.position.set(o.winX ?? 0, 1.95, -1.03); scene.add(win);
  const night = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.85), new THREE.MeshBasicMaterial({ map: canvasTex(512, 200, (x, w, h) => { const gg = x.createLinearGradient(0, 0, 0, h); gg.addColorStop(0, '#0a1230'); gg.addColorStop(1, '#2a1f4a'); x.fillStyle = gg; x.fillRect(0, 0, w, h); const r = rnd(3); for (let i = 0; i < 40; i++) { x.fillStyle = 'rgba(255,255,255,' + (0.3 + r() * 0.6) + ')'; x.fillRect(r() * w, r() * h * 0.7, 2, 2); } x.fillStyle = '#121528'; for (let i = 0; i < 9; i++) { const bw = 30 + r() * 50, bh = 40 + r() * 90; x.fillRect(i * 58, h - bh, bw, bh); } }) }));
  win.add(night);
  const frame = M(RB(2.3, 0.95, 0.04, 0.03, 2), CHROME, { px: 4 }); frame.position.z = -0.03; win.add(frame);
  const lamp = new THREE.Group(); lamp.position.set(o.lampX ?? 0, 2.55, -0.1); scene.add(lamp);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1.2, 6), toon(0x111111)); cord.position.y = 0.6; lamp.add(cord);
  const shade = M(new THREE.ConeGeometry(0.22, 0.2, 24, 1, true), CHERRY, { px: 4 }); shade.material.side = THREE.DoubleSide; lamp.add(shade);
  const bulb = halo(0xffe2a8, 1.4, 0.55); bulb.position.y = -0.12; lamp.add(bulb);
  return { win, lamp };
}
// seated at the booth table, forearms on the table
function sitTable(g, t, o = {}) {
  const J = g.userData.J; poseStand(g, t);
  J.hips.position.y = 0.57; J.leg.L.l.rotation.set(-1.5, 0, -0.08); J.leg.R.l.rotation.set(-1.5, 0, 0.08); J.leg.L.kn.rotation.x = 1.5; J.leg.R.kn.rotation.x = 1.5;
  J.chest.rotation.x = 0.12 + (o.lean || 0); J.head.rotation.set(0.05 + 0.04 * Math.sin(t * 1.3 + (o.ph || 0)), (o.turn || 0) + 0.08 * Math.sin(t * 0.9 + (o.ph || 0)), 0);
  const gx = o.gest ? 0.25 * Math.sin(t * 6 + (o.ph || 0)) * o.gest : 0;
  J.arm.L.a.rotation.set(-0.8, 0, -0.18); J.arm.R.a.rotation.set(-0.8 - gx, 0, 0.18); J.arm.L.b.rotation.set(-0.85, 0, 0.35); J.arm.R.b.rotation.set(-0.85 - gx, 0, -0.35);
}
const OUTFITS = [
  { torso: 0x2b2d33, upper: 0x2b2d33, fore: 0x2b2d33, hand: C.skin, thigh: 0x3d5f94, shin: 0x3d5f94, shoe: 0x222222 },
  { torso: 0x6a8f5a, upper: 0x6a8f5a, fore: C.skin, hand: C.skin, thigh: 0x6b5a45, shin: 0x6b5a45, shoe: 0x5a3b2a },
  { torso: 0x8e5bb5, upper: 0x8e5bb5, fore: 0x8e5bb5, hand: C.skin, thigh: 0x2f3442, shin: 0x2f3442, shoe: 0xf4f1ea },
];

// =============== s01 + loop: HOOK — a giant glowing chip bursts out of a diner booth table, coins raining ===============
export function hook(mode = 'in') {
  const scene = new THREE.Scene(); diner(scene, { winX: 3.5 });
  const b = Booth(); scene.add(b);
  const sign = neonSign('DINER'); sign.scale.setScalar(0.62); sign.position.set(-0.62, 1.8, -1.0); scene.add(sign);
  const chip = Chip(0.8); chip.position.set(0.1, 1.3, 0.05); scene.add(chip);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.8, 1.2, 32, 1, true), addMat(CYAN, 0.16)); beam.position.set(0.1, 1.2, 0.0); scene.add(beam);
  const mugs = [Mug(), Mug(0xffe9b0)]; mugs[0].position.set(-0.6, 0.83, 0.15); mugs[1].position.set(0.62, 0.83, 0.05); mugs.forEach(m => scene.add(m));
  const coins = [], r = rnd(11); for (let i = 0; i < 26; i++) { const c = Coin(0.75 + r() * 0.5); c.userData = { x: (r() - 0.5) * 2.0, z: -0.3 + r() * 0.9, sp: 0.8 + r() * 0.7, ph: r(), rx: r() * 6, ry: r() * 6 }; scene.add(c); coins.push(c); }
  const sparks = []; for (let i = 0; i < 10; i++) { const s = halo(0xffffff, 0.1, 0.9); scene.add(s); sparks.push(s); }
  const c = cam(38), P0 = V(0.45, 1.5, 3.7), P1 = V(0.3, 1.45, 3.3), TG = V(0, 1.12, -0.2);
  return {
    scene, camera: c,
    update(t, d) {
      const T = t + 3.0;   // always mid-burst, even at frame 0
      chip.position.y = 1.32 + 0.04 * Math.sin(t * 2.2); chip.rotation.set(0.95 + 0.05 * Math.sin(t * 1.4), 0.25 * Math.sin(t * 0.7), 0.06 * Math.sin(t * 1.9));
      chip.userData.glow.material.opacity = 0.7 + 0.3 * Math.sin(t * 9); chip.userData.h.material.opacity = 0.45 + 0.15 * Math.sin(t * 6);
      beam.material.opacity = 0.13 + 0.05 * Math.sin(t * 7);
      coins.forEach((cn, i) => { const u = cn.userData; const y = 3.0 - ((T * u.sp + u.ph * 3) % 3.0) * 1.0; cn.position.set(u.x + 0.05 * Math.sin(T + i), Math.max(0.84, y), u.z); cn.rotation.set(u.rx + T * 4, u.ry + T * 3, 0); });
      sparks.forEach((s, i) => { const a = i / 10 * Math.PI * 2 + t * 1.5; s.position.set(0.1 + Math.cos(a) * 0.55, 1.32 + Math.sin(a * 2) * 0.12, Math.sin(a) * 0.35); s.material.opacity = 0.5 + 0.5 * Math.sin(t * 8 + i); });
      mugs.forEach((m, i) => { m.position.y = 0.83 + Math.max(0, Math.sin(t * 22 + i * 2)) * 0.012; });
      sign.userData.gl.material.opacity = 0.4 + 0.08 * Math.sin(t * 13) + (Math.sin(t * 31) > 0.97 ? -0.2 : 0);
      if (mode === 'in') look(c, mix(P0, P1, eio(clamp(t / d))), TG);
      else look(c, mix(V(-0.4, 1.2, 2.1), P0, eio(ss(0, d, t))), mix(V(0, 1.0, -0.2), TG, eio(ss(0, d, t))));
    },
    ui: () => ({ vig: 0.28 }),
  };
}
// =============== s02: at fifteen, washing dishes — a teen at a steel sink with a teetering plate stack ===============
export function dishes() {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#0b1a1f'], [1, '#18323a']]);
  lights(scene, { hemi: 1.1, sky: 0xe8fbff, ground: 0x10242a, keyI: 1.9, keyPos: [-2, 4, 4], rim: CYAN, rimI: 1.0, shadow: true, shadowR: 3 });
  const tile = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#9fb7bd'; x.fillRect(0, 0, w, h); x.fillStyle = '#e9f1f2'; const s = w / 8; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) x.fillRect(i * s + 3, j * s + 3, s - 6, s - 6); }); tile.wrapS = tile.wrapT = THREE.RepeatWrapping; tile.repeat.set(5, 3);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshToonMaterial({ map: tile })); wall.position.set(0, 2, -0.9); scene.add(wall);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), toon(0x3a3f46)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const counter = M(RB(2.6, 0.9, 0.7, 0.03, 2), 0xaeb8c2, { px: 5 }); counter.position.set(0, 0.45, 0.45); scene.add(counter);
  const sink = M(RB(0.8, 0.08, 0.5, 0.02, 2), 0x6d7884, { px: 3 }); sink.position.set(0, 0.89, 0.42); scene.add(sink);
  const tap = M(new THREE.TorusGeometry(0.14, 0.02, 8, 18, Math.PI), CHROME, { px: 3 }); tap.position.set(0, 1.03, 0.75); tap.rotation.y = Math.PI; scene.add(tap);
  const foam = []; const r = rnd(8); for (let i = 0; i < 22; i++) { const f = M(new THREE.SphereGeometry(0.04 + r() * 0.05, 12, 10), 0xffffff, { px: 2 }); f.userData = { x: (r() - 0.5) * 0.7, z: 0.42 + (r() - 0.5) * 0.35, ph: r() * 6 }; scene.add(f); foam.push(f); }
  const bub = []; for (let i = 0; i < 14; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.03 + r() * 0.04, 14, 10), new THREE.MeshToonMaterial({ color: 0xcfefff, transparent: true, opacity: 0.6 })); b.userData = { x: (r() < 0.5 ? -1 : 1) * (0.35 + r() * 0.5), sp: 0.3 + r() * 0.4, ph: r() * 3 }; scene.add(b); bub.push(b); }
  const stack = new THREE.Group(); stack.position.set(0.6, 0.9, 0.5); scene.add(stack);
  for (let i = 0; i < 16; i++) { const p = M(new THREE.CylinderGeometry(0.17, 0.13, 0.03, 24), 0xf6f3ea, { px: 2 }); p.position.y = 0.02 + i * 0.035; p.position.x = 0.012 * Math.sin(i * 1.7); stack.add(p); }
  const kid = Subject({ col: { torso: 0xf4f1ea, upper: 0xf4f1ea, fore: C.skin, hand: C.skin, thigh: 0x2b2f3c, shin: 0x2b2f3c, shoe: 0x222222 } }); kid.position.set(-0.05, 0, -0.3); kid.scale.setScalar(0.94); scene.add(kid);
  const apron = M(RB(0.34, 0.5, 0.04, 0.03, 2), 0x8fd3ff, { px: 3 }); kid.userData.J.chest.add(apron); apron.position.set(0, 0.12, 0.15);
  const cap = M(new THREE.CylinderGeometry(0.13, 0.15, 0.08, 20), 0xffffff, { px: 3 }); kid.userData.J.head.add(cap); cap.position.set(0, 0.15, -0.01); cap.rotation.x = -0.25;
  const plate = M(new THREE.CylinderGeometry(0.17, 0.13, 0.03, 24), 0xf6f3ea, { px: 3 }); scene.add(plate);
  const wp = V(0, 0, 0), wq = V(0, 0, 0), c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      poseStand(kid, t); const J = kid.userData.J, sc = Math.sin(t * 9);
      J.arm.L.a.rotation.set(-0.85, 0, -0.3); J.arm.R.a.rotation.set(-0.85 + 0.1 * sc, 0, 0.3); J.arm.L.b.rotation.set(-0.7, 0, 0.6); J.arm.R.b.rotation.set(-0.7 - 0.15 * sc, 0, -0.6);
      J.head.rotation.set(0.35, 0.1 * Math.sin(t * 1.5), 0); J.chest.rotation.x = 0.12;
      kid.userData.face({ open: 0.25 + 0.1 * Math.abs(sc), wide: 0.15, lookY: -0.7 });
      J.arm.L.hand.getWorldPosition(wp); J.arm.R.hand.getWorldPosition(wq); plate.position.copy(wp).add(wq).multiplyScalar(0.5).add(V(0, -0.02, 0.02)); plate.rotation.set(1.1, 0, 0.2 * sc);
      foam.forEach((f, i) => { const u = f.userData; f.position.set(u.x, 0.95 + 0.02 * Math.sin(t * 3 + u.ph), u.z); });
      bub.forEach(b => { const u = b.userData; const y = 0.95 + ((t * u.sp + u.ph) % 1.6); b.position.set(u.x + 0.1 * Math.sin(t * 2 + u.ph), y, 0.45 + 0.2 * Math.sin(u.ph)); b.material.opacity = 0.6 * (1 - ss(2.2, 2.55, y)); });
      stack.rotation.z = 0.05 * Math.sin(t * 3.2); stack.rotation.x = 0.03 * Math.sin(t * 2.7);
      look(c, mix(V(0.6, 1.75, 3.5), V(0.45, 1.7, 3.15), eio(clamp(t / d))), V(0.15, 1.3, -0.1));
    },
    ui: () => ({ vig: 0.28 }),
  };
}
// =============== s03 / s04: 1993 — three people in one booth; bottomless coffee refills ===============
export function booth(mode = 'wide', tPour = 0) {
  const scene = new THREE.Scene(); diner(scene, { shadow: true, winX: -0.3 });
  const b = Booth(2.1); scene.add(b);
  const sign = neonSign('DINER'); sign.position.set(0.0, 2.62, -1.0); scene.add(sign);
  const ppl = OUTFITS.map((col, i) => { const p = Subject({ col }); p.position.set(-0.66 + i * 0.66, 0, -0.62); p.scale.setScalar(0.93); scene.add(p); return p; });
  const mugs = [-0.66, 0, 0.66].map((x, i) => { const m = Mug([0xf4f1ea, 0xffe9b0, 0xbfe3ff][i]); m.position.set(x + 0.18, 0.83, -0.02); scene.add(m); return m; });
  const napkin = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshToonMaterial({ map: canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2b4bd8'; x.lineWidth = 6; x.strokeRect(70, 70, 116, 116); x.strokeRect(100, 100, 56, 56); for (let k = 0; k < 5; k++) { x.beginPath(); x.moveTo(82 + k * 23, 70); x.lineTo(82 + k * 23, 40); x.stroke(); x.beginPath(); x.moveTo(82 + k * 23, 186); x.lineTo(82 + k * 23, 216); x.stroke(); } x.font = '700 30px Inter'; x.fillStyle = '#2b4bd8'; x.fillText('3D?!', 20, 36); }) }));
  napkin.rotation.x = -Math.PI / 2; napkin.rotation.z = 0.15; napkin.position.set(-0.25, 0.835, 0.12); scene.add(napkin);
  if (mode !== 'wide') mugs[1].position.x = 0.44;
  const pot = CoffeePot(); scene.add(pot);
  const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 1, 8), toon(0x4a2a14)); scene.add(stream);
  const steam = []; for (let i = 0; i < 9; i++) { const s = halo(0xffffff, 0.12, 0.35); scene.add(s); steam.push(s); }
  const c = cam(mode === 'wide' ? 40 : 34);
  return {
    scene, camera: c,
    update(t, d) {
      ppl.forEach((p, i) => { sitTable(p, t, { ph: i * 1.7, turn: [0.35, 0, -0.35][i], gest: i === 1 ? 1 : 0.4 }); p.userData.face({ open: 0.2 + 0.25 * Math.abs(Math.sin(t * 7 + i * 2)) * (i === 1 ? 1 : 0.5), wide: 0.2, lookX: [0.8, 0, -0.8][i] }); });
      // the pot hops from mug to mug, refilling (bottomless coffee)
      const P = clamp((t - 0.6) / 2.4);
      const idx = mode === 'wide' ? Math.min(2, Math.floor(P * 2.99)) : 1, f = mode === 'wide' ? P * 2.99 - idx : 0.5;
      const m = mugs[idx], pour = ss(0.15, 0.3, f) * (1 - ss(0.8, 0.95, f));
      pot.position.set(m.position.x - 0.17, 1.0 + 0.1 * (1 - pour) + 0.05 * Math.sin(f * Math.PI), m.position.z + 0.02); pot.rotation.z = -0.8 * pour;
      if (mode !== 'wide') { pot.rotation.z = -0.8 - 0.05 * Math.sin(t * 5); }
      pot.updateMatrixWorld(true); const top = V(0, 0, 0); pot.userData.spout.getWorldPosition(top); const bot = m.position.clone().add(V(0, 0.11, 0));
      stream.visible = mode !== 'wide'; pot.visible = mode !== 'wide'; stream.position.set(top.x, (top.y + bot.y) / 2, top.z); stream.scale.y = Math.max(0.01, top.y - bot.y);
      mugs.forEach((mm, i) => { mm.userData.coffee.position.y = 0.085 + 0.027 * (mode === 'wide' && i === idx ? 0.4 + 0.6 * f : 1); });
      steam.forEach((s, i) => { const mm = mugs[i % 3], y = (t * 0.5 + i * 0.37) % 0.5; s.position.set(mm.position.x + 0.03 * Math.sin(t * 3 + i), 0.97 + y, mm.position.z); s.material.opacity = 0.35 * (1 - y / 0.5); });
      sign.userData.gl.material.opacity = 0.4 + 0.08 * Math.sin(t * 13);
      if (mode === 'wide') look(c, mix(V(1.1, 1.75, 3.6), V(0.85, 1.65, 3.2), eio(clamp(t / d))), V(-0.05, 1.05, -0.45));
      else look(c, mix(V(0.2, 0.96, 1.6), V(0.18, 0.94, 1.42), eio(clamp(t / d))), V(0.38, 1.08, -0.1));
    },
    ui: () => ({ vig: 0.3, sepia: mode === 'wide' ? 0.35 : 0.2 }),
  };
}
// =============== s05: that booth became Nvidia — the napkin sketch glows and a real chip rises out of the table ===============
export function became(tBecame) {
  const scene = new THREE.Scene(); diner(scene, { winX: 0.6 });
  const b = Booth(2.1); scene.add(b);
  const mug = Mug(); mug.position.set(0.55, 0.83, 0.05); scene.add(mug);
  const napkin = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2b4bd8'; x.lineWidth = 6; x.strokeRect(70, 70, 116, 116); x.strokeRect(100, 100, 56, 56); }) }));
  napkin.rotation.x = -Math.PI / 2; napkin.position.set(0, 0.836, 0.0); scene.add(napkin);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 40), addMat(CYAN, 0)); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.84, 0); scene.add(ring);
  const chip = Chip(0.7); scene.add(chip);
  const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.55, 2.4, 32, 1, true), addMat(CYAN, 0)); beam.position.set(0, 2.0, 0); scene.add(beam);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      const k = eout(ss(tBecame - 0.5, tBecame + 0.5, t)), g = ss(0, tBecame, t);
      napkin.material.color.setRGB(1, 1, 1).lerp(new THREE.Color(0x9ff3ff), g);
      ring.material.opacity = 0.8 * g * (1 - k * 0.5); ring.scale.setScalar(1 + 0.3 * Math.sin(t * 6) * g);
      chip.position.set(0, lerp(0.8, 1.32, k), 0.0); chip.scale.setScalar(Math.max(0.001, 0.7 * k)); chip.visible = k > 0.01; chip.rotation.set(lerp(0, 1.0, k), t * 0.6, 0);
      beam.material.opacity = 0.18 * k;
      look(c, mix(V(0.3, 1.6, 3.4), V(0.2, 1.5, 3.0), eio(clamp(t / d))), V(0, 1.05, -0.2));
      shake(c, t, tBecame, 0.03);
    },
    ui: (t) => ({ vig: 0.3, flash: 0.35 * (1 - ss(tBecame, tBecame + 0.3, t)) * ss(tBecame - 0.05, tBecame, t) }),
  };
}
// =============== s06: the AI chip giant is worth trillions — gold coin towers erupt around a giant chip ===============
export function trillions(tT) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#05070f'], [1, '#141032']]);
  lights(scene, { hemi: 1.0, sky: 0xfff3d6, ground: 0x141032, keyI: 1.9, keyPos: [-2, 5, 4], rim: CYAN, rimI: 1.4 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(0x15152a)); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const grid = new THREE.GridHelper(30, 40, 0x22d3ee, 0x22406a); grid.position.y = 0.002; grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid);
  const chip = Chip(2.4); chip.position.set(0, 0.4, 0); scene.add(chip);
  const towers = [], r = rnd(17);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + r() * 0.2, R = 2.3 + r() * 1.6; const g = new THREE.Group(); g.position.set(Math.cos(a) * R, 0, Math.sin(a) * R - 0.4); const n = 6 + Math.floor(r() * 14);
    for (let k = 0; k < n; k++) { const cn = Coin(2.2); cn.position.y = 0.02 + k * 0.036; cn.rotation.y = r() * 3; cn.position.x = 0.01 * Math.sin(k * 2.3); g.add(cn); } g.userData = { n, d: r() * 0.8 }; scene.add(g); towers.push(g); }
  const fly = []; for (let i = 0; i < 20; i++) { const cn = Coin(1.6); cn.userData = { a: r() * 6.28, sp: 0.6 + r(), h: r() }; scene.add(cn); fly.push(cn); }
  const c = cam(38);
  return {
    scene, camera: c,
    update(t, d) {
      chip.rotation.set(0.25, t * 0.5, 0); chip.userData.glow.material.opacity = 0.7 + 0.3 * Math.sin(t * 8);
      towers.forEach(g => { const k = eout(ss(0.1 + g.userData.d, 1.0 + g.userData.d + (tT * 0.5), t)); g.scale.set(1, Math.max(0.001, k), 1); g.visible = k > 0.01; });
      fly.forEach((cn, i) => { const u = cn.userData; const ph = (t * u.sp + u.h) % 1; cn.position.set(Math.cos(u.a + t) * (0.8 + ph * 3), 0.6 + ph * 3.2, Math.sin(u.a + t) * (0.8 + ph * 2)); cn.rotation.set(t * 5 + i, t * 3, 0); });
      look(c, mix(V(0, 2.4, 5.4), V(0, 3.0, 6.6), eio(clamp(t / d))), V(0, 1.1, 0));
      shake(c, t, tT, 0.05);
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s07: but now? he resigned — an empty office chair under a spotlight, the CEO nameplate topples ===============
export function resigned(tRes) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#020204'], [1, '#0b0b14']]);
  lights(scene, { hemi: 0.75, sky: 0xb8c4ff, ground: 0x101018, keyI: 2.8, keyPos: [0, 6, 1.5], rim: RED, rimI: 0.8, shadow: true, shadowR: 3 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), toon(0x16161e)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1.2, 48), addMat(0xfff1d0, 0.18)); pool.rotation.x = -Math.PI / 2; pool.position.y = 0.005; scene.add(pool);
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.2, 40, 1, true), addMat(0xfff1d0, 0.06)); cone.position.y = 2.1; scene.add(cone);
  const desk = M(RB(1.8, 0.07, 0.8, 0.02, 2), 0x3b2a20, { px: 5 }); desk.position.set(0, 0.76, 0.75); scene.add(desk);
  for (const x of [-0.8, 0.8]) { const lg = M(RB(0.07, 0.74, 0.7, 0.01, 2), 0x2a1e17, { px: 3 }); lg.position.set(x, 0.37, 0.75); scene.add(lg); }
  const chair = new THREE.Group(); chair.position.set(0, 0, -0.15); scene.add(chair);
  const seat = M(RB(0.6, 0.1, 0.55, 0.05, 3), 0x4a4a5c, { px: 4 }); seat.position.y = 0.52; chair.add(seat);
  const bk = M(RB(0.6, 0.8, 0.1, 0.06, 3), 0x4a4a5c, { px: 4 }); bk.position.set(0, 1.0, -0.26); bk.rotation.x = -0.1; chair.add(bk);
  const post = M(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 10), CHROME, { px: 2 }); post.position.y = 0.28; chair.add(post);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const leg = M(RB(0.32, 0.04, 0.05, 0.01, 2), CHROME, { px: 2 }); leg.position.set(Math.cos(a) * 0.16, 0.07, Math.sin(a) * 0.16); leg.rotation.y = -a; chair.add(leg); const wh = M(new THREE.SphereGeometry(0.035, 10, 8), 0x111111, { px: 2 }); wh.position.set(Math.cos(a) * 0.3, 0.035, Math.sin(a) * 0.3); chair.add(wh); }
  const jacket = M(RB(0.64, 0.4, 0.07, 0.05, 3), 0x1c1c22, { px: 4 }); jacket.position.set(0, 1.18, -0.2); jacket.rotation.x = -0.1; chair.add(jacket);
  const plate = new THREE.Group(); plate.position.set(0, 0.8, 1.0); scene.add(plate);
  const pb = M(RB(0.62, 0.16, 0.05, 0.02, 2), 0xc9a24a, { px: 3 }); pb.position.y = 0.08; plate.add(pb);
  const pt = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.13), new THREE.MeshBasicMaterial({ map: canvasTex(512, 120, (x, w, h) => { x.fillStyle = '#1a1308'; x.font = '900 92px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('CEO', w / 2, h / 2 + 4); }), transparent: true })); pt.position.set(0, 0.08, 0.027); plate.add(pt);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      chair.rotation.y = 0.6 * Math.sin(t * 0.8) + 0.4 * ss(tRes, tRes + 1.2, t);
      const k = ss(tRes, tRes + 0.35, t); plate.rotation.x = -1.45 * eio(k); plate.position.y = 0.8 - 0.02 * k;
      cone.material.opacity = 0.06 * (1 - 0.6 * k) + 0.02 * Math.sin(t * 20) * k; pool.material.opacity = 0.18 * (1 - 0.5 * k);
      look(c, mix(V(0.0, 1.75, 3.7), V(0.0, 1.55, 3.15), eio(clamp(t / d))), V(0, 1.02, 0.1));
      shake(c, t, tRes + 0.3, 0.02);
    },
    ui: (t) => ({ vig: 0.55 }),
  };
}
// =============== s08: the plaque on that booth? Gone! ... then Denny's put it back ===============
export function plaque(tGone, tBack) {
  const scene = new THREE.Scene(); diner(scene, { winX: 2.6, lampX: 0.9 });
  const b = Booth(2.1); scene.add(b);
  const mug = Mug(); mug.position.set(0.4, 0.83, 0.05); scene.add(mug);
  const ptex = canvasTex(1024, 560, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#e4b85a'); g.addColorStop(0.5, '#f7dc8c'); g.addColorStop(1, '#b8862f'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = '#6b4a12'; x.lineWidth = 16; x.strokeRect(24, 24, w - 48, h - 48);
    x.fillStyle = '#3a2706'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 96px Inter';
    x.fillText('THE BOOTH THAT', w / 2, 150); x.fillText('LAUNCHED A', w / 2, 260); x.fillStyle = '#7a1414'; x.font = '900 104px Inter'; x.fillText('$1 TRILLION', w / 2, 372); x.fillStyle = '#3a2706'; x.font = '900 96px Inter'; x.fillText('COMPANY', w / 2, 476); });
  const pl = new THREE.Group(); scene.add(pl);
  const board = M(RB(0.92, 0.5, 0.04, 0.03, 2), 0x8a6420, { px: 4 }); pl.add(board);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.48), new THREE.MeshToonMaterial({ map: ptex })); face.position.z = 0.022; pl.add(face);
  const HOME = V(0, 1.72, -1.0);
  const ghost = new THREE.Mesh(new THREE.PlaneGeometry(0.94, 0.52), new THREE.MeshBasicMaterial({ color: 0x2c8590, transparent: true, opacity: 0 })); ghost.position.copy(HOME).add(V(0, 0, -0.012)); scene.add(ghost);
  const screws = []; for (const [x, y] of [[-0.43, 0.22], [0.43, 0.22], [-0.43, -0.22], [0.43, -0.22]]) { const s = M(new THREE.SphereGeometry(0.014, 8, 6), 0x222222, { px: 1.5 }); s.position.copy(HOME).add(V(x, y, 0.005)); scene.add(s); screws.push(s); }
  const puff = []; const r = rnd(4); for (let i = 0; i < 14; i++) { const s = halo(0xffffff, 0.25, 0); s.userData = { a: r() * 6.28, sp: 0.4 + r() * 0.5 }; scene.add(s); puff.push(s); }
  const spark = []; for (let i = 0; i < 12; i++) { const s = halo(GOLD, 0.2, 0); s.userData = { a: i / 12 * 6.28 }; scene.add(s); spark.push(s); }
  const q = labelSprite('?', '#FFD60A', 0.9, 170); q.position.copy(HOME).add(V(0, 0, 0.1)); scene.add(q);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      const gone = ss(tGone - 0.05, tGone + 0.25, t), backK = eout(ss(tBack - 0.35, tBack, t));
      const off = gone * (1 - backK);
      pl.position.copy(HOME).add(V(0, 0.2 * off, 0.3 * off + 0.4 * (1 - backK) * gone * 0)); pl.scale.setScalar(Math.max(0.001, 1 - off)); pl.visible = 1 - off > 0.01; pl.rotation.z = 0.5 * off;
      if (t > tBack - 0.35 && t < tBack) { const u = backK; pl.position.copy(HOME).add(V(0, 0.9 * (1 - u), 0.6 * (1 - u))); pl.scale.setScalar(Math.max(0.001, u)); pl.visible = u > 0.01; pl.rotation.z = -0.4 * (1 - u); }
      ghost.material.opacity = 0.9 * off; popLabel(q, 0.9, off > 0.9 && t < tBack - 0.35 ? back(clamp((t - tGone - 0.3) / 0.3)) : 0); q.position.y = HOME.y + 0.03 * Math.sin(t * 5);
      puff.forEach((s, i) => { const u = s.userData, k = clamp((t - tGone) / 0.7); s.position.copy(HOME).add(V(Math.cos(u.a) * k * 0.7 * u.sp, Math.sin(u.a) * k * 0.4 * u.sp, 0.15)); s.material.opacity = 0.7 * (k > 0 && k < 1 ? 1 - k : 0); s.scale.setScalar(0.2 + k * 0.4); });
      spark.forEach((s, i) => { const k = clamp((t - tBack) / 0.6); s.position.copy(HOME).add(V(Math.cos(s.userData.a) * (0.5 + k * 0.4), Math.sin(s.userData.a) * (0.32 + k * 0.3), 0.12)); s.material.opacity = 0.9 * (k > 0 && k < 1 ? 1 - k : 0); });
      look(c, mix(V(0.15, 1.6, 2.6), V(0.08, 1.62, 2.25), eio(clamp(t / d))), V(0, 1.45, -0.6));
      shake(c, t, tBack, 0.035);
    },
    ui: (t) => ({ vig: 0.3, flash: 0.3 * (1 - ss(tBack, tBack + 0.25, t)) * ss(tBack - 0.05, tBack, t) }),
  };
}
