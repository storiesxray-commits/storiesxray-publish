import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, M, fresnel, glowMat, addMat, halo, setOpacity, lights, shake, Subject, poseStand } from '../../engine/engine.js';

// xr011 — "You've never heard your real voice": you hear yourself through air + bone conduction (the skull boosts low
// frequencies), a recording only captures the air; Hughes & Harrison 2013 (Perception): people unknowingly rated their own
// recorded voice as more attractive. All people are GENERIC busts built from random parameters (no likeness, no photos,
// no logos, generic microphone and phone). The skull is a cartoon x-ray schematic (channel style), nothing graphic.
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);

// palette: night radio studio — deep indigo/plum, neon magenta + cyan x-ray, warm yellow air waves (new vs. xr008 bathroom / xr010 lab)
const TEAL = 0x22d3ee, YEL = 0xffd60a, RED = 0xff3b30, MAG = 0xff3ea5, PINK = 0xff6fb5, GREEN = 0x4dff88, BONE = 0xeaf4ff, PLUM = 0x2a1240, GOLD = 0xf2b84b, CORAL = 0xff6b6b;
const SKINS = [0xf1c9a5, 0xd9a27e, 0xb87a55, 0x8d5a3b, 0x6b4128, 0xe8b894, 0xc68b62];
const HAIRS = [0x1f1a17, 0x3b2a1e, 0x6a4326, 0xa0652e, 0xd9b26a, 0x8a8f96, 0x2b2b33, 0x5a1f1f];
const SHIRTS = [0x3a86ff, 0xff006e, 0x8338ec, 0xfb5607, 0x2ec4b6, 0xe9c46a, 0x6a994e, 0xe5e5e5, 0x264653, 0xd62828];

function labelSprite(text, color = '#ffffff', w = 1.6) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 192; const x = cv.getContext('2d');
  x.font = '900 112px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.lineWidth = 28; x.strokeStyle = '#0b0b0f'; x.strokeText(text, 512, 100); x.fillStyle = color; x.fillText(text, 512, 100);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.scale.set(w, w * 192 / 1024, 1); s.renderOrder = 20; return s;
}
function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function bgGrad(scene, top = '#0a0620', mid = '#24104f', bot = '#3a0f4a') {
  scene.background = canvasTex(64, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, top); g.addColorStop(0.6, mid); g.addColorStop(1, bot); x.fillStyle = g; x.fillRect(0, 0, w, h); });
}

