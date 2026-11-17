import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, M, fresnel, glowMat, addMat, halo, setOpacity, lights, shake, Subject, poseStand, earth, stars } from '../../engine/engine.js';

// xr008 — "You've never seen your real face": mirrors flip you; we prefer our mirror image, friends prefer the real one.
// All faces are GENERIC busts built here from random parameters (no likeness of any real person, no photos, no logos).
// Facts: Mita, Dermer & Knight 1977 (JPSP 35:597) — people preferred their mirror image, friends the true image; Epley & Whitchurch 2008 — people picked an attractively morphed version as their own face.
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);

// palette: bright morning bathroom — mint tiles, peach, cream, coral (different from xr007's dark neon)
const MAG = 0xff3ea5, TEAL = 0x22d3ee, YEL = 0xffd60a, GREEN = 0x4dff88, MINT = 0xa8e6d4, MINT2 = 0x7fcdb8, PEACH = 0xffb38a, CREAM = 0xfff4e0, CORAL = 0xff6b6b, GOLD = 0xf2b84b, RED = 0xff3b30;
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
const HERO = { skin: 0xf0c09a, hair: 0x6a3a1e, shirt: 0xff6b6b, style: 1, fw: 0.95, fh: 1.1, eg: 0.17, es: 1.08, nl: 1.05, nw: 1.0, mw: 1.05, by: 0.0, qx: 0.17, mole: [0.2, -0.14], browUp: 0.05, eyeDy: 0.04, mt: 0.12 };
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
// a beam between two world points (thin glowing box)
function Beam(color = YEL, w = 0.018) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, w, 1), glowMat(color, 0.95)); m.renderOrder = 8; return m; }
function setBeam(m, a, b) { m.position.copy(a).add(b).multiplyScalar(0.5); m.lookAt(b); m.scale.z = Math.max(0.001, a.distanceTo(b)); }
function Crowd(scene, n, seed, o = {}) {
  const r = rnd(seed), arr = [];
  for (let i = 0; i < n; i++) {
    const row = i % 4, b = Bust(faceP(seed * 100 + i), { simple: true });
    const x = (r() - 0.5) * (o.spread || 9) * (1 + row * 0.35), z = -(o.z0 || 2.5) - row * 1.6 - r() * 0.6;
    b.position.set(x, (o.y || 0) + row * 0.45 + r() * 0.15, z); b.rotation.y = (r() - 0.5) * 0.6; b.userData.ph = r() * 6; scene.add(b); arr.push(b);
  }
  return t => arr.forEach(b => { b.userData.head.rotation.y = 0.3 * Math.sin(t * 0.6 + b.userData.ph); b.position.y += 0.0; });
}
function Twin(shirt, pants) {
  const g = Subject({ col: { torso: shirt, upper: shirt, fore: HERO.skin, hand: HERO.skin, thigh: pants, shin: pants, shoe: 0x22222a } });
  const J = g.userData.J; J.head.children.slice().forEach(ch => J.head.remove(ch));
  const b = Bust({ ...HERO, shirt }); b.children[0].visible = false; b.children[1].visible = false; b.scale.setScalar(0.33); b.position.y = 0.02; J.head.add(b);
  g.userData.bust = b; poseStand(g); return g;
}
function drawFace(x, cx, cy, s, p, flip = false) {
  if (flip) { x.save(); x.translate(cx * 2, 0); x.scale(-1, 1); drawFace(x, cx, cy, s, p, false); x.restore(); return; }
  const hex = h => '#' + new THREE.Color(h).getHexString();
  x.lineWidth = 6 * s; x.strokeStyle = '#0b0b0f';
  x.fillStyle = hex(p.shirt); x.beginPath(); x.ellipse(cx, cy + 150 * s, 115 * s, 70 * s, 0, Math.PI, 0); x.lineTo(cx + 115 * s, cy + 200 * s); x.lineTo(cx - 115 * s, cy + 200 * s); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = hex(p.skin); x.beginPath(); x.ellipse(cx, cy, 72 * s * p.fw, 88 * s * p.fh, 0, 0, 7); x.fill(); x.stroke();
  x.fillStyle = hex(p.hair); x.beginPath();
  if (p.style === 2) { x.ellipse(cx, cy - 20 * s, 80 * s * p.fw, 80 * s * p.fh, 0, Math.PI * 0.95, Math.PI * 2.05); x.lineTo(cx + 82 * s, cy + 90 * s); x.lineTo(cx + 62 * s, cy + 90 * s); x.lineTo(cx + 66 * s, cy - 10 * s); x.lineTo(cx - 66 * s, cy - 10 * s); x.lineTo(cx - 62 * s, cy + 90 * s); x.lineTo(cx - 82 * s, cy + 90 * s); }
  else x.ellipse(cx, cy - 30 * s, 76 * s * p.fw, 66 * s * p.fh, 0, Math.PI * 1.02, Math.PI * 1.98);
  x.closePath(); x.fill(); x.stroke();
  if (p.style === 1) { x.beginPath(); x.ellipse(cx + 10 * s, cy - 92 * s * p.fh, 40 * s, 18 * s, -0.2, 0, 7); x.fill(); x.stroke(); }
  for (const sg of [-1, 1]) { const ex = cx + sg * 100 * s * p.eg * 1.6; x.fillStyle = '#fff'; x.beginPath(); x.ellipse(ex, cy, 13 * s * p.es, 12 * s * p.es, 0, 0, 7); x.fill(); x.lineWidth = 4 * s; x.stroke(); x.fillStyle = '#0b0b0f'; x.beginPath(); x.arc(ex, cy + 1 * s, 6 * s, 0, 7); x.fill();
    x.lineWidth = 6 * s; x.beginPath(); x.moveTo(ex - 14 * s, cy - 24 * s + p.by * 200 * s); x.lineTo(ex + 14 * s, cy - 26 * s + p.by * 200 * s); x.stroke(); }
  x.lineWidth = 4 * s; x.beginPath(); x.moveTo(cx, cy + 4 * s); x.lineTo(cx - 8 * s * p.nw, cy + 26 * s * p.nl); x.lineTo(cx + 6 * s, cy + 28 * s * p.nl); x.stroke();
  x.fillStyle = '#2a0f12'; x.beginPath(); x.ellipse(cx, cy + 50 * s, 20 * s * p.mw, 8 * s, -(p.mt || 0), 0, Math.PI); x.fill(); x.stroke();
  if (p.mole) { x.fillStyle = '#3a1f14'; x.beginPath(); x.arc(cx + p.mole[0] * 150 * s, cy - p.mole[1] * 170 * s, 5 * s, 0, 7); x.fill(); }
}

