// xr016-apple-800: Ronald Wayne sold his 10% of Apple for $800, twelve days after the 1976 partnership.
// Three places in one world: the sunny 1976 office of the partnership (origin), a bright modern office today (x = +40)
// and a quiet living room in the afternoon (x = -40, "no regrets").
// Times come from the real ElevenLabs narration: st(i) = sentence i start, wd(i, j) = word j of sentence i.
// No logos: the company is only a word on paper; the fruit drawn on the chart is a whole round apple (no bite, no leaf shape).
import { props, room, TABLE_H, COUNTER_H, designY } from '../../engine/cartoon/sets.js';

export default function story(E, tm) {
  const { THREE, P, add, tbox, box, group, mat, glow, lamp, actor, fxCard, alive, camKeys, EASE, clamp, lerp } = E;
  const { st, wd, we, total } = tm;
  const X = props(E);
  const ramp = (t, a, b) => clamp((t - a) / (b - a));
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g, t }; };
  const flat = (tx, k = 1) => new THREE.MeshBasicMaterial({ map: tx.t, color: new THREE.Color(k, k, k), fog: false });
  const FONT = (w, s, f = 'Inter, Arial Black, Arial') => `${w} ${s}px ${f}`;
  const txt = (g, s, x, y, size, col = '#ffffff', w = 900, align = 'center', f) => { g.font = FONT(w, size, f); g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); };
  // sunny suburb seen through the windows (day, not the night city)
  const dayOutside = (seed, warm = false) => { const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'), r = P.rng(seed);
    const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, warm ? '#f6c98a' : '#8cc4f0'); gr.addColorStop(0.62, warm ? '#fde7c0' : '#d9eefb'); gr.addColorStop(1, '#bfe0a0'); g.fillStyle = gr; g.fillRect(0, 0, 512, 512);
    g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 4; i++) { const x = r() * 512, y = 60 + r() * 120; for (let k = 0; k < 5; k++) { g.beginPath(); g.ellipse(x + k * 26, y + Math.sin(k) * 8, 34, 20, 0, 0, 7); g.fill(); } }
    g.fillStyle = '#7fb85a'; g.fillRect(0, 380, 512, 132);
    for (let i = 0; i < 7; i++) { const x = i * 80 + r() * 30, h = 90 + r() * 80; g.fillStyle = '#6b4a32'; g.fillRect(x + 18, 380 - h * 0.35, 10, h * 0.35); g.fillStyle = i % 2 ? '#4d8a2e' : '#5fa03a'; g.beginPath(); g.arc(x + 23, 380 - h * 0.45, h * 0.32, 0, 7); g.fill(); }
    return c; };

  // ================= 1976: THE PARTNERSHIP OFFICE (origin) =================
  room(E, E.scene, 0, 0, { w: 8, d: 10, h: 3.0, floor: E.mat({ map: P.planks(161), rep: [3, 3], color: '#c08a52' }),
    wallTop: E.mat({ map: P.wallpaper(162, '#d98a3a', '#e29a4c', 'rgba(255,236,190,.35)'), rep: [4, 2] }), wallLow: E.mat({ map: P.wainscot(163, 26, 36), rep: [4, 1] }), wainH: 0.9, ceil: '#f1e2c4' });
  const BW = -4.94; // back wall face (z), d = 10 -> wall at -5 (+0.06 thickness)
  // flip chart on the back wall: the partnership split, drawn live (the 10 % slice gets the SOLD stamp)
  const PIE = { x: -0.7, y: 2.0, w: 1.5, h: 1.25 };
  add(tbox(PIE.w + 0.12, PIE.h + 0.12, 0.05, 1), '#5a3a22', PIE.x, PIE.y, BW + 0.03, E.scene);
  const pieTx = canvasTex(720, 600, () => {});
  add(new THREE.PlaneGeometry(PIE.w, PIE.h), flat(pieTx, 0.97), PIE.x, PIE.y, BW + 0.065, E.scene, { cast: false, receive: false, noink: true });
  let pieKey = '';
  const drawPie = (sold, lift) => { const key = sold.toFixed(2) + '|' + lift.toFixed(2); if (key === pieKey) return; pieKey = key; const g = pieTx.g, w = 720, h = 600;
    g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,120,200,.18)'; g.lineWidth = 2; for (let y = 40; y < h; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    txt(g, 'APPLE COMPUTER CO.', w / 2, 52, 44, '#3a2618', 900, 'center', 'Georgia, serif'); txt(g, 'PARTNERSHIP · APRIL 1, 1976', w / 2, 100, 28, '#7a4a2a', 700, 'center', 'Georgia, serif');
    const cx = 228, cy = 345, R = 160, a0 = -Math.PI / 2, aW = a0 - Math.PI * 2 * 0.1;
    const slice = (from, to, col, dx = 0, dy = 0) => { g.fillStyle = col; g.beginPath(); g.moveTo(cx + dx, cy + dy); g.arc(cx + dx, cy + dy, R, from, to); g.closePath(); g.fill(); g.strokeStyle = '#3a2618'; g.lineWidth = 6; g.stroke(); };
    slice(a0, a0 + Math.PI * 0.9, '#5f9fd6'); slice(a0 + Math.PI * 0.9, a0 + Math.PI * 1.8, '#79b24a');
    const mid = (a0 + Math.PI * 1.8 + a0 + Math.PI * 2) / 2, off = 34 * lift; slice(a0 + Math.PI * 1.8, a0 + Math.PI * 2, '#e5483a', Math.cos(mid) * off, Math.sin(mid) * off);
    txt(g, 'JOBS 45%', 420, 250, 34, '#2f6fb5', 900, 'left'); txt(g, 'WOZNIAK 45%', 420, 330, 34, '#4d8a2e', 900, 'left'); txt(g, 'WAYNE 10%', 420, 410, 38, '#c0392b', 900, 'left');
    if (sold > 0) { g.save(); g.translate(cx, cy + 10); g.rotate(-0.2); const s = 1 + (1 - sold) * 0.25; g.scale(s, s); g.globalAlpha = Math.min(1, sold * 1.6);
      g.fillStyle = '#fbf6ea'; g.fillRect(-160, -44, 320, 88); g.strokeStyle = '#c0392b'; g.lineWidth = 8; g.strokeRect(-160, -44, 320, 88); txt(g, 'SOLD $800', 0, 3, 48, '#c0392b', 900); g.restore(); }
    pieTx.t.needsUpdate = true; };
  // the calendar (day number flips 1 -> 12 in shot 2)
  const CAL = { x: 2.65, y: 1.95, w: 0.78, h: 0.98 };
  add(tbox(CAL.w + 0.06, CAL.h + 0.06, 0.03, 1), '#3a2618', CAL.x, CAL.y, BW + 0.02, E.scene);
  const calTx = canvasTex(390, 490, () => {});
  const calMesh = add(new THREE.PlaneGeometry(CAL.w, CAL.h), flat(calTx, 0.96), CAL.x, CAL.y, BW + 0.05, E.scene, { cast: false, noink: true });
  let calKey = -1;
  const drawCal = (day) => { if (day === calKey) return; calKey = day; const g = calTx.g, w = 390, h = 490;
    g.fillStyle = '#fbf6ea'; g.fillRect(0, 0, w, h); g.fillStyle = '#c0392b'; g.fillRect(0, 0, w, 120); txt(g, 'APRIL', w / 2, 48, 58, '#fff3d6'); txt(g, '1976', w / 2, 100, 34, '#fff3d6', 800);
    txt(g, String(day), w / 2, 300, 230, day >= 12 ? '#c0392b' : '#2a1c16'); g.strokeStyle = '#2a1c16'; g.lineWidth = 3; for (let i = 0; i < 7; i++) { g.beginPath(); g.arc(30 + i * 55, 128, 7, 0, 7); g.stroke(); }
    calTx.t.needsUpdate = true; };
  drawCal(1);
  // the house picture (shot 4): Wayne's own house, the one thing the two young partners did not have
  const HP = { x: 1.25, y: 1.78, w: 0.9, h: 0.68 };
  add(tbox(HP.w + 0.1, HP.h + 0.1, 0.05, 1), '#c9a24a', HP.x, HP.y, BW + 0.03, E.scene);
  const houseTx = canvasTex(450, 340, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#9ccff2'); gr.addColorStop(1, '#e6f4fb'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#7fb85a'; g.fillRect(0, 250, w, 90); g.fillStyle = '#f2ead8'; g.fillRect(110, 150, 230, 120); g.strokeStyle = '#3a2618'; g.lineWidth = 5; g.strokeRect(110, 150, 230, 120);
    g.fillStyle = '#b8483a'; g.beginPath(); g.moveTo(90, 155); g.lineTo(225, 70); g.lineTo(360, 155); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#6b4a32'; g.fillRect(205, 200, 40, 70); g.strokeRect(205, 200, 40, 70); g.fillStyle = '#9fd4ff'; for (const x of [135, 280]) { g.fillRect(x, 180, 40, 34); g.strokeRect(x, 180, 40, 34); }
    g.fillStyle = '#4d8a2e'; g.beginPath(); g.arc(60, 220, 42, 0, 7); g.fill(); g.fillStyle = '#6b4a32'; g.fillRect(54, 240, 12, 30); });
  add(new THREE.PlaneGeometry(HP.w, HP.h), mat({ map: houseTx.c }), HP.x, HP.y, BW + 0.065, E.scene, { cast: false });
  const houseRing = add(new THREE.RingGeometry(0.55, 0.6, 48), new THREE.MeshBasicMaterial({ color: '#ff3b30', transparent: true, opacity: 0, fog: false, depthWrite: false }), HP.x, HP.y, BW + 0.09, E.scene, { cast: false, noink: true });
  houseRing.scale.set(1, 0.78, 1); houseRing.userData.ndSkip = true;
  // desk with the cash and the contract (shot 1)
  const DK = { x: 0.75, z: -4.1 };
  X.table(E.scene, DK.x, DK.z, { w: 1.3, d: 0.7, top: '#8a5a34' });
  const bills = [];
  const billTx = canvasTex(256, 110, (g, w, h) => { g.fillStyle = '#b9d8a6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#3f6a3a'; g.lineWidth = 6; g.strokeRect(5, 5, w - 10, h - 10);
    g.fillStyle = '#e8f2dc'; g.beginPath(); g.ellipse(w / 2, h / 2, 34, 38, 0, 0, 7); g.fill(); txt(g, '100', 46, 32, 28, '#2f5a2a'); txt(g, '100', w - 46, h - 30, 28, '#2f5a2a'); });
  for (let i = 0; i < 8; i++) { const b = add(box(0.22, 0.004, 0.095), mat({ map: billTx.c }), DK.x, TABLE_H + 0.004 + i * 0.003, DK.z, E.scene, { cast: false }); bills.push(b); }
  add(box(0.3, 0.004, 0.4), '#fbf7ea', DK.x - 0.38, TABLE_H + 0.003, DK.z + 0.05, E.scene, { cast: false }).rotation.y = 0.2; // a paper
  add(new THREE.CylinderGeometry(0.06, 0.06, 0.012, 20), '#2a1c16', DK.x + 0.45, TABLE_H + 0.006, DK.z - 0.15, E.scene, { cast: false }); // ashtray-free: a coaster
  X.chair(E.scene, DK.x + 0.1, DK.z - 0.62, 0, '#6a3f28');
  // workbench (shot 3): circuit boards, a soldering lamp, boxes of the first order, the loan note on the wall
  const WB = { x: -2.45, z: -4.35 };
  add(tbox(1.9, 0.06, 0.62, 1), E.mat({ map: P.planks(171), color: '#a8743e' }), WB.x, COUNTER_H - 0.03, WB.z, E.scene);
  add(tbox(1.8, COUNTER_H - 0.06, 0.55, 1), '#6b4a32', WB.x, (COUNTER_H - 0.06) / 2, WB.z - 0.02, E.scene);
  const boardTx = canvasTex(256, 160, (g, w, h) => { g.fillStyle = '#2f7a4a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d9b45a'; g.lineWidth = 2;
    const r = P.rng(5); for (let i = 0; i < 26; i++) { g.beginPath(); g.moveTo(r() * w, r() * h); g.lineTo(r() * w, r() * h); g.stroke(); }
    g.fillStyle = '#1d1b22'; for (let i = 0; i < 12; i++) g.fillRect(14 + (i % 6) * 40, 30 + Math.floor(i / 6) * 70, 30, 16); });
  for (let i = 0; i < 3; i++) add(box(0.36, 0.015, 0.24), mat({ map: boardTx.c }), WB.x - 0.55 + i * 0.5, COUNTER_H + 0.008, WB.z + 0.08 - (i % 2) * 0.06, E.scene, { cast: false }).rotation.y = (i - 1) * 0.15;
  const solder = group(WB.x + 0.75, COUNTER_H, WB.z - 0.12); add(new THREE.CylinderGeometry(0.08, 0.1, 0.03, 16), '#2a2a33', 0, 0.015, 0, solder); add(box(0.025, 0.42, 0.025), '#2a2a33', 0, 0.22, 0, solder);
  add(new THREE.ConeGeometry(0.12, 0.14, 18, 1, true), mat('#4a4f5a', { side: THREE.DoubleSide }), 0.08, 0.42, 0.06, solder, { cast: false }).rotation.z = 0.6;
  lamp(WB.x + 0.8, COUNTER_H + 0.38, WB.z + 0.05, '#ffd9a0', 1.2, 2.2, 'bench');
  for (const [dx, dz, s] of [[-1.35, 0.55, 0], [-1.35, 0.55, 1], [-0.95, 0.75, 0]]) X.boxPkg(E.scene, WB.x + dx, s * 0.32, WB.z + dz, 0.45, 0.32, 0.36, '#c99a5a');
  const loan = add(box(0.95, 0.43, 0.03), E.mat({ map: P.sign('LOAN $15,000', { bg: '#fbf6ea', fg: '#c0392b', border: '#3a2618', font: '900 66px Inter, Arial Black, Arial', sub: 'FOR THE FIRST ORDER', w: 680, h: 300 }) }), WB.x + 0.05, 2.45, BW + 0.03, E.scene, { cast: false });
  // window (left wall) with a sunny suburb, door (right wall), plant, ceiling lamp
  X.window(E.scene, -3.93, 1.65, -2.1, Math.PI / 2, 1.5, 1.3, dayOutside(11, true));
  { const dg = group(3.93, 0, -2.4); dg.rotation.y = -Math.PI / 2; add(tbox(0.95, 2.1, 0.06, 1), E.mat({ map: P.planks(181, 1), color: '#8a5a34' }), 0, 1.05, 0, dg); add(new THREE.SphereGeometry(0.035, 10, 8), '#d9b45a', 0.36, 1.02, 0.05, dg);
    add(tbox(1.08, 0.08, 0.1, 1), '#3a2618', 0, 2.12, 0, dg); }
  X.plant(E.scene, 3.4, -4.4, 1.1);
  lamp(-0.5, 2.6, -2.6, '#ffd9a0', 2.4, 6, 'warm');
  lamp(-3.4, 1.8, -2.1, '#fff1d0', 2.6, 6, 'window'); // daylight spill from the window

  // ================= TODAY: BRIGHT MODERN OFFICE (x = +40) =================
  const MX = 40;
  room(E, E.scene, MX, 0, { w: 9, d: 10, h: 3.2, floor: E.mat({ map: P.planks(191), rep: [4, 4], color: '#e8d6b8' }), wallTop: E.mat({ map: P.plaster(192, 40), rep: [4, 2], color: '#f7f4ee' }), wallLow: null, wainH: 0, ceil: '#ffffff' });
  // tall windows on the back wall left, a big wall screen on the right
  X.window(E.scene, MX - 2.9, 1.7, BW + 0.1, 0, 1.6, 2.1, dayOutside(23));
  const SC = { x: MX + 0.75, y: 1.95, w: 2.9, h: 1.63 };
  add(tbox(SC.w + 0.14, SC.h + 0.14, 0.08, 1), '#1d1f26', SC.x, SC.y, BW + 0.04, E.scene);
  const scTx = canvasTex(1160, 652, () => {});
  add(new THREE.PlaneGeometry(SC.w, SC.h), flat(scTx, 1.0), SC.x, SC.y, BW + 0.09, E.scene, { cast: false, receive: false, noink: true });
  let scKey = '';
  const drawScreen = (mode, k) => { const key = mode + '|' + Math.round(k * 40); if (key === scKey) return; scKey = key; const g = scTx.g, w = 1160, h = 652;
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#eef4ea'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#1f8a4c'; g.fillRect(0, 0, w, 90); txt(g, 'APPLE  ·  MARKET VALUE TODAY', w / 2, 47, 46, '#ffffff', 900);
    if (mode === 'cap') {
      // rising line chart 1980 -> today, then the value
      g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; for (let y = 160; y < 600; y += 70) { g.beginPath(); g.moveTo(60, y); g.lineTo(w - 60, y); g.stroke(); }
      const n = Math.max(2, Math.round(60 * clamp(k * 1.4))); g.strokeStyle = '#1f8a4c'; g.lineWidth = 12; g.lineJoin = 'round'; g.beginPath();
      for (let i = 0; i < n; i++) { const u = i / 59, x = 70 + u * 560, y = 590 - Math.pow(u, 3.2) * 400 - Math.sin(i * 1.7) * 8 * u; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      txt(g, '$4.98', 900, 280, 150, '#1d1f26'); txt(g, 'TRILLION', 900, 400, 70, '#1f8a4c'); txt(g, 'NOV 20, 2026', 900, 500, 36, '#6a7a70', 800);
      // the 10 % share appears on "ten percent"
      if (k > 0.55) { const a = clamp((k - 0.55) / 0.2); g.globalAlpha = a; g.fillStyle = '#ffd23f'; g.beginPath(); g.roundRect(700, 545, 400, 80, 20); g.fill(); txt(g, '10% = ?', 900, 586, 50, '#1d1f26'); g.globalAlpha = 1; }
    } else {
      const n = 12, kk = EASE.easeOut(clamp(k)); for (let i = 0; i < n; i++) { const bh = 40 + Math.pow(i / (n - 1), 2.6) * 470 * kk; g.fillStyle = i === n - 1 ? '#ffd23f' : '#1f8a4c'; g.fillRect(70 + i * 88, 610 - bh, 64, bh); }
    }
    scTx.t.needsUpdate = true; };
  // desk + laptop, plants, a sofa line at the side
  X.table(E.scene, MX - 1.25, -3.1, { w: 1.2, d: 0.65, top: '#f2ead8' });
  add(tbox(0.36, 0.015, 0.25, 1), '#c9ccd2', MX - 1.2, TABLE_H + 0.008, -3.1, E.scene); { const lid = add(tbox(0.36, 0.24, 0.012, 1), '#c9ccd2', MX - 1.2, TABLE_H + 0.13, -3.22, E.scene); lid.rotation.x = -0.25; }
  X.plant(E.scene, MX + 3.7, -4.4, 1.3); X.plant(E.scene, MX - 3.9, -4.3, 1.0);
  // the cash: a tower of $100 bricks rising next to the screen, and the $800 next to it on a little stool
  const brickTx = canvasTex(256, 100, (g, w, h) => { g.fillStyle = '#a9cf95'; g.fillRect(0, 0, w, h); g.fillStyle = '#e8d9a8'; g.fillRect(w / 2 - 22, 0, 44, h); g.strokeStyle = '#3f6a3a'; g.lineWidth = 6; g.strokeRect(3, 3, w - 6, h - 6); txt(g, '$100', 60, h / 2, 34, '#2f5a2a'); txt(g, '$100', w - 60, h / 2, 34, '#2f5a2a'); });
  const brickMat = mat({ map: brickTx.c });
  const TW = { x: MX + 2.2, z: -3.7 }; const bricks = [];
  for (let row = 0; row < 18; row++) for (let i = 0; i < 6; i++) { const bx = (i % 3 - 1) * 0.27, bz = (Math.floor(i / 3) - 0.5) * 0.3 + (row % 2) * 0.02;
    const b = add(box(0.26, 0.16, 0.29), brickMat, TW.x + bx, 0.08 + row * 0.165, TW.z + bz, E.scene); b.userData.row = row; b.visible = false; bricks.push(b); }
  const STOOL = { x: MX + 1.3, z: -3.2 };
  add(new THREE.CylinderGeometry(0.17, 0.17, 0.04, 20), '#8a5a34', STOOL.x, 0.46, STOOL.z, E.scene); for (const [a, b] of [[-1, -1], [1, -1], [0, 1]]) add(box(0.03, 0.46, 0.03), '#6b4a32', STOOL.x + a * 0.1, 0.23, STOOL.z + b * 0.1, E.scene);
  const tiny = []; for (let i = 0; i < 8; i++) tiny.push(add(box(0.12, 0.003, 0.05), mat({ map: billTx.c }), STOOL.x, 0.482 + i * 0.003, STOOL.z, E.scene, { cast: false }));
  const tagTx = (s, bg, fg) => canvasTex(300, 120, (g, w, h) => { g.fillStyle = bg; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 22); g.fill(); g.strokeStyle = '#1d1b22'; g.lineWidth = 6; g.stroke(); txt(g, s, w / 2, h / 2 + 3, 64, fg); });
  const tag800 = add(new THREE.PlaneGeometry(0.42, 0.17), flat(tagTx('$800', '#ffffff', '#c0392b')), STOOL.x, 0.63, STOOL.z + 0.02, E.scene, { cast: false, noink: true });
  const tagBig = add(new THREE.PlaneGeometry(0.7, 0.28), flat(tagTx('$500B', '#ffd23f', '#1d1b22')), TW.x, 1, TW.z + 0.4, E.scene, { cast: false, noink: true });
  lamp(MX - 2.9, 2.0, -3.6, '#fff8e8', 3.2, 8, 'window'); lamp(MX + 0.8, 2.9, -1.0, '#ffffff', 2.0, 8, 'ceil');

  // ================= AFTERNOON LIVING ROOM (x = -40) =================
  const LX = -40;
  room(E, E.scene, LX, 0, { w: 7, d: 10, h: 2.8, floor: E.mat({ map: P.planks(201), rep: [3, 3], color: '#a8743e' }), wallTop: E.mat({ map: P.wallpaper(202, '#6f9a6a', '#7aa874', 'rgba(255,240,200,.3)'), rep: [3, 2] }), wallLow: E.mat({ map: P.wainscot(203, 30, 70), rep: [3, 1] }), wainH: 0.85, ceil: '#f4ead8' });
  X.window(E.scene, LX - 1.25, 1.6, BW + 0.1, 0, 1.4, 1.3, dayOutside(31, true));
  X.booth(E.scene, LX + 1.45, BW + 0.55, 0, { w: 1.3, col: '#b8643a' });
  X.frame(E.scene, LX + 1.45, 1.95, BW + 0.05, 0, 0.6, 0.45, 205); X.frame(E.scene, LX + 0.45, 2.0, BW + 0.05, 0, 0.36, 0.46, 207);
  X.plant(E.scene, LX - 2.6, -4.3, 1.15);
  { const st2 = group(LX + 2.75, 0, BW + 0.5); add(box(0.04, 1.5, 0.04), '#2a2a33', 0, 0.75, 0, st2); add(new THREE.ConeGeometry(0.22, 0.26, 20, 1, true), mat('#f2e6c8', { side: THREE.DoubleSide }), 0, 1.6, 0, st2, { cast: false }); }
  lamp(LX + 2.75, 1.5, BW + 0.6, '#ffd9a0', 1.4, 4, 'warm'); lamp(LX - 1.25, 1.7, -3.9, '#fff1d0', 2.8, 7, 'window');

  // ================= shots =================
  const T = { s01: 0, s02: st(2), s03: st(3), s04: st(4), s05: st(5), s06: st(6), s07: st(7) };
  const shots = Object.entries(T).map(([id, start]) => ({ id, start }));
  const shotAt = (t) => { let id = 's01'; for (const [k, v] of Object.entries(T)) if (t >= v) id = k; return id; };
  const where = (t) => { const s = shotAt(t); return ['s05', 's06'].includes(s) ? 'today' : s === 's07' ? 'home' : '1976'; };
  const aim = (tg, Wd, yaw = 0, pitch = 8, fov = 36) => { const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * 0.5625), d = Wd / (2 * Math.tan(hf / 2));
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { pos: [tg[0] + Math.sin(y) * Math.cos(p) * d, tg[1] + Math.sin(p) * d, tg[2] + Math.cos(y) * Math.cos(p) * d], look: [...tg], fov }; };
  const k = (t, tg, Wd, yaw, pitch, fov, o = {}) => ({ t, ...aim(tg, Wd, yaw, pitch, fov), ...o });
  // cast positions
  const WAY = { x: 0.3, z: -3.75 };        // Wayne beside the chart and the desk (1976)
  const walkX = (t) => lerp(WAY.x + 0.2, 1.65, EASE.smooth(ramp(t, wd(2, 2) - 0.1, st(3) - 0.15)));
  const K = {
    s01: [k(0, [0.0, 1.55, -4.05], 2.75, 6, 4, 50), k(T.s02, [0.05, 1.55, -4.05], 2.5, 2, 4, 50)],
    s02: [k(T.s02, [0.9, 1.45, -4.1], 2.9, -4, 4, 50), k(wd(2, 4), [1.45, 1.45, -4.1], 2.8, -7, 4, 50), k(T.s03, [1.65, 1.45, -4.1], 2.7, -8, 4, 50)],
    s03: [k(T.s03, [WB.x - 0.25, 1.6, WB.z + 0.1], 2.9, 8, 6, 50), k(wd(3, 3), [WB.x - 0.25, 1.62, WB.z + 0.1], 2.75, 5, 6, 50), k(T.s04, [WB.x - 0.22, 1.62, WB.z + 0.1], 2.65, 4, 6, 50)],
    s04: [k(T.s04, [0.85, 1.65, -3.8], 2.05, -4, 2, 46), k(wd(4, 5), [0.86, 1.65, -3.85], 1.92, -5, 2, 46), k(T.s05, [0.87, 1.65, -3.85], 1.88, -5, 2, 46)],
    s05: [k(T.s05, [MX + 0.9, 1.6, -4.0], 3.7, 3, 2, 52), k(T.s06, [MX + 0.95, 1.65, -4.0], 3.45, 2, 2, 52)],
    s06: [k(T.s06, [MX + 1.2, 1.55, -3.6], 3.3, -6, 4, 52), k(wd(6, 3), [MX + 1.25, 1.75, -3.6], 3.5, -7, 6, 52), k(T.s07, [MX + 1.27, 1.8, -3.6], 3.55, -7, 6, 52)],
    s07: [k(T.s07, [LX + 0.25, 1.45, -3.85], 2.2, 6, 4, 48), k(total - 0.02, [LX + 0.2, 1.55, -3.85], 1.8, 3, 3, 48, { ease: 'easeOut' })],
  };
  const shake = [{ t: wd(1, 7), a: 0.5 }, { t: wd(4, 5), a: 0.4 }, { t: wd(6, 3), a: 0.8 }];
  const ROOMS = { '1976': [[-3.85, 0.3, -4.85], [3.85, 2.9, 4.9]], today: [[MX - 4.35, 0.3, -4.85], [MX + 4.35, 3.1, 4.9]], home: [[LX - 3.35, 0.3, -4.85], [LX + 3.35, 2.7, 4.9]] };
  const cam = (t) => { const s = shotAt(t), c = camKeys(K[s], t, { shake, hand: 0.004, creep: 0.03 }), b = ROOMS[where(t)]; return E.keepInside(c, b[0], b[1]); };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const dof = (t) => {
    const s = shotAt(t), c = cam(t);
    if (s === 's04') return { focus: dist(c.pos, [0.38, 1.72, -3.55]), cinf: 4 };
    if (s === 's03') return { focus: dist(c.pos, [WB.x, 1.6, WB.z - 0.35]), cinf: 4 };
    if (s === 's07') return { focus: dist(c.pos, [LX + 0.2, 1.7, -3.9]), cinf: 6 };
    if (where(t) === 'today') return { focus: dist(c.pos, [MX + 0.8, 1.6, -3.6]), cinf: 3 };
    return { focus: dist(c.pos, [WAY.x, 1.7, WAY.z]), cinf: 4 };
  };
  // ================= light =================
  const RETRO = { sky: '#ffe6bf', ground: '#7a5a3a', hemi: 1.3, sun: '#ffdca8', sunI: 1.0, az: 160, el: 50, fog: '#f1e2c4', fogNear: 30, fogFar: 90, skyTop: '#f1e2c4', skyHor: '#f1e2c4',
    sat: 1.05, vig: 0.3, card: '#fff2dc', gain: '#fff4e2', lift: '#050200', grain: 0.05, sepia: 0.18, shadowExt: 8, lamps: { warm: 1.1, window: 1, bench: 1 } };
  const WORRY = { ...RETRO, hemi: 1.0, card: '#ffe2d6', gain: '#ffe6dc', vig: 0.42, sepia: 0.22, lamps: { warm: 0.8, window: 0.7, bench: 1 } };
  const TODAY = { sky: '#ffffff', ground: '#d9c8a8', hemi: 1.35, sun: '#fffaf0', sunI: 1.1, az: 210, el: 55, fog: '#ffffff', fogNear: 30, fogFar: 90, skyTop: '#ffffff', skyHor: '#ffffff',
    sat: 1.12, vig: 0.18, card: '#ffffff', gain: '#ffffff', lift: '#000000', grain: 0.02, shadowExt: 8, lamps: { window: 1, ceil: 1 } };
  const HOME = { sky: '#ffe9c8', ground: '#6a5a3a', hemi: 1.15, sun: '#ffd9a0', sunI: 0.9, az: 120, el: 40, fog: '#f4ead8', fogNear: 30, fogFar: 90, skyTop: '#f4ead8', skyHor: '#f4ead8',
    sat: 1.06, vig: 0.3, card: '#fff4e4', gain: '#fff6ea', lift: '#030100', grain: 0.03, shadowExt: 7, lamps: { warm: 1, window: 1 } };
  const light = (t) => { const s = shotAt(t); if (s === 's04') return WORRY; if (where(t) === 'today') return TODAY; if (s === 's07') return HOME; return RETRO; };
  // ================= world animation =================
  const update = (t) => {
    const s = shotAt(t);
    // the stamp lands on "eight hundred" and stays for the rest of 1976
    drawPie(clamp((t - wd(1, 7) + 0.05) / 0.25), clamp((t - wd(1, 5)) / 0.3));
    // bills fan out across the desk on "eight hundred dollars"
    const fan = EASE.easeOut(ramp(t, wd(1, 7) - 0.05, wd(1, 9)));
    bills.forEach((b, i) => { b.position.x = DK.x - 0.2 + i * 0.06 * fan; b.position.z = DK.z + 0.05 - Math.sin(i * 0.7) * 0.03 * fan; b.rotation.y = (i - 3.5) * 0.12 * fan; });
    // calendar flips from day 1 to 12 during "quit just twelve days in"
    drawCal(s === 's01' ? 1 : Math.max(1, Math.min(12, 1 + Math.floor(11 * EASE.easeIn(ramp(t, wd(2, 0), wd(2, 4) + 0.05))))));
    // the house picture gets a red ring on "house"
    houseRing.material.opacity = s === 's04' ? 0.9 * clamp((t - wd(4, 5) + 0.05) / 0.2) : 0; houseRing.scale.setScalar(1 + 0.04 * Math.sin(t * 8)); houseRing.scale.y *= 0.78;
    // the big screen
    if (s === 's05') drawScreen('cap', ramp(t, T.s05, T.s06));
    if (s === 's06') drawScreen('val', ramp(t, wd(6, 1) - 0.1, wd(6, 4)));
    // the tower: rows appear from "five" to "dollars", topped by the yellow tag
    const rows = s === 's06' ? Math.round(18 * EASE.easeOut(ramp(t, wd(6, 1) - 0.1, wd(6, 4) + 0.2))) : 0;
    for (const b of bricks) b.visible = b.userData.row < rows;
    tagBig.visible = rows > 2; tagBig.position.y = 0.16 * rows + 0.25;
    tag800.visible = tiny[0].visible = s === 's06';
    for (const b of tiny) b.visible = s === 's06';
  };
  // ================= cast =================
  const LK = {
    wayne: { skin: '#f2c8a2', hair: '#4a3324', style: 'side', top: '#e9dcb8', topKind: 'shirt', tie: '#7a3b22', pants: '#6a5236', shoes: '#3a2a1c', glasses: '#2a2430', flare: true },
    kid1: { skin: '#e8b48a', hair: '#2a1c16', style: 'curly', top: '#3f6fa8', topKind: 'tee', pants: '#3b5b9a', shoes: '#f4f1ea', flare: true },
    kid2: { skin: '#f5c9a0', hair: '#8a5a2e', style: 'spiky', top: '#d9893a', topKind: 'hoodie', pants: '#5a4630', shoes: '#3a2a1c', flare: true },
    analyst: { skin: '#9a6a48', hair: '#1e1512', style: 'bun', top: '#2f8a6a', topKind: 'blouse', pants: '#2e3446', shoes: '#1d1b22' },
    elder: { skin: '#f2c8a2', hair: '#e6e2da', style: 'balding', top: '#8a5a3a', topKind: 'cardigan', shirt: '#eae4d4', pants: '#5a5a62', shoes: '#3a2a1c', glasses: '#2a2430' },
  };
  const actors = (t) => {
    const s = shotAt(t), w = where(t), A = [];
    if (w === '1976') {
      if (s === 's01') {
        const got = t > wd(1, 7) - 0.05;
        A.push(actor({ id: 'wayne', look: LK.wayne, seed: 61, x: WAY.x + 0.2, y: 0, z: WAY.z + 0.25, main: true, pose: alive(t, 61, { expr: got ? 'grin' : 'smile', L: got ? 'up' : 'hip', R: 'hold', hold: { R: 'receipt' }, k: t, facing: -1, look: -0.4 }) }));
      }
      if (s === 's02') {
        const moving = t > wd(2, 2) - 0.1 && t < st(3) - 0.2;
        A.push(actor({ id: 'wayne', look: LK.wayne, seed: 61, x: walkX(t), y: 0, z: WAY.z + 0.25 + 0.3 * ramp(t, wd(2, 2), st(3)), main: true,
          pose: alive(t, 61, { mode: moving ? 'walk' : 'stand', step: (t * 1.7) % 1, expr: t > wd(2, 4) ? 'smug' : 'neutral', L: 'hang', R: t > wd(2, 5) ? 'wave' : 'hang', k: t, facing: 1, look: 0.6 }) }));
      }
      if (s === 's03') {
        const lifted = t > wd(3, 2) - 0.05;
        A.push(actor({ id: 'kid1', look: LK.kid1, seed: 64, x: WB.x - 0.45, y: 0, z: WB.z - 0.2, pose: alive(t, 64, { expr: lifted ? 'grin' : 'smile', L: lifted ? 'up' : 'hang', R: 'hold', hold: { R: 'receipt' }, facing: 1, look: 0.4 }) }));
        A.push(actor({ id: 'kid2', look: LK.kid2, seed: 66, x: WB.x + 0.5, y: 0, z: WB.z - 0.25, pose: alive(t, 66, { expr: t > wd(3, 6) ? 'happy' : 'think', L: 'drum', R: 'drum', tableY: designY(COUNTER_H), k: (t * 5) % 1, facing: -1, look: -0.3 }) }));
      }
      if (s === 's04') {
        const hot = t > wd(4, 5) - 0.08;
        A.push(actor({ id: 'wayne', look: LK.wayne, seed: 61, x: 0.38, y: 0, z: -3.55, main: true, pose: alive(t, 61, { expr: hot ? 'nervous' : 'whisper', L: hot ? 'temple' : 'hang', R: hot ? 'point' : 'cross', facing: 1, look: 0.9, headTilt: hot ? 4 : 0 }) }));
      }
    }
    if (w === 'today') {
      const shock = s === 's06' && t > wd(6, 2) - 0.05;
      const pose = s === 's05' ? { expr: t > wd(5, 3) ? 'smug' : 'smile', L: 'hip', R: 'point', facing: 1, look: 0.7 } : { expr: shock ? 'shock' : 'gasp', L: shock ? 'cheek' : 'hang', R: shock ? 'cheek' : 'point', facing: 1, look: 0.8 };
      A.push(actor({ id: 'analyst', look: LK.analyst, seed: 71, x: MX + 0.2, y: 0, z: -3.5, main: true, pose: alive(t, 71, pose) }));
      if (shock) A.push(fxCard({ id: 'ex', kind: 'exclaim', x: MX + 0.47, y: 2.1, z: -3.45, s: 0.2 }));
    }
    if (w === 'home') {
      const shrug = t > wd(7, 4) - 0.1;
      A.push(actor({ id: 'elder', look: LK.elder, seed: 81, x: LX + 0.2, y: 0, z: -3.9, main: true, pose: alive(t, 81, { expr: shrug ? 'happy' : 'smile', L: shrug ? 'shrug' : 'hang', R: 'hold', hold: { R: 'glass' }, k: t, facing: 0, look: 0 }) }));
      if (shrug) A.push(fxCard({ id: 'sp', kind: 'sparkle', args: [t], x: LX + 0.6, y: 2.05, z: -3.85, s: 0.18 }));
    }
    return A;
  };
  // ================= text =================
  const M_ = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B_ = (a, cls = '', fs = 230) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const ui = (t) => {
    const s = shotAt(t), o = { capY: 1300 };
    if (s === 's01') { o.title = M_('10% OF APPLE') + M_('FOR $800', 'y'); o.titleK = 1; o.capY = 1500; }
    if (s === 's02') { o.capY = 1520; if (t > wd(2, 4) - 0.1) { o.title = B_('12 DAYS', 'y', 190); o.titleK = (t - wd(2, 4) + 0.1) / 0.28; } }
    if (s === 's03') o.capY = 1470;
    if (s === 's04') o.capY = 1600;
    if (s === 's05') o.capY = 1480;
    if (s === 's06') { o.capY = 1560; if (t > wd(6, 3) - 0.1) { o.title = M_('$500 BILLION', 'y'); o.titleK = (t - wd(6, 3) + 0.1) / 0.28; } }
    if (s === 's07') o.capY = 1520;
    return o;
  };
  const KEY = ['ten', 'percent', 'apple', 'eight', 'hundred', 'twelve', 'days', 'fifteen', 'grand', 'house', 'billion', 'regrets'];
  return { shots, cam, dof, light, update, actors, ui, KEY };
}