// ---------------- faces ----------------
// random generic face parameters
function faceP(seed) {
  const r = rnd(seed), pick = a => a[Math.floor(r() * a.length)];
  return { skin: pick(SKINS), hair: pick(HAIRS), shirt: pick(SHIRTS), style: Math.floor(r() * 5), fw: lerp(0.86, 1.04, r()), fh: lerp(1.0, 1.16, r()),
    eg: lerp(0.15, 0.2, r()), es: lerp(0.85, 1.15, r()), nl: lerp(0.8, 1.3, r()), nw: lerp(0.8, 1.3, r()), mw: lerp(0.8, 1.25, r()), by: lerp(-0.02, 0.03, r()) };
}
// "YOUR face" — the hero face used for the look-alike pair
const HERO = { skin: 0xd9a27e, hair: 0x1f1a17, shirt: 0x3a86ff, style: 0, fw: 0.95, fh: 1.1, eg: 0.17, es: 1.08, nl: 1.05, nw: 1.0, mw: 1.05, by: 0.0, qx: 0.17, browUp: 0, eyeDy: 0, mt: 0 };
// head-and-shoulders bust; head center at y=0, radius ~0.5. o.simple = cheap crowd version; o.xray = fresnel glass.
function Bust(p, o = {}) {
  const g = new THREE.Group(), xr = !!o.xray, simple = !!o.simple;
  const fm = xr ? fresnel(o.xcol || TEAL, 2.0, 0.95, 0.02) : null;
  const mk = (geo, col, px = 5) => xr ? new THREE.Mesh(geo, fm) : (simple ? new THREE.Mesh(geo, toon(col)) : M(geo, col, { px }));
  const fw = p.fw, fh = p.fh, R = 0.5;
  const sh = mk(new THREE.SphereGeometry(0.66, 32, 20), p.shirt); sh.scale.set(1.3, 0.62, 0.66); sh.position.y = -1.02; g.add(sh);
  const neck = mk(new THREE.CylinderGeometry(0.17, 0.21, 0.42, 16), p.skin, 4); neck.position.y = -0.58; g.add(neck);
  if (o.torso) { const to = mk(new THREE.CylinderGeometry(0.8, 0.86, 2.0, 32), p.shirt); to.scale.z = 0.55; to.position.y = -2.05; g.add(to); }
  const head = new THREE.Group(); g.add(head); g.userData.head = head;
  const skull = mk(new THREE.SphereGeometry(R, 40, 30), p.skin, 6); skull.scale.set(fw, fh, 0.96); head.add(skull);
  const zs = (x, y) => R * 0.96 * Math.sqrt(Math.max(0.02, 1 - (x / (R * fw)) ** 2 - (y / (R * fh)) ** 2));   // face surface depth
  const J = { head, eyes: [], brows: [] }; g.userData.J = J;
  if (!xr) {
    // hair
    const hm = (geo, sc, pos, rx = 0) => { const m = mk(geo, p.hair, 5); m.scale.set(...sc); m.position.set(...pos); m.rotation.x = rx; head.add(m); return m; };
    const capG = new THREE.SphereGeometry(R * 1.04, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.47);
    if (p.style === 0) hm(capG, [fw, fh * 1.02, 1.0], [0, 0.03, -0.02], -0.3);
    if (p.style === 1) { hm(capG, [fw, fh * 1.02, 1.0], [0, 0.03, -0.02], -0.32); hm(new THREE.SphereGeometry(0.2, 18, 12), [1.9, 0.6, 1.1], [p.qx ?? 0.07, R * fh * 0.78, 0.27], 0.6); }
    if (p.style === 2) { hm(capG, [fw * 1.02, fh * 1.04, 1.02], [0, 0.03, -0.02], -0.22); hm(new THREE.CapsuleGeometry(0.42, 0.55, 8, 16), [fw * 1.05, 1, 0.55], [0, -0.32, -0.2]); }
    if (p.style === 3) hm(capG, [fw * 0.99, fh, 0.99], [0, 0.0, -0.03], -0.45);
    if (p.style === 4) { const r2 = rnd(Math.floor(p.fw * 1000)); for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; hm(new THREE.SphereGeometry(0.17, 12, 10), [1, 1, 1], [Math.cos(a) * 0.3 * fw, R * fh * 0.78 + Math.sin(a * 2) * 0.05, Math.sin(a) * 0.3 - 0.05]); } }
    if (!simple) for (const s of [-1, 1]) { const ear = M(new THREE.SphereGeometry(0.075, 12, 10), p.skin, { px: 3 }); ear.scale.set(0.5, 1, 0.8); ear.position.set(s * R * fw * 0.98, -0.01, 0); head.add(ear); }
    // eyes
    const eyeY = 0.04, er = 0.075 * p.es;
    for (const s of [-1, 1]) {
      const x = s * p.eg, z = zs(x, eyeY);
      const ey = eyeY + (s === 1 ? (p.eyeDy || 0) : 0); const eye = new THREE.Group(); eye.position.set(x, ey, z - 0.02); eye.rotation.y = s * 0.28; head.add(eye);
      if (simple) { const d = new THREE.Mesh(new THREE.SphereGeometry(er * 0.55, 10, 8), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); d.scale.z = 0.4; eye.add(d); continue; }
      const white = new THREE.Mesh(new THREE.SphereGeometry(er, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffffff })); white.scale.set(1, 0.95, 0.35); eye.add(white);
      const ring = new THREE.Mesh(new THREE.SphereGeometry(er * 1.14, 20, 14), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); ring.scale.set(1, 0.95, 0.2); ring.position.z = -0.006; eye.add(ring);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(er * 0.55, 14, 10), new THREE.MeshBasicMaterial({ color: 0x4a3020 })); iris.scale.z = 0.35; iris.position.z = 0.02; eye.add(iris);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(er * 0.3, 12, 8), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); pupil.scale.z = 0.4; pupil.position.z = 0.03; eye.add(pupil);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(er * 0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); glint.position.set(er * 0.2, er * 0.2, 0.035); eye.add(glint);
      eye.userData.pupil = iris; J.eyes.push(eye);
      const brow = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.032, 0.03, 2, 0.012), new THREE.MeshBasicMaterial({ color: p.hair === 0x8a8f96 ? 0x55595f : 0x1f1712 }));
      brow.position.set(x, eyeY + 0.13 + p.by + (s === 1 ? (p.browUp || 0) : 0), zs(x, eyeY + 0.13) + 0.005); brow.rotation.y = s * 0.28; brow.userData = { s, y: brow.position.y }; head.add(brow); J.brows.push(brow);
    }
    if (!simple) {
      const nose = M(new THREE.SphereGeometry(0.06, 14, 10), new THREE.Color(p.skin).multiplyScalar(0.9).getHex(), { px: 3 }); nose.scale.set(p.nw * 0.85, p.nl * 1.2, 0.9); nose.position.set(0, -0.09, zs(0, -0.09) + 0.02); head.add(nose);
      const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), new THREE.MeshBasicMaterial({ color: 0x2a0f12 })); mouth.position.set(0, -0.26, zs(0, -0.26) - 0.01); mouth.userData.w = p.mw; mouth.rotation.z = p.mt || 0; head.add(mouth); J.mouth = mouth;
      if (p.mole) { const mo = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), new THREE.MeshBasicMaterial({ color: 0x3a1f14 })); mo.position.set(p.mole[0], p.mole[1], zs(p.mole[0], p.mole[1]) + 0.005); head.add(mo); g.userData.mole = mo; }
    }
  }
  g.userData.face = ({ open = 0.2, wide = 0, lookX = 0, lookY = 0, smile = 0 } = {}) => {
    if (xr || simple) return;
    J.mouth.scale.set(p.mw * lerp(1, 0.8, open) * (1 + 0.25 * smile), lerp(0.22, 1.0, open), 0.25);
    for (const e of J.eyes) { e.scale.set(1 + wide * 0.2, 1 + wide * 0.28, 1); e.userData.pupil.position.x = lookX * 0.025; e.userData.pupil.position.y = lookY * 0.02; }
    for (const b of J.brows) { b.position.y = b.userData.y + wide * 0.05; b.rotation.z = b.userData.s * -0.15 * wide; }
  };
  g.userData.face();
  // feature anchor points (head-local) for scan beams
  g.userData.pts = [V(-p.eg, 0.04, zs(-p.eg, 0.04)), V(p.eg, 0.04, zs(p.eg, 0.04)), V(0, -0.09, zs(0, -0.09) + 0.07), V(0, -0.26, zs(0, -0.26)), V(0, -0.5 * fh * 0.95, zs(0, -0.45) * 0.6), V(-0.5 * fw, -0.01, 0.05), V(0.5 * fw, -0.01, 0.05), V(0, 0.5 * fh * 0.9, zs(0, 0.42))];
  return g;
}
function heartTex(col = '#ff3b6b') { return canvasTex(128, 128, (x) => { x.fillStyle = col; x.strokeStyle = '#0b0b0f'; x.lineWidth = 8; x.beginPath(); x.moveTo(64, 112); x.bezierCurveTo(10, 72, 8, 30, 38, 24); x.bezierCurveTo(54, 20, 62, 34, 64, 42); x.bezierCurveTo(66, 34, 74, 20, 90, 24); x.bezierCurveTo(120, 30, 118, 72, 64, 112); x.closePath(); x.fill(); x.stroke(); }); }
function Hearts(scene, n, seed, box) { const tx = heartTex(), r = rnd(seed), arr = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.renderOrder = 15; s.userData = { x: (i % 2 ? 1 : -1) * lerp(Math.max(0.55, box[1] * 0.55), box[1], r()), o: r(), sp: 0.5 + r() * 0.4, sz: 0.18 + r() * 0.16 }; scene.add(s); arr.push(s); }
  return (t, k = 1) => arr.forEach(s => { const u = (t * s.userData.sp * 0.45 + s.userData.o) % 1; s.position.set(s.userData.x + 0.1 * Math.sin(t * 3 + s.userData.o * 9), lerp(box[2], box[3], u), box[4]); const z = s.userData.sz * k * Math.sin(Math.PI * Math.min(1, u * 1.2)); s.scale.set(z, z, 1); s.visible = k > 0.01; }); }

