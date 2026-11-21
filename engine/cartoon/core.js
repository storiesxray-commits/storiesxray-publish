// Stories X-Ray "cartoon" engine: flat 2D bean characters (cards) inside an inked, painted, lit 3D world.
// Base: cartoon-short-kit (three.js in headless Chromium) + toon.ts from github.com/mromidev/claude-animated-shorts (MIT).
// Contract with tools/render.py (same as engine/player.html): window.READY, window.SHOTS [{id,start,end}], window.renderAt(T) -> shot id.
// Each video provides videos/<id>/cartoon.js: `export default function story(E, tm)` returning
//   { shots: [{id, start}], cam(t), dof?(t), light(t), update?(t), actors(t), ui?(t), KEY? }   (t in seconds, pure functions)
import * as THREE from './lib/three.module.js';
import * as P from './paint.js';
import { Pen, person, fx, headY, LOOKS, SKINS } from './cast.js';
import { M as EASE, spline, idle, blinkAt, q, clamp, lerp, lerp3 } from './motion.js';

const W = 1080, H = 1920, FPS = 30;
const qs = new URLSearchParams(location.search), VID = qs.get('v');
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.NoToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.05, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([95, 95, 95, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (o = {}) => new THREE.MeshToonMaterial({ gradientMap: grad, ...o });
const matCache = new Map();
/** toon material from a colour, or from a painted canvas ({map: canvas, rep: [x, y], color}) ; emissive for lamps/screens */
const mat = (c, o = {}) => {
  if (typeof c === 'string' && !Object.keys(o).length) { if (!matCache.has(c)) matCache.set(c, toon({ color: c })); return matCache.get(c); }
  if (typeof c === 'string') return toon({ color: c, ...o });
  const { map, rep = [1, 1], color = '#ffffff', ...rest } = c; return toon({ map: P.tex(map, rep[0], rep[1]), color, ...rest, ...o });
};
const glow = (c, k = 1) => { const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), fog: false }); return m; };

// ---------- ink / normal-depth contract ----------
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const noInkNd = new THREE.ShaderMaterial({ // glass / glow: depth only, flat normal, never creased
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- helpers ----------
const add = (geo, m, x = 0, y = 0, z = 0, parent = scene, o = {}) => {
  const ms = new THREE.Mesh(geo, typeof m === 'string' ? mat(m) : m); ms.position.set(x, y, z); ms.castShadow = o.cast ?? true; ms.receiveShadow = o.receive ?? true;
  if (o.noink) ms.userData.nd = noInkNd; if (o.ndSkip) ms.userData.ndSkip = true; parent.add(ms); return ms;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
/** box with world-scaled UVs (1 texture tile per t metres) */
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv, dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};
const group = (x = 0, y = 0, z = 0, parent = scene) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);
const lamps = [];
/** practical light (no shadow): warm pools from pendants, window spill, neon. group = preset name that scales it. */
const lamp = (x, y, z, color = '#ffb86b', intensity = 2, distance = 6, groupName = 'warm', parent = scene) => {
  const l = new THREE.PointLight(color, intensity, distance, 1.6); l.position.set(x, y, z); parent.add(l); l.userData = { base: intensity, group: groupName }; lamps.push(l); return l;
};

// ---------- cards (2D characters and effects) ----------
const CW = 1500, CH = 2500, CM = 2.25; // canvas px, card height in metres (design 600 x 1000 -> 2.25 m)
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.55));
class Card {
  constructor() {
    this.c = document.createElement('canvas'); this.c.width = CW; this.c.height = CH; this.g = this.c.getContext('2d');
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    fn(new Pen(g)); this.t.needsUpdate = true;
  }
}
const cardsById = new Map(); let cardTint = new THREE.Color('#ffffff');
function drawActors(list) {
  for (const c of cardsById.values()) c.mesh.visible = c.blob.visible = false;
  for (const a of list) {
    if (!a) continue;
    let c = cardsById.get(a.id); if (!c) { c = new Card(); cardsById.set(a.id, c); }
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, a.face !== undefined ? a.face : Math.atan2(camera.position.x - a.x, camera.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.copy(cardTint); if (a.tint) c.mat.color.multiply(new THREE.Color(a.tint));
    c.mat.opacity = a.alpha ?? 1; c.mat.depthTest = a.overlay ? false : true;
    c.mesh.castShadow = a.shadow !== false; c.mesh.renderOrder = a.order || 2;
    if (a.fxCard) { c.mesh.userData.ndSkip = true; c.mesh.castShadow = false; } else delete c.mesh.userData.ndSkip;
    if (a.blob !== false && !a.fxCard) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? a.y) + 0.012, a.z); c.blob.scale.set(0.9 * s, 0.5 * s, 1); }
  }
}

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fsq = (m) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, m)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 2.4 },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 },
  flashCol: { value: new THREE.Color(1, 1, 1) }, sepia: { value: 0 }, grain: { value: 0.025 }, seed: { value: 0 }, inkFar: { value: 1 } };
