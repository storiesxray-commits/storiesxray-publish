// Stories X-Ray — "pro" character (Subject v2). Same skeleton and API as Subject() in engine.js
// (J.hips, J.chest, J.head, J.arm.L/R.{a,b,hand}, J.leg.L/R.{l,kn}, J.eyes[].userData.pupil, J.brows, J.mouth, J.skull, J.torso, userData.face)
// so every existing pose and scene works, but with a believable stylized-3D human: shaped head and jaw, eyelids, irises with
// catchlights, lips, nose, real ears, hair styles, fingers, sleeves, collar, belt, sneakers, PBR skin/cloth with soft sheen.
// Generic people only (no likeness of real persons). Options (all optional):
//   gender 'm'|'f', skin (hex), hair (hex), hairStyle 'short'|'side'|'buzz'|'curly'|'long'|'bob'|'ponytail'|'bun'|'bald',
//   eyes (hex iris), beard true, elder true (grey bun + glasses), seed (int: picks skin/hair/eyes/style when not given),
//   col {torso, upper, fore, hand, thigh, shin, shoe} like Subject (fore === torso color -> long sleeves).
import { THREE, RoundedBoxGeometry, C, lerp, clamp, rnd } from './engine.js';

const SKINS = [0xf1c9a5, 0xe0ac86, 0xc68a62, 0xa86b45, 0x7d4a2c, 0x5a341f];
const HAIRS = [0x1d1612, 0x2e2018, 0x4a3020, 0x6b4428, 0x9a6a3a, 0xc9a36a, 0x2a2a2e];
const IRIS = [0x5a3a22, 0x3d2a1c, 0x3f6e8f, 0x4e7a52, 0x6b5232];

const texCache = {};
function canvasTex(key, w, h, draw, repeat) {
  if (texCache[key]) return texCache[key];
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; if (repeat) t.repeat.set(...repeat); t.anisotropy = 8;
  return (texCache[key] = t);
}
// fabric weave (bump), hair strands (bump), skin micro-noise (bump)
const weave = () => canvasTex('weave', 256, 256, (x, w, h) => { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h);
  for (let i = 0; i < w; i += 4) { x.fillStyle = i % 8 ? '#8c8c8c' : '#747474'; x.fillRect(i, 0, 2, h); x.fillRect(0, i, w, 2); }
  const r = rnd(5); for (let i = 0; i < 2500; i++) { const v = 100 + r() * 60 | 0; x.fillStyle = `rgb(${v},${v},${v})`; x.fillRect(r() * w, r() * h, 1, 1); } }, [6, 6]);
const strands = () => canvasTex('strands', 256, 256, (x, w, h) => { x.fillStyle = '#7a7a7a'; x.fillRect(0, 0, w, h); const r = rnd(9);
  for (let i = 0; i < 900; i++) { const v = 60 + r() * 140 | 0; x.strokeStyle = `rgba(${v},${v},${v},.55)`; x.lineWidth = 0.6 + r() * 1.4; const sx = r() * w; x.beginPath(); x.moveTo(sx, 0); x.bezierCurveTo(sx + (r() - .5) * 20, h * .3, sx + (r() - .5) * 20, h * .7, sx + (r() - .5) * 14, h); x.stroke(); } }, [3, 1]);
const pores = () => canvasTex('pores', 256, 256, (x, w, h) => { x.fillStyle = '#808080'; x.fillRect(0, 0, w, h); const r = rnd(3);
  for (let i = 0; i < 6000; i++) { const v = 110 + r() * 40 | 0; x.fillStyle = `rgba(${v},${v},${v},.7)`; x.fillRect(r() * w, r() * h, 1 + r(), 1 + r()); } }, [4, 4]);