// ---------------- shared bits ----------------
const wp = new THREE.Vector3();
function popLabel(s, w, k) { s.scale.set(w * Math.max(0.001, k), w * Math.max(0.001, k) * 192 / 1024, 1); s.visible = k > 0.01; }
function studio(scene, o = {}) {
  bgGrad(scene, o.top || '#07031a', o.mid || '#1d0b3a', o.bot || '#4a0f45');
  const L = lights(scene, { hemi: 0.9, sky: 0xd8c8ff, ground: 0x2a1240, keyI: 2.0, key: 0xfff0e6, keyPos: [-3, 4, 6], rim: o.rim || MAG, rimI: 1.4, rimPos: [3, 2, -3] });
  const h1 = halo(MAG, o.h1 || 9, 0.32); h1.position.set(2.6, 2.2, -4); scene.add(h1);
  const h2 = halo(TEAL, o.h2 || 7, 0.22); h2.position.set(-2.8, -1.6, -4); scene.add(h2);
  return L;
}
// cartoon x-ray skull inside a Bust head (head-local, face = +z). Cochlea (inner ear) on the LEFT ear (-x).
function Skull() {
  const g = new THREE.Group(), bone = (geo) => M(geo, BONE, { px: 3 });
  const cr = bone(new THREE.SphereGeometry(0.4, 36, 26)); cr.scale.set(0.98, 1.05, 1.12); cr.position.set(0, 0.1, -0.04); g.add(cr);
  const mx = bone(RB(0.32, 0.16, 0.22, 0.07)); mx.position.set(0, -0.15, 0.2); g.add(mx);
  for (const s of [-1, 1]) { const cb = bone(new THREE.SphereGeometry(0.08, 16, 12)); cb.scale.set(1.3, 0.8, 0.9); cb.position.set(s * 0.17, -0.05, 0.25); g.add(cb); }
  const dark = new THREE.MeshBasicMaterial({ color: 0x14143a });
  for (const s of [-1, 1]) { const so = new THREE.Mesh(new THREE.SphereGeometry(0.078, 18, 12), dark); so.scale.set(1, 0.92, 0.5); so.position.set(s * 0.13, 0.0, 0.36); g.add(so); }
  const nc = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.08, 3), dark); nc.rotation.z = Math.PI; nc.position.set(0, -0.09, 0.335); g.add(nc);
  const tooth = () => M(RB(0.045, 0.06, 0.04, 0.012, 2), 0xffffff, { px: 2 });
  for (let i = 0; i < 6; i++) { const a = (i - 2.5) * 0.24, tt = tooth(); tt.position.set(0.15 * Math.sin(a), -0.25, 0.17 + 0.15 * Math.cos(a)); tt.rotation.y = a; g.add(tt); }
  const jaw = new THREE.Group(); jaw.position.set(0, -0.1, 0); g.add(jaw);
  const md = bone(RB(0.32, 0.08, 0.24, 0.035)); md.position.set(0, -0.27, 0.15); jaw.add(md);
  for (const s of [-1, 1]) { const ra = bone(RB(0.07, 0.2, 0.1, 0.03)); ra.position.set(s * 0.16, -0.15, 0.03); jaw.add(ra); }
  for (let i = 0; i < 6; i++) { const a = (i - 2.5) * 0.24, tt = tooth(); tt.position.set(0.14 * Math.sin(a), -0.215, 0.165 + 0.14 * Math.cos(a)); tt.rotation.y = a; jaw.add(tt); }
  // cochlea: glowing spiral, drawn through the bone
  const pts = []; for (let i = 0; i <= 80; i++) { const u = i / 80, a = u * 2.6 * Math.PI * 2, r = lerp(0.075, 0.012, u); pts.push(V(-0.02 * u, r * Math.sin(a), r * Math.cos(a))); }
  const cm = new THREE.MeshBasicMaterial({ color: YEL, depthTest: false, transparent: true });
  const coch = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 160, 0.013, 8), cm); coch.position.set(-0.37, -0.05, 0.02); coch.renderOrder = 12; g.add(coch);
  const ch = halo(YEL, 0.4, 0.5); ch.position.copy(coch.position); g.add(ch);
  // bone path: jaw -> cheek -> inner ear
  const path = new THREE.CatmullRomCurve3([V(0.0, -0.3, 0.3), V(-0.18, -0.24, 0.24), V(-0.32, -0.14, 0.13), V(-0.37, -0.05, 0.02)]);
  const dots = []; for (let i = 0; i < 9; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), new THREE.MeshBasicMaterial({ color: TEAL, depthTest: false, transparent: true })); d.renderOrder = 13; g.add(d); dots.push(d); }
  const pulses = []; for (let i = 0; i < 3; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), fresnel(TEAL, 1.6, 1.1, 0.0)); p.position.set(0, -0.18, 0.1); p.renderOrder = 4; g.add(p); pulses.push(p); }
  g.userData = { jaw, coch, ch, path, dots, pulses, cr };
  g.userData.update = (t, o = {}) => {
    const amp = o.amp ?? 1;
    jaw.rotation.x = (o.open ?? 0.3) * 0.42;
    g.position.x = 0.007 * amp * Math.sin(t * 95); g.position.y = 0.005 * amp * Math.cos(t * 120);
    pulses.forEach((p, i) => { const u = (t * (o.pr ?? 1.6) + i / 3) % 1; p.scale.setScalar(lerp(0.12, 0.62, u)); p.material.uniforms.op.value = (o.pk ?? 0.7) * 0.35 * amp * (1 - u) * Math.min(1, u * 6); p.visible = amp > 0.01; });
    const dk = o.dots ?? 0; dots.forEach((d, i) => { const u = (t * 0.9 + i / dots.length) % 1; path.getPoint(u, d.position); d.material.opacity = dk * Math.min(1, u * 5) * Math.min(1, (1 - u) * 6 + 0.3); d.visible = dk > 0.01; d.scale.setScalar(1 + 0.4 * Math.sin(t * 20 + i)); });
    const ck = o.coch ?? 0.6; cm.color.setHex(YEL).lerp(new THREE.Color(0xffffff), clamp(ck - 0.6)); ch.material.opacity = 0.25 + 0.6 * ck; ch.scale.setScalar(0.3 + 0.5 * ck);
  };
  return g;
}
// x-ray bust: fresnel shell + skull
function XBust() {
  const b = Bust(HERO, { xray: true, torso: true, xcol: TEAL });
  const sk = Skull(); sk.scale.setScalar(0.86); sk.position.y = 0.03; b.userData.head.add(sk);
  for (let i = 0; i < 4; i++) { const v = M(RB(0.15, 0.08, 0.13, 0.03), BONE, { px: 3 }); v.position.set(0, -0.44 - i * 0.1, -0.03); b.add(v); } b.userData.skull = sk; return b;
}
// generic studio microphone (no brand)
function Mic() {
  const g = new THREE.Group();
  const hd = M(new THREE.SphereGeometry(0.17, 24, 18), 0x3b4150, { px: 4 }); hd.scale.y = 1.25; g.add(hd);
  for (let i = -2; i <= 2; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.17 * Math.cos(i * 0.32), 0.008, 6, 32), new THREE.MeshBasicMaterial({ color: 0x9aa3b5 })); r.rotation.x = Math.PI / 2; r.position.y = 0.21 * Math.sin(i * 0.32) * 1.25; g.add(r); }
  const band = M(new THREE.CylinderGeometry(0.15, 0.15, 0.07, 24), 0x8a93a6, { px: 3 }); band.position.y = -0.22; g.add(band);
  const body = M(new THREE.CylinderGeometry(0.1, 0.075, 0.6, 20), 0x23262f, { px: 4 }); body.position.y = -0.55; g.add(body);
  const led = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), glowMat(RED, 1)); led.position.set(0, -0.36, 0.095); g.add(led);
  return g;
}
// sound arcs that fly out from a point (2D-ish, facing camera)
function Arcs(scene, n, col, tube = 0.05) {
  const arr = []; for (let i = 0; i < n; i++) { const geo = new THREE.TorusGeometry(1, tube, 8, 48, 1.3); geo.rotateZ(-0.65); const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, transparent: true, depthTest: false })); m.renderOrder = 10; scene.add(m); arr.push(m); }
  return (t, o) => arr.forEach((m, i) => { const u = (t * (o.sp ?? 0.9) + i / n) % 1, r = lerp(o.r0 ?? 0.2, o.r1 ?? 2.0, u);
    m.position.copy(o.at); m.rotation.z = o.ang ?? 0; m.scale.set(r, r * (o.sq ?? 1), 1); m.material.opacity = (o.k ?? 1) * (1 - u) * Math.min(1, u * 6); m.visible = (o.k ?? 1) > 0.01; });
}
const mouthPt = (b) => { b.userData.head.localToWorld(wp.set(0, -0.27, 0.48)); return wp.clone(); };