const inkScene = fsq(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash, sepia, grain, seed, inkFar; uniform vec3 lift, gain, flashCol; varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233)) + seed) * 43758.5453); }
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(4./d, .62, 1.3);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;
      if (card) ds = 1e4;
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9);
    }
    return e * (1. - smoothstep(60.*inkFar, 300.*inkFar, d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.03,.02,.035), e*.92);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = mix(c, vec3(l*1.08, l*.9, l*.66) + vec3(.03,.015,0.), sepia);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c += (h(vUv*res) - .5) * grain;
    c = mix(c, flashCol, flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fsq(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));

// ---------- light presets ----------
const DEF_LIGHT = { sky: '#cfe3ff', ground: '#6b5a48', hemi: 1.1, sun: '#fff1d6', sunI: 2.2, az: 210, el: 48, fog: '#c9dcf0', fogNear: 40, fogFar: 500,
  skyTop: '#5d9be0', skyHor: '#cfe3f5', sat: 1.08, vig: 0.22, card: '#ffffff', lamps: {}, grain: 0.025, sepia: 0, gain: '#ffffff', lift: '#000000', shadowExt: 10 };
function applyLight(L, focus) {
  L = { ...DEF_LIGHT, ...L };
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain); inkU.lift.value.set(L.lift); inkU.vig.value = L.vig; inkU.sepia.value = L.sepia; inkU.grain.value = L.grain;
  cardTint.set(L.card);
  for (const l of lamps) l.intensity = l.userData.base * (L.lamps[l.userData.group] ?? 1);
  const az = rx(L.az), el = rx(L.el), d = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(d);
  sun.position.copy(focus).addScaledVector(d, 40); sun.target.position.copy(focus);
  const ext = L.shadowExt, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 120; sc.updateProjectionMatrix();
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else { o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; } }
  });
};

// ---------- camera keys (seconds) ----------
/** keys [{t, pos, look, fov, roll?, ease?, path?}]; holds creep forward; shake = [{t, a}] 7-frame flip-shakes; hand = handheld amount */
function camKeys(K, t, { creep = 0.035, shake = [], hand = 0.006 } = {}) {
  let c;
  if (t <= K[0].t) c = { ...K[0] };
  else if (t >= K[K.length - 1].t) c = { ...K[K.length - 1] };
  else {
    const i = K.findIndex((k, j) => t >= k.t && t <= K[j + 1].t), a = K[i], b = K[i + 1];
    const e = EASE[b.ease || 'smooth'](( t - a.t) / (b.t - a.t));
    const pos = b.path ? spline([a.pos, ...b.path, b.pos], e) : lerp3(a.pos, b.pos, e);
    c = { pos, look: lerp3(a.look, b.look, e), fov: lerp(a.fov, b.fov, e), roll: lerp(a.roll || 0, b.roll || 0, e) };
  }
  c = { ...c, pos: [...c.pos], look: [...c.look] };
  c.fov *= 1 - creep * Math.max(0, t - K[0].t) / 3; // gentle push-in during holds
  const n = (s) => Math.sin(t * 1.7 + s) * 0.6 + Math.sin(t * 3.1 + s * 2) * 0.4;
  c.look[0] += n(1) * hand; c.look[1] += n(4) * hand; c.roll = (c.roll || 0) + n(7) * hand * 20;
  for (const k of shake) { const d = (t - k.t) * FPS; if (d >= 0 && d < 7) { const s = (Math.floor(d) % 2 ? -1 : 1) * k.a * (1 - d / 7); c.look[1] += s * 0.12; c.look[0] += s * 0.08; c.roll += s * 6; } }
  return c;
}

