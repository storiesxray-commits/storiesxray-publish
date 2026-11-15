import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, outlineMat, M, fresnel, glowMat, addMat, halo, setOpacity, lights, shake } from '../../engine/engine.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l, up) { c.position.copy(p); if (up) c.up.copy(up); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);
const SKIN = 0xd9c4b2, GROOVE = 0x9c8270, RIDGE = 0xe6d4c4, BONE = 0xd9fbff, NERVE = 0xffd60a, WATER = 0x2e9be0;

function labelSprite(text, color = '#ffffff', w = 1.6) {
  const cv = document.createElement('canvas'); cv.width = 768; cv.height = 192; const x = cv.getContext('2d');
  x.font = '900 120px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.lineWidth = 30; x.strokeStyle = '#0b0b0f'; x.strokeText(text, 384, 100); x.fillStyle = color; x.fillText(text, 384, 100);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.scale.set(w, w / 4, 1); s.renderOrder = 20; return s;
}

// ---------------- hand ----------------
function Hand(o = {}) {
  const xr = !!o.xray, fm = xr ? fresnel(C.cyan, 1.7, 1.25, 0.04) : null;
  const mk = (geo, px = 5) => xr ? new THREE.Mesh(geo, fm) : M(geo, SKIN, { px });
  const g = new THREE.Group(), U = { joints: [], grooves: [], tips: [], nerves: [], extra: [] };
  const palm = mk(RB(0.98, 1.0, 0.34, 0.16, 4)); g.add(palm);
  const fore = mk(new THREE.CapsuleGeometry(0.3, 2.2, 8, 24)); fore.position.y = -1.85; fore.scale.set(1, 1, 0.74); g.add(fore);
  const defs = [[-0.36, 0.8, 0.42, 0.1], [-0.12, 0.98, 0.48, 0.108], [0.12, 0.92, 0.47, 0.105], [0.36, 0.72, 0.4, 0.095]];
  const addGrooves = (parent, r, len) => {
    for (const gx of [-0.045, -0.015, 0.015, 0.045]) {
      const gr = new THREE.Mesh(new THREE.CapsuleGeometry(0.0085, len, 4, 8), new THREE.MeshBasicMaterial({ color: GROOVE }));
      gr.position.set(gx * (r / 0.1), len * 0.55, Math.sqrt(Math.max(0.0001, r * r - (gx * (r / 0.1)) ** 2)) * 0.985); gr.rotation.z = gx * 2.2; parent.add(gr); U.grooves.push(gr);
    }
  };
  for (const [x, L, by, r] of defs) {
    const j1 = new THREE.Group(); j1.position.set(x, by, 0); g.add(j1);
    const l1 = L * 0.42, l2 = L * 0.32, l3 = L * 0.26;
    const s1 = mk(new THREE.CapsuleGeometry(r, l1, 6, 18)); s1.position.y = l1 / 2; j1.add(s1);
    const j2 = new THREE.Group(); j2.position.y = l1; j1.add(j2);
    const s2 = mk(new THREE.CapsuleGeometry(r * 0.93, l2, 6, 18)); s2.position.y = l2 / 2; j2.add(s2);
    const j3 = new THREE.Group(); j3.position.y = l2; j2.add(j3);
    const s3 = mk(new THREE.CapsuleGeometry(r * 0.87, l3, 6, 18)); s3.position.y = l3 / 2; j3.add(s3);
    if (!xr) addGrooves(j3, r * 0.87, l3);
    U.joints.push([j1, j2, j3]); U.tips.push(s3);
    if (xr) {
      for (const [par, ln] of [[j1, l1], [j2, l2], [j3, l3]]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.024, ln * 0.78, 4, 8), glowMat(BONE, 0.6)); b.position.set(0, ln / 2, -0.01); par.add(b); }
      const mc = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, 0.7, 4, 8), glowMat(BONE, 0.6)); mc.position.set(x * 0.8, -0.02, -0.01); mc.rotation.z = -x * 0.5; g.add(mc);
      const cv = new THREE.CatmullRomCurve3([V(x * 0.1, -2.6, 0.06), V(x * 0.25, -0.9, 0.08), V(x * 0.75, -0.1, 0.1), V(x, by, 0.09), V(x, by + L * 0.55, 0.085), V(x, by + L * 0.96, 0.07)]);
      const t1 = new THREE.Mesh(new THREE.TubeGeometry(cv, 60, 0.014, 8), glowMat(NERVE, 1)); g.add(t1);
      const t2 = new THREE.Mesh(new THREE.TubeGeometry(cv, 60, 0.04, 8), addMat(NERVE, 0.3)); g.add(t2);
      U.nerves.push(cv); U.extra.push(t1, t2);
    }
  }
  // thumb
  const tj = new THREE.Group(); tj.position.set(-0.5, -0.22, 0.05); tj.rotation.z = 0.72; g.add(tj);
  const ts1 = mk(new THREE.CapsuleGeometry(0.125, 0.36, 6, 18)); ts1.position.y = 0.18; tj.add(ts1);
  const tj2 = new THREE.Group(); tj2.position.y = 0.36; tj2.rotation.z = -0.25; tj.add(tj2);
  const ts2 = mk(new THREE.CapsuleGeometry(0.11, 0.27, 6, 18)); ts2.position.y = 0.135; tj2.add(ts2);
  if (!xr) addGrooves(tj2, 0.11, 0.27); U.tips.push(ts2);
  if (xr) for (const [par, ln] of [[tj, 0.36], [tj2, 0.27]]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, ln * 0.78, 4, 8), glowMat(BONE, 0.6)); b.position.set(0, ln / 2, -0.01); par.add(b); }
  U.wrinkle = k => { for (const gr of U.grooves) { gr.visible = k > 0.03; gr.scale.set(1, Math.max(k, 0.01), 1); } for (const t of U.tips) t.scale.set(1 - 0.06 * k, 1, 1 - 0.06 * k); };
  U.curl = c => { for (const [a, b, d] of U.joints) { a.rotation.x = 0.22 * c; b.rotation.x = 0.3 * c; d.rotation.x = 0.26 * c; } tj.rotation.x = 0.2 * c; };
  U.wrinkle(0); g.userData = U; return g;
}