// =============== s01 hook / s02 skull / s03 inner ear / s10 loop: the x-ray talking head ===============
export function xhead(mode = 'hook', tA = 1.0, tB = 2.0) {
  const scene = new THREE.Scene(); const LL = studio(scene); LL.rim.intensity = 0.7;
  const B = XBust(); scene.add(B); const SK = B.userData.skull;
  const mic = Mic(); mic.position.set(0.42, -0.72, 0.75); mic.rotation.set(0.25, 0, 0.55); mic.scale.setScalar(0.62); scene.add(mic);
  const air = Arcs(scene, 5, YEL, 0.06), air2 = Arcs(scene, 4, PINK, 0.04);
  const rings = []; for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 64), new THREE.MeshBasicMaterial({ color: TEAL, transparent: true, depthTest: false })); m.renderOrder = 9; scene.add(m); rings.push(m); }
  const lbl = labelSprite('INNER EAR', '#FFD60A', 1.0); scene.add(lbl);
  const c = cam(35);
  const rotY = mode === 'ear' ? 1.2 : mode === 'skull' ? 0.35 : 0.55;
  B.rotation.y = rotY; mic.visible = mode === 'hook' || mode === 'end';
  return {
    scene, camera: c,
    update(t, d) {
      let open, amp, k = 1, dots = 0, coch = 0.5, flash = 0;
      if (mode === 'hook') { const sh = 0.65 + 0.3 * Math.abs(Math.sin(t * 7.5)); open = t > tA - 0.1 && t < tA + 0.25 ? 0.3 : sh; amp = 1.2; dots = 0.9; coch = 0.7 + 0.3 * Math.sin(t * 12); }
      else if (mode === 'skull') { open = 0.35 + 0.35 * Math.abs(Math.sin(t * 9)); amp = 0.6 + 1.2 * ss(tA - 0.2, tA + 0.2, t); k = 0.35; coch = 0.5; }
      else if (mode === 'ear') { open = 0.3 + 0.3 * Math.abs(Math.sin(t * 9)); amp = 0.7; k = 0.25; dots = ss(0, 0.3, t); coch = 0.5 + 0.5 * ss(tA - 0.1, tA + 0.15, t) * (0.8 + 0.2 * Math.sin(t * 25)); }
      else { const kk = ss(d - 1.6, d - 0.1, t); open = lerp(0.1, 0.65 + 0.3 * Math.abs(Math.sin(t * 7.5)), ss(tA - 0.1, tA + 0.2, t)); amp = lerp(0.3, 1.2, ss(tA, d, t)); k = lerp(0.2, 1, ss(tA, d, t)); dots = kk * 0.9; coch = 0.5 + 0.3 * kk; }
      SK.userData.update(t, { open, amp, dots, coch, pk: mode === 'skull' ? 0.9 : 0.6 });
      B.userData.head.rotation.set(0.04 * Math.sin(t * 2.2) - open * 0.06, 0.05 * Math.sin(t * 1.3), 0.03 * Math.sin(t * 1.7));
      B.updateMatrixWorld(true);
      const mp = mouthPt(B);
      const ang = mode === 'skull' ? 0.0 : 0.05;
      air(t + 1.2, { at: mp, ang, k, sp: 1.1, r0: 0.12, r1: 1.35 }); air2(t + 0.6, { at: mp, ang: ang + 0.05, k: k * 0.8, sp: 0.8, r0: 0.25, r1: 1.2 });
      lbl.visible = false;
      SK.userData.cr.getWorldPosition(wp); const rk = mode === 'skull' ? amp : amp * 0.6; rings.forEach((m, i) => { const u = (t * 1.7 + i / 3) % 1; m.position.set(wp.x, wp.y - 0.12, wp.z + 0.6); m.scale.setScalar(lerp(0.42, 0.95, u)); m.material.opacity = Math.min(1, rk) * (1 - u) * Math.min(1, u * 5); m.visible = rk > 0.01; });
      if (mode === 'ear') { SK.userData.ch.scale.setScalar(0.3 + 0.9 * ss(tA - 0.1, tA + 0.15, t) * (0.8 + 0.2 * Math.sin(t * 25))); }
      if (mode === 'hook') { look(c, mix(V(0.0, -0.05, 4.3), V(0.05, -0.1, 3.8), eio(clamp(t / d))), V(0.16, -0.28, 0)); shake(c, t, tA, 0.05, 0.3); flash = 0.35 * (1 - clamp((t - tA) / 0.15)) * (t >= tA ? 1 : 0); }
      else if (mode === 'skull') { look(c, mix(V(0.2, 0.05, 4.0), V(0.15, 0.0, 3.4), eio(t / d)), V(0.0, -0.25, 0)); shake(c, t, tA, 0.03, 0.25); }
      else if (mode === 'ear') { SK.userData.coch.getWorldPosition(wp); const tg = wp.clone(); look(c, mix(V(tg.x + 0.5, tg.y + 0.05, 3.7), V(tg.x + 0.3, tg.y, 2.9), eio(t / d)), mix(V(0.05, -0.3, 0), tg.clone().add(V(0.15, -0.15, 0)), eio(t / d))); }
      else look(c, mix(V(0.1, -0.05, 3.4), V(0.0, -0.05, 4.3), eio(clamp(t / d))), V(0.16, -0.28, 0));
      return flash;
    },
    ui(t, d) { return { vig: 0.25, flash: mode === 'hook' && t >= tA ? 0.35 * (1 - clamp((t - tA) / 0.15)) : 0 }; },
  };
}