/** keep a camera inside a room: if pos is outside [min, max] (x, y, z), slide it toward look until it is inside */
function keepInside(c, min, max) {
  const inside = (p) => p.every((v, i) => v >= min[i] && v <= max[i]);
  if (inside(c.pos)) return c;
  const p = [...c.pos];
  for (let i = 1; i <= 40 && !inside(p); i++) { const k = i / 40; for (let j = 0; j < 3; j++) p[j] = c.pos[j] + (c.look[j] - c.pos[j]) * k * 0.95; }
  const d0 = Math.hypot(...c.pos.map((v, j) => v - c.look[j])), d1 = Math.hypot(...p.map((v, j) => v - c.look[j]));
  // keep the framing: widen the lens by the distance we lost
  const fov = 2 * Math.atan(Math.tan(c.fov * Math.PI / 360) * d0 / d1) * 180 / Math.PI;
  return { ...c, pos: p, fov: Math.min(75, fov) };
}


// ---------- frame audit ----------
const ndBuf = new Uint16Array(4), half = (h) => THREE.DataUtils.fromHalfFloat(h);
const ndAt = (px, py) => { renderer.readRenderTargetPixels(rtNd, Math.max(0, Math.min(W - 1, Math.round(px))), Math.max(0, Math.min(H - 1, Math.round(H - 1 - py))), 1, 1, ndBuf);
  return { n: half(ndBuf[0]) + half(ndBuf[1]) + half(ndBuf[2]), d: half(ndBuf[3]) }; };
const proj = (v) => { const p = v.clone().project(camera); return { x: (p.x + 1) / 2 * W, y: (1 - p.y) / 2 * H, z: p.z }; };
const rectOf = (el) => { if (!el || getComputedStyle(el).opacity === '0' || !el.textContent) return null; const r = el.getBoundingClientRect(); return r.width ? r : null; };
const overlap = (a, b) => Math.max(0, Math.min(a.x1, b.right) - Math.max(a.x0, b.left)) * Math.max(0, Math.min(a.y1, b.bottom) - Math.max(a.y0, b.top));
function frameQA(T, ACT, ui) {
  const camR = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), camU = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
  const cap = rectOf(capEl), tit = rectOf(titleEl), heads = [];
  for (const a of ACT) {
    if (a.fxCard || a.head === undefined) continue;
    const c = new THREE.Vector3(a.x, a.y + a.head, a.z), r = 0.27 * (a.s || 1);
    const toC = c.clone().sub(camera.position), fwd = new THREE.Vector3(); camera.getWorldDirection(fwd);
    if (toC.dot(fwd) < 0.05) { heads.push({ id: a.id, vis: 0, h: 0 }); continue; }
    const P = [c.clone().addScaledVector(camR, -r).addScaledVector(camU, -r), c.clone().addScaledVector(camR, r).addScaledVector(camU, r)].map(proj);
    const b = { x0: Math.min(P[0].x, P[1].x), x1: Math.max(P[0].x, P[1].x), y0: Math.min(P[0].y, P[1].y), y1: Math.max(P[0].y, P[1].y) };
    const area = (b.x1 - b.x0) * (b.y1 - b.y0) || 1;
    const vis = Math.max(0, Math.min(b.x1, W) - Math.max(b.x0, 0)) * Math.max(0, Math.min(b.y1, H) - Math.max(b.y0, 0)) / area;
    const ctr = proj(c), dist = toC.length();
    let occ = false; if (vis > 0.5 && ctr.x > 0 && ctr.x < W && ctr.y > 0 && ctr.y < H) { const s = ndAt(ctr.x, ctr.y); occ = s.d > 0 && s.d < dist - 0.35 && s.n > 0.01; }
    heads.push({ id: a.id, vis: +vis.toFixed(2), h: Math.round(b.y1 - b.y0), edgeOk: a.edgeOk || undefined, main: a.main || undefined, occ: occ || undefined,
      cap: cap && vis > 0.3 ? +(overlap(b, cap) / area).toFixed(2) : 0, title: tit && vis > 0.3 ? +(overlap(b, tit) / area).toFixed(2) : 0 });
  }
  let near = 0, voids = 0, n = 0;
  if (Math.round(T * FPS - 0.5) % 2 === 0) for (let gy = 1; gy < 10; gy++) for (let gx = 1; gx < 6; gx++) { const s = ndAt(gx * W / 6, gy * H / 10); n++; if (s.d <= 0 && s.n < 0.01) voids++; else if (s.d < 0.3) near++; }
  return { t: +T.toFixed(3), cam: camera.position.toArray().map((v) => +v.toFixed(3)), heads, near: n ? +(near / n).toFixed(3) : 0, void: n ? +(voids / n).toFixed(3) : 0, exterior: !!ui.exterior };
}

