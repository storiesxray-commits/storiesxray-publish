import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, M, fresnel, glowMat, addMat, halo, setOpacity, lights, shake, Subject, poseStand, earth, stars } from '../../engine/engine.js';

// xr007 — Look-alikes: "8 billion people. How many have YOUR face?"
// All faces are GENERIC busts built here from random parameters (no likeness of any real person, no photos, no logos).
// Facts: Lucas & Henneberg 2015 (8 facial measurements, ~4,000 faces, < 1 in a trillion), Joshi et al. 2022 Cell Reports (32 pairs, 16 matched by 3 algorithms, 9 clustered genetically).
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);

// palette: neon night — deep indigo, magenta, teal, yellow accents (different from xr006's warm Provence)
const BG = 0x120b2e, BG2 = 0x1d1045, MAG = 0xff3ea5, TEAL = 0x22d3ee, YEL = 0xffd60a, GREEN = 0x4dff88;
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
const HERO = { skin: 0xe2ad86, hair: 0x3b2418, shirt: 0x3a86ff, style: 1, fw: 0.95, fh: 1.1, eg: 0.17, es: 1.08, nl: 1.05, nw: 1.0, mw: 1.05, by: 0.0 };
// head-and-shoulders bust; head center at y=0, radius ~0.5. o.simple = cheap crowd version; o.xray = fresnel glass.
function Bust(p, o = {}) {
  const g = new THREE.Group(), xr = !!o.xray, simple = !!o.simple;
  const fm = xr ? fresnel(o.xcol || TEAL, 2.0, 0.95, 0.02) : null;
  const mk = (geo, col, px = 5) => xr ? new THREE.Mesh(geo, fm) : (simple ? new THREE.Mesh(geo, toon(col)) : M(geo, col, { px }));
  const fw = p.fw, fh = p.fh, R = 0.5;
  const sh = mk(new THREE.SphereGeometry(0.66, 32, 20), p.shirt); sh.scale.set(1.3, 0.62, 0.66); sh.position.y = -1.02; g.add(sh);
  const neck = mk(new THREE.CylinderGeometry(0.17, 0.21, 0.42, 16), p.skin, 4); neck.position.y = -0.58; g.add(neck);
  const head = new THREE.Group(); g.add(head); g.userData.head = head;
  const skull = mk(new THREE.SphereGeometry(R, 40, 30), p.skin, 6); skull.scale.set(fw, fh, 0.96); head.add(skull);
  const zs = (x, y) => R * 0.96 * Math.sqrt(Math.max(0.02, 1 - (x / (R * fw)) ** 2 - (y / (R * fh)) ** 2));   // face surface depth
  const J = { head, eyes: [], brows: [] }; g.userData.J = J;
  if (!xr) {
    // hair
    const hm = (geo, sc, pos, rx = 0) => { const m = mk(geo, p.hair, 5); m.scale.set(...sc); m.position.set(...pos); m.rotation.x = rx; head.add(m); return m; };
    const capG = new THREE.SphereGeometry(R * 1.04, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.47);
    if (p.style === 0) hm(capG, [fw, fh * 1.02, 1.0], [0, 0.03, -0.02], -0.3);
    if (p.style === 1) { hm(capG, [fw, fh * 1.02, 1.0], [0, 0.03, -0.02], -0.32); hm(new THREE.SphereGeometry(0.2, 18, 12), [1.9, 0.6, 1.1], [0.07, R * fh * 0.78, 0.27], 0.6); }
    if (p.style === 2) { hm(capG, [fw * 1.02, fh * 1.04, 1.02], [0, 0.03, -0.02], -0.22); hm(new THREE.CapsuleGeometry(0.42, 0.55, 8, 16), [fw * 1.05, 1, 0.55], [0, -0.32, -0.2]); }
    if (p.style === 3) hm(capG, [fw * 0.99, fh, 0.99], [0, 0.0, -0.03], -0.45);
    if (p.style === 4) { const r2 = rnd(Math.floor(p.fw * 1000)); for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; hm(new THREE.SphereGeometry(0.17, 12, 10), [1, 1, 1], [Math.cos(a) * 0.3 * fw, R * fh * 0.78 + Math.sin(a * 2) * 0.05, Math.sin(a) * 0.3 - 0.05]); } }
    if (!simple) for (const s of [-1, 1]) { const ear = M(new THREE.SphereGeometry(0.075, 12, 10), p.skin, { px: 3 }); ear.scale.set(0.5, 1, 0.8); ear.position.set(s * R * fw * 0.98, -0.01, 0); head.add(ear); }
    // eyes
    const eyeY = 0.04, er = 0.075 * p.es;
    for (const s of [-1, 1]) {
      const x = s * p.eg, z = zs(x, eyeY);
      const eye = new THREE.Group(); eye.position.set(x, eyeY, z - 0.02); eye.rotation.y = s * 0.28; head.add(eye);
      if (simple) { const d = new THREE.Mesh(new THREE.SphereGeometry(er * 0.55, 10, 8), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); d.scale.z = 0.4; eye.add(d); continue; }
      const white = new THREE.Mesh(new THREE.SphereGeometry(er, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffffff })); white.scale.set(1, 0.95, 0.35); eye.add(white);
      const ring = new THREE.Mesh(new THREE.SphereGeometry(er * 1.14, 20, 14), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); ring.scale.set(1, 0.95, 0.2); ring.position.z = -0.006; eye.add(ring);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(er * 0.55, 14, 10), new THREE.MeshBasicMaterial({ color: 0x4a3020 })); iris.scale.z = 0.35; iris.position.z = 0.02; eye.add(iris);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(er * 0.3, 12, 8), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); pupil.scale.z = 0.4; pupil.position.z = 0.03; eye.add(pupil);
      const glint = new THREE.Mesh(new THREE.SphereGeometry(er * 0.12, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); glint.position.set(er * 0.2, er * 0.2, 0.035); eye.add(glint);
      eye.userData.pupil = iris; J.eyes.push(eye);
      const brow = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.032, 0.03, 2, 0.012), new THREE.MeshBasicMaterial({ color: p.hair === 0x8a8f96 ? 0x55595f : 0x1f1712 }));
      brow.position.set(x, eyeY + 0.13 + p.by, zs(x, eyeY + 0.13) + 0.005); brow.rotation.y = s * 0.28; brow.userData = { s, y: brow.position.y }; head.add(brow); J.brows.push(brow);
    }
    if (!simple) {
      const nose = M(new THREE.SphereGeometry(0.06, 14, 10), new THREE.Color(p.skin).multiplyScalar(0.9).getHex(), { px: 3 }); nose.scale.set(p.nw * 0.85, p.nl * 1.2, 0.9); nose.position.set(0, -0.09, zs(0, -0.09) + 0.02); head.add(nose);
      const mouth = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 14), new THREE.MeshBasicMaterial({ color: 0x2a0f12 })); mouth.position.set(0, -0.26, zs(0, -0.26) - 0.01); mouth.userData.w = p.mw; head.add(mouth); J.mouth = mouth;
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
function night(scene, o = {}) {
  bgGrad(scene); scene.fog = new THREE.Fog(0x24104f, o.f0 || 7, o.f1 || 16);
  const L = lights(scene, { hemi: 1.0, sky: 0xffe6f4, ground: 0x2a1650, keyI: 2.1, key: 0xfff0e6, keyPos: [-3, 4, 6], rim: o.rim || MAG, rimI: 1.5, rimPos: [3, 3, -4] });
  const h1 = halo(MAG, 9, 0.35); h1.position.set(-3, 2, -8); scene.add(h1); const h2 = halo(TEAL, 9, 0.3); h2.position.set(3.5, 0.5, -8); scene.add(h2);
  return L;
}

