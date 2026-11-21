// xr015-voyager-light-day: Voyager 1 reaches one light-day from Earth (NASA/JPL, Nov 18 2026).
// Three places in one world: deep space (x = +300), today's mission control (origin) and the 1977 control room (x = -40).
// Times come from the real ElevenLabs narration: st(i) = sentence i start, wd(i, j) = word j of sentence i.
// Loop: the last shot ("Out there, even...") ends on the exact frame-0 composition, so it runs into "Light needs a whole day...".
import { props, room, TABLE_H, designY } from '../../engine/cartoon/sets.js';

export default function story(E, tm) {
  const { THREE, P, add, tbox, box, group, mat, glow, lamp, actor, fxCard, alive, camKeys, EASE, clamp, lerp } = E;
  const { st, wd, we, total } = tm;
  const X = props(E);
  const TY = designY(TABLE_H);
  const ramp = (t, a, b) => clamp((t - a) / (b - a));
  const cyl = (r0, r1, h, n = 18) => new THREE.CylinderGeometry(r0, r1, h, n);
  const sph = (r, a = 24, b = 16) => new THREE.SphereGeometry(r, a, b);
  const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); draw(g, w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return { c, g, t }; };
  const screenMat = (tx, k = 1) => new THREE.MeshBasicMaterial({ map: tx.t, color: new THREE.Color(k, k, k), fog: false });
  const FONT = (w, s) => `${w} ${s}px Inter, Arial Black, Arial`;

  // ================= DEEP SPACE (x = +300) =================
  const S0 = new THREE.Vector3(300, 0, 0);
  const EARTH = new THREE.Vector3(300 - 50, 25, -6); // cartoon distance: small Earth up-left, behind Voyager in the hook view
  // stars: instanced glow dots on a big shell, invisible to the ink pass
  {
    const N = 1100, geo = sph(1, 6, 4), m = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false });
    const inst = new THREE.InstancedMesh(geo, m, N), r = P.rng(1977), M4 = new THREE.Matrix4(), col = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const u = r() * 2 - 1, a = r() * Math.PI * 2, R = 240 + r() * 40, s = 0.22 + Math.pow(r(), 6) * 0.9;
      const v = new THREE.Vector3(Math.sqrt(1 - u * u) * Math.cos(a), u, Math.sqrt(1 - u * u) * Math.sin(a)).multiplyScalar(R).add(S0);
      M4.makeScale(s, s, s).setPosition(v); inst.setMatrixAt(i, M4);
      const k = r(); col.set(k < 0.15 ? '#ffd9a0' : k < 0.3 ? '#a8c8ff' : '#ffffff').multiplyScalar(0.55 + r() * 0.6); inst.setColorAt(i, col);
    }
    inst.userData.ndSkip = true; inst.castShadow = false; inst.receiveShadow = false; E.scene.add(inst);
  }
  // a soft band of far dust (the galaxy) behind Voyager
  {
    const tx = canvasTex(1024, 256, (g, w, h) => { const r = P.rng(7);
      for (let i = 0; i < 900; i++) { const x = r() * w, y = h / 2 + (r() + r() + r() - 1.5) * h * 0.35, a = 0.04 + r() * 0.08, s = 6 + r() * 30;
        const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${170 + r() * 60},${150 + r() * 60},255,${a})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s); } });
    const band = new THREE.Mesh(new THREE.PlaneGeometry(520, 130), new THREE.MeshBasicMaterial({ map: tx.t, transparent: true, depthWrite: false, fog: false, blending: THREE.AdditiveBlending }));
    band.position.set(300 + 60, 30, 210); band.lookAt(S0); band.rotateZ(0.5); band.userData.ndSkip = true; E.scene.add(band);
    const band2 = band.clone(); band2.position.set(300 - 40, 60, -230); band2.lookAt(S0); band2.rotateZ(-0.4); band2.userData.ndSkip = true; E.scene.add(band2);
  }
  // Earth: a small painted globe with a thin glow, far behind Voyager
  const earthTx = canvasTex(512, 256, (g, w, h) => { const r = P.rng(31);
    g.fillStyle = '#2f7fd0'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { const cx = r() * w, cy = h * (0.2 + r() * 0.6); g.fillStyle = i % 3 ? '#5fae4a' : '#c9a35a'; g.beginPath();
      for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, R = 18 + r() * 34; g.lineTo(cx + Math.cos(a) * R * 1.6, cy + Math.sin(a) * R); } g.fill(); }
    g.fillStyle = 'rgba(255,255,255,.85)'; for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 30, 3 + r() * 6, 0, 0, 7); g.fill(); }
    g.fillStyle = '#f4f8ff'; g.fillRect(0, 0, w, 14); g.fillRect(0, h - 14, w, 14); });
  const earth = add(sph(2.6, 40, 28), mat({ map: earthTx.c, color: '#ffffff' }), EARTH.x, EARTH.y, EARTH.z, E.scene, { cast: false });
  const atmo = add(sph(2.95, 32, 20), new THREE.MeshBasicMaterial({ color: '#6fb6ff', transparent: true, opacity: 0.22, side: THREE.BackSide, fog: false, depthWrite: false }), EARTH.x, EARTH.y, EARTH.z, E.scene, { cast: false, noink: true });
  atmo.userData.ndSkip = true;

  // Voyager 1 (own model from primitives: dish, ten-sided bus, booms, RTGs, golden record). Local +z points at Earth.
  const V = group(S0.x, S0.y, S0.z); V.lookAt(EARTH);
  const WHITE = mat('#eef0f2', { side: THREE.DoubleSide }), FOIL = mat('#d9a83a'), DARK = mat('#3a3640'), BOOM = mat('#c9ccd2'), CREAM = mat('#e9e1cf');
  {
    const pts = []; for (let i = 0; i <= 14; i++) { const rr = 1.85 * i / 14; pts.push(new THREE.Vector2(rr, rr * rr / 4.6)); }
    const dish = add(new THREE.LatheGeometry(pts, 48), WHITE, 0, 0, 0.32, V); dish.rotation.x = Math.PI / 2;
    const rim = add(new THREE.TorusGeometry(1.85, 0.045, 8, 56), CREAM, 0, 0, 0.32 + 1.85 * 1.85 / 4.6, V);
    const fz = 0.32 + 1.1; add(cyl(0.16, 0.12, 0.28), CREAM, 0, 0, fz, V).rotation.x = Math.PI / 2; // subreflector / feed
    for (let i = 0; i < 3; i++) { const a = i / 3 * Math.PI * 2 + 0.5, from = new THREE.Vector3(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0.32 + 0.5), to = new THREE.Vector3(0, 0, fz);
      const d = to.clone().sub(from), s = add(cyl(0.022, 0.022, d.length(), 6), BOOM, 0, 0, 0, V); s.position.copy(from).addScaledVector(d, 0.5); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); }
    const bus = add(cyl(0.92, 0.92, 0.46, 10), FOIL, 0, 0, -0.02, V); bus.rotation.x = Math.PI / 2;
    for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + Math.PI / 10; const pnl = add(box(0.5, 0.36, 0.02), i % 2 ? DARK : mat('#b98a2e'), Math.cos(a) * 0.885, Math.sin(a) * 0.885, -0.02, V); pnl.rotation.set(0, Math.PI / 2, a, 'ZYX'); pnl.lookAt(V.localToWorld(new THREE.Vector3(Math.cos(a) * 5, Math.sin(a) * 5, -0.02))); }
    add(cyl(0.6, 0.7, 0.3, 10), DARK, 0, 0, -0.38, V).rotation.x = Math.PI / 2; // propellant tank cover
    const rec = add(cyl(0.2, 0.2, 0.03, 32), glow('#f2c65a', 1.15), 0.62, 0.62, -0.02, V, { cast: false }); rec.lookAt(V.localToWorld(new THREE.Vector3(5, 5, -0.02))); rec.rotateX(Math.PI / 2); // golden record
    const arm = (dir, len, r, m) => { const d = new THREE.Vector3(...dir).normalize(), c = add(cyl(r, r, len, 8), m, 0, 0, 0, V); c.position.copy(d.clone().multiplyScalar(len / 2 + 0.85)).add(new THREE.Vector3(0, 0, -0.1)); c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d); return d; };
    // RTG boom (three finned generators)
    const dr = arm([-1, -0.25, -0.15], 2.6, 0.04, BOOM);
    for (let i = 0; i < 3; i++) { const p = dr.clone().multiplyScalar(1.6 + i * 0.5).add(new THREE.Vector3(0, 0, -0.1)); const rt = add(cyl(0.2, 0.2, 0.42, 12), DARK, p.x, p.y, p.z, V); rt.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dr);
      for (let f = 0; f < 6; f++) { const fin = add(box(0.02, 0.4, 0.44), DARK, p.x, p.y, p.z, V); fin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dr); fin.rotateY(f / 6 * Math.PI); } }
    // science boom with the scan platform (two cameras)
    const ds = arm([1, -0.15, -0.2], 2.3, 0.045, BOOM); const sp = ds.clone().multiplyScalar(3.25).add(new THREE.Vector3(0, 0, -0.1));
    const plat = group(sp.x, sp.y, sp.z, V); add(tbox(0.5, 0.42, 0.42, 1), CREAM, 0, 0, 0, plat); add(cyl(0.11, 0.11, 0.55, 14), DARK, 0.05, 0.3, 0.12, plat).rotation.x = Math.PI / 2; add(cyl(0.07, 0.07, 0.4, 12), DARK, -0.16, 0.28, 0.12, plat).rotation.x = Math.PI / 2;
    add(box(0.36, 0.3, 0.2), FOIL, 0, -0.32, 0, plat);
    // magnetometer boom and the two plasma-wave whips
    arm([-0.35, 1, -0.3], 6.2, 0.03, BOOM); arm([0.55, -1, 0.15], 4.2, 0.012, BOOM); arm([-0.35, -1, 0.2], 4.2, 0.012, BOOM);
  }
  // light pulse travelling from Earth to Voyager: glowing head + fading trail
  const pulse = group(0, 0, 0); const trail = [];
  for (let i = 0; i < 16; i++) { const k = i / 15, m = new THREE.MeshBasicMaterial({ color: new THREE.Color('#fff4c8').multiplyScalar(i ? 1.4 : 2.2), transparent: true, opacity: i ? 0.75 * (1 - k) : 1, fog: false, depthWrite: false });
    const s = add(sph(i ? 0.42 * (1 - k * 0.7) : 0.6, 16, 12), m, 0, 0, -i * 2.0, pulse, { cast: false, noink: true }); s.userData.ndSkip = true; trail.push(s); }
  const halo = add(sph(1.5, 16, 12), new THREE.MeshBasicMaterial({ color: '#ffe9a0', transparent: true, opacity: 0.0, fog: false, depthWrite: false }), 0, 0, 0, pulse, { cast: false, noink: true }); halo.userData.ndSkip = true; halo.visible = false;
  const BEAM_TO = S0.clone().add(new THREE.Vector3(0, 0, 0.6)), BEAM_FROM = EARTH.clone().add(BEAM_TO.clone().sub(EARTH).normalize().multiplyScalar(3.4)); // starts outside the atmosphere, never drawn over the globe
  const _wp = new THREE.Vector3(), _cp = new THREE.Vector3(); let camNow = null;
  // true when, seen from the current camera, a point falls on Earth's disc (+25 %): such pulse pieces look pasted on the planet
  const onGlobe = (p) => { if (!camNow) return false; _cp.set(...camNow); const a = p.clone().sub(_cp), b = EARTH.clone().sub(_cp);
    return a.angleTo(b) < Math.atan(2.95 * 1.25 / b.length()); };
  const setPulse = (u) => { pulse.position.lerpVectors(BEAM_FROM, BEAM_TO, u); pulse.lookAt(BEAM_TO); pulse.scale.setScalar(0.65); pulse.updateMatrixWorld(true);
    for (const tr of trail) { tr.getWorldPosition(_wp); tr.visible = _wp.distanceTo(EARTH) > 5.5 && !onGlobe(_wp); } }; // never drawn over the globe
  // "hum" rings around the quiet spacecraft
  const rings = [0, 1, 2].map(() => { const m = new THREE.MeshBasicMaterial({ color: '#7fd0ff', transparent: true, opacity: 0, fog: false, depthWrite: false, side: THREE.DoubleSide });
    const r = add(new THREE.TorusGeometry(1, 0.03, 6, 64), m, 0, 0, 0.9, V, { cast: false, noink: true }); r.userData.ndSkip = true; return r; });

  // ================= MISSION CONTROL, TODAY (origin) =================
  const CR = room(E, E.scene, 0, 0, { w: 10, d: 8.4, h: 3.5, floor: E.mat({ map: P.checker(81, '#3a4150', '#2c323e', 8), rep: [4, 4] }), front: true,
    wallTop: E.mat({ map: P.plaster(82, 220), rep: [4, 2], color: '#5d6a86' }), wallLow: E.mat({ map: P.wainscot(83, 220, 26), rep: [5, 1] }), wainH: 0.9, ceil: '#1d2230' });
  // big wall screen (four pages swapped by the story) + frame
  const WS = { x: 0, y: 2.0, z: -4.12, w: 4.4, h: 2.3 };
  add(tbox(WS.w + 0.24, WS.h + 0.24, 0.1, 1), '#15171d', WS.x, WS.y, WS.z - 0.03, E.scene);
  const page = (draw) => { const tx = canvasTex(1100, 575, draw); const m = add(new THREE.PlaneGeometry(WS.w, WS.h), screenMat(tx), WS.x, WS.y, WS.z + 0.03, E.scene, { cast: false, receive: false, noink: true }); m.visible = false; return { m, tx }; };
  const BG = (g, w, h, a = '#0b1636', b = '#05091c') => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, a); gr.addColorStop(1, b); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,170,255,.12)'; g.lineWidth = 2; for (let x = 0; x < w; x += 55) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y < h; y += 55) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } };
  const txt = (g, s, x, y, size, col = '#ffffff', w = 900, align = 'center') => { g.font = FONT(w, size); g.textAlign = align; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(s, x, y); };
  const pDist = page((g, w, h) => { BG(g, w, h);
    txt(g, 'VOYAGER 1 — DISTANCE FROM EARTH', w / 2, 62, 40, '#8fb8ff', 800);
    g.fillStyle = '#2f7fd0'; g.beginPath(); g.arc(120, 300, 46, 0, 7); g.fill(); g.fillStyle = '#5fae4a'; g.beginPath(); g.arc(108, 290, 18, 0, 7); g.fill();
    g.setLineDash([22, 16]); g.strokeStyle = '#ffd23f'; g.lineWidth = 8; g.beginPath(); g.moveTo(180, 300); g.lineTo(930, 300); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#e9e1cf'; g.beginPath(); g.arc(985, 300, 30, 0, 7); g.fill(); g.fillStyle = '#d9a83a'; g.fillRect(960, 322, 50, 22);
    txt(g, '16,100,000,000 MI', w / 2, 175, 96, '#ffffff'); txt(g, '1 LIGHT-DAY', w / 2, 440, 72, '#ffd23f'); txt(g, 'SIGNAL: 24 HOURS ONE WAY', w / 2, 520, 34, '#8fb8ff', 700); });
  const pMem = page((g, w, h) => { BG(g, w, h, '#14112e', '#070618');
    txt(g, 'MEMORY', w / 2, 70, 64, '#ffffff');
    txt(g, 'VOYAGER 1', 60, 205, 46, '#8fb8ff', 900, 'left'); g.fillStyle = '#ffd23f'; g.fillRect(60, 245, 26, 60); txt(g, '69 KB', 104, 275, 44, '#ffd23f', 900, 'left');
    txt(g, '1 SELFIE', 60, 375, 46, '#ff9aa8', 900, 'left'); g.fillStyle = '#ff5a6e'; g.fillRect(60, 415, 980, 60); txt(g, 'MUCH BIGGER', w / 2 + 20, 445, 40, '#ffffff', 900); });
  const pWait = page((g, w, h) => {}); // redrawn live (countdown)
  const drawWait = (secLeft, sent) => { const g = pWait.tx.g, w = 1100, h = 575; BG(g, w, h, '#0d2a1e', '#04120c');
    txt(g, sent ? 'MESSAGE SENT  ✓' : 'TYPING…', w / 2, 70, 52, '#7fffb0');
    const s = Math.max(0, Math.round(secLeft)), hh = Math.floor(s / 3600), mm = Math.floor(s / 60) % 60, ss = s % 60, p2 = (n) => String(n).padStart(2, '0');
    txt(g, 'REPLY IN', w / 2, 200, 52, '#bfffd8', 800); txt(g, `${p2(hh)}:${p2(mm)}:${p2(ss)}`, w / 2, 330, 150, '#ffffff'); txt(g, 'DAY ' + (s > 86400 ? 1 : 2) + ' OF 2', w / 2, 480, 54, '#ffd23f');
    pWait.tx.t.needsUpdate = true; };
  let waitKey = '';
  const pQuiet = page((g, w, h) => { BG(g, w, h, '#2a0b10', '#120407');
    txt(g, 'NO DATA', w / 2, 120, 130, '#ff4a5a'); txt(g, 'CARRIER SIGNAL ONLY', w / 2, 240, 50, '#ffb0b8', 800);
    g.strokeStyle = '#7fffb0'; g.lineWidth = 7; g.beginPath(); for (let x = 60; x <= w - 60; x += 4) { const y = 400 + Math.sin(x * 0.09) * 5 * Math.exp(-Math.pow((x - 560) / 120, 2)); x === 60 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
    txt(g, 'SINCE NOV 14', w / 2, 505, 46, '#ffffff', 800); });
  const pHum = page((g, w, h) => { BG(g, w, h, '#2a0b10', '#120407'); // close-up backdrop: only the flat carrier line, no text to crop
    g.strokeStyle = '#7fffb0'; g.lineWidth = 9; g.beginPath(); for (let x = 0; x <= w; x += 4) { const y = 330 + Math.sin(x * 0.09) * 6 * Math.exp(-Math.pow((x - 560) / 120, 2)); x === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); });
  const PAGES = { dist: pDist, mem: pMem, wait: pWait, quiet: pQuiet, hum: pHum };
  // consoles: two curved-ish rows of desks with glowing monitors (people stand in front of them, facing the camera)
  const desk = (x, z, rotY = 0, w = 1.6) => { const g = group(x, 0, z); g.rotation.y = rotY;
    add(tbox(w, 0.06, 0.7, 1), '#2a2e36', 0, 0.76, 0, g); add(tbox(w - 0.1, 0.72, 0.6, 1), '#3a3f4a', 0, 0.37, 0.02, g);
    for (let i = 0; i < 2; i++) { const mx = (i - 0.5) * w * 0.48; add(tbox(0.62, 0.4, 0.05, 1), '#15171d', mx, 1.04, -0.2, g); const scr = add(box(0.56, 0.34, 0.01), glow(i ? '#6fd0ff' : '#7fffb0', 0.85), mx, 1.04, -0.172, g, { cast: false, noink: true }); scr.userData.ndSkip = false;
      add(box(0.06, 0.12, 0.06), '#15171d', mx, 0.83, -0.2, g); }
    add(box(0.5, 0.02, 0.16), '#1d2028', 0, 0.8, 0.12, g); return g; };
  // back row (in front of the wall screen, monitors face the room)
  for (const [x, r] of [[-3.3, 0.35], [3.3, -0.35]]) { const d = desk(x, -2.9, r + Math.PI, 1.8); }
  // side rows
  desk(-4.1, -0.3, Math.PI / 2, 1.8); desk(4.1, -0.3, -Math.PI / 2, 1.8);
  // hero desk (Sam, seated, front left): table + keyboard + side monitor, chair behind him
  const HD = { x: -1.2, z: 0.9 };
  const hdesk = group(HD.x, 0, HD.z); add(tbox(1.5, 0.05, 0.72, 1), '#2a2e36', 0, TABLE_H - 0.025, 0, hdesk); add(tbox(1.4, TABLE_H - 0.05, 0.62, 1), '#3a3f4a', 0, (TABLE_H - 0.05) / 2, 0, hdesk);
  const kb = add(box(0.46, 0.02, 0.15), '#1d2028', 0.02, TABLE_H + 0.01, -0.14, hdesk);
  const mon = group(-0.6, TABLE_H, -0.1, hdesk); mon.rotation.y = 0.75; add(tbox(0.56, 0.36, 0.04, 1), '#15171d', 0, 0.3, 0, mon); add(box(0.5, 0.3, 0.01), glow('#6fd0ff', 0.9), 0, 0.3, 0.022, mon, { cast: false, noink: true }); add(box(0.05, 0.12, 0.05), '#15171d', 0, 0.06, 0, mon);
  const mug = add(cyl(0.045, 0.04, 0.1, 14), '#c0392b', 0.5, TABLE_H + 0.05, 0.05, hdesk);
  X.chair(E.scene, HD.x, HD.z - 0.61, 0, '#24242c');
  const clock = X.wallClock(E.scene, 3.6, 2.55, -4.13, 0, 0.32);
  // lights: cool ceiling strips + screen spill
  for (const x of [-2.6, 0, 2.6]) { add(box(1.6, 0.04, 0.24), glow('#e8f0ff', 1.2), x, 3.44, -1.2, E.scene, { cast: false, noink: true }); lamp(x, 3.0, -1.2, '#dfe8ff', 1.8, 7, 'ceil'); }
  for (const x of [-2.6, 0, 2.6]) { add(box(1.6, 0.04, 0.24), glow('#e8f0ff', 1.2), x, 3.44, 1.6, E.scene, { cast: false, noink: true }); lamp(x, 3.0, 1.6, '#dfe8ff', 1.4, 7, 'ceil'); }
  const scrLamp = lamp(0, 1.9, -3.2, '#6f9cff', 3.0, 7, 'screen');
  X.plant(E.scene, -4.4, -3.6, 1.1); X.plant(E.scene, 4.4, 3.4, 1.0);
  // NASA-style mission patches would be logos: plain painted pictures instead
  X.frame(E.scene, -4.88, 2.1, 1.6, Math.PI / 2, 0.7, 0.5, 91); X.frame(E.scene, 4.88, 2.1, 1.6, -Math.PI / 2, 0.7, 0.5, 93);

  // ================= MISSION CONTROL, 1977 (x = -40) =================
  const LX = -40, LZ = 0;
  room(E, E.scene, LX, LZ, { w: 9, d: 7.4, h: 3.2, floor: E.mat({ map: P.checker(71, '#d9cfb8', '#8a6a4a', 6), rep: [4, 4] }), wallTop: E.mat({ map: P.plaster(72, 38), rep: [4, 2], color: '#d8c8a8' }), wallLow: E.mat({ map: P.wainscot(73, 28, 30), rep: [4, 1] }), wainH: 1.0, ceil: '#5a4a3a' });
  const crt = (x, z, col = '#7fffb0') => { const g = group(x, 0, z); add(tbox(1.3, 0.95, 0.75, 1), '#cdbf9a', 0, 0.475, 0, g); add(tbox(1.32, 0.05, 0.85, 1), '#a8823a', 0, 0.97, 0.05, g);
    add(tbox(1.2, 0.85, 0.55, 1), '#bfb08a', 0, 1.42, -0.12, g); add(box(0.62, 0.46, 0.02), glow(col, 0.8), -0.22, 1.45, 0.16, g, { cast: false, noink: true });
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) add(cyl(0.025, 0.025, 0.03, 8), ['#d6273a', '#f2c14e', '#4d8a2e', '#f4f1ea'][(i + j) % 4], 0.3 + i * 0.1, 1.3 + j * 0.08, 0.16, g).rotation.x = Math.PI / 2;
    for (let i = 0; i < 6; i++) add(box(0.12, 0.02, 0.08), '#f4f1ea', -0.4 + i * 0.15, 1.0, 0.25, g); return g; };
  for (const x of [-2.6, -1.2, 0.2, 1.6, 3.0]) crt(LX + x, LZ - 2.95);
  add(box(0.4, 0.52, 0.02), E.mat({ map: P.calendar('1977', 'SEP') }), LX + 3.7, 2.2, LZ - 3.62, E.scene, { cast: false });
  // the TV on the wall: a launch, drawn live
  const tvTx = canvasTex(400, 300, () => {});
  add(tbox(1.3, 1.0, 0.4, 1), '#5a4632', LX - 0.4, 2.45, LZ - 3.45, E.scene); const tv = add(box(1.06, 0.78, 0.02), new THREE.MeshBasicMaterial({ map: tvTx.t, fog: false }), LX - 0.4, 2.45, LZ - 3.24, E.scene, { cast: false, noink: true });
  let tvKey = '';
  const drawTV = (k) => { const key = Math.round(k * 60); if (key === tvKey) return; tvKey = key; const g = tvTx.g, w = 400, h = 300;
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#7fa8c8'); gr.addColorStop(1, '#e8d8b0'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = '#6a5a48'; g.fillRect(0, 250, w, 50); g.fillStyle = '#4a4a54'; g.fillRect(150, 120, 14, 130); // tower
    const y = 250 - 120 - k * 180; g.fillStyle = '#f4f1ea'; g.fillRect(186, y, 28, 120); g.beginPath(); g.moveTo(186, y); g.lineTo(200, y - 30); g.lineTo(214, y); g.fill(); g.fillStyle = '#c0392b'; g.fillRect(186, y + 40, 28, 10);
    for (let i = 0; i < 9; i++) { const r = 18 + i * 7 + k * 30; g.fillStyle = `rgba(250,240,225,${0.85 - i * 0.07})`; g.beginPath(); g.arc(200 + Math.sin(i * 2.1) * (20 + k * 60), Math.min(270, y + 135 + i * 12), r, 0, 7); g.fill(); }
    g.fillStyle = '#ffb040'; g.beginPath(); g.moveTo(190, y + 120); g.lineTo(200, y + 160 + Math.sin(k * 90) * 8); g.lineTo(210, y + 120); g.fill();
    g.fillStyle = 'rgba(0,0,0,.18)'; for (let yy = 0; yy < h; yy += 4) g.fillRect(0, yy, w, 1.5); tvTx.t.needsUpdate = true; };
  X.pendant(E.scene, LX - 1.5, 2.6, LZ - 1.2, { col: '#a8823a', i: 3 }); X.pendant(E.scene, LX + 1.6, 2.6, LZ - 1.2, { col: '#a8823a', i: 3 });
  lamp(LX, 2.4, LZ + 1.5, '#ffe2b0', 2.2, 7, 'warm');

  // ================= shots =================
  const T = {
    s01: 0, s02: st(2), s03: wd(2, 2) - 0.08, s04: st(3), s05: st(4), s06: st(5), s07: st(6), s08: wd(6, 3) - 0.1, s09: st(7), s10: st(8),
  };
  const shots = Object.entries(T).map(([id, start]) => ({ id, start }));
  const shotAt = (t) => { let id = 's01'; for (const [k, v] of Object.entries(T)) if (t >= v) id = k; return id; };
  const where = (t) => { const s = shotAt(t); return ['s01', 's02', 's08', 's10'].includes(s) ? 'space' : s === 's03' ? '1977' : 'control'; };
  const aim = (tg, Wd, yaw = 0, pitch = 8, fov = 36) => { const hf = 2 * Math.atan(Math.tan(fov * Math.PI / 360) * 0.5625), d = Wd / (2 * Math.tan(hf / 2));
    const y = yaw * Math.PI / 180, p = pitch * Math.PI / 180; return { pos: [tg[0] + Math.sin(y) * Math.cos(p) * d, tg[1] + Math.sin(p) * d, tg[2] + Math.cos(y) * Math.cos(p) * d], look: [...tg], fov }; };
  const k = (t, tg, Wd, yaw, pitch, fov, o = {}) => ({ t, ...aim(tg, Wd, yaw, pitch, fov), ...o });
  // space framing: camera on Voyager's back side (Earth is behind it in the frame), 3/4 view
  const VC = [S0.x, S0.y, S0.z], VUP = [S0.x - 0.3, S0.y + 1.2, S0.z];
  const yawE = Math.atan2(S0.x - EARTH.x, S0.z - EARTH.z) * 180 / Math.PI; // yaw that puts Earth straight behind Voyager
  // hook: camera beyond Voyager and off to the side, looking back toward Earth -> Earth small top-left, Voyager big bottom-right,
  // the light pulse races down the diagonal between them with its trail visible
  // hook: side view of the Earth -> Voyager line (Earth top, Voyager bottom), the light pulse races down between them with its trail
  const camAt = (d, dy, cy, fov, t) => { const look = S0.clone().add(new THREE.Vector3(0, dy, 0)), pos = look.clone().add(new THREE.Vector3(d, cy, 3)); return { t, pos: pos.toArray(), look: look.toArray(), fov }; };
  const HOOK = camAt(14.5, 2.0, -3, 46, 0);
  const K = {
    s01: [HOOK, camAt(13.2, 1.9, -2.8, 46, T.s02)],
    s02: [k(T.s02, VC, 6.4, yawE + 145, 12, 36), k(T.s03, VC, 5.6, yawE + 128, 10, 36)],
    s03: [k(T.s03, [LX + 0.2, 1.55, LZ - 1.6], 4.6, 6, 6, 40), k(wd(2, 4), [LX + 0.2, 1.55, LZ - 1.6], 4.1, 2, 5, 40), k(T.s04, [LX + 0.1, 1.6, LZ - 1.8], 3.8, 0, 4, 40)],
    s04: [k(T.s04, [0, 1.5, -2.6], 4.45, 0, 3, 44), k(wd(3, 2), [0.02, 1.48, -2.6], 4.0, -2, 3, 44), k(T.s05, [0.03, 1.47, -2.6], 3.95, -3, 3, 44)],
    s05: [k(T.s05, [HD.x + 0.62, 1.62, HD.z - 0.45], 2.95, 2, 2, 36), k(T.s06, [HD.x + 0.62, 1.6, HD.z - 0.45], 2.85, 1, 2, 36)],
    s06: [k(T.s06, [HD.x + 0.05, 1.1, HD.z - 0.2], 2.3, -18, 12, 36), k(wd(5, 2), [HD.x + 0.05, 1.1, HD.z - 0.2], 2.1, -14, 10, 36), k(wd(5, 6), [HD.x + 1.05, 1.5, -1.4], 3.9, -16, 5, 40, { ease: 'easeOut' }), k(T.s07, [HD.x + 1.1, 1.52, -1.5], 3.7, -17, 5, 40)],
    s07: [k(T.s07, [0, 1.42, -2.5], 3.75, 4, 3, 44), k(T.s08, [0, 1.42, -2.5], 3.6, 3, 3, 44)],
    s08: [k(T.s08, VC, 9.5, yawE + 160, 4, 36), k(T.s09, VC, 8.0, yawE + 170, 2, 36)],
    s09: [k(T.s09, [-0.9, 1.72, -2.45], 1.5, 6, 2, 34), k(T.s10, [-0.9, 1.72, -2.45], 1.25, 4, 2, 34)],
    s10: [camAt(21, 3.2, -3.5, 46, T.s10), { ...HOOK, t: total - 0.02, ease: 'easeOut' }],
  };
  const shake = [{ t: wd(1, 3), a: 0.8 }, { t: wd(2, 4), a: 0.9 }, { t: wd(3, 2), a: 0.7 }, { t: wd(6, 3), a: 1.0 }];
  const ROOMS = { control: [[-4.75, 0.3, -3.9], [4.75, 3.2, 3.95]], '1977': [[LX - 4.25, 0.3, LZ - 3.4], [LX + 4.25, 3.0, LZ + 3.5]], space: [[-1e4, -1e4, -1e4], [1e4, 1e4, 1e4]] };
  const cam = (t) => { const s = shotAt(t), c = camKeys(K[s], t, { shake, hand: where(t) === 'space' ? 0.003 : 0.005, creep: s === 's10' || s === 's01' ? 0 : 0.035 }), b = ROOMS[where(t)]; const o = E.keepInside(c, b[0], b[1]); if (where(t) === 'space') o.near = 0.2; return o; };
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const dof = (t) => {
    const s = shotAt(t), c = cam(t);
    if (where(t) === 'space') return { focus: dist(c.pos, VC), cinf: 0 };
    if (s === 's05') return { focus: dist(c.pos, [HD.x, 1.15, HD.z - 0.38]), cinf: 9 };
    if (s === 's09') return { focus: dist(c.pos, [-0.9, 1.72, -2.45]), cinf: 9 };
    if (s === 's06') return { focus: dist(c.pos, [HD.x, 1.1, HD.z - 0.38]), cinf: 5 };
    if (s === 's03') return { focus: dist(c.pos, [LX, 1.6, LZ - 1.7]), cinf: 5 };
    return { focus: dist(c.pos, [0, 1.7, -2.4]), cinf: 4 };
  };
  // ================= light =================
  const SPACE = { skyTop: '#04050d', skyHor: '#0a0f2a', sky: '#9fb4ff', ground: '#20123a', hemi: 0.55, sun: '#fff1d8', sunI: 2.7, az: 120, el: 28, fog: '#04050d', fogNear: 700, fogFar: 1500,
    sat: 1.15, vig: 0.38, card: '#ffffff', gain: '#ffffff', lift: '#000000', grain: 0.035, shadowExt: 9, sunDisc: '#fff4d0', sunSize: 0.0012, lamps: {} };
  const QUIETSP = { ...SPACE, sunI: 1.5, hemi: 0.35, gain: '#cfd8ff', sat: 0.9, vig: 0.5 };
  const CTRL = { sky: '#cfe0ff', ground: '#2a3040', hemi: 0.95, sun: '#dfe8ff', sunI: 0.6, az: 200, el: 60, fog: '#101420', fogNear: 30, fogFar: 90, skyTop: '#101420', skyHor: '#101420',
    sat: 1.1, vig: 0.3, card: '#f2f5ff', gain: '#ffffff', lift: '#03050c', grain: 0.03, shadowExt: 7, lamps: { ceil: 1, screen: 1 } };
  const QUIET = { ...CTRL, hemi: 0.6, card: '#ffd9dc', gain: '#ffe0e0', sat: 1.0, vig: 0.45, lamps: { ceil: 0.45, screen: 1.6 } };
  const RETRO = { ...CTRL, sky: '#ffe0b0', ground: '#6b4a3a', hemi: 1.25, sun: '#ffd49a', sunI: 0.9, card: '#ffeccc', sepia: 0.45, grain: 0.07, vig: 0.42, sat: 0.95, gain: '#fff1dc', lift: '#000000', lamps: { warm: 1.3 } };
  const light = (t) => {
    const s = shotAt(t);
    if (s === 's08') return QUIETSP;
    if (where(t) === 'space') return SPACE;
    if (s === 's03') return RETRO;
    if (s === 's07' || (s === 's09')) return QUIET;
    return CTRL;
  };
  // ================= world animation =================
  // pulse position along Earth -> Voyager. Hook crawls 0.35 -> 0.62; loop shot crawls 0.12 -> 0.35 so the end matches frame 0.
  const U0 = 0.55;
  const update = (t) => {
    const s = shotAt(t);
    let u = s === 's01' ? U0 + (0.86 - U0) * EASE.easeIn(Math.pow(t / T.s02, 0.6)) : s === 's10' ? 0.2 + (U0 - 0.2) * ramp(t, T.s10, total - 0.02) : -1;
    camNow = cam(t).pos; pulse.visible = u >= 0; if (u >= 0) setPulse(u);
    const halo0 = 1 + 0.12 * Math.sin(t * 9); halo.scale.setScalar(halo0);
    // wall screen pages
    const pg = s === 's05' ? 'mem' : s === 's06' ? 'wait' : s === 's07' ? 'quiet' : s === 's09' ? 'hum' : 'dist';
    for (const [k2, p] of Object.entries(PAGES)) p.m.visible = k2 === pg;
    // countdown: 48 h flies by from "takes" to the end of the sentence
    if (s === 's06') { const sent = t >= wd(5, 1); const left = 172800 * (1 - EASE.easeOut(ramp(t, wd(5, 4), st(6) + 0.05))); const key = sent + '|' + Math.round(left / 97); if (key !== waitKey) { waitKey = key; drawWait(sent ? left : 172800, sent); } }
    // clock: time-lapse during the wait, slow otherwise
    const lapse = s === 's06' ? EASE.easeOut(ramp(t, wd(5, 4), st(6) + 0.05)) * 48 * 60 : 0;
    clock.set(14 * 60 + 16 + lapse + t / 60, (t * 60) % 60);
    // 1977 TV launch
    if (s === 's03') drawTV(EASE.easeIn ? EASE.easeIn(ramp(t, wd(2, 2), T.s04)) : ramp(t, wd(2, 2), T.s04) ** 2);
    // quiet hum rings
    rings.forEach((r, i) => { const ph = ((t - T.s08) * 0.9 + i / 3) % 1; const on = s === 's08' && t > T.s08 + 0.25; r.scale.setScalar(2.0 + ph * 3.2); r.material.opacity = on ? 0.5 * (1 - ph) : 0; });
    scrLamp.color.set(s === 's07' || s === 's09' ? '#ff5a6a' : s === 's06' ? '#7fffb0' : '#6f9cff');
    earth.rotation.y = t * 0.05;
  };
  // ================= cast =================
  const LK = {
    ana: { skin: '#7d5236', hair: '#1e1512', style: 'pony', top: '#2f6fb5', topKind: 'polo', pants: '#2e3446', shoes: '#1d1b22', glasses: '#2a2430' },
    ben: { skin: '#f5c9a0', hair: '#c7642e', style: 'curly', top: '#e8e4da', topKind: 'shirt', tie: '#2f5d4a', pants: '#3a3a44', shoes: '#2a2a2a', beard: '#c7642e' },
    sam: { skin: '#e8b48a', hair: '#2a1c16', style: 'spiky', top: '#d6493a', topKind: 'hoodie', pants: '#34425e', shoes: '#f0ece4' },
    r1: { skin: '#ffe2c2', hair: '#6b4628', style: 'side', top: '#f2ead8', topKind: 'shirt', tie: '#7a3b22', pants: '#5a4630', shoes: '#3a2a1c', glasses: '#2a2430', moustache: '#6b4628', flare: true },
    r2: { skin: '#c99067', hair: '#2a1c16', style: 'short', top: '#e9dcb8', topKind: 'shirt', tie: '#2f4a6a', pants: '#4a4030', shoes: '#2a1c14', sideburns: true, flare: true },
    r3: { skin: '#f5c9a0', hair: '#c7642e', style: 'bob', top: '#c9793a', topKind: 'blouse', pants: '#5a4630', shoes: '#3a2a1c' },
  };
  const actors = (t) => {
    const s = shotAt(t), w = where(t), A = [];
    if (w === 'control') {
      // Ana (stands left of the wall screen), Ben (right), Sam (seated at the front desk)
      let ap = { expr: 'smile', L: 'hip', R: 'point', facing: 1, look: 0.6 }, bp = { expr: 'neutral', L: 'hang', R: 'hang', facing: -1, look: -0.5 };
      if (s === 's04') { ap = { expr: t > wd(3, 1) ? 'happy' : 'smile', L: 'hip', R: 'up', facing: 1, look: 0.8, headTilt: 4 }; bp = { expr: t > wd(3, 2) - 0.05 ? 'gasp' : 'neutral', L: t > wd(3, 2) - 0.05 ? 'cheek' : 'hang', R: t > wd(3, 2) - 0.05 ? 'cheek' : 'hang', facing: -1, look: -0.6 }; }
      if (s === 's07') { ap = { expr: t > wd(6, 1) ? 'nervous' : 'think', L: 'cross', R: 'chin', facing: 1, look: 0.7 }; bp = { expr: 'nervous', L: 'temple', R: 'hang', facing: -1, look: -0.7 }; }
      if (s === 's09') ap = { expr: t > wd(7, 3) - 0.1 ? 'think' : 'whisper', L: 'chin', R: 'cross', facing: 0, look: 0, talk: 0 };
      if (s !== 's05' && s !== 's06') {
        A.push(actor({ id: 'ana', look: LK.ana, seed: 71, x: s === 's09' ? -0.9 : s === 's07' ? -1.12 : -1.4, y: 0, z: -2.45, pose: alive(t, 71, ap) }));
        if (s !== 's09') A.push(actor({ id: 'ben', look: LK.ben, seed: 74, x: s === 's07' ? 1.12 : 1.42, y: 0, z: -2.3, pose: alive(t, 74, bp) }));
        if (s === 's07') { A.push(fxCard({ id: 'sw1', kind: 'sweat', x: 1.88, y: 1.78, z: -2.25, s: 0.12 })); A.push(fxCard({ id: 'sw2', kind: 'sweat', x: -1.4, y: 1.85, z: -2.4, s: 0.11 })); }
        if (s === 's09' && t > wd(7, 3) - 0.1) A.push(fxCard({ id: 'q', kind: 'question', x: -1.2, y: 1.84, z: -2.4, s: 0.28 }));
      }
      // Sam at the hero desk
      let sp = { mode: 'sit', tableY: TY, expr: 'bored', L: 'table', R: 'table', facing: 0, look: 0 };
      if (s === 's05') sp = { mode: 'sit', tableY: TY, expr: t > wd(4, 3) - 0.08 ? 'gasp' : 'whisper', L: 'table', R: 'raise', hold: { R: 'phone' }, facing: 1, look: 0.4 };
      if (s === 's06') {
        if (t < wd(5, 1) + 0.1) sp = { mode: 'sit', tableY: TY, expr: 'grin', L: 'drum', R: 'drum', k: (t * 6) % 1, facing: 0, look: 0.3 };
        else if (t < wd(5, 4)) sp = { mode: 'sit', tableY: TY, expr: 'laugh', L: 'table', R: 'table', facing: 0, look: 0 };
        else sp = { mode: 'sit', tableY: TY, expr: t > wd(5, 6) ? 'bored' : 'annoyed', L: 'chin', R: 'drum', k: t, facing: 0, look: 0.6, headTilt: -5 };
      }
      if (s === 's05' || s === 's06') A.push(actor({ id: 'sam', look: LK.sam, seed: 77, x: HD.x, y: 0, z: HD.z - 0.38, pose: alive(t, 77, sp) }));
    }
    if (w === '1977') {
      const cheer = t >= wd(2, 4) - 0.05;
      const P3 = [['r1', LK.r1, -1.4, -1.8, 81], ['r2', LK.r2, 0.15, -1.55, 82], ['r3', LK.r3, 1.6, -1.8, 83]];
      P3.forEach(([id, lk, x, z, sd], i) => {
        const pose = cheer ? { expr: i === 1 ? 'laugh' : 'happy', L: 'up', R: 'up', facing: 0, look: 0, k: t } : { expr: 'nervous', L: i === 0 ? 'chin' : 'hang', R: i === 2 ? 'cheek' : 'hang', facing: i === 0 ? 1 : -1, look: i === 0 ? 0.5 : -0.5 };
        A.push(actor({ id, look: lk, seed: sd, x: LX + x, y: cheer ? Math.abs(Math.sin((t - wd(2, 4)) * 9 + i)) * 0.06 : 0, ground: 0, z: LZ + z, pose: alive(t, sd, pose) }));
      });
      if (cheer) A.push(fxCard({ id: 'spk', kind: 'sparkle', args: [t], x: LX + 0.15, y: 2.05, z: LZ - 1.5, s: 0.22 }));
    }
    return A;
  };
  // ================= text =================
  const M_ = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B_ = (a, cls = '', fs = 230) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const ui = (t) => {
    const s = shotAt(t), o = { capY: 1290, exterior: ['s01', 's02', 's08', 's10'].includes(s) };
    if (s === 's01') { o.title = M_('LIGHT NEEDS') + M_('A WHOLE DAY', 'y'); o.titleK = 1; o.capY = 1480; }
    if (s === 's02') { o.title = M_('VOYAGER 1', 'y'); o.titleK = (t - T.s02) / 0.28; o.capY = 1480; }
    if (s === 's03' && t > wd(2, 4) - 0.1) { o.title = B_('1977', 'y', 200); o.titleK = (t - wd(2, 4) + 0.1) / 0.28; }
    if (s === 's04' && t > wd(3, 1) - 0.1) { o.title = M_('16 BILLION', 'y') + M_('MILES'); o.titleK = (t - wd(3, 1) + 0.1) / 0.28; o.capY = 1480; }
    if (s === 's05') o.capY = 1440;
    if (s === 's06') { o.capY = 1480; if (t > wd(5, 5) - 0.1) { o.title = M_('2 DAYS', 'y'); o.titleK = (t - wd(5, 5) + 0.1) / 0.28; } }
    if (s === 's07') o.capY = 1480;
    if (s === 's08') o.capY = 1480;
    if (s === 's09') o.capY = 1480;
    if (s === 's10') o.capY = 1480;
    return o;
  };
  const KEY = ['light', 'whole', 'day', 'voyager', '1977', 'sixteen', 'billion', 'miles', 'memory', 'selfie', 'two', 'days', 'quiet', 'waiting'];
  return { shots, cam, dof, light, update, actors, ui, KEY };
}
