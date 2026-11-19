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
