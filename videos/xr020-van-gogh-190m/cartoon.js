// xr020-van-gogh-190m: Van Gogh's "Chestnut Trees in Blossom" (May 1890) sold for $190.4M at Sotheby's New York on Nov. 18, 2026.
// Two places in one world: an emerald evening sale room with a gold-framed painting, a rostrum, a price board and a phone bank (origin),
// and a spring meadow in Auvers, May 1890, with two blossoming chestnut trees and a painter at his easel (x = +60).
// Times come from the real ElevenLabs narration: st(i) = sentence i start, wd(i, j) = word j (0-based) of sentence i.
// The painting is our own loose brushwork take on a public-domain 1890 subject. Real people: generic figures, no likeness, no names on screen
// except Van Gogh's in text. No logos: the auction house is never shown or named on screen.
import { props, room, TABLE_H } from '../../engine/cartoon/sets.js';

export default function story(E, tm) {
  const { THREE, P, add, tbox, box, group, mat, glow, lamp, actor, fxCard, alive, camKeys, EASE, clamp, lerp } = E;
  const { st, wd, total } = tm;
  const X = props(E);
  const ramp = (t, a, b) => clamp((t - a) / (b - a));
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g, t }; };
  const flat = (tx, k = 1) => new THREE.MeshBasicMaterial({ map: tx.t, color: new THREE.Color(k, k, k), fog: false });
  const txt = (g, s, x, y, size, col = '#ffffff', w = 900, align = 'center', f = 'Inter, Arial Black, Arial') => { g.font = `${w} ${size}px ${f}`; g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); };

  // ================= THE PAINTING (own brushwork: sky dashes, two chestnut trees with white-pink blossom candles, meadow, path) =================
  const strokes = (() => { const r = P.rng(1890), S = [];
    const dab = (x, y, len, ang, wid, col) => S.push({ x, y, len, ang, wid, col });
    // sky: short swirling dashes, top band
    for (let i = 0; i < 520; i++) { const x = r() * 800, y = r() * 300, a = Math.sin(x * 0.012 + y * 0.02) * 0.9; dab(x, y, 22 + r() * 18, a, 7 + r() * 4, ['#7fb3dc', '#9cc6e6', '#cfe4f2', '#f4f1e6', '#6aa0cf'][Math.floor(r() * 5)]); }
    // meadow + path
    for (let i = 0; i < 520; i++) { const x = r() * 800, y = 430 + r() * 220; dab(x, y, 20 + r() * 16, -0.3 + r() * 0.6, 7 + r() * 4, ['#8ab04a', '#a9c25a', '#c9b44a', '#6e9a3c', '#d9c46a'][Math.floor(r() * 5)]); }
    for (let i = 0; i < 160; i++) { const u = r(), x = 330 + u * 160 + (r() - 0.5) * (40 + u * 120), y = 430 + u * 220; dab(x, y, 18 + r() * 12, 0.1, 7, ['#e2c27a', '#d9a85a', '#f0d9a0'][Math.floor(r() * 3)]); }
    // two tree trunks
    for (const [tx, ty] of [[210, 470], [600, 460]]) for (let i = 0; i < 26; i++) dab(tx + (r() - 0.5) * 22, ty - i * 6, 16, 1.5 + (r() - 0.5) * 0.3, 8, ['#5a3a22', '#7a5232', '#3e2a1c'][Math.floor(r() * 3)]);
    // foliage masses (dark green dabs), then blossom candles
    for (const [cx, cy, rx, ry] of [[210, 280, 200, 175], [600, 270, 190, 170]]) {
      for (let i = 0; i < 620; i++) { const a = r() * 6.283, d = Math.sqrt(r()); dab(cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 18 + r() * 12, a + 1.2, 8 + r() * 4, ['#2f5d2a', '#3f7a34', '#4d8a3a', '#25472a', '#5f9a44'][Math.floor(r() * 5)]); }
      for (let i = 0; i < 150; i++) { const a = r() * 6.283, d = 0.2 + 0.78 * Math.sqrt(r()), bx = cx + Math.cos(a) * rx * d, by = cy + Math.sin(a) * ry * d;
        for (let k = 0; k < 6; k++) dab(bx + (r() - 0.5) * 5, by - k * 6, 9, 0, 13 - 1.8 * k, ['#fffaf2', '#ffe9ec', '#f7c6cf', '#ffffff'][Math.floor(r() * 4)]); }
    }
    return S; })();
  const paintTo = (g, w, h, frac = 1) => { g.fillStyle = '#efe6cf'; g.fillRect(0, 0, w, h); const sx = w / 800, sy = h / 650, n = Math.round(strokes.length * frac);
    g.lineCap = 'round'; for (let i = 0; i < n; i++) { const s = strokes[i]; g.strokeStyle = s.col; g.lineWidth = s.wid * sx; g.beginPath();
      g.moveTo((s.x - Math.cos(s.ang) * s.len / 2) * sx, (s.y - Math.sin(s.ang) * s.len / 2) * sy); g.lineTo((s.x + Math.cos(s.ang) * s.len / 2) * sx, (s.y + Math.sin(s.ang) * s.len / 2) * sy); g.stroke(); } };
  const artTx = canvasTex(800, 650, (g, w, h) => paintTo(g, w, h, 1));

  // ================= THE SALE ROOM (origin) =================
  const BW = -5.94; // back wall face (room d = 12)
  room(E, E.scene, 0, 0, { w: 11, d: 12, h: 3.8, floor: E.mat({ map: P.planks(201), rep: [2.5, 2.5], color: '#6a4a34' }),
    wallTop: E.mat({ map: P.fabric(202, '#1f5a46'), rep: [2.5, 1] }), wallLow: E.mat({ map: P.wainscot(203, 30, 26), rep: [5, 1] }), wainH: 0.95, ceil: '#e9dfc8' });
  // gold picture rail
  add(tbox(10.9, 0.06, 0.08, 1), '#c9a24a', 0, 3.25, BW + 0.04, E.scene, { cast: false });
  // the easel + gold frame + painting (hero)
  const PT = { x: 0.35, y: 1.9, z: -5.35, w: 1.5, h: 1.22 };
  { const eg = group(PT.x, 0, PT.z - 0.12, E.scene);
    for (const s of [-1, 1]) { const leg = add(box(0.07, 2.3, 0.07), '#6b4a2e', s * 0.5, 1.12, 0.05, eg); leg.rotation.z = s * 0.08; }
    const bl = add(box(0.07, 2.3, 0.07), '#6b4a2e', 0, 1.1, -0.35, eg); bl.rotation.x = -0.18;
    add(box(1.2, 0.07, 0.14), '#6b4a2e', 0, PT.y - PT.h / 2 - 0.12, 0.12, eg); }
  add(tbox(PT.w + 0.26, PT.h + 0.26, 0.09, 1), '#c9a24a', PT.x, PT.y, PT.z, E.scene);
  add(tbox(PT.w + 0.12, PT.h + 0.12, 0.1, 1), '#8a6a2a', PT.x, PT.y, PT.z + 0.01, E.scene);
  add(new THREE.PlaneGeometry(PT.w, PT.h), mat({ map: artTx.c }), PT.x, PT.y, PT.z + 0.065, E.scene, { cast: false, noink: true });
  lamp(PT.x, 3.1, PT.z + 1.4, '#fff1d0', 3.4, 4.2, 'spot');
  // velvet rope in front of the painting
  X.stanchion(E.scene, PT.x - 1.0, PT.z + 0.75); X.stanchion(E.scene, PT.x + 1.0, PT.z + 0.75); X.rope(E.scene, [PT.x - 1.0, PT.z + 0.75], [PT.x + 1.0, PT.z + 0.75], 0.16, '#8a1f2a');
  // rostrum (auctioneer stands behind it)
  const RO = { x: -1.55, z: -4.7 };
  add(tbox(0.95, 0.9, 0.62, 1), E.mat({ map: P.planks(211, 1), color: '#5a3a24' }), RO.x, 0.45, RO.z, E.scene);
  add(tbox(1.05, 0.06, 0.7, 1), '#c9a24a', RO.x, 0.93, RO.z, E.scene);
  add(box(0.6, 0.46, 0.012), '#c9a24a', RO.x, 0.5, RO.z + 0.315, E.scene, { cast: false });
  add(box(0.5, 0.36, 0.014), '#7a1f2a', RO.x, 0.5, RO.z + 0.32, E.scene, { cast: false });
  lamp(RO.x, 2.4, RO.z + 0.9, '#ffe2b0', 1.6, 3.2, 'spot');
  // price board on the back wall (right)
  const BD = { x: 2.55, y: 2.05, w: 1.8, h: 1.33 };
  add(tbox(BD.w + 0.12, BD.h + 0.12, 0.08, 1), '#c9a24a', BD.x, BD.y, BW + 0.04, E.scene);
  const bdTx = canvasTex(760, 560, () => {});
  add(new THREE.PlaneGeometry(BD.w, BD.h), flat(bdTx, 1.0), BD.x, BD.y, BW + 0.09, E.scene, { cast: false, receive: false, noink: true });
  let bdKey = '';
  const money = (v) => '$' + Math.round(v).toLocaleString('en-US');
  const drawBoard = (mode, v, k = 0) => { const key = mode + '|' + Math.round(v / 1e5) + '|' + Math.round(k * 30); if (key === bdKey) return; bdKey = key; const g = bdTx.g, w = 760, h = 560;
    g.fillStyle = '#16130e'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9a24a'; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
    if (mode === 'price' || mode === 'sold') {
      txt(g, 'VINCENT VAN GOGH', w / 2, 72, 44, '#e8cf8a', 900); txt(g, 'CHESTNUT TREES IN BLOSSOM · 1890', w / 2, 122, 28, '#b8a070', 700);
      txt(g, mode === 'sold' ? 'SOLD FOR' : 'CURRENT BID', w / 2, 200, 30, mode === 'sold' ? '#e8cf8a' : '#8a8070', 800); txt(g, money(v), w / 2, 290, 92, '#ffffff', 900); txt(g, 'USD · WITH FEES', w / 2, 360, 26, '#8a8070', 800);
      if (mode === 'sold') { g.save(); g.translate(w / 2, 455); g.rotate(-0.08); const s = 1 + (1 - k) * 0.4; g.scale(s, s); g.globalAlpha = Math.min(1, k * 2);
        g.fillStyle = '#c0392b'; g.beginPath(); g.roundRect(-170, -52, 340, 104, 18); g.fill(); txt(g, 'SOLD', 0, 4, 78, '#ffffff', 900); g.restore(); }
    } else {
      txt(g, 'VAN GOGH AUCTION RECORD', w / 2, 70, 40, '#e8cf8a', 900);
      const base = 500, top = 150, bh = (val) => (base - top) * val / 190.4;
      const k1 = EASE.easeOut(clamp(k * 2)), k2 = EASE.easeOut(clamp(k * 2 - 0.6));
      g.fillStyle = '#7a7060'; g.fillRect(130, base - bh(117.2) * k1, 180, bh(117.2) * k1); txt(g, '2022', 220, base + 30, 28, '#b8a070', 800); if (k1 > 0.9) txt(g, '$117.2M', 220, base - bh(117.2) - 30, 40, '#d8d0c0', 900);
      g.fillStyle = '#e8b33a'; g.fillRect(450, base - bh(190.4) * k2, 180, bh(190.4) * k2); txt(g, '2026', 540, base + 30, 28, '#e8cf8a', 800); if (k2 > 0.9) txt(g, '$190.4M', 540, base - bh(190.4) - 30, 40, '#ffffff', 900);
      if (k2 > 0.95) { g.strokeStyle = '#ff5a4a'; g.lineWidth = 6; g.setLineDash([14, 10]); g.beginPath(); g.moveTo(330, base - bh(117.2)); g.lineTo(640, base - bh(117.2)); g.stroke(); g.setLineDash([]); }
    }
    bdTx.t.needsUpdate = true; };
  // phone bank table along the right wall
  const PH = { x: 4.35, z: -3.0 };
  { const tg = group(PH.x, 0, PH.z, E.scene); tg.rotation.y = -Math.PI / 2; add(tbox(2.2, 0.05, 0.6, 1), '#2a1c16', 0, 0.76, 0, tg); add(tbox(2.2, 0.7, 0.04, 1), '#7a1f2a', 0, 0.4, 0.28, tg); }
  // wall sconces and a chandelier glow
  for (const sx of [-4.4, 4.4]) { add(new THREE.SphereGeometry(0.09, 12, 8), glow('#fff1c8', 1.4), sx, 2.6, BW + 0.12, E.scene, { noink: true, cast: false }); lamp(sx, 2.6, BW + 0.4, '#ffd9a0', 1.3, 3.5, 'warm'); }
  lamp(0, 3.4, -2.5, '#ffe2b0', 2.0, 7, 'warm');
  lamp(0, 3.0, 1.5, '#fff1d8', 2.2, 9, 'room');
  // rows of gold chairs at the back of the crowd (set dressing, behind the standing bidders)
  for (let r = 0; r < 2; r++) for (let i = 0; i < 6; i++) X.chair(E.scene, -3.2 + i * 1.25, 1.9 + r * 1.1, Math.PI, '#b8923a');

  // ================= AUVERS, MAY 1890 (x = +60) =================
  const AX = 60;
  add(tbox(60, 0.1, 60, 2), E.mat({ map: P.fabric(221, '#7fa84a'), rep: [8, 8] }), AX, -0.05, 0, E.scene, { cast: false });
  { const path = add(new THREE.PlaneGeometry(1.6, 30), '#d9b878', AX + 1.0, 0.004, -12, E.scene, { cast: false, noink: true }); path.rotation.x = -Math.PI / 2; path.rotation.z = 0.12; }
  const tree = (x, z, s, seed) => { const g = group(x, 0, z, E.scene); g.scale.setScalar(s); const r = P.rng(seed);
    add(new THREE.CylinderGeometry(0.16, 0.24, 2.2, 10), '#5a3a22', 0, 1.1, 0, g);
    for (let i = 0; i < 4; i++) { const b = add(new THREE.CylinderGeometry(0.05, 0.09, 1.2, 8), '#5a3a22', (i % 2 ? 1 : -1) * 0.35, 2.2, (i < 2 ? 1 : -1) * 0.15, g); b.rotation.z = (i % 2 ? -1 : 1) * 0.7; }
    for (let i = 0; i < 16; i++) { const a = r() * 6.283, d = 0.6 + r() * 0.9, f = add(new THREE.SphereGeometry(0.7 + r() * 0.35, 12, 9), i % 3 ? '#3f7a34' : '#2f5d2a', Math.cos(a) * d, 2.8 + r() * 1.3, Math.sin(a) * d * 0.7, g); f.scale.y = 0.8; }
    for (let i = 0; i < 200; i++) { const a = r() * 6.283, d = 0.5 + r() * 1.05, y = 2.6 + r() * 1.5;
      const c = add(new THREE.ConeGeometry(0.075, 0.24, 8), glow(i % 3 ? '#fff8f2' : '#ffd0da', 1.0), Math.cos(a) * d * 1.05, y, Math.sin(a) * d * 0.8 + 0.3, g, { cast: false, noink: true }); }
    return g; };
  tree(AX - 1.4, -6.2, 1.15, 31); tree(AX + 2.3, -8.0, 1.25, 37); tree(AX - 5.5, -12, 1.0, 41); tree(AX + 6.5, -13, 1.1, 43);
  // distant village: white walls, red roofs, a low hill line
  for (let i = 0; i < 6; i++) { const hx = AX - 9 + i * 3.4, hz = -20 - (i % 2) * 2; add(tbox(2.0, 1.4, 1.6, 1), '#f2ead8', hx, 0.7, hz, E.scene); const rf = add(new THREE.ConeGeometry(1.5, 0.9, 4), '#b8483a', hx, 1.85, hz, E.scene); rf.rotation.y = Math.PI / 4; rf.scale.z = 0.8; }
  { const hill = add(new THREE.SphereGeometry(14, 24, 12), '#8ab04a', AX, -9, -34, E.scene, { cast: false }); hill.scale.set(2.2, 1, 1); }
  // the painter's easel with the canvas in progress, a stool, a paint box
  const EZ = { x: AX - 0.1, z: -2.1 };
  { const eg = group(EZ.x, 0, EZ.z, E.scene); eg.rotation.y = 0.18;
    for (const s of [-1, 1]) { const leg = add(box(0.04, 1.75, 0.04), '#8a6a42', s * 0.32, 0.86, 0.05, eg); leg.rotation.z = s * 0.1; }
    const bl = add(box(0.04, 1.75, 0.04), '#8a6a42', 0, 0.84, -0.3, eg); bl.rotation.x = -0.2;
    add(box(0.7, 0.04, 0.08), '#8a6a42', 0, 0.98, 0.1, eg); }
  const wipTx = canvasTex(400, 325, (g, w, h) => paintTo(g, w, h, 0.3));
  const wip = add(new THREE.PlaneGeometry(0.66, 0.54), flat(wipTx, 0.95), EZ.x + 0.02, 1.28, EZ.z + 0.13, E.scene, { cast: false, noink: true }); wip.rotation.y = 0.18;
  add(tbox(0.7, 0.58, 0.02, 1), '#efe6cf', EZ.x + 0.02, 1.28, EZ.z + 0.11, E.scene, { cast: false }).rotation.y = 0.18;
  let wipFrac = -1; const drawWip = (f) => { const q = Math.round(f * 40) / 40; if (q === wipFrac) return; wipFrac = q; paintTo(wipTx.g, 400, 325, q); wipTx.t.needsUpdate = true; };
  { const sg = group(EZ.x - 0.75, 0, EZ.z + 0.35, E.scene); add(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 14), '#8a6a42', 0, 0.45, 0, sg); for (let i = 0; i < 3; i++) { const a = i * 2.09, l = add(box(0.03, 0.46, 0.03), '#6b4a2e', Math.cos(a) * 0.12, 0.23, Math.sin(a) * 0.12, sg); } }
  { const pb = group(EZ.x + 0.15, 0, EZ.z + 0.75, E.scene); add(tbox(0.42, 0.1, 0.3, 1), '#7a5232', 0, 0.05, 0, pb); for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8), ['#e8b33a', '#3f7a34', '#7fb3dc', '#fff6ee', '#c0392b'][i], -0.15 + i * 0.075, 0.12, 0.02, pb).rotation.z = Math.PI / 2; }
  // falling blossom petals (animated in update)
  const petals = []; { const r = P.rng(77); for (let i = 0; i < 34; i++) { const m = add(new THREE.CircleGeometry(0.024, 10), new THREE.MeshBasicMaterial({ color: i % 2 ? '#ffd9e0' : '#f7c6cf', side: THREE.DoubleSide, fog: false }), 0, 0, 0, E.scene, { cast: false, noink: true });
    m.userData = { x0: AX - 2.2 + r() * 4.2, z0: -4.6 + r() * 3.8, ph: r(), sp: 0.25 + r() * 0.2, sw: r() * 6 }; m.userData.ndSkip = true; petals.push(m); } }
  lamp(AX, 3.5, -1, '#fff4dc', 1.0, 10, 'sunfill');

  // ================= shots =================
  const T = { s01: 0, s02: st(2), s03: st(3), s04: st(4), s05: st(5), s06: st(6) };
  const shots = Object.entries(T).map(([id, start]) => ({ id, start }));
  const shotAt = (t) => { let id = 's01'; for (const [k, v] of Object.entries(T)) if (t >= v) id = k; return id; };
  const where = (t) => ['s03', 's04'].includes(shotAt(t)) ? 'auvers' : 'sale';
  const aim = (tg, Wd, yaw = 0, pitch = 8, fov = 36) => { const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * 0.5625), d = Wd / (2 * Math.tan(hf / 2));
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { pos: [tg[0] + Math.sin(y) * Math.cos(p) * d, tg[1] + Math.sin(p) * d, tg[2] + Math.cos(y) * Math.cos(p) * d], look: [...tg], fov }; };
  const k = (t, tg, Wd, yaw, pitch, fov, o = {}) => ({ t, ...aim(tg, Wd, yaw, pitch, fov), ...o });
  const OPEN = (t) => k(t, [-0.35, 1.6, -5.0], 3.75, 4, 14, 48);
  const K = {
    s01: [OPEN(0), k(T.s02, [-0.3, 1.63, -5.0], 3.5, 3, 14, 48)],
    s02: [{ t: T.s02, pos: [1.75, 1.8, -2.75], look: [2.5, 1.95, -5.9], fov: 64.5 }, { t: wd(2, 9), pos: [1.82, 1.82, -2.84], look: [2.58, 1.96, -5.9], fov: 64 }, { t: T.s03, pos: [1.83, 1.82, -2.86], look: [2.58, 1.96, -5.9], fov: 63.8 }],
    s03: [k(T.s03, [AX + 0.25, 1.55, -2.3], 3.4, 24, 6, 50), k(T.s04, [AX + 0.2, 1.45, -2.2], 2.6, 22, 5, 50)],
    s04: [k(T.s04, [AX + 0.15, 1.4, -2.2], 2.4, 21, 5, 50), k(T.s05, [AX + 0.05, 1.32, -2.15], 1.85, 20, 4, 50)],
    s05: [{ t: T.s05, pos: [2.55, 1.8, -1.4], look: [2.9, 1.85, -5.9], fov: 60 }, { t: wd(5, 6), pos: [2.6, 1.82, -1.8], look: [2.9, 1.88, -5.9], fov: 59 }, { t: T.s06, pos: [2.6, 1.82, -1.85], look: [2.9, 1.88, -5.9], fov: 59 }],
    s06: [k(T.s06, [-0.3, 1.63, -5.0], 3.5, 3, 14, 48), k(total - 0.02, [-0.35, 1.6, -5.0], 3.75, 4, 14, 48, { ease: 'easeOut' })],
  };
  const shake = [{ t: wd(2, 9), a: 0.6 }, { t: wd(5, 6), a: 0.45 }];
  const ROOMS = { sale: [[-5.35, 0.3, -5.85], [5.35, 3.7, 5.9]], auvers: [[AX - 25, 0.3, -25], [AX + 25, 8, 25]] };
  const cam = (t) => { const s = shotAt(t), c = camKeys(K[s], t, { shake, hand: 0.004, creep: 0.03 }), b = ROOMS[where(t)]; return E.keepInside(c, b[0], b[1]); };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const dof = (t) => { const s = shotAt(t), c = cam(t);
    if (s === 's03') return { focus: dist(c.pos, [AX + 0.4, 1.5, -1.7]), cinf: 3 };
    if (s === 's04') return { focus: dist(c.pos, [EZ.x, 1.28, EZ.z]), cinf: 5 };
    if (s === 's05') return { focus: dist(c.pos, [BD.x, BD.y, BW]), cinf: 3 };
    return { focus: dist(c.pos, [PT.x - 0.4, 1.8, PT.z]), cinf: 3.5 }; };

  // ================= light =================
  const SALE = { sky: '#ffe9c8', ground: '#3a2a1c', hemi: 1.05, sun: '#ffe2b0', sunI: 0.7, az: 170, el: 55, fog: '#1f3a30', fogNear: 30, fogFar: 90, skyTop: '#1f3a30', skyHor: '#1f3a30',
    sat: 1.1, vig: 0.34, card: '#fff4e2', gain: '#fff6e8', lift: '#020302', grain: 0, shadowExt: 8, lamps: { spot: 1.1, warm: 1, room: 1 } };
  const HOT = { ...SALE, vig: 0.28, gain: '#fffaf0', lamps: { spot: 1.4, warm: 1.1, room: 1.15 } };
  const MAY = { sky: '#cfe6f5', ground: '#6a7a3a', hemi: 1.25, sun: '#fff1d0', sunI: 1.6, az: 200, el: 42, fog: '#e9eedc', fogNear: 18, fogFar: 70, skyTop: '#7fb3dc', skyHor: '#f2ead2',
    sat: 1.05, vig: 0.3, card: '#fff6e6', gain: '#fff8ea', lift: '#060402', grain: 0, sepia: 0.22, shadowExt: 9, lamps: { sunfill: 1 } };
  const DUSK = { ...MAY, sky: '#f2c89a', hemi: 0.95, sun: '#ffb070', sunI: 1.1, az: 250, el: 12, fog: '#e8c8a0', skyTop: '#c98a5a', skyHor: '#f6d2a0', vig: 0.48, card: '#ffe2c8', gain: '#ffe8d2', sepia: 0.3, lamps: { sunfill: 0.6 } };
  const light = (t) => { const s = shotAt(t); if (s === 's03') return MAY; if (s === 's04') return DUSK; if (s === 's02' && t > wd(2, 9) - 0.05) return HOT; return SALE; };

  // ================= world animation =================
  const update = (t) => {
    const s = shotAt(t);
    if (s === 's01') drawBoard('price', 176e6 + Math.floor(4.99 * ramp(t, 0.3, 1.8)) * 1e6);
    if (s === 's02') { const kk = EASE.easeOut(ramp(t, wd(2, 3), wd(2, 8))), v = kk >= 0.999 ? 190.4e6 : 180e6 + Math.floor(kk * 10.4) * 1e6; t < wd(2, 9) - 0.05 ? drawBoard('price', v) : drawBoard('sold', 190.4e6, ramp(t, wd(2, 9) - 0.05, wd(2, 9) + 0.25)); }
    if (s === 's05') drawBoard('record', 0, ramp(t, T.s05 + 0.1, wd(5, 6) + 0.1));
    if (s === 's06') drawBoard('sold', 190.4e6, 1);
    if (s === 's03') drawWip(lerp(0.3, 1, EASE.smooth(ramp(t, T.s03, T.s04 - 0.2))));
    if (s === 's04') drawWip(1);
    const show = s === 's03' || s === 's04';
    for (const m of petals) { m.visible = show; if (!show) continue; const u = m.userData, f = (t * u.sp + u.ph) % 1;
      m.position.set(u.x0 + Math.sin(t * 1.3 + u.sw) * 0.25 + f * 0.6, 3.2 - f * 3.2, u.z0); m.rotation.set(t * 2 + u.sw, t * 1.5, t + u.sw); }
  };

  // ================= cast =================
  const LK = {
    auct: { skin: '#f2c8a2', hair: '#3a2a20', style: 'side', top: '#1d1f26', topKind: 'shirt', tie: '#c9a24a', pants: '#1d1f26', shoes: '#151519', glasses: '#2a2430' },
    b1: { skin: '#c99067', hair: '#1e1512', style: 'curly', top: '#2e3446', topKind: 'shirt', tie: '#8a1f2a', pants: '#24242c', shoes: '#151519' },
    b2: { skin: '#ffe2c2', hair: '#c7642e', style: 'pony', top: '#a8323a', topKind: 'blouse', pants: '#24242c', shoes: '#151519' },
    b3: { skin: '#7d5236', hair: '#1e1512', style: 'bun', top: '#e8cf8a', topKind: 'blouse', pants: '#2e3446', shoes: '#3a2a22' },
    b4: { skin: '#f5c9a0', hair: '#9a9aa2', style: 'balding', top: '#3a3f4a', topKind: 'shirt', tie: '#2f5d4a', pants: '#2a2a33', shoes: '#151519' },
    b5: { skin: '#e8b48a', hair: '#2a1c16', style: 'long', top: '#1f5a46', topKind: 'blouse', pants: '#1d1f26', shoes: '#151519' },
    ph1: { skin: '#a8714a', hair: '#1e1512', style: 'curly', top: '#f4f1ea', topKind: 'shirt', tie: '#1d1f26', pants: '#24242c', shoes: '#151519' },
    ph2: { skin: '#ffe2c2', hair: '#e0c070', style: 'pony', top: '#1d1f26', topKind: 'blouse', pants: '#24242c', shoes: '#151519' },
    painter: { skin: '#f2c8a2', hair: '#a8643a', style: 'short', top: '#3f6fa8', topKind: 'shirt', pants: '#8a6a42', shoes: '#3a2a1c' },
    kid: { skin: '#e8b48a', hair: '#2a1c16', style: 'pony', top: '#e8b33a', topKind: 'tee', pants: '#3b5b9a', shoes: '#f4f1ea', kid: true },
  };
  // the kid's own crayon drawing (shot 6): a sun, a house, a stick-figure tree
  const kidTx = canvasTex(300, 240, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1d1b22'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); g.lineCap = 'round';
    g.strokeStyle = '#f2b01e'; g.lineWidth = 8; g.beginPath(); g.arc(240, 55, 26, 0, 7); g.stroke(); for (let i = 0; i < 8; i++) { const a = i * 0.785; g.beginPath(); g.moveTo(240 + Math.cos(a) * 36, 55 + Math.sin(a) * 36); g.lineTo(240 + Math.cos(a) * 50, 55 + Math.sin(a) * 50); g.stroke(); }
    g.strokeStyle = '#d6273a'; g.beginPath(); g.moveTo(40, 130); g.lineTo(95, 80); g.lineTo(150, 130); g.stroke(); g.strokeStyle = '#3b5b9a'; g.strokeRect(55, 130, 80, 70);
    g.strokeStyle = '#3f8a34'; g.lineWidth = 10; g.beginPath(); g.arc(215, 140, 32, 0, 7); g.stroke(); g.strokeStyle = '#7a5232'; g.beginPath(); g.moveTo(215, 172); g.lineTo(215, 210); g.stroke();
    g.strokeStyle = '#3f8a34'; g.lineWidth = 6; g.beginPath(); g.moveTo(10, 215); g.lineTo(290, 215); g.stroke(); });
  const kidArt = add(new THREE.PlaneGeometry(0.62, 0.5), flat(kidTx, 1.0), 0, -10, 0, E.scene, { cast: false, noink: true });
  const KID = { x: -0.4, z: -1.45 };
  const crowd = [ // standing bidders seen from behind (x, z, look, seed, raises)
    { id: 'b1', x: -2.8, z: -2.5, look: 'b1', seed: 11, up: 'R' }, { id: 'b2', x: 0.6, z: -2.7, look: 'b2', seed: 12, up: 'L' },
    { id: 'b3', x: -0.2, z: -2.3, look: 'b3', seed: 13, up: 'R' }, { id: 'b5', x: -3.7, z: -1.8, look: 'b5', seed: 15, up: 'L' } ];
  const actors = (t) => {
    const s = shotAt(t), A = [];
    kidArt.position.set(0, -10, 0);
    if (where(t) === 'sale') {
      const sold = (s === 's02' && t > wd(2, 9) - 0.05) || s === 's05' || s === 's06';
      // auctioneer
      const aPose = s === 's01' ? { expr: 'grin', L: 'hang', R: 'point', facing: 1, look: 0.8, talk: 0.4 * Math.abs(Math.sin(t * 9)) }
        : s === 's02' ? (sold ? { expr: 'laugh', L: 'up', R: 'fist', k: t, facing: 1, look: 0.4 } : { expr: 'shout', L: 'hang', R: 'point', facing: -1, look: -0.6, talk: Math.abs(Math.sin(t * 11)) })
        : s === 's05' ? { expr: 'shock', L: 'cheek', R: 'cheek', facing: 1, look: 0.9 }
        : (t > wd(6, 4) - 0.1 ? { expr: 'laugh', L: 'hang', R: 'point', facing: 1, look: 0.6 } : { expr: 'gasp', L: 'hang', R: 'hang', facing: 1, look: 0.5 });
      A.push(actor({ id: 'auct', look: LK.auct, seed: 5, x: RO.x, y: 0, z: RO.z - 0.42, main: true, pose: alive(t, 5, aPose) }));
      // standing bidders (backs to camera)
      for (const b of crowd) {
        const raised = b.up && (s === 's01' || (s === 's02' && !sold));
        const pose = { back: true, expr: 'neutral', L: raised && b.up === 'L' ? 'up' : 'hang', R: raised && b.up === 'R' ? 'up' : 'hang', hold: raised ? { [b.up]: 'ticket' } : {} };
        if (s === 's06' && b.id === 'b2') { pose.L = 'hang'; pose.hold = {}; }
        A.push(actor({ id: b.id, look: LK[b.look], seed: b.seed, x: b.x, y: 0, z: b.z, edgeOk: true, pose: alive(t, b.seed, pose) }));
      }
      // phone bank staff
      const phShock = s === 's05' && t > wd(5, 6) - 0.1;
      A.push(actor({ id: 'ph1', look: LK.ph1, seed: 21, x: 3.38, y: 0, z: -4.5, main: s === 's05', pose: alive(t, 21, { expr: phShock ? 'shock' : (sold ? 'grin' : 'whisper'), L: phShock ? 'up' : 'hang', R: 'hold', hold: { R: 'phone' }, facing: -1, look: -0.6 }) }));
      A.push(actor({ id: 'ph2', look: LK.ph2, seed: 22, x: 3.95, y: 0, z: -2.5, main: s === 's05', pose: alive(t, 22, { expr: phShock ? 'gasp' : 'smile', L: 'cheek', R: phShock ? 'point' : 'hang', hold: { L: 'phone' }, facing: -1, look: -0.7 }) }));
      // the kid with her own drawing (shot 6)
      if (s === 's06') {
        const lift = EASE.back(ramp(t, T.s06 + 0.05, wd(6, 1)));
        A.push(actor({ id: 'kid', look: LK.kid, seed: 31, x: KID.x, y: 0, z: KID.z, main: true, pose: alive(t, 31, { back: true, expr: 'grin', L: 'up', R: 'up' }) }));
        kidArt.position.set(KID.x + 0.0, 0.88 + 0.5 * lift, KID.z + 0.04); kidArt.lookAt(cam(t).pos[0], kidArt.position.y, cam(t).pos[2]);
        if (t > wd(6, 4)) A.push(fxCard({ id: 'sp', kind: 'sparkle', args: [t], x: KID.x + 0.45, y: 1.95, z: KID.z, s: 0.16 }));
      }
    } else {
      if (s === 's03') A.push(actor({ id: 'painter', look: LK.painter, seed: 41, x: EZ.x + 0.78, y: 0, z: EZ.z + 0.5, main: true,
        pose: alive(t, 41, { expr: 'think', L: 'reach', R: 'hang', hold: { L: 'chalk' }, facing: -1, look: -0.9, k: t, headTilt: 3 * Math.sin(t * 2) }) }));
    }
    return A;
  };

  // ================= text =================
  const M_ = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B_ = (a, cls = '', fs = 230) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const ui = (t) => {
    const s = shotAt(t), o = { capY: 1460 };
    if (s === 's01') { o.title = M_('VAN GOGH') + M_('GOT $0', 'y'); o.titleK = 1; o.capY = 1490; }
    if (s === 's02') { o.capY = 1525; if (t > wd(2, 6) - 0.1) { o.title = B_('$190M', 'y', 250); o.titleK = (t - wd(2, 6) + 0.1) / 0.3; }
      if (t > wd(2, 9) - 0.05 && t < wd(2, 9) + 0.12) { o.flash = 0.35 * (1 - (t - wd(2, 9) + 0.05) / 0.17); o.flashCol = '#fff2c8'; } }
    if (s === 's03') { o.capY = 1525; o.exterior = true; if (t > wd(3, 6) - 0.1) { o.title = M_('MAY 1890', 'y'); o.titleK = (t - wd(3, 6) + 0.1) / 0.3; } }
    if (s === 's04') { o.capY = 1480; o.exterior = true; }
    if (s === 's05') { o.capY = 1525; if (t > wd(5, 6) - 0.1) { o.title = B_('+$73M', 'y', 230); o.titleK = (t - wd(5, 6) + 0.1) / 0.3; } }
    if (s === 's06') o.capY = 430;
    return o;
  };
  const KEY = ['nothing', 'hundred', 'ninety', 'million', 'dollars', 'chestnut', 'may', 'eighteen', 'died', 'months', 'record', 'seventy-three', 'art', 'waste'];
  return { shots, cam, dof, light, update, actors, ui, KEY };
}
