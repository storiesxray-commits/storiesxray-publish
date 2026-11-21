// Reusable 3D sets and props for the cartoon engine. Scale is set by the cards: a standing adult is ~1.75 m with the head
// top, a seated adult's head centre is ~1.1 m, table tops 0.56 m (matches person() tableY = 726), counters 0.95 m.
// Every builder returns { g (THREE.Group), ...handles to animate }. Furniture is inked; glass/glow is not.
import * as THREE from './lib/three.module.js';
import * as P from './paint.js';

export const TABLE_H = 0.56, SEAT_H = 0.31, COUNTER_H = 0.95;
/** card design-y for a world height h above the card's soles (for person() tableY) */
export const designY = (h) => 975 - h / 0.00225;

export function props(E) {
  const { add, box, tbox, group, mat, glow, lamp } = E;
  const cyl = (r0, r1, h, n = 20) => new THREE.CylinderGeometry(r0, r1, h, n);
  const sph = (r, a = 20, b = 14) => new THREE.SphereGeometry(r, a, b);
  const X = {};
  X.table = (parent, x, z, { w = 1.0, d = 0.8, cloth = null, top = '#8a5a34', round = false } = {}) => {
    const g = group(x, 0, z, parent);
    if (round) add(cyl(w / 2, w / 2, 0.05, 32), top, 0, TABLE_H - 0.025, 0, g); else add(tbox(w, 0.05, d, 1), cloth ? mat({ map: P.fabric(5, cloth, '#ffffff') }) : mat({ map: P.planks(31), rep: [1, 1], color: top }), 0, TABLE_H - 0.025, 0, g);
    if (cloth) { add(box(w + 0.02, 0.18, 0.012), mat({ map: P.fabric(5, cloth, '#ffffff') }), 0, TABLE_H - 0.12, d / 2 + 0.005, g, { cast: false }); }
    add(cyl(0.035, 0.035, TABLE_H - 0.05, 10), '#3a3036', 0, (TABLE_H - 0.05) / 2, 0, g); add(cyl(0.22, 0.25, 0.03, 20), '#3a3036', 0, 0.015, 0, g);
    return g;
  };
  X.chair = (parent, x, z, rotY = 0, col = '#6a3f28') => {
    const g = group(x, 0, z, parent); g.rotation.y = rotY;
    add(tbox(0.42, 0.05, 0.42, 1), col, 0, SEAT_H, 0, g);
    for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(box(0.04, SEAT_H, 0.04), col, a * 0.18, SEAT_H / 2, b * 0.18, g);
    add(tbox(0.42, 0.5, 0.05, 1), col, 0, SEAT_H + 0.27, -0.2, g); add(box(0.32, 0.06, 0.06), '#d9b27a', 0, SEAT_H + 0.42, -0.2, g);
    return g;
  };
  X.booth = (parent, x, z, rotY = 0, { w = 1.6, col = '#9a2f35' } = {}) => {
    const g = group(x, 0, z, parent), M = mat({ map: P.fabric(8, col), rep: [2, 1] }); g.rotation.y = rotY;
    add(tbox(w, 0.12, 0.55, 1), M, 0, SEAT_H, 0, g); add(tbox(w, SEAT_H - 0.06, 0.5, 1), '#5a3424', 0, (SEAT_H - 0.06) / 2, 0, g);
    add(tbox(w, 0.85, 0.16, 1), M, 0, SEAT_H + 0.45, -0.26, g); add(tbox(w + 0.04, 0.06, 0.2, 1), '#5a3424', 0, SEAT_H + 0.9, -0.26, g);
    return g;
  };
  X.plate = (parent, x, y, z, food = null) => {
    const g = group(x, y, z, parent); add(cyl(0.13, 0.1, 0.018, 28), '#f6f3ec', 0, 0.009, 0, g, { cast: false });
    if (food === 'pasta') { add(sph(0.075, 16, 8), '#e8b04a', 0, 0.02, 0, g).scale.set(1, 0.45, 1); add(sph(0.03, 10, 8), '#c0392b', 0.02, 0.05, 0.01, g); add(sph(0.018, 8, 6), '#4d8a2e', -0.03, 0.05, 0, g); }
    if (food === 'steak') { add(sph(0.07, 16, 8), '#7a3b1e', -0.02, 0.02, 0, g).scale.set(1.2, 0.35, 0.8); for (let i = 0; i < 4; i++) add(box(0.06, 0.02, 0.012), '#f2c14e', 0.06, 0.02, -0.03 + i * 0.02, g); add(sph(0.02, 8, 6), '#4d8a2e', 0.03, 0.03, 0.05, g); }
    if (food === 'burger') { add(cyl(0.055, 0.06, 0.03, 18), '#d9893a', 0, 0.025, 0, g); add(cyl(0.062, 0.062, 0.018, 18), '#5a2e18', 0, 0.048, 0, g); add(cyl(0.065, 0.065, 0.008, 18), '#6fae4a', 0, 0.06, 0, g); add(sph(0.058, 18, 10, 0), '#e0a04a', 0, 0.065, 0, g).scale.set(1, 0.55, 1); }
    if (food === 'cake') { add(cyl(0.05, 0.05, 0.06, 3), '#f3e0c0', 0, 0.04, 0, g); add(sph(0.016, 8, 6), '#d6273a', 0, 0.08, 0, g); }
    return g;
  };
  X.glass = (parent, x, y, z, drink = '#f0c040') => { const g = group(x, y, z, parent);
    add(cyl(0.03, 0.026, 0.11, 16), new THREE.MeshToonMaterial({ color: '#d6eef8', transparent: true, opacity: 0.55, gradientMap: null }), 0, 0.055, 0, g, { noink: true, cast: false });
    add(cyl(0.027, 0.024, 0.07, 16), drink, 0, 0.036, 0, g, { noink: true, cast: false }); return g; };
  X.cutlery = (parent, x, y, z, rot = 0) => { const g = group(x, y, z, parent); g.rotation.y = rot; add(box(0.012, 0.004, 0.16), '#c9ccd2', -0.17, 0.002, 0, g, { cast: false }); add(box(0.012, 0.004, 0.17), '#c9ccd2', 0.17, 0.002, 0, g, { cast: false }); return g; };
  X.napkin = (parent, x, y, z, col = '#f4f1ea') => add(box(0.14, 0.01, 0.14), col, x, y + 0.005, z, parent, { cast: false });
  X.candle = (parent, x, y, z) => { const g = group(x, y, z, parent); add(cyl(0.035, 0.04, 0.06, 14), '#7a2f2f', 0, 0.03, 0, g, { noink: true }); add(sph(0.012, 8, 6), glow('#ffd27a', 2.2), 0, 0.075, 0, g, { noink: true, cast: false }); lamp(x, y + 0.12, z, '#ffb45a', 0.7, 1.6, 'candle', parent); return g; };
  X.pendant = (parent, x, y, z, { col = '#2f5d4a', light = '#ffc27a', i = 3.2, dist = 5.5 } = {}) => {
    const g = group(x, y, z, parent); add(cyl(0.006, 0.006, 3, 4), '#1d1b22', 0, 1.5, 0, g, { cast: false });
    add(new THREE.ConeGeometry(0.24, 0.22, 24, 1, true), mat(col, { side: THREE.DoubleSide }), 0, 0, 0, g, { cast: false });
    add(sph(0.07, 12, 8), glow('#fff1c8', 1.6), 0, -0.08, 0, g, { noink: true, cast: false });
    lamp(x, y - 0.25, z, light, i, dist, 'warm', parent); return g; };
  X.wallClock = (parent, x, y, z, rotY = 0, r = 0.28) => {
    const g = group(x, y, z, parent); g.rotation.y = rotY;
    const rim = add(cyl(r + 0.03, r + 0.03, 0.06, 40), '#2a1c16', 0, 0, 0, g); rim.rotation.x = Math.PI / 2;
    const face = add(new THREE.CircleGeometry(r, 40), mat({ map: P.clockFace() }), 0, 0, 0.032, g, { cast: false });
    const hand = (len, w, col) => { const pv = group(0, 0, 0.04, g); add(box(w, len, 0.01), col, 0, len / 2 - 0.02, 0, pv, { cast: false }); return pv; };
    const hr = hand(r * 0.55, 0.035, '#1d1b22'), mn = hand(r * 0.85, 0.022, '#1d1b22'), sc = hand(r * 0.9, 0.008, '#c0392b');
    add(cyl(0.022, 0.022, 0.02, 12), '#c0392b', 0, 0, 0.05, g).rotation.x = Math.PI / 2;
    return { g, set(minutes, seconds = 0) { mn.rotation.z = -minutes / 60 * Math.PI * 2; hr.rotation.z = -minutes / 720 * Math.PI * 2 - Math.PI * 2 * 7 / 12; sc.rotation.z = -seconds / 60 * Math.PI * 2; } };
  };
  X.frame = (parent, x, y, z, rotY = 0, w = 0.5, h = 0.62, seed = 27) => { const m = add(box(w, h, 0.04), mat({ map: P.picture(seed) }), x, y, z, parent, { cast: false }); m.rotation.y = rotY; return m; };
  X.plant = (parent, x, z, s = 1) => { const g = group(x, 0, z, parent); g.scale.setScalar(s);
    add(cyl(0.16, 0.12, 0.34, 16), '#b8643a', 0, 0.17, 0, g); add(cyl(0.15, 0.15, 0.02, 16), '#3a2618', 0, 0.33, 0, g);
    const r = P.rng(7 + x * 3); for (let i = 0; i < 9; i++) { const a = r() * 6.28, l = add(sph(0.16, 10, 6), i % 2 ? '#4d8a2e' : '#6fae4a', Math.cos(a) * 0.14, 0.5 + r() * 0.45, Math.sin(a) * 0.14, g); l.scale.set(0.6, 1.3, 0.35); l.rotation.set(r() - 0.5, a, (r() - 0.5) * 0.8); }
    return g; };
  X.window = (parent, x, y, z, rotY = 0, w = 1.6, h = 1.5, outside = null) => {
    const g = group(x, y, z, parent); g.rotation.y = rotY;
    add(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: P.tex(outside || P.nightCity()), fog: false }), 0, 0, -0.02, g, { cast: false, receive: false, noink: true });
    for (const s of [-1, 1]) { add(tbox(0.08, h + 0.16, 0.1, 1), '#e9e1cf', s * (w / 2 + 0.04), 0, 0, g); add(tbox(w + 0.16, 0.08, 0.1, 1), '#e9e1cf', 0, s * (h / 2 + 0.04), 0, g); }
    add(tbox(0.05, h, 0.06, 1), '#e9e1cf', 0, 0, 0, g); add(tbox(w, 0.05, 0.06, 1), '#e9e1cf', 0, 0, 0, g);
    add(tbox(w + 0.3, 0.06, 0.22, 1), '#e9e1cf', 0, -h / 2 - 0.1, 0.08, g);
    return g; };
  X.stanchion = (parent, x, z) => { const g = group(x, 0, z, parent); add(cyl(0.16, 0.18, 0.03, 18), '#c9a24a', 0, 0.015, 0, g); add(cyl(0.025, 0.025, 0.9, 10), '#d9b45a', 0, 0.45, 0, g); add(sph(0.045, 12, 8), '#d9b45a', 0, 0.92, 0, g); return g; };
  X.rope = (parent, a, b, sag = 0.18, col = '#b8282b') => { const pts = []; for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, 0.84 - sag * Math.sin(Math.PI * t), a[1] + (b[1] - a[1]) * t)); }
    return add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.022, 8), col, 0, 0, 0, parent); };
  X.register = (parent, x, y, z, retro = false) => { const g = group(x, y, z, parent);
    add(tbox(0.42, 0.18, 0.36, 1), retro ? '#a8823a' : '#3a3f4a', 0, 0.09, 0, g); const top = add(tbox(0.38, 0.16, 0.12, 1), retro ? '#c9a24a' : '#2a2e36', 0, 0.24, -0.08, g); top.rotation.x = -0.4;
    if (retro) for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) add(cyl(0.018, 0.018, 0.03, 8), '#f4f1ea', -0.12 + i * 0.08, 0.2, 0.06 + j * 0.05 - 0.05, g);
    else add(box(0.3, 0.1, 0.01), glow('#7fd0ff', 1.1), 0, 0.27, -0.01, g, { noink: true, cast: false }).rotation.x = -0.4;
    return g; };
  X.bike = (parent, x, y, z, rotY = 0, col = '#d6273a', s = 1) => { const g = group(x, y, z, parent); g.rotation.y = rotY; g.scale.setScalar(s);
    for (const wx of [-0.45, 0.45]) { add(new THREE.TorusGeometry(0.3, 0.03, 8, 28), '#1d1b22', wx, 0.33, 0, g); add(cyl(0.035, 0.035, 0.06, 10), '#c9ccd2', wx, 0.33, 0, g).rotation.x = Math.PI / 2;
      for (let k = 0; k < 6; k++) { const sp = add(box(0.008, 0.56, 0.008), '#c9ccd2', wx, 0.33, 0, g, { cast: false }); sp.rotation.z = k * Math.PI / 6; } }
    const tube = (a, b, r = 0.025) => { const v = new THREE.Vector3(b[0] - a[0], b[1] - a[1], 0), m = add(cyl(r, r, v.length(), 10), col, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 0, g); m.rotation.z = Math.atan2(v.x, v.y) * -1; return m; };
    tube([-0.45, 0.33], [-0.05, 0.36]); tube([-0.05, 0.36], [0.35, 0.72]); tube([-0.45, 0.33], [-0.12, 0.72]); tube([-0.12, 0.72], [0.35, 0.72]); tube([-0.05, 0.36], [-0.12, 0.72]); tube([0.35, 0.72], [0.45, 0.33]);
    add(box(0.22, 0.05, 0.1), '#1d1b22', -0.14, 0.78, 0, g); add(cyl(0.015, 0.015, 0.5, 8), '#c9ccd2', 0.38, 0.86, 0, g).rotation.x = Math.PI / 2;
    return g; };
  X.boxPkg = (parent, x, y, z, w = 0.4, h = 0.3, d = 0.3, col = '#c99a5a') => { const g = group(x, y, z, parent); add(tbox(w, h, d, 1), col, 0, h / 2, 0, g); add(box(w + 0.005, 0.04, 0.05), '#e8d9a8', 0, h / 2, 0, g); add(box(0.05, h + 0.005, d + 0.005), '#e8d9a8', 0, h / 2, 0, g); return g; };
  return X;
}