// =============== s01 + loop (s12): HOOK — two identical faces, a scan links them; a sea of faces behind ===============
export function hook(mode = 'in', tYour = 2.3) {
  const scene = new THREE.Scene(); night(scene);
  const crowd = Crowd(scene, 36, 7, { z0: 2.6, spread: 8, y: -0.2 });
  const A = Bust(HERO), B = Bust(HERO); scene.add(A, B);
  A.position.set(-0.62, 0, 0); B.position.set(0.62, 0, 0); A.rotation.y = 0.45; B.rotation.y = -0.45;
  const beams = []; for (let i = 0; i < 8; i++) { const bm = Beam(i < 4 ? YEL : TEAL, 0.016); scene.add(bm); beams.push(bm); }
  const dots = []; for (let i = 0; i < 16; i++) { const d = halo(YEL, 0.14, 0.9); scene.add(d); dots.push(d); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.012, 6, 64), glowMat(YEL, 0.9)); scene.add(ring);
  const c = cam(34), pa = new THREE.Vector3(), pb = new THREE.Vector3();
  const P0 = V(0, 0.15, 7.9), P1 = V(0, 0.1, 7.3), PE = V(-0.5, 0.05, 3.8);
  return {
    scene, camera: c,
    update(t, d) {
      crowd(t);
      const k = mode === 'in' ? 1 : ss(0.6, d - 0.6, t);   // end: second face appears out of the dark
      const surprise = mode === 'in' ? 0.6 + 0.4 * Math.abs(Math.sin(t * 3)) : 0.3 + 0.7 * k;
      for (const [b, s] of [[A, 1], [B, -1]]) { b.userData.face({ open: 0.25 + 0.4 * surprise * Math.abs(Math.sin(t * 4 + s)), wide: surprise, lookX: s * 0.9 }); b.userData.head.rotation.set(-0.03 + 0.03 * Math.sin(t * 2), 0.08 * Math.sin(t * 1.3 + s), s * 0.05 * Math.sin(t * 1.7)); }
      setOpacity(B, mode === 'in' ? 1 : k); B.visible = (mode === 'in' || k > 0.02);
      const bk = mode === 'in' ? 0.65 + 0.35 * Math.abs(Math.sin(t * 5)) : k;
      A.userData.pts.forEach((q, i) => {
        A.userData.head.localToWorld(pa.copy(q)); B.userData.head.localToWorld(pb.copy(B.userData.pts[i]));
        setBeam(beams[i], pa, pb); beams[i].material.opacity = 0.9 * bk * (i < 4 ? 1 : 0.6); beams[i].visible = bk > 0.03 && B.visible;
        dots[i * 2].position.copy(pa); dots[i * 2 + 1].position.copy(pb); dots[i * 2].material.opacity = dots[i * 2 + 1].material.opacity = 0.9 * bk;
      });
      // the scan ring sweeps over "YOUR" face
      const sw = ((t * 0.9) % 1); ring.position.set(0.62, lerp(0.55, -0.55, sw), 0.15); ring.rotation.set(Math.PI / 2, 0, 0); ring.material.opacity = (mode === 'in' && t > tYour - 0.2) ? 0.85 : 0;
      if (mode === 'in') look(c, mix(P0, P1, eio(t / d)), V(0, -0.38, 0));
      else look(c, mix(PE, P0, eio(ss(0, d, t))), mix(V(-0.62, -0.1, 0), V(0, -0.38, 0), eio(ss(0, d, t))));
      if (mode === 'end') { A.visible = true; }
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s02: "A perfect copy? Almost impossible." — a clone builds, then breaks ===============
export function copy(tBreak) {
  const scene = new THREE.Scene(); night(scene, { rim: TEAL });
  const A = Bust(HERO), G = Bust(HERO, { xray: true }); scene.add(A, G);
  A.position.set(-0.62, 0, 0); A.rotation.y = 0.35; G.position.set(0.62, 0, 0); G.rotation.y = -0.35;
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 0.02), glowMat(TEAL, 1)); scene.add(scan);
  const shards = [], r = rnd(4);
  for (let i = 0; i < 40; i++) { const s = new THREE.Mesh(new THREE.TetrahedronGeometry(0.06 + r() * 0.07), glowMat(i % 3 ? TEAL : MAG, 0.9)); s.userData = { v: V((r() - 0.3) * 3, (r() - 0.3) * 3, (r() - 0.2) * 2), o: V(0.62 + (r() - 0.5) * 0.8, (r() - 0.5) * 1.6, (r() - 0.5) * 0.5), sp: r() * 8 }; scene.add(s); shards.push(s); }
  const xA = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 0.05), glowMat(0xff3b30, 1)), xB = xA.clone(); xA.rotation.z = 0.8; xB.rotation.z = -0.8; const X = new THREE.Group(); X.add(xA, xB); X.position.set(0.62, -0.05, 0.7); scene.add(X);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      A.userData.face({ open: 0.2 + 0.3 * Math.abs(Math.sin(t * 3)), wide: 0.4 + 0.5 * ss(tBreak - 0.1, tBreak + 0.1, t), lookX: 0.9 });
      const build = ss(0.0, tBreak - 0.2, t), br = ss(tBreak, tBreak + 0.35, t);
      scan.position.set(0.62, lerp(0.7, -1.2, build), 0.5); scan.visible = build > 0.01 && build < 0.99;
      G.scale.setScalar(1 + 0.04 * Math.sin(t * 30) * br); setOpacity(G, (0.35 + 0.65 * build) * (1 - br)); G.visible = br < 0.99;
      shards.forEach(s => { const k = clamp((t - tBreak) * 1.2); s.visible = k > 0; s.position.copy(s.userData.o).addScaledVector(s.userData.v, k); s.rotation.set(t * s.userData.sp, t * 3, 0); s.material.opacity = 0.9 * (1 - k); });
      const xk = back(clamp((t - tBreak - 0.15) / 0.3)); X.scale.setScalar(Math.max(0.001, xk)); X.visible = t > tBreak + 0.15;
      look(c, mix(V(0, 0.15, 7.8), V(0.1, 0.1, 7.0), eio(t / d)), V(0.05, -0.38, 0)); shake(c, t, tBreak, 0.05, 0.3);
    },
    ui: t => ({ vig: 0.3, flash: Math.max(0, 0.35 - Math.abs(t - tBreak - 0.05) * 1.8) }),
  };
}
// =============== s03: 8 features measured on ~4,000 faces ===============
export function measure(t8, tEnd) {
  const scene = new THREE.Scene(); bgGrad(scene, '#05101c', '#0b2a3a', '#103a44');
  lights(scene, { hemi: 1.0, sky: 0xe0fbff, ground: 0x0b2030, keyI: 2.0, keyPos: [-2, 3, 6], rim: TEAL, rimI: 1.4 });
  // background: a wall of many small faces (instanced heads)
  const N = 260, hg = new THREE.SphereGeometry(0.16, 14, 10), hairG = new THREE.SphereGeometry(0.168, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.45);
  const heads = new THREE.InstancedMesh(hg, toon(0xffffff), N), hairs = new THREE.InstancedMesh(hairG, toon(0xffffff), N);
  const m4 = new THREE.Matrix4(), r = rnd(31), col = new THREE.Color();
  for (let i = 0; i < N; i++) { const x = -3.6 + (i % 20) * 0.38, y = -2.8 + Math.floor(i / 20) * 0.46; m4.makeTranslation(x + (Math.floor(i / 20) % 2) * 0.19, y, -3); heads.setMatrixAt(i, m4); hairs.setMatrixAt(i, m4.clone().multiply(new THREE.Matrix4().makeRotationX(-0.3)));
    heads.setColorAt(i, col.setHex(SKINS[Math.floor(r() * SKINS.length)])); hairs.setColorAt(i, col.setHex(HAIRS[Math.floor(r() * HAIRS.length)])); }
  scene.add(heads, hairs);
  const dim = new THREE.Mesh(new THREE.PlaneGeometry(12, 10), new THREE.MeshBasicMaterial({ color: 0x05101c, transparent: true, opacity: 0.45 })); dim.position.z = -2.6; scene.add(dim);
  const A = Bust(HERO); scene.add(A); A.position.set(0, 0, 0);
  const P = A.userData.pts, pairs = [[0, 1], [5, 6], [2, 3], [7, 4], [0, 2], [1, 2], [3, 5], [3, 6]];
  const beams = pairs.map(() => { const b = Beam(YEL, 0.02); scene.add(b); return b; });
  const dots = []; for (let i = 0; i < 8; i++) { const d = halo(YEL, 0.16, 1); scene.add(d); dots.push(d); }
  const nums = pairs.map((_, i) => { const s = labelSprite(String(i + 1), '#FFD60A', 0.75); scene.add(s); return s; });
  const pa = new THREE.Vector3(), pb = new THREE.Vector3(), c = cam(32);
  return {
    scene, camera: c,
    update(t, d) {
      A.userData.face({ open: 0.15, wide: 0.15 }); A.userData.head.rotation.set(0, 0.12 * Math.sin(t * 0.8), 0);
      heads.position.x = hairs.position.x = 0.15 * t;
      pairs.forEach(([i, j], n) => {
        const k = ss(t8 + n * (tEnd - t8) / 9, t8 + n * (tEnd - t8) / 9 + 0.18, t);
        A.userData.head.localToWorld(pa.copy(P[i])); A.userData.head.localToWorld(pb.copy(P[j]));
        pb.lerpVectors(pa, pb, k); setBeam(beams[n], pa, pb); beams[n].visible = k > 0.01;
        nums[n].position.copy(pa).lerp(pb, 0.5).add(V(0, 0.07, 0.25)); nums[n].visible = false; nums[n].scale.set(0.42, 0.42 * 192 / 1024, 1);
      });
      P.forEach((q, i) => { A.userData.head.localToWorld(dots[i].position.copy(q)); dots[i].visible = t > t8; });
      look(c, mix(V(0, 0.05, 6.6), V(0, 0.0, 6.0), eio(t / d)), V(0, -0.1, 0));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s04: odds of an exact match — fly over a sea of faces, one lights up ===============
export function odds(tTril) {
  const scene = new THREE.Scene(); bgGrad(scene, '#05030f', '#1a0b3a', '#2a0f40'); scene.fog = new THREE.Fog(0x1a0b3a, 8, 40);
  lights(scene, { hemi: 1.1, sky: 0xffe6f4, ground: 0x1a0b3a, keyI: 1.8, keyPos: [-2, 8, 4], rim: MAG, rimI: 1.0 });
  const N = 4000, side = 64, hg = new THREE.SphereGeometry(0.2, 12, 9), hairG = new THREE.SphereGeometry(0.21, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.45), shG = new THREE.SphereGeometry(0.25, 10, 8);
  const heads = new THREE.InstancedMesh(hg, toon(0xffffff), N), hairs = new THREE.InstancedMesh(hairG, toon(0xffffff), N), shs = new THREE.InstancedMesh(shG, toon(0xffffff), N);
  const m4 = new THREE.Matrix4(), sc = new THREE.Matrix4(), r = rnd(77), col = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const x = ((i % side) - side / 2) * 0.62 + (r() - 0.5) * 0.15, z = -(Math.floor(i / side)) * 0.62 + 2 + (r() - 0.5) * 0.15;
    m4.makeTranslation(x, 0.35, z); heads.setMatrixAt(i, m4); hairs.setMatrixAt(i, m4.clone().multiply(new THREE.Matrix4().makeRotationX(-0.4)));
    shs.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, 0.0, z).multiply(sc.makeScale(1.3, 0.6, 0.8)));
    heads.setColorAt(i, col.setHex(SKINS[Math.floor(r() * SKINS.length)])); hairs.setColorAt(i, col.setHex(HAIRS[Math.floor(r() * HAIRS.length)])); shs.setColorAt(i, col.setHex(SHIRTS[Math.floor(r() * SHIRTS.length)]));
  }
  scene.add(heads, hairs, shs);
  const hero = Bust(HERO); hero.scale.setScalar(0.42); hero.position.set(0, 0.35, 1.0); scene.add(hero);
  const beacon = halo(YEL, 3, 0.0); beacon.position.set(0, 0.6, 1.0); scene.add(beacon);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.035, 8, 48), glowMat(YEL, 1)); ring.rotation.x = -Math.PI / 2; ring.position.set(0, 0.03, 1.0); scene.add(ring);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t, d) {
      const k = eio(t / d);
      hero.userData.face({ open: 0.3, wide: 0.6, lookY: 1 }); hero.rotation.x = -0.35;
      beacon.material.opacity = 0.35 + 0.25 * Math.sin(t * 6); ring.scale.setScalar(1 + 0.15 * Math.sin(t * 6));
      look(c, mix(V(0, 2.2, 3.4), V(0, 13, 6.5), k), mix(V(0, 0.3, 0.6), V(0, 0, -4), k));
    },
    ui: t => ({ vig: 0.35, flash: Math.max(0, 0.25 - Math.abs(t - tTril) * 1.5) }),
  };
}
// ---------------- city street (night) for full-body figures ----------------
function street(scene) {
  bgGrad(scene, '#0a0620', '#2a1258', '#4a1650'); scene.fog = new THREE.Fog(0x2a1258, 10, 30);
  lights(scene, { hemi: 1.0, sky: 0xffe0f0, ground: 0x2a1650, keyI: 2.2, keyPos: [-4, 6, 6], rim: TEAL, rimI: 1.4, rimPos: [4, 4, -6], shadow: true, shadowR: 5 });
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), toon(0x3a2f5a)); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; scene.add(gr);
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(60, 3), toon(0x5a4f7a)); walk.rotation.x = -Math.PI / 2; walk.position.set(0, 0.005, 0); walk.receiveShadow = true; scene.add(walk);
  const r = rnd(12); let x = -14;
  while (x < 14) { const w = 2 + r() * 2, h = 3 + r() * 6, b = M(RB(w, h, 2, 0.04, 2), [0x4a3a7a, 0x5a3a80, 0x3f356e][Math.floor(r() * 3)], { px: 4 }); b.position.set(x + w / 2, h / 2, -4.5 - r()); scene.add(b);
    for (let j = 0; j < Math.floor(h / 1.2); j++) for (let i = 0; i < Math.floor(w / 0.9); i++) { if (r() < 0.45) continue; const wn = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.55), new THREE.MeshBasicMaterial({ color: [0xffd88a, 0xff7ad9, 0x7ae7ff][Math.floor(r() * 3)] })); wn.position.set(x + 0.5 + i * 0.9, 0.9 + j * 1.2, b.position.z + 1.01); scene.add(wn); }
    x += w + 0.2; }
  for (const lx of [-3.5, 3.5]) { const p = M(new THREE.CylinderGeometry(0.05, 0.07, 3.4, 10), 0x1a1a22, { px: 3 }); p.position.set(lx, 1.7, -1.6); scene.add(p); const lh = halo(0xffc6f0, 1.4, 0.8); lh.position.set(lx, 3.45, -1.6); scene.add(lh); }
}
// a full-body figure with the HERO face (head replaced by a scaled bust head)
function Twin(shirt, pants) {
  const g = Subject({ col: { torso: shirt, upper: shirt, fore: HERO.skin, hand: HERO.skin, thigh: pants, shin: pants, shoe: 0x22222a } });
  const J = g.userData.J; J.head.children.slice().forEach(ch => J.head.remove(ch));
  const b = Bust({ ...HERO, shirt }); b.children[0].visible = false; b.children[1].visible = false; b.scale.setScalar(0.33); b.position.y = 0.02; J.head.add(b);
  g.userData.bust = b; poseStand(g); return g;
}
function walkPose(g, t, k) { const J = g.userData.J, a = t * 8; J.leg.L.l.rotation.x = 0.45 * Math.sin(a) * k; J.leg.R.l.rotation.x = -0.45 * Math.sin(a) * k; J.leg.L.kn.rotation.x = 0.4 * Math.max(0, -Math.sin(a)) * k; J.leg.R.kn.rotation.x = 0.4 * Math.max(0, Math.sin(a)) * k; J.arm.L.a.rotation.x = -0.4 * Math.sin(a) * k; J.arm.R.a.rotation.x = 0.4 * Math.sin(a) * k; J.hips.position.y = 0.95 + 0.02 * Math.abs(Math.sin(a)) * k; }
// =============== s05: "But look-alikes? Oh, they're real." — two strangers meet, double take ===============
export function meet(tStop, tOh) {
  const scene = new THREE.Scene(); street(scene);
  const A = Twin(0xff006e, 0x2b2b44), B = Twin(0x2ec4b6, 0x3d5f94); scene.add(A, B);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const w = 1 - ss(tStop - 0.3, tStop, t);
      A.position.set(lerp(-2.6, -0.42, ss(0, tStop, t)), 0, 0.2); B.position.set(lerp(2.6, 0.42, ss(0, tStop, t)), 0, 0.2);
      for (const [g, s] of [[A, 1], [B, -1]]) {
        poseStand(g, t); walkPose(g, t, w); g.rotation.y = s * lerp(Math.PI / 2, 0.55, ss(tStop - 0.2, tStop + 0.25, t));
        const take = ss(tStop, tStop + 0.2, t), J = g.userData.J;
        J.head.rotation.set(-0.05, s * 0.25 * Math.sin(Math.min(1, (t - tStop) * 3) * Math.PI * 2) * take, 0);
        const laugh = ss(tOh - 0.1, tOh + 0.1, t);
        g.userData.bust.userData.face({ open: 0.2 + 0.6 * laugh * Math.abs(Math.sin(t * 10)) + 0.3 * take * (1 - laugh), wide: take, lookX: s * 0.8, smile: laugh });
        if (laugh > 0) { J.arm.L.a.rotation.set(-0.4 * laugh, 0, -0.5 * laugh - 0.16); J.arm.R.a.rotation.set(-0.4 * laugh, 0, 0.5 * laugh + 0.16); J.arm.L.b.rotation.x = -1.2 * laugh; J.arm.R.b.rotation.x = -1.2 * laugh; }
      }
      look(c, mix(V(0, 1.55, 7.5), V(0, 1.45, 5.0), eio(ss(0, d, t))), V(0, 1.15, 0));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// 2D cartoon face for photo frames
function drawFace(x, cx, cy, s, p) {
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
  x.fillStyle = '#2a0f12'; x.beginPath(); x.ellipse(cx, cy + 50 * s, 20 * s * p.mw, 8 * s, 0, 0, Math.PI); x.fill(); x.stroke();
}
// =============== s06: 32 pairs of strangers who look like twins — a wall of paired portraits ===============
export function wall(tStr) {
  const scene = new THREE.Scene(); bgGrad(scene, '#140a24', '#2a1640', '#3a1a3a');
  lights(scene, { hemi: 1.1, sky: 0xfff0e6, ground: 0x2a1640, keyI: 1.6, keyPos: [-2, 3, 6], rim: MAG, rimI: 1.0 });
  const wallM = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(0x2a1a44)); wallM.position.z = -0.12; scene.add(wallM);
  const frames = [], r = rnd(55);
  for (let i = 0; i < 20; i++) {
    const p = faceP(900 + i * 7), col = i % 5, row = Math.floor(i / 5);
    const tex = canvasTex(520, 330, (x, w, h) => { x.fillStyle = ['#ffe9c7', '#d8f3ff', '#ffd6ec', '#e3ffd6'][i % 4]; x.fillRect(0, 0, w, h); drawFace(x, 140, 150, 0.95, p); drawFace(x, 380, 150, 0.95, p); x.fillStyle = '#0b0b0f'; x.font = '900 40px Inter'; x.textAlign = 'center'; x.fillText('=', 260, 170); });
    const fr = new THREE.Group(); scene.add(fr); frames.push(fr);
    const border = M(RB(1.72, 1.15, 0.06, 0.02, 2), 0xf6f1e6, { px: 4 }); fr.add(border);
    const img = new THREE.Mesh(new THREE.PlaneGeometry(1.56, 0.99), new THREE.MeshBasicMaterial({ map: tex })); img.position.z = 0.035; fr.add(img);
    fr.position.set((col - 2) * 1.9 + (row % 2) * 0.3, 1.9 - row * 1.32, 0); fr.rotation.z = (r() - 0.5) * 0.08; fr.userData = { d: i * 0.06 };
  }
  const spot = halo(YEL, 3.2, 0.0); spot.position.set(0, 0.58, 0.3); scene.add(spot);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      frames.forEach(f => { const k = back(clamp((t - f.userData.d) / 0.35)); f.scale.setScalar(Math.max(0.001, k)); f.visible = k > 0.01; });
      spot.material.opacity = 0.35 * ss(tStr, tStr + 0.3, t);
      look(c, mix(V(-0.4, 0.0, 9.6), V(0.0, 0.5, 5.2), eio(ss(0.5, d, t))), mix(V(-0.4, -0.2, 0), V(0.0, 0.25, 0), eio(ss(0.5, d, t))));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s07: three face scanners matched 16 pairs ===============
export function scanners(tMatch) {
  const scene = new THREE.Scene(); bgGrad(scene, '#03121a', '#08283a', '#0a3a3a');
  lights(scene, { hemi: 1.0, sky: 0xe0fbff, ground: 0x08283a, keyI: 1.9, keyPos: [-2, 3, 6], rim: TEAL, rimI: 1.4 });
  const p2 = faceP(4242); p2.shirt = 0xfb5607; const p3 = { ...p2, shirt: 0x8338ec };
  const A = Bust(p2), B = Bust(p3); scene.add(A, B); A.position.set(-0.62, 0, 0); B.position.set(0.62, 0, 0); A.rotation.y = 0.3; B.rotation.y = -0.3;
  const cols = [TEAL, MAG, YEL], rings = [];
  for (let i = 0; i < 3; i++) { const g = new THREE.Group(); for (const x of [-0.62, 0.62]) { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.016, 6, 64), glowMat(cols[i], 0.95)); rg.rotation.x = Math.PI / 2; rg.position.x = x; g.add(rg); } scene.add(g); rings.push(g); }
  const checks = cols.map((cc, i) => { const s = labelSprite('SCAN ' + (i + 1) + ': MATCH ✓', '#' + new THREE.Color(cc).getHexString(), 1.6); scene.add(s); s.position.set(0, -1.45 - i * 0.3, 0.6); return s; });
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      A.userData.face({ open: 0.2, wide: 0.2, lookX: 0.8 }); B.userData.face({ open: 0.2, wide: 0.2, lookX: -0.8 });
      rings.forEach((g, i) => { const t0 = i * 0.35, k = ((t - t0) * 0.9) % 1; g.position.y = lerp(0.65, -0.7, k); g.visible = t > t0; });
      checks.forEach((s, i) => { const tt = tMatch + i * 0.18, k = back(clamp((t - tt) / 0.25)); s.visible = t > tt; s.scale.set(1.6 * k, 1.6 * k * 192 / 1024, 1); });
      look(c, mix(V(0, 0.0, 8.8), V(0, -0.05, 8.2), eio(t / d)), V(0, -0.5, 0));
    },
    ui: t => ({ vig: 0.3, flash: Math.max(0, 0.18 - Math.abs(t - tMatch) * 1.2) }),
  };
}
// DNA double helix (bars colored by "variant"; shared ones light up yellow)
function Helix(n = 22, seed = 1, h = 3.2) {
  const g = new THREE.Group(), r = rnd(seed), rungs = [];
  const bases = [0xff3ea5, 0x22d3ee, 0x7dff9a, 0x9b7fd1];
  for (let i = 0; i < n; i++) {
    const y = -h / 2 + i * h / (n - 1), a = i * 0.55;
    for (const s of [0, Math.PI]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), glowMat(0xdff8ff, 1)); b.position.set(0.42 * Math.cos(a + s), y, 0.42 * Math.sin(a + s)); g.add(b); }
    const rg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.84, 8), glowMat(bases[Math.floor(r() * 4)], 0.9)); rg.rotation.z = Math.PI / 2; rg.rotation.y = -a; rg.position.y = y; g.add(rg);
    rg.userData.base = rg.material.color.getHex(); rungs.push(rg);
  }
  g.userData.rungs = rungs; return g;
}
// =============== s08: then they tested their DNA — faces go x-ray, a helix rises ===============
export function dna(tX) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x07121c);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.5, rimI: 1.1 });
  const bh = halo(0x0f5f78, 8, 0.55); bh.position.set(0, 0, -3); scene.add(bh);
  const p2 = faceP(4242); p2.shirt = 0xfb5607; const p3 = { ...p2, shirt: 0x8338ec };
  const A = Bust(p2), B = Bust(p3), AX = Bust(p2, { xray: true }), BX = Bust(p3, { xray: true }); scene.add(A, B, AX, BX);
  for (const [b, s] of [[A, -1], [AX, -1], [B, 1], [BX, 1]]) { b.position.set(s * 0.95, 0, 0); b.rotation.y = -s * 0.35; }
  const hx = Helix(20, 3, 2.1); hx.position.set(0, 0, 0.2); scene.add(hx);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.016), glowMat(TEAL, 1)); scene.add(scan);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const k = ss(tX, tX + 0.5, t); setOpacity(A, 1 - k); setOpacity(B, 1 - k); setOpacity(AX, k); setOpacity(BX, k);
      A.userData.face({ open: 0.5, wide: 1, lookX: 0.8 }); B.userData.face({ open: 0.5, wide: 1, lookX: -0.8 });
      scan.visible = k > 0.01 && k < 0.99; scan.position.set(0, lerp(0.7, -1.2, k), 0.6);
      const up = eout(ss(tX, tX + 0.8, t)); hx.position.y = lerp(-3.4, -0.3, up); hx.rotation.y = t * 1.6; hx.visible = up > 0.01;
      look(c, mix(V(0, 0.1, 9.4), V(0, 0.05, 8.8), eio(t / d)), V(0, -0.35, 0));
    },
    ui: t => ({ vig: 0.3, flash: Math.max(0, 0.32 - Math.abs(t - tX - 0.1) * 1.6) }),
  };
}
// =============== s09: nine pairs shared many of the same gene variants — two helices, matching rungs light up ===============
export function genes(tSame) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x07121c);
  const bh = halo(0x0f5f78, 9, 0.5); bh.position.set(0, 0, -3); scene.add(bh);
  const h1 = Helix(22, 3, 3.0), h2 = Helix(22, 3, 3.0); scene.add(h1, h2); h1.position.x = -0.75; h2.position.x = 0.75;
  // a few rungs differ between the two, most are the same
  const diff = new Set([2, 7, 13, 18]); h2.userData.rungs.forEach((rg, i) => { if (diff.has(i)) rg.material.color.setHex(0x9b7fd1 === rg.userData.base ? 0xff3ea5 : 0x9b7fd1); });
  const links = h1.userData.rungs.map(() => { const b = Beam(YEL, 0.014); scene.add(b); return b; });
  const pa = new THREE.Vector3(), pb = new THREE.Vector3(), c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      h1.rotation.y = h2.rotation.y = t * 1.1;
      h1.userData.rungs.forEach((rg, i) => {
        const on = !diff.has(i) && t > tSame - 0.4 + i * 0.04, fl = on ? 1 : 0, r2 = h2.userData.rungs[i];
        rg.material.color.setHex(fl ? YEL : rg.userData.base); if (!diff.has(i)) r2.material.color.setHex(fl ? YEL : r2.userData.base);
        rg.getWorldPosition(pa); r2.getWorldPosition(pb); pa.x += 0.42; pb.x -= 0.42; setBeam(links[i], pa, pb); links[i].visible = on; links[i].material.opacity = 0.5 + 0.4 * Math.sin(t * 10 + i);
      });
      look(c, mix(V(0, 0.6, 10.6), V(0, 0.4, 9.8), eio(t / d)), V(0, 0.3, 0));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// height chart texture