function skinMat(c) {
  const col = new THREE.Color(c);
  return new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.52, metalness: 0, bumpMap: pores(), bumpScale: 0.25,
    sheen: 0.45, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xff8a70).multiplyScalar(0.55), clearcoat: 0.08, clearcoatRoughness: 0.6 });
}
function clothMat(c, o = {}) {
  return new THREE.MeshPhysicalMaterial({ color: c, roughness: o.rough ?? 0.82, metalness: 0, bumpMap: weave(), bumpScale: o.bump ?? 0.35,
    sheen: 0.6, sheenRoughness: 0.8, sheenColor: new THREE.Color(c).lerp(new THREE.Color(0xffffff), 0.35) });
}
function hairMat(c) {
  return new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.42, metalness: 0, bumpMap: strands(), bumpScale: 0.9,
    sheen: 0.8, sheenRoughness: 0.35, sheenColor: new THREE.Color(c).lerp(new THREE.Color(0xffffff), 0.45), clearcoat: 0.25, clearcoatRoughness: 0.35 });
}
const shoeMat = c => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.6, clearcoat: 0.2, clearcoatRoughness: 0.5 });
const plain = (c, o = {}) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.5, ...o });

function mesh(geo, mat, parent, p, s, r) {
  const m = new THREE.Mesh(geo, mat); m.castShadow = m.receiveShadow = true;
  if (p) m.position.set(...p); if (s) m.scale.set(...s); if (r) m.rotation.set(...r); if (parent) parent.add(m); return m;
}
// tapered limb segment from y=0 down to y=-len, radii r0 (top) r1 (bottom), rounded ends
function limb(parent, len, r0, r1, mat, y0 = 0) {
  const g = new THREE.Group(); g.position.y = y0; parent.add(g);
  mesh(new THREE.CylinderGeometry(r0, r1, len, 28, 1, true), mat, g, [0, -len / 2, 0]);
  mesh(new THREE.SphereGeometry(r0, 24, 16), mat, g, [0, 0, 0]);
  mesh(new THREE.SphereGeometry(r1, 24, 16), mat, g, [0, -len, 0]);
  return g;
}
function lathe(points, mat, parent, pos, scale) {
  const geo = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), 48);
  return mesh(geo, mat, parent, pos, scale);
}
// egg head with narrower jaw and chin, flatter sides
function headGeo(f) {
  const g = new THREE.SphereGeometry(0.15, 64, 48); const p = g.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const y = v.y / 0.15, z = v.z / 0.15;
    const low = clamp(-y), jaw = lerp(1, f ? 0.7 : 0.76, Math.pow(low, 1.4));
    v.x *= 0.9 * jaw; v.z *= 1.0 * lerp(1, 0.9, low * (z < 0 ? 1 : 0.3));
    if (z > 0) v.z += 0.012 * Math.exp(-Math.pow((y + 0.78) / 0.18, 2)) * z;        // chin
    if (z > 0) v.z -= 0.01 * Math.exp(-Math.pow((y - 0.05) / 0.18, 2)) * Math.pow(Math.abs(v.x / 0.13), 2) * 0; // keep
    v.y *= 1.1; if (y > 0.2) v.y += 0.008 * (y - 0.2);
    if (v.z > 0) for (const ex of [-0.049, 0.049]) {        // eye sockets so the eyeballs sit in the face, not on it
      const d2 = ((v.x - ex) ** 2) / (0.03 ** 2) + ((v.y - 0.016) ** 2) / (0.026 ** 2);
      v.z -= 0.016 * Math.exp(-d2);
    }
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals(); return g;
}