// ---------------- big fingertip ----------------
function BigFinger(o = {}) {
  const xr = !!o.xray, g = new THREE.Group(), U = { ridges: [], vessels: [] }, LEN = o.len || 2.6;
  const body = xr ? new THREE.Mesh(new THREE.CapsuleGeometry(0.5, LEN, 10, 32), fresnel(C.cyan, 1.7, 1.2, 0.035)) : M(new THREE.CapsuleGeometry(0.5, LEN, 10, 32), SKIN);
  body.position.y = 0.5 - LEN / 2; g.add(body); U.body = body;
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 0.165, z = Math.sqrt(0.25 - x * x);
    const m = xr ? new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), glowMat(0xbdf6ff, 0.85)) : M(new THREE.SphereGeometry(1, 20, 14), RIDGE, { px: 3, shadow: false });
    m.position.set(x, 0.42 - Math.abs(i - 2) * 0.05, z * 0.97); m.rotation.y = Math.asin(x / 0.5); m.userData.len = 0.5 - Math.abs(i - 2) * 0.06; g.add(m); U.ridges.push(m);
  }
  if (!xr) { const nail = M(new THREE.SphereGeometry(0.36, 20, 14), 0xf1e3da, { px: 3 }); nail.scale.set(1, 1.15, 0.3); nail.position.set(0, 0.45, -0.44); g.add(nail); }
  if (xr) {
    const bone = new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 1.9, 6, 16), glowMat(BONE, 0.45)); bone.position.set(0, -1.0, -0.08); g.add(bone);
    const be = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), glowMat(BONE, 0.45)); be.position.set(0, 0.0, -0.08); g.add(be);
    const dead = !!o.dead, ncol = dead ? 0x6b7480 : NERVE;
    const pts = [V(0.2, -2.6, 0.2), V(0.24, -1.6, 0.24), V(0.16, -0.7, 0.28), V(0.2, 0.0, 0.3), V(0.08, 0.5, 0.3)];
    U.nerve = new THREE.CatmullRomCurve3(pts);
    if (dead) {
      for (const [a, b] of [[0, 0.42], [0.56, 1]]) { const sub = new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => U.nerve.getPoint(lerp(a, b, i / 11)))); g.add(new THREE.Mesh(new THREE.TubeGeometry(sub, 30, 0.03, 8), glowMat(ncol, 1))); }
      U.cut = U.nerve.getPoint(0.49);
    } else { g.add(new THREE.Mesh(new THREE.TubeGeometry(U.nerve, 60, 0.03, 8), glowMat(ncol, 1))); g.add(new THREE.Mesh(new THREE.TubeGeometry(U.nerve, 60, 0.08, 8), addMat(ncol, 0.3))); }
    U.vcurves = [[[-0.3, -0.9, 0.2], [-0.28, -0.1, 0.26], [-0.2, 0.45, 0.24], [-0.05, 0.75, 0.12]], [[-0.05, -0.9, 0.3], [0.0, -0.1, 0.36], [-0.03, 0.4, 0.34], [0.0, 0.72, 0.2]], [[-0.28, -0.1, 0.26], [-0.14, 0.15, 0.34], [0.0, 0.2, 0.37]], [[0.0, 0.4, 0.34], [0.14, 0.52, 0.28], [0.22, 0.38, 0.22], [0.26, 0.0, 0.2]]]
      .map(p => new THREE.CatmullRomCurve3(p.map(q => V(...q))));
    U.vcurves.push(...[[[0.26, -0.9, 0.18], [0.3, -0.2, 0.2], [0.26, 0.0, 0.2]], [[-0.2, 0.45, 0.24], [-0.1, 0.6, 0.3], [0.05, 0.62, 0.3], [0.14, 0.52, 0.28]], [[0.0, -0.1, 0.36], [0.12, 0.1, 0.34], [0.2, 0.2, 0.28]], [[-0.3, -0.9, 0.2], [-0.32, -1.8, 0.18]], [[-0.05, -0.9, 0.3], [-0.06, -1.8, 0.28]], [[0.26, -0.9, 0.18], [0.27, -1.8, 0.17]]].map(p => new THREE.CatmullRomCurve3(p.map(q => V(...q)))));
    U.vmat = glowMat(C.red, 0.95); U.vglow = addMat(C.red, 0.28);
    const crease = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 6, 40, Math.PI), glowMat(0x8cecff, 0.7)); crease.rotation.x = Math.PI / 2; crease.rotation.z = Math.PI; crease.position.y = -0.95; crease.scale.y = 1; g.add(crease);
    for (const cv of U.vcurves) { const a = new THREE.Mesh(new THREE.BufferGeometry(), U.vmat), b = new THREE.Mesh(new THREE.BufferGeometry(), U.vglow); g.add(a, b); U.vessels.push([cv, a, b]); }
    U.vesselR = r => { for (const [cv, a, b] of U.vessels) { a.geometry.dispose(); b.geometry.dispose(); a.geometry = new THREE.TubeGeometry(cv, 40, 0.026 * r, 8); b.geometry = new THREE.TubeGeometry(cv, 40, 0.06 * r, 8); } };
    U.vesselR(1);
  }
  U.wrinkle = k => { for (const m of U.ridges) { m.visible = k > 0.03; m.scale.set(0.062, m.userData.len, 0.075 * Math.max(k, 0.01)); } body.scale.set(1 - 0.07 * k, 1, 1 - 0.07 * k); };
  U.wrinkle(0); g.userData = U; return g;
}
function bubbles(scene, n, seed, box = [3, 6, 3]) {
  const r = rnd(seed), arr = [];
  for (let i = 0; i < n; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: 0xd6f1ff, transparent: true, opacity: 0.55 })); const ol = new THREE.Mesh(b.geometry, outlineMat(2, 0x0a3350)); b.add(ol); b.userData = { x: (r() - .5) * box[0], z: (r() - .5) * box[2], o: r(), s: 0.025 + r() * 0.05, v: 0.5 + r() * 0.6 }; scene.add(b); arr.push(b); }
  return (t, y0 = -3) => { for (const b of arr) { const a = b.userData, f = (t * a.v * 0.25 + a.o) % 1; b.position.set(a.x + 0.06 * Math.sin(t * 3 + a.o * 20), y0 + f * box[1], a.z); b.scale.setScalar(a.s); } };
}
function underwater(scene) {
  scene.background = new THREE.Color(0x0f4a73); scene.fog = new THREE.Fog(0x0f4a73, 6, 18);
  const L = lights(scene, { hemi: 1.0, sky: 0xcfeeff, ground: 0x0b3352, keyI: 1.9, key: 0xffffff, rimI: 1.2, keyPos: [-2, 6, 4] });
  for (let i = 0; i < 5; i++) { const ray = new THREE.Mesh(new THREE.PlaneGeometry(0.5 + i * 0.12, 12), addMat(0x9fdcff, 0.07)); ray.position.set(-3 + i * 1.5, 2, -3 - i * 0.3); ray.rotation.z = 0.28; scene.add(ray); }
  const top = halo(0xbfe9ff, 14, 0.4); top.position.set(0, 6, -4); scene.add(top);
  return L;
}
function xbase(scene, hy = 0) {
  scene.background = new THREE.Color(C.bg);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.6, key: 0xffffff, rimI: 1.0 });
  const r = rnd(11), n = 150, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (r() - .5) * 9; pos[i * 3 + 1] = (r() - .5) * 12; pos[i * 3 + 2] = (r() - .5) * 6 - 3; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x2aa9c4, size: 4, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false })); scene.add(dust);
  const bh = halo(0x0f5f78, 10, 0.5); bh.position.set(0, hy, -3); scene.add(bh);
  return dust;
}

