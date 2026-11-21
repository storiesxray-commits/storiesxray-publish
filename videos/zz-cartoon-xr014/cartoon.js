// zz-cartoon-xr014: pilot of the cartoon engine on the xr014 script ("Tables served before you").
// Three places in one world: the bistro (origin), the lecture room (x = -40), the store counter (x = +40, modern queue and 1976).
// Times come from the real ElevenLabs narration: st(i) = sentence i start, wd(i, j) = word j of sentence i.
import { props, room, TABLE_H, designY } from '../../engine/cartoon/sets.js';

export default function story(E, tm) {
  const { THREE, P, add, tbox, box, group, mat, glow, lamp, actor, fxCard, alive, camKeys, EASE, clamp, lerp } = E;
  const { st, wd, we, total } = tm;
  const X = props(E);
  const TY = designY(TABLE_H);
  const ramp = (t, a, b) => clamp((t - a) / (b - a));

  // ================= BISTRO (night, warm pendants, blue window) =================
  const R = room(E, E.scene, 0, -1, { w: 9, d: 7.6, h: 3.1, floor: E.mat({ map: P.checker(21, '#e9dcc2', '#8a4a40', 4), rep: [2.6, 2.2] }), front: true,
    wallTop: E.mat({ map: P.wallpaper(22, '#2f5d4a', '#386b56', 'rgba(240,210,150,.32)'), rep: [6, 2] }), wallLow: E.mat({ map: P.wainscot(23), rep: [5, 1] }), wainH: 1.05, ceil: '#2a1e1a' });
  const B = R.g; // room centre at z = -1; back wall z = -4.8, left wall x = -4.5
  // hero table (2-top, red check cloth), hero seat faces +z
  const HERO = { x: 0, z: -2.75 };
  X.table(E.scene, HERO.x, HERO.z + 0.36, { w: 0.95, d: 0.72, cloth: '#c0392b' });
  X.chair(E.scene, HERO.x, HERO.z - 0.25, 0, '#5a3424');
  const heroPlate = X.plate(E.scene, HERO.x + 0.02, TABLE_H, HERO.z + 0.5, null);
  X.cutlery(E.scene, HERO.x + 0.02, TABLE_H, HERO.z + 0.5); X.glass(E.scene, HERO.x + 0.33, TABLE_H, HERO.z + 0.3, '#cfe8f5');
  X.napkin(E.scene, HERO.x - 0.3, TABLE_H, HERO.z + 0.55); X.candle(E.scene, HERO.x - 0.28, TABLE_H, HERO.z + 0.25);
  const phone = add(box(0.075, 0.008, 0.15), '#1d1b22', HERO.x + 0.3, TABLE_H + 0.004, HERO.z + 0.62, E.scene, { cast: false }); phone.rotation.y = 0.3;
  const phoneScr = add(box(0.062, 0.002, 0.13), glow('#7fd0ff', 1), HERO.x + 0.3, TABLE_H + 0.009, HERO.z + 0.62, E.scene, { cast: false, noink: true }); phoneScr.rotation.y = 0.3;
  const clock = X.wallClock(E.scene, 0.62, 1.78, -4.72, 0, 0.3);
  X.pendant(E.scene, HERO.x, 2.2, HERO.z + 0.36, { i: 3.0 });
  X.frame(E.scene, -0.85, 1.75, -4.72, 0, 0.5, 0.62, 41); X.frame(E.scene, 1.7, 1.65, -4.72, 0, 0.42, 0.52, 44);
  X.plant(E.scene, 1.55, -4.35, 1.1);
  // couple table: between the couple and the hero, so the hero's view (and the camera behind her) sees their faces
  const C0 = new THREE.Vector2(-2.7, -0.45), toHero = new THREE.Vector2(HERO.x, HERO.z).sub(C0).normalize(), perp = new THREE.Vector2(toHero.y, -toHero.x);
  const ctab = X.table(E.scene, C0.x, C0.y, { w: 1.0, d: 0.72, cloth: '#c0392b' }); ctab.rotation.y = -Math.atan2(perp.y, perp.x);
  const seat = (s) => ({ x: C0.x - toHero.x * 0.39 + perp.x * 0.3 * s, z: C0.y - toHero.y * 0.39 + perp.y * 0.3 * s });
  const S1 = seat(-1), S2 = seat(1);
  for (const S of [S1, S2]) X.chair(E.scene, S.x - toHero.x * 0.22, S.z - toHero.y * 0.22, -Math.atan2(toHero.x, toHero.y) + Math.PI, '#5a3424');
  const onC = (s, d) => ({ x: C0.x + perp.x * 0.25 * s + toHero.x * d, z: C0.y + perp.y * 0.25 * s + toHero.y * d });
  const cp1 = onC(-1, 0.02), cp2 = onC(1, 0.02);
  const plateA = X.plate(E.scene, cp1.x, TABLE_H, cp1.z, 'pasta'), plateB = X.plate(E.scene, cp2.x, TABLE_H, cp2.z, 'steak');
  X.glass(E.scene, C0.x + toHero.x * 0.2, TABLE_H, C0.y + toHero.y * 0.2, '#b8282b'); X.candle(E.scene, C0.x, TABLE_H, C0.y);
  X.pendant(E.scene, C0.x, 2.2, C0.y, { i: 3.0 });
  X.window(E.scene, -4.42, 1.75, -1.9, Math.PI / 2, 1.5, 1.3); lamp(-3.6, 1.8, -1.9, '#6f8cff', 1.6, 5, 'window');
  X.frame(E.scene, -4.42, 1.75, -0.2, Math.PI / 2, 0.45, 0.58, 47); X.plant(E.scene, -4.0, -3.6, 1.2); X.plant(E.scene, -4.0, 0.4, 1.0);
  X.booth(E.scene, 2.9, -4.35, 0, { w: 1.8 }); X.table(E.scene, 2.9, -3.75, { w: 1.4, d: 0.6, top: '#6a4028' }); X.pendant(E.scene, 2.9, 2.2, -3.8, { i: 2.4 });
  X.window(E.scene, 4.42, 1.75, -2.2, -Math.PI / 2, 1.5, 1.3); X.window(E.scene, -1.6, 1.6, 2.72, Math.PI, 1.8, 1.5); X.window(E.scene, 1.4, 1.6, 2.72, Math.PI, 1.4, 1.5); lamp(0, 1.8, 2.0, '#6f8cff', 1.2, 5, 'window');
  X.frame(E.scene, 3.3, 1.7, 2.72, Math.PI, 0.45, 0.58, 49); X.plant(E.scene, -3.6, 2.2, 1.1); X.booth(E.scene, -2.6, 2.3, Math.PI, { w: 1.6 }); lamp(3.6, 1.8, -2.2, '#6f8cff', 1.2, 5, 'window');
  // kitchen pass on the right wall: warm light spilling out
  add(tbox(1.8, 0.9, 0.1, 1), glow('#ffcf8a', 0.9), 4.43, 1.6, 0.5, E.scene, { noink: true, cast: false }).rotation.y = -Math.PI / 2;
  lamp(3.9, 1.7, 0.5, '#ffb45a', 2.5, 5, 'warm');
  // plates on the couple's table appear when the waiter puts them down
  const LAND = wd(4, 8) + 0.02; // "already"

  // ================= LECTURE ROOM (x = -40) =================
  const LX = -40, LZ = 0;
  room(E, E.scene, LX, LZ, { w: 8, d: 7, h: 3.2, floor: E.mat({ map: P.planks(51), rep: [4, 4], color: '#b07a4a' }), wallTop: E.mat({ map: P.plaster(52, 38), rep: [4, 2] }), wallLow: E.mat({ map: P.wainscot(53, 28, 30), rep: [4, 1] }), wainH: 0.9, ceil: '#3a3430' });
  const board = add(box(4.2, 1.6, 0.06), E.mat({ map: P.chalkboard(54) }), LX, 1.75, LZ - 3.42, E.scene, { cast: false });
  add(tbox(4.4, 0.08, 0.14, 1), '#6a4028', LX, 0.93, LZ - 3.38, E.scene); add(tbox(4.4, 0.1, 0.1, 1), '#6a4028', LX, 2.58, LZ - 3.42, E.scene);
  const desk = group(LX + 1.2, 0, LZ - 1.6); add(tbox(1.6, 0.06, 0.7, 1), E.mat({ map: P.planks(55), color: '#8a5a34' }), 0, 0.78, 0, desk); add(tbox(1.5, 0.72, 0.6, 1), '#6a4028', 0, 0.38, 0, desk);
  for (let i = 0; i < 4; i++) add(tbox(0.26, 0.05, 0.36, 1), ['#b8282b', '#3f6fb5', '#e8b04a', '#4d8a2e'][i], -0.4 + (i % 2) * 0.02, 0.84 + i * 0.05, 0.05, desk);
  const globe = add(new THREE.SphereGeometry(0.16, 20, 14), '#4f8fb8', 0.45, 1.0, 0, desk); add(new THREE.CylinderGeometry(0.02, 0.08, 0.06), '#6a4028', 0.45, 0.82, 0, desk);
  X.pendant(E.scene, LX, 2.5, LZ - 2.2, { i: 3.4, col: '#a8823a' }); X.pendant(E.scene, LX + 1.6, 2.5, LZ - 1.2, { i: 2.4, col: '#a8823a' });
  X.window(E.scene, LX - 3.92, 1.7, LZ - 1.4, Math.PI / 2, 1.4, 1.4); lamp(LX - 3.2, 1.8, LZ - 1.4, '#6f8cff', 1.4, 5, 'window');
  X.plant(E.scene, LX - 3.4, LZ - 3.0, 1.2); add(tbox(0.9, 1.9, 0.4, 1), E.mat({ map: P.shelf(56, true), rep: [1, 2] }), LX + 3.3, 0.95, LZ - 3.1, E.scene);

  // ================= STORE COUNTER (x = +40): modern queue and the 1976 shop =================
  const SX = 40, SZ = 0;
  room(E, E.scene, SX, SZ, { w: 9, d: 8, h: 3.2, floor: E.mat({ map: P.checker(61, '#e9e4d8', '#9aa3ad', 6), rep: [5, 5] }), wallTop: E.mat({ map: P.plaster(62, 200), rep: [4, 2] }), wallLow: E.mat({ map: P.brick(63, 18, 52), rep: [5, 1] }), wainH: 1.0, ceil: '#d8d2c6' });
  // counter along the back, shelves behind, the clerk between them
  const counter = group(SX, 0, SZ - 2.2); add(tbox(4.2, 0.95, 0.7, 1), E.mat({ map: P.wainscot(64, 200, 40), rep: [3, 1] }), 0, 0.475, 0, counter); add(tbox(4.3, 0.06, 0.8, 1), '#e9e1cf', 0, 0.98, 0, counter);
  const shelfNow = add(tbox(5.6, 2.2, 0.3, 1), E.mat({ map: P.shelf(65), rep: [3, 1] }), SX, 1.1, SZ - 3.85, E.scene);
  const shelf76 = add(tbox(5.6, 2.2, 0.3, 1), E.mat({ map: P.shelf(66, true), rep: [3, 1] }), SX, 1.1, SZ - 3.84, E.scene);
  const regNow = X.register(E.scene, SX - 1.3, 1.01, SZ - 2.2, false), reg76 = X.register(E.scene, SX - 1.3, 1.01, SZ - 2.2, true);
  const signNow = add(box(1.4, 0.5, 0.04), E.mat({ map: P.sign('PICK UP', { bg: '#2f6fb5', fg: '#ffffff', sub: 'ORDERS HERE' }) }), SX + 0.3, 2.45, SZ - 3.65, E.scene, { cast: false });
  const sign76 = add(box(1.4, 0.5, 0.04), E.mat({ map: P.sign('PICK-UP', { bg: '#a8582a', fg: '#fff3d6', font: '900 104px Georgia, serif', sub: 'ORDERS' }) }), SX + 0.3, 2.45, SZ - 3.64, E.scene, { cast: false });
  const cal76 = add(box(0.36, 0.48, 0.02), E.mat({ map: P.calendar('1976', 'MAY') }), SX + 1.75, 1.7, SZ - 3.66, E.scene, { cast: false });
  const bike = X.bike(E.scene, SX + 1.45, 0, SZ - 3.3, 0.15, '#d6273a', 0.95);
  const pkg = X.boxPkg(E.scene, SX - 0.2, 0.98, SZ - 2.25, 0.5, 0.32, 0.36);
  const stanchions = group(SX, 0, SZ); for (const z of [-1.3, 0.2, 1.7]) { X.stanchion(stanchions, -1.0, z); X.stanchion(stanchions, 1.0, z); }
  X.rope(stanchions, [-1.0, -1.3], [-1.0, 0.2]); X.rope(stanchions, [-1.0, 0.2], [-1.0, 1.7]); X.rope(stanchions, [1.0, -1.3], [1.0, 0.2]); X.rope(stanchions, [1.0, 0.2], [1.0, 1.7]);
  X.pendant(E.scene, SX - 1.2, 2.7, SZ - 2.0, { i: 3, col: '#2f6fb5' }); X.pendant(E.scene, SX + 1.2, 2.7, SZ - 2.0, { i: 3, col: '#2f6fb5' });
  lamp(SX, 2.6, SZ + 0.5, '#fff1dc', 2.4, 7, 'store');
  X.window(E.scene, SX + 4.42, 1.7, SZ - 0.5, -Math.PI / 2, 1.8, 1.4, P.nightCity(67)); X.plant(E.scene, SX - 3.8, SZ - 3.3, 1.2);

  // ================= shots =================
  const T = {
    s01: 0, s02: st(3), s03: st(4), s04: we(4, 5) + 0.02, s05: wd(4, 8) - 0.1,
    s06: st(5), s07: st(6), s08: st(8), s09: st(9), s10: st(10), s11: st(11), s12: st(12),
  };
  const shots = Object.entries(T).map(([id, start]) => ({ id, start }));
  const shotAt = (t) => { let id = 's01'; for (const [k, v] of Object.entries(T)) if (t >= v) id = k; return id; };
  const where = (t) => { const s = shotAt(t); return ['s06'].includes(s) ? 'lecture' : ['s07', 's08'].includes(s) ? 'queue' : s === 's09' ? '1976' : 'bistro'; };

  // heads (world y): seated head centre ~1.11 m, standing ~1.73 m
  const HEAD_SIT = 1.11, HEAD_ST = 1.72;
  const hero = [HERO.x, HEAD_SIT, HERO.z];
  // framing helper: camera that frames width W (metres) around target, yaw (deg, 0 = camera on +z side), pitch (deg, + = looking down)
  const aim = (tg, Wd, yaw = 0, pitch = 8, fov = 36) => { const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * 0.5625), d = Wd / (2 * Math.tan(hf / 2));
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { pos: [tg[0] + Math.sin(y) * Math.cos(p) * d, tg[1] + Math.sin(p) * d, tg[2] + Math.cos(y) * Math.cos(p) * d], look: [...tg], fov }; };
  const k = (t, tg, Wd, yaw, pitch, fov, o = {}) => ({ t, ...aim(tg, Wd, yaw, pitch, fov), ...o });
  const HZ = HERO.z, HEAD = [HERO.x, 1.12, HZ], CHEST = [HERO.x, 0.92, HZ + 0.1];
  const CPL = [C0.x - toHero.x * 0.3, 0.95, C0.y - toHero.y * 0.3], yawToCpl = Math.atan2(toHero.x, toHero.y) * 180 / Math.PI;
  const K = {
    s01: [k(T.s01, [0.14, 1.18, HZ - 0.3], 1.55, 7, 8, 36), k(wd(2, 0), [0.08, 1.02, HZ], 1.4, 4, 12, 36), k(T.s02, [0.05, 0.98, HZ], 1.3, 3, 13, 36)],
    s02: [k(T.s02, [0.05, 0.98, HZ], 1.3, 3, 13, 36), k(wd(3, 2) - 0.04, HEAD, 1.05, 0, 3, 34, { ease: 'easeOut' }), k(T.s03, HEAD, 1.0, -2, 3, 34)],
    s03: [k(T.s03, CPL, 2.3, yawToCpl - 14, 6, 34), k(T.s04, CPL, 1.9, yawToCpl - 11, 5, 34)],
    s04: [k(T.s04, HEAD, 1.3, -4, 2, 34), k(T.s04 + 0.14, HEAD, 0.85, -6, 1, 34, { ease: 'easeOut' }), k(T.s05, HEAD, 0.8, -6, 1, 34)],
    s05: [k(T.s05, CPL, 2.6, yawToCpl + 10, 12, 40, { ease: 'easeOut' }), k(T.s06 - 0.1, CPL, 2.0, yawToCpl + 4, 9, 40)],
    s06: [k(T.s06, [LX - 0.3, 1.9, LZ - 3.0], 3.6, 12, 4, 40), k(wd(5, 4), [LX - 0.5, 1.4, LZ - 2.6], 2.2, 22, 6, 40), k(T.s07, [LX - 0.55, 1.35, LZ - 2.6], 2.0, 24, 6, 40)],
    s07: [k(T.s07, [SX, 1.1, SZ + 0.6], 3.4, 30, 8, 46), k(T.s08, [SX, 1.15, SZ + 0.2], 2.9, 24, 7, 46)],
    s08: [k(T.s08, [SX + 0.1, 1.15, SZ - 0.55], 2.9, 82, 7, 54), k(wd(8, 1) + 0.3, [SX + 0.05, 1.25, SZ - 0.75], 2.5, 86, 5, 54), k(wd(8, 6) - 0.05, [SX + 0.05, 1.3, SZ - 0.6], 2.45, 88, 4, 54, { ease: 'easeOut' }), k(T.s09, [SX + 0.05, 1.3, SZ - 0.6], 2.4, 88, 4, 54)],
    s09: [k(T.s09, [SX + 0.6, 1.15, SZ - 1.5], 3.0, 28, 8, 44), k(T.s10, [SX + 0.7, 1.2, SZ - 1.3], 2.4, 22, 7, 44)],
    s10: [k(T.s10, [0.62, 1.78, -4.72], 0.9, 4, 4, 34), k(wd(10, 1) + 0.15, [0.05, 1.0, HZ], 1.8, 5, 10, 36), k(T.s11, [0.05, 1.0, HZ], 1.7, 4, 10, 36)],
    s11: [k(T.s11, CPL, 2.2, yawToCpl - 14, 6, 34), k(T.s12, CPL, 1.5, yawToCpl - 10, 4, 34)],
    s12: [k(T.s12, HEAD, 1.0, -2, 3, 34), k(wd(12, 4), [0.05, 1.0, HZ], 1.6, 3, 10, 36), k(total, [0.14, 1.18, HZ - 0.3], 1.55, 7, 8, 36)],
  };
  const shake = [{ t: wd(3, 2), a: 1 }, { t: wd(8, 6), a: 1.4 }, { t: wd(10, 1), a: 0.8 }];
  const ROOMS = { bistro: [[-4.25, 0.3, -4.6], [4.25, 2.9, 2.6]], lecture: [[LX - 3.8, 0.3, LZ - 3.3], [LX + 3.8, 3.0, LZ + 3.3]],
    queue: [[SX - 4.3, 0.3, SZ - 3.6], [SX + 4.3, 3.0, SZ + 3.8]], '1976': [[SX - 4.3, 0.3, SZ - 3.6], [SX + 4.3, 3.0, SZ + 3.8]] };
  const cam = (t) => { const c = camKeys(K[shotAt(t)], t, { shake, hand: 0.005 }), b = ROOMS[where(t)]; return E.keepInside(c, b[0], b[1]); };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const dof = (t) => {
    const s = shotAt(t), c = cam(t);
    if (s === 's03' || s === 's11') return { focus: dist(c.pos, CPL), cinf: 10 };
    if (s === 's05') return { focus: dist(c.pos, CPL), cinf: 7 };
    if (s === 's06') return { focus: dist(c.pos, [LX - 0.4, 1.7, LZ - 2.5]), cinf: 6 };
    if (s === 's07') return { focus: dist(c.pos, [SX, 1.6, SZ + 0.5]), cinf: 5 };
    if (s === 's08') return { focus: dist(c.pos, [SX, 1.5, SZ - 0.9]), cinf: 5 };
    if (s === 's09') return { focus: dist(c.pos, [SX + 0.3, 1.5, SZ - 1.4]), cinf: 7 };
    if (s === 's10' && t < wd(10, 1)) return { focus: dist(c.pos, [0.62, 1.78, -4.72]), cinf: 8 };
    if (s === 's01' || s === 's10') return { focus: dist(c.pos, hero), cinf: 6 };
    return { focus: dist(c.pos, hero), cinf: 11 };
  };
  // ================= light =================
  const NIGHT = { sky: '#ffd6a8', ground: '#3b2a3a', hemi: 0.72, sun: '#a9bcff', sunI: 0.85, az: 140, el: 40, fog: '#1d1830', fogNear: 25, fogFar: 90, sat: 1.12, vig: 0.3, card: '#fff2e0', gain: '#ffffff', lift: '#05030a', shadowExt: 6, grain: 0.03, lamps: { warm: 1.5, window: 1.2, candle: 1.3 } };
  const LECT = { ...NIGHT, sky: '#d9e2ff', ground: '#3a3046', hemi: 1.0, sun: '#7f9cff', sunI: 1.0, card: '#f1eeff', lift: '#050816', gain: '#eef0ff', sat: 1.05 };
  const STORE = { ...NIGHT, sky: '#f4f2ff', ground: '#6b6a74', hemi: 1.35, sun: '#ffffff', sunI: 1.2, az: 200, el: 60, card: '#ffffff', vig: 0.24, lift: '#000000', lamps: { warm: 1, store: 1, window: 0.6 } };
  const RETRO = { ...STORE, sky: '#ffe0b0', ground: '#6b4a3a', hemi: 1.2, sun: '#ffd49a', sunI: 1.3, card: '#ffeccc', sepia: 0.42, grain: 0.07, vig: 0.42, sat: 0.95, gain: '#fff1dc', lamps: { warm: 1.2, store: 0.9, window: 0.3 } };
  const light = (t) => {
    const w = where(t), s = shotAt(t);
    let L = w === 'lecture' ? LECT : w === 'queue' ? STORE : w === '1976' ? RETRO : NIGHT;
    if (s === 's08' && t > wd(8, 6) - 0.02) { const k = clamp(1 - (t - wd(8, 6)) / 0.9); L = { ...L, gain: k > 0 ? '#ffb0a0' : L.gain, sat: 1.15 + 0.15 * k }; }
    if (s === 's12') { const k = ramp(t, wd(12, 7) - 0.6, total); L = { ...L, gain: k > 0.01 ? `rgb(${255},${Math.round(255 - 40 * k)},${Math.round(255 - 60 * k)})` : L.gain }; }
    return L;
  };
  // ================= world animation =================
  const update = (t) => {
    // the clock: time-lapse in the hook (18 minutes fly by), normal later
    const mins = t < st(2) ? 17 * EASE.easeOut(t / st(2)) + 0.2 : 18 + (t - st(2)) / 60 * 4;
    clock.set(mins + 2, (t * 60) % 60);
    const landed = t >= LAND;
    for (const pl of [plateA, plateB]) pl.visible = landed;
    const isNow = !(where(t) === '1976'); shelfNow.visible = regNow.visible = signNow.visible = isNow; shelf76.visible = reg76.visible = sign76.visible = cal76.visible = bike.visible = !isNow;
    stanchions.visible = isNow; pkg.visible = !isNow && t < wd(9, 4);
    phoneScr.visible = Math.floor(t * 2) % 2 === 0 || t > st(2);
  };
  // ================= cast =================
  const DESIGN = (h) => designY(h);
  const actors = (t) => {
    const s = shotAt(t), w = where(t), A = [];
    if (w === 'bistro') {
      // hero
      let hp = { mode: 'sit', tableY: TY, expr: 'bored', L: 'chin', R: 'drum', k: t, look: 0, facing: 0 };
      if (t >= st(2) - 0.05) hp = { ...hp, expr: 'annoyed' };
      if (t >= wd(3, 2) - 0.05) hp = { ...hp, expr: 'angry', L: 'table', R: 'table', look: -1, facing: -1, headTilt: -4 };
      if (s === 's04') hp = { mode: 'sit', tableY: TY, expr: 'gasp', L: 'cheek', R: 'cheek', facing: -1, look: -1 };
      if (s === 's05') hp = { mode: 'sit', tableY: TY, expr: 'furious', L: 'table', R: 'table', facing: -1, look: -1 };
      if (t >= st(10)) hp = { mode: 'sit', tableY: TY, expr: 'sideeye', L: 'cross', R: 'cross', look: -1, facing: -1 };
      if (t >= st(12)) hp = { mode: 'sit', tableY: TY, expr: t > wd(12, 7) - 0.1 ? 'furious' : 'think', L: t < wd(12, 4) ? 'raise' : 'table', R: 'table', k: clamp((t - wd(12, 1)) / 0.5), look: 0, facing: 0 };
      const back = s === 's03' || s === 's11';
      if (back) hp = { mode: 'sit', tableY: TY, expr: 'angry', L: 'table', R: 'table', back: true };
      A.push(actor({ id: 'hero', look: 'diner', seed: 5, x: HERO.x, y: 0, z: HERO.z - 0.02, pose: alive(t, 5, hp) }));
      if (t >= wd(12, 6)) A.push(fxCard({ id: 'steam', kind: 'steam', args: [(t * 1.4) % 1, 470], x: HERO.x, y: 0.0, z: HERO.z + 0.02, s: 1 }));
      // the couple: arrive standing, sit down on "down", eat once the plates land
      const sitT = wd(4, 3) - 0.1;
      for (const [i, P0] of [[0, S1], [1, S2]]) {
        const sitting = t >= sitT, eat = t >= LAND + 0.35;
        const look = i ? 'date2' : 'date1';
        let pose = sitting ? { mode: 'sit', tableY: TY, expr: eat ? 'chew' : 'smile', L: 'table', R: eat ? 'fork' : 'table', k: (t * 0.9 + i * 0.4) % 1, talk: eat ? (Math.sin(t * 9 + i) > 0.3 ? 0.4 : 0) : 0, facing: i ? -1 : 1 }
          : { mode: 'stand', expr: 'happy', L: 'hang', R: i ? 'hang' : 'hold', facing: i ? -1 : 1 };
        if (t >= st(11) && t < st(12)) pose = { ...pose, expr: (Math.floor(t * 2.2 + i) % 2) ? 'laugh' : 'chew' };
        const drop = sitting ? 0 : 0; // they stand beside their chairs
        A.push(actor({ id: 'c' + i, look, seed: 11 + i * 4, x: P0.x - toHero.x * 0.0, y: drop, z: P0.z, pose: alive(t, 11 + i * 4, pose) }));
      }
      // waiter: walks in with the plates, puts them down on "they're", leaves
      const w0 = wd(4, 4) - 0.3, w1 = LAND - 0.05;
      if (t > w0 && t < st(5) + 0.1) {
        const k = EASE.smooth((t - w0) / (w1 - w0)), from = [2.6, 0.9], to = [C0.x + perp.x * 0.8 + toHero.x * 0.15, C0.y + perp.y * 0.8 + toHero.y * 0.15];
        const x = lerp(from[0], to[0], k), z = lerp(from[1], to[1], k), walking = k > 0 && k < 1;
        A.push(actor({ id: 'waiter', look: 'waiter', seed: 21, x, y: 0, z, pose: alive(t, 21, { mode: walking ? 'walk' : 'stand', step: (t * 1.6) % 1, expr: 'smile', L: t < LAND ? 'tray' : 'hang', R: t < LAND ? 'tray' : 'hip', bob: walking ? Math.abs(Math.sin(t * 10)) * 0.02 : 0, facing: -1 }) }));
      }
    }
    if (w === 'lecture') {
      const pt = t > wd(5, 4) ? 'point' : 'hang';
      A.push(actor({ id: 'prof', look: 'prof', seed: 31, x: LX - 0.6, y: 0, z: LZ - 2.6, pose: alive(t, 31, { expr: t > wd(5, 5) ? 'think' : 'smile', L: pt === 'point' ? 'hip' : 'hold', R: pt, facing: -1, look: -0.6, hold: pt === 'point' ? {} : { L: 'chalk' }, talk: 0 }) }));
    }
    if (w === 'queue') {
      // a line of five facing the counter (cards face the camera), the cutter slides in on "skipped"
      const LINE = [['q1', 0.0, -0.7], ['q4', 0.08, 0.15], ['q3', -0.05, 1.0], ['q2', 0.06, 1.85], ['diner', 0.0, 2.7]];
      const furious = t >= wd(8, 6) - 0.04;
      LINE.forEach(([lk, dx, z], i) => {
        let pose = { expr: i % 2 ? 'bored' : 'annoyed', L: i === 0 ? 'watch' : i === 3 ? 'cross' : 'hang', R: i === 3 ? 'cross' : i === 2 ? 'hip' : 'hang', facing: 0, look: 0 };
        if (s === 's07' && t > wd(7, 2)) pose = { ...pose, expr: i === 1 ? 'bored' : 'annoyed', headTilt: (i % 2 ? 6 : -5) };
        if (s === 's08' && t > wd(8, 1)) pose = { ...pose, expr: 'gasp', look: 1, facing: 1 };
        if (furious) pose = { ...pose, expr: 'furious', L: i % 2 ? 'fist' : 'hip', R: i % 2 ? 'hip' : 'fist', k: t };
        A.push(actor({ id: 'line' + i, look: lk, seed: 40 + i, x: SX + dx, y: 0, z: SZ + z, pose: alive(t, 40 + i, pose) }));
        if (furious && i < 3) A.push(fxCard({ id: 'st' + i, kind: 'steam', args: [((t - wd(8, 6)) * 1.3 + i * 0.3) % 1, 230], x: SX + dx, y: 0.02, z: SZ + z + 0.02, s: 1 }));
      });
      // cutter: walks in from the side on "skipped", smug
      const c0 = wd(8, 1) - 0.35, c1 = wd(8, 1) + 0.25;
      if (s === 's08') { const k = EASE.easeOut((t - c0) / (c1 - c0)); A.push(actor({ id: 'cutter', look: 'cutter', seed: 47, x: SX + lerp(-1.7, 0.0, k), y: 0, z: SZ - 1.45, pose: alive(t, 47, { mode: k < 1 ? 'walk' : 'stand', step: (t * 2) % 1, expr: 'smug', L: 'hip', R: k < 1 ? 'hang' : 'wave', k: t, facing: -1 }) }));
        }
      if (s === 's07') A.push(actor({ id: 'clerk', look: 'waiter', seed: 51, x: SX - 0.3, y: 0, z: SZ - 2.75, pose: alive(t, 51, { expr: 'smile', L: 'hang', R: 'hold', hold: { R: 'ticket' } }) }));
    }
    if (w === '1976') {
      const served = t >= wd(9, 4);
      A.push(actor({ id: 'clerk76', look: 'clerk76', seed: 61, x: SX - 0.15, y: 0, z: SZ - 2.75, pose: alive(t, 61, { expr: 'smile', L: 'hang', R: served ? 'reach' : 'hold', facing: 1 }) }));
      A.push(actor({ id: 'cut76', look: 'cutter76', seed: 62, x: SX + 0.25, y: 0, z: SZ - 1.55, pose: alive(t, 62, { expr: 'smug', L: 'hip', R: served ? 'reach' : 'hang', facing: -1 }) }));
      A.push(actor({ id: 'prof76', look: 'prof76', seed: 63, x: SX + 1.05, y: 0, z: SZ - 1.0, pose: alive(t, 63, { expr: served ? 'furious' : 'annoyed', L: 'hold', R: served ? 'fist' : 'hang', hold: { L: 'receipt' }, k: t, facing: -1, look: -1 }) }));
      A.push(actor({ id: 'kid76', look: 'kid76', seed: 64, x: SX + 1.55, y: 0, z: SZ - 0.85, pose: alive(t, 64, { expr: served ? 'sad' : 'happy', L: 'hang', R: served ? 'hang' : 'point', facing: -1 }) }));
      if (served) A.push(fxCard({ id: 'vein', kind: 'vein', args: [1], x: SX + 1.3, y: 1.55, z: SZ - 0.98, s: 0.18 }));
    }
    return A;
  };
  // ================= text =================
  const M_ = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B_ = (a, cls = '', fs = 230) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const ui = (t) => {
    const s = shotAt(t), o = { capY: ['s01', 's10'].includes(s) ? 1480 : 1300 };
    if (s === 's01') { o.title = t < wd(2, 0) - 0.05 ? M_('18 MINUTES', 'y') : M_('18 MINUTES', 'y') + M_('NO FOOD'); o.titleK = t < wd(2, 0) - 0.05 ? 1 : (t - wd(2, 0) + 0.05) / 0.28; }
    if (s === 's09') { o.title = B_('1976', 'y', 200); o.titleK = (t - T.s09) / 0.28; }
    if (s === 's04') o.capY = 1420;
    if (s === 's12' && t > wd(12, 7) - 0.1) o.capY = 1420;
    if (t >= LAND - 0.03 && t < LAND + 0.1) o.flash = 0.0;
    return o;
  };
  const KEY = ['eighteen', 'minutes', 'food', 'not', 'mad', 'couple', 'after', 'already', 'eating', 'mit', 'larson', 'decades', 'annoying', 'skipped', 'furious', 'happened', "isn't", 'problem', 'someone', 'first', 'stew'];
  return { shots, cam, dof, light, update, actors, ui, KEY };
}