function chartTex() { return canvasTex(256, 1024, (x, w, h) => { x.fillStyle = '#f3ecdc'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2b2440'; x.fillStyle = '#2b2440'; x.font = '900 46px Inter'; x.textAlign = 'left';
  for (let i = 0; i <= 28; i++) { const y = h - i * h / 28; x.lineWidth = i % 4 === 0 ? 8 : 3; x.beginPath(); x.moveTo(0, y); x.lineTo(i % 4 === 0 ? 120 : 60, y); x.stroke(); if (i % 4 === 0 && i > 0) x.fillText(i / 4 + ' FT', 130, y + 16); } }); }
function Scale() { const g = new THREE.Group(); const b = M(RB(0.75, 0.12, 0.6, 0.04, 2), 0xe9e4da, { px: 4 }); b.position.y = 0.06; g.add(b);
  const dial = new THREE.Mesh(new THREE.CircleGeometry(0.11, 24), new THREE.MeshBasicMaterial({ color: 0xffffff })); dial.rotation.x = -Math.PI / 2; dial.position.set(0, 0.125, 0.18); g.add(dial);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.004, 0.1), new THREE.MeshBasicMaterial({ color: 0xff3b30 })); nd.geometry.translate(0, 0, -0.045); nd.position.set(0, 0.13, 0.18); g.add(nd); g.userData.nd = nd; return g; }