// ---------------- bathroom world ----------------
function tileTex(c1 = '#a8e6d4', c2 = '#ffffff', n = 8) { const t = canvasTex(512, 512, (x, w, h) => { x.fillStyle = c2; x.fillRect(0, 0, w, h); const s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { x.fillStyle = c1; x.fillRect(i * s + 4, j * s + 4, s - 8, s - 8); x.fillStyle = 'rgba(255,255,255,.25)'; x.fillRect(i * s + 8, j * s + 8, s * 0.35, 6); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
function bathroom(scene, o = {}) {
  scene.background = new THREE.Color(o.bg || 0xfff4e0);
  const L = lights(scene, { hemi: 1.15, sky: 0xffffff, ground: 0xffe2c8, keyI: 1.9, key: 0xfff2e0, keyPos: [-3, 5, 7], rim: o.rim || PEACH, rimI: 1.0, rimPos: [3, 3, -3] });
  const tx = tileTex(o.tile || '#a8e6d4'); tx.repeat.set(5, 6);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 19), new THREE.MeshToonMaterial({ map: tx })); wall.position.set(0, 0, o.wz ?? -0.3); scene.add(wall);
  const sun = halo(0xfff0c8, 9, 0.45); sun.position.set(-3, 3, 1); scene.add(sun);
  return { L, wall };
}
// rectangular mirror: gold frame + glass sheen; content goes inside (between backing and glass)
function Mirror(w, h, o = {}) {
  const g = new THREE.Group(), fr = o.frame || GOLD, b = 0.16;
  const bk = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshToonMaterial({ map: (() => { const t = tileTex('#8fd3c0', '#e8f7f2'); t.repeat.set(w / 1.6, h / 1.6); return t; })() })); bk.position.z = 0; g.add(bk);
  const shade = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0x6fb6c9, transparent: true, opacity: 0.18 })); shade.position.z = 0.01; g.add(shade);
  for (const [x, y, bw, bh] of [[0, h / 2 + b / 2, w + 2 * b, b], [0, -h / 2 - b / 2, w + 2 * b, b * 1.6], [-w / 2 - b / 2, 0, b, h], [w / 2 + b / 2, 0, b, h]]) { const m = M(RB(bw, bh, 0.25, 0.05, 2), fr, { px: 5 }); m.position.set(x, y, o.fz ?? 1.3); g.add(m); }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xcff3ff, transparent: true, opacity: 0.12, depthWrite: false })); glass.position.z = (o.fz ?? 1.3) - 0.05; glass.renderOrder = 6; g.add(glass);
  for (const [x, ww] of [[-w * 0.22, 0.16], [-w * 0.05, 0.07]]) { const st = new THREE.Mesh(new THREE.PlaneGeometry(ww, h * 1.3), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false })); st.rotation.z = -0.5; st.position.set(x, 0, (o.fz ?? 1.3) - 0.04); st.renderOrder = 7; g.add(st); }
  g.userData.glass = glass; return g;
}
function heartTex(col = '#ff3b6b') { return canvasTex(128, 128, (x) => { x.fillStyle = col; x.strokeStyle = '#0b0b0f'; x.lineWidth = 8; x.beginPath(); x.moveTo(64, 112); x.bezierCurveTo(10, 72, 8, 30, 38, 24); x.bezierCurveTo(54, 20, 62, 34, 64, 42); x.bezierCurveTo(66, 34, 74, 20, 90, 24); x.bezierCurveTo(120, 30, 118, 72, 64, 112); x.closePath(); x.fill(); x.stroke(); }); }
function Hearts(scene, n, seed, box) { const tx = heartTex(), r = rnd(seed), arr = []; for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.renderOrder = 15; s.userData = { x: (i % 2 ? 1 : -1) * lerp(Math.max(0.55, box[1] * 0.55), box[1], r()), o: r(), sp: 0.5 + r() * 0.4, sz: 0.18 + r() * 0.16 }; scene.add(s); arr.push(s); }
  return (t, k = 1) => arr.forEach(s => { const u = (t * s.userData.sp * 0.45 + s.userData.o) % 1; s.position.set(s.userData.x + 0.1 * Math.sin(t * 3 + s.userData.o * 9), lerp(box[2], box[3], u), box[4]); const z = s.userData.sz * k * Math.sin(Math.PI * Math.min(1, u * 1.2)); s.scale.set(z, z, 1); s.visible = k > 0.01; }); }
