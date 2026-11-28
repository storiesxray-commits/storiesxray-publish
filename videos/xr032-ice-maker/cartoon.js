// xr032-ice-maker (USELESS FACTS, chain, survives): a fridge ice maker makes ~4 lb of ice a day (GE Appliances; Whirlpool
// cube test 100-140 cubes/day). Nobody uses it, nobody told it the bin is full (real ones stop when full: that's the joke).
// One year later ~1,400 lb behind the little freezer door. Tuesday night he opens it for peas: avalanche, he survives frozen
// to the kitchen floor until April. The peas are fine.
// One place: a retro American kitchen at night (butter walls, avocado top-freezer fridge, orange counter, blue/cream floor).
// X-ray (cutaway) shots show the inside of the freezer. Cartoon only: nobody is hurt (he blinks inside an ice block).
// Times come from the real ElevenLabs narration: st(i) = sentence i start, wd(i, j) = word j (0-based) of sentence i.
import { props, room } from '../../engine/cartoon/sets.js';

export default function story(E, tm) {
  const { THREE, P, add, tbox, box, group, mat, glow, lamp, actor, fxCard, alive, camKeys, EASE, clamp, lerp } = E;
  const { st, wd, we, total } = tm;
  const X = props(E);
  const ramp = (t, a, b) => clamp((t - a) / (b - a));
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g, t }; };
  const cyl = (r0, r1, h, n = 20) => new THREE.CylinderGeometry(r0, r1, h, n);
  const sph = (r, a = 22, b = 16) => new THREE.SphereGeometry(r, a, b);
  const R = P.rng(3201);

  // ================= KITCHEN =================
  const RH = 2.7, BW = -3.0;
  room(E, E.scene, 0, 0, { w: 7, d: 6, h: RH, floor: mat({ map: P.checker(3202, '#f1e8d2', '#3f6e8c', 4), rep: [3, 2.6] }),
    wallTop: mat({ map: P.wallpaper(3203, '#f2d16b', '#f5da82', 'rgba(255,255,255,.22)'), rep: [5, 2] }), wainH: 0, ceil: '#f4ecd8' });
  // base cabinets + orange counter along the back wall, right of the fridge
  const CAB = '#f3ead6', TOP = '#e3693f';
  add(tbox(3.9, 0.88, 0.6, 1), CAB, 0.85, 0.44, BW + 0.36, E.scene);
  add(tbox(3.96, 0.05, 0.66, 1), TOP, 0.85, 0.905, BW + 0.38, E.scene);
  add(tbox(3.9, 0.08, 0.56, 1), '#3a2c26', 0.85, 0.04, BW + 0.33, E.scene, { cast: false }); // toe kick
  for (let i = 0; i < 6; i++) { const x = -0.82 + i * 0.66; add(box(0.6, 0.66, 0.01), '#efe3c8', x, 0.48, BW + 0.665, E.scene, { cast: false }); add(tbox(0.12, 0.025, 0.03, 1), '#c9ccd2', x, 0.72, BW + 0.68, E.scene); }
  // sink + faucet under the window
  add(tbox(0.62, 0.012, 0.42, 1), '#aeb8bf', 0.75, 0.932, BW + 0.38, E.scene, { cast: false });
  { const f = group(0.75, 0.93, BW + 0.16, E.scene); add(cyl(0.025, 0.03, 0.3, 12), '#c9ccd2', 0, 0.15, 0, f); const sp = add(cyl(0.02, 0.02, 0.22, 10), '#c9ccd2', 0, 0.3, 0.1, f); sp.rotation.x = Math.PI / 2; }
  // window over the sink: night snow, later spring
  const snowC = canvasTex(400, 320, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#16224a'); gr.addColorStop(1, '#3a4f86'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#e8f0ff'; g.fillRect(0, h * 0.74, w, h); g.fillStyle = '#26315a'; g.beginPath(); g.moveTo(40, h * 0.74); g.lineTo(150, h * 0.5); g.lineTo(260, h * 0.74); g.fill();
    g.fillStyle = '#ffd98a'; g.fillRect(120, h * 0.6, 22, 18); g.fillStyle = '#f4f8ff'; g.beginPath(); g.moveTo(30, h * 0.5); g.lineTo(150, h * 0.4); g.lineTo(270, h * 0.5); g.lineTo(150, h * 0.46); g.fill();
    const r = P.rng(3204); for (let i = 0; i < 70; i++) { g.beginPath(); g.arc(r() * w, r() * h * 0.8, 2 + r() * 3, 0, 7); g.fill(); } });
  const springC = canvasTex(400, 320, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6cc0f2'); gr.addColorStop(1, '#cdeefc'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7cc45a'; g.fillRect(0, h * 0.74, w, h); g.fillStyle = '#ffe36b'; g.beginPath(); g.arc(320, 60, 34, 0, 7); g.fill();
    g.fillStyle = '#6a4a32'; g.fillRect(84, h * 0.4, 16, h * 0.36); const r = P.rng(3205);
    for (let i = 0; i < 26; i++) { g.fillStyle = i % 3 ? '#ffb7d0' : '#ffffff'; g.beginPath(); g.arc(92 + (r() - 0.5) * 140, h * 0.36 + (r() - 0.5) * 90, 14 + r() * 10, 0, 7); g.fill(); }
    for (let i = 0; i < 18; i++) { g.fillStyle = ['#ff5a5a', '#ffd23f', '#ffffff'][i % 3]; g.beginPath(); g.arc(r() * w, h * 0.8 + r() * h * 0.18, 5, 0, 7); g.fill(); } });
  const WIN = X.window(E.scene, 0.75, 1.62, BW + 0.04, 0, 1.0, 0.8, snowC.c);
  const spring = add(new THREE.PlaneGeometry(1.0, 0.8), new THREE.MeshBasicMaterial({ map: springC.t, fog: false }), 0, 0, -0.012, WIN, { cast: false, receive: false, noink: true });
  const winLight = lamp(0.75, 1.6, BW + 0.8, '#bcd0ff', 0.8, 4, 'window');
  // shelf with jars, wall clock, wall calendar (month flips)
  add(tbox(0.9, 0.04, 0.22, 1), '#8a5a34', 2.05, 1.5, BW + 0.13, E.scene);
  for (let i = 0; i < 4; i++) add(cyl(0.06, 0.06, 0.16 + (i % 2) * 0.05, 14), ['#e88a3a', '#6fae4a', '#c0476a', '#f2e6c8'][i], 1.75 + i * 0.2, 1.6 + (i % 2) * 0.025, BW + 0.13, E.scene);
  const clock = X.wallClock(E.scene, 2.05, 2.05, BW + 0.04, 0, 0.2);
  const MONTHS = ['NOV', 'DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT'];
  const calC = canvasTex(256, 330, () => {});
  let calKey = '';
  const drawCal = (m) => { if (m === calKey) return; calKey = m; const g = calC.g; g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, 256, 330); g.fillStyle = '#3f6e8c'; g.fillRect(0, 0, 256, 96);
    g.fillStyle = '#fff'; g.font = '900 76px Inter, Arial Black'; g.textAlign = 'center'; g.fillText(m, 128, 76); g.fillStyle = '#2a1c16'; g.font = '600 22px Inter, Arial';
    for (let i = 0; i < 30; i++) g.fillText(String(i + 1), 32 + (i % 7) * 32, 140 + Math.floor(i / 7) * 38); g.strokeStyle = '#e3693f'; g.lineWidth = 4; g.beginPath(); g.arc(32 + 2 * 32, 133 + 3 * 38, 16, 0, 7); g.stroke();
    calC.t.needsUpdate = true; };
  drawCal('NOV');
  const cal = add(box(0.34, 0.44, 0.012), new THREE.MeshBasicMaterial({ map: calC.t }), -0.02, 1.72, BW + 0.07, E.scene, { cast: false, noink: true });
  add(box(0.36, 0.46, 0.008), '#2a1c16', -0.02, 1.72, BW + 0.062, E.scene, { cast: false });
  // flush ceiling light + a rug
  add(cyl(0.28, 0.32, 0.06, 28), glow('#fff4d6', 1.3), 0, RH - 0.03, -1.2, E.scene, { noink: true, cast: false });
  lamp(0, 2.3, -1.2, '#ffe2b0', 1.6, 8, 'kitchen'); lamp(-1.0, 2.2, 0.8, '#ffe2b0', 0.8, 7, 'kitchen');
  add(cyl(0.7, 0.7, 0.01, 30), '#c0476a', 0.9, 0.006, 0.2, E.scene, { cast: false }).scale.set(1.4, 1, 0.8);
  X.plant(E.scene, 3.0, BW + 0.4, 0.9);
  // floor crack decal under the fridge (appears when it gets heavy)
  const crackC = canvasTex(400, 200, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = '#1d1b22'; g.lineWidth = 6; g.lineJoin = 'round';
    for (const [x0, a] of [[120, -0.4], [200, 0.1], [290, 0.5]]) { g.beginPath(); let x = x0, y = 4; g.moveTo(x, y); for (let i = 0; i < 6; i++) { x += Math.sin(a + i * 1.3) * 22; y += 30; g.lineTo(x, y); } g.stroke(); } });
  const crack = add(new THREE.PlaneGeometry(1.2, 0.6), new THREE.MeshBasicMaterial({ map: crackC.t, transparent: true, depthWrite: false }), -1.6, 0.012, -1.84, E.scene, { cast: false, receive: false, ndSkip: true });
  crack.rotation.x = -Math.PI / 2;

  // ================= THE FRIDGE (avocado top-freezer; group origin = front bottom centre) =================
  const FX = -1.6, FZ = -2.14, FW = 0.84, FH = 1.74, FD = 0.78, DIV = 1.24;
  const AVO = '#8b9a3c', LINER = '#eef4f6', CHROME = '#d9dde2';
  const F = group(FX, 0, FZ, E.scene);
  add(tbox(0.05, FH, FD, 1), AVO, -FW / 2 + 0.025, FH / 2, -FD / 2, F); add(tbox(0.05, FH, FD, 1), AVO, FW / 2 - 0.025, FH / 2, -FD / 2, F);
  add(tbox(FW, 0.05, FD, 1), AVO, 0, FH - 0.025, -FD / 2, F); add(tbox(FW, FH, 0.04, 1), AVO, 0, FH / 2, -FD + 0.02, F);
  add(tbox(FW, 0.06, FD, 1), AVO, 0, DIV, -FD / 2, F); add(tbox(FW - 0.04, 0.08, FD - 0.06, 1), '#3a2c26', 0, 0.04, -FD / 2, F);
  // freezer liner (seen in the x-ray shots)
  add(box(FW - 0.1, FH - DIV - 0.08, 0.01), LINER, 0, (FH + DIV) / 2, -FD + 0.05, F, { cast: false });
  add(box(FW - 0.1, 0.01, FD - 0.06), LINER, 0, DIV + 0.035, -FD / 2, F, { cast: false });
  add(box(FW - 0.1, 0.01, FD - 0.06), LINER, 0, FH - 0.055, -FD / 2, F, { cast: false });
  for (const s of [-1, 1]) add(box(0.01, FH - DIV - 0.08, FD - 0.06), LINER, s * (FW / 2 - 0.055), (FH + DIV) / 2, -FD / 2, F, { cast: false });
  // the ice maker (top-left back) with its tray, feeler arm and a cheerful green light
  const IM = group(-0.12, 1.6, -0.62, F);
  add(tbox(0.36, 0.09, 0.18, 1), '#d9dde2', 0, 0, 0, IM); add(tbox(0.33, 0.035, 0.12, 1), '#b9c0c8', 0, -0.06, 0.02, IM);
  const imLed = add(sph(0.012, 10, 8), glow('#4dff88', 1.6), 0.13, 0.01, 0.095, IM, { noink: true, cast: false });
  const arm = group(0.18, -0.03, 0.06, IM); add(box(0.012, 0.012, 0.16), '#8a929a', 0.08, 0, 0, arm).rotation.y = Math.PI / 2;
  // the bin
  const BIN = { x: 0.04, z: -0.33, y: DIV + 0.04, w: 0.42 };
  add(box(BIN.w, 0.01, BIN.w), '#f7fbfc', BIN.x, BIN.y, BIN.z, F, { cast: false });
  add(box(BIN.w, 0.14, 0.012), '#f7fbfc', BIN.x, BIN.y + 0.07, BIN.z - BIN.w / 2, F); add(box(BIN.w, 0.08, 0.012), '#f7fbfc', BIN.x, BIN.y + 0.04, BIN.z + BIN.w / 2, F);
  for (const s of [-1, 1]) add(box(0.012, 0.14, BIN.w), '#f7fbfc', BIN.x + s * BIN.w / 2, BIN.y + 0.07, BIN.z, F);
  const fridgeLamp = lamp(FX, 1.58, FZ - 0.14, '#d4f2ff', 1.3, 2.2, 'fridge');
  // doors
  const lowDoor = group(0, 0, 0, F); add(tbox(FW, 1.12, 0.06, 1), AVO, 0, 0.08 + 0.56, 0.03, lowDoor); add(tbox(0.035, 0.42, 0.045, 1), CHROME, FW / 2 - 0.08, 0.98, 0.08, lowDoor);
  add(box(FW - 0.08, 0.02, 0.005), '#6f7c2c', 0, 1.18, 0.062, lowDoor, { cast: false });
  const fzPivot = group(-FW / 2, DIV + 0.01, 0, F), fzDoor = group(FW / 2, 0, 0, fzPivot);
  add(tbox(FW, 0.48, 0.06, 1), AVO, 0, 0.245, 0.03, fzDoor); add(tbox(0.035, 0.2, 0.045, 1), CHROME, FW / 2 - 0.08, 0.13, 0.08, fzDoor);
  const bulge = add(sph(1, 26, 14), AVO, 0, 0.245, 0.055, fzDoor); bulge.scale.set(FW * 0.44, 0.2, 0.001);
  // frost patches + a magnet
  const frost = []; for (const [x, y, z, w, h] of [[-0.24, 1.745, -0.1, 0.16, 0.035], [0.2, 1.745, -0.3, 0.2, 0.04], [0.0, 1.745, -0.5, 0.14, 0.03], [-0.3, 1.745, -0.45, 0.12, 0.03]]) {
    const m = add(sph(1, 16, 10), '#eef8ff', x, y, z, F, { cast: false }); m.scale.set(w, h, w * 0.8); m.visible = false; frost.push(m); }
  add(cyl(0.035, 0.035, 0.012, 14), '#e3693f', 0.2, 0.32, 0.068, fzDoor).rotation.x = Math.PI / 2;

  // ================= ICE =================
  const ICE = mat('#e8f8ff', { emissive: '#3a7aa2' }), ICE2 = mat('#cfeeff', { emissive: '#336f96' });
  // (a) cubes in the freezer: bin layers, heap, then overflow up to the ceiling (front two rows)
  const CS = 0.062, fCubes = [];
  for (let ly = 0; ly < 2; ly++) for (let ix = 0; ix < 6; ix++) for (let iz = 0; iz < 6; iz++) fCubes.push([BIN.x - 0.155 + ix * 0.062, BIN.y + 0.036 + ly * CS, BIN.z - 0.155 + iz * 0.062]);
  for (let ix = 0; ix < 4; ix++) for (let iz = 0; iz < 4; iz++) fCubes.push([BIN.x - 0.093 + ix * 0.062, BIN.y + 0.036 + 2 * CS, BIN.z - 0.093 + iz * 0.062]);
  for (let ix = 0; ix < 2; ix++) for (let iz = 0; iz < 2; iz++) fCubes.push([BIN.x - 0.031 + ix * 0.062, BIN.y + 0.036 + 3 * CS, BIN.z - 0.031 + iz * 0.062]);
  const N_BIN = fCubes.length;
  for (let ly = 0; ly < 6; ly++) for (let ix = 0; ix < 11; ix++) for (let iz = 0; iz < 3; iz++) { const p = [-0.31 + ix * 0.062, DIV + 0.07 + ly * 0.064, -0.06 - iz * 0.07];
    if (ly < 3 && Math.abs(p[0] - BIN.x) < 0.24 && p[2] < -0.1) continue; fCubes.push(p); }
  const N_ALL = fCubes.length;
  const fMesh = fCubes.map((p, i) => { const m = add(box(CS * 0.92, CS * 0.86, CS * 0.92), i % 3 ? ICE : ICE2, p[0], p[1], p[2], F); m.rotation.set((R() - 0.5) * 0.4, R() * 1.2, (R() - 0.5) * 0.4); m.visible = false; return m; });
  const drop = add(box(CS * 0.92, CS * 0.86, CS * 0.92), ICE, 0, -5, 0, F);
  // (b) the cubes that pop out of the door seam in the hook
  const pop = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => ({ m: add(box(0.1, 0.09, 0.1), i % 2 ? ICE : ICE2, 0, -5, 0, E.scene), x0: FX + FW / 2 + 0.02, y0: DIV + 0.1 + (i % 4) * 0.09, t0: -0.3 + i * 0.25, vx: 0.25 + R() * 0.5, vz: 0.35 + R() * 0.5 }));
  // (c) the avalanche: cubes fly out of the freezer and settle on a mound around him
  const HERO = { x: -0.45, z: -1.62 }, MC = { x: -1.32, z: -1.4, rx: 1.35, rz: 1.05, h: 0.72 };
  const mound = add(sph(1, 30, 16), mat('#d6f1ff', { emissive: '#1d4d6a' }), MC.x, 0, MC.z, E.scene); mound.visible = false;
  const surfY = (x, z) => { const u = Math.hypot((x - MC.x) / MC.rx, (z - MC.z) / MC.rz); return u >= 1 ? 0.03 : MC.h * Math.sqrt(1 - u * u); };
  const AV = [];
  for (let i = 0; i < 260; i++) { let x, z, tries = 0;
    if (i >= 230) { x = MC.x + (R() - 0.3) * 2.4; z = -0.55 + R() * 0.8; } else do { const a = R() * Math.PI * 2, u = Math.sqrt(R()) * 1.08; x = MC.x + Math.cos(a) * u * MC.rx; z = MC.z + Math.sin(a) * u * MC.rz; tries++; }
    while (i < 230 && (z < FZ + 0.08 || Math.hypot(x + 0.52, z + 1.18) < 0.27 || (Math.abs(x - HERO.x) < 0.5 && Math.abs(z - HERO.z) < 0.32)) && tries < 40);
    const s = 0.075 + R() * 0.04, y = surfY(x, z) + s * 0.3;
    AV.push({ m: add(box(s, s * 0.9, s), i % 3 ? ICE : ICE2, 0, -5, 0, E.scene), sx: FX + (R() - 0.5) * 0.6, sy: DIV + 0.1 + R() * 0.35, sz: FZ + 0.1, ex: x, ey: y, ez: z,
      d0: R() * 0.75, dur: 0.38 + R() * 0.3, arc: 0.3 + R() * 0.6, rx: R() * 6, ry: R() * 6 }); }
  // (d) the ice block he ends up in (glassy box + edges + glints)
  const BLK = { w: 0.98, h: 2.26, d: 0.62 };
  const block = group(HERO.x, 0, HERO.z, E.scene);
  const frostC = canvasTex(256, 512, (g, w, h) => { g.clearRect(0, 0, w, h); const r = P.rng(3210); g.fillStyle = 'rgba(200,238,255,0.55)'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(255,255,255,${0.35 + r() * 0.4})`; g.lineWidth = 2 + r() * 4; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 70; y += (r() - 0.5) * 70; g.lineTo(x, y); } g.stroke(); }
    const e = g.createLinearGradient(0, 0, w, 0); e.addColorStop(0, 'rgba(255,255,255,.55)'); e.addColorStop(0.18, 'rgba(255,255,255,0)'); e.addColorStop(0.82, 'rgba(255,255,255,0)'); e.addColorStop(1, 'rgba(255,255,255,.55)'); g.fillStyle = e; g.fillRect(0, 0, w, h);
    const b = g.createLinearGradient(0, 0, 0, h); b.addColorStop(0, 'rgba(255,255,255,.5)'); b.addColorStop(0.12, 'rgba(255,255,255,0)'); b.addColorStop(0.85, 'rgba(255,255,255,0)'); b.addColorStop(1, 'rgba(230,248,255,.7)'); g.fillStyle = b; g.fillRect(0, 0, w, h); });
  add(box(BLK.w, BLK.h, BLK.d), new THREE.MeshBasicMaterial({ map: frostC.t, transparent: true, depthWrite: false, color: '#ffffff' }), 0, BLK.h / 2, 0, block, { noink: true, cast: false, ndSkip: true });
  for (let i = 0; i < 6; i++) { const c = add(sph(1, 14, 10), mat('#eefaff', { emissive: '#2a6080' }), -0.4 + i * 0.16, BLK.h + 0.01, (i % 2 ? 0.12 : -0.1), block, { cast: false }); c.scale.set(0.11, 0.05 + (i % 3) * 0.025, 0.12); }
  for (let i = 0; i < 5; i++) { const ic = add(new THREE.ConeGeometry(0.03, 0.12 + (i % 3) * 0.05, 8), mat('#eefaff', { emissive: '#2a6080' }), -0.38 + i * 0.19, BLK.h - 0.08 - (i % 3) * 0.025, BLK.d / 2 + 0.01, block, { cast: false }); ic.rotation.x = Math.PI; }
  const dripM = add(sph(0.025, 10, 8), mat('#9fdcff', { emissive: '#2a6a90' }), 0.3, 0.3, BLK.d / 2 + 0.03, block, { cast: false });
  for (const [sx, sz] of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) add(box(0.025, BLK.h, 0.025), '#e8f8ff', sx * BLK.w / 2, BLK.h / 2, sz * BLK.d / 2, block, { cast: false });
  for (const sy of [0.02, BLK.h]) for (const sz of [-1, 1]) add(box(BLK.w, 0.025, 0.025), '#e8f8ff', 0, sy, sz * BLK.d / 2, block, { cast: false });
  for (const sy of [0.02, BLK.h]) for (const sx of [-1, 1]) add(box(0.025, 0.025, BLK.d), '#e8f8ff', sx * BLK.w / 2, sy, 0, block, { cast: false });
  for (const [x, y, r] of [[-0.38, 0.95, 0.6], [0.4, 1.3, 0.6]]) { const g = add(box(0.04, 0.22, 0.004), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 }), x, y, BLK.d / 2 + 0.006, block, { cast: false, noink: true, ndSkip: true }); g.rotation.z = r; }
  block.visible = false;
  // (e) the bag of peas (survives perfectly), resting on the ice in front of the block
  const peasC = canvasTex(256, 320, (g, w, h) => { g.fillStyle = '#3f9a3a'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(w / 2, 120, 104, 62, 0, 0, 7); g.fill();
    g.fillStyle = '#2f7a2a'; g.font = '900 78px Inter, Arial Black'; g.textAlign = 'center'; g.fillText('PEAS', w / 2, 146);
    for (let i = 0; i < 9; i++) { g.fillStyle = '#8fd45a'; g.beginPath(); g.arc(46 + (i % 5) * 42, 232 + Math.floor(i / 5) * 44, 17, 0, 7); g.fill(); g.strokeStyle = '#2f6a2a'; g.lineWidth = 4; g.stroke(); } });
  const PEAS = { x: -0.52, z: -1.18 };
  const peas = group(PEAS.x, surfY(PEAS.x, PEAS.z) + 0.03, PEAS.z, E.scene);
  const pb = add(sph(1, 24, 14), '#3f9a3a', 0, 0, 0, peas); pb.scale.set(0.19, 0.05, 0.24);
  const pl = add(new THREE.PlaneGeometry(0.3, 0.38), new THREE.MeshBasicMaterial({ map: peasC.t, transparent: false }), 0, 0.052, 0, peas, { cast: false, noink: true }); pl.rotation.x = -Math.PI / 2;
  peas.rotation.set(0.85, 0.25, -0.1); peas.visible = false;

  // ================= shots =================
  const T = { s01: 0, s02: st(2) - 0.1, s03: st(3) - 0.12, s04: st(4) - 0.12, s05: st(5) - 0.12, s06: st(6) - 0.12, s07: st(7) - 0.1, s08: st(8) - 0.1,
    s09: we(8, 7) + 0.02, s10: st(10) - 0.1, s11: we(10, 6) + 0.35 };
  const shots = Object.entries(T).map(([id, start]) => ({ id, start }));
  const shotAt = (t) => { let id = 's01'; for (const [k, v] of Object.entries(T)) if (t >= v) id = k; return id; };
  const aim = (tg, Wd, yaw = 0, pitch = 8, fov = 36) => { const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * 0.5625), d = Wd / (2 * Math.tan(hf / 2));
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { pos: [tg[0] + Math.sin(y) * Math.cos(p) * d, tg[1] + Math.sin(p) * d, tg[2] + Math.cos(y) * Math.cos(p) * d], look: [...tg], fov }; };
  const k = (t, tg, Wd, yaw, pitch, fov, o = {}) => ({ t, ...aim(tg, Wd, yaw, pitch, fov), ...o });
  const OPEN = wd(8, 3), BURST = T.s09 + 0.05, ENCASE = wd(9, 1) - 0.12, APRIL = wd(10, 6) - 0.05;
  const K = {
    s01: [k(0, [FX, 1.4, FZ + 0.05], 1.55, 16, -8, 46), k(T.s02, [FX, 1.42, FZ + 0.05], 1.3, 8, -6, 46)],
    s02: [k(T.s02, [FX + 0.02, 1.47, FZ - 0.3], 1.0, -4, 5, 40), k(T.s03, [FX + 0.02, 1.46, FZ - 0.3], 0.9, 2, 5, 40)],
    s03: [k(T.s03, [-0.35, 1.3, -1.5], 2.7, -14, 5, 48), k(T.s04, [-0.3, 1.35, -1.5], 2.45, -10, 5, 48)],
    s04: [k(T.s04, [FX + 0.04, 1.4, FZ - 0.36], 0.72, -10, 16, 40), k(T.s05, [FX + 0.04, 1.4, FZ - 0.36], 0.64, -6, 16, 40)],
    s05: [k(T.s05, [FX, 1.48, FZ - 0.3], 1.0, 4, 4, 40), k(T.s06, [FX, 1.48, FZ - 0.3], 0.9, 0, 4, 40)],
    s06: [k(T.s06, [-1.2, 1.22, -2.2], 2.7, 14, 6, 50), k(T.s07, [-1.25, 1.22, -2.2], 2.35, 8, 6, 50)],
    s07: [k(T.s07, [FX + 0.02, 1.22, FZ + 0.06], 1.3, -18, -4, 40), k(T.s08, [FX + 0.02, 1.3, FZ + 0.06], 1.12, -12, -4, 40)],
    s08: [k(T.s08, [-0.7, 1.25, -1.8], 3.3, 30, 6, 50), k(OPEN - 0.3, [-1.05, 1.3, -1.85], 2.5, 22, 6, 50), k(T.s09, [-1.1, 1.3, -1.85], 2.3, 20, 6, 50)],
    s09: [k(T.s09, [-1.2, 1.15, -1.75], 2.7, 30, 6, 52), k(ENCASE, [-1.0, 1.15, -1.65], 3.1, 22, 7, 54), k(T.s10, [-0.9, 1.15, -1.6], 3.0, 16, 7, 54)],
    s10: [k(T.s10, [-0.8, 1.2, -1.65], 3.1, 10, 6, 50), k(APRIL, [-0.72, 1.2, -1.65], 2.85, 2, 6, 50), k(T.s11, [-0.68, 1.2, -1.65], 2.75, -2, 6, 50)],
    s11: [k(T.s11, [PEAS.x + 0.02, 1.12, PEAS.z], 1.55, 12, 10, 42), k(total, [PEAS.x + 0.02, 1.1, PEAS.z], 1.4, 7, 10, 42)],
  };
  const shake = [{ t: BURST, a: 0.5 }, { t: BURST + 0.3, a: 0.3 }, { t: ENCASE, a: 0.2 }];
  const cam = (t) => { const s = shotAt(t); const tr = s === 's07' ? 0.006 : s === 's01' ? 0.004 : 0.003;
    return E.keepInside(camKeys(K[s], t, { shake, hand: tr, creep: 0.02 }), [-3.3, 0.2, -2.8], [3.3, 2.55, 6]); };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const dof = (t) => { const s = shotAt(t), c = cam(t); return { focus: dist(c.pos, K[s][0].look), cinf: s === 's04' || s === 's11' ? 2.0 : 1.2 }; };

  // ================= light =================
  const EVE = { sky: '#fff3dc', ground: '#4a3a30', hemi: 1.1, sun: '#ffe6c0', sunI: 0.7, az: 210, el: 40, fog: '#efe0c4', fogNear: 30, fogFar: 90, skyTop: '#16224a', skyHor: '#3a4f86',
    sat: 1.12, vig: 0.24, card: '#ffffff', gain: '#fff6ea', lift: '#000000', grain: 0.02, shadowExt: 7, lamps: { kitchen: 1, window: 0.6, fridge: 0 } };
  const XRAY = { ...EVE, card: '#e8f6ff', gain: '#eef8ff', hemi: 1.0, sat: 1.08, vig: 0.3, lamps: { kitchen: 0.7, window: 0.4, fridge: 0.7 } };
  const YEAR = { ...EVE, sat: 1.08, vig: 0.34, gain: '#f6f0ff' };
  const NIGHT = { ...EVE, sky: '#9fb2e8', hemi: 0.62, sunI: 0.15, card: '#cdd8ff', gain: '#d4defa', vig: 0.46, sat: 1.05, lamps: { kitchen: 0.12, window: 1.3, fridge: 0 } };
  const BLAST = { ...NIGHT, hemi: 0.8, card: '#dff2ff', gain: '#e6f4ff', lamps: { kitchen: 0.12, window: 1.3, fridge: 2.2 } };
  const NIGHTF = { ...NIGHT, lamps: { ...NIGHT.lamps, fridge: 1.8 } };
  const SPRING = { ...EVE, sky: '#fff8e8', hemi: 1.25, sun: '#fff4d8', sunI: 1.0, card: '#fffaf0', gain: '#fff8ee', sat: 1.16, vig: 0.2, lamps: { kitchen: 0.5, window: 1.6, fridge: 0 } };
  const light = (t) => { const s = shotAt(t);
    if (s === 's02' || s === 's04' || s === 's05') return XRAY; if (s === 's06' || s === 's07') return YEAR; if (s === 's08') return t > wd(8, 5) - 0.1 ? NIGHTF : NIGHT;
    if (s === 's09') return BLAST; if (s === 's10') return t > APRIL ? SPRING : t > wd(10, 0) + 0.3 && Math.floor((t - wd(10, 0) - 0.3) / 0.33) % 2 === 0 ? EVE : NIGHT; if (s === 's11') return SPRING; return EVE; };

  // ================= world animation =================
  const fillN = (t) => { // freezer cubes shown (monotonic story time)
    if (t < T.s02) return Math.round(N_BIN * 0.3); if (t < T.s03) return Math.round(lerp(N_BIN * 0.3, N_BIN * 0.82, ramp(t, T.s02, T.s03)));
    if (t < T.s05) return N_BIN; if (t < T.s06) return Math.round(lerp(N_BIN, N_ALL, EASE.smooth(ramp(t, T.s05 + 0.2, T.s06 - 0.1)))); return N_ALL; };
  const update = (t) => {
    const s = shotAt(t), xr = s === 's02' || s === 's04' || s === 's05';
    // freezer door: hidden for the x-ray, bulges with the year, bursts open on Tuesday night
    let open = 0, bul = 0, trem = 0;
    if (s === 's01') { trem = 0.014 * Math.sin(t * 46) * (0.6 + 0.4 * Math.sin(t * 3.1)); bul = 0.45 + 0.05 * Math.sin(t * 9); open = 0.09 + 0.02 * Math.sin(t * 13); }
    if (s === 's03') bul = 0.3;
    if (s === 's06') bul = 0.3 + 0.7 * EASE.smooth(ramp(t, wd(6, 3), we(6, 5)));
    if (s === 's07' || s === 's08') { bul = s === 's07' ? 1 + 0.4 * Math.abs(Math.sin(t * 5.5)) : 1; trem = (s === 's07' ? 0.02 : 0.01) * Math.sin(t * 52) * (s === 's07' ? 1 : 0.4 + 0.6 * ramp(t, OPEN, BURST)); if (s === 's07') open = 0.04 + 0.03 * Math.abs(Math.sin(t * 5.5)); }
    if (s === 's08' && t > OPEN) open = 0.14 * EASE.smooth(ramp(t, OPEN, wd(8, 5)));
    if (s === 's09' || s === 's10' || s === 's11') { open = s === 's09' ? Math.min(1, EASE.easeOut(ramp(t, BURST - 0.05, BURST + 0.12)) * 1.06) : 1; bul = s === 's09' ? 1 - ramp(t, BURST, BURST + 0.2) : 0; }
    fzDoor.visible = !xr; fzPivot.rotation.y = -1.85 * open; fzPivot.rotation.x = trem;
    bulge.scale.z = 0.001 + bul * 0.1; bulge.visible = bul > 0.01;
    F.rotation.x = s === 's06' || s === 's07' || s === 's08' ? 0.035 * EASE.smooth(s === 's06' ? ramp(t, wd(6, 3), we(6, 5)) : 1) + trem * 0.3 : 0;
    frost.forEach((m) => { m.visible = false; });
    crack.visible = (s === 's06' && t > wd(6, 5)) || s === 's07' || s === 's08';
    // freezer contents
    const n = fillN(t), showF = xr; fMesh.forEach((m, i) => { m.visible = showF && i < n; });
    if (showF && n > 0 && n < N_ALL) { const last = fMesh[n - 1], b = ramp(t % 0.36, 0, 0.12); last.position.y = fCubes[n - 1][1] + (1 - EASE.easeOut(b)) * 0.06; }
    // the little cube that keeps dropping from the tray
    { const ph = (t % 0.36) / 0.36, tgt = fCubes[Math.min(n, N_ALL - 1)]; drop.visible = showF && s !== 's05' ? ph < 0.85 : showF && ph < 0.85;
      drop.position.set(lerp(-0.1, tgt[0], ph), lerp(1.49, tgt[1] + 0.03, ph * ph), lerp(-0.6, tgt[2], ph)); drop.rotation.set(ph * 5, ph * 3, 0); }
    arm.rotation.z = xr ? Math.sin(t * 7) * 0.15 : 0;
    imLed.visible = Math.floor(t * 3) % 2 === 0 || !xr;
    // hook: cubes popping out of the trembling door seam
    { const base = s === 's01' ? 0 : s === 's07' ? T.s07 - 0.4 : null;
      for (const p of pop) { const q = base === null ? -1 : t - base - p.t0, on = q > 0 && q < 1.6; p.m.visible = on; if (!on) continue;
        const y = Math.max(0.045, p.y0 - 0.5 * 9.8 * q * q + 0.5 * q); const bz = Math.min(q, 0.55); p.m.position.set(p.x0 + p.vx * bz, y, FZ + 0.04 + p.vz * bz); p.m.rotation.set(q * 8, q * 5, 0); } }
    // avalanche + mound + block
    const a = t - BURST; const post = s === 's10' || s === 's11';
    for (const c of AV) { const q = post ? 1 : s === 's09' ? clamp((a - c.d0) / c.dur) : 0; c.m.visible = (s === 's09' && a > c.d0) || post;
      if (!c.m.visible) continue; const e = EASE.easeOut(q);
      c.m.position.set(lerp(c.sx, c.ex, e), lerp(c.sy, c.ey, q) + Math.sin(Math.PI * q) * c.arc, lerp(c.sz, c.ez, e)); c.m.rotation.set(c.rx * (1 - q) + c.rx * 0.1, c.ry, (1 - q) * 3); }
    const mg = post ? 1 : s === 's09' ? EASE.smooth(ramp(a, 0.2, 1.05)) : 0;
    mound.visible = mg > 0.01; mound.scale.set(MC.rx * (0.6 + 0.4 * mg), MC.h * mg, MC.rz * (0.6 + 0.4 * mg));
    block.visible = (s === 's09' && t > ENCASE) || post;
    { const on = (s === 's10' && t > APRIL) || s === 's11', dq = ((t - APRIL) % 0.8) / 0.8; dripM.visible = on && dq < 0.9; dripM.position.set(0.19, lerp(BLK.h - 0.22, 0.8, dq * dq), BLK.d / 2 + 0.02); }
    peas.visible = (s === 's09' && t > ENCASE) || post;
    // window: snow, then spring; calendar flips
    spring.visible = (s === 's10' && t > APRIL) || s === 's11';
    let m = 0;
    if (s === 's06') m = Math.floor(ramp(t, wd(6, 0), we(6, 2)) * 12) % 12;
    if (s === 's10') m = 1 + Math.min(4, Math.floor(ramp(t, T.s10 + 0.3, APRIL) * 5));
    if (s === 's11') m = 5;
    drawCal(MONTHS[m]);
    const mins = s === 's08' || s === 's09' ? 23 * 60 + 48 + (t - T.s08) * 0.2 : s === 's10' ? 23 * 60 + 50 + (t - T.s10) * 400 : s === 's11' ? 8 * 60 + 15 : 18 * 60 + 40 + t * 4;
    clock.set(mins, (t * 60) % 60);
    winLight.color.set(spring.visible ? '#fff1d0' : '#bcd0ff');
  };

  // ================= cast =================
  // him: very tall and thin (scaled up, has to duck for the ceiling light), bald with a big moustache, maroon robe, pink fuzzy slippers
  const LK = { hero: { skin: E.SKINS[1], hair: '#5a3a22', style: 'balding', top: '#8a2f4a', topKind: 'cardigan', pants: '#6a8ac8', shoes: '#ffb3c8', moustache: '#5a3a22', glasses: '#2a2430' } };
  const HS = 1.14;
  const actors = (t) => {
    const s = shotAt(t), A = [];
    const hero = (x, z, p, o = {}) => A.push(actor({ id: 'hero', look: LK.hero, seed: 12, x, y: 0, z, s: HS, main: true, ...o, pose: alive(t, 12, p) }));
    if (s === 's03') { const sip = Math.sin(clamp((t - wd(3, 2)) / 0.5) * Math.PI);
      hero(0.15, -1.3, { expr: t > wd(3, 1) ? 'smug' : 'neutral', R: 'hold', hold: { R: 'glass' }, L: 'hip', facing: -1, look: -0.6, headTilt: -4 + sip * 6 });
      if (t > wd(3, 1)) A.push(fxCard({ id: 'spk3', kind: 'sparkle', args: [t * 3], x: 0.45, y: 1.85, z: -1.25, s: 0.08 })); }
    if (s === 's08') { const wq = ramp(t, T.s08, OPEN - 0.15), x = lerp(0.55, HERO.x, EASE.smooth(wq)), walking = wq < 1;
      const reach = t > OPEN - 0.15; hero(x, HERO.z, walking ? { mode: 'walk', step: (t * 1.6) % 1, expr: 'bored', L: 'hang', R: 'hang', facing: -1, look: -0.7 }
        : { expr: t > OPEN + 0.5 ? 'nervous' : 'bored', L: 'reach', R: 'hang', facing: -1, look: -0.8 });
      if (t > OPEN + 0.5) A.push(fxCard({ id: 'sw8', kind: 'sweat', args: [], x: HERO.x + 0.18, y: 2.0, z: HERO.z + 0.05, s: 0.07 }));
      if (!walking && t < OPEN + 0.5) A.push(fxCard({ id: 'zz8', kind: 'zzz', args: [t], x: HERO.x + 0.3, y: 2.25, z: HERO.z, s: 0.1 })); }
    if (s === 's09') { const frozen = t > ENCASE;
      hero(HERO.x, HERO.z, frozen ? { expr: 'shock', L: 'up', R: 'up', facing: 0, look: 0 } : { expr: 'gasp', L: 'up', R: 'up', facing: -1, look: -0.6 }, frozen ? { tint: '#a8dcff' } : {});
      if (!frozen && t > BURST + 0.05) A.push(fxCard({ id: 'ex9', kind: 'exclaim', args: [t], x: HERO.x + 0.25, y: 2.35, z: HERO.z, s: 0.13 })); }
    if (s === 's10' || s === 's11') {
      const thaw = s === 's11' || t > APRIL, blink = thaw && (Math.abs(t - APRIL - 0.5) < 0.08 || (s === 's11' && (t * 0.6) % 1 < 0.06)) ? 1 : 0;
      A.push(actor({ id: 'hero', look: LK.hero, seed: 12, x: HERO.x, y: 0, z: HERO.z, s: HS, main: true, tint: thaw ? '#c8eaff' : '#a8dcff', pose: { expr: 'shock', L: 'up', R: 'up', facing: 0, look: s === 's11' && t > wd(11, 1) ? 0.45 : 0, blink, tilt: 0, bob: 0, headTilt: 0 } }));
      if (s === 's11' && t > wd(11, 3) - 0.2) A.push(fxCard({ id: 'sp11', kind: 'sparkle', args: [t * 3], x: PEAS.x + 0.17, y: surfY(PEAS.x, PEAS.z) + 0.16, z: PEAS.z + 0.08, s: 0.12 })); }
    return A;
  };

  // ================= text =================
  const M_ = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B_ = (a, cls = '', fs = 230) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const ui = (t) => {
    const s = shotAt(t), o = { capY: 1500 };
    if (s === 's01') { o.title = B_('4 LB', 'y', 240) + M_('OF ICE'); o.titleK = 1; }
    if (s === 's02') { const d = 1 + Math.floor(Math.pow(ramp(t, wd(2, 0), T.s03), 1.6) * 59); o.title = M_('DAY') + B_(String(d), 'y', 220); o.titleK = (t - T.s02) / 0.25; o.flash = Math.max(0, 0.55 - (t - T.s02) * 4); o.flashCol = '#c8f0ff'; }
    if (s === 's04') { o.title = M_('BIN:') + M_('FULL', 'r'); o.titleK = (t - wd(4, 3) + 0.15) / 0.25; if (t < wd(4, 3) - 0.15) delete o.title; }
    if (s === 's05') { if (t > wd(5, 0) - 0.1) { o.title = M_('NOBODY') + M_('TOLD IT', 'y'); o.titleK = (t - wd(5, 0) + 0.1) / 0.25; } }
    if (s === 's06') { if (t < wd(6, 3) - 0.1) { o.title = M_('1 YEAR LATER'); o.titleK = (t - T.s06) / 0.25; }
      else { const v = Math.round(EASE.smooth(ramp(t, wd(6, 3) - 0.1, we(6, 5) - 0.1)) * 1400); o.title = B_(v.toLocaleString('en-US') + ' LB', 'y', 190); o.titleK = (t - wd(6, 3) + 0.1) / 0.25; } }
    if (s === 's08' && t > wd(8, 0) - 0.1 && t < wd(8, 6) - 0.1) { o.title = M_('TUE') + M_('11:48 PM', 'y'); o.titleK = (t - wd(8, 0) + 0.1) / 0.25; }
    if (s === 's08' && t > wd(8, 6) - 0.1) { o.title = M_('FOR') + M_('PEAS', 'g'); o.titleK = (t - wd(8, 6) + 0.1) / 0.25; }
    if (s === 's09') { o.flash = Math.max(0, 0.8 - (t - BURST) * 3) + (t > ENCASE ? Math.max(0, 0.6 - (t - ENCASE) * 4) : 0); o.flashCol = '#e8f8ff';
      if (t > wd(9, 1) - 0.1) { o.title = M_('YOU') + M_('SURVIVE', 'g'); o.titleK = (t - wd(9, 1) + 0.1) / 0.25; } }
    if (s === 's10') { if (t > APRIL) { o.title = M_('UNTIL') + B_('APRIL', 'y', 220); o.titleK = (t - APRIL) / 0.25; o.flash = Math.max(0, 0.5 - (t - APRIL) * 3); o.flashCol = '#fff6d8'; } }
    return o;
  };
  const KEY = ['four', 'pounds', 'ice', 'every', 'full', 'nobody', 'fourteen', 'hundred', 'door', 'tuesday', 'peas', 'survive', 'frozen', 'april', 'fine'];
  return { shots, cam, dof, light, update, actors, ui, KEY };
}