// =============== HOOK / LOOP (s01, s10) ===============
export function hook(mode) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xbfe3f2);
  const c = cam(32);
  lights(scene, { hemi: 1.05, sky: 0xffffff, ground: 0x7fb6d6, keyI: 2.0, key: 0xfff4e2, rimI: 0.7, keyPos: [-3, 5, 5] });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), toon(0xbfe3f2)); wall.position.set(0, 6, -5); scene.add(wall);
  for (let i = -12; i <= 12; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.05, 20), new THREE.MeshBasicMaterial({ color: 0xe9f7fd })); l.position.set(i * 1.2, 6, -4.99); scene.add(l); }
  for (let i = 0; i <= 12; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(30, 0.05), new THREE.MeshBasicMaterial({ color: 0xe9f7fd })); l.position.set(0, i * 1.2 - 0.6, -4.99); scene.add(l); }
  const water = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(WATER)); water.rotation.x = -Math.PI / 2; scene.add(water);
  const rings = []; for (let i = 0; i < 4; i++) { const rg = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 64), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true, opacity: 0.8 })); rg.rotation.x = -Math.PI / 2; rg.position.y = 0.01 + i * 0.001; scene.add(rg); rings.push(rg); }
  const r = rnd(3); for (let i = 0; i < 26; i++) { const f = M(new THREE.SphereGeometry(0.1 + r() * 0.16, 14, 10), 0xffffff, { px: 3, shadow: false }); const a = r() * 6.28, d = 1.5 + r() * 3.2; f.position.set(Math.cos(a) * d, 0.02, Math.sin(a) * d * 0.7 - 0.6); f.scale.y = 0.55; scene.add(f); }
  const h = Hand(); scene.add(h); h.userData.wrinkle(1); h.userData.curl(0.25);
  const drops = []; for (let i = 0; i < 9; i++) { const d = M(new THREE.SphereGeometry(0.04, 10, 8), 0x7fd0ff, { px: 2.5, shadow: false }); d.userData = { x: (r() - .5) * 1.0, o: r(), y: 0.2 + r() * 1.6 }; scene.add(d); drops.push(d); }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, rise = mode === 'in' ? eout(clamp(t / 0.55)) : 1;
      h.position.set(0, lerp(0.2, 1.75, rise) + 0.03 * Math.sin(t * 2), 0); h.rotation.set(-0.12, 0.25 * Math.sin(t * 0.9) - 0.1, 0.04 * Math.sin(t * 1.3));
      h.userData.curl(0.25 + 0.12 * Math.sin(t * 2.2));
      rings.forEach((rg, i) => { const f = (t * 0.5 + i / 4) % 1; rg.scale.setScalar(0.4 + f * 2.2); rg.material.opacity = 0.75 * (1 - f); });
      for (const dp of drops) { const a = dp.userData, f = (t * 0.9 + a.o) % 1; dp.position.set(h.position.x + a.x, h.position.y + a.y * 0.6 - 0.2 - f * f * 2.2, 0.2); dp.visible = dp.position.y > 0.05; dp.scale.set(1, 1.5, 1); }
      const k = mode === 'in' ? eout(u) : 1 - 0.0 * u;
      look(c, mix(V(0.5, 2.5, 7.6), V(0.25, 2.55, 6.1), mode === 'in' ? k : 1 - 0.12 * u), V(0, 2.35, 0));
    },
  };
}

// =============== WHOLE BODY WOULD WRINKLE (s02) ===============
export function wholeBody(tFlip) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xbfe3f2);
  const c = cam(32);
  lights(scene, { hemi: 1.05, sky: 0xffffff, ground: 0x7fb6d6, keyI: 2.0, key: 0xfff4e2, rimI: 0.7, keyPos: [-3, 5, 5] });
  const h = Hand(); scene.add(h); h.userData.wrinkle(1); h.userData.curl(0.15); h.rotation.set(-0.1, -0.15, 0.0);
  const r = rnd(8), fake = [];
  for (let cl = 0; cl < 15; cl++) {
    const onPalm = cl < 5, rot = (r() - .5) * 0.5, len = 0.22 + r() * 0.14;
    const cx = onPalm ? (r() - .5) * 0.6 : (r() - .5) * 0.26, cy = onPalm ? (r() - .5) * 0.62 : -0.95 - (cl - 5) / 10 * 1.9 - r() * 0.08;
    for (let j = 0; j < 4; j++) {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.0095, len * (0.75 + 0.25 * r()), 4, 8), new THREE.MeshBasicMaterial({ color: GROOVE }));
      const x = cx + (j - 1.5) * 0.034 * Math.cos(rot), y = cy + (j - 1.5) * 0.034 * Math.sin(rot);
      m.position.set(x, y, onPalm ? 0.176 : Math.sqrt(Math.max(0.001, 0.09 - x * x)) * 0.74 + 0.004);
      m.rotation.z = rot; m.userData.o = onPalm ? cl * 0.05 : 0.3 + (cl - 5) / 10 * 0.7; h.add(m); fake.push(m);
    }
  }
  return {
    scene, camera: c,
    update(t, d) {
      const spread = clamp((t - 0.75) / (tFlip - 0.95)), gone = t > tFlip ? eout(clamp((t - tFlip) / 0.22)) : 0;
      for (const m of fake) { const k = back(clamp((spread - m.userData.o * 0.8) / 0.12)) * (1 - gone); m.visible = k > 0.02; m.scale.set(1, Math.max(k, 0.01), 1); }
      const k = eio(clamp(t / (tFlip - 0.2)));
      look(c, mix(V(0.3, 0.9, 5.2), V(0.5, -0.9, 7.4), k), mix(V(0, 0.75, 0), V(0, -0.85, 0), k));
      shake(c, t, tFlip, 0.05, 0.25);
    },
  };
}

