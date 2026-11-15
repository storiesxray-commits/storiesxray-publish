import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, outlineMat, M, fresnel, glowMat, addMat, halo, setOpacity, lights, shake, Subject, poseStand } from '../../engine/engine.js';

// xr004 — The Day Molasses Flooded Boston (Jan 15, 1919). No victims on screen: the wave, the buildings and the empty street tell it.
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l, up) { c.position.copy(p); if (up) c.up.copy(up); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);

const MOL = 0x4a2410, MOL2 = 0x6b3517, GLINT = 0xd9893a, BRICK = [0xa8533a, 0x94472f, 0xb5643f, 0x8a3f2c], STONE = 0xcfc3ad;
const EL = 0x3f5b4c, COBBLE = 0x6c645a, SKY = 0xc9dbe8, WIN = 0x23303c, AMBER = 0xffb02e;

function labelSprite(text, color = '#ffffff', w = 1.6) {
  const cv = document.createElement('canvas'); cv.width = 768; cv.height = 192; const x = cv.getContext('2d');
  x.font = '900 120px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.lineWidth = 30; x.strokeStyle = '#0b0b0f'; x.strokeText(text, 384, 100); x.fillStyle = color; x.fillText(text, 384, 100);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.scale.set(w, w / 4, 1); s.renderOrder = 20; return s;
}
function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

