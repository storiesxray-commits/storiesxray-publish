// Stories X-Ray — world kit for the "pro" render style: realistic surfaces, rooms, ground and skies, all procedural (no downloads).
// Every material is a MeshPhysicalMaterial with color + normal + roughness maps generated on a canvas, so floors, walls and props
// stop looking like flat plastic. Use in scenes.js:
//   import { mat, room, ground, sky, studio } from '../../engine/world.js';
//   room(scene, { w: 4, d: 4, h: 3, floor: 'wood', walls: 'plaster', wallColor: 0xd9d2c5, window: true });
//   ground(scene, 'asphalt' | 'grass' | 'sand' | 'concrete' | 'tile' | 'wood' | 'carpet', { size: 40 });
//   sky(scene, 'day' | 'sunset' | 'night' | 'overcast');   studio(scene, { color: 0x1d2433 })  (seamless photo backdrop)
//   mat('metal' | 'chrome' | 'gold' | 'glass' | 'plastic' | 'rubber' | 'ceramic' | 'wood' | 'fabric' | 'leather' | 'paper' | ..., { color, repeat })
import { THREE, rnd } from './engine.js';

const cache = {};
function noise2(seed) {           // value noise with octaves, tileable 256
  const r = rnd(seed), N = 64, g = new Float32Array(N * N); for (let i = 0; i < g.length; i++) g[i] = r();
  const at = (x, y) => g[((y % N + N) % N) * N + ((x % N + N) % N)];
  const sm = t => t * t * (3 - 2 * t);
  return (u, v, oct = 4) => { let a = 0, amp = 0.5, f = 1;
    for (let o = 0; o < oct; o++) { const x = u * N / 4 * f, y = v * N / 4 * f, xi = Math.floor(x), yi = Math.floor(y), xf = sm(x - xi), yf = sm(y - yi);
      const n = (at(xi, yi) * (1 - xf) + at(xi + 1, yi) * xf) * (1 - yf) + (at(xi, yi + 1) * (1 - xf) + at(xi + 1, yi + 1) * xf) * yf;
      a += n * amp; amp *= 0.5; f *= 2; }
    return a; };
}
// builds albedo (multiplier, grey around 1), height -> normal, roughness from one height function h(u,v) in [0,1]
function surface(key, size, h, o = {}) {
  if (cache[key]) return cache[key];
  const S = size, hv = new Float32Array(S * S), alb = o.albedo;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) hv[y * S + x] = h(x / S, y / S);
  const mk = fill => { const cv = document.createElement('canvas'); cv.width = cv.height = S; const c = cv.getContext('2d'); const im = c.createImageData(S, S);
    for (let i = 0; i < S * S; i++) { const [r, g, b] = fill(i); im.data[i * 4] = r; im.data[i * 4 + 1] = g; im.data[i * 4 + 2] = b; im.data[i * 4 + 3] = 255; }
    c.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; };
  const H = (x, y) => hv[((y + S) % S) * S + ((x + S) % S)], k = o.normal ?? 3;
  const normal = mk(i => { const x = i % S, y = (i / S) | 0; const dx = (H(x + 1, y) - H(x - 1, y)) * k, dy = (H(x, y + 1) - H(x, y - 1)) * k;
    const l = Math.hypot(dx, dy, 1); return [(-dx / l * 0.5 + 0.5) * 255, (dy / l * 0.5 + 0.5) * 255, (1 / l * 0.5 + 0.5) * 255]; });
  const rough = mk(i => { const v = Math.max(0, Math.min(255, ((o.r0 ?? 0.6) + (hv[i] - 0.5) * (o.rv ?? 0.3)) * 255)); return [v, v, v]; });
  const color = mk(i => { const c = alb ? alb(i % S / S, ((i / S) | 0) / S, hv[i]) : [1, 1, 1]; return c.map(v => Math.max(0, Math.min(255, v * 255))); });
  color.colorSpace = THREE.SRGBColorSpace;
  return (cache[key] = { color, normal, rough });
}
const n1 = noise2(1), n2 = noise2(2), n3 = noise2(3);
const SURF = {
  wood: () => surface('wood', 512, (u, v) => { const plank = Math.floor(u * 4), off = (plank * 0.37) % 1, vv = (v + off) % 1;
      const seam = Math.min(u * 4 % 1, 1 - u * 4 % 1) < 0.012 || Math.min(vv * 1.5 % 1, 1 - vv * 1.5 % 1) < 0.006 ? 0 : 1;
      const grain = 0.5 + 0.5 * Math.sin((u * 4 % 1) * 60 + n1(u * 4, vv * 0.3, 3) * 18); return seam * (0.55 + 0.3 * grain + 0.15 * n2(u, vv)); },
    { normal: 2.5, r0: 0.55, rv: 0.25, albedo: (u, v, h) => { const k = 0.72 + 0.35 * h; const p = 0.85 + 0.25 * ((Math.floor(u * 4) * 0.618) % 1); return [k * p, k * p * 0.93, k * p * 0.85]; } }),
  tile: () => surface('tile', 512, (u, v) => { const t = 8, gx = Math.min(u * t % 1, 1 - u * t % 1), gy = Math.min(v * t % 1, 1 - v * t % 1);
      const grout = Math.min(gx, gy) < 0.035 ? 0.15 : 1; return grout * (0.92 + 0.08 * n1(u * 3, v * 3, 2)); },
    { normal: 4, r0: 0.18, rv: 0.6, albedo: (u, v, h) => h < 0.3 ? [0.62, 0.6, 0.57] : [1, 1, 1].map(c => c * (0.96 + 0.06 * n3(u * 8, v * 8, 1))) }),
  concrete: () => surface('concrete', 512, (u, v) => 0.5 + 0.35 * (n1(u * 2, v * 2, 6) - 0.5) + 0.25 * (n2(u * 16, v * 16, 2) - 0.5) - (n3(u * 40, v * 40, 1) > 0.82 ? 0.25 : 0),
    { normal: 2, r0: 0.85, rv: 0.25, albedo: (u, v, h) => { const k = 0.8 + 0.35 * (h - 0.5) + 0.1 * (n2(u, v, 3) - 0.5); return [k, k, k * 0.98]; } }),
  asphalt: () => surface('asphalt', 512, (u, v) => { const r = n2(u * 60, v * 60, 1); return 0.5 + 0.4 * (r > 0.7 ? r - 0.5 : -0.1) + 0.2 * (n1(u * 3, v * 3, 4) - 0.5); },
    { normal: 3, r0: 0.9, rv: 0.2, albedo: (u, v, h) => { const k = 0.55 + 0.6 * (h - 0.5); return [k, k, k * 1.02]; } }),
  grass: () => surface('grass', 512, (u, v) => 0.5 + 0.5 * (n2(u * 50, v * 50, 2) - 0.5) + 0.3 * (n1(u * 4, v * 4, 3) - 0.5),
    { normal: 4, r0: 0.85, rv: 0.2, albedo: (u, v, h) => { const k = 0.7 + 0.5 * (h - 0.5); const d = n3(u * 3, v * 3, 3); return [k * (0.85 + 0.3 * d), k, k * 0.8]; } }),
  sand: () => surface('sand', 512, (u, v) => 0.5 + 0.25 * Math.sin(u * 40 + n1(u * 2, v * 2, 3) * 8) * 0.5 + 0.2 * (n2(u * 80, v * 80, 1) - 0.5),
    { normal: 2.5, r0: 0.9, rv: 0.1, albedo: (u, v, h) => { const k = 0.9 + 0.2 * (h - 0.5); return [k, k * 0.97, k * 0.92]; } }),
  plaster: () => surface('plaster', 512, (u, v) => 0.5 + 0.3 * (n1(u * 6, v * 6, 5) - 0.5),
    { normal: 1.2, r0: 0.88, rv: 0.1, albedo: (u, v, h) => { const k = 0.95 + 0.12 * (h - 0.5) + 0.06 * (n2(u, v, 2) - 0.5); return [k, k, k]; } }),
  brick: () => surface('brick', 512, (u, v) => { const rows = 16, row = Math.floor(v * rows), uu = (u * 8 + (row % 2) * 0.5) % 1, vv = v * rows % 1;
      const m = Math.min(uu, 1 - uu) < 0.04 || Math.min(vv, 1 - vv) < 0.08 ? 0.1 : 1; return m * (0.75 + 0.25 * n1(u * 10, v * 10, 3)); },
    { normal: 4, r0: 0.85, rv: 0.2, albedo: (u, v, h) => { if (h < 0.2) return [0.75, 0.73, 0.7]; const rr = rnd((Math.floor(v * 16) * 31 + Math.floor((u * 8 + (Math.floor(v * 16) % 2) * 0.5)) * 7) >>> 0)(); const k = 0.75 + 0.35 * rr; return [k, k * 0.92, k * 0.88]; } }),
  carpet: () => surface('carpet', 256, (u, v) => 0.5 + 0.5 * (n2(u * 90, v * 90, 1) - 0.5) + 0.15 * (n1(u * 4, v * 4, 2) - 0.5), { normal: 3, r0: 0.97, rv: 0.05 }),
  fabric: () => surface('fabric', 256, (u, v) => 0.5 + 0.25 * Math.sin(u * 256) * Math.sin(v * 256) + 0.15 * (n1(u * 8, v * 8, 2) - 0.5), { normal: 2, r0: 0.9, rv: 0.1 }),
  leather: () => surface('leather', 256, (u, v) => 0.5 + 0.4 * (n2(u * 30, v * 30, 2) - 0.5), { normal: 2.5, r0: 0.45, rv: 0.3 }),
  brushed: () => surface('brushed', 256, (u, v) => 0.5 + 0.4 * (n2(u * 2, v * 120, 1) - 0.5), { normal: 0.8, r0: 0.3, rv: 0.25 }),
  smudge: () => surface('smudge', 256, (u, v) => 0.5 + 0.5 * (n1(u * 3, v * 3, 5) - 0.5), { normal: 0.3, r0: 0.25, rv: 0.35 }),
  paper: () => surface('paper', 256, (u, v) => 0.5 + 0.3 * (n2(u * 20, v * 20, 4) - 0.5), { normal: 1, r0: 0.9, rv: 0.05 }),
};
const PRESET = {
  wood: ['wood', { roughness: 1 }], floorWood: ['wood', {}], tile: ['tile', { clearcoat: 0.6, clearcoatRoughness: 0.15 }], ceramic: ['smudge', { color: 0xf4f2ee, roughness: 1, clearcoat: 1, clearcoatRoughness: 0.08 }],
  concrete: ['concrete', {}], asphalt: ['asphalt', { color: 0x4a4b4f }], grass: ['grass', { color: 0x5d8a3a }], sand: ['sand', { color: 0xd8c19a }],
  plaster: ['plaster', {}], brick: ['brick', { color: 0xa0533d }], carpet: ['carpet', { sheen: 1, sheenRoughness: 0.8 }], fabric: ['fabric', { sheen: 0.8, sheenRoughness: 0.6 }],
  leather: ['leather', { color: 0x5a3a24, clearcoat: 0.3, clearcoatRoughness: 0.4 }], paper: ['paper', { color: 0xf3efe6 }],
  metal: ['brushed', { color: 0xb8bcc2, metalness: 1 }], chrome: ['smudge', { color: 0xf2f4f6, metalness: 1, roughness: 0.35 }], gold: ['smudge', { color: 0xf0c25a, metalness: 1, roughness: 0.6 }],
  plastic: ['smudge', { roughness: 1.2, clearcoat: 0.4, clearcoatRoughness: 0.3 }], rubber: ['fabric', { color: 0x1c1c1e, roughness: 1.3 }],
  glass: [null, { color: 0xffffff, roughness: 0.04, transmission: 1, thickness: 0.05, ior: 1.5, transparent: true }],
  screen: ['smudge', { color: 0x0a0c10, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.02 }],
};
export function mat(name, o = {}) {
  const [s, base] = PRESET[name] || [name in SURF ? name : 'smudge', {}];
  const p = { ...base, ...o }; const rep = p.repeat || [1, 1]; delete p.repeat;
  const m = new THREE.MeshPhysicalMaterial({ color: p.color ?? 0xffffff, roughness: 1, metalness: 0, envMapIntensity: 1, ...p });
  if (s) { const t = SURF[s](); for (const [k, tex] of [['map', t.color], ['normalMap', t.normal], ['roughnessMap', t.rough]]) { const c = tex.clone(); c.repeat.set(...rep); c.needsUpdate = true; m[k] = c; } }
  m.userData.pro = true; return m;
}
function plane(w, h, m, rx = 0) { const g = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); g.rotation.x = rx; g.receiveShadow = true; return g; }
// room with floor, 3 walls (open to the camera), baseboard, optional window with daylight and ceiling light
export function room(scene, o = {}) {
  const w = o.w ?? 5, d = o.d ?? 5, h = o.h ?? 3, grp = new THREE.Group(); scene.add(grp);
  const fl = plane(w, d, mat(o.floor ?? 'wood', { color: o.floorColor, repeat: [w / 2, d / 2] }), -Math.PI / 2); grp.add(fl);
  const wm = mat(o.walls ?? 'plaster', { color: o.wallColor ?? 0xd8d1c4, repeat: [w / 2, h / 2] });
  const back = plane(w, h, wm); back.position.set(0, h / 2, -d / 2); grp.add(back);
  for (const s of [-1, 1]) { const side = plane(d, h, wm); side.rotation.y = -s * Math.PI / 2; side.position.set(s * w / 2, h / 2, 0); grp.add(side); }
  const bb = mat('plastic', { color: o.trim ?? 0xf1ede6 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, 0.02), bb); base.position.set(0, 0.05, -d / 2 + 0.01); grp.add(base);
  if (o.window) {
    const ww = o.window.w ?? 1.4, wh = o.window.h ?? 1.3, wx = o.window.x ?? w * 0.22, wy = o.window.y ?? h * 0.55;
    const skyM = new THREE.MeshBasicMaterial({ color: o.window.sky ?? 0xcfe6ff }); const pane = plane(ww, wh, skyM); pane.position.set(wx, wy, -d / 2 + 0.005); grp.add(pane);
    const fr = mat('plastic', { color: 0xf4f2ee });
    for (const [bw, bh, x, y] of [[ww + 0.1, 0.06, 0, wh / 2], [ww + 0.1, 0.08, 0, -wh / 2], [0.06, wh, -ww / 2, 0], [0.06, wh, ww / 2, 0], [0.04, wh, 0, 0], [ww, 0.04, 0, 0]]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.06), fr); b.position.set(wx + x, wy + y, -d / 2 + 0.03); b.castShadow = true; grp.add(b); }
    const sun = new THREE.DirectionalLight(0xfff1dc, o.window.sun ?? 2.2); sun.position.set(wx + 1.5, wy + 2.5, -d / 2 - 4); sun.target.position.set(0, 0, 0.5);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const c = sun.shadow.camera; c.left = c.bottom = -4; c.right = c.top = 4; sun.shadow.radius = 6; sun.shadow.blurSamples = 16;
    sun.userData.proScaled = true; scene.add(sun, sun.target);
  }
  if (o.ceilingLight !== false) { const pl = new THREE.PointLight(o.lightColor ?? 0xffe6c8, o.light ?? 6, 12, 2); pl.position.set(0, h - 0.2, 0.3); pl.castShadow = !o.window; pl.userData.proScaled = true; scene.add(pl); }
  return grp;
}
export function ground(scene, kind = 'concrete', o = {}) {
  const size = o.size ?? 40; const g = plane(size, size, mat(kind, { color: o.color, repeat: [size / (o.tile ?? 3), size / (o.tile ?? 3)] }), -Math.PI / 2); scene.add(g); return g;
}
const SKIES = {
  day: [['#3f7fd8', 0], ['#8fc0f2', 0.55], ['#dfeefb', 1]], sunset: [['#28305e', 0], ['#c4587a', 0.55], ['#ffb46b', 0.85], ['#ffe2a8', 1]],
  night: [['#020308', 0], ['#0a1430', 0.7], ['#1b2a4e', 1]], overcast: [['#8a96a3', 0], ['#c3cbd3', 0.7], ['#dde2e6', 1]],
};
export function sky(scene, kind = 'day', o = {}) {
  const cv = document.createElement('canvas'); cv.width = 16; cv.height = 512; const c = cv.getContext('2d'); const gr = c.createLinearGradient(0, 0, 0, 512);
  for (const [col, p] of SKIES[kind]) gr.addColorStop(p, col); c.fillStyle = gr; c.fillRect(0, 0, 16, 512);
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(o.r ?? 150, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.62), new THREE.MeshBasicMaterial({ map: t, side: THREE.BackSide, fog: false, depthWrite: false }));
  dome.renderOrder = -10; scene.add(dome);
  const sunC = { day: 0xfff4e0, sunset: 0xffa860, night: 0x9fb4ff, overcast: 0xe8eef4 }[kind], sunI = { day: 3, sunset: 2.2, night: 0.5, overcast: 1.2 }[kind];
  const sun = new THREE.DirectionalLight(sunC, o.sun ?? sunI); sun.position.set(...(o.sunPos || (kind === 'sunset' ? [-8, 3, -10] : [-6, 10, 4])));
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const cc = sun.shadow.camera; const R = o.shadowR ?? 6; cc.left = cc.bottom = -R; cc.right = cc.top = R; cc.far = 60; sun.shadow.radius = 5; sun.shadow.blurSamples = 16;
  const hemi = new THREE.HemisphereLight(SKIES[kind][1][0], 0x3a3428, kind === 'night' ? 0.25 : 0.6); sun.userData.proScaled = hemi.userData.proScaled = true; scene.add(sun, hemi);
  scene.fog = new THREE.Fog(SKIES[kind][SKIES[kind].length - 1][0], o.fogNear ?? 25, o.fogFar ?? 140);
  return { dome, sun };
}
// seamless photo-studio backdrop (cyclorama) with soft key, fill and rim: the "product shot" look for objects and explainers
export function studio(scene, o = {}) {
  const col = o.color ?? 0x1d2433;
  // profile (y, z): floor -> quarter arc -> wall, swept along x
  const R = 3, prof = [[0, 8], [0, -6]]; for (let i = 1; i <= 16; i++) { const a = i / 16 * Math.PI / 2; prof.push([R - R * Math.cos(a), -6 - R * Math.sin(a)]); } prof.push([22, -6 - R]);
  const pos = [], uv = [], idx = []; let L = 0; const lens = [0]; for (let i = 1; i < prof.length; i++) { L += Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]); lens.push(L); }
  prof.forEach(([y, z], i) => { for (const x of [-15, 15]) { pos.push(x, y, z); uv.push((x + 15) / 5, lens[i] / 5); } });
  for (let i = 0; i < prof.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const cyc = new THREE.Mesh(geo, mat('plaster', { color: col, side: THREE.DoubleSide })); cyc.receiveShadow = true; scene.add(cyc);
  scene.background = new THREE.Color(col).multiplyScalar(0.6);
  const key = new THREE.DirectionalLight(0xfff2e2, o.key ?? 2.6); key.position.set(-3, 5, 4); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  const c = key.shadow.camera; c.left = c.bottom = -4; c.right = c.top = 4; key.shadow.radius = 8; key.shadow.blurSamples = 16;
  const fill = new THREE.DirectionalLight(0xcfe0ff, 0.6); fill.position.set(4, 2, 3);
  const rim = new THREE.DirectionalLight(o.rim ?? 0x9fd8ff, o.rimI ?? 2.0); rim.position.set(2, 3, -4);
  scene.add(key, fill, rim); for (const l of [key, fill, rim]) l.userData.proScaled = true; return cyc;
}