// =============== X-RAY NERVES (s03) ===============
export function nerves() {
  const scene = new THREE.Scene(); const c = cam(32); const dust = xbase(scene, 0.3);
  const solid = Hand(); solid.userData.wrinkle(1); scene.add(solid);
  const x = Hand({ xray: true }); scene.add(x);
  const pulses = []; x.userData.nerves.forEach((cv, i) => { for (let j = 0; j < 4; j++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), new THREE.MeshBasicMaterial({ color: 0xfff6c2 })); p.add(halo(NERVE, 0.32, 0.9)); p.userData = { cv, o: j / 4 + i * 0.07 }; x.add(p); pulses.push(p); } });
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.04), addMat(0xaef6ff, 0.95)); scene.add(scan);
  const scan2 = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.4), addMat(C.cyan, 0.22)); scene.add(scan2);
  for (const hh of [solid, x]) hh.rotation.set(-0.08, -0.12, 0);
  const ex = x.userData.extra; ex.forEach(m => { m.material = m.material.clone(); m.material.userData.o0 = m.material.opacity; });
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, tr = ss(0.1, 0.42, t);
      setOpacity(solid, 1 - tr); setOpacity(x, tr);
      x.traverse(o => { if (o.isMesh && !(o.material.uniforms)) { o.visible = tr > 0.05; } });
      ex.forEach(m => { m.material.opacity = m.material.userData.o0 * tr; });
      for (const p of pulses) { const f = (t * 0.55 + p.userData.o) % 1; p.position.copy(p.userData.cv.getPoint(f)); p.visible = tr > 0.5; p.children[0].material.opacity = 0.9 * Math.sin(f * Math.PI); }
      const sy = lerp(1.7, -1.6, clamp(t / 0.5)); scan.position.set(0, sy, 0.5); scan2.position.set(0, sy + 0.18, 0.5); scan.visible = scan2.visible = t < 0.5;
      dust.rotation.y = t * 0.03;
      look(c, mix(V(0.5, 0.5, 7.6), V(0.25, 0.7, 6.3), eout(u)), V(0, 0.75, 0));
    },
    ui(t) { return { flash: 0.35 * (1 - ss(0, 0.45, t)) * ss(0.02, 0.1, t) }; },
  };
}

// =============== UNDERWATER TIMER (s04a) ===============
export function soak() {
  const scene = new THREE.Scene(); const c = cam(32); underwater(scene);
  const h = Hand(); scene.add(h); h.rotation.set(-0.1, 0.2, 0.05);
  const bub = bubbles(scene, 26, 4, [4, 8, 3]);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d; h.userData.wrinkle(ss(0.55, 1.0, u)); h.userData.curl(0.2 + 0.1 * Math.sin(t * 2));
      h.position.set(0, 0.05 * Math.sin(t * 1.5), 0); h.rotation.y = 0.2 - 0.3 * u; bub(t, -4);
      look(c, mix(V(-0.5, 0.6, 7.4), V(-0.2, 0.8, 6.2), eout(u)), V(0, 0.8, 0));
    },
  };
}

// =============== SIGNAL TO VESSELS (s04b) + SQUEEZE (s05a) ===============
export function signal(mode) {
  const scene = new THREE.Scene(); const c = cam(32); const dust = xbase(scene, 0);
  const f = BigFinger({ xray: true }); scene.add(f); const U = f.userData; f.rotation.set(-0.05, -0.3, 0.08);
  const pulses = []; for (let j = 0; j < 5; j++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff6c2 })); p.add(halo(NERVE, 0.7, 0.9)); p.userData.o = j / 5; f.add(p); pulses.push(p); }
  const vh = halo(C.red, 2.4, 0); vh.position.set(-0.05, 0.3, 0.6); f.add(vh);
  const arrows = [];
  if (mode === 'squeeze') for (const [x, y, rot] of [[-0.75, 0.25, Math.PI / 2], [0.75, 0.25, -Math.PI / 2], [-0.7, -0.45, Math.PI / 2], [0.7, -0.45, -Math.PI / 2]]) {
    const a = new THREE.Group(); const s = M(new THREE.CylinderGeometry(0.045, 0.045, 0.26, 10), C.yellow, { px: 3, shadow: false }); s.position.y = 0.24; a.add(s);
    const hd = M(new THREE.ConeGeometry(0.12, 0.2, 14), C.yellow, { px: 3, shadow: false }); hd.rotation.x = Math.PI; hd.position.y = 0.05; a.add(hd);
    a.userData = { x, y }; a.rotation.z = rot; a.position.z = 0.75; scene.add(a); arrows.push(a);
  }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      for (const p of pulses) { const q = (t * 0.6 + p.userData.o) % 1; p.position.copy(U.nerve.getPoint(q)); p.children[0].material.opacity = 0.9 * Math.sin(q * Math.PI); }
      if (mode === 'signal') {
        U.vesselR(1 + 0.06 * Math.sin(t * 9)); vh.material.opacity = 0.25 + 0.2 * ss(0.35, 0.8, u) + 0.08 * Math.sin(t * 9);
        f.rotation.y = -0.45 + 0.3 * u;
        look(c, mix(V(0.4, -1.3, 8.2), V(0.2, 0.0, 5.2), eio(u)), mix(V(0, -1.0, 0), V(0, 0.1, 0), eio(u)));
      } else {
        const sq = eio(ss(0.18, 0.75, u)); U.vesselR(lerp(1.05, 0.42, sq)); vh.material.opacity = 0.5 * (1 - sq * 0.6);
        f.rotation.y = -0.15 + 0.2 * u;
        for (const a of arrows) { const push = 0.5 + 0.5 * Math.sin(t * 8), sgn = Math.sign(a.userData.x); a.position.x = sgn * (0.56 + 0.1 * (1 - push) + 0.08 * (1 - sq)); a.position.y = a.userData.y; a.scale.setScalar(0.66 * back(clamp((t - 0.25) / 0.3)) + 0.001); }
        look(c, mix(V(0.15, 0.1, 8.3), V(0.08, 0.1, 7.5), eout(u)), V(0, -0.1, 0));
        shake(c, t, d * 0.18, 0.03, 0.2);
      }
      dust.rotation.y = t * 0.03;
    },
  };
}