// ---------------- city pieces ----------------
const cobbleTex = (() => {
  let t = null;
  return () => t || (t = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#6c645a'; x.fillRect(0, 0, w, h); const r = rnd(5);
    for (let j = 0; j < 16; j++) for (let i = 0; i < 12; i++) {
      const ox = (j % 2) * 21; x.fillStyle = ['#7a7166', '#71685d', '#80776b', '#675f55'][Math.floor(r() * 4)];
      x.beginPath(); x.roundRect(i * 43 + ox + 3, j * 32 + 3, 37, 26, 8); x.fill();
    }
    x.strokeStyle = 'rgba(20,18,16,.45)'; x.lineWidth = 3; for (let j = 0; j <= 16; j++) { x.beginPath(); x.moveTo(0, j * 32); x.lineTo(w, j * 32); x.stroke(); }
  }));
})();
function ground(scene, size = 120) {
  const tx = cobbleTex().clone(); tx.needsUpdate = true; tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(size / 3, size / 3);
  const g = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshToonMaterial({ map: tx, gradientMap: toon(0).gradientMap }));
  g.rotation.x = -Math.PI / 2; g.receiveShadow = true; scene.add(g); return g;
}
function building(w, h, d, color, seed, face = 1) {
  // face: +1 windows on +x side, -1 on -x side, 0 on +z side
  const g = new THREE.Group(), r = rnd(seed);
  const body = M(RB(w, h, d, 0.06, 2), color, { px: 4 }); body.position.y = h / 2; g.add(body);
  const corn = M(RB(w + 0.2, 0.22, d + 0.2, 0.04, 2), STONE, { px: 3 }); corn.position.y = h + 0.05; g.add(corn);
  const band = M(RB(w + 0.08, 0.12, d + 0.08, 0.03, 2), STONE, { px: 3, outline: false }); band.position.y = 1.5; g.add(band);
  const cols = face === 0 ? Math.max(2, Math.round(w / 0.9)) : Math.max(2, Math.round(d / 0.9)), rows = Math.max(2, Math.floor((h - 1.4) / 1.15));
  const span = face === 0 ? w : d;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const lit = r() < 0.12, wm = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.7), new THREE.MeshBasicMaterial({ color: lit ? 0xffe2a0 : WIN }));
    const fr = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.84), new THREE.MeshBasicMaterial({ color: 0xe9e1d2 }));
    const u = (i + 0.5) / cols * span - span / 2, y = 2.1 + j * 1.15;
    const p = face === 0 ? V(u, y, d / 2 + 0.012) : V(face * (w / 2 + 0.012), y, u);
    for (const [m, o] of [[fr, 0], [wm, 0.004]]) { m.position.copy(p); if (face === 0) m.position.z += o; else { m.rotation.y = face * Math.PI / 2; m.position.x += face * o; } g.add(m); }
  }
  // door
  const dm = M(RB(0.7, 1.2, 0.08, 0.03, 2), 0x3a2a20, { px: 3 });
  if (face === 0) dm.position.set(0, 0.6, d / 2); else { dm.position.set(face * w / 2, 0.6, 0); dm.rotation.y = Math.PI / 2; }
  g.add(dm); g.userData.body = body;
  return g;
}
// street along -Z; buildings both sides; optional elevated railway on +x side
function street(scene, o = {}) {
  const r = rnd(o.seed || 9), list = [];
  for (const side of (o.sides || [-1, 1])) {
    let z = o.z0 ?? 8;
    while (z > (o.z1 ?? -60)) {
      const d = 2.6 + r() * 2.2, w = 3.2, h = (o.hMin ?? 4.5) + r() * (o.hVar ?? 3.2);
      const b = building(w, h, d - 0.15, BRICK[Math.floor(r() * 4)], Math.floor(r() * 999), -side);
      b.position.set(side * (3.9 + w / 2), 0, z - d / 2); scene.add(b); list.push(b); z -= d;
    }
  }
  const walk = M(new THREE.BoxGeometry(1.1, 0.12, 200), 0x9a948a, { outline: false }); walk.position.set(-3.35, 0.06, -40); scene.add(walk);
  const walk2 = walk.clone(); walk2.position.x = 3.35; scene.add(walk2);
  return list;
}
function elevated(scene, o = {}) {
  const g = new THREE.Group(), cols = [];
  const x0 = o.x ?? 1.9, y = o.y ?? 4.3, z0 = o.z0 ?? 6, z1 = o.z1 ?? -60;
  const deck = M(RB(2.6, 0.38, z0 - z1, 0.04, 2), EL, { px: 4 }); deck.position.set(x0, y, (z0 + z1) / 2); g.add(deck);
  const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, z0 - z1), new THREE.MeshBasicMaterial({ color: 0x23282c }));
  for (const dx of [-0.55, 0.55]) { const rr = rail.clone(); rr.position.set(x0 + dx, y + 0.24, (z0 + z1) / 2); g.add(rr); }
  for (let z = z0 - 1; z > z1; z -= 3.2) {
    for (const dx of [-1.15, 1.15]) {
      const c = new THREE.Group(); c.position.set(x0 + dx, 0, z); g.add(c);
      const p = M(new THREE.BoxGeometry(0.2, y, 0.2), EL, { px: 3 }); p.position.y = y / 2; c.add(p); cols.push(c);
    }
    const br = M(new THREE.BoxGeometry(2.5, 0.16, 0.16), EL, { px: 3 }); br.position.set(x0, y - 0.55, z); g.add(br);
  }
  scene.add(g); g.userData.cols = cols; return g;
}
function Tank(o = {}) {
  const xr = !!o.xray, g = new THREE.Group(), R = o.R || 4.5, Hh = o.H || 5, U = { rivets: [] };
  const shell = xr ? new THREE.Mesh(new THREE.CylinderGeometry(R, R, Hh, 64, 1, true), fresnel(C.cyan, 1.6, 1.1, 0.03)) : M(new THREE.CylinderGeometry(R, R, Hh, 64), 0x8d98a3, { px: 6 });
  shell.position.y = Hh / 2; g.add(shell); U.shell = shell;
  const roof = xr ? new THREE.Mesh(new THREE.ConeGeometry(R, 0.9, 64, 1, true), fresnel(C.cyan, 1.6, 1.0, 0.02)) : M(new THREE.ConeGeometry(R * 1.01, 0.9, 64), 0x7d8893, { px: 6 });
  roof.position.y = Hh + 0.45; g.add(roof);
  const rv = new THREE.SphereGeometry(0.045, 8, 6);
  for (const y of [0.9, 1.9, 2.9, 3.9]) {
    const seam = new THREE.Mesh(new THREE.TorusGeometry(R + 0.005, 0.018, 4, 96), new THREE.MeshBasicMaterial({ color: xr ? 0x7befff : 0x4e5964 })); seam.rotation.x = Math.PI / 2; seam.position.y = y; g.add(seam);
    for (let i = 0; i < 90; i++) {
      const a = i / 90 * Math.PI * 2, m = new THREE.Mesh(rv, new THREE.MeshBasicMaterial({ color: xr ? C.red : 0x3f4851 }));
      m.position.set(Math.cos(a) * (R + 0.03), y + 0.12, Math.sin(a) * (R + 0.03)); g.add(m); U.rivets.push(m);
    }
  }
  if (xr) {
    const liq = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.97, R * 0.97, 1, 64), new THREE.MeshBasicMaterial({ color: 0xc8621c, transparent: true, opacity: 0.55, depthWrite: false }));
    liq.position.y = 0.5; g.add(liq);
    const top = new THREE.Mesh(new THREE.CircleGeometry(R * 0.97, 64), new THREE.MeshBasicMaterial({ color: AMBER, transparent: true, opacity: 0.85 })); top.rotation.x = -Math.PI / 2; g.add(top);
    U.level = k => { const hh = Math.max(0.01, k * (Hh - 0.15)); liq.scale.y = hh; liq.position.y = hh / 2; top.position.y = hh + 0.002; };
    U.level(0.1);
  }
  g.userData = U; return g;
}
// ---------------- the molasses wave ----------------
// Deformable surface: crest at z = zc moving toward +z. Vertex colors: dark face, warmer top, glossy amber lip.
const cFace = new THREE.Color(0x3a190a), cTop = new THREE.Color(0x6e3615), cLip = new THREE.Color(0xb8692b);
function Wave(o = {}) {
  const Wd = o.w || 7.4, Dp = o.d || 40, nx = o.nx || 60, nz = o.nz || 170;
  const geo = new THREE.PlaneGeometry(Wd, Dp, nx, nz); geo.rotateX(-Math.PI / 2);
  const base = geo.attributes.position.array.slice();
  geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(base.length), 3));
  const mat = toon(0xffffff, { vertexColors: true, emissive: 0x120502, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true;
  const olm = outlineMat(6); olm.polygonOffset = true; olm.polygonOffsetFactor = 4; olm.polygonOffsetUnits = 4;
  const ol = new THREE.Mesh(geo, olm); mesh.add(ol);
  const g = new THREE.Group(); g.add(mesh);
  const glints = [], gr = rnd(o.seed || 4);
  for (let i = 0; i < 7; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: 0xf0b070 })); s.userData = { x: (gr() - .5) * Wd * 0.75, o: gr(), l: 0.5 + gr() * 0.8 }; g.add(s); glints.push(s); }
  const drops = []; for (let i = 0; i < 14; i++) { const d = M(new THREE.SphereGeometry(1, 14, 10), 0x5a2a10, { px: 3, shadow: false }); d.userData = { x: (gr() - .5) * Wd * 0.9, o: gr(), v: 0.7 + gr() * 0.7, s: 0.1 + gr() * 0.14 }; g.add(d); drops.push(d); }
  const Hf = (d, x, t, A) => {
    if (d < 0) return -0.4;
    const rise = 1 - Math.exp(-d / 0.38), crest = 0.42 * Math.exp(-((((d - 0.8) / 0.6)) ** 2)), tail = lerp(1, 0.5, 1 - Math.exp(-d / 7));
    const n = 0.05 * Math.sin(x * 1.9 + t * 3.1 + d * 0.8) + 0.035 * Math.sin(x * 4.3 - t * 4.1 + d * 1.6);
    return A * (rise * tail + crest) * (1 + n);
  };
  const tmp = new THREE.Color();
  const U = {
    set(zc, A, t = 0, curl = 1) {
      const p = geo.attributes.position.array, col = geo.attributes.color.array, dd = new Float32Array(p.length / 3);
      for (let i = 0, k = 0; i < p.length; i += 3, k++) {
        const x = base[i], z = base[i + 2] - Dp / 2 + zc, d = zc - z, edge = ss(Wd / 2, Wd / 2 - 0.45, Math.abs(x));
        const y = Hf(d, x, t, A) * (0.6 + 0.4 * edge), hy = clamp(y / A);
        const over = curl * A * 0.42 * Math.exp(-((((d - 0.55) / 0.42)) ** 2)) * hy * hy;
        p[i] = x; p[i + 1] = y; p[i + 2] = z + over; dd[k] = d;
      }
      geo.attributes.position.needsUpdate = true; geo.computeVertexNormals();
      const nrm = geo.attributes.normal.array;
      for (let i = 0, k = 0; i < p.length; i += 3, k++) {
        const up = clamp(nrm[i + 1]), lip = Math.exp(-((((dd[k] - 0.75) / 0.35)) ** 2)) * clamp(p[i + 1] / A);
        tmp.copy(cFace).lerp(cTop, ss(0.35, 0.85, up)).lerp(cLip, clamp(lip * 1.1));
        col[i] = tmp.r; col[i + 1] = tmp.g; col[i + 2] = tmp.b;
      }
      geo.attributes.color.needsUpdate = true;
      for (const s of glints) { const a = s.userData, q = 1.4 + ((a.o + t * 0.2) % 1) * 3.0; s.position.set(a.x, Hf(q, a.x, t, A) * (0.6 + 0.4 * ss(Wd / 2, Wd / 2 - 0.45, Math.abs(a.x))) + 0.05, zc - q); s.scale.set(a.l * 0.45, 0.04, 0.09); s.visible = A > 0.3; }
      for (const dr of drops) { const a = dr.userData, f = (t * a.v + a.o) % 1; dr.position.set(a.x, A * (1.05 + 0.7 * f - 1.7 * f * f), zc + 0.6 + f * 2.4 * a.v); dr.scale.setScalar(a.s * (1 - f * 0.4)); dr.visible = A > 0.5 && dr.position.y > 0.1; }
    },
  };
  g.userData = U; return g;
}
function sky(scene, col = SKY, fog = [18, 70]) {
  scene.background = new THREE.Color(col); scene.fog = new THREE.Fog(col, fog[0], fog[1]);
  const sun = halo(0xfff3d6, 30, 0.5); sun.position.set(-14, 22, -50); scene.add(sun);
}
function cityLights(scene, o = {}) { return lights(scene, { hemi: 1.0, sky: 0xffffff, ground: 0x6b5c4c, keyI: 2.1, key: 0xfff0d8, rimI: 0.5, rim: 0x9fd8ff, keyPos: [-6, 12, 8], shadow: true, shadowR: 14, ...o }); }
function xbase(scene) {
  scene.background = new THREE.Color(C.bg);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.4, key: 0xffffff, rimI: 1.0 });
  const r = rnd(11), n = 180, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (r() - .5) * 30; pos[i * 3 + 1] = (r() - .5) * 30; pos[i * 3 + 2] = (r() - .5) * 10 - 10; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: 0x2aa9c4, size: 4, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false })));
  const bh = halo(0x0f5f78, 26, 0.5); bh.position.set(0, 3, -6); scene.add(bh);
}

