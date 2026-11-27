// xr024-air-fryer-1621 (USELESS FACTS series, owner 27/11/2026): "Your air fryer missed the first Thanksgiving."
// Three places in one world:
//  A) a modern kitchen at night (origin, x = 0): one glossy black air fryer alone on the counter, glowing "400°F" display.
//  B) Plymouth, autumn 1621 (x = +60): outdoor plank tables, thatched timber houses, autumn trees, a fire; a group of
//     Wampanoag men walks in with five deer (alive, cartoon: nothing graphic); colonists eat roast wild birds; three days
//     go by (sun circling). Respectful generic figures: deerskin-colored clothes, long dark hair, no feathers/costume clichés.
//  C) a modern Thanksgiving dining room (x = -60): a family at the table and the air fryer in the place of honor
//     (cushion, paper crown, spotlight), the turkey pushed aside. Last shot returns to the air fryer framing (loop).
// Facts (Winslow 1621 letter via Massachusetts Commonwealth Museum, Smithsonian, Time): ~90 men with Massasoit, 5 deer,
// ~50 colonists, fowl, three days. Air fryers: modern appliance (patented 2000s) -> "zero". No brands or logos anywhere.
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
  const sph = (r, a = 18, b = 12) => new THREE.SphereGeometry(r, a, b);

  // ================= THE AIR FRYER (generic, no brand) =================
  const dispTx = canvasTex(256, 128, (g, w, h) => { g.fillStyle = '#0b0d10'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#ff8a2a'; g.font = '900 78px Inter, Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('400°F', w / 2, h / 2 + 4); });
  const fryer = (parent, x, y, z, s = 1, ry = 0) => {
    const g = group(x, y, z, parent); g.scale.setScalar(s); g.rotation.y = ry;
    add(tbox(0.34, 0.36, 0.34, 1), '#1d2024', 0, 0.18, 0, g);
    add(tbox(0.36, 0.04, 0.36, 1), '#2a2e34', 0, 0.38, 0, g);                         // lid
    const dr = group(0, 0, 0, g);                                                    // drawer (opens toward +z)
    add(tbox(0.3, 0.18, 0.05, 1), '#2b2f35', 0, 0.12, 0.17, dr);
    add(tbox(0.16, 0.04, 0.07, 1), '#121417', 0, 0.12, 0.215, dr);                   // handle
    add(new THREE.PlaneGeometry(0.2, 0.1), new THREE.MeshBasicMaterial({ map: dispTx.t, fog: false }), 0, 0.29, 0.172, g, { cast: false, noink: true });
    const dial = add(cyl(0.025, 0.025, 0.02, 16), '#c9ccd2', 0.12, 0.29, 0.175, g); dial.rotation.x = Math.PI / 2;
    add(tbox(0.3, 0.012, 0.3, 1), '#3a3f46', 0, 0.002, 0, g, { cast: false });       // feet plate
    return { g, dr };
  };

  // ================= A) MODERN KITCHEN (x = 0) =================
  room(E, E.scene, 0, 0, { w: 7, d: 6, h: 2.9, floor: E.mat({ map: P.checker(241, '#e8e0d0', '#c9bfa8', 6), rep: [3, 3] }),
    wallTop: E.mat({ map: P.plaster(242, 34), rep: [3, 2], color: '#d9c7a8' }), wallLow: '#5a6e66', wainH: 0, ceil: '#3a3430' });
  const KB = -2.94; // back wall face
  // counter run with cabinets + tile backsplash
  add(tbox(4.4, COUNTER_H - 0.05, 0.62, 1), '#4f6a5e', 0, (COUNTER_H - 0.05) / 2, KB + 0.32, E.scene);
  for (let i = 0; i < 6; i++) { add(box(0.66, 0.66, 0.012), '#5d7a6d', -1.84 + i * 0.735, 0.46, KB + 0.635, E.scene, { cast: false }); add(box(0.12, 0.025, 0.02), '#c9ccd2', -1.84 + i * 0.735, 0.76, KB + 0.645, E.scene, { cast: false }); }
  add(tbox(4.5, 0.05, 0.66, 1), '#e9e4da', 0, COUNTER_H - 0.025, KB + 0.33, E.scene);
  const tile = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#efeae0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c9c2b2'; g.lineWidth = 4; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, h); g.stroke(); g.beginPath(); g.moveTo(0, i * 64); g.lineTo(w, i * 64); g.stroke(); } });
  add(box(4.4, 0.6, 0.01), mat({ map: tile.c, rep: [8, 1.2] }), 0, COUNTER_H + 0.3, KB + 0.01, E.scene, { cast: false });
  // upper cabinets, window with night city, a wall calendar
  for (let i = 0; i < 2; i++) add(tbox(1.2, 0.7, 0.34, 1), '#4f6a5e', -1.6 + i * 3.2, 2.15, KB + 0.18, E.scene);
  X.window(E.scene, 0, 2.0, KB + 0.02, 0, 1.4, 0.9);
  { const cal = canvasTex(256, 320, (g, w, h) => { g.fillStyle = '#fffdf6'; g.fillRect(0, 0, w, h); g.fillStyle = '#c0573a'; g.fillRect(0, 0, w, 84);
      g.fillStyle = '#fff'; g.font = '900 52px Inter, Arial Black'; g.textAlign = 'center'; g.fillText('NOV', w / 2, 60);
      g.fillStyle = '#2a2420'; g.font = '900 150px Inter, Arial Black'; g.fillText('26', w / 2, 230); g.font = '800 30px Inter, Arial'; g.fillStyle = '#c0573a'; g.fillText('THANKSGIVING', w / 2, 290); });
    add(box(0.36, 0.45, 0.01), mat({ map: cal.c }), 2.6, 1.75, KB + 0.02, E.scene, { cast: false }); }
  // counter props: cutting board, a jar, a dish towel; the hero fryer centred
  add(tbox(0.4, 0.025, 0.28, 1), '#b8864e', -0.75, COUNTER_H + 0.0125, KB + 0.36, E.scene);
  { const j = add(cyl(0.07, 0.07, 0.2, 18), '#cfe0e6', 0.8, COUNTER_H + 0.1, KB + 0.3, E.scene, { noink: false }); }
  add(box(0.18, 0.3, 0.01), '#d6493a', 1.4, COUNTER_H - 0.18, KB + 0.64, E.scene, { cast: false });
  const AF = { x: 0, z: KB + 0.36 };
  const hero = fryer(E.scene, AF.x, COUNTER_H, AF.z, 1);
  X.pendant(E.scene, 0, 2.55, -1.8, { col: '#c0573a', light: '#ffc27a', i: 2.6, dist: 5 });
  lamp(0, 2.2, 1.6, '#9ab4ff', 0.6, 7, 'fill');

  // ================= B) PLYMOUTH 1621 (x = +60) =================
  const PX = 60, PZ = 0;
  const groundB = add(tbox(70, 0.1, 70, 1), E.mat({ map: P.grass(243), rep: [20, 20], color: '#c9b46a' }), PX, -0.05, PZ - 10, E.scene, { cast: false });
  add(tbox(14, 0.1, 9, 1), E.mat({ map: P.dirt(244), rep: [4, 3] }), PX, -0.03, PZ - 1, E.scene, { cast: false });
  // long plank table with benches (colonists sit behind it, facing the camera)
  const TB = { x: PX, z: PZ - 0.2, w: 5.2 };
  add(tbox(TB.w, 0.06, 0.85, 1), E.mat({ map: P.planks(245), rep: [3, 1], color: '#9a7048' }), TB.x, TABLE_H - 0.03, TB.z, E.scene);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(box(0.08, TABLE_H - 0.06, 0.08), '#6a4a2e', TB.x + sx * (TB.w / 2 - 0.2), (TABLE_H - 0.06) / 2, TB.z + sz * 0.33, E.scene);
  add(tbox(TB.w, 0.05, 0.3, 1), '#7a5434', TB.x, 0.31, TB.z - 0.72, E.scene);
  for (const sx of [-1, 1]) add(box(0.08, 0.3, 0.2), '#5a3a22', TB.x + sx * (TB.w / 2 - 0.3), 0.15, TB.z - 0.72, E.scene);
  // food: wild birds roasted, corn, squash, wooden bowls
  const bird = (x, z, s = 1) => { const g = group(x, TABLE_H, z, E.scene); g.scale.setScalar(s);
    add(cyl(0.16, 0.13, 0.02, 22), '#7a5434', 0, 0.01, 0, g, { cast: false });
    const b = add(sph(0.1, 16, 10), '#9a5a26', 0, 0.07, 0, g); b.scale.set(1.25, 0.75, 0.9);
    for (const sd of [-1, 1]) { const l = add(cyl(0.022, 0.03, 0.12, 10), '#8a4e22', sd * 0.06, 0.08, 0.07, g); l.rotation.x = 1.1; add(sph(0.022, 8, 6), '#f4ead6', sd * 0.06, 0.11, 0.12, g); }
    return g; };
  const corn = (x, z) => { const g = group(x, TABLE_H + 0.03, z, E.scene); const c = add(cyl(0.025, 0.03, 0.16, 10), '#f2c230', 0, 0, 0, g); c.rotation.z = Math.PI / 2; const h = add(cyl(0.03, 0.005, 0.09, 8), '#8aa04a', -0.11, 0, 0, g); h.rotation.z = -Math.PI / 2; return g; };
  const squash = (x, z) => { const s = add(sph(0.07, 14, 10), '#e07a2a', x, TABLE_H + 0.06, z, E.scene); s.scale.set(1, 0.8, 1); add(cyl(0.008, 0.01, 0.04, 6), '#5a6a2a', x, TABLE_H + 0.13, z, E.scene); };
  const BX = [-2.1, -1.2, -0.3, 0.6, 1.5, 2.25];
  BX.forEach((bx, i) => { if (i % 2 === 0) bird(TB.x + bx, TB.z + 0.12, 1); else { corn(TB.x + bx - 0.1, TB.z + 0.18); squash(TB.x + bx + 0.15, TB.z + 0.05); } });
  // the "air fryer place" at the table: an empty spot with a lone plate (shots 6-7)
  const EMPTY = { x: TB.x + 2.25, z: TB.z + 0.2 };
  // thatched timber houses, a palisade, autumn trees, a cooking fire
  const house = (x, z, ry = 0, s = 1) => { const g = group(x, 0, z, E.scene); g.rotation.y = ry; g.scale.setScalar(s);
    add(tbox(3, 2, 2.4, 1), E.mat({ map: P.planks(246, 1), rep: [3, 2], color: '#a07a50' }), 0, 1, 0, g);
    const r = add(new THREE.ConeGeometry(2.35, 1.7, 4), E.mat({ map: P.roof(247), rep: [2, 2], color: '#c9a560' }), 0, 2.85, 0, g); r.rotation.y = Math.PI / 4; r.scale.set(1.0, 1, 0.82);
    add(box(0.7, 1.3, 0.04), '#4a3424', 0.4, 0.65, 1.21, g, { cast: false }); add(box(0.5, 0.4, 0.04), '#2a2420', -0.8, 1.2, 1.21, g, { cast: false });
    add(tbox(0.4, 1.0, 0.4, 1), '#7a6a5a', -1.0, 3.2, -0.3, g); return g; };
  house(PX - 4.8, PZ - 7, 0.25); house(PX + 3.2, PZ - 9, -0.15, 1.1); house(PX + 7.5, PZ - 5.5, -0.5, 0.95);
  for (let i = 0; i < 22; i++) { const px = PX - 13 + i * 1.25; const p = add(cyl(0.13, 0.15, 2.6, 8), '#7a5a3a', px, 1.3, PZ - 13.5, E.scene); add(new THREE.ConeGeometry(0.14, 0.3, 8), '#7a5a3a', px, 2.75, PZ - 13.5, E.scene); }
  const tree = (x, z, s, col) => { const g = group(x, 0, z, E.scene); g.scale.setScalar(s); add(cyl(0.16, 0.22, 2.2, 8), '#5a3a22', 0, 1.1, 0, g);
    for (const [dx, dy, dz, r] of [[0, 2.7, 0, 1.1], [0.6, 2.3, 0.2, 0.8], [-0.6, 2.4, -0.1, 0.85], [0.1, 3.3, 0, 0.8]]) add(sph(r, 14, 10), col, dx, dy, dz, g); return g; };
  [[PX - 9, PZ - 4, 1.4, '#d9682a'], [PX - 7, PZ - 10, 1.6, '#e8a23a'], [PX + 10, PZ - 2, 1.3, '#c0392b'], [PX + 11, PZ - 9, 1.7, '#e07a2a'], [PX - 12, PZ - 8, 1.5, '#b8342a'], [PX + 5, PZ - 14, 1.6, '#e8b84a'], [PX - 2, PZ - 15, 1.8, '#d9682a']]
    .forEach(([x, z, s, c]) => tree(x, z, s, c));
  // fallen leaves on the ground
  { const r = P.rng(248); for (let i = 0; i < 90; i++) { const l = add(new THREE.CircleGeometry(0.06 + r() * 0.05, 6), ['#d9682a', '#e8a23a', '#c0392b', '#b8742a'][i % 4], PX - 8 + r() * 16, 0.006, PZ - 6 + r() * 9, E.scene, { cast: false, noink: true }); l.rotation.x = -Math.PI / 2; } }
  // cooking fire (left of the table)
  const FIRE = { x: PX - 3.8, z: PZ + 0.6 };
  for (let i = 0; i < 5; i++) { const lg = add(cyl(0.05, 0.05, 0.6, 8), '#5a3a22', FIRE.x, 0.06, FIRE.z, E.scene); lg.rotation.z = Math.PI / 2; lg.rotation.y = i * Math.PI / 5; }
  const flames = [0, 1, 2].map((i) => add(new THREE.ConeGeometry(0.16 - i * 0.03, 0.5 - i * 0.08, 10), glow(['#ff8a2a', '#ffb43a', '#ffe07a'][i], 1.6), FIRE.x, 0.3, FIRE.z, E.scene, { noink: true, cast: false }));
  lamp(FIRE.x, 0.8, FIRE.z, '#ffb070', 1.6, 6, 'fire');
  // the five deer (simple low-poly, alive; walk in with the group)
  const deer = (s = 1, antlers = false) => { const g = group(0, 0, 0, E.scene); g.scale.setScalar(s);
    const body = add(sph(0.3, 16, 10), '#a8743e', 0, 0.82, 0, g); body.scale.set(1.55, 0.85, 0.75);
    add(sph(0.12, 10, 8), '#f2e6d0', -0.42, 0.85, 0, g).scale.set(0.6, 0.8, 0.8);          // white tail
    const neck = add(cyl(0.08, 0.11, 0.42, 10), '#a8743e', 0.42, 1.08, 0, g); neck.rotation.z = -0.6;
    const head = group(0.58, 1.3, 0, g); add(sph(0.12, 12, 10), '#a8743e', 0, 0, 0, head).scale.set(1.4, 0.95, 0.9); add(sph(0.04, 8, 6), '#2a1c16', 0.17, -0.02, 0, head);
    for (const sd of [-1, 1]) { const e = add(sph(0.06, 8, 6), '#8a5a2e', -0.05, 0.12, sd * 0.08, head); e.scale.set(0.5, 1.4, 0.5); add(sph(0.022, 8, 6), '#111', 0.08, 0.04, sd * 0.07, head); }
    if (antlers) for (const sd of [-1, 1]) { const a = add(cyl(0.014, 0.018, 0.26, 6), '#e8dcc0', -0.02, 0.2, sd * 0.06, head); a.rotation.x = sd * 0.5; const b = add(cyl(0.012, 0.012, 0.14, 6), '#e8dcc0', 0.03, 0.27, sd * 0.11, head); b.rotation.z = -0.8; }
    const legs = []; for (const [lx, lz] of [[0.32, 0.12], [0.32, -0.12], [-0.3, 0.12], [-0.3, -0.12]]) { const pv = group(lx, 0.68, lz, g); add(cyl(0.035, 0.03, 0.66, 8), '#8a5a2e', 0, -0.33, 0, pv); add(cyl(0.04, 0.04, 0.05, 8), '#2a1c16', 0, -0.66, 0, pv); legs.push(pv); }
    return { g, legs, head }; };
  const DEER = [0, 1, 2, 3, 4].map((i) => deer(0.85 + (i % 3) * 0.06, i % 2 === 0));

  // ================= C) MODERN THANKSGIVING DINING ROOM (x = -60) =================
  const CX = -60, CZ = 0;
  room(E, E.scene, CX, CZ, { w: 7.5, d: 6.5, h: 2.9, floor: E.mat({ map: P.planks(249), rep: [3, 3], color: '#8a5a3a' }),
    wallTop: E.mat({ map: P.wallpaper(250, '#7a3b3b', '#874646', 'rgba(240,200,140,.28)'), rep: [3, 1.5] }), wallLow: E.mat({ map: P.wainscot(251, 24, 32), rep: [5, 1] }), wainH: 0.9, ceil: '#3a2c26' });
  const DB = -3.19;
  X.window(E.scene, CX - 2.2, 1.7, CZ + DB + 0.02, 0, 1.2, 1.1);
  X.frame(E.scene, CX + 2.1, 1.85, CZ + DB + 0.03, 0, 0.7, 0.55, 252);
  // wall banner "HAPPY THANKSGIVING" (own lettering)
  { const bn = canvasTex(900, 160, (g, w, h) => { const cols = ['#c0573a', '#e8a23a', '#6a7a3a', '#8a3b22']; for (let i = 0; i < 9; i++) { g.fillStyle = cols[i % 4]; g.beginPath(); g.moveTo(i * 100, 0); g.lineTo(i * 100 + 100, 0); g.lineTo(i * 100 + 50, h); g.closePath(); g.fill(); }
      g.fillStyle = '#fff8e6'; g.font = '900 38px Inter, Arial Black'; g.textAlign = 'center'; const L = 'THANKFUL!!'.split(''); L.forEach((c, i) => g.fillText(c, 50 + i * 100 - (i > 8 ? 900 : 0), 60)); });
    add(new THREE.PlaneGeometry(2.6, 0.46), new THREE.MeshToonMaterial({ map: bn.t, transparent: true, alphaTest: 0.1, side: THREE.DoubleSide }), CX, 2.45, CZ + DB + 0.05, E.scene, { cast: false, noink: true }); }
  const DT = { x: CX, z: CZ - 0.6, w: 2.6 };
  X.table(E.scene, DT.x - 0.65, DT.z, { w: 1.35, d: 0.9, cloth: '#e8dcc0' }); X.table(E.scene, DT.x + 0.65, DT.z, { w: 1.35, d: 0.9, cloth: '#e8dcc0' });
  for (const dx of [-1.0, 0, 1.0]) X.chair(E.scene, DT.x + dx, DT.z - 0.55, 0, '#6a3f28');
  // the throne: a cushion + riser in the middle, the crowned fryer on it, spotlight
  add(tbox(0.5, 0.08, 0.42, 1), '#b8282b', DT.x, TABLE_H + 0.04, DT.z + 0.05, E.scene);
  const guest = fryer(E.scene, DT.x, TABLE_H + 0.08, DT.z + 0.05, 0.9);
  const crown = group(DT.x, TABLE_H + 0.08 + 0.37 * 0.9, DT.z + 0.05, E.scene);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; add(new THREE.ConeGeometry(0.035, 0.11, 6), '#f2c230', Math.cos(a) * 0.1, 0.07, Math.sin(a) * 0.1, crown); }
  add(cyl(0.12, 0.12, 0.05, 20, 1, true), '#f2c230', 0, 0.025, 0, crown);
  lamp(DT.x, 2.6, DT.z + 0.9, '#fff4d0', 2.6, 3.6, 'spot');
  // the turkey, pushed to the side; plates, glasses, candles
  { const tg = group(DT.x + 1.05, TABLE_H, DT.z + 0.15, E.scene); add(cyl(0.2, 0.16, 0.025, 24), '#f6f3ec', 0, 0.012, 0, tg, { cast: false });
    const b = add(sph(0.14, 16, 10), '#c07a32', 0, 0.1, 0, tg); b.scale.set(1.3, 0.8, 1); for (const sd of [-1, 1]) { const l = add(cyl(0.03, 0.04, 0.15, 10), '#b06a2a', sd * 0.09, 0.1, 0.1, tg); l.rotation.x = 1.1; add(sph(0.03, 8, 6), '#fff', sd * 0.09, 0.15, 0.16, tg); } }
  for (const dx of [-1.0, -0.45, 0.5]) X.plate(E.scene, DT.x + dx, TABLE_H, DT.z + 0.2, dx < 0 ? 'cake' : null);
  X.glass(E.scene, DT.x - 0.7, TABLE_H, DT.z + 0.05, '#c0392b'); X.glass(E.scene, DT.x + 0.35, TABLE_H, DT.z - 0.05, '#e8c060');
  X.candle(E.scene, DT.x - 0.3, TABLE_H, DT.z - 0.15); X.candle(E.scene, DT.x + 0.3, TABLE_H, DT.z - 0.15);
  X.pendant(E.scene, DT.x - 1.4, 2.5, DT.z + 0.4, { col: '#8a3b22', light: '#ffc27a', i: 1.8, dist: 4.5 });

  // ================= shots =================
  const T = { s01: 0, s02: st(2), s03: st(3), s04: st(4), s05: st(5), s06: st(6), s07: st(7) - 0.1, s08: st(8) - 0.25, s09: st(9) - 0.1, s10: st(10) - 0.08 };
  const shots = Object.entries(T).map(([id, start]) => ({ id, start }));
  const shotAt = (t) => { let id = 's01'; for (const [k, v] of Object.entries(T)) if (t >= v) id = k; return id; };
  const aim = (tg, Wd, yaw = 0, pitch = 8, fov = 36) => { const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * 0.5625), d = Wd / (2 * Math.tan(hf / 2));
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { pos: [tg[0] + Math.sin(y) * Math.cos(p) * d, tg[1] + Math.sin(p) * d, tg[2] + Math.cos(y) * Math.cos(p) * d], look: [...tg], fov }; };
  const k = (t, tg, Wd, yaw, pitch, fov, o = {}) => ({ t, ...aim(tg, Wd, yaw, pitch, fov), ...o });
  const FRY = [AF.x, COUNTER_H + 0.2, AF.z];
  const K = {
    s01: [k(0, FRY, 1.25, 8, 6, 40), k(T.s02, FRY, 0.95, 4, 5, 40)],
    s02: [k(T.s02, [PX, 1.4, PZ - 3], 13, 6, 4, 55), k(T.s03, [PX + 0.3, 1.3, PZ - 2.5], 11.5, 2, 4, 55)],
    s03: [k(T.s03, [PX + 3.8, 1.3, PZ + 0.8], 5.0, 20, 3, 48), k(T.s04, [PX + 2.8, 1.3, PZ + 0.8], 4.6, 16, 3, 48)],
    s04: [k(T.s04, [PX + 2.4, 0.95, PZ + 1.4], 3.6, -12, 5, 46), k(T.s05, [PX + 1.8, 0.95, PZ + 1.4], 3.4, -10, 5, 46)],
    s05: [k(T.s05, [TB.x - 0.6, 0.95, TB.z - 0.3], 4.4, 4, 9, 50), k(wd(5, 3) - 0.1, [TB.x - 0.9, 0.85, TB.z], 2.6, 8, 14, 46), k(wd(5, 5) - 0.2, [TB.x, 1.1, TB.z - 0.4], 5.6, 0, 10, 54), k(T.s06, [TB.x, 1.15, TB.z - 0.4], 5.9, 0, 10, 54)],
    s06: [k(T.s06, [TB.x - 1.6, 0.85, TB.z], 2.2, 30, 10, 44), k(T.s07, [EMPTY.x - 0.3, 0.75, EMPTY.z], 1.6, 18, 16, 44, { ease: 'smooth' })],
    s07: [k(T.s07, [EMPTY.x, TABLE_H + 0.08, EMPTY.z], 0.85, 4, 22, 40), k(T.s08, [EMPTY.x, TABLE_H + 0.08, EMPTY.z], 0.78, 4, 22, 40)],
    s08: [k(T.s08, FRY, 1.6, -14, 4, 40), k(T.s09, FRY, 1.3, -8, 4, 40)],
    s09: [k(T.s09, [DT.x, 1.05, DT.z], 4.2, 0, 6, 50), k(T.s10, [DT.x, 1.0, DT.z], 3.4, 0, 6, 50)],
    s10: [k(T.s10, [DT.x, 0.95, DT.z], 3.1, 0, 6, 50), k(wd(10, 5), [DT.x, TABLE_H + 0.3, DT.z + 0.05], 1.15, 0, 7, 42), k(total, [DT.x, TABLE_H + 0.27, DT.z + 0.05], 0.95, 0, 7, 40)],
  };
  const shake = [{ t: wd(7, 0), a: 0.12 }];
  const cam = (t) => { const s = shotAt(t); return camKeys(K[s], t, { shake, hand: 0.004, creep: 0.02 }); };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const dof = (t) => { const s = shotAt(t), c = cam(t);
    if (s === 's01' || s === 's08') return { focus: dist(c.pos, FRY), cinf: 3 };
    if (s === 's07') return { focus: dist(c.pos, [EMPTY.x, TABLE_H, EMPTY.z]), cinf: 4 };
    if (s === 's10' && t > wd(10, 4)) return { focus: dist(c.pos, [DT.x, TABLE_H + 0.25, DT.z]), cinf: 3 };
    if (s === 's09' || s === 's10') return { focus: dist(c.pos, [DT.x, 1.0, DT.z - 0.5]), cinf: 1.6 };
    if (s === 's02') return { focus: dist(c.pos, [PX, 1.2, PZ - 2]), cinf: 0.6 };
    return { focus: dist(c.pos, [K[s][0].look[0], 1.1, K[s][0].look[2]]), cinf: 1.4 }; };

  // ================= light =================
  const NIGHT = { sky: '#ffd6a8', ground: '#3b2a2a', hemi: 0.8, sun: '#a9bcff', sunI: 0.7, az: 140, el: 40, fog: '#1d1820', fogNear: 25, fogFar: 90, sat: 1.1, vig: 0.32, card: '#fff2e0', gain: '#ffffff', lift: '#05030a', shadowExt: 6, grain: 0.03, lamps: { warm: 1.6, fill: 1, spot: 0, fire: 0 } };
  const LONELY = { ...NIGHT, hemi: 0.6, vig: 0.48, sat: 0.95, lamps: { warm: 1.2, fill: 0.7, spot: 0, fire: 0 } };
  const PAST = { sky: '#f2dcb0', ground: '#7a6040', hemi: 1.15, sun: '#ffdca0', sunI: 1.6, az: 130, el: 34, fog: '#ead9b8', fogNear: 30, fogFar: 110, skyTop: '#c9a46a', skyHor: '#f4e2bc',
    sat: 0.92, vig: 0.4, card: '#ffeccc', gain: '#fff0d8', lift: '#0a0602', grain: 0.08, sepia: 0.45, shadowExt: 14, lamps: { fire: 1.2, warm: 0, fill: 0, spot: 0 } };
  const FEAST = { sky: '#ffe2b8', ground: '#5a3a2a', hemi: 0.95, sun: '#ffd49a', sunI: 0.9, az: 150, el: 40, fog: '#2a1c18', fogNear: 25, fogFar: 90, sat: 1.12, vig: 0.3, card: '#fff2e0', gain: '#fff4e4', lift: '#050302', shadowExt: 6, grain: 0.03, lamps: { warm: 1.4, spot: 1.6, fill: 0, fire: 0 } };
  const light = (t) => { const s = shotAt(t);
    if (s === 's01') return NIGHT; if (s === 's08') return LONELY;
    if (s === 's09' || s === 's10') return FEAST;
    if (s === 's05' && t > wd(5, 5) - 0.2) { const kk = ramp(t, wd(5, 5) - 0.2, T.s06); return { ...PAST, az: 130 + 1080 * kk, el: 18 + 26 * Math.abs(Math.sin(kk * Math.PI * 3)), sunI: 0.9 + 0.8 * Math.abs(Math.sin(kk * Math.PI * 3)) }; }
    return PAST; };

  // ================= world animation =================
  const DEERPATH = (i, t) => { // walk in from the right toward the table, stop in a loose row
    const s = shotAt(t), stop = [PX + 1.6 + i * 0.75, PZ + 1.6 + (i % 2) * 0.5];
    if (s === 's03' || s === 's04') { const kk = EASE.easeOut(ramp(t, T.s03 + 0.6 + i * 0.12, T.s05 - 0.3)); return { x: lerp(stop[0] + 7, stop[0], kk), z: stop[1], walk: kk < 1 }; }
    return { x: stop[0], z: stop[1] + (s >= 's05' ? -40 : 0), walk: false }; };
  const update = (t) => {
    const s = shotAt(t);
    flames.forEach((f, i) => { const k2 = 1 + 0.18 * Math.sin(t * (11 + i * 3) + i); f.scale.set(1, k2, 1); f.position.y = 0.3 + (k2 - 1) * 0.12; });
    DEER.forEach((d, i) => { const p = DEERPATH(i, t); d.g.position.set(p.x, 0, p.z); d.g.rotation.y = Math.PI; // face -x (walking left)
      d.g.visible = s === 's03' || s === 's04';
      d.legs.forEach((lg, j) => { lg.rotation.z = p.walk ? Math.sin(t * 9 + i + (j % 2 ? Math.PI : 0) + (j > 1 ? 1 : 0)) * 0.45 : 0; });
      d.head.rotation.z = Math.sin(t * 2 + i) * 0.08 + (p.walk ? 0 : 0.05); });
    // the hero fryer: the display breathes; in s08 the drawer twitches; at the guest table the drawer "talks"
    hero.dr.position.z = s === 's08' ? 0.03 * Math.max(0, Math.sin(t * 5)) * (t > wd(8, 3) ? 1 : 0) : 0;
    guest.dr.position.z = s === 's10' ? 0.05 * EASE.smooth(ramp(t, wd(10, 2), wd(10, 4))) : 0;
    crown.rotation.y = s === 's10' || s === 's09' ? Math.sin(t * 1.3) * 0.08 : 0;
  };

  // ================= cast =================
  const W = (skin, hair, style, top, extra = {}) => ({ skin, hair, style, top, topKind: 'vest', vest: '#7a5232', pants: '#6a4a2e', shoes: '#5a3a22', ...extra });
  const WAMP = [W(E.SKINS[4], '#1e1512', 'long', '#a87a4a'), W(E.SKINS[3], '#1e1512', 'pony', '#9a6a3a'), W(E.SKINS[4], '#241a14', 'long', '#b88a5a', { stout: true }), W(E.SKINS[3], '#1e1512', 'short', '#a07040'), W(E.SKINS[5], '#1e1512', 'pony', '#8a6038')];
  const CL = (skin, hair, style, top, extra = {}) => ({ skin, hair, style, top, topKind: 'shirt', shirt: '#efe8d8', pants: '#3a3430', shoes: '#2a1c14', ...extra });
  const COL = [CL(E.SKINS[0], '#6b4628', 'side', '#3a3a42'), CL(E.SKINS[1], '#c7642e', 'bun', '#5a4a3a', { apron: '#efe6d2' }), CL(E.SKINS[0], '#3a2a1c', 'short', '#2a2a30', { beard: '#3a2a1c' }),
    CL(E.SKINS[1], '#e0c070', 'bob', '#6a3a2a', { apron: '#efe6d2' }), CL(E.SKINS[0], '#2a1c16', 'balding', '#3a3430', { moustache: '#2a1c16' })];
  const FAM = [{ skin: E.SKINS[1], hair: '#5a3b2a', style: 'pony', top: '#c0573a', topKind: 'sweater', pants: '#2e3446', shoes: '#3a2a22' },
    { skin: E.SKINS[3], hair: '#1e1512', style: 'short', top: '#5d8a3a', topKind: 'sweater', pants: '#3a3a44', shoes: '#2a2a2a', beard: '#1e1512' },
    { skin: E.SKINS[0], hair: '#e0c070', style: 'curly', top: '#e8a23a', topKind: 'hoodie', pants: '#3b3f52', shoes: '#f0ece4', kid: true }];
  const actors = (t) => {
    const s = shotAt(t), A = [];
    // B) the Wampanoag group walks in (s03-s04), then stands near the fire / eats (s05-s06)
    const arrive = (i) => EASE.easeOut(ramp(t, T.s03 + 0.2 + i * 0.15, T.s04 + 0.4));
    if (s === 's02' || s === 's03' || s === 's04' || s === 's05' || s === 's06') {
      WAMP.forEach((lk, i) => {
        const home = [PX + 1.0 + i * 0.85, PZ + 1.0 + (i % 2) * 0.45];
        const walking = s === 's03' && arrive(i) < 1, inFrame = s !== 's02';
        if (!inFrame) return;
        const x = s === 's03' ? lerp(home[0] + 6.5, home[0], arrive(i)) : home[0];
        const pose = walking ? { mode: 'walk', step: t * 2.4 + i * 0.4, expr: i === 1 ? 'smile' : 'neutral', L: 'hang', R: 'hang', facing: -1, look: -0.6 }
          : s === 's05' || s === 's06' ? { mode: 'stand', expr: (t + i) % 3 < 1.5 ? 'chew' : 'happy', L: 'hang', R: i % 2 ? 'hold' : 'hang', hold: i % 2 ? { R: 'plate' } : undefined, facing: -1, look: -0.4 }
          : { mode: 'stand', expr: i === 0 ? 'smile' : 'neutral', L: i === 0 ? 'wave' : 'hang', R: 'hang', k: t * 2, facing: -1, look: -0.5 };
        A.push(actor({ id: 'w' + i, look: lk, seed: 40 + i, x, y: 0, z: home[1] + (s === 's05' || s === 's06' ? -40 : 0), main: i === 0, pose: alive(t, 40 + i, pose) }));
      });
    }
    // colonists at the table (behind it, facing camera); in s02 they wait, s05-s07 they eat
    if (s === 's02' || s === 's05' || s === 's06' || s === 's07') {
      const xs = [-1.9, -1.0, -0.1, 0.8, 1.6];
      COL.forEach((lk, i) => { const eat = s !== 's02';
        A.push(actor({ id: 'c' + i, look: lk, seed: 60 + i, x: TB.x + xs[i], y: 0, z: TB.z - 0.72, pose: alive(t, 60 + i, { mode: 'sit', tableY: TY,
          expr: s === 's07' ? (i === 4 ? 'shrug' === 'x' ? 'think' : 'think' : 'bored') : eat ? ((t * 1.3 + i) % 2 < 1 ? 'chew' : 'happy') : 'smile',
          L: s === 's07' && i === 4 ? 'shrug' : 'table', R: s === 's07' && i === 4 ? 'shrug' : eat ? 'fork' : 'table', k: eat ? (t * 2.2 + i * 0.3) % 1 : 0, look: s === 's07' ? 0.9 : 0, facing: 0 }) })); });
    }
    // C) the family stares at the crowned fryer
    if (s === 's09' || s === 's10') {
      const xs = [-1.0, 0.0, 1.0];
      FAM.forEach((lk, i) => { if (i === 1) return; // the middle chair stays empty behind the throne
        const late = s === 's10' && t > wd(10, 5);
        A.push(actor({ id: 'f' + i, look: lk, seed: 80 + i, x: DT.x + xs[i], y: 0, z: DT.z - 0.55, pose: alive(t, 80 + i, { mode: 'sit', tableY: TY,
          expr: late ? (i === 0 ? 'annoyed' : 'sideeye') : i === 0 ? 'bored' : 'think', L: i === 0 && late ? 'cross' : 'table', R: i === 0 && late ? 'cross' : 'table', look: i === 0 ? 0.8 : -0.8, facing: 0 }) })); });
      A.push(actor({ id: 'dad', look: FAM[1], seed: 82, x: DT.x + 1.75, y: 0, z: DT.z + 0.15, pose: alive(t, 82, { mode: 'stand', expr: s === 's10' ? 'smug' : 'smile', L: 'hang', R: s === 's10' && t > wd(10, 1) ? 'point' : 'hang', facing: -1, look: -0.9 }) }));
      if (s === 's10' && t > wd(10, 5)) A.push(fxCard({ id: 'spk', kind: 'sparkle', args: [t * 3], x: DT.x + 0.18, y: TABLE_H + 0.55, z: DT.z + 0.1, s: 0.08 }));
    }
    if (s === 's01' && t > wd(1, 3)) A.push(fxCard({ id: 'q1', kind: 'question', args: [t], x: AF.x + 0.24, y: COUNTER_H + 0.5, z: AF.z + 0.05, s: 0.09 }));
    if (s === 's08' && t > wd(8, 4)) A.push(fxCard({ id: 'sw', kind: 'sweat', args: [t], x: AF.x - 0.2, y: COUNTER_H + 0.42, z: AF.z + 0.1, s: 0.07 }));
    return A;
  };

  // ================= text =================
  const M_ = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B_ = (a, cls = '', fs = 230) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const ui = (t) => {
    const s = shotAt(t), o = { capY: 1480, exterior: s !== 's01' && s !== 's08' && s !== 's09' && s !== 's10' };
    if (s === 's01') { o.title = M_('AIR FRYER') + M_('ATTENDANCE:', 'y'); o.titleK = 1; o.capY = 1500; }
    if (s === 's02') { o.title = B_('1621', 'y', 230); o.titleK = (t - T.s02) / 0.3; o.capY = 1520; }
    if (s === 's03' && t > wd(3, 1) - 0.1) { o.title = B_('~90', 'y', 230); o.titleK = (t - wd(3, 1) + 0.1) / 0.3; }
    if (s === 's04' && t > wd(4, 1) - 0.1) { o.title = M_('5 DEER', 'y'); o.titleK = (t - wd(4, 1) + 0.1) / 0.3; o.capY = 1560; }
    if (s === 's05' && t > wd(5, 5) - 0.15) { o.title = M_('3 DAYS', 'y'); o.titleK = (t - wd(5, 5) + 0.15) / 0.3; }
    if (s === 's06') { o.title = M_('AIR FRYERS:'); o.titleK = (t - T.s06) / 0.3; }
    if (s === 's07') { o.title = B_('0', 'r', 300); o.titleK = (t - T.s07 - 0.08) / 0.25; o.capY = 1560; }
    if (s === 's08' && t > wd(8, 6) - 0.1) { o.title = M_('NOT EVEN') + M_('INVENTED', 'r'); o.titleK = (t - wd(8, 6) + 0.1) / 0.3; }
    if (s === 's09') { const yr = Math.round(lerp(1621, 2026, EASE.smooth(ramp(t, T.s09 + 0.1, T.s10 - 0.2)))); o.title = B_(String(yr), 'y', 220); o.titleK = (t - T.s09) / 0.3; o.capY = 1560; }
    if (s === 's10' && t > wd(10, 5) - 0.1) { o.title = M_('GUEST OF') + M_('HONOR', 'y'); o.titleK = (t - wd(10, 5) + 0.1) / 0.3; o.capY = 1560; }
    return o;
  };
  const KEY = ['air', 'fryer', 'thanksgiving', 'ninety', 'five', 'deer', 'three', 'days', 'zero', 'invited', 'invented', 'honor', 'fryers'];
  return { shots, cam, dof, light, update, actors, ui, KEY };
}