/** walls + floor + ceiling of a room. o: {w, d, h, floor, wallTop, wallLow, wainH, ceil} returns {g, wall(side)} */
export function room(E, parent, x, z, o = {}) {
  const { add, tbox, group, mat } = E;
  const { w = 9, d = 8, h = 3.2, floor, wallTop = '#c9b79a', wallLow = null, wainH = 1.0, ceil = '#3a2c26', back = true, front = false } = o;
  const g = group(x, 0, z, parent);
  add(tbox(w, 0.1, d, 1), floor || '#8a6a4a', 0, -0.05, 0, g, { cast: false });
  add(tbox(w, 0.1, d, 1), ceil, 0, h + 0.05, 0, g, { cast: false });
  const wall = (wx, wz, ww, rotY) => { const wg = group(wx, 0, wz, g); wg.rotation.y = rotY;
    add(tbox(ww, h - wainH, 0.12, 1), wallTop, 0, wainH + (h - wainH) / 2, 0, wg, { cast: false });
    if (wainH > 0) { add(tbox(ww, wainH, 0.14, 1), wallLow || wallTop, 0, wainH / 2, 0.01, wg, { cast: false }); add(tbox(ww, 0.06, 0.2, 1), '#3a2618', 0, wainH, 0.03, wg, { cast: false }); }
    add(tbox(ww, 0.1, 0.18, 1), '#2a1c16', 0, h - 0.05, 0.03, wg, { cast: false }); return wg; };
  const walls = {};
  if (back) walls.back = wall(0, -d / 2, w, 0);
  walls.left = wall(-w / 2, 0, d, Math.PI / 2); walls.right = wall(w / 2, 0, d, -Math.PI / 2);
  if (front) walls.front = wall(0, d / 2, w, Math.PI);
  return { g, walls };
}