// =============== CROSS-SECTION: SHRINK + FOLD (s05b) ===============
export function crossSection() {
  const scene = new THREE.Scene(); const c = cam(32); const dust = xbase(scene, 0);
  const g = new THREE.Group(); scene.add(g);
  const skinMat = toon(SKIN), skin = new THREE.Mesh(new THREE.BufferGeometry(), skinMat), sol = new THREE.Mesh(new THREE.BufferGeometry(), outlineMat(5)); g.add(skin, sol);
  const pulp = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0x0e6f88 })); g.add(pulp);
  const bone = new THREE.Mesh(new THREE.CircleGeometry(0.33, 40), new THREE.MeshBasicMaterial({ color: BONE })); bone.position.set(0, -0.12, 0.02); bone.scale.y = 0.8; g.add(bone);
  const bol = new THREE.Mesh(new THREE.RingGeometry(0.33, 0.36, 40), new THREE.MeshBasicMaterial({ color: 0x06313d })); bol.position.copy(bone.position); bol.scale.y = 0.8; g.add(bol);
  const r = rnd(6), vs = [];
  for (let i = 0; i < 11; i++) { const a = lerp(0.12, Math.PI - 0.12, i / 10), rad = 0.72 + (i % 2) * 0.1; const v = new THREE.Mesh(new THREE.CircleGeometry(0.085, 20), new THREE.MeshBasicMaterial({ color: C.red })); const hl = halo(C.red, 0.5, 0.5); v.add(hl); v.userData = { a, rad }; v.position.z = 0.03; g.add(v); vs.push(v); }
  const curve = (k, amp, inset = 0) => { const pts = []; for (let i = 0; i < 160; i++) { const th = i / 160 * Math.PI * 2, top = Math.max(0, Math.sin(th)); const R = (1.0 - 0.1 * k * top - inset) * (1 + 0.0 * th) + amp * top * Math.sin(th * 15) * 0.085; pts.push(V(Math.cos(th) * R * 1.05, Math.sin(th) * R * (Math.sin(th) > 0 ? 0.95 : 0.8), 0)); } return new THREE.CatmullRomCurve3(pts, true); };
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, shr = eio(ss(0.05, 0.42, u)), fold = eio(ss(0.38, 0.86, u));
      const cv = curve(shr, fold); skin.geometry.dispose(); skin.geometry = new THREE.TubeGeometry(cv, 200, 0.075, 10, true); sol.geometry = skin.geometry;
      const inner = curve(shr, fold * 0.55, 0.06).getPoints(160); pulp.geometry.dispose(); pulp.geometry = new THREE.ShapeGeometry(new THREE.Shape(inner.map(p => new THREE.Vector2(p.x, p.y)))); pulp.position.z = -0.01;
      for (const v of vs) { const rad = v.userData.rad * (1 - 0.12 * shr); v.position.set(Math.cos(v.userData.a) * rad * 1.05, Math.sin(v.userData.a) * rad * 0.95, 0.03); v.scale.setScalar(lerp(0.5, 0.36, shr)); }
      g.rotation.set(-0.1, lerp(-0.25, 0.15, u), 0); dust.rotation.y = t * 0.03;
      look(c, mix(V(0, 0.2, 10.4), V(0, 0.3, 8.9), eout(u)), mix(V(0, 0.15, 0), V(0, 0.25, 0), eout(u)));
    },
  };
}

