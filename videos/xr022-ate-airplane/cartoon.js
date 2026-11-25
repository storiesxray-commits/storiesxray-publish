// xr022-ate-airplane: Michel Lotito ("Monsieur Mangetout") ate a Cessna 150, 1978-1980 (Guinness World Records, Wikipedia).
// One place: a small country airfield on a bright warm morning. A dinner table with a blue gingham cloth stands on the
// apron right in front of a little high-wing plane (our own generic build: white with a teal stripe, no registration,
// no logos). Over the video the plane disappears part by part: tail, left half (the split frame used for the thumbnail:
// the plane alone, head-on, cut down the middle), right half; the last shot returns to the first framing with the apron empty (visual loop).
// Real person: a generic figure, no likeness. The record keeper is a generic official; no logo or brand mark anywhere.
// Times come from the real ElevenLabs narration: st(i) = sentence i start, wd(i, j) = word j (0-based) of sentence i.
import { props, TABLE_H, designY } from '../../engine/cartoon/sets.js';

export default function story(E, tm) {
  const { THREE, P, add, tbox, box, group, mat, glow, lamp, actor, fxCard, alive, camKeys, EASE, clamp, lerp } = E;
  const { st, wd, total } = tm;
  const X = props(E);
  const TY = designY(TABLE_H);
  const ramp = (t, a, b) => clamp((t - a) / (b - a));
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g, t }; };

  // ================= AIRFIELD =================
  // apron (light concrete slabs), taxi line, grass beyond, a hangar, a windsock, low hills and poplars
  const slab = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#d8d3c6'; g.fillRect(0, 0, w, h); const r = P.rng(22);
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${90 + r() * 60},${88 + r() * 50},${80 + r() * 40},${0.05 + r() * 0.07})`; g.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3); }
    g.strokeStyle = 'rgba(70,64,56,.35)'; g.lineWidth = 3; g.strokeRect(1.5, 1.5, w - 3, h - 3); });
  slab.t.wrapS = slab.t.wrapT = THREE.RepeatWrapping; slab.t.repeat.set(8, 8);
  add(tbox(32, 0.1, 32, 1), mat({ map: slab.c, rep: [8, 8] }), 0, -0.05, -6, E.scene, { cast: false });
  add(tbox(140, 0.1, 140, 2), E.mat({ map: P.grass(61), rep: [30, 30] }), 0, -0.07, -6, E.scene, { cast: false });
  { const ln = add(new THREE.PlaneGeometry(0.16, 30), '#f2c230', 2.4, 0.004, -6, E.scene, { cast: false, noink: true }); ln.rotation.x = -Math.PI / 2; }
  { const ln = add(new THREE.PlaneGeometry(14, 0.16), '#f2c230', -4.5, 0.004, -10.5, E.scene, { cast: false, noink: true }); ln.rotation.x = -Math.PI / 2; }
  // hangar (back left): pale green corrugated walls, curved roof, open dark door
  const corr = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#b9cdb4'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(40,60,40,.18)'; g.fillRect(x, 0, 5, h); g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(x + 8, 0, 3, h); } });
  { const hg = group(-9.5, 0, -17, E.scene);
    add(tbox(12, 5, 9, 1), mat({ map: corr.c, rep: [6, 2] }), 0, 2.5, 0, hg);
    const rf = add(new THREE.CylinderGeometry(6.1, 6.1, 9.2, 28, 1, false, -Math.PI / 2, Math.PI), '#8a9a8a', 0, 5, 0, hg); rf.rotation.x = Math.PI / 2; rf.scale.y = 1; rf.scale.z = 0.35;
    add(box(7.5, 4.2, 0.05), '#2a2e33', 0.6, 2.1, 4.52, hg, { cast: false });
    add(box(12.2, 0.25, 0.3), '#e9e1cf', 0, 5.0, 4.55, hg, { cast: false }); }
  // small control hut + windsock (back right)
  { const hu = group(9, 0, -15, E.scene); add(tbox(3, 2.6, 3, 1), '#efe6d2', 0, 1.3, 0, hu); add(tbox(3.4, 0.2, 3.4, 1), '#c0573a', 0, 2.7, 0, hu);
    add(box(1.8, 0.7, 0.05), '#7fb8d8', 0, 1.7, 1.52, hu, { cast: false, noink: true }); }
  const sockPole = add(new THREE.CylinderGeometry(0.05, 0.06, 5, 8), '#e9e1cf', 6.2, 2.5, -10, E.scene);
  const sock = group(6.2, 4.9, -10, E.scene);
  for (let i = 0; i < 5; i++) { const s = add(new THREE.CylinderGeometry(0.32 - i * 0.04, 0.28 - i * 0.04, 0.42, 14, 1, true), i % 2 ? '#f4f1ea' : '#ff7a2a', 0.21 + i * 0.42, 0, 0, sock); s.rotation.z = Math.PI / 2; s.material.side = THREE.DoubleSide; }
  // horizon: hills, poplars, a farm
  for (const [hx, hz, r, sx, col] of [[-30, -60, 18, 2.6, '#9cba6a'], [20, -66, 22, 2.2, '#8fb05e'], [55, -58, 16, 2.0, '#a9c47a']]) { const h = add(new THREE.SphereGeometry(r, 24, 12), col, hx, -r * 0.62, hz, E.scene, { cast: false }); h.scale.set(sx, 1, 1); }
  const poplar = (x, z, s) => { const g = group(x, 0, z, E.scene); g.scale.setScalar(s); add(new THREE.CylinderGeometry(0.1, 0.14, 1.2, 8), '#6a4a2e', 0, 0.6, 0, g); const c = add(new THREE.SphereGeometry(0.8, 14, 10), '#4f8a3a', 0, 2.6, 0, g); c.scale.set(0.75, 2.0, 0.75); };
  for (let i = 0; i < 9; i++) poplar(-26 + i * 6.5 + (i % 3) * 0.8, -36 - (i % 2) * 3, 1.5 + (i % 3) * 0.25);
  { const fm = group(24, 0, -34, E.scene); add(tbox(5, 3, 4, 1), '#c0573a', 0, 1.5, 0, fm); const rf = add(new THREE.ConeGeometry(3.6, 1.6, 4), '#5a4a42', 0, 3.8, 0, fm); rf.rotation.y = Math.PI / 4; rf.scale.z = 0.8; }
  lamp(0, 6, 4, '#fff4dc', 1.2, 18, 'fill');

  // ================= THE PLANE (generic two-seat high-wing trainer; nose toward +z) =================
  const WHITE = '#f6f3ec', TEAL = '#1f8a8a', GLASSC = '#3d5f7a';
  const buildPlane = (parent, x, z, s, ry = 0, y0 = 0) => {
    const g = group(x, y0, z, parent); g.scale.setScalar(s); g.rotation.y = ry;
    const part = {}; const grp = (k) => (part[k] = part[k] || group(0, 0, 0, g));
    for (const sd of [-1, 1]) {
      const side = sd < 0 ? 'L' : 'R';
      const C = grp('cabin' + side), N = grp('nose' + side), W = grp('wing' + side), T = grp('tail');
      // cabin half
      add(tbox(0.55, 1.2, 2.1, 1), WHITE, sd * 0.275, 1.25, 0.55, C);
      add(box(0.56, 0.12, 2.12), TEAL, sd * 0.28, 0.98, 0.55, C, { cast: false });
      add(box(0.02, 0.42, 1.1), GLASSC, sd * 0.555, 1.5, 0.75, C, { cast: false, noink: true });
      add(box(0.012, 1.1, 2.0), '#4a4f58', sd * 0.012, 1.25, 0.55, C, { cast: false }); add(box(0.014, 0.5, 0.5), '#8a5a34', sd * 0.016, 1.0, 0.4, C, { cast: false });
      add(box(0.012, 0.74, 0.95), '#5a5f68', sd * 0.012, 1.12, 2.08, N, { cast: false });
      { const ws = add(box(0.5, 0.5, 0.03), GLASSC, sd * 0.26, 1.55, 1.62, C, { cast: false, noink: true }); ws.rotation.x = -0.45; }
      // main gear: leg + wheel + fairing
      { const leg = add(box(0.06, 0.62, 0.12), '#d8d3c6', sd * 0.82, 0.48, 0.25, C); leg.rotation.z = sd * 0.75; }
      { const wh = add(new THREE.CylinderGeometry(0.27, 0.27, 0.16, 18), '#2a2a30', sd * 1.12, 0.27, 0.25, C); wh.rotation.z = Math.PI / 2;
        const fr = add(new THREE.SphereGeometry(0.3, 14, 10), WHITE, sd * 1.12, 0.34, 0.28, C); fr.scale.set(0.42, 0.62, 1.15); }
      // strut
      { const a = new THREE.Vector3(sd * 0.55, 0.85, 0.6), b = new THREE.Vector3(sd * 2.5, 1.9, 0.6), m = b.clone().sub(a);
        const sr = add(box(0.06, m.length(), 0.1), '#e9e5da', (a.x + b.x) / 2, (a.y + b.y) / 2, 0.6, C); sr.rotation.z = -Math.atan2(m.x, m.y); }
      // nose half: cowling, one prop blade
      add(tbox(0.45, 0.82, 1.0, 1), WHITE, sd * 0.225, 1.12, 2.08, N);
      add(box(0.46, 0.1, 1.02), TEAL, sd * 0.23, 0.86, 2.08, N, { cast: false });
      { const bl = add(box(0.12, 0.85, 0.05), '#3a3a40', 0, 0, 0, N); bl.position.set(sd * 0.425 * Math.sin(0.38), 1.12 + sd * 0.425 * Math.cos(0.38), 2.78); bl.rotation.z = -0.38;
        const tip = add(box(0.122, 0.12, 0.052), '#f2c230', 0, 0, 0, N, { cast: false }); tip.position.set(sd * 0.79 * Math.sin(0.38), 1.12 + sd * 0.79 * Math.cos(0.38), 2.78); tip.rotation.z = -0.38; }
      // wing half (red-free: teal tip)
      add(tbox(4.9, 0.14, 1.4, 1), WHITE, sd * 2.55, 1.98, 0.5, W);
      add(tbox(0.4, 0.15, 1.42, 1), TEAL, sd * 4.82, 1.98, 0.5, W);
      // tail boom half + stabilizer half
      add(tbox(0.25, 0.62, 3.9, 1), WHITE, sd * 0.125, 1.38, -2.45, T);
      add(box(0.26, 0.08, 3.92), TEAL, sd * 0.13, 1.16, -2.45, T, { cast: false });
      add(tbox(1.5, 0.06, 0.75, 1), WHITE, sd * 0.85, 1.45, -4.05, T);
    }
    // fin, spinner, nose wheel
    add(tbox(0.08, 1.15, 0.95, 1), WHITE, 0, 2.2, -4.0, part.tail); add(tbox(0.09, 0.3, 0.6, 1), TEAL, 0, 2.6, -4.1, part.tail);
    { const sp = add(new THREE.ConeGeometry(0.17, 0.32, 16), '#e9e5da', 0, 1.12, 2.72, part.noseL); sp.rotation.x = Math.PI / 2; }
    { const nl = add(box(0.06, 0.55, 0.06), '#d8d3c6', 0, 0.45, 2.3, part.noseR); const nw = add(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16), '#2a2a30', 0, 0.2, 2.3, part.noseR); nw.rotation.z = Math.PI / 2; }
    return { g, part };
  };
  const PL = { x: 0.85, z: -4.3 };
  const plane = buildPlane(E.scene, PL.x, PL.z, 1);
  // the bitten left wingtip: hidden on the plane, served on the plate (shots 1-2)
  const tipOnPlane = plane.part.wingL.children[1];
  // wheel chocks stay when the plane is gone
  const chocks = [-1, 1].map((sd) => add(tbox(0.18, 0.14, 0.28, 1), '#f2c230', PL.x + sd * 1.12, 0.07, PL.z + 0.25 + 0.38, E.scene));

  // ================= THE TABLE =================
  const HERO = { x: -0.62, z: 0 };
  X.table(E.scene, HERO.x, HERO.z + 0.36, { w: 0.95, d: 0.72, cloth: '#3f7fb8' });
  X.chair(E.scene, HERO.x, HERO.z - 0.25, 0, '#8a5a34');
  const PLT = { x: HERO.x + 0.02, z: HERO.z + 0.5 };
  X.plate(E.scene, PLT.x, TABLE_H, PLT.z, null);
  X.cutlery(E.scene, PLT.x, TABLE_H, PLT.z);
  X.glass(E.scene, HERO.x + 0.34, TABLE_H, HERO.z + 0.32, '#dceef8');
  X.napkin(E.scene, HERO.x - 0.32, TABLE_H, HERO.z + 0.55, '#f4f1ea');
  // mineral oil bottle
  { const bg = group(HERO.x + 0.36, TABLE_H, HERO.z + 0.52, E.scene);
    add(new THREE.CylinderGeometry(0.04, 0.045, 0.16, 14), new THREE.MeshToonMaterial({ color: '#f0dc9a', transparent: true, opacity: 0.8 }), 0, 0.08, 0, bg, { noink: true });
    add(new THREE.CylinderGeometry(0.018, 0.02, 0.05, 10), '#f0dc9a', 0, 0.185, 0, bg, { noink: true }); add(new THREE.CylinderGeometry(0.021, 0.021, 0.025, 10), '#c0573a', 0, 0.22, 0, bg);
    add(box(0.07, 0.06, 0.002), '#fbf7ea', 0, 0.08, 0.044, bg, { cast: false }); }
  // metal bites on the plate (white/teal skin pieces + grey bolts)
  const bites = []; { const r = P.rng(150);
    for (let i = 0; i < 9; i++) { const m = add(box(0.035 + r() * 0.02, 0.012, 0.03 + r() * 0.02), i % 3 === 0 ? TEAL : (i % 3 === 1 ? '#e8e4da' : '#9aa0a8'), PLT.x + (r() - 0.5) * 0.14, TABLE_H + 0.026, PLT.z + (r() - 0.5) * 0.1, E.scene, { cast: false });
      m.rotation.y = r() * 3; bites.push(m); } }
  // the wingtip on the plate (shots 1-2): a teal-tipped wing chunk with a bite
  const tipChunk = group(PLT.x, TABLE_H + 0.03, PLT.z, E.scene);
  add(tbox(0.16, 0.025, 0.1, 1), WHITE, -0.03, 0, 0, tipChunk); add(tbox(0.07, 0.027, 0.102, 1), TEAL, 0.07, 0, 0, tipChunk);
  // toy plane on the table (shot 2)
  const toy = buildPlane(E.scene, HERO.x - 0.25, HERO.z + 0.26, 0.042, 0.55, TABLE_H + 0.005);
  // tabletop circular saw (shot 3): base, spinning blade, a strip of plane skin being cut
  const saw = group(HERO.x - 0.2, TABLE_H, HERO.z + 0.48, E.scene);
  add(tbox(0.24, 0.05, 0.18, 1), '#c0573a', 0, 0.025, 0, saw);
  const blade = add(new THREE.CylinderGeometry(0.075, 0.075, 0.006, 24), '#c9ccd2', 0, 0.07, 0, saw); blade.rotation.z = Math.PI / 2;
  const guard = add(new THREE.CylinderGeometry(0.085, 0.085, 0.03, 20, 1, false, 0, Math.PI), '#3a3a40', 0, 0.075, 0, saw); guard.rotation.z = Math.PI / 2;
  const strip = add(tbox(0.3, 0.008, 0.06, 1), WHITE, 0.12, 0.056, 0.0, saw); const stripT = add(box(0.3, 0.009, 0.015), TEAL, 0.12, 0.057, 0.0, saw, { cast: false });
  // the plaque (shots 6-7): brass, own text, no logo; two versions (whole / bitten)
  const plaqueTex = (bitten) => canvasTex(340, 240, (g, w, h) => {
    g.fillStyle = '#5a3a22'; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#f2d27a'); gr.addColorStop(0.5, '#c99a3a'); gr.addColorStop(1, '#f0cc6a');
    g.fillStyle = gr; g.fillRect(14, 14, w - 28, h - 28); g.strokeStyle = '#7a5a22'; g.lineWidth = 4; g.strokeRect(26, 26, w - 52, h - 52);
    g.fillStyle = '#3a2a12'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '900 34px Inter, Arial Black, Arial'; g.fillText('WORLD RECORD', w / 2, 82); g.font = '800 28px Inter, Arial'; g.fillText('STRANGEST DIET', w / 2, 128);
    g.font = '700 22px Inter, Arial'; g.fillText('M. LOTITO', w / 2, 172);
    if (bitten) { g.globalCompositeOperation = 'destination-out'; for (const [bx, by, br] of [[w - 10, 30, 46], [w - 62, 6, 34], [w - 4, 84, 30]]) { g.beginPath(); g.arc(bx, by, br, 0, 7); g.fill(); } g.globalCompositeOperation = 'source-over'; }
  });
  // the bitten one is a real cut-out shape (no transparent texture), so the ink follows the bite marks
  const plaqueGeo = (bitten) => { const sh = new THREE.Shape(); const W2 = 0.17, H2 = 0.12;
    sh.moveTo(-W2, -H2); sh.lineTo(W2, -H2);
    if (bitten) { // a tooth-scalloped bite out of the top-right corner
      const R0 = 0.13; sh.lineTo(W2, H2 - R0);
      for (let i = 1; i <= 48; i++) { const f = i / 48 * Math.PI / 2, th = -Math.PI / 2 - f, r = R0 - 0.016 * Math.abs(Math.sin(f * 12)); sh.lineTo(W2 + r * Math.cos(th), H2 + r * Math.sin(th)); } }
    else sh.lineTo(W2, H2);
    sh.lineTo(-W2, H2); sh.lineTo(-W2, -H2);
    const g = new THREE.ShapeGeometry(sh, 16); const uv = g.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, (uv.getX(k) + W2) / (2 * W2), (uv.getY(k) + H2) / (2 * H2)); return g; };
  const pqTx = plaqueTex(false);
  const pq = [false, true].map((b) => add(plaqueGeo(b), new THREE.MeshToonMaterial({ map: pqTx.t, side: THREE.DoubleSide }), 0, -10, 0, E.scene, { cast: false }));

  // ================= shots =================
  const S6 = wd(5, 4) - 0.1;
  const T = { s01: 0, s02: st(2), s03: wd(2, 3) - 0.12, s04: st(3), s05: st(4), s06: st(5), s07: S6, s08: st(6), s09: st(7) };
  const shots = Object.entries(T).map(([id, start]) => ({ id, start }));
  const shotAt = (t) => { let id = 's01'; for (const [k, v] of Object.entries(T)) if (t >= v) id = k; return id; };
  const aim = (tg, Wd, yaw = 0, pitch = 8, fov = 36) => { const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * 0.5625), d = Wd / (2 * Math.tan(hf / 2));
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { pos: [tg[0] + Math.sin(y) * Math.cos(p) * d, tg[1] + Math.sin(p) * d, tg[2] + Math.cos(y) * Math.cos(p) * d], look: [...tg], fov }; };
  const k = (t, tg, Wd, yaw, pitch, fov, o = {}) => ({ t, ...aim(tg, Wd, yaw, pitch, fov), ...o });
  const OPEN = (t, w = 3.2) => k(t, [-0.12, 1.28, -1.0], w, 5, -3, 56);
  const K = {
    s01: [OPEN(0, 3.25), OPEN(T.s02, 3.0)],
    s02: [k(T.s02, [HERO.x - 0.25, TABLE_H + 0.05, HERO.z + 0.27], 0.5, 52, 24, 40), k(T.s03, [HERO.x - 0.25, TABLE_H + 0.06, HERO.z + 0.27], 0.44, 54, 22, 40)],
    s03: [k(T.s03, [PL.x - 1.55, 1.75, PL.z + 1.6], 5.6, 31, -2, 60),
      k(wd(2, 5) + 0.1, [PL.x - 1.55, 1.75, PL.z + 1.6], 5.5, 31, -2, 60), k(T.s04, [PL.x - 1.55, 1.75, PL.z + 1.6], 5.45, 31, -2, 60)],
    s04: [k(T.s04, [HERO.x - 0.08, 0.88, HERO.z + 0.25], 1.25, -14, 9, 44), k(T.s05, [HERO.x - 0.04, 0.95, HERO.z + 0.2], 1.12, -10, 6, 44)],
    s05: [k(T.s05, [PL.x - 0.35, 1.3, PL.z + 1.2], 4.5, -10, 4, 50), k(T.s06, [PL.x - 0.35, 1.28, PL.z + 1.2], 4.2, -10, 4, 50)],
    s06: [k(T.s06, [HERO.x, 1.12, HERO.z], 1.0, 4, 2, 40), k(T.s07, [HERO.x, 1.12, HERO.z], 0.9, 2, 2, 40)],
    s07: [k(T.s07, [HERO.x + 0.62, 1.12, HERO.z + 0.1], 2.5, -16, 3, 46), k(T.s08, [HERO.x + 0.55, 1.12, HERO.z + 0.1], 2.3, -14, 3, 46)],
    s08: [k(T.s08, [HERO.x + 0.52, 1.2, HERO.z + 0.05], 2.0, 8, 2, 42), k(T.s09, [HERO.x + 0.5, 1.2, HERO.z + 0.05], 1.85, 7, 2, 42)],
    s09: [OPEN(T.s09, 2.8), OPEN(total - 0.02, 3.25)],
  };
  const shake = [{ t: wd(2, 5), a: 0.25 }, { t: wd(6, 1), a: 0.3 }];
  const cam = (t) => { const s = shotAt(t); return camKeys(K[s], t, { shake, hand: 0.004, creep: 0.02 }); };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const HEADP = [HERO.x, 1.11, HERO.z];
  const dof = (t) => { const s = shotAt(t), c = cam(t);
    if (s === 's02') return { focus: dist(c.pos, [HERO.x - 0.27, TABLE_H + 0.05, HERO.z + 0.28]), cinf: 4 };
    if (s === 's03') return { focus: dist(c.pos, [PL.x, 1.4, PL.z + 1]), cinf: 1.2 };
    if (s === 's05') return { focus: dist(c.pos, [PL.x, 1.3, PL.z + 1.5]), cinf: 1.0 };
    return { focus: dist(c.pos, HEADP), cinf: s === 's06' ? 3.5 : 2.2 }; };

  // ================= light =================
  const DAY = { sky: '#eaf3f6', ground: '#8a8a72', hemi: 1.18, sun: '#fff0d2', sunI: 1.75, az: 118, el: 50, fog: '#e2ecef', fogNear: 35, fogFar: 140, skyTop: '#5ea6e8', skyHor: '#eef4f2',
    sat: 1.08, vig: 0.2, card: '#fff8ee', gain: '#fff8ee', lift: '#050404', grain: 0, shadowExt: 12, lamps: { fill: 1 } };
  const HUSH = { ...DAY, vig: 0.42, sat: 0.98, gain: '#fff2e2', sunI: 1.5 };
  const light = (t) => { const s = shotAt(t);
    if (s === 's05') { const kk = ramp(t, T.s05, T.s06); return { ...DAY, az: 118 + 1080 * kk, el: 34 + 16 * Math.sin(kk * Math.PI * 6) }; }
    if (s === 's06') return HUSH; return DAY; };

  // ================= world animation =================
  // eaten: 0 = whole (minus the left wingtip), 1 = gone. Order: tail, left half, right half.
  const eatenAt = (t) => { const s = shotAt(t); if (s === 's01' || s === 's02' || s === 's03' || s === 's04') return 0; if (s === 's05') return EASE.smooth(ramp(t, T.s05 + 0.15, T.s06 - 0.2)); return 1; };
  const update = (t) => {
    const s = shotAt(t), e = eatenAt(t), pt = plane.part;
    tipOnPlane.visible = false;
    pt.tail.visible = e < 0.18; pt.wingL.visible = e < 0.32; pt.cabinL.visible = e < 0.42; pt.noseL.visible = e < 0.46;
    pt.wingR.visible = e < 0.66; pt.cabinR.visible = e < 0.8; pt.noseR.visible = e < 0.9;
    tipChunk.visible = s === 's01' || s === 's02' || s === 's03';
    for (const m of bites) m.visible = s === 's04' || s === 's05';
    toy.g.visible = s === 's02' || s === 's03';
    saw.visible = s === 's04';
    blade.rotation.x = t * 40; strip.position.x = 0.12 - 0.06 * ramp(t, T.s04, wd(3, 4)); stripT.position.x = strip.position.x;
    sock.rotation.y = 0.35 + 0.08 * Math.sin(t * 1.7); sock.rotation.z = -0.1 + 0.05 * Math.sin(t * 2.3);
    for (const m of pq) m.position.set(0, -10, 0);
    for (const c of chocks) c.visible = !(s === 's07' || s === 's08');
  };

  // ================= cast =================
  const LK = {
    eater: { skin: '#eab48c', hair: '#2a1c16', style: 'curly', moustache: true, top: '#e8b33a', topKind: 'shirt', bow: '#1f8a8a', pants: '#34425e', shoes: '#3a2a22' },
    judge: { skin: '#7d5236', hair: '#1e1512', style: 'bun', top: '#2f4f7a', topKind: 'cardigan', pants: '#2a2e3a', shoes: '#1d1b22', glasses: '#2a2430' },
  };
  const OFF = { z: HERO.z + 0.05 }; const PQY = 0.97;
  const actors = (t) => {
    const s = shotAt(t), A = [];
    let hp = { mode: 'sit', tableY: TY, expr: 'grin', L: 'table', R: 'fork', k: 0.1 + 0.15 * Math.sin(t * 3), look: 0.2, facing: 0 };
    if (s === 's01') hp = { mode: 'sit', tableY: TY, expr: t < 1.0 ? 'chew' : 'grin', L: 'table', R: 'fork', k: t < 1.0 ? 0.42 : 0.42 - 0.25 * EASE.smooth(ramp(t, 1.0, 1.5)), look: 0.3, facing: 0 };
    if (s === 's02' || s === 's03') hp = s === 's02' ? { mode: 'sit', tableY: TY, expr: 'smug', L: 'table', R: 'table', look: -0.6, facing: 0 }
      : { mode: 'sit', tableY: TY, expr: 'grin', L: 'table', R: 'point', look: 0.9, facing: 1 };
    if (s === 's04') { const sw = t < wd(3, 4) - 0.05;
      hp = sw ? { mode: 'sit', tableY: TY, expr: 'think', L: 'table', R: 'table', look: -0.7, facing: 0, headTilt: 4 }
        : { mode: 'sit', tableY: TY, expr: t > wd(3, 5) + 0.15 ? 'chew' : 'grin', L: 'hold', R: 'fork', k: 0.5 * EASE.smooth(ramp(t, wd(3, 4), wd(3, 5) + 0.15)), hold: { L: 'glass' }, look: 0, facing: 0 }; }
    if (s === 's05') hp = { mode: 'sit', tableY: TY, expr: 'chew', L: 'table', R: 'fork', k: (t * 2.2) % 1, look: 0, facing: 0 };
    if (s === 's06') hp = { mode: 'sit', tableY: TY, expr: 'whisper', L: 'table', R: 'wave', k: t, look: 0, facing: 0 };
    if (s === 's07') hp = { mode: 'sit', tableY: TY, expr: t > wd(5, 8) ? 'happy' : 'gasp', L: t > wd(5, 8) ? 'cheek' : 'table', R: t > wd(5, 8) ? 'cheek' : 'table', look: 0.9, facing: 1, headTilt: 0 };
    if (s === 's08') hp = { mode: 'sit', tableY: TY, expr: t > wd(6, 1) - 0.05 ? 'chew' : 'grin', L: 'hold', R: 'hold', look: 0.6, facing: 1 };
    if (s === 's09') hp = { mode: 'sit', tableY: TY, expr: t > wd(7, 3) ? 'sideeye' : 'smug', L: 'cross', R: 'cross', look: t > wd(7, 3) ? -0.8 : 0.3, facing: 0 };
    A.push(actor({ id: 'eater', look: LK.eater, seed: 7, x: HERO.x, y: 0, z: HERO.z, main: true, pose: alive(t, 7, hp) }));
    if (s === 's04' && t < wd(3, 4)) A.push(fxCard({ id: 'spk', kind: 'sparkle', args: [t * 3], x: HERO.x - 0.2, y: TABLE_H + 0.12, z: HERO.z + 0.6, s: 0.06 }));
    // the record keeper
    if (s === 's07' || s === 's08') {
      const walkK = s === 's07' ? EASE.easeOut(ramp(t, T.s07, wd(5, 6))) : 1, ox = lerp(HERO.x + 2.6, HERO.x + 0.82, walkK);
      const jp = s === 's07' ? { mode: walkK < 1 ? 'walk' : 'stand', step: t * 2.6, expr: 'smile', L: 'hold', R: 'hold', facing: -1, look: -0.8 }
        : { mode: 'stand', expr: t > wd(6, 1) - 0.05 ? 'shock' : 'smile', L: t > wd(6, 1) - 0.05 ? 'cheek' : 'hang', R: t > wd(6, 1) - 0.05 ? 'cheek' : 'hang', facing: -1, look: -0.9 };
      A.push(actor({ id: 'judge', look: LK.judge, seed: 19, x: ox, y: 0, z: OFF.z, pose: alive(t, 19, jp) }));
      // plaque: in her hand while she walks in, handed over on "plaque", at his mouth in shot 7
      const c = cam(t).pos;
      let pp, which = 0;
      if (s === 's07') { const hand = ramp(t, wd(5, 8) - 0.2, wd(5, 9) + 0.1); pp = [ox - 0.02, PQY, OFF.z + 0.14]; }
      else { const up = EASE.smooth(ramp(t, T.s08, wd(6, 1) - 0.05)); pp = [HERO.x + 0.02, 0.87, HERO.z + 0.2]; which = t > wd(6, 1) - 0.02 ? 1 : 0; }
      const m = pq[which]; m.position.set(...pp); m.lookAt(c[0], pp[1], c[2]);
    }
    if (s === 's09' && t > wd(7, 3)) A.push(fxCard({ id: 'q', kind: 'question', args: [t], x: HERO.x + 0.42, y: 1.62, z: HERO.z, s: 0.16 }));
    return A;
  };

  // ================= text =================
  const M_ = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B_ = (a, cls = '', fs = 230) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const ui = (t) => {
    const s = shotAt(t), o = { capY: 1480, exterior: true };
    if (s === 's01') { o.title = M_('HE ATE A') + M_('WHOLE AIRPLANE', 'y'); o.titleK = 1; o.capY = 1500; }
    if (s === 's02') o.capY = 1500;
    if (s === 's03') { o.capY = 1500; o.title = M_('A REAL') + M_('CESSNA', 'y'); o.titleK = (t - T.s03) / 0.3; }
    if (s === 's04') o.capY = 1500;
    if (s === 's05') { const yr = 1978 + Math.min(2, Math.floor(3 * ramp(t, T.s05 + 0.1, T.s06 - 0.25))); o.title = B_(String(yr), 'y', 230); o.titleK = (t - T.s05) / 0.3; o.capY = 1500; }
    if (s === 's06') { o.capY = 1530; if (t > wd(5, 1) - 0.1) { o.title = M_("DON'T TRY", 'r') + M_('THIS', 'r'); o.titleK = (t - wd(5, 1) + 0.1) / 0.3; } }
    if (s === 's07') o.capY = 1500;
    if (s === 's08') o.capY = 1500;
    if (s === 's09') { o.capY = 1500; if (t > wd(7, 3) - 0.1) { o.title = M_('NEVER') + M_('VERIFIED', 'y'); o.titleK = (t - wd(7, 3) + 0.1) / 0.3; } }
    return o;
  };
  const KEY = ['airplane', 'toy', 'cessna', 'sawed', 'swallowed', 'pieces', 'two', 'years', "don't", 'guinness', 'brass', 'plaque', 'too', 'nobody', 'verified', 'bite'];
  return { shots, cam, dof, light, update, actors, ui, KEY };
}