// =============== s01 / s17: HOOK + LOOP — the wave towers over a 1919 street (seen in profile) ===============
function heightMark(scene) {
  const g = new THREE.Group(); scene.add(g);
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1, 0.08), glowMat(C.yellow, 1)); bar.geometry.translate(0, 0.5, 0); g.add(bar);
  const t1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.7), glowMat(C.yellow, 1)); g.add(t1); const t2 = t1.clone(); g.add(t2);
  g.userData.set = (h) => { bar.scale.y = Math.max(0.01, h); t2.position.y = h; };
  return g;
}
export function hook(mode) {
  const scene = new THREE.Scene(); sky(scene, 0xbcd2e3, [26, 70]); cityLights(scene, { keyPos: [-12, 14, 6] });
  ground(scene); street(scene, { seed: 3, z0: 30, z1: -40, sides: [1], hMin: 3.6, hVar: 1.6 });
  const w = Wave({ w: 7.6, d: 34, seed: 2 }); scene.add(w);
  const c = cam(40);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, ph = mode === 'in' ? u : 0.35 + 0.65 * u;
      const zc = lerp(-1.6, 2.6, eio(ph)), A = lerp(6.4, 6.9, ph);
      w.userData.set(zc, A, t + (mode === 'in' ? 0 : 3), 1.15);
      look(c, V(-17.5, 1.1, 0.4 + 0.5 * ph), V(0, 4.0, 0.6 + 0.5 * ph));
      shake(c, t, mode === 'in' ? 0.1 : 0.05, 0.05, 0.4); shake(c, t, d - 0.6, 0.04, 0.5);
    },
    ui: () => ({ vig: 0.22 }),
  };
}
// =============== s02: "It was molasses." — a thick drip, slow and glossy ===============
export function drip() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1b0f08);
  lights(scene, { hemi: 0.7, sky: 0xffe2b8, ground: 0x1b0f08, keyI: 2.4, key: 0xffd9a8, rimI: 1.4, rim: 0xffa64d, keyPos: [-3, 4, 5] });
  const bh = halo(0xff9a3c, 9, 0.35); bh.position.set(0, 1, -4); scene.add(bh);
  const spoon = M(new THREE.CapsuleGeometry(0.26, 3.2, 8, 24), 0x9aa4ae, { px: 6 }); spoon.rotation.z = Math.PI / 2; spoon.position.set(0, 2.2, 0); spoon.scale.set(1, 1, 0.45); scene.add(spoon);
  const coat = M(new THREE.CapsuleGeometry(0.29, 2.2, 8, 24), MOL, { px: 6 }); coat.rotation.z = Math.PI / 2; coat.position.set(0.2, 2.16, 0.02); coat.scale.set(1, 1, 0.55); scene.add(coat);
  const neck = M(new THREE.CylinderGeometry(0.1, 0.2, 1, 24), MOL, { px: 5 }); scene.add(neck);
  const bead = M(new THREE.SphereGeometry(0.42, 32, 24), MOL, { px: 6 }); scene.add(bead);
  const gl1 = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), new THREE.MeshBasicMaterial({ color: GLINT })); scene.add(gl1);
  const pool = M(new THREE.CylinderGeometry(2.2, 2.4, 0.3, 48), MOL, { px: 5 }); pool.position.y = -2.6; scene.add(pool);
  const c = cam(30);
  return {
    scene, camera: c,
    update(t, d) {
      const u = clamp(t / d), L = lerp(0.3, 2.6, eio(u));
      neck.scale.set(lerp(1.4, 0.7, u), L, lerp(1.4, 0.7, u)); neck.position.set(0, 2.0 - L / 2, 0);
      bead.position.set(0, 2.0 - L - 0.25, 0); bead.scale.set(1, 1.15 + 0.1 * Math.sin(t * 6), 1);
      gl1.position.set(-0.18, bead.position.y + 0.18, 0.36); gl1.scale.set(0.08, 0.16, 0.04);
      const by = bead.position.y; look(c, V(0.3, by + 0.6, 9.4 - 0.6 * u), V(0, by - 0.1, 0));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s03/s04: Boston, Jan 15 1919 — wide street, the tank by the harbor; clock 12:30 ===============
function clockFace() {
  return canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#f4ecd8'; x.beginPath(); x.arc(256, 256, 240, 0, 7); x.fill(); x.lineWidth = 16; x.strokeStyle = '#1a1a1f'; x.stroke();
    x.fillStyle = '#1a1a1f'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; x.save(); x.translate(256 + Math.sin(a) * 200, 256 - Math.cos(a) * 200); x.rotate(a); x.fillRect(-7, -22, 14, 44); x.restore(); }
  });
}
function streetClock() {
  const g = new THREE.Group();
  const post = M(new THREE.CylinderGeometry(0.09, 0.12, 3.4, 16), 0x2e3d35, { px: 4 }); post.position.y = 1.7; g.add(post);
  const box = M(new THREE.CylinderGeometry(0.62, 0.62, 0.22, 40), 0x2e3d35, { px: 4 }); box.rotation.x = Math.PI / 2; box.position.y = 3.9; g.add(box);
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.55, 48), new THREE.MeshBasicMaterial({ map: clockFace() })); face.position.set(0, 3.9, 0.115); g.add(face);
  const hand = (len, wdt) => { const h = new THREE.Mesh(new THREE.BoxGeometry(wdt, len, 0.02), new THREE.MeshBasicMaterial({ color: 0x1a1a1f })); h.geometry.translate(0, len / 2, 0); h.position.set(0, 3.9, 0.13); g.add(h); return h; };
  const hh = hand(0.3, 0.06), mh = hand(0.44, 0.04);
  g.userData.set = (hours, mins) => { mh.rotation.z = -mins / 60 * Math.PI * 2; hh.rotation.z = -((hours % 12) + mins / 60) / 12 * Math.PI * 2; };
  return g;
}
export function boston(mode) {
  const scene = new THREE.Scene(); sky(scene, SKY, [60, 190]); cityLights(scene, { shadowR: 30, keyPos: [-14, 22, 16] });
  ground(scene, 220); street(scene, { seed: 7, z0: 12, z1: -20 }); const el = elevated(scene, { z0: 14, z1: -22 });
  const tank = Tank(); tank.position.set(-0.8, 0, -29); scene.add(tank);
  const harbor = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), toon(0x3d7fa6)); harbor.rotation.x = -Math.PI / 2; harbor.position.set(0, 0.02, -95); scene.add(harbor);
  const clk = streetClock(); clk.position.set(-2.6, 0, 3); clk.visible = mode === 'clock'; scene.add(clk); clk.userData.set(12, 30);
  const c = cam(mode === 'clock' ? 28 : 36);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      if (mode === 'clock') { clk.userData.set(12, 28 + 2 * clamp(u * 1.4)); look(c, V(-1.0, 3.9, 8.6 - 0.8 * u), V(-2.6, 3.7, 3)); }
      else look(c, mix(V(-1.2, 7.5, 22), V(-1.0, 6.4, 15), eio(u)), mix(V(-0.6, 2.4, -24), V(-0.7, 2.8, -29), eio(u)));
    },
    ui: () => ({ sepia: mode === 'clock' ? 0.5 : 0.75, vig: 0.15 }),
  };
}
// =============== s05: the tank — exterior, then x-ray: 2.3 million gallons, 50 ft ===============
export function tankXray(tX) {
  const scene = new THREE.Scene(); xbase(scene);
  const outer = Tank(); scene.add(outer);
  const ghost = Tank({ xray: true }); scene.add(ghost);
  const fig = Subject(); poseStand(fig); fig.scale.setScalar(0.36); fig.position.set(-3.2, 0, 5.4); fig.rotation.y = 0.3; scene.add(fig);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.MeshBasicMaterial({ color: 0x0f2a33, transparent: true, opacity: 0.8 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
  // 50 ft marker
  const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 5, 0.08), glowMat(C.yellow, 1)); bar.position.set(4.0, 2.5, 4.6); scene.add(bar);
  for (const y of [0, 5]) { const tk = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, 0.08), glowMat(C.yellow, 1)); tk.position.set(4.0, y, 4.6); scene.add(tk); }
  const lab = labelSprite('50 FT', '#FFD60A', 2.4); lab.position.set(3.4, 6.0, 4.6); scene.add(lab);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(14, 0.06), glowMat(C.cyan, 1)); scene.add(scan);
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      const k = ss(tX, tX + 0.6, t);
      setOpacity(outer, 1 - k); setOpacity(ghost, k);
      ghost.userData.level(lerp(0.1, 0.97, ss(tX + 0.2, d - 0.3, t)));
      scan.visible = k > 0.01 && k < 0.99; scan.position.set(0, lerp(-0.2, 6.2, k), 4.6);
      for (const [i, rv] of ghost.userData.rivets.entries()) rv.scale.setScalar(1 + 0.5 * Math.max(0, Math.sin(t * 6 + i)) * k);
      bar.visible = lab.visible = t > 0.35; bar.scale.y = ss(0.35, 0.8, t); bar.position.y = 2.5 * bar.scale.y;
      look(c, mix(V(1.2, 4, 31), V(0.6, 5, 28), eio(t / d)), V(0.2, 1.6, 0));
    },
    ui: (t) => ({ flash: Math.max(0, 0.35 - Math.abs(t - tX - 0.1) * 1.6) }),
  };
}
// =============== s06: unusually warm — thermometer climbs to 40°F ===============
export function thermo() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x9fc2dc);
  lights(scene, { hemi: 1.0, sky: 0xffffff, ground: 0x6f8aa0, keyI: 2.0, key: 0xfff0d0, rimI: 0.8, keyPos: [-3, 5, 5] });
  const sun = halo(0xfff1b8, 12, 0.85); sun.position.set(1.8, 3.9, -4); scene.add(sun);
  const disc = M(new THREE.CircleGeometry(0.9, 48), 0xffd34d, { px: 5, shadow: false }); disc.position.set(1.8, 3.9, -3.9); scene.add(disc);
  const tube = M(new THREE.CylinderGeometry(0.32, 0.32, 5.2, 32), 0xf4f7fb, { px: 6 }); tube.position.y = 0.6; scene.add(tube);
  const bulb = M(new THREE.SphereGeometry(0.62, 32, 24), C.red, { px: 6 }); bulb.position.y = -2.3; scene.add(bulb);
  const fill = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 1, 24), new THREE.MeshBasicMaterial({ color: C.red })); scene.add(fill);
  for (let i = 0; i <= 10; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(i % 5 ? 0.18 : 0.32, 0.04, 0.02), new THREE.MeshBasicMaterial({ color: 0x1a1a1f })); tk.position.set(-0.36, -1.6 + i * 0.44, 0.3); scene.add(tk); }
  const l2 = labelSprite('2°F', '#ffffff', 1.4); l2.position.set(-1.25, -1.25, 0.4); scene.add(l2);
  const l40 = labelSprite('40°F', '#FFD60A', 1.8); l40.position.set(-1.35, 1.5, 0.4); scene.add(l40);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const k = eout(ss(0.15, d * 0.8, t)), top = lerp(-1.25, 1.5, k);
      fill.scale.y = top + 2.3; fill.position.y = (top - 2.3) / 2; l40.visible = k > 0.85;
      disc.scale.setScalar(1 + 0.05 * Math.sin(t * 3)); sun.material.opacity = 0.5 + 0.35 * k;
      look(c, V(0.0, -0.2, 13.2 - 0.6 * t / d), V(0.1, 0.0, 0));
    },
  };
}
// =============== s07/s08: rivets pop like gunfire, the wall splits ===============
export function rivets(mode) {
  const scene = new THREE.Scene(); sky(scene, 0xb9cfe0, [30, 90]);
  lights(scene, { hemi: 1.0, sky: 0xffffff, ground: 0x4c5a66, keyI: 2.3, keyPos: [-5, 6, 7], rimI: 0.7 });
  // a curved section of the tank wall: two plates meeting at a riveted vertical seam
  const R = 9, left = new THREE.Group(), right = new THREE.Group(); scene.add(left, right);
  const plate = (a0) => { const m = M(new THREE.CylinderGeometry(R, R, 9, 48, 1, true, a0, 0.22), 0x8d98a3, { px: 6 }); m.material.side = THREE.DoubleSide; m.position.set(0, 0, -R); return m; };
  left.add(plate(-0.22)); right.add(plate(0.0));
  const strap = M(RB(0.7, 9, 0.12, 0.04, 2), 0x7a858f, { px: 5 }); strap.position.set(0, 0, 0.04); scene.add(strap);
  const seam = new THREE.Mesh(new THREE.BoxGeometry(0.05, 9, 0.02), new THREE.MeshBasicMaterial({ color: 0x2e353b })); seam.position.z = 0.11; scene.add(seam);
  const rv = [], r = rnd(6);
  for (let j = 0; j < 10; j++) for (const sx of [-1, 1]) {
    const m = M(new THREE.SphereGeometry(0.13, 16, 10), 0x3a434b, { px: 3 }); m.scale.z = 0.55;
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), new THREE.MeshBasicMaterial({ color: 0xdfe6ec })); hl.position.set(-0.04, 0.05, 0.08); m.add(hl);
    m.position.set(sx * 0.2, -3.6 + j * 0.8, 0.16); scene.add(m);
    m.userData = { t: r(), sx, y: m.position.y, v: V(sx * (0.6 + r() * 1.6), (r() - .3) * 1.8, 3 + r() * 3), sp: (r() - .5) * 20 }; rv.push(m);
  }
  const sparks = []; for (let i = 0; i < 20; i++) { const s = halo(i % 2 ? 0xffe36b : 0xff8a2e, 1.4, 0.95); scene.add(s); sparks.push(s); }
  const crack = new THREE.Mesh(new THREE.PlaneGeometry(0.06, 9), new THREE.MeshBasicMaterial({ color: AMBER })); crack.position.z = 0.13; scene.add(crack);
  const gush = Wave({ w: 2.8, d: 12, nx: 36, nz: 100, seed: 5 }); gush.position.set(0, -4.5, 0); scene.add(gush);
  const c = cam(38);
  return {
    scene, camera: c,
    update(t, d) {
      const pop = mode === 'pop', T0 = 0.1, span = d * 0.85;
      let si = 0;
      for (const m of rv) {
        const tt = pop ? t - (T0 + m.userData.t * span) : 2;
        if (tt > 0) { const f = Math.min(tt, 1.2); m.position.set(m.userData.sx * 0.2 + m.userData.v.x * f, m.userData.y + m.userData.v.y * f - 2 * f * f, 0.16 + m.userData.v.z * f); m.rotation.y = m.userData.sp * f; m.visible = f < 1.1; }
        else { m.position.set(m.userData.sx * 0.2, m.userData.y, 0.16); m.visible = true; }
        if (pop && tt > 0 && tt < 0.18 && si < sparks.length) { const s = sparks[si++]; s.visible = true; s.position.set(m.userData.sx * 0.22, m.userData.y, 0.35); s.scale.setScalar(1.6 * (1 - tt / 0.18) + 0.3); }
      }
      for (; si < sparks.length; si++) sparks[si].visible = false;
      const open = pop ? 0 : eout(ss(0.0, 0.9, t));
      left.position.x = -open * 1.25; right.position.x = open * 1.25; left.rotation.y = open * 0.28; right.rotation.y = -open * 0.28;
      strap.visible = seam.visible = open < 0.05;
      crack.visible = pop ? t > d * 0.55 : open < 0.08; crack.scale.x = pop ? 1 + 3 * ss(d * 0.55, d, t) : 4;
      gush.visible = !pop && open > 0.02; if (gush.visible) gush.userData.set(lerp(-0.5, 3.0, open), lerp(0.8, 5.0, open), t * 1.5, 1.0);
      look(c, V(0.9, 0.3, pop ? 9.6 - 0.8 * t / d : 10.5 + 3.5 * open), V(0, 0.4, 0));
      if (pop) for (const m of rv) shake(c, t, T0 + m.userData.t * span, 0.03, 0.12); else shake(c, t, 0.02, 0.14, 0.6);
    },
    ui: (t) => mode === 'pop' ? {} : ({ flash: Math.max(0, 0.55 - t * 2.2) }),
  };
}
// =============== s09: molasses 40% heavier — balance ===============
export function scale() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xf1e3c8);
  lights(scene, { hemi: 1.0, sky: 0xffffff, ground: 0xb79a72, keyI: 1.9, keyPos: [-3, 5, 6], rimI: 0.5, rim: 0xffd29a });
  const post = M(new THREE.CylinderGeometry(0.12, 0.16, 3.4, 20), 0x6f5a3e, { px: 5 }); post.position.y = -0.5; scene.add(post);
  const foot = M(RB(2, 0.3, 1, 0.08), 0x6f5a3e, { px: 5 }); foot.position.y = -2.25; scene.add(foot);
  const beam = new THREE.Group(); beam.position.y = 1.25; scene.add(beam);
  const bar = M(RB(4.1, 0.16, 0.2, 0.06), 0xb98b4b, { px: 5 }); beam.add(bar);
  const pans = [];
  for (const s of [-1, 1]) {
    const hang = new THREE.Group(); hang.position.x = s * 1.9; beam.add(hang);
    const str = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.4, 0.03), new THREE.MeshBasicMaterial({ color: 0x3a2a1a })); str.position.y = -0.7; hang.add(str);
    const pan = M(new THREE.CylinderGeometry(0.95, 0.75, 0.16, 40), 0xb98b4b, { px: 5 }); pan.position.y = -1.45; hang.add(pan);
    const cube = s < 0 ? M(RB(1.0, 1.0, 1.0, 0.12), 0x3aa0e6, { px: 5 }) : M(RB(1.0, 1.0, 1.0, 0.12), MOL, { px: 5 });
    cube.position.y = -0.87; hang.add(cube);
    const lab = labelSprite(s < 0 ? 'WATER' : 'MOLASSES', s < 0 ? '#bfe6ff' : '#FFD60A', s < 0 ? 1.6 : 2.1); lab.scale.multiplyScalar(s < 0 ? 0.78 : 0.62); lab.position.set(0, -0.87, 0.62); hang.add(lab);
    pans.push(hang);
  }
  const c = cam(32);
  return {
    scene, camera: c,
    update(t, d) {
      const k = back(ss(0.3, 1.2, t)) * 0.32;
      beam.rotation.z = -k; for (const h of pans) h.rotation.z = k;
      look(c, V(0, 0.2, 20 - 0.8 * t / d), V(0, -1.2, 0));
    },
  };
}
// =============== s10: "it doesn't ooze" — a lazy blob, crossed out ===============
export function ooze() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xe9d3b0);
  lights(scene, { hemi: 1.0, sky: 0xffffff, ground: 0xa88a62, keyI: 1.8, keyPos: [-3, 5, 5], rimI: 0.4 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(0xd8bf98)); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const blob = M(new THREE.SphereGeometry(1, 40, 24, 0, Math.PI * 2, 0, Math.PI / 2), MOL, { px: 6 }); scene.add(blob);
  const gl = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: GLINT })); scene.add(gl);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const k = t / d; blob.scale.set(1.0 + 0.5 * k, 0.6 - 0.15 * k, 1.0 + 0.5 * k); gl.position.set(-0.3, blob.scale.y * 0.92, 0.35); gl.scale.set(0.25, 0.04, 0.1);
      look(c, V(0, 3.2, 6.2), V(0, 0.2, 0));
    },
    ui: (t, d) => ({ strike: eout(ss(d * 0.78, d * 0.97, t)) }),
  };
}
// =============== s11: "It surges." — the wave bursts at camera ===============
export function surge() {
  const scene = new THREE.Scene(); sky(scene, 0xb8cfe0, [10, 50]); cityLights(scene);
  ground(scene); street(scene, { seed: 12, z0: 14 });
  const w = Wave({ w: 7.6, d: 30, seed: 7 }); scene.add(w);
  const c = cam(44);
  return {
    scene, camera: c,
    update(t, d) {
      const u = clamp(t / d), zc = lerp(-13, 5.2, Math.pow(u, 1.5)), A = lerp(3.4, 5.6, eout(u));
      w.userData.set(zc, A, t * 1.4, 1.1); look(c, V(-2.6, 8.5, 13.5), V(0.3, 2.2, -4)); shake(c, t, 0.02, 0.06, 0.6); shake(c, t, d * 0.6, 0.08, 0.5);
    },
    ui: (t, d) => ({ flash: Math.max(0, (t - d + 0.18) * 3) }),
  };
}
// =============== s12: racing down Commercial Street — 25 ft, 35 mph (profile, tracking) ===============
export function race(tMark) {
  const scene = new THREE.Scene(); sky(scene, 0xc4d8e8, [26, 80]); cityLights(scene, { shadowR: 18, keyPos: [-12, 14, 6] });
  ground(scene, 300); street(scene, { seed: 21, z0: 80, z1: -110, sides: [1], hMin: 3.6, hVar: 1.8 });
  const w = Wave({ w: 7.6, d: 46, seed: 9 }); scene.add(w);
  const mk = heightMark(scene);
  const lines = [], r = rnd(4);
  for (let i = 0; i < 14; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 2.6), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })); l.userData = { y: 0.4 + r() * 6, x: -3 - r() * 4, o: r() }; scene.add(l); lines.push(l); }
  const c = cam(40);
  return {
    scene, camera: c,
    update(t, d) {
      const zc = lerp(-30, 6, t / d), A = 5.6;
      w.userData.set(zc, A, t * 1.3, 1.1);
      const cz = zc - 0.9; look(c, V(-17.5, 1.6, cz), V(0, 3.6, cz));
      mk.position.set(-4.1, 0, zc + 1.6); mk.visible = t > tMark; mk.userData.set(A * 1.18 * eout(ss(tMark, tMark + 0.4, t)));
      for (const l of lines) { const f = (t * 2.2 + l.userData.o) % 1; l.position.set(l.userData.x, l.userData.y, cz + 3 - f * 9); l.material.opacity = 0.7 * Math.sin(Math.PI * f); }
    },
  };
}
// =============== s13: buildings flatten, the El bends ===============
export function flatten(tBend) {
  const scene = new THREE.Scene(); sky(scene, 0xc4d8e8, [24, 80]); cityLights(scene, { keyPos: [8, 14, 10] });
  ground(scene); const el = elevated(scene, { x: -2.2, z0: 8, z1: -40 });
  // a two-storey wooden building on the right side of the street, facing the camera at 3/4
  const house = new THREE.Group(); house.position.set(3.0, 0, -4.5); house.rotation.y = -0.35; scene.add(house);
  const parts = [], r = rnd(8);
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    const p = M(RB(1.12, 1.12, 2.8, 0.04, 2), j % 2 ? 0xb08050 : 0x9a6c40, { px: 4 }); p.position.set((i - 1) * 1.14, 0.56 + j * 1.13, 0); house.add(p);
    if (j > 0 && i !== 1) { const wnd = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), new THREE.MeshBasicMaterial({ color: WIN })); wnd.position.z = 1.41; p.add(wnd); }
    p.userData = { p0: p.position.clone(), v: V(1.2 + r() * 2.0, 1 + r() * 1.6, 1.5 + r() * 2), w: (r() - .5) * 4, dl: 0.1 * (2 - j) + r() * 0.08 }; parts.push(p);
  }
  const roof = M(new THREE.ConeGeometry(2.5, 1.2, 4), 0x5a3a2a, { px: 5 }); roof.rotation.y = Math.PI / 4; roof.scale.z = 1.25; roof.position.y = 4.0; house.add(roof); roof.userData = { p0: roof.position.clone(), v: V(2.5, 2.0, 2), w: 2, dl: 0 }; parts.push(roof);
  const w = Wave({ w: 9.6, d: 30, seed: 3 }); w.position.x = 0.6; scene.add(w);
  const c = cam(40);
  return {
    scene, camera: c,
    update(t, d) {
      const zc = lerp(-14, -1.5, eio(clamp(t / (d * 0.95)))); w.userData.set(zc, 3.6, t * 1.3);
      const hit = ss(-6.5, -3.8, zc);
      for (const p of parts) { const tt = Math.max(0, hit - p.userData.dl) * 1.4, f = eout(clamp(tt)); p.position.copy(p.userData.p0).addScaledVector(p.userData.v, f); p.position.y = Math.max(0.3, p.position.y - 2.0 * f * f); p.rotation.set(p.userData.w * f * 0.3, p.userData.w * f * 0.2, p.userData.w * f); }
      const bend = ss(tBend, tBend + 0.7, t);
      el.userData.cols.forEach(col => { const dz = Math.abs(col.position.z + 4); col.rotation.z = dz < 8 ? 0.5 * bend * (1 - dz / 8) : 0; });
      el.position.y = -0.7 * bend; el.rotation.x = 0.025 * bend; el.rotation.z = 0.06 * bend;
      look(c, V(5.2, 3.0, 13.0), V(-0.6, 2.8, -5)); shake(c, t, d * 0.3, 0.05, 0.4); shake(c, t, tBend, 0.06, 0.4);
    },
  };
}
// =============== s14: aftermath — still, empty, brown; no people shown ===============
export function aftermath() {
  const scene = new THREE.Scene(); sky(scene, 0x9fb0bd, [10, 55]); cityLights(scene, { keyI: 1.4, hemi: 0.8 });
  ground(scene); street(scene, { seed: 31, z0: 12 }); const el = elevated(scene, { z0: 12 });
  el.userData.cols.forEach((c, i) => { if (i % 5 === 2) c.rotation.z = -0.35; });
  const flood = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 120), toon(MOL, { emissive: 0x140602 })); flood.rotation.x = -Math.PI / 2; flood.position.set(0, 0.55, -40); scene.add(flood);
  const r = rnd(14);
  for (let i = 0; i < 16; i++) { const b = M(RB(0.18, 0.08, 1 + r() * 1.6, 0.02), 0x9b7a52, { px: 3 }); b.position.set((r() - .5) * 5.6, 0.58, -2 - r() * 22); b.rotation.set(0.1 * (r() - .5), r() * 3, 0.2 * (r() - .5)); scene.add(b); }
  const wheel = M(new THREE.TorusGeometry(0.55, 0.07, 10, 28), 0x5a3a22, { px: 4 }); wheel.position.set(1.4, 0.6, -5); wheel.rotation.set(-1.2, 0, 0.3); scene.add(wheel);
  const glints = []; for (let i = 0; i < 12; i++) { const g = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: GLINT })); g.position.set((r() - .5) * 6, 0.57, -1 - r() * 20); g.scale.set(0.35, 0.01, 0.06); scene.add(g); glints.push(g); }
  const c = cam(38);
  return {
    scene, camera: c,
    update(t, d) { look(c, V(0.3, 1.9, 8.5 - 1.6 * eio(t / d)), V(0, 1.4, -14)); },
    ui: () => ({ vig: 0.45, sepia: 0.35 }),
  };
}
// =============== s15: decades later — sweet smell over the rooftops ===============
export function smell() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xffc98a); scene.fog = new THREE.Fog(0xffc98a, 20, 70);
  lights(scene, { hemi: 1.0, sky: 0xfff0d6, ground: 0x8a5a3a, keyI: 2.2, key: 0xffd8a0, rimI: 0.6, rim: 0xff9a5a, keyPos: [-6, 10, 8] });
  const sun = halo(0xfff2c2, 24, 0.75); sun.position.set(6, 10, -30); scene.add(sun);
  const r = rnd(41);
  for (let i = -3; i <= 3; i++) for (let j = 0; j < 4; j++) { const h = 3 + r() * 3.5, b = building(2.6, h, 2.6, BRICK[Math.floor(r() * 4)], i * 10 + j, 0); b.position.set(i * 3.0, 0, -j * 3.6); scene.add(b); }
  const curves = [];
  for (let i = 0; i < 6; i++) {
    const x0 = (i - 2.5) * 1.6, z0 = -1 - r() * 3, pts = []; for (let k = 0; k < 11; k++) pts.push(V(x0 + Math.sin(k * 1.1 + i) * 0.45, 6.6 + k * 0.42, z0));
    const cv = new THREE.CatmullRomCurve3(pts), m = new THREE.Mesh(new THREE.TubeGeometry(cv, 80, 0.13, 10), new THREE.MeshBasicMaterial({ color: 0xfff4dc, transparent: true, opacity: 0.95 }));
    const mo = new THREE.Mesh(m.geometry, outlineMat(4, 0x7a3a12)); m.add(mo);
    m.userData = { o: r() }; scene.add(m); curves.push(m);
  }
  const c = cam(44);
  return {
    scene, camera: c,
    update(t, d) {
      for (const m of curves) { const f = (t * 0.25 + m.userData.o) % 1; m.position.y = f * 2.5; m.material.opacity = 0.95 * Math.sin(Math.PI * f); m.children[0].material.uniforms.op.value = m.material.opacity; }
      look(c, V(0, 8.2, 15 - 1.5 * t / d), V(0, 7.4, -4));
    },
  };
}
// =============== s16: blueprint — engineers had to show their math ===============
function blueprintTex() {
  return canvasTex(1024, 1400, (x, w, h) => {
    x.fillStyle = '#123f73'; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(160,210,255,.18)'; x.lineWidth = 2; for (let i = 0; i < w; i += 40) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, h); x.stroke(); } for (let j = 0; j < h; j += 40) { x.beginPath(); x.moveTo(0, j); x.lineTo(w, j); x.stroke(); }
    x.strokeStyle = '#d9f1ff'; x.lineWidth = 6; x.strokeRect(40, 40, w - 80, h - 80);
    x.lineWidth = 7; x.beginPath(); x.ellipse(512, 300, 300, 70, 0, 0, Math.PI * 2); x.stroke();
    x.beginPath(); x.moveTo(212, 300); x.lineTo(212, 760); x.moveTo(812, 300); x.lineTo(812, 760); x.stroke();
    x.beginPath(); x.ellipse(512, 760, 300, 70, 0, 0, Math.PI); x.stroke();
    x.setLineDash([16, 12]); x.lineWidth = 4; x.beginPath(); x.moveTo(140, 300); x.lineTo(140, 760); x.moveTo(212, 870); x.lineTo(812, 870); x.stroke(); x.setLineDash([]);
    x.fillStyle = '#d9f1ff'; x.font = '700 44px "IBM Plex Mono", monospace'; x.fillText('H = 50 ft', 150, 540); x.fillText('D = 90 ft', 420, 930);
    x.font = '600 40px "IBM Plex Mono", monospace';
    ['p = ρ g h', 'σ = p · r / t', 't_min = p · r / σ_allow', 'FACTOR OF SAFETY ≥ 3'].forEach((s, i) => x.fillText(s, 120, 1060 + i * 64));
  });
}
export function blueprint(tStamp) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b1626);
  lights(scene, { hemi: 1.0, sky: 0xffffff, ground: 0x0b1626, keyI: 1.6, keyPos: [-2, 4, 6], rimI: 0.6 });
  const bh = halo(0x2f7fe0, 16, 0.4); bh.position.set(0, 0, -3); scene.add(bh);
  const sheet = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 7.1), new THREE.MeshBasicMaterial({ map: blueprintTex() })); scene.add(sheet);
  const ol = new THREE.Mesh(new THREE.PlaneGeometry(5.32, 7.22), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); ol.position.z = -0.01; scene.add(ol);
  const stamp = new THREE.Group(); scene.add(stamp);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.78, 0.92, 48), new THREE.MeshBasicMaterial({ color: C.red, transparent: true })); stamp.add(ring);
  const st = labelSprite('ENGINEER', '#ff3b30', 1.5); st.material.depthTest = true; stamp.add(st);
  const ok = labelSprite('SIGNED', '#ff3b30', 1.2); ok.position.y = -0.36; stamp.add(ok);
  stamp.position.set(1.15, 1.25, 0.05); stamp.rotation.z = 0.22; stamp.scale.setScalar(0.85);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const k = ss(tStamp, tStamp + 0.18, t); stamp.visible = t > tStamp; stamp.scale.setScalar(0.85 * lerp(2.2, 1, back(k)));
      look(c, V(0.3 * Math.sin(t * 0.4), -1.5, 17.5 - 1.0 * t / d), V(0, -1.5, 0)); shake(c, t, tStamp + 0.15, 0.04, 0.25);
    },
  };
}