// =============== 1930s DESK (s06a) ===============
export function thirties() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2a2119);
  const c = cam(34);
  lights(scene, { hemi: 0.75, sky: 0xffe6c4, ground: 0x2a1c12, keyI: 2.3, key: 0xffcf96, rimI: 0.5, rim: 0xffb86b, keyPos: [-3, 5, 3], shadow: true, shadowR: 5 });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(0x6b4a30)); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  const lampH = halo(0xffcf96, 9, 0.4); lampH.position.set(-2, 3, -2); scene.add(lampH);
  // enamel basin with water
  const pts = [[0.0, 0], [0.95, 0], [1.25, 0.55], [1.32, 0.6], [1.28, 0.64], [1.18, 0.6], [0.9, 0.08], [0.0, 0.08]].map(p => new THREE.Vector2(p[0], p[1]));
  const basin = M(new THREE.LatheGeometry(pts, 48), 0xf3efe6, { matOpts: { side: THREE.DoubleSide } }); basin.position.set(0.2, 0, 0); scene.add(basin);
  const rim = M(new THREE.TorusGeometry(1.3, 0.05, 10, 48), 0x3d6ea8, { px: 3 }); rim.rotation.x = Math.PI / 2; rim.position.set(0.2, 0.62, 0); scene.add(rim);
  const wat = new THREE.Mesh(new THREE.CircleGeometry(1.16, 48), toon(WATER)); wat.rotation.x = -Math.PI / 2; wat.position.set(0.2, 0.5, 0); scene.add(wat);
  const rings = []; for (let i = 0; i < 3; i++) { const rg = new THREE.Mesh(new THREE.RingGeometry(0.9, 1, 48), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true })); rg.rotation.x = -Math.PI / 2; rg.position.set(0.2, 0.505, 0); scene.add(rg); rings.push(rg); }
  // notebook + pencil
  const nb = M(RB(1.5, 0.08, 1.05, 0.03, 1), 0x7a2f2f); nb.position.set(-1.05, 0.04, 1.75); nb.rotation.y = 0.35; scene.add(nb);
  const pg = M(RB(1.36, 0.03, 0.95, 0.01, 1), 0xf3ead2, { px: 2.5 }); pg.position.set(-1.05, 0.095, 1.75); pg.rotation.y = 0.35; scene.add(pg);
  for (let i = 0; i < 6; i++) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.035), new THREE.MeshBasicMaterial({ color: 0x8c7b63 })); ln.rotation.x = -Math.PI / 2; ln.rotation.z = 0.35; ln.position.set(-1.05 + Math.sin(0.35) * (i - 2.5) * 0.13, 0.115, 1.75 + Math.cos(0.35) * (i - 2.5) * 0.13); scene.add(ln); }
  const pen = M(new THREE.CylinderGeometry(0.035, 0.035, 1.0, 10), 0xd9a441, { px: 2.5 }); pen.rotation.set(Math.PI / 2, 0, 1.0); pen.position.set(-0.1, 0.05, 2.2); scene.add(pen);
  // brass clock
  const ck = new THREE.Group(); ck.position.set(1.15, 0, 1.75); ck.rotation.y = -0.3; ck.scale.setScalar(0.85); scene.add(ck);
  const cb = M(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 36), 0xc99a3d); cb.rotation.x = Math.PI / 2; cb.position.y = 0.72; ck.add(cb);
  const cf = new THREE.Mesh(new THREE.CircleGeometry(0.46, 36), new THREE.MeshBasicMaterial({ color: 0xf6efdc })); cf.position.set(0, 0.72, 0.152); ck.add(cf);
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; const tk = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.08), new THREE.MeshBasicMaterial({ color: 0x2a2119 })); tk.position.set(Math.sin(a) * 0.39, 0.72 + Math.cos(a) * 0.39, 0.155); tk.rotation.z = -a; ck.add(tk); }
  const hh = new THREE.Mesh(new THREE.PlaneGeometry(0.045, 0.26), new THREE.MeshBasicMaterial({ color: 0x2a2119 })); hh.geometry.translate(0, 0.13, 0); hh.position.set(0, 0.72, 0.157); ck.add(hh);
  const mh = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 0.38), new THREE.MeshBasicMaterial({ color: 0x2a2119 })); mh.geometry.translate(0, 0.19, 0); mh.position.set(0, 0.72, 0.158); ck.add(mh);
  for (const s of [-1, 1]) { const bl = M(new THREE.SphereGeometry(0.17, 16, 12), 0xc99a3d, { px: 3 }); bl.position.set(s * 0.3, 1.32, 0); bl.scale.y = 0.7; ck.add(bl); const ft = M(new THREE.CylinderGeometry(0.04, 0.05, 0.3, 8), 0xc99a3d, { px: 2.5 }); ft.position.set(s * 0.32, 0.15, 0); ft.rotation.z = s * 0.3; ck.add(ft); }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d; mh.rotation.z = -t * 2.2; hh.rotation.z = -0.8 - t * 0.2;
      rings.forEach((rg, i) => { const f = (t * 0.4 + i / 3) % 1; rg.scale.setScalar(0.15 + f * 1.0); rg.material.opacity = 0.7 * (1 - f); });
      const a = lerp(-0.3, 0.12, eio(u)); look(c, V(Math.sin(a) * 9.6, lerp(5.6, 4.8, eout(u)), Math.cos(a) * 9.6), V(0.1, 0.45, 0.75));
    },
    ui() { return { sepia: 1 }; },
  };
}

// =============== HEALTHY vs DAMAGED NERVE (s06b, s06c) ===============
export function compare(mode) {
  const scene = new THREE.Scene(); const c = cam(32); const dust = xbase(scene, 0);
  const wl = new THREE.Mesh(new THREE.PlaneGeometry(12, 6), new THREE.MeshBasicMaterial({ color: 0x1d7fbf, transparent: true, opacity: 0.22, depthWrite: false })); wl.position.set(0, -2.4, -0.6); scene.add(wl);
  const wline = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.035), glowMat(0x9fdcff, 0.9)); wline.position.set(0, 0.6, -0.59); scene.add(wline);
  const A = BigFinger({ xray: true }), B = BigFinger({ xray: true, dead: true });
  for (const [f, x] of [[A, -0.78], [B, 0.78]]) { f.scale.setScalar(0.74); f.position.set(x, -0.25, 0); f.rotation.set(-0.05, x < 0 ? 0.18 : -0.18, 0); scene.add(f); f.userData.vesselR(0.8); }
  const pulses = []; for (let j = 0; j < 4; j++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff6c2 })); p.add(halo(NERVE, 0.7, 0.9)); p.userData.o = j / 4; A.add(p); pulses.push(p); }
  const xm = new THREE.Group(); for (const rz of [0.785, -0.785]) { const bar = M(RB(0.5, 0.11, 0.06, 0.03, 1), C.red, { px: 3, shadow: false }); bar.rotation.z = rz; xm.add(bar); } xm.position.copy(B.userData.cut).add(V(0, 0, 0.25)); B.add(xm);
  const la = labelSprite('HEALTHY', '#4dff88', 1.15), lb = labelSprite('DAMAGED', '#ff3b30', 1.15); la.position.set(-0.78, -1.75, 1); lb.position.set(0.78, -1.75, 1); scene.add(la, lb);
  const bub = bubbles(scene, 14, 9, [3.6, 3.4, 0.6]);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, w = mode === 'b' ? eio(ss(0.25, 0.9, u)) : 1;
      A.userData.wrinkle(w); A.userData.vesselR(lerp(0.9, 0.45, w)); B.userData.wrinkle(0);
      for (const p of pulses) { const q = (t * 0.6 + p.userData.o) % 1; p.position.copy(A.userData.nerve.getPoint(q)); p.children[0].material.opacity = 0.9 * Math.sin(q * Math.PI); }
      xm.scale.setScalar(1 + 0.12 * Math.sin(t * 7)); bub(t, -3.0); dust.rotation.y = t * 0.03;
      if (mode === 'b') look(c, mix(V(0, -0.5, 11.6), V(0, -0.4, 10.6), eout(u)), V(0, -0.35, 0));
      else { la.visible = lb.visible = false; look(c, mix(V(0, 0.0, 9.8), V(0, 0.05, 9.0), eout(u)), V(0, 0.0, 0)); }
    },
  };
}