// =============== s04: "Your skull boosts the low notes! So in your head, you sound deeper!" — equalizer ===============
export function eq(tBoost, tDeep) {
  const scene = new THREE.Scene(); studio(scene, { mid: '#170a33' });
  const n = 10, bars = [], base = [1.0, 1.15, 1.05, 0.95, 0.9, 0.85, 0.8, 0.72, 0.62, 0.55];
  for (let i = 0; i < n; i++) { const geo = RB(0.24, 1, 0.24, 0.05); geo.translate(0, 0.5, 0); const m = M(geo, i < 4 ? MAG : TEAL, { px: 4 }); m.position.set(-1.35 + i * 0.3, -1.6, 0); scene.add(m); bars.push(m); }
  const floor = M(RB(3.3, 0.1, 0.5, 0.04), 0x3a2a5a, { px: 4 }); floor.position.set(0, -1.67, 0); scene.add(floor);
  const lo = labelSprite('LOW', '#ff6fb5', 1.5), hi = labelSprite('HIGH', '#22d3ee', 1.5); lo.position.set(-0.95, -1.95, 0.3); hi.position.set(0.95, -1.95, 0.3); scene.add(lo, hi);
  const bass = labelSprite('MORE BASS', '#FFD60A', 2.0); bass.position.set(-0.85, 1.75, 0.5); scene.add(bass);
  // the deep voice wave: a thick slow sine tube
  const N = 90, wpts = []; for (let i = 0; i <= N; i++) wpts.push(V(lerp(-1.65, 1.65, i / N), 0, 0.4));
  const wave = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(wpts), 200, 0.045, 8), new THREE.MeshBasicMaterial({ color: YEL, transparent: true, depthTest: false })); wave.renderOrder = 11; scene.add(wave);
  const c = cam(35);
  return {
    scene, camera: c,
    update(t, d) {
      const kb = ss(tBoost - 0.2, tBoost + 0.35, t), kd = ss(tDeep - 0.15, tDeep + 0.3, t);
      bars.forEach((b, i) => { const wob = 0.75 + 0.25 * Math.abs(Math.sin(t * (5 + i * 1.7) + i)); let h = base[i] * wob * 1.1; if (i < 4) h *= 1 + 1.5 * kb * (0.85 + 0.15 * Math.sin(t * 6 + i)); b.scale.y = h; });
      popLabel(bass, 2.0, back(clamp((t - tBoost - 0.2) / 0.3)) * (1 - kd));
      // wave: big amplitude, long wavelength (deep) once tDeep hits
      const pos = wave.geometry; const amp = lerp(0.08, 0.55, kd), lam = lerp(0.35, 1.6, kd);
      const pts = []; for (let i = 0; i <= N; i++) { const x = lerp(-1.65, 1.65, i / N); pts.push(V(x, 1.0 + amp * Math.sin((x / lam) * Math.PI * 2 - t * 6), 0.4)); }
      wave.geometry.dispose(); wave.geometry = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, lerp(0.03, 0.07, kd), 8);
      wave.material.opacity = 0.35 + 0.65 * kd;
      look(c, mix(V(0, 0.3, 10.6), V(0, 0.3, 9.9), eio(t / d)), V(0, 0.3, 0)); shake(c, t, tBoost, 0.03, 0.2);
    },
    ui: () => ({ vig: 0.2 }),
  };
}