function Cig() { const g = new THREE.Group(); const b = M(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 10), 0xf4f1ea, { px: 2 }); g.add(b); const f = M(new THREE.CylinderGeometry(0.0125, 0.0125, 0.05, 10), 0xd99a4e, { px: 2 }); f.position.y = -0.08; g.add(f);
  const e = halo(0xff5a1a, 0.08, 0.9); e.position.y = 0.085; g.add(e); const puffs = []; for (let i = 0; i < 6; i++) { const s = halo(0xd8d4e8, 0.1, 0); g.add(s); puffs.push(s); }
  g.userData.update = t => puffs.forEach((s, i) => { const k = (t * 0.5 + i / 6) % 1; s.position.set(0.03 * Math.sin(k * 6 + i), 0.1 + k * 0.45, 0); s.scale.setScalar(0.06 + k * 0.2); s.material.opacity = 0.35 * Math.sin(Math.PI * k); }); return g; }
// =============== s10: they even tended to share height, weight... and smoking ===============
export function traits(tH, tW, tS) {
  const scene = new THREE.Scene(); bgGrad(scene, '#140a24', '#2a1640', '#3a1a3a');
  lights(scene, { hemi: 1.05, sky: 0xfff0e6, ground: 0x2a1640, keyI: 2.0, keyPos: [-3, 5, 6], rim: MAG, rimI: 1.2, shadow: true, shadowR: 4 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(0x3a2f5a)); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  const back_ = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), toon(0x2a1a44)); back_.position.set(0, 6, -1.2); scene.add(back_);
  const ch = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 2.4), new THREE.MeshBasicMaterial({ map: chartTex() })); ch.position.set(0, 1.2, -1.15); scene.add(ch);
  const p2 = faceP(4242); const A = Twin(0xfb5607, 0x2b2b44), B = Twin(0x8338ec, 0x3d5f94);
  // same face params as the scanner pair
  for (const tw of [A, B]) { const J = tw.userData.J; J.head.remove(tw.userData.bust); const b = Bust({ ...p2, shirt: 0 }); b.children[0].visible = false; b.children[1].visible = false; b.scale.setScalar(0.33); b.position.y = 0.02; J.head.add(b); tw.userData.bust = b; }
  scene.add(A, B); A.position.set(-0.7, 0.12, 0); B.position.set(0.7, 0.12, 0);
  const sA = Scale(), sB = Scale(); sA.position.set(-0.7, 0, 0); sB.position.set(0.7, 0, 0); scene.add(sA, sB);
  const line = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.03, 0.02), glowMat(YEL, 1)); line.position.set(0, 2.08, 0.3); scene.add(line);
  const cA = Cig(), cB = Cig(); A.userData.J.arm.R.hand.add(cA); B.userData.J.arm.L.hand.add(cB); cA.scale.setScalar(1.8); cB.scale.setScalar(1.8); cA.position.y = -0.06; cB.position.y = -0.06;
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      for (const [g, s] of [[A, 1], [B, -1]]) { poseStand(g, t); g.rotation.y = s * 0.25; g.userData.bust.userData.face({ open: 0.2, wide: 0.3, lookX: s * 0.6 }); }
      const kH = ss(tH, tH + 0.3, t); line.scale.x = Math.max(0.001, kH); line.visible = kH > 0.01;
      const kW = ss(tW, tW + 0.4, t); sA.userData.nd.rotation.y = sB.userData.nd.rotation.y = -2.2 * eout(kW);
      const kS = ss(tS - 0.1, tS + 0.2, t); cA.visible = cB.visible = kS > 0.01; cA.userData.update(t); cB.userData.update(t);
      // smoking: bring the hand up a little
      for (const [g, side] of [[A, 'R'], [B, 'L']]) { const ar = g.userData.J.arm[side], s = side === 'R' ? 1 : -1; ar.a.rotation.set(-0.5 * kS, 0, s * (0.16 + 0.1 * kS)); ar.b.rotation.set(-1.6 * kS - 0.12, 0, 0); }
      look(c, mix(V(0, 1.5, 6.8), V(0, 1.45, 6.2), eio(t / d)), V(0, 1.35, 0));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// =============== s11: with eight billion of us — the planet lights up, look-alike pairs link across it ===============