// =============== GRIP: PINCH A WET MARBLE (s07) ===============
function marble(col = 0x3aa0ff, r = 0.3) {
  const g = new THREE.Group(); g.add(M(new THREE.SphereGeometry(r, 28, 20), col, { px: 4 }));
  const sw = new THREE.Mesh(new THREE.TorusGeometry(r * 0.55, r * 0.09, 8, 24, 2.2), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 })); sw.rotation.set(0.5, 0.3, 0.4); g.add(sw);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(r * 0.16, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.position.set(-r * 0.4, r * 0.45, r * 0.72); g.add(hl); return g;
}
export function grip() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0xbfe3f2);
  const c = cam(32);
  lights(scene, { hemi: 1.05, sky: 0xffffff, ground: 0x7fb6d6, keyI: 2.0, key: 0xfff4e2, rimI: 0.7, keyPos: [-3, 5, 5] });
  const bh = halo(0xffffff, 12, 0.5); bh.position.set(0, 1, -4); scene.add(bh);
  const water = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(WATER)); water.rotation.x = -Math.PI / 2; scene.add(water);
  const rings = []; for (let i = 0; i < 3; i++) { const rg = new THREE.Mesh(new THREE.RingGeometry(0.93, 1, 64), new THREE.MeshBasicMaterial({ color: 0xdff4ff, transparent: true })); rg.rotation.x = -Math.PI / 2; rg.position.y = 0.01; scene.add(rg); rings.push(rg); }
  const pv = new THREE.Group(); scene.add(pv);
  const m = marble(); pv.add(m);
  const fa = new THREE.Group(), fb = new THREE.Group(); for (const [f, s] of [[fa, -1], [fb, 1]]) { const bf = BigFinger({ len: 1.7 }); bf.scale.setScalar(0.5); bf.userData.wrinkle(1); bf.rotation.set(Math.PI, s * Math.PI / 2, 0); bf.position.y = 0.21; f.add(bf); f.rotation.z = s * -0.38; pv.add(f); f.userData.s = s; }
  const r = rnd(2), drops = []; for (let i = 0; i < 8; i++) { const dp = M(new THREE.SphereGeometry(0.045, 10, 8), 0x7fd0ff, { px: 2.5, shadow: false }); dp.userData = { o: r(), x: (r() - .5) * 0.5 }; scene.add(dp); drops.push(dp); }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, close = eout(clamp(t / 0.55)), lift = eio(ss(0.3, 0.85, u));
      pv.position.y = lerp(0.12, 1.75, lift);
      for (const f of [fa, fb]) { const s = f.userData.s; f.position.set(s * lerp(1.0, 0.53, close), 0.0, 0); }
      m.rotation.y = t * 0.6;
      rings.forEach((rg, i) => { const f = (t * 0.5 + i / 3) % 1; rg.scale.setScalar(0.3 + f * 1.8); rg.material.opacity = 0.75 * (1 - f); });
      for (const dp of drops) { const f = (t * 1.1 + dp.userData.o) % 1; dp.position.set(dp.userData.x, pv.position.y - 0.3 - f * f * 1.6, 0.1); dp.visible = lift > 0.1 && dp.position.y > 0.05; dp.scale.set(1, 1.5, 1); }
      look(c, mix(V(0.6, 1.6, 6.6), V(0.3, 2.3, 5.6), eout(u)), mix(V(0, 1.0, 0), V(0, 2.1, 0), lift));
    },
  };
}

// =============== 2013 STUDY (s08a, s08b) ===============
function bowl(col = 0xf3efe6) {
  const pts = [[0, 0], [0.5, 0], [0.9, 0.42], [0.96, 0.45], [0.9, 0.5], [0.82, 0.44], [0.46, 0.07], [0, 0.07]].map(p => new THREE.Vector2(p[0], p[1]));
  const g = new THREE.Group(); g.add(M(new THREE.LatheGeometry(pts, 40), col, { matOpts: { side: THREE.DoubleSide } }));
  const w = new THREE.Mesh(new THREE.CircleGeometry(0.8, 40), toon(WATER)); w.rotation.x = -Math.PI / 2; w.position.y = 0.38; g.add(w); return g;
}
const MC = [0x3aa0ff, 0xff5a4f, 0xffd60a, 0x4dff88, 0xb388ff];
export function study(mode) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x15171c);
  const c = cam(34);
  lights(scene, { hemi: 0.95, keyI: 2.1, rimI: 0.8, keyPos: [-3, 6, 4], shadow: true, shadowR: 6 });
  const table = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(0xe9dfca)); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
  const lanes = [], BX = 0.78;
  for (const [z, wr] of [[-1.5, 0], [0.6, 1]]) {
    const b1 = bowl(), b2 = bowl(); b1.scale.setScalar(0.72); b2.scale.setScalar(0.72); b1.position.set(-BX, 0, z); b2.position.set(BX, 0, z); scene.add(b1, b2);
    const src = [];
    for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; const mm = marble(MC[i % 5], 0.11); mm.position.set(-BX + Math.cos(a) * 0.27, 0.36, z + Math.sin(a) * 0.27); scene.add(mm); src.push(mm); }
    const carry = marble(MC[wr ? 0 : 1], 0.11); scene.add(carry);
    const pinch = new THREE.Group(); scene.add(pinch);
    for (const s of [-1, 1]) { const fg = new THREE.Group(); const f = BigFinger({ len: 1.5 }); f.scale.setScalar(0.2); f.userData.wrinkle(wr); f.rotation.set(Math.PI, s * Math.PI / 2, 0); f.position.y = 0.085; fg.add(f); fg.rotation.z = s * -0.38; fg.position.set(s * 0.2, 0.02, 0); pinch.add(fg); }
    const lb = labelSprite(wr ? 'WRINKLED' : 'SMOOTH', wr ? '#4dff88' : '#ffffff', 1.25); lb.position.set(0, 0.14, z - 0.98); scene.add(lb);
    lanes.push({ z, wr, src, carry, pinch, period: wr ? 0.62 : 0.8 });
  }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      for (const L of lanes) {
        const run = mode === 'race'; const ph = run ? (t / L.period) : 0, n = Math.floor(ph), f = ph - n;
        const go = f < 0.6 ? eio(f / 0.6) : 1 - eio((f - 0.6) / 0.4), x = lerp(-BX, BX, go), y = 0.55 + 0.6 * Math.sin(go * Math.PI);
        L.pinch.position.set(run ? x : -BX, run ? y : 0.78 + 0.05 * Math.sin(t * 3 + L.z), L.z);
        L.carry.visible = run && f < 0.6; L.carry.position.set(x, y + 0.02, L.z); L.carry.children[0].material.color.setHex(MC[n % 5]);
        L.src.forEach((m, i) => { m.position.y = 0.36 + 0.015 * Math.sin(t * 3 + i); });
      }
      if (mode === 'intro') look(c, mix(V(0.4, 6.5, 9.2), V(0.2, 6.0, 8.6), eout(u)), V(0, 0.2, 0.25));
      else look(c, mix(V(0.12, 6.0, 8.6), V(0.06, 5.75, 8.25), eout(u)), V(0, 0.2, 0.25));
    },
  };
}