// ---------- engine API handed to the story ----------
const E = { keepInside, THREE, scene, camera, P, mat, glow, toon, add, box, tbox, group, lamp, rx, person, fx, headY, LOOKS, SKINS, EASE, spline, idle, blinkAt, q, clamp, lerp, lerp3, camKeys, FPS,
  /** card actor helper: a person card. o: {id, look, x, y, z, s, pose:{...person opts}, yaw, tint, blob} */
  actor(o) { const L = typeof o.look === 'string' ? LOOKS[o.look] : o.look, pose = o.pose || {};
    const key = o.id + JSON.stringify(pose, (k, v) => typeof v === 'number' ? Math.round(v * 100) / 100 : v);
    return { id: o.id, key, x: o.x, y: o.y ?? 0, z: o.z, s: o.s, yaw: o.yaw, face: o.face, tint: o.tint, blob: o.blob, ground: o.ground, roll: o.roll, order: o.order, flip: o.flip,
      head: (975 - headY(L, pose.mode || 'stand', o.seed ?? 3)) * 0.00225 * (o.s || 1), edgeOk: !!o.edgeOk, main: !!o.main,
      draw: (p) => person(p, L, { seed: o.seed ?? 3, ...pose }) }; },
  /** 2D effect card. o: {id, x, y, z, s, kind, args, key} */
  fxCard(o) { return { id: o.id, key: o.key ?? (o.kind + JSON.stringify(o.args || []).slice(0, 60)), x: o.x, y: o.y, z: o.z, s: o.s, fxCard: true, blob: false, alpha: o.alpha, order: 5, overlay: o.overlay,
      draw: (p) => fx[o.kind](p, ...(o.args || [])) }; },
  /** life for a person: idle sway + blinks, merged into its pose */
  alive(t, seed, pose = {}) { const f = t * FPS, i = idle(f, seed); return { blink: blinkAt(f, seed), tilt: q(i.tilt, 1), headTilt: q(i.headTilt + (pose.headTilt || 0), 1), bob: q(i.bob, 3), ...pose, headTilt: q(i.headTilt + (pose.headTilt || 0), 1) }; },
};
window.E = E;

// ---------- story ----------
const timing = await (await fetch(`../../out/${VID}/timing.json`)).json();
const sen = timing.sentences;
const tm = { total: timing.total + 0.12, sen, st: (i) => sen[i - 1].start - 0.09, wd: (i, j) => sen[i - 1].words[j].s, we: (i, j) => sen[i - 1].words[j].e };
const mod = await import(`../../videos/${VID}/cartoon.js`);
const S = mod.default(E, tm);
const END = tm.total;
const shots = S.shots.map((s, i) => ({ id: s.id, start: s.start, end: i + 1 < S.shots.length ? S.shots[i + 1].start : END }));
window.SHOTS = shots;