// phone with a live canvas screen (generic, no brand)
function Phone() {
  const g = new THREE.Group();
  const body = M(RB(1.0, 2.0, 0.1, 0.13, 4), 0x23262f, { px: 5 }); g.add(body);
  const tex = canvasTex(360, 720, () => {}); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.88), new THREE.MeshBasicMaterial({ map: tex })); scr.position.z = 0.052; g.add(scr);
  const x = tex.image.getContext('2d');
  g.userData.draw = (o) => {
    x.fillStyle = '#0d0f17'; x.fillRect(0, 0, 360, 720);
    x.fillStyle = '#ff3b30'; x.beginPath(); x.arc(70, 80, 18, 0, 7); x.fill(); x.font = '900 44px Inter, sans-serif'; x.fillStyle = '#fff'; x.fillText('REC', 100, 96);
    x.font = '700 36px Inter, sans-serif'; x.fillStyle = '#aab'; x.fillText('0:0' + Math.floor(o.t % 10), 250, 94);
    // waveform: thin + jagged when o.thin, bars for the spectrum
    x.strokeStyle = o.thin ? '#4dff88' : '#FFD60A'; x.lineWidth = o.thin ? 4 : 8; x.beginPath();
    for (let i = 0; i <= 120; i++) { const px = 20 + i * 2.67, ph = i * 0.9 + o.t * 14; const yy = o.thin ? 0.55 * Math.sin(ph * 2.3) * Math.sin(ph * 0.37) + 0.3 * Math.sin(ph * 5.1) : Math.sin(i * 0.12 - o.t * 6); x.lineTo(px, 250 + 70 * yy * (o.thin ? 1 : 1)); }
    x.stroke();
    const bk = o.bass ?? 1; for (let i = 0; i < 8; i++) { const h = (i < 3 ? bk : 1) * (60 + 140 * Math.abs(Math.sin(o.t * (4 + i) + i))) * (i < 3 ? 1.2 : 0.8); x.fillStyle = i < 3 ? '#ff3ea5' : '#22d3ee'; x.fillRect(30 + i * 40, 640 - h, 28, h); }
    x.fillStyle = '#ffffff99'; x.font = '700 28px Inter, sans-serif'; x.fillText('LOW', 30, 690); x.fillText('HIGH', 250, 690);
    if (o.skullX) { // a little skull icon crossed out
      const cx = 180, cy = 420; x.globalAlpha = o.skullX; x.fillStyle = '#eaf4ff'; x.strokeStyle = '#0b0b0f'; x.lineWidth = 6; x.beginPath(); x.arc(cx, cy, 52, 0, 7); x.fill(); x.stroke(); x.fillRect(cx - 30, cy + 30, 60, 34); x.strokeRect(cx - 30, cy + 30, 60, 34);
      x.fillStyle = '#14143a'; x.beginPath(); x.arc(cx - 20, cy - 2, 13, 0, 7); x.arc(cx + 20, cy - 2, 13, 0, 7); x.fill();
      x.strokeStyle = '#ff3b30'; x.lineWidth = 14; x.beginPath(); x.moveTo(cx - 75, cy - 75); x.lineTo(cx + 75, cy + 75); x.moveTo(cx + 75, cy - 75); x.lineTo(cx - 75, cy + 75); x.stroke(); x.globalAlpha = 1; }
    tex.needsUpdate = true;
  };
  return g;
}

// =============== s05: "A recording only catches the air. No skull. No bass." ===============
export function record(tSkull, tBass) {
  const scene = new THREE.Scene(); studio(scene, { mid: '#22093a' });
  const A = Bust(HERO, { torso: true }); A.position.set(-0.7, -0.2, 0); A.rotation.y = 0.5; A.scale.setScalar(0.9); scene.add(A);
  const ph = Phone(); ph.position.set(0.62, 0.6, 0.6); ph.rotation.set(0, -0.35, 0.05); ph.scale.setScalar(0.9); scene.add(ph);
  const air = Arcs(scene, 5, YEL, 0.045);
  const c = cam(35);
  return {
    scene, camera: c,
    update(t, d) {
      A.userData.face({ open: 0.25 + 0.4 * Math.abs(Math.sin(t * 9)), wide: 0.3 });
      A.userData.head.rotation.set(0.03 * Math.sin(t * 2), 0.04 * Math.sin(t * 1.4), 0);
      A.updateMatrixWorld(true); A.userData.head.localToWorld(wp.set(0, -0.26, 0.5));
      air(t, { at: wp.clone(), ang: -0.05, k: 1, sp: 1.0, r0: 0.12, r1: 1.2 });
      ph.userData.draw({ t, thin: false, bass: 1 - 0.92 * ss(tBass - 0.1, tBass + 0.25, t), skullX: ss(tSkull - 0.1, tSkull + 0.15, t) });
      ph.position.y = 0.02 * Math.sin(t * 2);
      look(c, mix(V(0.0, 0.0, 8.8), V(0.05, 0.0, 8.2), eio(t / d)), V(0.0, -0.2, 0)); shake(c, t, tBass, 0.03, 0.2);
    },
    ui: () => ({ vig: 0.2 }),
  };
}

// =============== s06: "That thin, weird voice you hate? That's the one everyone hears." ===============
export function hate(tAll) {
  const scene = new THREE.Scene(); studio(scene, { mid: '#1a0d33', bot: '#3d0d3a' });
  const A = Bust(HERO, { torso: true }); A.position.set(0, -0.35, 0.6); scene.add(A);
  const ph = Phone(); ph.position.set(0.48, -1.18, 1.8); ph.rotation.set(-0.15, -0.35, 0.2); ph.scale.setScalar(0.42); scene.add(ph);
  const r = rnd(11), crowd = [];
  for (let i = 0; i < 12; i++) { const b = Bust(faceP(700 + i), { simple: true }); const row = i % 3; const sgn = i % 2 ? 1 : -1;
    b.position.set(sgn * lerp(1.0, 2.6, r()) + (r() - 0.5) * 0.3, -0.6 + row * 0.55 + r() * 0.2, -0.9 - row * 1.1 - r() * 0.5); b.userData.sgn = sgn; b.userData.ph = r() * 6; scene.add(b); crowd.push(b); }
  const ears = Arcs(scene, 4, GREEN, 0.035);
  const c = cam(35);
  return {
    scene, camera: c,
    update(t, d) {
      const ka = ss(tAll - 0.2, tAll + 0.5, t);
      A.userData.face({ open: lerp(0.15, 0.55, ka), wide: lerp(0.9, 1.0, ka) });
      A.userData.head.rotation.set(-0.05 + 0.02 * Math.sin(t * 3), lerp(0.35, 0, ka) + 0.05 * Math.sin(t * 13) * (1 - ka), lerp(-0.12, 0, ka));
      ph.userData.draw({ t, thin: true, bass: 0.12 });
      ph.updateMatrixWorld(true); ph.localToWorld(wp.set(0, 1.1, 0.1));
      ears(t, { at: wp.clone(), ang: 1.57, k: 1 - ka * 0.4, sp: 1.2, r0: 0.08, r1: 0.4 });
      crowd.forEach(b => { const s = Math.max(0.001, back(clamp((t - tAll + 0.3 - b.userData.ph * 0.03) / 0.35))); b.scale.setScalar(s); b.visible = s > 0.01; b.userData.head.rotation.y = -b.userData.sgn * 0.5 + 0.08 * Math.sin(t * 2 + b.userData.ph); });
      look(c, mix(V(0.3, -0.1, 5.6), V(0.1, 0.1, 8.0), eio(ss(tAll - 0.4, tAll + 0.9, t))), V(0.1, -0.45, 0));
    },
    ui: () => ({ vig: 0.25 }),
  };
}

