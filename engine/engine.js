import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE, RoundedBoxGeometry };

export const W = 1080, H = 1920;
export const C = {
  skin: 0xd2bfae, hair: 0x2a2523, tee: 0xf4f1ea, jeans: 0x3d5f94, shoe: 0xf4f1ea,
  suit: 0xf1efe8, suitGrey: 0x8b96a3, steel: 0x7f8c99, steelDark: 0x4e5964,
  cyan: 0x22d3ee, red: 0xff3b30, yellow: 0xffd60a, bg: 0x0a0e15,
};

// ---------- helpers ----------
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
export const eio = t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eout = t => 1 - Math.pow(1 - clamp(t), 3);
export const back = t => { t = clamp(t); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
export function rnd(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

// ---------- toon material + outline ----------
const grad = (() => {
  const d = new Uint8Array([105, 105, 105, 255, 190, 190, 190, 255, 255, 255, 255, 255]);
  const t = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
})();
export function toon(color, o = {}) {
  return new THREE.MeshToonMaterial({ color, gradientMap: grad, ...o });
}
export function outlineMat(px = 5, color = 0x0b0b0f) {
  return new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true,
    uniforms: { px: { value: px }, col: { value: new THREE.Color(color) }, op: { value: 1 } },
    vertexShader: `uniform float px; void main(){
      vec4 c = projectionMatrix*modelViewMatrix*vec4(position,1.);
      vec3 n = normalize(normalMatrix*normal);
      vec2 d = normalize(n.xy + vec2(1e-5));
      c.xy += d * px * 2.0 / vec2(${W}.0,${H}.0) * c.w;
      gl_Position = c; }`,
    fragmentShader: `uniform vec3 col; uniform float op; void main(){ gl_FragColor = vec4(col, op); }`,
  });
}
// mesh with toon fill + ink outline
export function M(geo, color, o = {}) {
  const mat = o.mat || toon(color, o.matOpts || {});
  const m = new THREE.Mesh(geo, mat);
  m.castShadow = o.shadow !== false; m.receiveShadow = o.receive !== false;
  if (o.outline !== false) {
    const ol = new THREE.Mesh(geo, outlineMat(o.px || 5));
    ol.userData.outline = true; m.add(ol);
  }
  return m;
}
// x-ray shell material (fresnel, additive)
export function fresnel(color = C.cyan, power = 2.2, gain = 1.0, base = 0.03) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.FrontSide,
    uniforms: { col: { value: new THREE.Color(color) }, p: { value: power }, g: { value: gain }, b: { value: base }, op: { value: 1 } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){
      vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz);
      gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 col; uniform float p; uniform float g; uniform float b; uniform float op; varying vec3 vN; varying vec3 vV;
      void main(){ float f = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), p);
      float band = smoothstep(0.35,0.4,f)*0.35 + f;
      gl_FragColor = vec4(col*(b + band*g)*op, 1.0); }`,
  });
}
export function glowMat(color, opacity = 0.9) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity });
}
export function addMat(color, opacity = 0.35) {
  return new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false });
}
// soft additive sprite (fake bloom)
const spriteTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c);
})();
export function halo(color, size, opacity = 0.6) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: spriteTex, color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
  s.scale.setScalar(size); return s;
}
export function setOpacity(root, op) {
  root.traverse(o => {
    if (!o.isMesh) return; const m = o.material;
    if (m.uniforms && m.uniforms.op) m.uniforms.op.value = op;
    else { m.transparent = true; m.opacity = op; }
    o.visible = op > 0.01;
  });
}

// ---------- character: "the Subject" ----------
export function Subject(o = {}) {
  if (globalThis.XR_PRO_SUBJECT && !o.suit && !o.xray && !o.toon) return globalThis.XR_PRO_SUBJECT(o);  // render style 'pro' (engine/character.js)
  const suit = !!o.suit, xr = !!o.xray;
  const fm = xr ? fresnel(C.cyan, 2.0, 0.9, 0.02) : null;
  const mk = (geo, color) => xr ? new THREE.Mesh(geo, fm) : M(geo, color, { px: o.px || 5 });
  const k = suit ? 1.45 : 1;                         // limb fatness
  const col = suit
    ? { torso: C.suit, upper: C.suit, fore: C.suit, hand: C.suitGrey, thigh: C.suit, shin: C.suit, shoe: C.suitGrey }
    : { torso: C.tee, upper: C.tee, fore: C.skin, hand: C.skin, thigh: C.jeans, shin: C.jeans, shoe: C.shoe };
  Object.assign(col, o.col || {});
  const g = new THREE.Group(); const J = { root: g };
  const hips = J.hips = new THREE.Group(); hips.position.y = 0.95; g.add(hips);
  const pelvis = mk(new THREE.SphereGeometry(0.17 * (suit ? 1.2 : 1), 24, 16), col.thigh); pelvis.scale.set(1.08, 0.72, 0.82); hips.add(pelvis);
  const chest = J.chest = new THREE.Group(); chest.position.y = 0.06; hips.add(chest);
  const torso = mk(new THREE.CapsuleGeometry(0.165 * (suit ? 1.22 : 1), 0.3, 8, 24), col.torso);
  torso.position.y = 0.26; torso.scale.set(1.14, 1, 0.8); chest.add(torso); J.torso = torso;
  const neck = mk(new THREE.CylinderGeometry(0.05, 0.058, 0.1, 16), suit ? C.suitGrey : C.skin); neck.position.y = 0.56; chest.add(neck);
  if (suit && !xr) {
    const ring = M(new THREE.TorusGeometry(0.15, 0.035, 12, 32), C.suitGrey); ring.rotation.x = Math.PI / 2; ring.position.y = 0.55; chest.add(ring);
    const valve = M(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 20), C.suitGrey); valve.rotation.x = Math.PI / 2; valve.position.set(0.07, 0.3, 0.165); chest.add(valve); J.valve = valve;
    const pack = M(new RoundedBoxGeometry(0.2, 0.14, 0.05, 3, 0.02), C.suitGrey); pack.position.set(-0.07, 0.3, 0.155); chest.add(pack);
    const d1 = M(new THREE.SphereGeometry(0.014, 10, 8), C.red, { outline: false }); d1.position.set(-0.12, 0.33, 0.185); chest.add(d1);
    const d2 = M(new THREE.SphereGeometry(0.014, 10, 8), C.yellow, { outline: false }); d2.position.set(-0.08, 0.33, 0.185); chest.add(d2);
  }
  // head
  const head = J.head = new THREE.Group(); head.position.y = 0.7; chest.add(head);
  const skull = mk(new THREE.SphereGeometry(0.155, 32, 24), C.skin); skull.scale.set(0.95, 1.06, 1); head.add(skull); J.skull = skull;
  if (!xr) {
    const hair = M(new THREE.SphereGeometry(0.162, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.46), o.hair || C.hair);
    hair.scale.set(0.97, 1.08, 1.03); hair.rotation.x = -0.32; hair.position.y = 0.012; head.add(hair);
    for (const s of [-1, 1]) {
      const ear = M(new THREE.SphereGeometry(0.03, 12, 10), C.skin, { px: 3 }); ear.position.set(s * 0.148, -0.01, 0); ear.scale.set(0.5, 1, 0.8); head.add(ear);
    }
    if (o.elder) {
      const bun = M(new THREE.SphereGeometry(0.075, 16, 12), o.hair || C.hair); bun.position.set(0, 0.13, -0.11); head.add(bun);
      for (const s of [-1, 1]) { const gl = new THREE.Mesh(new THREE.TorusGeometry(0.047, 0.007, 8, 24), new THREE.MeshBasicMaterial({ color: 0x1a1a1f })); gl.position.set(s * 0.06, 0.012, 0.15); gl.rotation.y = s * 0.3; head.add(gl); }
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.007, 0.007), new THREE.MeshBasicMaterial({ color: 0x1a1a1f })); br.position.set(0, 0.02, 0.163); head.add(br);
    }
    J.eyes = []; J.brows = [];
    for (const s of [-1, 1]) {
      const eye = new THREE.Group(); eye.position.set(s * 0.058, 0.012, 0.136); eye.rotation.y = s * 0.33; head.add(eye);
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.034, 20, 14), new THREE.MeshBasicMaterial({ color: 0xffffff })); white.scale.set(1, 1, 0.35); eye.add(white);
      const ring = new THREE.Mesh(new THREE.SphereGeometry(0.039, 20, 14), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); ring.scale.set(1, 1, 0.2); ring.position.z = -0.004; eye.add(ring);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.016, 14, 10), new THREE.MeshBasicMaterial({ color: 0x0b0b0f })); pupil.scale.z = 0.4; pupil.position.z = 0.012; eye.add(pupil);
      eye.userData.pupil = pupil; J.eyes.push(eye);
      const brow = new THREE.Mesh(new RoundedBoxGeometry(0.052, 0.012, 0.012, 2, 0.005), new THREE.MeshBasicMaterial({ color: C.hair }));
      brow.position.set(s * 0.058, 0.066, 0.138); brow.rotation.y = s * 0.33; head.add(brow); if (o.hair) brow.material.color.setHex(0x8a8f96); brow.userData.s = s; J.brows.push(brow);
    }
    const nose = M(new THREE.SphereGeometry(0.02, 12, 10), 0xc4ae9c, { px: 2.5 }); nose.position.set(0, -0.025, 0.152); nose.scale.set(0.9, 1, 1); head.add(nose);
    const mouth = J.mouth = new THREE.Mesh(new THREE.SphereGeometry(0.03, 20, 14), new THREE.MeshBasicMaterial({ color: 0x1a0e0e }));
    mouth.position.set(0, -0.07, 0.137); mouth.scale.set(1, 0.3, 0.25); head.add(mouth);
    if (suit) {
      const glass = new THREE.Mesh(new THREE.SphereGeometry(0.235, 32, 24), new THREE.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0.16, depthWrite: false }));
      glass.position.y = 0.02; glass.renderOrder = 5; head.add(glass);
      const gol = new THREE.Mesh(glass.geometry, outlineMat(5)); gol.position.y = 0.02; head.add(gol);
      const gin = new THREE.Mesh(new THREE.SphereGeometry(0.232, 32, 24), new THREE.MeshBasicMaterial({ color: 0x9db3c6, side: THREE.BackSide })); gin.position.y = 0.02; head.add(gin);
      const hl = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.012, 6, 24, 0.9), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, depthTest: false }));
      hl.position.set(0, 0.02, 0.09); hl.rotation.set(0.2, -0.5, 1.9); hl.renderOrder = 6; head.add(hl);
    }
  }
  // arms
  J.arm = {}; J.leg = {};
  for (const [name, s] of [['L', -1], ['R', 1]]) {
    const a = new THREE.Group(); a.position.set(s * 0.235 * (suit ? 1.15 : 1), 0.44, 0); chest.add(a);
    const sh = mk(new THREE.SphereGeometry(0.068 * k, 16, 12), col.upper); a.add(sh);
    const u = mk(new THREE.CapsuleGeometry(0.052 * k, 0.2, 6, 16), col.upper); u.position.y = -0.12; a.add(u);
    const b = new THREE.Group(); b.position.y = -0.25; a.add(b);
    const f = mk(new THREE.CapsuleGeometry(0.045 * k, 0.19, 6, 16), col.fore); f.position.y = -0.11; b.add(f);
    const hand = mk(new THREE.SphereGeometry(0.056 * (suit ? 1.25 : 1), 16, 12), col.hand); hand.position.y = -0.26; hand.scale.set(0.85, 1.1, 0.7); b.add(hand);
    J.arm[name] = { a, b, hand };
    const l = new THREE.Group(); l.position.set(s * 0.09 * (suit ? 1.2 : 1), -0.03, 0); hips.add(l);
    const th = mk(new THREE.CapsuleGeometry(0.078 * k * 0.92, 0.3, 6, 16), col.thigh); th.position.y = -0.2; l.add(th);
    const kn = new THREE.Group(); kn.position.y = -0.42; l.add(kn);
    const shn = mk(new THREE.CapsuleGeometry(0.062 * k * 0.95, 0.3, 6, 16), col.shin); shn.position.y = -0.2; kn.add(shn);
    const shoe = mk(new RoundedBoxGeometry(0.11 * (suit ? 1.3 : 1), 0.085, 0.25, 4, 0.04), col.shoe); shoe.position.set(0, -0.44, 0.045); kn.add(shoe);
    J.leg[name] = { l, kn };
  }
  g.userData.J = J;
  // expression helpers
  g.userData.face = ({ open = 0.3, wide = 0, closed = 0, lookX = 0, lookY = 0 } = {}) => {
    if (xr) return;
    J.mouth.scale.set(lerp(1, 0.75, open), lerp(0.18, 1.15, open), 0.25);
    for (const e of J.eyes) {
      e.scale.set(1 + wide * 0.22, (1 + wide * 0.3) * lerp(1, 0.1, closed), 1);
      e.userData.pupil.position.x = lookX * 0.012; e.userData.pupil.position.y = lookY * 0.012;
      e.userData.pupil.scale.setScalar(lerp(1, 0.75, wide)); e.userData.pupil.scale.z = 0.4;
    }
    for (const b of J.brows) { b.position.y = 0.066 + wide * 0.022 - closed * 0.012; b.rotation.z = b.userData.s * (-0.12 * wide + 0.1 * closed); }
  };
  g.userData.face();
  return g;
}
// floating (zero-g) pose
export function poseFloat(g, t, amp = 1) {
  const J = g.userData.J, s = Math.sin, a = amp;
  J.arm.L.a.rotation.set(0.2 * s(t * 0.9) * a, 0, -1.25 + 0.12 * s(t * 0.7));
  J.arm.R.a.rotation.set(-0.2 * s(t * 0.8 + 1) * a, 0, 1.05 + 0.12 * s(t * 0.6 + 2));
  J.arm.L.b.rotation.set(-0.5 + 0.15 * s(t), 0, -0.5); J.arm.R.b.rotation.set(-0.7 + 0.15 * s(t + 1), 0, 0.35);
  J.leg.L.l.rotation.set(-0.45 + 0.1 * s(t * 0.6), 0, -0.22); J.leg.R.l.rotation.set(0.25 + 0.1 * s(t * 0.5 + 1), 0, 0.2);
  J.leg.L.kn.rotation.x = 0.85 + 0.1 * s(t * 0.7); J.leg.R.kn.rotation.x = 0.55 + 0.1 * s(t * 0.6 + 2);
  J.head.rotation.set(-0.12 + 0.05 * s(t * 0.8), 0.08 * s(t * 0.5), 0.05 * s(t * 0.6));
  J.chest.rotation.set(0.06 * s(t * 0.5), 0, 0.04 * s(t * 0.4));
}
export function poseStand(g, t = 0) {
  const J = g.userData.J, s = Math.sin;
  J.arm.L.a.rotation.set(0, 0, -0.16 + 0.02 * s(t)); J.arm.R.a.rotation.set(0, 0, 0.16 - 0.02 * s(t));
  J.arm.L.b.rotation.set(-0.12, 0, 0); J.arm.R.b.rotation.set(-0.12, 0, 0);
  J.leg.L.l.rotation.set(0, 0, -0.04); J.leg.R.l.rotation.set(0, 0, 0.04); J.leg.L.kn.rotation.x = 0; J.leg.R.kn.rotation.x = 0;
  J.head.rotation.set(0, 0, 0); J.chest.rotation.set(0, 0, 0); J.hips.position.y = 0.95; J.hips.rotation.set(0, 0, 0);
}

// ---------- common scene bits ----------
export function lights(scene, o = {}) {
  const hemi = new THREE.HemisphereLight(o.sky ?? 0xbfd6ff, o.ground ?? 0x20242c, o.hemi ?? 0.9); scene.add(hemi);
  const key = new THREE.DirectionalLight(o.key ?? 0xfff0dc, o.keyI ?? 2.3); key.position.set(...(o.keyPos || [-3, 4, 4])); scene.add(key);
  const rim = new THREE.DirectionalLight(o.rim ?? C.cyan, o.rimI ?? 1.1); rim.position.set(...(o.rimPos || [2.5, 2, -4])); scene.add(rim);
  if (o.shadow) {
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); const c = key.shadow.camera; const r = o.shadowR || 4;
    c.left = -r; c.right = r; c.top = r; c.bottom = -r; c.near = 0.5; c.far = 30; key.shadow.bias = -0.0015; key.shadow.normalBias = 0.03; key.shadow.radius = 5;
  }
  return { hemi, key, rim };
}
export function stars(n = 500, R = 60, seed = 7) {
  const r = rnd(seed), pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, q = Math.sqrt(1 - u * u);
    pos[i * 3] = R * q * Math.cos(th); pos[i * 3 + 1] = R * u; pos[i * 3 + 2] = R * q * Math.sin(th);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const grp = new THREE.Group();
  grp.add(new THREE.Points(g, new THREE.PointsMaterial({ map: spriteTex, color: 0xffffff, size: 13, sizeAttenuation: false, transparent: true, depthWrite: false, opacity: 1 })));
  const g2 = g.clone(); g2.rotateX(1.3); g2.rotateY(0.7);
  grp.add(new THREE.Points(g2, new THREE.PointsMaterial({ map: spriteTex, color: 0x9fdcff, size: 8, sizeAttenuation: false, transparent: true, depthWrite: false, opacity: 0.9 })));
  return grp;
}
export function earth(R = 9) {
  const g = new THREE.Group(), r = rnd(21);
  g.add(M(new THREE.SphereGeometry(R, 64, 48), 0x2f7fe0, { px: 6, shadow: false }));
  const land = toon(0x4fbf6b), cloud = toon(0xffffff);
  const blob = (mat, n, smin, smax, lift) => {
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1, th = r() * Math.PI * 2, q = Math.sqrt(1 - u * u);
      const d = new THREE.Vector3(q * Math.cos(th), u, q * Math.sin(th));
      const cl = 2 + Math.floor(r() * 3);
      for (let j = 0; j < cl; j++) {
        const dd = d.clone().add(new THREE.Vector3(r() - .5, r() - .5, r() - .5).multiplyScalar(0.22)).normalize();
        const m = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), mat); const s = lerp(smin, smax, r()) * R;
        m.scale.set(s, s * lerp(0.5, 1, r()), R * 0.02); m.position.copy(dd.clone().multiplyScalar(R * lift)); m.lookAt(dd.clone().multiplyScalar(R * 3)); m.rotateZ(r() * 3);
        g.add(m);
      }
    }
  };
  blob(land, 38, 0.08, 0.17, 1.004); blob(cloud, 30, 0.03, 0.09, 1.02);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.045, 48, 32), fresnel(0x6fd6ff, 1.6, 0.9, 0.0)); g.add(atm);
  return g;
}
export function shake(cam, t, t0, amp = 0.03, dur = 0.22) {
  const k = t - t0; if (k < 0 || k > dur) return; const f = 1 - k / dur;
  cam.position.x += Math.sin(k * 190) * amp * f; cam.position.y += Math.cos(k * 230) * amp * f;
}