// ---------------- props (all real-world scale in meters, origin on the floor, facing +z) ----------------
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const _m = (geo, m, p, r, s) => { const o = new THREE.Mesh(geo, m); o.castShadow = o.receiveShadow = true; if (p) o.position.set(...p); if (r) o.rotation.set(...r); if (s) o.scale.set(...s); return o; };
const RB = (w, h, d, r = 0.01) => new RoundedBoxGeometry(w, h, d, 4, Math.min(r, w / 2.1, h / 2.1, d / 2.1));
// potted plant: terracotta pot, soil, a few dozen leaves fanning out
export function plant(o = {}) {
  const g = new THREE.Group(), r = rnd(o.seed ?? 4), h = o.h ?? 0.9;
  g.add(_m(new THREE.CylinderGeometry(0.16, 0.12, 0.28, 32), mat('ceramic', { color: o.pot ?? 0xb5653d, roughness: 1.2 }), [0, 0.14, 0]));
  g.add(_m(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 32), mat('concrete', { color: 0x3a2a1e }), [0, 0.27, 0]));
  const leafM = new THREE.MeshPhysicalMaterial({ color: o.leaf ?? 0x3f7a35, roughness: 0.45, sheen: 0.5, sheenColor: new THREE.Color(0x9fd27a), side: THREE.DoubleSide, clearcoat: 0.3 });
  const leaf = new THREE.SphereGeometry(0.1, 16, 8); leaf.scale(0.35, 1, 0.06); leaf.translate(0, 0.1, 0);
  for (let i = 0; i < (o.leaves ?? 26); i++) { const a = r() * Math.PI * 2, t = 0.25 + r() * 0.9, L = 0.6 + r() * 0.8;
    const stem = new THREE.Group(); stem.position.set(0, 0.28, 0); stem.rotation.set(0, a, 0); g.add(stem);
    const lf = _m(leaf, leafM, [0, (h - 0.3) * (0.3 + 0.7 * r()), 0], [t, 0, (r() - 0.5) * 0.6], [L, L * (h / 0.9), L]); stem.add(lf); }
  return g;
}
export function table(o = {}) {
  const g = new THREE.Group(), w = o.w ?? 1.2, d = o.d ?? 0.75, h = o.h ?? 0.75, wm = mat('wood', { color: o.color ?? 0x9a7250, repeat: [1, 1] });
  g.add(_m(RB(w, 0.04, d, 0.012), wm, [0, h - 0.02, 0]));
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) g.add(_m(new THREE.CylinderGeometry(0.022, 0.018, h - 0.04, 16), wm, [x * (w / 2 - 0.07), (h - 0.04) / 2, z * (d / 2 - 0.07)]));
  return g;
}
export function chair(o = {}) {
  const g = new THREE.Group(), wm = mat(o.fabric ? 'fabric' : 'wood', { color: o.color ?? 0x7a5a3e });
  g.add(_m(RB(0.44, 0.05, 0.44, 0.015), wm, [0, 0.45, 0]));
  g.add(_m(RB(0.44, 0.45, 0.04, 0.015), wm, [0, 0.7, -0.2], [-0.08, 0, 0]));
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) g.add(_m(new THREE.CylinderGeometry(0.016, 0.014, 0.45, 12), wm, [x * 0.19, 0.225, z * 0.19]));
  return g;
}
export function lamp(o = {}) {
  const g = new THREE.Group(), metal = mat('metal', { color: 0x2b2d31 });
  g.add(_m(new THREE.CylinderGeometry(0.12, 0.14, 0.03, 32), metal, [0, 0.015, 0]));
  g.add(_m(new THREE.CylinderGeometry(0.01, 0.01, o.h ?? 1.5, 12), metal, [0, (o.h ?? 1.5) / 2, 0]));
  const shade = _m(new THREE.CylinderGeometry(0.12, 0.2, 0.22, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xf3e9d6, roughness: 0.8, side: THREE.DoubleSide, emissive: 0xffcf8a, emissiveIntensity: 0.6, transmission: 0.3 }), [0, (o.h ?? 1.5), 0]); g.add(shade);
  const pl = new THREE.PointLight(0xffd29a, o.light ?? 2.5, 5, 2); pl.position.set(0, (o.h ?? 1.5) - 0.05, 0); pl.userData.proScaled = true; g.add(pl);
  return g;
}
export function laptop(o = {}) {
  const g = new THREE.Group(), al = mat('metal', { color: o.color ?? 0xc9ccd1 });
  g.add(_m(RB(0.32, 0.015, 0.22, 0.006), al, [0, 0.0075, 0]));
  g.add(_m(RB(0.29, 0.002, 0.1, 0.001), mat('rubber'), [0, 0.016, -0.02]));
  const lid = new THREE.Group(); lid.position.set(0, 0.015, -0.11); lid.rotation.x = -(o.open ?? 1.85) + Math.PI / 2; g.add(lid);
  lid.add(_m(RB(0.32, 0.21, 0.008, 0.006), al, [0, 0.105, 0]));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.29, 0.18), o.screen || new THREE.MeshBasicMaterial({ color: 0x8fc4ff })); scr.position.set(0, 0.105, 0.0045); lid.add(scr); g.userData.screen = scr;
  return g;
}
export function mug(o = {}) {
  const g = new THREE.Group(), cm = mat('ceramic', { color: o.color ?? 0xf2efe9 });
  g.add(_m(new THREE.CylinderGeometry(0.042, 0.038, 0.1, 32, 1, true), cm, [0, 0.05, 0])); g.children[0].material.side = THREE.DoubleSide;
  g.add(_m(new THREE.CylinderGeometry(0.038, 0.038, 0.006, 32), cm, [0, 0.003, 0]));
  g.add(_m(new THREE.CylinderGeometry(0.039, 0.039, 0.004, 32), new THREE.MeshPhysicalMaterial({ color: o.drink ?? 0x3b2314, roughness: 0.1, clearcoat: 1 }), [0, 0.085, 0]));
  g.add(_m(new THREE.TorusGeometry(0.025, 0.007, 10, 24, Math.PI), cm, [0.042, 0.05, 0], [0, 0, -Math.PI / 2]));
  return g;
}
// lab glass: Erlenmeyer flask and beaker with colored liquid
export function flask(o = {}) {
  const g = new THREE.Group(), glass = mat('glass'), pts = [[0.001, 0], [0.07, 0], [0.075, 0.01], [0.03, 0.13], [0.018, 0.15], [0.018, 0.2], [0.022, 0.205]];
  g.add(_m(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 48), glass));
  const lq = [[0.001, 0.004], [0.066, 0.004], [0.07, 0.012], [0.047, 0.07], [0.001, 0.07]];
  g.add(_m(new THREE.LatheGeometry(lq.map(([x, y]) => new THREE.Vector2(x, y)), 48), new THREE.MeshPhysicalMaterial({ color: o.liquid ?? 0x39d17a, roughness: 0.05, transmission: 0.6, thickness: 0.1, emissive: o.liquid ?? 0x39d17a, emissiveIntensity: o.glow ?? 0.25 })));
  return g;
}
export function beaker(o = {}) {
  const g = new THREE.Group(); g.add(_m(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 40, 1, true), mat('glass'), [0, 0.07, 0])); g.children[0].material.side = THREE.DoubleSide;
  g.add(_m(new THREE.CylinderGeometry(0.047, 0.047, 0.08, 40), new THREE.MeshPhysicalMaterial({ color: o.liquid ?? 0x4aa8ff, roughness: 0.05, transmission: 0.6, thickness: 0.1, emissive: o.liquid ?? 0x4aa8ff, emissiveIntensity: o.glow ?? 0.2 }), [0, 0.042, 0]));
  return g;
}
// food
export function burger() {
  const g = new THREE.Group(), bun = new THREE.MeshPhysicalMaterial({ color: 0xc98a3e, roughness: 0.5, clearcoat: 0.5, clearcoatRoughness: 0.4, sheen: 0.3 });
  const top = new THREE.SphereGeometry(0.06, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2); top.scale(1, 0.62, 1);
  g.add(_m(new THREE.CylinderGeometry(0.058, 0.055, 0.02, 32), bun, [0, 0.01, 0]));
  g.add(_m(new THREE.CylinderGeometry(0.062, 0.06, 0.018, 32), mat('concrete', { color: 0x4a2a1a, roughness: 1 }), [0, 0.03, 0]));
  g.add(_m(new THREE.CylinderGeometry(0.066, 0.064, 0.004, 6), new THREE.MeshPhysicalMaterial({ color: 0xf2b630, roughness: 0.4 }), [0, 0.041, 0], [0, 0.3, 0]));
  g.add(_m(new THREE.CylinderGeometry(0.066, 0.064, 0.006, 24), new THREE.MeshPhysicalMaterial({ color: 0x5fae3a, roughness: 0.5 }), [0, 0.046, 0]));
  g.add(_m(top, bun, [0, 0.049, 0]));
  return g;
}
export function pizzaSlice() {
  const g = new THREE.Group(), sh = new THREE.Shape(); sh.moveTo(0, 0); sh.lineTo(-0.07, 0.17); sh.quadraticCurveTo(0, 0.19, 0.07, 0.17); sh.lineTo(0, 0);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: true, bevelSize: 0.004, bevelThickness: 0.004, bevelSegments: 3 }); geo.rotateX(-Math.PI / 2);
  g.add(_m(geo, new THREE.MeshPhysicalMaterial({ color: 0xe8a84a, roughness: 0.6 })));
  const cheese = geo.clone(); cheese.scale(0.92, 0.4, 0.92); g.add(_m(cheese, new THREE.MeshPhysicalMaterial({ color: 0xf7c94a, roughness: 0.35, clearcoat: 0.6 }), [0, 0.012, -0.004]));
  const r = rnd(7); for (let i = 0; i < 5; i++) { const t = 0.2 + r() * 0.7; g.add(_m(new THREE.CylinderGeometry(0.012, 0.012, 0.004, 20), new THREE.MeshPhysicalMaterial({ color: 0xa8332a, roughness: 0.5 }), [(r() - 0.5) * 0.09 * t, 0.02, -0.17 * t])); }
  return g;
}
// car: sedan with a real side profile (extruded), glass greenhouse, wheels with rims, head/tail lights
function sideExtrude(pts, width, bevel = 0.06) {
  const sh = new THREE.Shape(); sh.moveTo(pts[0][0], pts[0][1]); for (const [x, y] of pts.slice(1)) sh.lineTo(x, y); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: width - 2 * bevel, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 6, curveSegments: 12 });
  geo.rotateY(-Math.PI / 2); geo.translate((width - 2 * bevel) / 2, 0, 0); geo.computeVertexNormals(); return geo;
}
export function car(o = {}) {
  const g = new THREE.Group(), paint = new THREE.MeshPhysicalMaterial({ color: o.color ?? 0xb3202a, metalness: 0.55, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.04 });
  g.add(_m(sideExtrude([[-2.2, 0.32], [-2.3, 0.62], [-2.25, 0.86], [-1.45, 0.98], [1.25, 1.0], [2.2, 0.86], [2.32, 0.6], [2.25, 0.32]], 1.8, 0.09), paint));
  g.add(_m(sideExtrude([[-1.4, 0.95], [-0.95, 1.4], [0.55, 1.42], [1.25, 0.97]], 1.62, 0.07), paint));
  g.add(_m(sideExtrude([[-1.33, 0.99], [-0.92, 1.36], [0.52, 1.38], [1.15, 1.0]], 1.68, 0.05), new THREE.MeshPhysicalMaterial({ color: 0x0e1620, roughness: 0.03, metalness: 0.3, clearcoat: 1 })));
  const tire = mat('rubber'), rim = mat('chrome', { roughness: 0.25 });
  for (const [x, z] of [[1, 1.45], [-1, 1.45], [1, -1.4], [-1, -1.4]]) { const w = new THREE.Group(); w.position.set(x * 0.78, 0.34, z); w.rotation.z = Math.PI / 2; g.add(w);
    w.add(_m(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 32), tire)); w.add(_m(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 24), rim));
    w.add(_m(new THREE.CylinderGeometry(0.07, 0.07, 0.27, 16), mat('metal', { color: 0x2b2d31 }))); }
  const head = new THREE.MeshPhysicalMaterial({ color: 0xffffff, emissive: 0xfff2d0, emissiveIntensity: o.lights ?? 1.2, roughness: 0.1 });
  const tail = new THREE.MeshPhysicalMaterial({ color: 0x8a0d0d, emissive: 0xff2010, emissiveIntensity: 0.8, roughness: 0.1 });
  for (const x of [-0.62, 0.62]) { g.add(_m(RB(0.4, 0.1, 0.08, 0.03), head, [x, 0.74, 2.24])); g.add(_m(RB(0.4, 0.1, 0.08, 0.03), tail, [x, 0.78, -2.26])); }
  g.add(_m(RB(1.0, 0.14, 0.06, 0.02), mat('metal', { color: 0x1a1b1e }), [0, 0.5, 2.3]));      // grille
  return g;
}
// city building facade with real windows (frames, reflective glass, some lit rooms)
export function building(o = {}) {
  const g = new THREE.Group(), w = o.w ?? 4, h = o.h ?? 8, r = rnd(o.seed ?? 3);
  g.add(_m(new THREE.BoxGeometry(w, h, 3), mat(o.wall ?? 'brick', { color: o.color ?? 0xa0533d, repeat: [w / 2, h / 2] }), [0, h / 2, -1.5]));
  const fr = mat('plastic', { color: 0xe9e6df }), cols = Math.max(1, Math.floor(w / 1.2)), rows = Math.max(1, Math.floor((h - 1) / 2));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const x = -w / 2 + (i + 0.5) * w / cols, y = 1.6 + j * 2, lit = r() < (o.lit ?? 0.35);
    g.add(_m(new THREE.BoxGeometry(0.9, 1.3, 0.08), fr, [x, y, 0.0]));
    g.add(_m(new THREE.PlaneGeometry(0.78, 1.18), new THREE.MeshPhysicalMaterial({ color: lit ? 0xffd9a0 : 0x1c2633, emissive: lit ? 0xffb860 : 0x000000, emissiveIntensity: lit ? 0.9 : 0, roughness: 0.04, metalness: lit ? 0 : 0.5, clearcoat: 1 }), [x, y, 0.045]));
    g.add(_m(new THREE.BoxGeometry(0.05, 1.18, 0.05), fr, [x, y, 0.06]));
    g.add(_m(new THREE.BoxGeometry(1.0, 0.06, 0.18), mat('concrete', { color: 0xcfc9bf }), [x, y - 0.68, 0.06]));
  }
  return g;
}
export function bookshelf(o = {}) {
  const g = new THREE.Group(), wm = mat('wood', { color: o.color ?? 0x6e4a2e }), r = rnd(o.seed ?? 8), W = 1.0, H = 1.8;
  g.add(_m(new THREE.BoxGeometry(W, H, 0.02), wm, [0, H / 2, -0.15]));
  for (const x of [-W / 2, W / 2]) g.add(_m(new THREE.BoxGeometry(0.03, H, 0.32), wm, [x, H / 2, 0]));
  for (let k = 0; k < 5; k++) { const y = 0.05 + k * 0.42; g.add(_m(new THREE.BoxGeometry(W, 0.03, 0.32), wm, [0, y, 0]));
    if (k < 4) { let x = -W / 2 + 0.03; while (x < W / 2 - 0.08) { const bw = 0.025 + r() * 0.03, bh = 0.24 + r() * 0.1;
      g.add(_m(RB(bw, bh, 0.22, 0.004), new THREE.MeshPhysicalMaterial({ color: new THREE.Color().setHSL(r(), 0.45, 0.25 + r() * 0.3), roughness: 0.7 }), [x + bw / 2, y + 0.015 + bh / 2, 0.02], [0, 0, r() < 0.1 ? 0.15 : 0])); x += bw + 0.004; } } }
  return g;
}