// =============== RIDGES CHANNEL WATER (s09a) ===============
export function ridges() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0f4a73);
  const c = cam(32); underwater(scene);
  const f = BigFinger(); scene.add(f); f.userData.wrinkle(1); f.rotation.set(-0.25, 0, 0);
  const r = rnd(4), flow = [];
  for (let i = 0; i < 36; i++) { const ch = i % 4, x = (ch - 1.5) * 0.165; const dp = M(new THREE.SphereGeometry(0.035, 10, 8), 0x9fe0ff, { px: 2.5, shadow: false }); dp.userData = { x, z: Math.sqrt(0.25 - x * x) + 0.02, o: r(), ry: Math.asin(x / 0.5) }; f.add(dp); flow.push(dp); }
  const arrows = [];
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      for (const dp of flow) { const a = dp.userData, q = (t * 0.9 + a.o) % 1; dp.position.set(a.x, lerp(0.85, -0.25, q), a.z * (q < 0.15 ? lerp(0.9, 1, q / 0.15) : 1)); dp.scale.set(1, 1.7, 1); dp.visible = q > 0.03; }
      arrows.forEach((a, i) => { a.position.y = -0.5 - 0.1 * ((t * 1.5 + i * 0.5) % 1); });
      f.rotation.y = lerp(-0.35, 0.25, eio(u));
      look(c, mix(V(0, 0.5, 4.3), V(0, 0.35, 3.3), eout(u)), V(0, 0.3, 0));
    },
  };
}

// =============== TIRE TREADS (s09b) ===============
export function tire() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1c2733); scene.fog = new THREE.Fog(0x1c2733, 9, 24);
  const c = cam(34);
  lights(scene, { hemi: 0.9, sky: 0xbfd6ff, ground: 0x20242c, keyI: 2.3, rimI: 1.1, keyPos: [-4, 5, 5], shadow: true, shadowR: 6 });
  const road = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), toon(0x2c3440)); road.rotation.x = -Math.PI / 2; road.receiveShadow = true; scene.add(road);
  const wet = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshBasicMaterial({ color: 0x2e9be0, transparent: true, opacity: 0.28 })); wet.rotation.x = -Math.PI / 2; wet.position.y = 0.01; scene.add(wet);
  const lines = []; for (let i = 0; i < 8; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 1.5), new THREE.MeshBasicMaterial({ color: 0xe9eef3 })); l.rotation.x = -Math.PI / 2; l.position.set(-2.1, 0.02, 0); scene.add(l); lines.push(l); }
  const R = 1.3, wheel = new THREE.Group(); wheel.position.y = R + 0.05; scene.add(wheel);
  const core = M(new THREE.CylinderGeometry(R - 0.1, R - 0.1, 1.0, 48), 0x1d1f24); core.rotation.z = Math.PI / 2; wheel.add(core);
  for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 26; i++) { const a = (i + (ring % 2) * 0.5) / 26 * Math.PI * 2; const b = M(RB(0.24, 0.16, 0.24, 0.03, 1), 0x2a2d34, { px: 2.5 }); b.position.set((ring - 1) * 0.33, Math.cos(a) * (R - 0.03), Math.sin(a) * (R - 0.03)); b.rotation.x = a; b.rotation.order = 'XYZ'; wheel.add(b); }
  for (const s of [-1, 1]) { const hub = M(new THREE.CylinderGeometry(0.72, 0.72, 0.1, 32), 0xc9ced4, { px: 3 }); hub.rotation.z = Math.PI / 2; hub.position.x = s * 0.5; wheel.add(hub); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; const sp = new THREE.Mesh(new THREE.CircleGeometry(0.13, 16), new THREE.MeshBasicMaterial({ color: 0x3b424b })); sp.position.set(s * 0.556, Math.cos(a) * 0.42, Math.sin(a) * 0.42); sp.rotation.y = s * Math.PI / 2; wheel.add(sp); } }
  const r = rnd(7), spray = [];
  for (let i = 0; i < 44; i++) { const dp = M(new THREE.SphereGeometry(1, 10, 8), 0x9fe0ff, { px: 2.5, shadow: false }); dp.userData = { s: r() < .5 ? -1 : 1, o: r(), v: 0.8 + r() * 1.2, up: 0.5 + r() * 1.3, z: (r() - .5) * 0.5, sz: 0.035 + r() * 0.05 }; scene.add(dp); spray.push(dp); }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d; wheel.rotation.x = t * 5;
      lines.forEach((l, i) => { l.position.z = ((i * 3 + t * 6.5) % 24) - 12; });
      for (const dp of spray) { const a = dp.userData, q = (t * 1.3 + a.o) % 1; dp.position.set(a.s * (0.5 + a.v * q * 1.4), 0.08 + a.up * q - 1.9 * q * q, 0.3 + a.z - q * 1.2); dp.visible = dp.position.y > 0.03; dp.scale.setScalar(a.sz * (1 - q * 0.5)); }
      const a = lerp(0.75, 0.35, eio(u)); look(c, V(Math.sin(a) * 6.6, lerp(1.9, 1.5, u), Math.cos(a) * 6.6), V(0, 1.15, 0));
    },
  };
}
