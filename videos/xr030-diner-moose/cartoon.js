// xr030-diner-moose (USELESS FACTS, owner 27/11/2026): "Splitting the check won't save you." A bull moose (up to ~1,600 lb,
// up to 35 mph, Alaska Department of Fish and Game) crashes through the diner window onto the friend who splits the check
// to the cent; then, in the other version, onto the friend who "forgot his wallet". It even leaves a tip.
// One place: a roadside diner (booth under a big window, counter with stools on the right, neon signs).
// Cartoon only: nobody is hurt on screen (the moose straddles the table; a pair of sneakers pokes out). Generic, no brands.
// Times come from the real ElevenLabs narration: st(i) = sentence i start, wd(i, j) = word j (0-based) of sentence i.
import { props, room, TABLE_H, COUNTER_H, designY } from '../../engine/cartoon/sets.js';

export default function story(E, tm) {
  const { THREE, P, add, tbox, box, group, mat, glow, lamp, actor, fxCard, alive, camKeys, EASE, clamp, lerp } = E;
  const { st, wd, total } = tm;
  const X = props(E);
  const TY = designY(TABLE_H);
  const ramp = (t, a, b) => clamp((t - a) / (b - a));
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g, t }; };
  const cyl = (r0, r1, h, n = 20) => new THREE.CylinderGeometry(r0, r1, h, n);
  const sph = (r, a = 22, b = 16) => new THREE.SphereGeometry(r, a, b);

  // ================= DINER =================
  const RH = 3.1, BW = -3.94;
  room(E, E.scene, 0, 0, { w: 10, d: 8, h: RH, floor: mat({ map: P.checker(301, '#f2ece0', '#1f2a36', 4), rep: [3, 2.4] }),
    wallTop: mat({ map: P.wallpaper(302, '#5fb0a8', '#68b9b1', 'rgba(255,255,255,.18)'), rep: [6, 2] }), wallLow: mat({ map: P.wainscot(303, 0, 40), rep: [6, 1], color: '#c0392b' }), wainH: 1.0, ceil: '#e9e1cf' });
  add(box(10, 0.08, 0.02), '#d9dde2', 0, 1.02, BW + 0.02, E.scene, { cast: false }); // chrome trim
  // the big window (daytime, pines and a parking lot = moose country)
  const outside = canvasTex(512, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fc0ee'); gr.addColorStop(0.7, '#d6ecf6'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = P.rng(304); for (let i = 0; i < 16; i++) { const x = i * 34 + r() * 10, hh = 70 + r() * 60; g.fillStyle = i % 2 ? '#2f5a3a' : '#3a6a44'; g.beginPath(); g.moveTo(x, h * 0.72 - hh); g.lineTo(x - 24, h * 0.72); g.lineTo(x + 24, h * 0.72); g.fill(); }
    g.fillStyle = '#6a6a72'; g.fillRect(0, h * 0.72, w, h); g.fillStyle = '#f4f1ea'; for (let i = 0; i < 6; i++) g.fillRect(30 + i * 90, h * 0.82, 6, 40);
    g.fillStyle = '#b8282b'; g.fillRect(300, h * 0.7, 120, 40); g.fillStyle = '#20303e'; g.fillRect(330, h * 0.66, 50, 22); g.fillStyle = '#14141a'; g.beginPath(); g.arc(325, h * 0.86, 12, 0, 7); g.arc(400, h * 0.86, 12, 0, 7); g.fill(); });
  const WIN = { x: 0, y: 1.85, w: 2.6, h: 1.2 };
  X.window(E.scene, WIN.x, WIN.y, BW + 0.02, 0, WIN.w, WIN.h, outside.c); lamp(0, 1.9, BW + 0.9, '#e8f4ff', 1.4, 5, 'window');
  // broken-glass overlay (glass remnants on the frame, a hole in the middle)
  const broken = canvasTex(520, 240, (g, w, h) => { g.clearRect(0, 0, w, h); const r = P.rng(305); g.fillStyle = 'rgba(210,236,250,.85)'; g.strokeStyle = '#5a7a8a'; g.lineWidth = 3;
    const edge = [[0, 0], [w, 0], [w, h], [0, h]]; for (let s = 0; s < 4; s++) { const [a, b] = [edge[s], edge[(s + 1) % 4]];
      for (let k = 0; k < 5; k++) { const t0 = k / 5, t1 = (k + 1) / 5, ax = a[0] + (b[0] - a[0]) * t0, ay = a[1] + (b[1] - a[1]) * t0, bx = a[0] + (b[0] - a[0]) * t1, by = a[1] + (b[1] - a[1]) * t1;
        const mx = (ax + bx) / 2 + (w / 2 - (ax + bx) / 2) * (0.18 + r() * 0.25), my = (ay + by) / 2 + (h / 2 - (ay + by) / 2) * (0.2 + r() * 0.35);
        g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.lineTo(mx, my); g.closePath(); g.fill(); g.stroke(); } } });
  const hole = add(new THREE.PlaneGeometry(WIN.w, WIN.h), new THREE.MeshBasicMaterial({ map: broken.t, transparent: true, fog: false }), WIN.x, WIN.y, BW + 0.08, E.scene, { cast: false, noink: true });
  const shards = []; { const r = P.rng(306); const gm = new THREE.MeshBasicMaterial({ color: '#d6f0ff', transparent: true, opacity: 0.8, side: THREE.DoubleSide, fog: false });
    for (let i = 0; i < 18; i++) { const geo = new THREE.BufferGeometry(); const s = 0.08 + r() * 0.14; geo.setAttribute('position', new THREE.Float32BufferAttribute([0, s, 0, -s * 0.7, -s * 0.5, 0, s * 0.8, -s * 0.6, 0], 3));
      const m = add(geo, gm, 0, -5, 0, E.scene, { cast: false, noink: true }); shards.push({ m, x0: (r() - 0.5) * WIN.w * 0.8, y0: (r() - 0.5) * WIN.h * 0.8, vx: (r() - 0.5) * 2.6, vy: 0.5 + r() * 1.6, vz: 1.6 + r() * 2.6, sp: r() * 9 }); } }
  // booth + table under the window, the receipt and a calculator-ish phone, milkshakes, a napkin dispenser
  X.booth(E.scene, 0, BW + 0.45, 0, { w: 2.2, col: '#c0392b' });
  const TBL = { x: 0, z: BW + 1.06 };
  const table = X.table(E.scene, TBL.x, TBL.z, { w: 1.5, d: 0.72, top: '#c8d4dc' });
  add(tbox(1.54, 0.03, 0.76, 1), '#d9dde2', TBL.x, TABLE_H - 0.03, TBL.z, E.scene); // chrome edge
  X.glass(E.scene, -0.5, TABLE_H, TBL.z + 0.1, '#f4b6c8'); X.glass(E.scene, 0.52, TABLE_H, TBL.z + 0.05, '#7a4a2a');
  X.plate(E.scene, -0.45, TABLE_H, TBL.z - 0.08, 'steak'); X.plate(E.scene, 0.3, TABLE_H, TBL.z - 0.12, null);
  add(tbox(0.12, 0.14, 0.08, 1), '#d9dde2', 0.62, TABLE_H + 0.07, TBL.z - 0.24, E.scene);
  const receipt = add(box(0.12, 0.004, 0.32), '#fbf8f0', 0.1, TABLE_H + 0.004, TBL.z + 0.1, E.scene, { cast: false }); receipt.rotation.y = 0.3;
  // the tip (s08): a generic green bill and a coin
  const billTex = canvasTex(256, 110, (g, w, h) => { g.fillStyle = '#cfe6c2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3f7a3a'; g.lineWidth = 8; g.strokeRect(6, 6, w - 12, h - 12);
    g.fillStyle = '#3f7a3a'; g.font = '900 64px Inter, Arial Black'; g.textAlign = 'center'; g.fillText('TIP', w / 2, 76); g.beginPath(); g.arc(34, 55, 18, 0, 7); g.arc(w - 34, 55, 18, 0, 7); g.fill(); });
  const bill = add(box(0.5, 0.004, 0.22), mat({ map: billTex.c }), 0.0, TABLE_H + 0.008, TBL.z + 0.2, E.scene, { cast: false }); bill.rotation.y = -0.12;
  const coin = add(cyl(0.06, 0.06, 0.012, 20), '#d9b45a', 0.36, TABLE_H + 0.008, TBL.z + 0.22, E.scene);
  X.pendant(E.scene, 0.9, 2.95, TBL.z + 0.6, { col: '#c0392b', light: '#ffd29a', i: 2.6 });
  // neon signs (own text) and a clock
  const neon = (txt, col, x, y, z, ry, w = 1.3, h = 0.42) => { const n = canvasTex(512, 160, (g, W, H) => { g.fillStyle = '#14161c'; g.fillRect(0, 0, W, H); g.shadowColor = col; g.shadowBlur = 26; g.strokeStyle = col; g.lineWidth = 10;
      g.font = '900 104px Inter, Arial Black'; g.textAlign = 'center'; g.strokeText(txt, W / 2, 118); g.shadowBlur = 0; g.fillStyle = '#fff'; g.fillText(txt, W / 2, 118); });
    const m = add(box(w, h, 0.02), new THREE.MeshBasicMaterial({ map: n.t }), x, y, z, E.scene, { cast: false, noink: true }); m.rotation.y = ry; lamp(x + Math.sin(ry) * 0.4, y, z + Math.cos(ry) * 0.4, col, 0.8, 3, 'neon'); return m; };
  neon('DINER', '#ff4fa0', -2.9, 2.2, BW + 0.03, 0); neon('PIE', '#5fd0ff', 2.5, 2.35, BW + 0.03, 0, 0.8, 0.38);
  const clock = X.wallClock(E.scene, 2.5, 1.65, BW + 0.03, 0, 0.24); clock.set(12 * 60 + 20);
  X.frame(E.scene, -2.9, 1.5, BW + 0.03, 0, 0.5, 0.42, 307);
  // counter with stools along the right
  add(tbox(0.7, COUNTER_H, 5.2, 1), mat({ map: P.wainscot(308, 0, 40), rep: [1, 4], color: '#c0392b' }), 4.4, COUNTER_H / 2, -0.6, E.scene);
  add(tbox(0.8, 0.05, 5.3, 1), '#eeeae2', 4.4, COUNTER_H + 0.02, -0.6, E.scene);
  for (let i = 0; i < 5; i++) { const z = -2.8 + i * 1.0; add(cyl(0.03, 0.03, 0.72, 10), '#d9dde2', 3.75, 0.36, z, E.scene); add(cyl(0.2, 0.2, 0.08, 20), '#c0392b', 3.75, 0.76, z, E.scene); }
  const pie = group(4.4, COUNTER_H + 0.05, 0.2, E.scene); add(cyl(0.2, 0.2, 0.02, 24), '#d9dde2', 0, 0.01, 0, pie); add(cyl(0.18, 0.16, 0.06, 24), '#d9a25a', 0, 0.05, 0, pie);
  add(new THREE.SphereGeometry(0.22, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshToonMaterial({ color: '#e8f6ff', transparent: true, opacity: 0.35 }), 0, 0.03, 0, pie, { noink: true });
  add(cyl(0.07, 0.08, 0.18, 16), new THREE.MeshToonMaterial({ color: '#cfe8f5', transparent: true, opacity: 0.6 }), 4.35, COUNTER_H + 0.12, -1.4, E.scene, { noink: true });
  X.plant(E.scene, -4.3, BW + 0.5, 1.0);
  for (const [x, z] of [[-2.2, 0.3], [2.0, 1.4]]) { X.table(E.scene, x, z, { w: 0.8, d: 0.8, top: '#c8d4dc', round: true }); X.chair(E.scene, x, z - 0.6, 0, '#c0392b'); }
  lamp(-1.5, 2.6, 0.5, '#fff1dc', 1.3, 8, 'diner'); lamp(2.4, 2.6, -1.0, '#fff1dc', 1.0, 8, 'diner');

  // ================= THE MOOSE (bull, facing +z; hooves at y 0) =================
  const moose = (() => { const root = group(0, 0, -20, E.scene), g = group(0, 0, 0, root);
    const FUR = '#4a2e1c', FUR2 = '#5e3c24', LEGC = '#9a8a7a';
    const body = add(sph(1), FUR, 0, 1.55, 0, g); body.scale.set(0.56, 0.5, 1.22);
    const hump = add(sph(1), FUR2, 0, 1.92, 0.55, g); hump.scale.set(0.44, 0.38, 0.62);
    const rump = add(sph(1), FUR, 0, 1.5, -0.8, g); rump.scale.set(0.5, 0.46, 0.5);
    add(cyl(0.05, 0.02, 0.2, 8), FUR, 0, 1.6, -1.28, g).rotation.x = -0.6; // stubby tail
    const legs = {};
    for (const [n, x, z] of [['fl', 0.3, 0.82], ['fr', -0.3, 0.82], ['bl', 0.3, -0.82], ['br', -0.3, -0.82]]) {
      const lg = group(x, 1.2, z, g); legs[n] = lg;
      add(cyl(0.12, 0.09, 0.6, 12), FUR, 0, -0.3, 0, lg); add(cyl(0.075, 0.06, 0.62, 12), LEGC, 0, -0.88, 0, lg); add(tbox(0.15, 0.08, 0.2, 1), '#1d1612', 0, -1.18, 0.02, lg); }
    const neck = add(cyl(0.3, 0.36, 0.7, 14), FUR2, 0, 2.0, 1.05, g); neck.rotation.x = 0.9;
    const head = group(0, 2.15, 1.45, g);
    const skull = add(sph(1), FUR, 0, 0, 0.18, head); skull.scale.set(0.27, 0.27, 0.42);
    const snout = add(sph(1), '#5e3c24', 0, -0.12, 0.6, head); snout.scale.set(0.24, 0.24, 0.3);
    for (const s of [-1, 1]) add(sph(0.045), '#14100c', s * 0.1, -0.12, 0.88, head, { noink: true });
    const bell = add(new THREE.ConeGeometry(0.08, 0.36, 10), FUR, 0, -0.42, 0.18, head); bell.rotation.x = Math.PI;
    const eyes = []; for (const s of [-1, 1]) { const e = group(s * 0.22, 0.1, 0.32, head); add(sph(0.075), '#ffffff', 0, 0, 0, e); eyes.push(add(sph(0.038), '#14100c', s * 0.012, 0, 0.055, e, { noink: true })); }
    const lids = []; for (const s of [-1, 1]) { const l = add(sph(0.08, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), FUR, s * 0.22, 0.1, 0.32, head, { noink: true }); l.scale.y = 0.05; lids.push(l); }
    const ears = []; for (const s of [-1, 1]) { const e = group(s * 0.22, 0.2, 0.0, head); const c = add(new THREE.ConeGeometry(0.07, 0.24, 10), FUR, 0, 0.12, 0, e); c.scale.z = 0.5; e.rotation.z = -s * 0.9; ears.push(e); }
    // palmate antlers (own shape)
    const palm = new THREE.Shape(); palm.moveTo(0, 0); palm.lineTo(0.18, 0.04); palm.bezierCurveTo(0.3, 0.05, 0.42, 0.12, 0.5, 0.26);
    for (let i = 0; i < 5; i++) { const x = 0.5 - i * 0.1, y = 0.26 + i * 0.07; palm.lineTo(x + 0.06, y + 0.14); palm.lineTo(x - 0.01, y + 0.04); }
    palm.lineTo(0.08, 0.5); palm.lineTo(0.06, 0.62); palm.lineTo(0.0, 0.46); palm.bezierCurveTo(-0.04, 0.3, 0.04, 0.14, 0, 0);
    const pg = new THREE.ExtrudeGeometry(palm, { depth: 0.035, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 1, curveSegments: 10 });
    for (const s of [-1, 1]) { const a = group(s * 0.16, 0.22, 0.05, head); const m = add(pg, '#e2cfa2', 0, 0, 0, a); a.scale.set(s * 1.15, 1.15, 1.15); a.rotation.set(-0.25, s * 0.15, s * -0.35); }
    head.rotation.x = 0.35;
    return { root, g, legs, head, eyes, lids, ears }; })();
  const mooseLife = (t, { walk = 0, chew = 0, blink = true, look = 0 } = {}) => { const L = moose.legs, a = Math.sin(t * 9) * walk;
    L.fl.rotation.x = a; L.br.rotation.x = a; L.fr.rotation.x = -a; L.bl.rotation.x = -a;
    moose.head.rotation.x = 0.35 + Math.sin(t * 1.3) * 0.04 + chew * Math.abs(Math.sin(t * 7)) * 0.05; moose.head.rotation.y = look;
    moose.ears.forEach((e, i) => { e.rotation.x = Math.sin(t * 3 + i) * 0.2 + ((t * 0.7 + i * 0.3) % 1 < 0.06 ? 0.5 : 0); });
    const bl = blink && (t * 0.45) % 1 < 0.05; moose.lids.forEach((l) => { l.scale.y = bl ? 1 : 0.05; }); };

  // shoes sticking out from under the table (cartoon), toes up
  const shoes = group(0, 0, 0, E.scene); for (const sx of [-0.13, 0.13]) { const s = group(sx, 0.06, 0, shoes); add(tbox(0.13, 0.1, 0.28, 1), '#f4f1ea', 0, 0, 0, s); add(tbox(0.14, 0.04, 0.3, 1), '#d81e2a', 0, -0.05, 0, s); s.rotation.x = -0.9; }
  const shoesW = group(0, 0, 0, E.scene); for (const sx of [-0.1, 0.1]) { const s = group(sx, 0.05, 0, shoesW); add(tbox(0.1, 0.08, 0.22, 1), '#ff7a2a', 0, 0, 0, s); add(tbox(0.11, 0.03, 0.24, 1), '#1d1b22', 0, -0.04, 0, s); s.rotation.x = -0.9; }

  // ================= shots =================
  const T = { s01: 0, s02: st(2) - 0.12, s03: st(3) - 0.12, s04: st(4) - 0.15, s05: st(5) - 0.15, s06: st(6) - 0.15, s07: st(7) - 0.15, s08: st(8) - 0.15 };
  const shots = Object.entries(T).map(([id, start]) => ({ id, start }));
  const shotAt = (t) => { let id = 's01'; for (const [k, v] of Object.entries(T)) if (t >= v) id = k; return id; };
  const aim = (tg, Wd, yaw = 0, pitch = 8, fov = 36) => { const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * 0.5625), d = Wd / (2 * Math.tan(hf / 2));
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { pos: [tg[0] + Math.sin(y) * Math.cos(p) * d, tg[1] + Math.sin(p) * d, tg[2] + Math.cos(y) * Math.cos(p) * d], look: [...tg], fov }; };
  const k = (t, tg, Wd, yaw, pitch, fov, o = {}) => ({ t, ...aim(tg, Wd, yaw, pitch, fov), ...o });
  const Z0 = BW + 0.7; // seated row
  const BREAK1 = wd(3, 3) - 0.05, LAND1 = wd(3, 6) + 0.05, BREAK2 = T.s07 + 0.12, LAND2 = wd(7, 1) - 0.02;
  const K = {
    s01: [k(0, [0, 1.15, Z0 + 0.3], 3.0, 4, 6, 46), k(T.s02, [0, 1.12, Z0 + 0.3], 2.6, 0, 6, 46)],
    s02: [k(T.s02, [0.05, 1.05, Z0 + 0.2], 1.7, -14, 10, 44), k(T.s03, [0.05, 1.05, Z0 + 0.2], 1.5, -10, 10, 44)],
    s03: [k(T.s03, [0, 1.5, Z0 + 0.2], 3.6, 10, 2, 54), k(BREAK1, [0, 1.6, Z0 + 0.2], 3.8, 8, 0, 56), k(T.s04, [0, 1.6, Z0 + 0.4], 4.6, 6, 0, 58)],
    s04: [k(T.s04, [0, 1.75, Z0 + 0.7], 4.6, -10, -2, 54), k(T.s05, [0, 1.75, Z0 + 0.7], 4.2, -6, -2, 54)],
    s05: [k(T.s05, [0, 1.0, Z0 + 0.9], 4.4, -12, 8, 56), k(T.s06, [0, 0.8, Z0 + 1.0], 3.4, -8, 10, 56)],
    s06: [k(T.s06, [0, 1.0, Z0 + 0.2], 2.6, 10, 8, 46), k(T.s07, [0, 1.0, Z0 + 0.2], 2.2, 6, 8, 46)],
    s07: [k(T.s07, [0, 1.5, Z0 + 0.4], 4.4, -30, 2, 56), k(LAND2, [0, 1.5, Z0 + 0.4], 4.8, -22, 2, 56), k(T.s08, [0, 1.5, Z0 + 0.4], 5.0, -14, 2, 56)],
    s08: [k(T.s08, [0, 1.5, Z0 + 0.4], 5.4, 0, 6, 54), k(wd(8, 2), [0, 0.95, Z0 + 0.5], 3.0, 0, 18, 50), k(total, [0, 0.75, TBL.z + 0.1], 2.8, 0, 28, 46)],
  };
  const shake = [{ t: BREAK1, a: 0.3 }, { t: LAND1, a: 0.45 }, { t: LAND2, a: 0.45 }];
  const cam = (t) => { const s = shotAt(t); return E.keepInside(camKeys(K[s], t, { shake, hand: 0.004, creep: 0.02 }), [-4.8, 0.2, -3.8], [4.8, 2.95, 9]); };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const dof = (t) => { const s = shotAt(t), c = cam(t); return { focus: dist(c.pos, K[s][0].look), cinf: s === 's02' || s === 's08' ? 2.0 : 1.2 }; };

  // ================= light =================
  const DAY = { sky: '#fff6e8', ground: '#4a3a30', hemi: 1.15, sun: '#fff2dc', sunI: 0.9, az: 200, el: 45, fog: '#e8dccb', fogNear: 30, fogFar: 90, skyTop: '#7fc0ee', skyHor: '#d6ecf6',
    sat: 1.12, vig: 0.22, card: '#ffffff', gain: '#fff8f0', lift: '#000000', grain: 0.02, shadowExt: 8, lamps: { diner: 1, window: 1, neon: 1 } };
  const DOOM = { ...DAY, card: '#ffe0d6', gain: '#ffe8e0', vig: 0.4, sat: 1.18, hemi: 0.95 };
  const WARM = { ...DAY, card: '#fff4e0', gain: '#fff2e0', sat: 1.15, vig: 0.28 };
  const light = (t) => { const s = shotAt(t); if (s === 's04' || s === 's05' || s === 's07') return DOOM; if (s === 's08') return WARM; return DAY; };

  // ================= world animation =================
  const jump = (t, b, l) => { const q = ramp(t, b - 0.35, l); return { z: lerp(BW - 2.4, Z0 + 0.35, EASE.smooth(q)), y: Math.sin(Math.PI * clamp(q * 1.1)) * 0.45, pitch: lerp(-0.25, 0.08, q) }; };
  const update = (t) => {
    const s = shotAt(t);
    let mz = -20, my = 0, pitch = 0, ry = 0, walk = 0, chew = 0, look = 0;
    if (s === 's03') { const j = jump(t, BREAK1, LAND1); mz = j.z; my = t < LAND1 ? j.y : 0; pitch = t < LAND1 ? j.pitch : 0; walk = t < LAND1 ? 1.1 : 0; }
    if (s === 's04' || s === 's05') { mz = Z0 + 0.35; chew = 1; look = s === 's05' ? Math.sin(t * 0.8) * 0.25 : 0.15; }
    if (s === 's07') { const j = jump(t, BREAK2, LAND2); mz = t < LAND2 ? j.z : Z0 + 0.35; my = t < LAND2 ? j.y : 0; pitch = t < LAND2 ? j.pitch : 0; walk = t < LAND2 ? 1.1 : 0; chew = t > LAND2 ? 1 : 0; }
    if (s === 's08') { const turn = EASE.smooth(ramp(t, T.s08 + 0.05, T.s08 + 0.5)), out = ramp(t, T.s08 + 0.45, total - 0.2);
      ry = turn * Math.PI; mz = Z0 + 0.35 - EASE.smooth(clamp(out * 2.2)) * 4.5; my = Math.sin(clamp(out * 3) * Math.PI) * 0.25; walk = turn < 1 ? 0.4 : 1; }
    moose.root.position.set(0, my, mz); moose.root.rotation.set(pitch, ry, 0); moose.root.visible = mz > BW - 2.0 || s === 's08';
    mooseLife(t, { walk, chew, look });
    const brokenNow = (s === 's03' && t > BREAK1) || s === 's04' || s === 's05' || (s === 's07' && t > BREAK2) || s === 's08';
    hole.visible = brokenNow;
    const bt = s === 's07' ? BREAK2 : BREAK1;
    for (const d of shards) { const q = t - bt, on = (s === 's03' || s === 's07') && q > 0 && q < 1.6;
      d.m.visible = on; if (on) d.m.position.set(WIN.x + d.x0 + d.vx * q, Math.max(0.02, WIN.y + d.y0 + d.vy * q - 4.9 * q * q), BW + 0.1 + d.vz * q); d.m.rotation.set(q * d.sp, q * d.sp * 0.7, q * 3); }
    shoes.visible = (s === 's03' && t > LAND1) || s === 's04' || s === 's05'; shoes.position.set(0.15, 0, TBL.z + 0.55);
    shoesW.visible = (s === 's07' && t > LAND2) || s === 's08'; shoesW.position.set(-0.05, 0, TBL.z + 0.5);
    const tip = s === 's08' && t > wd(8, 2) - 0.2; bill.visible = tip; coin.visible = tip;
    receipt.visible = s !== 's08';
    clock.set(12 * 60 + 20 + t * 3, (t * 60) % 60);
  };

  // ================= cast =================
  const LK = {
    hero: { skin: E.SKINS[2], hair: '#2a1c16', style: 'short', top: '#3f6fb5', topKind: 'shirt', shirt: '#f4f1ea', pants: '#34425e', shoes: '#d81e2a', glasses: '#2a2430' },
    // the friend who "forgot his wallet": very short, stout, long blond hair, sunglasses, orange hoodie
    slob: { skin: E.SKINS[0], hair: '#e0c070', style: 'long', top: '#ff7a2a', topKind: 'hoodie', pants: '#2a2a30', shoes: '#ff7a2a', glasses: '#14141a', kid: true, stout: true },
    c1: { skin: E.SKINS[4], hair: '#1e1512', style: 'bun', top: '#8a5ac8', topKind: 'blouse', pants: '#2e3446', shoes: '#8a2f2f' },
    c2: { skin: E.SKINS[1], hair: '#6b4628', style: 'bob', top: '#2f8a5a', topKind: 'shirt', pants: '#2a2e3a', shoes: '#1d1b22' },
    cook: { skin: E.SKINS[3], hair: '#d9d4c8', style: 'balding', top: '#f4f1ea', topKind: 'shirt', apron: '#f4f1ea', pants: '#3a3f52', shoes: '#1d1b22', moustache: '#d9d4c8' },
  };
  const actors = (t) => {
    const s = shotAt(t), A = [];
    const sit = (id, lk, seed, x, p) => A.push(actor({ id, look: LK[lk], seed, x, y: 0, z: Z0, main: id === 'hero' || id === 'slob', pose: alive(t, seed, { mode: 'sit', tableY: TY, ...p }) }));
    const crushed1 = (s === 's03' && t > LAND1 - 0.03) || s === 's04' || s === 's05';
    const crushed2 = (s === 's07' && t > LAND2 - 0.1) || s === 's08';
    // friends on both sides (always alive; they just watch)
    const scare1 = (s === 's03' && t > BREAK1) || s === 's04' || s === 's05', scare2 = (s === 's07' && t > BREAK2) || s === 's08';
    if (s !== 's02') {
      const fp = (side) => scare1 || scare2 ? (s === 's08' ? { expr: 'happy', L: 'wave', R: 'hang', k: t * 1.4, facing: side * -1, look: 0 } : { expr: 'shock', L: 'cheek', R: 'cheek', facing: 0, look: 0 })
        : s === 's06' ? { expr: 'annoyed', L: 'table', R: 'table', facing: -side, look: -side * 0.8 } : { expr: 'happy', L: 'table', R: side > 0 ? 'hold' : 'table', hold: { R: 'glass' }, facing: -side * 0.5, look: -side * 0.5 };
      const fx = s === 's08' || (s === 's07' && t > BREAK2) ? 0.98 : 0.78; sit('f1', 'c1', 31, -fx, fp(-1)); sit('f2', 'c2', 32, fx, fp(1));
    }
    // the check splitter
    if ((s === 's01' || s === 's02' || s === 's03') && !crushed1) {
      let hp = { expr: 'smug', L: 'hold', hold: { L: 'receipt' }, R: 'point', k: t, facing: 0, look: 0.2 };
      if (s === 's02') hp = { expr: 'happy', L: 'hold', hold: { L: 'receipt' }, R: 'point', k: t, facing: 0, look: 0 };
      if (s === 's03' && t > wd(3, 2)) hp = { expr: 'shock', L: 'up', R: 'up', facing: 0, look: 0, headTilt: -6 };
      sit('hero', 'hero', 11, 0, hp);
      if (s === 's02' && t > wd(2, 6)) A.push(fxCard({ id: 'spk', kind: 'sparkle', args: [t * 3], x: 0.35, y: 1.3, z: Z0 + 0.3, s: 0.09 }));
      if (s === 's03' && t > wd(3, 2)) A.push(fxCard({ id: 'ex', kind: 'exclaim', args: [t], x: 0.3, y: 1.55, z: Z0 + 0.2, s: 0.14 }));
    }
    // the "forgot my wallet" friend
    if ((s === 's06' || s === 's07') && !crushed2) {
      let sp = { expr: 'smug', L: 'shrug', R: 'shrug', k: t, facing: 0, look: 0 };
      if (s === 's07' && t > BREAK2) sp = { expr: 'shock', L: 'up', R: 'up', facing: 0, look: 0 };
      sit('slob', 'slob', 21, 0, sp);
      if (s === 's06' && t > wd(6, 6) - 0.1) A.push(fxCard({ id: 'q', kind: 'question', args: [t], x: 0.28, y: 1.25, z: Z0 + 0.2, s: 0.13 }));
    }
    // the cook behind the counter
    if (s === 's01' || s === 's05' || s === 's07') A.push(actor({ id: 'cook', look: LK.cook, seed: 41, x: 4.75, y: 0, z: -0.8, pose: alive(t, 41, { mode: 'stand', expr: s === 's01' ? 'happy' : 'shock', L: s === 's01' ? 'hold' : 'cheek', R: s === 's01' ? 'hang' : 'cheek', hold: { L: 'plate' }, facing: -1, look: -0.7 }) }));
    if ((s === 's03' && t > LAND1) || (s === 's07' && t > LAND2)) { const t0 = s === 's03' ? LAND1 : LAND2; const q = ramp(t, t0, t0 + 0.55); if (q < 1 && s === 's03') A.push(fxCard({ id: 'puff', kind: 'puff', args: [q], x: 0, y: 0.35, z: TBL.z + 1.0, s: 0.9 })); }
    if (s === 's08' && t > wd(8, 2) - 0.2) A.push(fxCard({ id: 'sp8', kind: 'sparkle', args: [t * 3], x: -0.2, y: TABLE_H + 0.18, z: TBL.z + 0.25, s: 0.2 }));
    return A;
  };

  // ================= text =================
  const M_ = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B_ = (a, cls = '', fs = 230) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const ui = (t) => {
    const s = shotAt(t), o = { capY: 1500 };
    if (s === 's01') { o.title = M_('SPLIT') + M_('THE CHECK', 'y'); o.titleK = 1; }
    if (s === 's02' && t > wd(2, 9) - 0.15) { o.title = B_('$14.37', 'y', 190) + M_('EACH'); o.titleK = (t - wd(2, 9) + 0.15) / 0.3; }
    if (s === 's04') { const big = t > wd(4, 3) - 0.1; o.title = big ? B_('35 MPH', 'y', 200) : B_('1,600 LB', 'y', 180); o.titleK = (t - (big ? wd(4, 3) - 0.1 : T.s04)) / 0.3; o.capY = 1560; }
    if (s === 's05') { o.title = M_('R.I.P.', 'r'); o.titleK = (t - T.s05) / 0.3; }
    if (s === 's06' && t > wd(6, 6) - 0.1) { o.title = M_('NO', 'r') + M_('WALLET'); o.titleK = (t - wd(6, 6) + 0.1) / 0.3; }
    if (s === 's07') { o.title = M_('SAME') + M_('MOOSE', 'y'); o.titleK = (t - T.s07) / 0.3; o.capY = 1560; }
    if (s === 's08' && t > wd(8, 4) - 0.1) { o.title = M_('+ TIP', 'y'); o.titleK = (t - wd(8, 4) + 0.1) / 0.3; }
    return o;
  };
  const KEY = ['check', 'cent', 'moose', 'window', 'sixteen', 'thirty-five', 'die', 'wallet', 'same', 'tip'];
  return { shots, cam, dof, light, update, actors, ui, KEY };
}