function Ring(col = RED, r = 0.11) { const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.014, 8, 40), glowMat(col, 1)); m.renderOrder = 9; return m; }
function flipX(b, sx) { b.scale.x = Math.sign(sx || 1) * Math.max(0.03, Math.abs(sx)); }
const wp = new THREE.Vector3();

// =============== s01 + loop (s10): HOOK — your face in the mirror flips to the way others see it ===============
export function hook(mode = 'in', tFlip = 2.0) {
  const scene = new THREE.Scene(); bathroom(scene);
  const mir = Mirror(2.3, 3.0); mir.position.set(0, -0.35, 0); scene.add(mir);
  const A = Bust(HERO, { torso: true }); A.position.set(0, 0, 0.6); scene.add(A);
  const sink = M(RB(3.4, 0.35, 1.4, 0.08, 3), CREAM, { px: 5 }); sink.position.set(0, -2.15, 1.5); scene.add(sink);
  const ring = Ring(RED, 0.12); scene.add(ring);
  const arrow = new THREE.Group(); const bar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.05, 0.05), glowMat(YEL, 1)); arrow.add(bar);
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.22, 16), glowMat(YEL, 1)); c.rotation.z = -s * Math.PI / 2; c.position.x = s * 0.6; arrow.add(c); }
  arrow.position.set(0, -0.68, 1.0); scene.add(arrow);
  const hearts = Hearts(scene, 10, 5, [-1.0, 1.0, -0.9, 1.0, 1.1]);
  const c = cam(34), P0 = V(0, -0.1, 8.6), P1 = V(0, -0.15, 7.7), TG = V(0, -0.45, 0);
  return {
    scene, camera: c,
    update(t, d) {
      let sx, k;
      if (mode === 'in') { k = ss(tFlip - 0.1, tFlip + 0.35, t); sx = -Math.cos(Math.PI * k); }
      else { k = ss(d - 0.45, d - 0.12, t); sx = Math.cos(Math.PI * k); }
      flipX(A, sx);
      const smile = mode === 'end' ? 1 - k : 0;
      A.userData.face({ open: mode === 'in' ? 0.25 + 0.2 * Math.abs(Math.sin(t * 3)) : 0.35, wide: mode === 'in' ? 0.7 : 0.2 + 0.5 * k, smile });
      A.userData.head.rotation.set(0.02 * Math.sin(t * 2), 0.06 * Math.sin(t * 1.3), 0.03 * Math.sin(t * 1.7));
      A.userData.mole.getWorldPosition(wp); ring.position.set(wp.x, wp.y, wp.z + 0.06); ring.scale.setScalar(1 + 0.12 * Math.sin(t * 7)); ring.visible = Math.abs(sx) > 0.3;
      const ak = mode === 'in' ? ss(tFlip, tFlip + 0.3, t) * (1 - ss(d - 0.4, d, t)) : 0; arrow.scale.setScalar(Math.max(0.001, ak)); arrow.visible = ak > 0.01;
      hearts(t, mode === 'end' ? ss(0.1, 0.5, t) * (1 - k) : 0);
      if (mode === 'in') look(c, mix(P0, P1, eio(t / d)), TG); else look(c, mix(V(0, -0.2, 6.6), P0, eio(ss(0, d, t))), TG);
    },
    ui: () => ({ vig: 0.12 }),
  };
}
// =============== s02: "Every mirror flips you left to right." — raise your right hand, the reflection raises its left ===============
export function mirrorRoom(tRaise) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xfff4e0);
  lights(scene, { hemi: 1.1, sky: 0xffffff, ground: 0xffe2c8, keyI: 1.8, keyPos: [3, 6, 7], rim: PEACH, rimI: 1.0, shadow: true, shadowR: 5 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.MeshToonMaterial({ map: (() => { const t = tileTex('#ffd9c2', '#fff4e0', 6); t.repeat.set(10, 10); return t; })() })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const tx = tileTex(); tx.repeat.set(2, 2);
  const wallM = new THREE.MeshToonMaterial({ map: tx });
  for (const [x, y, w, h] of [[-4.6, 3, 7, 6], [4.6, 3, 7, 6], [0, 4.4, 2.2, 3.2]]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), wallM); p.position.set(x, y, 0); scene.add(p); }
  const backW = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshToonMaterial({ map: (() => { const t = tileTex('#8fd3c0', '#e8f7f2'); t.repeat.set(6, 3); return t; })() })); backW.position.set(0, 3, -6); scene.add(backW);
  for (const [x, y, bw, bh] of [[0, 2.85, 2.5, 0.15], [-1.18, 1.4, 0.15, 2.9], [1.18, 1.4, 0.15, 2.9]]) { const m = M(RB(bw, bh, 0.15, 0.04, 2), GOLD, { px: 4 }); m.position.set(x, y, 0.05); scene.add(m); }
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.8), new THREE.MeshBasicMaterial({ color: 0xcff3ff, transparent: true, opacity: 0.14, depthWrite: false })); glass.position.set(0, 1.4, 0.01); glass.renderOrder = 6; scene.add(glass);
  const st = new THREE.Mesh(new THREE.PlaneGeometry(0.14, 3.4), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25, depthWrite: false })); st.rotation.z = -0.5; st.position.set(-0.4, 1.4, 0.02); st.renderOrder = 7; scene.add(st);
  const A = Twin(CORAL, 0x3d5f94), B = Twin(CORAL, 0x3d5f94); A.position.set(0, 0, 1.25); A.rotation.y = Math.PI; scene.add(A);
  const R = new THREE.Group(); R.scale.z = -1; B.position.set(0, 0, 1.25); B.rotation.y = Math.PI; R.add(B); scene.add(R);
  const lA = labelSprite('RIGHT', '#FFD60A', 1.1), lB = labelSprite('LEFT?!', '#ff3b30', 1.1); scene.add(lA, lB);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      const k = ss(tRaise - 0.2, tRaise + 0.2, t);
      for (const g of [A, B]) { poseStand(g, t); const J = g.userData.J; J.arm.R.a.rotation.set(0, 0, lerp(0.16, 2.75, k) + 0.12 * Math.sin(t * 9) * k); J.arm.R.b.rotation.set(-0.2 * k, 0, 0); g.userData.bust.userData.face({ open: 0.3, wide: 0.5 * k, lookX: 0 }); }
      A.userData.J.arm.R.hand.getWorldPosition(wp); lA.position.copy(wp).add(V(0, 0.32, 0)); B.userData.J.arm.R.hand.getWorldPosition(wp); lB.position.copy(wp).add(V(0, 0.32, 0));
      for (const l of [lA, lB]) { const s = back(clamp((t - tRaise - 0.15) / 0.25)); l.scale.set(1.1 * s, 1.1 * s * 192 / 1024, 1); l.visible = s > 0.01; }
      look(c, mix(V(1.05, 2.1, 6.4), V(0.85, 2.0, 5.7), eio(t / d)), V(-0.15, 1.5, -0.6));
    },
    ui: () => ({ vig: 0.12 }),
  };
}
// =============== s03: "almost every face is a little lopsided" — symmetry lines on your face ===============
export function lopsided(t0) {
  const scene = new THREE.Scene(); bathroom(scene, { tile: '#ffd0b5' });
  const A = Bust(HERO, { torso: true }); scene.add(A);
  const H = A.userData.head, pts = A.userData.pts, p = HERO;
  const cl = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.07, 0.01), glowMat(0xffffff, 1)); m.position.set(0, 0.62 - i * 0.115, 0.62); H.add(m); cl.push(m); }
  const mkBar = (col, w = 0.022) => { const b = new THREE.Mesh(new THREE.BoxGeometry(1, w, 0.01), glowMat(col, 1)); b.renderOrder = 8; H.add(b); return b; };
  const ref = mkBar(0xffffff, 0.012), eyes = mkBar(RED), brows = mkBar(RED), mouth = mkBar(RED);
  const ey = 0.04, a1 = Math.atan2(p.eyeDy, 2 * p.eg), a2 = Math.atan2(p.eyeDy + p.browUp, 2 * p.eg);
  ref.position.set(0, ey, 0.6); eyes.position.set(0, ey + p.eyeDy / 2, 0.6); eyes.rotation.z = a1;
  brows.position.set(0, ey + 0.13 + (p.eyeDy + p.browUp) / 2, 0.55); brows.rotation.z = a2;
  mouth.position.set(0, -0.26, 0.55); mouth.rotation.z = p.mt; mouth.scale.x = 0.42;
  const ring = Ring(RED, 0.09); H.add(ring); ring.position.set(p.mole[0], p.mole[1], 0.5);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      A.userData.face({ open: 0.2, wide: 0.25, smile: 0.4 }); H.rotation.set(0, 0.08 * Math.sin(t * 0.9), 0);
      cl.forEach((m, i) => { m.visible = t > 0.05 + i * 0.03; });
      const sc = (tt, b, w = 0.95) => { const k = eout(clamp((t - tt) / 0.25)); b.scale.x = Math.max(0.001, k * w); b.visible = k > 0.01; };
      sc(t0 - 1.6, ref, 0.85); sc(t0 - 1.3, eyes, 0.85); sc(t0 - 0.9, brows, 0.75); sc(t0 - 0.5, mouth, 0.42);
      const rk = back(clamp((t - t0) / 0.3)); ring.scale.setScalar(Math.max(0.001, rk * (1 + 0.1 * Math.sin(t * 8)))); ring.visible = rk > 0.01;
      look(c, mix(V(0, 0.0, 6.6), V(0, -0.02, 5.9), eio(t / d)), V(0, -0.3, 0));
    },
    ui: () => ({ vig: 0.12 }),
  };
}
// =============== s04: "So the face you know... is backwards." — mirror-you vs real-you ===============
export function backwards(tB) {
  const scene = new THREE.Scene(); bathroom(scene, { tile: '#b9e3f2' });
  const mir = Mirror(1.3, 1.9, { fz: 0.9 }); mir.position.set(-0.7, -0.05, 0); scene.add(mir);
  const A = Bust(HERO), B = Bust(HERO); A.scale.set(-0.62, 0.62, 0.62); B.scale.setScalar(0.62); A.position.set(-0.7, 0.25, 0.35); B.position.set(0.7, 0.25, 0.35); scene.add(A, B);
  const lA = labelSprite('MIRROR', '#ffffff', 1.0), lB = labelSprite('REAL', '#FFD60A', 1.0); lA.position.set(-0.7, -1.38, 1.4); lB.position.set(0.7, -1.38, 1.4); scene.add(lA, lB);
  const rA = Ring(RED, 0.075), rB = Ring(RED, 0.075); scene.add(rA, rB);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.035, 8, 48, Math.PI * 0.8), glowMat(YEL, 1)); arc.rotation.z = Math.PI * 0.1; arc.position.set(0, 0.78, 1.2); scene.add(arc);
  const tips = [-1, 1].map(s => { const cn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 14), glowMat(YEL, 1)); cn.position.set(s * 0.68, 0.91, 1.2); cn.rotation.z = Math.PI + s * 0.5; scene.add(cn); return cn; });
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      for (const b of [A, B]) { b.userData.face({ open: 0.2, wide: 0.3 + 0.5 * ss(tB, tB + 0.2, t), smile: 0.3 }); b.userData.head.rotation.y = 0.06 * Math.sin(t * 1.2); }
      A.userData.mole.getWorldPosition(wp); rA.position.set(wp.x, wp.y, wp.z + 0.05); B.userData.mole.getWorldPosition(wp); rB.position.set(wp.x, wp.y, wp.z + 0.05);
      const k = back(clamp((t - tB + 0.1) / 0.3)); arc.scale.setScalar(Math.max(0.001, k)); arc.visible = k > 0.01; tips.forEach(tp => { tp.visible = k > 0.5; });
      look(c, mix(V(0, 0.1, 10.8), V(0, 0.05, 10.2), eio(t / d)), V(0, -0.35, 0));
    },
    ui: t => ({ vig: 0.12, flash: Math.max(0, 0.2 - Math.abs(t - tB) * 1.2) }),
  };
}
// polaroid photo of the face (flip = mirror image)
function Polaroid(label, flip, p = HERO, bg = '#ffe9c7', lc = '#2b2440') {
  const tex = canvasTex(520, 620, (x, w, h) => { x.fillStyle = '#fbf8f2'; x.fillRect(0, 0, w, h); x.fillStyle = bg; x.fillRect(30, 30, w - 60, 460); drawFace(x, w / 2, 230, 1.45, p, flip);
    x.fillStyle = lc; x.font = '900 72px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, w / 2, 556); });
  const g = new THREE.Group(); const card = M(RB(1.3, 1.55, 0.03, 0.02, 1), 0xfbf8f2, { px: 4 }); g.add(card);
  const img = new THREE.Mesh(new THREE.PlaneGeometry(1.26, 1.5), new THREE.MeshBasicMaterial({ map: tex })); img.position.z = 0.02; g.add(img); return g;
}
function Table(scene) {
  scene.background = new THREE.Color(0x2a1a12);
  lights(scene, { hemi: 1.05, sky: 0xfff2dc, ground: 0x3a2414, keyI: 1.9, key: 0xffe2b8, keyPos: [-2, 7, 3], rim: 0xff9a5a, rimI: 0.8, shadow: true, shadowR: 4 });
  const tx = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#b8713f'; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(90,45,20,${0.15 + 0.2 * Math.random()})`; x.lineWidth = 2 + Math.random() * 4; x.beginPath(); const y = Math.random() * h; x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + 20, w * 0.6, y - 20, w, y + 8); x.stroke(); } });
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(2, 2);
  const tb = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshToonMaterial({ map: tx })); tb.rotation.x = -Math.PI / 2; tb.receiveShadow = true; scene.add(tb);
  const lamp = halo(0xffd29a, 9, 0.35); lamp.position.set(0, 3, -1); scene.add(lamp);
}
// =============== s05 + s06: 1977 — real vs flipped photo; who picked which ===============
export function photos(mode, tA, tB) {
  const scene = new THREE.Scene(); Table(scene);
  const real = Polaroid('REAL', false), flip = Polaroid('FLIPPED', true, HERO, '#d8f3ff');
  for (const [ph, z, rz] of [[real, -1.1, 0.05], [flip, 1.02, -0.06]]) { ph.rotation.x = -Math.PI / 2; ph.rotation.z = rz; ph.position.set(0, 0.03, z); ph.castShadow = true; scene.add(ph); ph.userData.z = z; }
  const sY = labelSprite('THEM ♥', '#ff6b6b', 1.5), sF = labelSprite('FRIENDS ♥', '#4dff88', 1.6); scene.add(sY, sF);
  const ringY = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.04, 8, 64), glowMat(CORAL, 1)), ringF = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.04, 8, 64), glowMat(GREEN, 1));
  ringY.rotation.x = ringF.rotation.x = -Math.PI / 2; ringY.position.set(0, 0.06, 1.02); ringF.position.set(0, 0.06, -1.1); ringY.scale.set(0.78, 1, 0.92); ringF.scale.set(0.78, 1, 0.92); scene.add(ringY, ringF);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      if (mode === 'show') { const k1 = eout(clamp((t - tA + 0.3) / 0.45)), k2 = eout(clamp((t - tB + 0.3) / 0.45)); real.position.x = lerp(-4, 0, k1); flip.position.x = lerp(4, 0, k2); real.visible = k1 > 0; flip.visible = k2 > 0; }
      const ky = mode === 'vote' ? back(clamp((t - tA) / 0.3)) : 0, kf = mode === 'vote' ? back(clamp((t - tB) / 0.3)) : 0;
      sY.position.set(0.1, 0.4, 1.3); sF.position.set(0.1, 0.4, -0.85); sY.scale.set(1.5 * ky, 1.5 * ky * 192 / 1024, 1); sF.scale.set(1.6 * kf, 1.6 * kf * 192 / 1024, 1); sY.visible = ky > 0.01; sF.visible = kf > 0.01;
      ringY.visible = ky > 0.01; ringF.visible = kf > 0.01; ringY.material.opacity = ringF.material.opacity = 0.7 + 0.3 * Math.sin(t * 8);
      if (mode === 'show') look(c, mix(V(0, 9.0, 1.6), V(0, 8.7, 1.4), eio(t / d)), V(0, 0, -0.62));
      else look(c, mix(V(0, 8.7, 1.4), V(0, 8.5, 1.3), eio(t / d)), V(0, 0, -0.62));
    },
    ui: () => ({ vig: 0.3, sepia: mode === 'show' ? 0.45 : 0.25 }),
  };
}
// =============== s07: "We like the face we see most." — the mirror tunnel of you ===============
export function familiar() {
  const scene = new THREE.Scene(); bathroom(scene, { tile: '#ffd0b5' });
  const mir = Mirror(2.3, 3.0); mir.position.set(0, -0.35, 0); scene.add(mir);
  const copies = []; for (let i = 0; i < 0; i++) { const b = Bust(HERO); const s = 0.5 - i * 0.1; b.scale.set(-s, s, s); b.position.set((i % 2 ? 1 : -1) * (0.5 + i * 0.05), 0.55 - i * 0.12, 0.2 - i * 0.05); scene.add(b); setOpacity(b, 0.55 - i * 0.1); copies.push(b); }
  const A = Bust(HERO, { torso: true }); A.scale.set(-1, 1, 1); A.position.set(0, 0, 0.6); scene.add(A);
  const sink = M(RB(3.4, 0.35, 1.4, 0.08, 3), CREAM, { px: 5 }); sink.position.set(0, -2.15, 1.5); scene.add(sink);
  const hearts = Hearts(scene, 12, 9, [-1.0, 1.0, -1.2, 1.0, 1.2]);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      A.userData.face({ open: 0.3, wide: 0.1, smile: 1 }); A.userData.head.rotation.set(0, 0.1 * Math.sin(t * 1.5), 0.05 * Math.sin(t * 2));
      copies.forEach((b, i) => { b.userData.head.rotation.y = 0.2 * Math.sin(t * 1.2 + i); });
      hearts(t, ss(0.1, 0.5, t));
      look(c, mix(V(0, -0.15, 8.4), V(0, -0.15, 7.6), eio(t / d)), V(0, -0.45, 0));
    },
    ui: () => ({ vig: 0.12 }),
  };
}
// =============== s08: another study — people picked a prettier, edited version as their real face ===============
export function lineup(tPick, tReal) {
  const scene = new THREE.Scene(); bathroom(scene, { tile: '#d7c8f5' });
  const p1 = { ...HERO }, p2 = { ...HERO, es: 1.25, eyeDy: 0.01, mt: 0.04, browUp: 0.015, nl: 0.95 }, p3 = { ...HERO, es: 1.45, eyeDy: 0, mt: 0, browUp: 0, nl: 0.85, fw: 0.9, mole: null };
  const ph = [Polaroid('REAL', false, p1, '#ffe9c7'), Polaroid('EDITED', false, p2, '#d8f3ff'), Polaroid('EDITED++', false, p3, '#ffd6ec')];
  ph.forEach((g, i) => { g.scale.setScalar(0.74); g.position.set((i - 1) * 1.05, 0.15, 0.2); g.rotation.z = (i - 1) * 0.04; scene.add(g); });
  const sel = new THREE.Group(); const sm = glowMat(YEL, 1); for (const [x, y, w, h] of [[0, 0.62, 1.1, 0.06], [0, -0.62, 1.1, 0.06], [-0.52, 0, 0.06, 1.3], [0.52, 0, 0.06, 1.3]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.02), sm); b.position.set(x, y, 0); sel.add(b); } sel.position.z = 0.4; scene.add(sel);
  const me = labelSprite('"THAT\'S ME!"', '#ff6b6b', 1.25); scene.add(me);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const hop = [0, 2, 0, 1], seg = Math.min(3, Math.floor(clamp(t / Math.max(0.1, tPick)) * 3.999)); const i = t >= tPick ? 1 : hop[seg];
      sel.position.x = lerp(sel.position.x, (i - 1) * 1.05, 0.35); sel.position.y = 0.15; sm.opacity = 0.75 + 0.25 * Math.sin(t * 10);
      const k = back(clamp((t - tPick - 0.1) / 0.3)); me.position.set(0, -0.62, 0.6); me.scale.set(1.25 * k, 1.25 * k * 192 / 1024, 1); me.visible = k > 0.01;
      ph[1].scale.setScalar(0.74 * (1 + 0.08 * ss(tPick, tPick + 0.3, t)));
      look(c, mix(V(0, 0.0, 10.8), V(0, 0.0, 10.2), eio(t / d)), V(0, -0.35, 0));
    },
    ui: () => ({ vig: 0.12 }),
  };
}
// =============== s09: "So that photo you can't stand?" — a phone with your real photo ===============
export function phone(tX) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x26324f);
  lights(scene, { hemi: 1.1, sky: 0xffffff, ground: 0x26324f, keyI: 1.7, keyPos: [-2, 3, 6], rim: CORAL, rimI: 1.0 });
  const bh = halo(0xff8a6a, 8, 0.35); bh.position.set(0, 0.5, -2); scene.add(bh);
  const tex = canvasTex(540, 1080, (x, w, h) => { x.fillStyle = '#111318'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffe9c7'; x.fillRect(0, 170, w, 700); drawFace(x, w / 2, 470, 2.0, HERO, false);
    x.fillStyle = '#2b2f3a'; for (let i = 0; i < 4; i++) x.fillRect(30 + i * 128, 900, 108, 108); x.fillStyle = '#ffffff'; x.font = '700 40px Inter'; x.textAlign = 'left'; x.fillText('< Photos', 28, 100); });
  const ph = new THREE.Group(); scene.add(ph);
  const body = M(RB(1.9, 3.8, 0.18, 0.22, 4), 0x2b2f3a, { px: 6 }); ph.add(body);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.74, 3.48), new THREE.MeshBasicMaterial({ map: tex })); scr.position.z = 0.1; ph.add(scr);
  const xA = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.11, 0.02), glowMat(RED, 1)), xB = xA.clone(); xA.rotation.z = 0.78; xB.rotation.z = -0.78; const X = new THREE.Group(); X.add(xA, xB); X.position.set(0, 0.45, 0.2); ph.add(X);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      ph.rotation.set(-0.08 + 0.03 * Math.sin(t * 2), 0.15 * Math.sin(t * 0.9), 0.04 * Math.sin(t * 1.3));
      const k = back(clamp((t - tX) / 0.25)); X.scale.setScalar(Math.max(0.001, k * 1.3)); X.visible = k > 0.01;
      look(c, mix(V(0, 0.2, 8.6), V(0, 0.1, 7.8), eio(t / d)), V(0, -0.35, 0)); shake(c, t, tX, 0.04, 0.25);
    },
    ui: () => ({ vig: 0.25 }),
  };
}