export function planet(tMore) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x05030f); scene.add(stars(500, 60, 9));
  lights(scene, { hemi: 0.9, sky: 0xffffff, ground: 0x111122, keyI: 2.0, keyPos: [-5, 3, 6], rim: MAG, rimI: 1.0 });
  const E = earth(2.2); scene.add(E);
  const r = rnd(81), lightsArr = [], dirs = [];
  for (let i = 0; i < 160; i++) { const u = r() * 1.6 - 0.8, th = r() * Math.PI * 2, q = Math.sqrt(1 - u * u); const dv = V(q * Math.cos(th), u, q * Math.sin(th)); const s = halo(i % 7 ? 0xfff0b0 : YEL, 0.16, 0); s.position.copy(dv.clone().multiplyScalar(2.26)); E.add(s); lightsArr.push(s); dirs.push(dv); }
  const arcs = [];
  for (let i = 0; i < 14; i++) { const a = dirs[i * 2], b = dirs[i * 2 + 1]; const pts = []; for (let k = 0; k <= 24; k++) { const u = k / 24; pts.push(a.clone().lerp(b, u).normalize().multiplyScalar(2.26 + Math.sin(u * Math.PI) * 0.6)); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.018, 6), glowMat(YEL, 0.95)); E.add(tube); tube.userData.d = i * 0.12; arcs.push(tube); }
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      E.rotation.y = 0.4 + t * 0.25; E.rotation.x = 0.25;
      lightsArr.forEach((s, i) => { s.material.opacity = 0.95 * ss(i / 160 * 1.6, i / 160 * 1.6 + 0.2, t); });
      arcs.forEach(a => { const k = ss(tMore - 0.8 + a.userData.d, tMore - 0.5 + a.userData.d, t); a.visible = k > 0.01; a.scale.setScalar(lerp(0.85, 1, k)); a.material.opacity = 0.95 * k; });
      look(c, mix(V(0, 0.2, 24), V(0, 0.1, 21), eio(t / d)), V(0, -1.2, 0));
    },
    ui: () => ({ vig: 0.2 }),
  };
}