// ---------- captions (channel style: Inter 900, white, black stroke, keywords yellow, max 3 words / 12 letters) ----------
const clean = qs.get('clean');
const capEl = document.getElementById('cap'), titleEl = document.getElementById('title');
if (clean) capEl.style.display = titleEl.style.display = 'none';
const KEY = new Set((S.KEY || []).map((k) => k.toLowerCase()));
const chunks = [];
for (const s of sen) { let cur = [];
  const flush = () => { if (cur.length) { chunks.push({ s: cur[0].s, e: cur[cur.length - 1].e, words: cur.map((w) => w.w) }); cur = []; } };
  for (const w of s.words) { if (cur.length && (cur.map((x) => x.w).join(' ') + ' ' + w.w).replace(/[.,!?…]/g, '').length > 12) flush(); cur.push(w); if (cur.length >= 3 || /[,.!?]$/.test(w.w)) flush(); }
  flush(); }
for (let i = 0; i < chunks.length - 1; i++) if (chunks[i + 1].s - chunks[i].e < 0.4) chunks[i].e = chunks[i + 1].s;
// a caption never carries over a cut (it ends at the cut if it would spill into the next shot)
for (const c of chunks) { const cut = shots.find((sh) => sh.start > c.e - 0.4 && sh.start < c.e && sh.start > c.s + 0.25); if (cut) c.e = cut.start; }
const mctx = document.createElement('canvas').getContext('2d');
function fit(el, maxW) { el.style.fontSize = ''; const fs = parseFloat(getComputedStyle(el).fontSize); mctx.font = `900 ${fs}px Inter`; const w = mctx.measureText(el.textContent.toUpperCase()).width + 36; if (w > maxW) el.style.fontSize = (fs * maxW / w) + 'px'; }
const back = (t) => EASE.back(t);

// ---------- frame ----------
const tmpV = new THREE.Vector3();
window.renderAt = (T) => {
  const sh = shots.find((s) => T >= s.start && T < s.end) || shots[shots.length - 1];
  const t = T;
  S.update && S.update(t);
  const C = S.cam(t);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.near = C.near || 0.05; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  applyLight(S.light(t), tmpV.set(...(C.shadowAt || C.look)));
  const ACT = S.actors(t).filter(Boolean); drawActors(ACT);
  sky.position.copy(camera.position);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  const D = S.dof ? S.dof(t) : { focus: 5, cinf: 0 };
  const ui = S.ui ? S.ui(t) : {};
  inkU.flash.value = ui.flash || C.flash || 0; inkU.flashCol.value.set(ui.flashCol || '#ffffff'); inkU.seed.value = (T * 37.1) % 100; inkU.inkFar.value = C.inkFar || 1;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  // titles (top band, used sparingly: hook and key beats)
  if (ui.title) { titleEl.innerHTML = ui.title; titleEl.style.opacity = 1; for (const sp of titleEl.querySelectorAll('span')) fit(sp, 800);
    const k = ui.titleK ?? 1; titleEl.style.transform = `scale(${0.55 + 0.45 * back(k)}) rotate(${-2 + 0.6 * Math.sin(T * 2)}deg)`; }
  else titleEl.style.opacity = 0;
  // captions: first one visible from frame 0 (muted viewers); position per shot so the action stays visible
  capEl.style.top = (ui.capY ?? 1290) + 'px';
  const ch = chunks.find((c) => T >= c.s - 0.03 && T < c.e - 0.03) || (chunks.length && T < chunks[0].s ? chunks[0] : null);
  if (ch && !ui.noCap) { const k = T < ch.s ? 1 : (T - ch.s + 0.03) / 0.12;
    capEl.innerHTML = ch.words.map((w) => { const b = w.replace(/[.,:!…]/g, '').replace(/\.\.\.$/, ''); return KEY.has(b.toLowerCase().replace(/[?]/g, '')) ? `<span class="y">${b}</span>` : b; }).join(' ');
    fit(capEl, 760); capEl.style.opacity = 1; capEl.style.transform = `scale(${0.82 + 0.18 * back(k)})`; }
  else capEl.style.opacity = 0;
  // ---------- automatic frame audit (tools/render.py stores it, tools/qa.py judges it) ----------
  window.QA_FRAME = frameQA(T, ACT, ui);
  return sh.id;
};
window.renderFrame = (f) => window.renderAt((f + 0.5) / FPS);
window.READY = true; window.ready = true;