export function SubjectPro(o = {}) {
  const r = rnd(o.seed ?? 11);
  const f = (o.gender || (o.seed != null && r() < 0.5 ? 'f' : 'm')) === 'f';
  const skinC = o.skin ?? (o.seed != null ? SKINS[(r() * SKINS.length) | 0] : 0xe3b48f);
  const hairC = o.elder ? 0xc9c6c2 : (o.hair ?? (o.seed != null ? HAIRS[(r() * HAIRS.length) | 0] : 0x2a1d16));
  const style = o.hairStyle || (o.elder ? 'bun' : f ? ['long', 'bob', 'ponytail', 'bun', 'curly'][(r() * 5) | 0] : ['short', 'side', 'buzz', 'curly', 'short'][(r() * 5) | 0]);
  const irisC = o.eyes ?? IRIS[(r() * IRIS.length) | 0];
  const col = { torso: C.tee, upper: C.tee, fore: C.skin, hand: C.skin, thigh: C.jeans, shin: C.jeans, shoe: C.shoe, ...(o.col || {}) };
  const SK = skinMat(skinC), HAIR = hairMat(hairC);
  const isSkin = c => c === C.skin;
  const shirt = clothMat(col.torso), sleeveM = clothMat(col.upper), pants = clothMat(col.thigh, { rough: 0.9, bump: 0.5 }), shinM = clothMat(col.shin, { rough: 0.9, bump: 0.5 });
  const foreM = isSkin(col.fore) ? SK : clothMat(col.fore), handM = isSkin(col.hand) ? SK : plain(col.hand, { roughness: 0.6 });
  const longSleeve = !isSkin(col.fore);

  const g = new THREE.Group(); const J = { root: g };
  const hips = J.hips = new THREE.Group(); hips.position.y = 0.95; g.add(hips);
  // pelvis + belt
  lathe([[0, -0.13], [0.12, -0.12], [0.165, -0.06], [f ? 0.178 : 0.17, 0.02], [0.165, 0.09], [0, 0.1]], pants, hips, [0, 0, 0], [1, 1, 0.74]);
  mesh(new THREE.TorusGeometry(0.165, 0.016, 10, 48), plain(0x1d1a18, { roughness: 0.35, clearcoat: 0.6 }), hips, [0, 0.07, 0], [1, 0.74, 1], [Math.PI / 2, 0, 0]);
  const chest = J.chest = new THREE.Group(); chest.position.y = 0.06; hips.add(chest);
  // torso (shirt): waist -> chest -> shoulders
  const torso = lathe(f
    ? [[0, -0.02], [0.16, -0.02], [0.15, 0.1], [0.142, 0.2], [0.165, 0.31], [0.175, 0.38], [0.17, 0.45], [0.13, 0.52], [0.06, 0.56], [0, 0.565]]
    : [[0, -0.02], [0.162, -0.02], [0.16, 0.1], [0.168, 0.22], [0.185, 0.34], [0.19, 0.42], [0.175, 0.48], [0.13, 0.535], [0.06, 0.565], [0, 0.57]],
    shirt, chest, [0, 0, 0], [1.12, 1, 0.72]);
  J.torso = torso;
  mesh(new THREE.TorusGeometry(0.058, 0.014, 10, 32), shirt, chest, [0, 0.548, 0.004], [1, 1, 0.85], [Math.PI / 2 + 0.15, 0, 0]); // collar
  mesh(new THREE.CylinderGeometry(0.047, 0.055, 0.14, 24), SK, chest, [0, 0.6, 0.0]);                                           // neck
  // head
  const head = J.head = new THREE.Group(); head.position.y = 0.7; chest.add(head);
  const skull = J.skull = mesh(headGeo(f), SK, head, [0, 0.0, 0]);
  // ears
  for (const s of [-1, 1]) {
    const ear = mesh(new THREE.SphereGeometry(0.03, 20, 14), SK, head, [s * 0.132, -0.005, -0.008], [0.38, 1, 0.75], [0, s * 0.35, 0]);
    mesh(new THREE.TorusGeometry(0.016, 0.0055, 8, 20), SK, ear, [s * 0.012, 0, 0.0], [0.6, 1, 1], [0, s * Math.PI / 2, 0]);
  }
  // nose: bridge + tip + wings
  const noseG = new THREE.Group(); noseG.position.set(0, -0.02, 0.142); head.add(noseG);
  mesh(new THREE.SphereGeometry(0.016, 20, 14), SK, noseG, [0, 0.018, -0.004], [0.75, 1.9, 0.9], [-0.25, 0, 0]);
  mesh(new THREE.SphereGeometry(0.016, 20, 14), SK, noseG, [0, -0.012, 0.008], [1.1, 0.95, 1]);
  for (const s of [-1, 1]) mesh(new THREE.SphereGeometry(0.011, 14, 10), SK, noseG, [s * 0.014, -0.016, 0.0], [1, 0.8, 0.9]);
  // eyes: white, iris, pupil, catchlight, eyelids; J.eyes[i].userData.pupil moves the iris
  J.eyes = []; J.brows = []; J.lids = [];
  const white = plain(0xf6f2ee, { roughness: 0.15, clearcoat: 1, clearcoatRoughness: 0.05 });
  const irisM = plain(irisC, { roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05 }), pupM = plain(0x060606, { roughness: 0.2, clearcoat: 1 });
  const glint = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const s of [-1, 1]) {
    const eye = new THREE.Group(); eye.position.set(s * 0.049, 0.016, 0.112); eye.rotation.y = s * 0.28; head.add(eye);
    mesh(new THREE.SphereGeometry(0.026, 28, 20), white, eye);
    const pupil = new THREE.Group(); eye.add(pupil);
    mesh(new THREE.SphereGeometry(0.0152, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), irisM, pupil, [0, 0, 0.0198], [1, 0.45, 1], [Math.PI / 2, 0, 0]);
    mesh(new THREE.CircleGeometry(0.0068, 24), pupM, pupil, [0, 0, 0.0279]);
    mesh(new THREE.CircleGeometry(0.0026, 12), glint, pupil, [0.0045, 0.0045, 0.0281]);
    eye.userData.pupil = pupil; J.eyes.push(eye);
    // upper / lower lid (skin shells) - face() rotates the upper one down to blink
    const up = new THREE.Group(); eye.add(up);
    mesh(new THREE.SphereGeometry(0.0285, 28, 14, 0, Math.PI * 2, 0, Math.PI * 0.5), SK, up, [0, 0, 0], [1, 1, 1], [-0.25, 0, 0]);
    const lo = new THREE.Group(); eye.add(lo);
    mesh(new THREE.SphereGeometry(0.0282, 28, 10, 0, Math.PI * 2, Math.PI * 0.72, Math.PI * 0.28), SK, lo);
    J.lids.push({ up, lo });
    // brow: curved tube
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.026 * s, -0.002, 0), new THREE.Vector3(0.0, 0.009, 0.004), new THREE.Vector3(0.028 * s, 0.002, -0.006));
    const brow = mesh(new THREE.TubeGeometry(curve, 16, f ? 0.0045 : 0.0065, 8, false), HAIR, head, [s * 0.049, 0.056, 0.13], [1, 1, 1], [0, s * 0.28, 0]);
    brow.userData.s = s; J.brows.push(brow);
  }
  // mouth: dark interior + lips (scaled as one group by face())
  const mouth = J.mouth = new THREE.Group(); mouth.position.set(0, -0.068, 0.124); head.add(mouth);
  mesh(new THREE.SphereGeometry(0.024, 24, 14), plain(0x3a1414, { roughness: 0.6 }), mouth, [0, 0, -0.004], [1, 1, 0.4]);
  mesh(new THREE.SphereGeometry(0.0055, 10, 8), plain(0xf4efe6, { roughness: 0.2 }), mouth, [0, 0.012, 0.002], [3.2, 0.9, 0.6]);  // teeth hint
  const lipM = plain(new THREE.Color(skinC).lerp(new THREE.Color(f ? 0xc0545a : 0xa65a50), f ? 0.55 : 0.35), { roughness: 0.4, clearcoat: f ? 0.6 : 0.2 });
  mesh(new THREE.TorusGeometry(0.024, 0.0065, 12, 40), lipM, mouth, [0, 0, 0.002], [1, 1, 0.6]);
  if (o.beard && !f) {                                    // short boxed beard: jaw band + chin + moustache
    const bm = hairMat(hairC);
    mesh(new THREE.TorusGeometry(0.098, 0.022, 12, 40, Math.PI), bm, head, [0, -0.06, 0.02], [1.02, 0.95, 1.05], [0, 0, Math.PI]);
    mesh(new THREE.SphereGeometry(0.035, 20, 14), bm, head, [0, -0.115, 0.098], [1.3, 0.8, 0.8]);
    mesh(new THREE.SphereGeometry(0.02, 16, 10), bm, head, [0, -0.052, 0.13], [2.0, 0.55, 0.7]);
  }
  // hair
  const H = new THREE.Group(); head.add(H);
  const cap = (phi = 0.48, sc = [0.96, 1.1, 1.03], tilt = -0.3) => mesh(new THREE.SphereGeometry(0.158, 48, 24, 0, Math.PI * 2, 0, Math.PI * phi), HAIR, H, [0, 0.01, -0.004], sc, [tilt, 0, 0]);
  if (style !== 'bald') {
    if (style === 'buzz') cap(0.5, [0.93, 1.09, 1.0], -0.35);
    else cap(style === 'curly' ? 0.52 : 0.47, style === 'curly' ? [1.02, 1.14, 1.07] : [0.97, 1.11, 1.04]);
    if (style === 'short' || style === 'side') {
      // swept fringe: one smooth lock across the forehead + volume on top
      mesh(new THREE.SphereGeometry(0.1, 32, 16), HAIR, H, [style === 'side' ? 0.025 : 0, 0.105, 0.072], [1.15, 0.42, 0.72], [0.55, 0, style === 'side' ? -0.28 : 0]);
      mesh(new THREE.SphereGeometry(0.12, 32, 16), HAIR, H, [0, 0.135, 0.0], [1.08, 0.5, 1.12], [0.15, 0, 0]);
    }
    if (style === 'curly') {
      const rr = rnd(4);
      for (let i = 0; i < 46; i++) { const th = rr() * Math.PI * 2, ph = rr() * 1.25; const R = 0.162;
        mesh(new THREE.SphereGeometry(0.03 + rr() * 0.012, 12, 10), HAIR, H, [Math.sin(ph) * Math.cos(th) * R * 0.98, 0.02 + Math.cos(ph) * R * 1.1, Math.sin(ph) * Math.sin(th) * R * 1.02 - 0.01]); }
    }
    if (style === 'long' || style === 'bob' || style === 'ponytail' || style === 'bun') {
      if (style === 'long' || style === 'bob') {           // side and back curtain
        const len = style === 'long' ? 0.3 : 0.17;
        mesh(new THREE.CylinderGeometry(0.152, style === 'long' ? 0.17 : 0.16, len, 40, 1, true, Math.PI * 0.3, Math.PI * 1.4), HAIR, H, [0, 0.0 - len / 2 + 0.06, -0.012], [0.98, 1, 1.0]);
        mesh(new THREE.CylinderGeometry(0.14, 0.155, len, 40, 1, true, Math.PI * 0.3, Math.PI * 1.4), HAIR, H, [0, 0.0 - len / 2 + 0.06, -0.012]).material.side = THREE.DoubleSide;
      }
      mesh(new THREE.SphereGeometry(0.1, 32, 16), HAIR, H, [-0.02, 0.11, 0.07], [1.25, 0.42, 0.75], [0.6, 0, 0.32]);  // side-swept bangs
      if (style === 'ponytail') { mesh(new THREE.SphereGeometry(0.03, 12, 10), HAIR, H, [0, 0.07, -0.16]); limb(H, 0.2, 0.035, 0.018, HAIR, 0).position.set(0, 0.06, -0.18); }
      if (style === 'bun') mesh(new THREE.SphereGeometry(o.elder ? 0.07 : 0.06, 24, 16), HAIR, H, [0, 0.13, -0.11]);
    }
  }
  if (o.elder) {                                          // glasses
    const fr = plain(0x1a1a1f, { roughness: 0.3, clearcoat: 1 });
    for (const s of [-1, 1]) mesh(new THREE.TorusGeometry(0.035, 0.0045, 10, 32), fr, head, [s * 0.05, 0.012, 0.15], [1, 0.85, 1], [0, s * 0.25, 0]);
    mesh(new THREE.BoxGeometry(0.03, 0.005, 0.005), fr, head, [0, 0.018, 0.158]);
  }
  // arms: shoulder, sleeve, upper arm, elbow, forearm, hand with fingers
  J.arm = {}; J.leg = {};
  for (const [name, s] of [['L', -1], ['R', 1]]) {
    const a = new THREE.Group(); a.position.set(s * (f ? 0.215 : 0.232), 0.44, 0); chest.add(a);
    mesh(new THREE.SphereGeometry(0.058, 24, 16), sleeveM, a, [s * -0.008, 0.0, 0], [1, 0.9, 0.95]);
    const armSkin = longSleeve ? foreM : SK;
    limb(a, 0.24, f ? 0.043 : 0.05, f ? 0.036 : 0.041, armSkin, 0);
    if (!longSleeve) limb(a, 0.11, 0.058, f ? 0.05 : 0.054, sleeveM, 0);                      // T-shirt sleeve
    const b = new THREE.Group(); b.position.y = -0.25; a.add(b);
    limb(b, 0.2, f ? 0.037 : 0.042, f ? 0.027 : 0.031, foreM, 0);
    if (longSleeve) mesh(new THREE.TorusGeometry(0.033, 0.008, 8, 24), foreM, b, [0, -0.195, 0], [1, 1, 1], [Math.PI / 2, 0, 0]); // cuff
    // hand group keeps the old Subject hand transform so props attached to it stay where they were
    const hand = new THREE.Group(); hand.position.y = -0.26; hand.scale.set(0.85, 1.1, 0.7); b.add(hand);
    const hi = new THREE.Group(); hi.scale.set(1 / 0.85, 1 / 1.1, 1 / 0.7); hi.position.y = 0.035; hand.add(hi);
    mesh(new RoundedBoxGeometry(0.03, 0.075, 0.07, 4, 0.013), handM, hi, [0, -0.01, 0.0]);
    for (let i = 0; i < 4; i++) {                       // fingers, slightly curled, spread along z
      const fg = new THREE.Group(); fg.position.set(0, -0.046, 0.026 - i * 0.017); fg.rotation.set(0.05 * (i - 1.5), 0, s * 0.18); hi.add(fg);
      const L = [0.032, 0.036, 0.034, 0.027][i];
      limb(fg, L * 0.55, 0.0085, 0.0078, handM, 0);
      const t2 = new THREE.Group(); t2.position.y = -L * 0.55; t2.rotation.z = s * 0.35; fg.add(t2); limb(t2, L * 0.45, 0.0078, 0.0068, handM, 0);
    }
    const th = new THREE.Group(); th.position.set(s * -0.006, -0.0, 0.034); th.rotation.set(0.7, 0, s * -0.25); hi.add(th);
    limb(th, 0.045, 0.0105, 0.0085, handM, 0);
    J.arm[name] = { a, b, hand };
    // legs
    const l = new THREE.Group(); l.position.set(s * 0.09, -0.03, 0); hips.add(l);
    limb(l, 0.4, f ? 0.082 : 0.078, 0.06, pants, 0);
    const kn = new THREE.Group(); kn.position.y = -0.42; l.add(kn);
    limb(kn, 0.36, 0.058, 0.048, shinM, 0);
    // sneaker: upper + sole + toe cap + laces
    const sh = new THREE.Group(); sh.position.set(0, -0.43, 0.045); kn.add(sh);
    const up = shoeMat(col.shoe), sole = plain(isLight(col.shoe) ? 0x2b2b2e : 0xf2f0ea, { roughness: 0.7 });
    mesh(new RoundedBoxGeometry(0.105, 0.075, 0.24, 6, 0.035), up, sh, [0, 0.005, 0]);
    mesh(new RoundedBoxGeometry(0.113, 0.025, 0.255, 4, 0.01), sole, sh, [0, -0.032, 0.004]);
    mesh(new THREE.SphereGeometry(0.052, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), up, sh, [0, -0.02, 0.085], [1, 0.75, 0.9]);
    for (let i = 0; i < 3; i++) mesh(new THREE.BoxGeometry(0.05, 0.006, 0.008), plain(0xf4f4f4), sh, [0, 0.043 - i * 0.004, 0.04 - i * 0.025], null, [0.35, 0, 0]);
    J.leg[name] = { l, kn };
  }
  g.userData.J = J; g.userData.pro = true;
  g.userData.face = ({ open = 0.3, wide = 0, closed = 0, lookX = 0, lookY = 0 } = {}) => {
    J.mouth.scale.set(lerp(1, 0.8, open), lerp(0.35, 1.25, open), 1);
    J.eyes.forEach((e, i) => {
      e.scale.setScalar(1 + wide * 0.12);
      e.userData.pupil.rotation.set(-lookY * 0.35, lookX * 0.4, 0);
      e.userData.pupil.scale.setScalar(lerp(1, 0.85, wide));
      const lid = J.lids[i]; lid.up.rotation.x = lerp(-0.35 - wide * 0.45, 1.25, closed); lid.lo.rotation.x = lerp(0.05 + wide * 0.2, -0.25, closed);
    });
    for (const b of J.brows) { b.position.y = 0.056 + wide * 0.016 - closed * 0.008; b.rotation.z = b.userData.s * (-0.15 * wide + 0.12 * closed); }
  };
  g.userData.face();
  return g;
}
function isLight(c) { const k = new THREE.Color(c); return k.r + k.g + k.b > 2.2; }
