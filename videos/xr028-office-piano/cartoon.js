// xr028-office-piano (USELESS FACTS, owner 27/11/2026): "Being a good coworker won't save you." A grand piano (9 ft, ~990 lb,
// Steinway Model D specs: 274 cm, 480 kg) falls through the office ceiling on the nice coworker who never microwaves fish;
// then, in the other version, on the one who microwaves fish every day, and the whole office claps.
// One place: an open-plan office with a desk area (left) and a break room counter (right) with a microwave and a coffee machine.
// Cartoon only: nobody is hurt on screen (dust puff, a pair of shoes sticking out from under the piano). Generic piano, no brand.
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

  // ================= OFFICE =================
  const RH = 3.0, BW = -4.44;
  const carpet = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#5d6b7a'; g.fillRect(0, 0, w, h); const r = P.rng(281);
    for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${40 + r() * 40},${50 + r() * 40},${60 + r() * 50},.25)`; g.fillRect(r() * w, r() * h, 2, 2); } });
  const tiles = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e9e6dc'; g.fillRect(0, 0, w, h); g.strokeStyle = '#b9b4a6'; g.lineWidth = 6; g.strokeRect(0, 0, w, h);
    const r = P.rng(282); for (let i = 0; i < 400; i++) { g.fillStyle = 'rgba(150,140,120,.25)'; g.fillRect(r() * w, r() * h, 2, 2); } });
  room(E, E.scene, 0, 0, { w: 12, d: 9, h: RH, floor: mat({ map: carpet.c, rep: [6, 5] }), wallTop: mat({ map: P.plaster(283, 210), rep: [4, 1.5], color: '#dfe6ea' }),
    wallLow: '#9fb4c0', wainH: 0.9, ceil: mat({ map: tiles.c, rep: [10, 8] }) });
  // fluorescent panels
  for (const [x, z] of [[-3, -1.5], [0, -1.5], [3, -1.5], [-3, 1.5], [0, 1.5], [3, 1.5]]) add(box(1.2, 0.04, 0.5), glow('#f4fbff', 1.3), x, RH - 0.03, z, E.scene, { cast: false, noink: true });
  lamp(-2, 2.6, 0, '#eef6ff', 1.1, 9, 'office'); lamp(2.5, 2.6, -0.5, '#eef6ff', 1.1, 9, 'office');
  // windows with city, motivational poster (own text), a clock
  X.window(E.scene, -3.6, 1.75, BW + 0.02, 0, 2.2, 1.1);
  { const pst = canvasTex(300, 400, (g, w, h) => { g.fillStyle = '#1f4f7a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd23a'; g.beginPath(); g.arc(w / 2, 150, 70, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.font = '900 44px Inter, Arial Black'; g.textAlign = 'center'; g.fillText('TEAMWORK', w / 2, 300); g.font = '700 24px Inter, Arial'; g.fillText('we lift each other up', w / 2, 345); });
    add(box(0.6, 0.8, 0.01), mat({ map: pst.c }), -0.9, 1.75, BW + 0.02, E.scene, { cast: false }); }
  const clock = X.wallClock(E.scene, 1.2, 2.3, BW + 0.03, 0, 0.22); clock.set(9 * 60 + 2);
  // cubicle desks (left)
  const desk = (x, z, ry = 0) => { const g = group(x, 0, z, E.scene); g.rotation.y = ry;
    add(tbox(1.4, 0.05, 0.75, 1), '#c9b08a', 0, 0.74, 0, g); for (const sx of [-1, 1]) add(tbox(0.05, 0.72, 0.7, 1), '#8a8f98', sx * 0.66, 0.36, 0, g);
    add(tbox(1.5, 1.3, 0.05, 1), '#7f97a8', 0, 0.65, -0.42, g);
    add(tbox(0.55, 0.36, 0.04, 1), '#1d2024', 0, 1.0, -0.22, g); add(box(0.5, 0.3, 0.01), glow('#8fd0ff', 0.7), 0, 1.0, -0.198, g, { noink: true, cast: false }); add(box(0.06, 0.18, 0.06), '#2a2e34', 0, 0.84, -0.24, g);
    add(tbox(0.4, 0.02, 0.15, 1), '#2a2e34', 0, 0.77, 0.05, g); X.plant(g, 0.5, -0.2, 0.35); return g; };
  desk(-3.4, -2.2); desk(-1.6, -2.2); desk(-4.4, 0.4, Math.PI / 2);
  // break room counter (right) with microwave and coffee machine
  const BRZ = BW + 0.33;
  add(tbox(4.2, COUNTER_H - 0.05, 0.62, 1), '#3f5f8a', 3.6, (COUNTER_H - 0.05) / 2, BRZ, E.scene);
  add(tbox(4.3, 0.05, 0.66, 1), '#eeeae2', 3.6, COUNTER_H - 0.025, BRZ, E.scene);
  for (let i = 0; i < 5; i++) add(box(0.78, 0.7, 0.012), '#4f72a0', 1.9 + i * 0.84, 0.46, BRZ + 0.315, E.scene, { cast: false });
  add(tbox(4.2, 0.6, 0.34, 1), '#3f5f8a', 3.6, 2.2, BW + 0.18, E.scene);
  const MW = { x: 4.4, z: BRZ };
  const micro = group(MW.x, COUNTER_H, MW.z, E.scene);
  add(tbox(0.55, 0.32, 0.38, 1), '#e8e8ec', 0, 0.16, 0, micro);
  const mwWin = add(box(0.36, 0.24, 0.01), new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.35 }), -0.06, 0.16, 0.195, micro, { noink: true, cast: false }); const mwOff = add(box(0.36, 0.24, 0.01), '#2a2e34', -0.06, 0.16, 0.194, micro, { cast: false }); lamp(MW.x - 0.06, COUNTER_H + 0.16, MW.z + 0.1, '#ffd27a', 0.6, 1.2, 'office');
  add(box(0.1, 0.24, 0.01), '#2a2e34', 0.2, 0.16, 0.195, micro, { cast: false });
  const fish = group(-0.06, 0.1, 0.05, micro); { const b = add(new THREE.SphereGeometry(0.06, 14, 10), '#8fb4cc', 0, 0, 0, fish); b.scale.set(2.0, 0.9, 0.5); const tl = add(new THREE.ConeGeometry(0.05, 0.08, 3), '#6f94ac', 0.15, 0, 0, fish); tl.rotation.z = Math.PI / 2; add(new THREE.SphereGeometry(0.012, 8, 6), '#111', -0.09, 0.015, 0.03, fish, { noink: true }); }
  const CF = { x: 2.6, z: BRZ };
  const coffee = group(CF.x, COUNTER_H, CF.z, E.scene);
  add(tbox(0.3, 0.42, 0.3, 1), '#2a2e34', 0, 0.21, -0.02, coffee); add(tbox(0.3, 0.06, 0.12, 1), '#2a2e34', 0, 0.39, 0.12, coffee);
  const pot = group(0, 0.02, 0.12, coffee); add(cyl(0.08, 0.09, 0.16, 16), new THREE.MeshToonMaterial({ color: '#bfe4f2', transparent: true, opacity: 0.85 }), 0, 0.08, 0, pot);
  const brew = add(cyl(0.075, 0.085, 0.1, 16), '#5a3418', 0, 0.05, 0, pot, { noink: true }); add(box(0.03, 0.08, 0.03), '#1d1b22', 0.1, 0.1, 0, pot);
  add(cyl(0.05, 0.05, 0.12, 14), '#f4f1ea', 3.2, COUNTER_H + 0.06, BRZ + 0.1, E.scene); // a mug
  // "NO FISH IN THE MICROWAVE" sign above the microwave (own text)
  { const sg = canvasTex(400, 160, (g, w, h) => { g.fillStyle = '#fff8e0'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c0392b'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
      g.fillStyle = '#c0392b'; g.font = '900 46px Inter, Arial Black'; g.textAlign = 'center'; g.fillText('PLEASE: NO FISH', w / 2, 70); g.font = '800 30px Inter, Arial'; g.fillStyle = '#2a2420'; g.fillText('in the microwave. ever.', w / 2, 120); });
    add(box(0.6, 0.24, 0.01), mat({ map: sg.c }), MW.x, 1.55, BW + 0.02, E.scene, { cast: false }); }
  X.plant(E.scene, 5.5, -1.8, 0.8);

  // ================= THE PIANO (generic concert grand, 2.74 m x 1.56 m, black lacquer) =================
  const pianoShape = () => { const s = new THREE.Shape(); // in XY: keyboard edge along x (0..1.56), tail toward +y (2.74)
    s.moveTo(0, 0); s.lineTo(1.56, 0); s.lineTo(1.56, 0.9); s.bezierCurveTo(1.5, 1.6, 1.05, 1.7, 0.85, 2.2); s.bezierCurveTo(0.7, 2.6, 0.45, 2.74, 0.25, 2.74); s.lineTo(0, 2.74); s.lineTo(0, 0); return s; };
  const piano = (() => { const g = group(0, 10, 0, E.scene), body = group(-0.78, 0, 1.2, g); body.rotation.x = Math.PI / 2;
    const geo = new THREE.ExtrudeGeometry(pianoShape(), { depth: 0.34, bevelEnabled: true, bevelSize: 0.02, bevelThickness: 0.02, bevelSegments: 2, curveSegments: 24 });
    add(geo, '#16161c', 0, 0, -0.98, body);
    const lid = group(0, 0, -1.0, body); add(new THREE.ExtrudeGeometry(pianoShape(), { depth: 0.03, bevelEnabled: false, curveSegments: 24 }), '#1d1d24', 0, 0, -0.03, lid); lid.rotation.y = -0.5;
    add(tbox(1.5, 0.12, 0.3, 1), '#16161c', 0, 0.72, 1.32, g);                                                   // key bed
    const keys = canvasTex(512, 64, (gg, w, h) => { gg.fillStyle = '#f6f3ec'; gg.fillRect(0, 0, w, h); gg.strokeStyle = '#999'; for (let i = 0; i < 52; i++) { gg.beginPath(); gg.moveTo(i * w / 52, 0); gg.lineTo(i * w / 52, h); gg.stroke(); }
      gg.fillStyle = '#111'; for (let i = 0; i < 52; i++) if ([1, 2, 4, 5, 6].includes(i % 7)) gg.fillRect(i * w / 52 - 3, 0, 6, h * 0.6); });
    add(box(1.4, 0.02, 0.16), mat({ map: keys.c }), 0, 0.79, 1.4, g, { cast: false });
    for (const [x, z] of [[-0.68, 1.1], [0.68, 1.1], [-0.4, -1.3]]) add(cyl(0.06, 0.045, 0.66, 12), '#16161c', x, 0.33, z, g);
    add(tbox(0.5, 0.04, 0.2, 1), '#c9a24a', 0, 0.08, 0.9, g); // pedal lyre base
    return g; })();
  // dark hole in the ceiling + falling tile debris + shoes under the piano
  const hole = add(new THREE.CircleGeometry(1.4, 9), '#0d0d10', 0, RH - 0.06, 0, E.scene, { cast: false, noink: true }); hole.rotation.x = Math.PI / 2;
  const debris = []; { const r = P.rng(285); for (let i = 0; i < 10; i++) { const d = add(box(0.3 + r() * 0.2, 0.03, 0.3 + r() * 0.2), mat({ map: tiles.c }), 0, 1, 0, E.scene, { cast: false }); debris.push({ m: d, dx: (r() - 0.5) * 2.2, dz: (r() - 0.5) * 1.8, ry: r() * 6, dl: r() * 0.25 }); } }
  const shoes = group(0, 0, 0, E.scene); for (const sx of [-0.12, 0.12]) { add(tbox(0.12, 0.08, 0.26, 1), '#3a2a1c', sx, 0.04, 0, shoes); }
  const mugRoll = add(cyl(0.05, 0.05, 0.12, 14), '#f4f1ea', 0, -5, 0, E.scene);

  // ================= shots =================
  const T = { s01: 0, s02: st(2) - 0.12, s03: st(3) - 0.12, s04: st(4) - 0.12, s05: st(5) - 0.12, s06: st(6) - 0.15, s07: st(7) - 0.15, s08: st(8) - 0.15, s09: st(9) - 0.15 };
  const shots = Object.entries(T).map(([id, start]) => ({ id, start }));
  const shotAt = (t) => { let id = 's01'; for (const [k, v] of Object.entries(T)) if (t >= v) id = k; return id; };
  const aim = (tg, Wd, yaw = 0, pitch = 8, fov = 36) => { const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * 0.5625), d = Wd / (2 * Math.tan(hf / 2));
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { pos: [tg[0] + Math.sin(y) * Math.cos(p) * d, tg[1] + Math.sin(p) * d, tg[2] + Math.cos(y) * Math.cos(p) * d], look: [...tg], fov }; };
  const k = (t, tg, Wd, yaw, pitch, fov, o = {}) => ({ t, ...aim(tg, Wd, yaw, pitch, fov), ...o });
  const HERO = { x: CF.x - 0.05, z: BRZ + 0.72 }, FISHG = { x: MW.x + 0.05, z: BRZ + 0.7 };
  const K = {
    s01: [k(0, [-1.6, 1.05, -1.7], 2.6, 10, 6, 46), k(T.s02, [-1.6, 1.08, -1.7], 2.3, 6, 6, 46)],
    s02: [k(T.s02, [MW.x - 0.6, 1.2, BRZ + 0.5], 3.0, -8, 5, 46), k(T.s03, [MW.x - 0.6, 1.2, BRZ + 0.5], 2.7, -6, 5, 46)],
    s03: [k(T.s03, [CF.x, 1.2, BRZ + 0.5], 2.2, 14, 6, 44), k(T.s04, [CF.x, 1.25, BRZ + 0.5], 2.0, 10, 6, 44)],
    s04: [k(T.s04, [HERO.x, 1.5, HERO.z - 0.3], 4.2, 6, -14, 58), k(wd(4, 4), [HERO.x, 2.0, HERO.z - 0.4], 4.6, 4, -22, 60), k(T.s05, [HERO.x, 2.1, HERO.z - 0.4], 4.8, 4, -22, 60)],
    s05: [k(T.s05, [HERO.x, 2.05, HERO.z - 0.4], 3.6, 34, -6, 50), k(T.s06, [HERO.x, 2.0, HERO.z - 0.4], 3.2, 28, -6, 50)],
    s06: [k(T.s06, [HERO.x + 0.5, 0.6, HERO.z - 0.9], 5.4, -14, 14, 54), k(T.s07, [HERO.x + 0.5, 0.55, HERO.z - 0.9], 5.0, -10, 14, 54)],
    s07: [k(T.s07, [MW.x - 0.3, 1.15, BRZ + 0.6], 3.2, -14, 5, 48), k(T.s08, [MW.x - 0.2, 1.15, BRZ + 0.6], 2.8, -10, 5, 48)],
    s08: [k(T.s08, [FISHG.x, 1.6, FISHG.z - 0.3], 4.6, -6, -10, 58), k(T.s09, [FISHG.x, 1.0, FISHG.z - 0.3], 4.6, -6, 6, 58)],
    s09: [k(T.s09, [FISHG.x - 1.3, 1.0, FISHG.z + 0.4], 6.0, -4, 8, 56), k(total, [FISHG.x - 1.2, 1.0, FISHG.z + 0.4], 5.5, -2, 8, 56)],
  };
  const LAND1 = T.s06 + 0.1, LAND2 = wd(8, 1) + 0.02;
  const shake = [{ t: LAND1, a: 0.45 }, { t: LAND2, a: 0.45 }, { t: wd(4, 4), a: 0.18 }];
  const cam = (t) => { const s = shotAt(t); return E.keepInside(camKeys(K[s], t, { shake, hand: 0.004, creep: 0.02 }), [-5.8, 0.2, -4.3], [5.8, 2.85, 9]); };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const dof = (t) => { const s = shotAt(t), c = cam(t);
    if (s === 's03') return { focus: dist(c.pos, [CF.x, 1.1, BRZ + 0.3]), cinf: 2.5 };
    if (s === 's05') return { focus: dist(c.pos, [HERO.x, 2.0, HERO.z - 0.4]), cinf: 1.6 };
    return { focus: dist(c.pos, K[s][0].look), cinf: 1.2 }; };

  // ================= light =================
  const OFFICE = { sky: '#eef6ff', ground: '#4a5560', hemi: 1.15, sun: '#ffffff', sunI: 0.9, az: 120, el: 50, fog: '#cfd8de', fogNear: 30, fogFar: 90, skyTop: '#9fc8e8', skyHor: '#e6eef2',
    sat: 1.08, vig: 0.22, card: '#ffffff', gain: '#ffffff', lift: '#000000', grain: 0.02, shadowExt: 8, lamps: { office: 1, window: 1 } };
  const DOOM = { ...OFFICE, card: '#ffe0d6', gain: '#ffe8e0', vig: 0.4, sat: 1.15, hemi: 0.95 };
  const CHEER = { ...OFFICE, card: '#fff4e0', gain: '#fff6e8', sat: 1.15, vig: 0.2 };
  const light = (t) => { const s = shotAt(t); if (s === 's04' || s === 's05' || s === 's08') return DOOM; if (s === 's09') return CHEER; return OFFICE; };

  // ================= world animation =================
  const update = (t) => {
    const s = shotAt(t);
    // piano: falls at the hero spot (s04-s06), then at the fish guy (s08-s09)
    let px = HERO.x, pz = HERO.z - 0.4, py = 10, rz = 0;
    if (s === 's04') { const kk = EASE.smooth(ramp(t, wd(4, 4) - 0.05, T.s05)); py = lerp(3.6, 2.3, kk); rz = 0.06 * Math.sin(t * 3); }
    if (s === 's05') { py = lerp(2.3, 2.05, ramp(t, T.s05, T.s06)); rz = 0.05 * Math.sin(t * 2); }
    if (s === 's06') { py = lerp(2.05, 0, EASE.smooth(ramp(t, T.s06, LAND1))); }
    if (s === 's08') { px = FISHG.x - 0.1; pz = FISHG.z - 0.4; py = lerp(3.6, 0, Math.pow(ramp(t, T.s08 + 0.05, LAND2), 2)); }
    if (s === 's09') { px = FISHG.x - 0.1; pz = FISHG.z - 0.4; py = 0; }
    piano.position.set(px, py, pz); piano.rotation.set(0, 0.25, rz); piano.visible = py < 9;
    hole.position.set(px, RH - 0.06, pz); hole.visible = (s === 's04' && t > wd(4, 4)) || s === 's05' || s === 's06' || s === 's08' || s === 's09';
    const breakT = s === 's08' || s === 's09' ? T.s08 + 0.05 : wd(4, 4) - 0.05;
    for (const d of debris) { const q = ramp(t, breakT + d.dl, breakT + d.dl + 0.9); const on = q > 0 && (s === 's04' || s === 's05' || s === 's08');
      d.m.visible = on; d.m.position.set(px + d.dx * q, RH - 0.1 - q * q * (RH - 0.1) + 0.02, pz + d.dz * q); d.m.rotation.set(q * 4 + d.ry, d.ry, q * 3); }
    const showShoes = (s === 's06' && t > LAND1) || ((s === 's08' && t > LAND2) || s === 's09');
    shoes.visible = showShoes; shoes.position.set(px + 0.15, 0, pz + 1.95); shoes.rotation.y = 0.2; shoes.scale.setScalar(1.4);
    mugRoll.visible = s === 's06' && t > LAND1; mugRoll.position.set(px - 0.9 - ramp(t, LAND1, T.s07) * 0.9, 0.05, pz + 1.7); mugRoll.rotation.set(Math.PI / 2, 0, t * 6);
    // coffee pot fills in s03; microwave fish turns in s07
    const fill = s === 's03' ? ramp(t, T.s03 + 0.3, T.s04 - 0.2) : 1; brew.scale.y = 0.15 + 0.85 * fill; brew.position.y = 0.05 * brew.scale.y;
    fish.visible = s === 's07' || s === 's08'; mwWin.visible = s !== 's02'; mwOff.visible = s === 's02'; fish.rotation.y = Math.sin(t * 2) * 0.6;
    clock.set(9 * 60 + 2 + t * 4, (t * 60) % 60);
  };

  // ================= cast =================
  const LK = {
    hero: { skin: E.SKINS[1], hair: '#6b4628', style: 'side', top: '#5d8a3a', topKind: 'cardigan', shirt: '#f4f1ea', pants: '#4a4a54', shoes: '#3a2a1c', glasses: '#2a2430' },
    fish: { skin: E.SKINS[0], hair: '#c7642e', style: 'balding', top: '#e8b33a', topKind: 'polo', pants: '#34425e', shoes: '#1d1b22', beard: '#c7642e', kid: true, stout: true },
    c1: { skin: E.SKINS[4], hair: '#1e1512', style: 'bun', top: '#c0476a', topKind: 'blouse', pants: '#2e3446', shoes: '#8a2f2f' },
    c2: { skin: E.SKINS[2], hair: '#2a1c16', style: 'short', top: '#4f7fb8', topKind: 'shirt', tie: '#b8282b', pants: '#2a2e3a', shoes: '#1d1b22' },
    c3: { skin: E.SKINS[3], hair: '#e0c070', style: 'pony', top: '#3f8f7a', topKind: 'hoodie', pants: '#3b3f52', shoes: '#f0ece4' },
  };
  const actors = (t) => {
    const s = shotAt(t), A = [];
    // the good coworker
    const heroOn = s === 's01' || s === 's02' || s === 's03' || s === 's04' || s === 's05' || (s === 's06' && t < LAND1 - 0.02);
    if (heroOn) {
      let hp, hx = HERO.x, hz = HERO.z;
      if (s === 's01') { hp = { mode: 'stand', expr: 'happy', L: 'hold', R: 'wave', k: t, hold: { L: 'glass' }, look: 0.4, facing: 0 }; hx = -1.6; hz = -1.5; }
      else if (s === 's02') { hx = MW.x - 1.05; hz = BRZ + 0.75; hp = { mode: 'stand', expr: 'smug', L: 'hang', R: 'point', facing: 1, look: 0.9, headTilt: 4 }; }
      else if (s === 's03') { hp = { mode: 'stand', expr: 'happy', L: 'reach', R: 'hang', facing: -1, look: -0.8, back: false }; hx = CF.x + 0.5; hz = BRZ + 0.55; }
      else hp = { mode: 'stand', expr: 'shock', L: 'up', R: 'up', facing: 0, look: 0, headTilt: -6 };
      A.push(actor({ id: 'hero', look: LK.hero, seed: 11, x: hx, y: 0, z: hz, main: true, pose: alive(t, 11, hp) }));
      if (s === 's03' && t > T.s03 + 0.4) A.push(fxCard({ id: 'spk', kind: 'sparkle', args: [t * 3], x: CF.x + 0.25, y: COUNTER_H + 0.45, z: CF.z + 0.25, s: 0.1 }));
      if (s === 's04' && t > wd(4, 4)) A.push(fxCard({ id: 'ex', kind: 'exclaim', args: [t], x: HERO.x + 0.3, y: 2.1, z: HERO.z, s: 0.16 }));
    }
    // office workers in the background desks (s01) and around the break room (s06, s07, s09)
    const watchers = (expr, L, R, kk, look, xs) => xs.forEach(([id, lk, x, z, fac], i) => A.push(actor({ id, look: LK[lk], seed: 30 + i, x, y: 0, z, pose: alive(t, 30 + i, { mode: 'stand', expr, L, R, k: kk + i * 0.3, facing: fac, look }) })));
    if (s === 's01') { A.push(actor({ id: 'w1', look: LK.c1, seed: 31, x: -3.4, y: 0, z: -1.5, pose: alive(t, 31, { mode: 'stand', expr: 'smile', L: 'hang', R: 'hang', facing: 1, look: 0.6 }) }));
      A.push(actor({ id: 'w2', look: LK.c2, seed: 32, x: 0.6, y: 0, z: -0.4, pose: alive(t, 32, { mode: 'stand', expr: 'smile', L: 'hold', R: 'hang', hold: { L: 'glass' }, facing: -1, look: -0.7 }) })); }
    if (s === 's06') watchers('gasp', 'cheek', 'cheek', 0, 0.8, [['w1', 'c1', HERO.x - 1.15, HERO.z + 0.9, 1], ['w2', 'c2', HERO.x + 1.5, HERO.z + 0.5, -1]]);
    // the fish microwaver (tiny, stout, beard)
    if (s === 's07' || (s === 's08' && t < LAND2 - 0.02)) {
      const look8 = s === 's08' && t > T.s08 + 0.2;
      A.push(actor({ id: 'fish', look: LK.fish, seed: 21, x: FISHG.x, y: 0, z: FISHG.z, pose: alive(t, 21, look8 ? { mode: 'stand', expr: 'shock', L: 'up', R: 'up', facing: 0 } : { mode: 'stand', expr: 'smug', L: 'hold', hold: { L: 'plate' }, R: 'point', facing: -1, look: -0.8, back: false }) }));
      if (s === 's07') { A.push(fxCard({ id: 'stink', kind: 'steam', args: [(t * 0.8) % 1], x: MW.x, y: COUNTER_H + 0.6, z: MW.z + 0.2, s: 0.38 })); A.push(fxCard({ id: 'stink2', kind: 'steam', args: [(t * 0.8 + 0.5) % 1], x: FISHG.x - 0.3, y: 1.35, z: FISHG.z + 0.1, s: 0.3 }));
        watchers('annoyed', 'cheek', 'hang', 0, 0.9, [['w1', 'c1', MW.x - 2.3, BRZ + 1.3, 1], ['w3', 'c3', MW.x - 1.25, BRZ + 0.35, 1]]); }
    }
    if (s === 's09') {
      watchers('laugh', 'wave', 'wave', t * 1.6, 0.6, [['w1', 'c1', FISHG.x - 2.2, FISHG.z + 1.0, 1], ['w2', 'c2', FISHG.x - 1.4, FISHG.z + 1.4, 1], ['w3', 'c3', FISHG.x - 3.0, FISHG.z + 0.3, 1]]);
      A.push(actor({ id: 'hero', look: LK.hero, seed: 11, x: FISHG.x - 0.55, y: 0, z: FISHG.z + 1.8, pose: alive(t, 11, { mode: 'stand', expr: 'happy', L: 'wave', R: 'wave', k: t * 1.7, facing: 1, look: 0.7 }) }));
      A.push(fxCard({ id: 'sp9', kind: 'sparkle', args: [t * 3], x: FISHG.x - 0.1, y: 1.4, z: FISHG.z, s: 0.14 }));
    }
    if ((s === 's06' && t > LAND1) || (s === 's08' && t > LAND2)) A.push(fxCard({ id: 'puff', kind: 'puff', args: [ramp(t, s === 's06' ? LAND1 : LAND2, (s === 's06' ? LAND1 : LAND2) + 0.9)], x: piano.position.x, y: 0.6, z: piano.position.z + 0.8, s: 0.9 }));
    return A;
  };

  // ================= text =================
  const M_ = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B_ = (a, cls = '', fs = 230) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const ui = (t) => {
    const s = shotAt(t), o = { capY: 1500 };
    if (s === 's01') { o.title = M_('GOOD') + M_('COWORKER', 'y'); o.titleK = 1; }
    if (s === 's02' && t > wd(2, 4) - 0.1) { o.title = M_('NO FISH', 'y'); o.titleK = (t - wd(2, 4) + 0.1) / 0.3; }
    if (s === 's05') { const big = t > wd(5, 3) - 0.1; o.title = big ? B_('990 LB', 'y', 200) : B_('9 FT', 'y', 220); o.titleK = (t - (big ? wd(5, 3) - 0.1 : T.s05)) / 0.3; o.capY = 1560; }
    if (s === 's06' && t > LAND1) { o.title = M_('R.I.P.', 'r'); o.titleK = (t - LAND1) / 0.3; }
    if (s === 's07' && t > wd(7, 3) - 0.1) { o.title = M_('FISH', 'r') + M_('EVERY DAY'); o.titleK = (t - wd(7, 3) + 0.1) / 0.3; }
    if (s === 's08') { o.capY = 1560; }
    if (s === 's09' && t > wd(9, 6) - 0.1) { o.title = M_('APPLAUSE', 'y'); o.titleK = (t - wd(9, 6) + 0.1) / 0.3; }
    return o;
  };
  const KEY = ['coworker', 'fish', 'coffee', 'piano', 'nine', 'thousand', 'die', 'every', 'same', 'claps'];
  return { shots, cam, dof, light, update, actors, ui, KEY };
}