// =============== s07: "Your friends. Your boss. Your crush!" ===============
export function people(t1, t2, t3) {
  const scene = new THREE.Scene(); studio(scene, { mid: '#24093f' });
  const mk = (seed, x, y, z, s, shirt, torso = false) => { const p = faceP(seed); if (shirt) p.shirt = shirt; const b = Bust(p, { torso }); b.position.set(x, y, z); b.scale.setScalar(s); b.userData.base = s; scene.add(b); return b; };
  const fr = [mk(31, -1.0, 0.45, 0, 0.62), mk(44, -0.35, 0.58, -0.4, 0.58)];
  const boss = mk(52, 0.9, 0.4, 0, 0.66, 0x2b2d42);
  const tie = M(RB(0.12, 0.42, 0.04, 0.02), RED, { px: 3 }); tie.position.set(0, -0.82, 0.48); boss.add(tie);
  const crush = mk(67, 0, -1.48, 0.6, 0.8, 0xff006e, true);
  const hearts = Hearts(scene, 10, 9, [-1.0, 1.2, -1.6, 0.0, 1.5]);
  const l1 = labelSprite('FRIENDS', '#FFD60A', 1.1), l2 = labelSprite('BOSS', '#22d3ee', 0.9), l3 = labelSprite('CRUSH', '#ff6fb5', 1.0); scene.add(l1, l2, l3);
  l1.position.set(-0.68, -0.25, 0.6); l2.position.set(0.9, -0.3, 0.6); l3.position.set(0, -2.12, 1.25);
  const c = cam(35);
  return {
    scene, camera: c,
    update(t, d) {
      const k = [0.05, 0.15, t2, t3].map(tt => back(clamp((t - tt + 0.15) / 0.35)));
      [...fr, boss, crush].forEach((b, i) => { b.scale.setScalar(Math.max(0.001, b.userData.base * k[i])); b.visible = k[i] > 0.01; b.userData.face({ open: 0.2 + 0.15 * Math.abs(Math.sin(t * 3 + i)), wide: 0.4, smile: i === 3 ? 0.8 : 0.2, lookX: i === 3 ? 0 : (i < 2 ? 0.6 : -0.6) }); b.userData.head.rotation.set(0, 0.06 * Math.sin(t * 1.5 + i), 0.03 * Math.sin(t * 2 + i)); });
      popLabel(l1, 1.1, k[0]); popLabel(l2, 0.9, k[2]); popLabel(l3, 1.0, k[3]);
      hearts(t, k[3]);
      look(c, mix(V(0, -0.1, 8.6), V(0, -0.1, 8.0), eio(t / d)), V(0, -0.3, 0)); shake(c, t, t3, 0.03, 0.2);
    },
    ui: () => ({ vig: 0.2 }),
  };
}

// ---------- voice-clip cards (study) ----------
function Card(seed) {
  const g = new THREE.Group();
  const body = M(RB(0.9, 0.72, 0.08, 0.07), 0x1e2040, { px: 4 }); g.add(body);
  const tex = canvasTex(450, 360, () => {}); const x = tex.image.getContext('2d');
  const face = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.66), new THREE.MeshBasicMaterial({ map: tex, transparent: true })); face.position.z = 0.045; g.add(face);
  const r = rnd(seed), hs = Array.from({ length: 22 }, () => 0.25 + 0.75 * r());
  let last = '';
  g.userData.draw = (o) => {
    const key = `${o.stars}|${o.you}|${o.secret}|${Math.floor(o.t * 10)}`; if (key === last) return; last = key;
    x.clearRect(0, 0, 450, 360); x.fillStyle = o.you ? '#3a0f4a' : '#20234a'; x.fillRect(0, 0, 450, 360);
    if (o.you) { x.font = '900 92px Inter, sans-serif'; x.lineWidth = 14; x.strokeStyle = '#0b0b0f'; x.strokeText('YOU', 18, 112); x.fillStyle = '#FFD60A'; x.fillText('YOU', 18, 112); } else { x.fillStyle = '#FFD60A'; x.beginPath(); x.moveTo(30, 40); x.lineTo(30, 110); x.lineTo(88, 75); x.closePath(); x.fill(); }
    hs.forEach((h, i) => { if (o.you && i < 9) return; const hh = h * 80 * (0.7 + 0.3 * Math.abs(Math.sin(o.t * 5 + i))); x.fillStyle = o.you ? '#ff6fb5' : '#22d3ee'; x.fillRect(110 + i * 14, 75 - hh / 2, 9, hh); });
    if (o.secret && !o.you) { x.font = '900 150px Inter, sans-serif'; x.fillStyle = '#ff3ea5'; x.textAlign = 'center'; x.fillText('?', 380, 115); x.textAlign = 'left'; }
    for (let i = 0; i < 5; i++) star(x, 60 + i * 82, 250, 34, i < o.stars ? '#FFD60A' : '#44476b');
    tex.needsUpdate = true;
  };
  return g;
}
function star(x, cx, cy, R, col) { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? R * 0.45 : R; x.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a)); } x.closePath(); x.fillStyle = col; x.fill(); x.lineWidth = 5; x.strokeStyle = '#0b0b0f'; x.stroke(); }
function Rater() {
  const p = faceP(902); p.shirt = 0x8338ec; const b = Bust(p, { torso: true });
  const band = M(new THREE.TorusGeometry(0.56, 0.05, 10, 40, Math.PI), 0x23262f, { px: 4 }); band.position.y = 0.05; b.userData.head.add(band);
  for (const s of [-1, 1]) { const cup = M(new THREE.CylinderGeometry(0.17, 0.17, 0.12, 24), MAG, { px: 4 }); cup.rotation.z = Math.PI / 2; cup.position.set(s * 0.53, 0.0, 0); b.userData.head.add(cup); }
  return b;
}
const SLOTS = [[-1.0, 1.02], [0, 1.02], [1.0, 1.02], [-1.0, 0.1], [0, 0.1], [1.0, 0.1]];
const YOU = 4;
function studyScene(scene) {
  const cards = SLOTS.map((s, i) => { const cd = Card(40 + i); cd.position.set(s[0], s[1], 0); scene.add(cd); return cd; });
  const R = Rater(); R.position.set(0, -1.8, 0.8); R.scale.setScalar(1.05); scene.add(R);
  const glow = halo(MAG, 1.6, 0.0); glow.position.set(SLOTS[YOU][0], SLOTS[YOU][1], -0.1); scene.add(glow);
  return { cards, R, glow };
}

// =============== s08: "Plot twist. In a study, people rated voice clips. Their own voice was secretly mixed in." ===============
export function study(tCards, tSecret) {
  const scene = new THREE.Scene(); studio(scene, { mid: '#150b35', bot: '#2d0f4a' });
  const { cards, R, glow } = studyScene(scene);
  const twist = Arcs(scene, 6, MAG, 0.06);
  const c = cam(35);
  return {
    scene, camera: c,
    update(t, d) {
      const ks = ss(tSecret - 0.1, tSecret + 0.3, t);
      cards.forEach((cd, i) => { const k = back(clamp((t - Math.max(0.15, tCards - 0.55) - i * 0.07) / 0.35)); cd.rotation.x = (1 - clamp((t - Math.max(0.15, tCards - 0.55) - i * 0.07) / 0.45)) * 3.0; cd.scale.setScalar(Math.max(0.001, k)); cd.visible = k > 0.01; cd.rotation.y = 0.12 * Math.sin(t * 1.5 + i);
        const stars = Math.min(3, Math.floor(clamp((t - tCards - 0.6 - i * 0.12) / 1.2) * (2 + (i % 2)) + 0.001));
        cd.userData.draw({ t, stars: i === YOU ? 0 : stars, you: false, secret: i === YOU && ks > 0.5 });
        if (i === YOU) cd.position.z = 0.25 * ks; });
      glow.material.opacity = 0.65 * ks * (0.8 + 0.2 * Math.sin(t * 8));
      R.userData.face({ open: 0.15, wide: 0.5, lookY: 1 }); R.userData.head.rotation.set(-0.25, 0.25 * Math.sin(t * 1.3), 0);
      R.visible = t > tCards - 0.3; R.scale.setScalar(1.05 * Math.max(0.001, back(clamp((t - tCards + 0.3) / 0.35)))); R.position.set(0, -1.8, 0.8);
      twist(t, { at: V(0, 0.55, 0.5), ang: 0, k: 1 - ss(tCards - 0.3, tCards, t), sp: 1.5, r0: 0.1, r1: 2.4, sq: 1 });
      look(c, mix(V(0, 0.15, 9.8), V(0, 0.15, 9.2), eio(t / d)), V(0, -0.1, 0)); shake(c, t, 0.05, 0.05, 0.3);
    },
    ui: (t) => ({ vig: 0.2, flash: 0.3 * (1 - clamp(t / 0.15)) }),
  };
}

// =============== s09: "Most didn't recognize it... and rated it more attractive than other people's!" ===============
export function reveal(tRate) {
  const scene = new THREE.Scene(); studio(scene, { mid: '#150b35', bot: '#2d0f4a' });
  const { cards, R, glow } = studyScene(scene);
  const you = labelSprite('YOU', '#FFD60A', 0.75); scene.add(you);
  const hearts = Hearts(scene, 8, 3, [-0.6, 0.75, -0.3, 0.9, 1.6]);
  const c = cam(35);
  return {
    scene, camera: c,
    update(t, d) {
      const kr = ss(tRate - 0.1, tRate + 0.5, t);
      cards.forEach((cd, i) => { cd.rotation.y = 0.15 * Math.sin(t * 1.5 + i) * (i === YOU ? 1 - kr : 1);
        if (i === YOU) { cd.position.set(lerp(SLOTS[i][0], 0, kr), lerp(SLOTS[i][1], 0.4, kr), lerp(0.25, 1.4, kr)); cd.scale.setScalar(lerp(1, 1.4, kr)); }
        else { cd.position.z = -0.6 * kr; }
        cd.userData.draw({ t, stars: i === YOU ? Math.min(5, Math.floor(clamp((t - tRate) / 0.6) * 5 + 0.001)) : [2, 3, 2, 3, 0, 2][i], you: i === YOU && t > 0.25, secret: i === YOU }); });
      cards[YOU].getWorldPosition(wp); glow.position.set(wp.x, wp.y, wp.z - 0.2); glow.material.opacity = 0.7; glow.scale.setScalar(lerp(1.6, 2.6, kr));
      you.visible = false;
      hearts(t, kr);
      R.userData.face({ open: lerp(0.15, 0.6, kr), wide: lerp(0.4, 1, kr), lookY: 1, smile: kr }); R.userData.head.rotation.set(-0.25, 0.1 * Math.sin(t * 1.3), 0); R.position.set(0, -1.8, 0.8);
      look(c, mix(V(0, 0.15, 9.2), V(0, 0.15, 8.8), eio(t / d)), V(0, -0.1, 0)); shake(c, t, tRate, 0.03, 0.2);
    },
    ui: () => ({ vig: 0.2 }),
  };
}
