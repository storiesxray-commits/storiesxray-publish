import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, M, fresnel, glowMat, addMat, halo, setOpacity, lights, shake, Subject, poseStand } from '../../engine/engine.js';

// xr009 — "Soldiers reenlisted... to play GTA 6" + the "GTA flu" (workers skipping launch day).
// No game logos, no game characters, no screenshots, no real insignia: generic soldiers, workers, a generic gamepad, generic paperwork.
// Facts: CBS News / Fortune (9th Brigade Engineer Battalion, 3rd Infantry Division, Fort Stewart GA: 4-day pass for reenlisting 2-6 years; 20 soldiers),
// BambooHR (18% of full-time salaried workers plan to take launch day off; half of gamers taking time off plan to call in sick), Fast Company ("GTA flu"),
// Fortune (Logitech: ~7,000 employees get a gaming day off).
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);

// palette: neon sunset night — hot pink, orange, violet, teal (launch-night vibe)
const PINK = 0xff3ea5, ORANGE = 0xff8a3d, VIOLET = 0x6a2bd9, TEAL = 0x22d3ee, YEL = 0xffd60a, GREEN = 0x4dff88, RED = 0xff3b30;
const OLIVE = 0x5d6b3c, OLIVE2 = 0x48542d, KHAKI = 0xb9a77a;

function labelSprite(text, color = '#ffffff', w = 1.6) {
  const cv = document.createElement('canvas'); cv.width = 1024; cv.height = 192; const x = cv.getContext('2d');
  x.font = '900 112px Inter, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
  x.lineWidth = 28; x.strokeStyle = '#0b0b0f'; x.strokeText(text, 512, 100); x.fillStyle = color; x.fillText(text, 512, 100);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, depthTest: false })); s.scale.set(w, w * 192 / 1024, 1); s.renderOrder = 20; return s;
}
function popLabel(s, w, k) { s.scale.set(w * k, w * k * 192 / 1024, 1); s.visible = k > 0.01; }
function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function bgGrad(scene, stops) { scene.background = canvasTex(64, 512, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); stops.forEach(([p, c]) => g.addColorStop(p, c)); x.fillStyle = g; x.fillRect(0, 0, w, h); }); }

// ---------------- props ----------------
// generic gamepad (no console branding, plain colored buttons)
function Pad(s = 1) {
  const g = new THREE.Group();
  const body = M(RB(0.3, 0.07, 0.14, 0.03, 3), 0x1f2230, { px: 3 }); g.add(body);
  for (const x of [-1, 1]) { const gr = M(new THREE.CapsuleGeometry(0.045, 0.08, 6, 12), 0x1f2230, { px: 3 }); gr.position.set(x * 0.12, -0.01, 0.06); gr.rotation.x = Math.PI / 2 - 0.4; gr.rotation.z = x * 0.35; g.add(gr); }
  for (const x of [-0.06, 0.05]) { const st = M(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 14), 0x3a3f52, { px: 2 }); st.position.set(x, 0.045, x < 0 ? -0.02 : 0.03); g.add(st); }
  [[0.1, -0.035, PINK], [0.125, -0.01, TEAL], [0.1, 0.015, YEL], [0.075, -0.01, GREEN]].forEach(([x, z, c]) => { const b = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 8), new THREE.MeshBasicMaterial({ color: c })); b.position.set(x, 0.04, z); g.add(b); });
  const led = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.005, 0.01), glowMat(PINK, 1)); led.position.set(0, 0.038, -0.065); g.add(led);
  g.scale.setScalar(s); return g;
}
function Soldier() {
  const g = Subject({ col: { torso: OLIVE, upper: OLIVE, fore: OLIVE, hand: C.skin, thigh: OLIVE2, shin: OLIVE2, shoe: 0x3a2e22 }, hair: 0x2a2523 });
  const cap = M(new THREE.CylinderGeometry(0.15, 0.16, 0.1, 24), OLIVE2, { px: 4 }); cap.position.set(0, 0.11, -0.005); cap.scale.set(1, 1, 1.05); g.userData.J.head.add(cap);
  const bill = M(RB(0.2, 0.02, 0.1, 0.01, 2), OLIVE2, { px: 3 }); bill.position.set(0, 0.07, 0.15); bill.rotation.x = 0.15; g.userData.J.head.add(bill);
  poseStand(g); return g;
}
function Worker(shirt = 0xf4f1ea, tie = RED) {
  const g = Subject({ col: { torso: shirt, upper: shirt, fore: shirt, hand: C.skin, thigh: 0x4a4f5c, shin: 0x4a4f5c, shoe: 0x22222a }, hair: 0x5a3a22 });
  const t = M(new THREE.BoxGeometry(0.045, 0.22, 0.02), tie, { px: 3 }); t.position.set(0, 0.36, 0.145); g.userData.J.chest.add(t);
  poseStand(g); return g;
}
// sitting + holding a gamepad
function sitPad(g, t, mash = 1) {
  const J = g.userData.J; poseStand(g, t);
  J.hips.position.y = 0.52; J.leg.L.l.rotation.set(-1.5, 0, -0.08); J.leg.R.l.rotation.set(-1.5, 0, 0.08); J.leg.L.kn.rotation.x = 1.45; J.leg.R.kn.rotation.x = 1.45;
  J.chest.rotation.x = 0.12 + 0.03 * Math.sin(t * 3);
  J.arm.L.a.rotation.set(-0.55, 0, -0.32); J.arm.R.a.rotation.set(-0.55, 0, 0.32);
  J.arm.L.b.rotation.set(-1.15 + 0.08 * Math.sin(t * 17) * mash, 0, 0.55); J.arm.R.b.rotation.set(-1.15 + 0.08 * Math.sin(t * 15 + 1) * mash, 0, -0.55);
  J.head.rotation.set(-0.05, 0.05 * Math.sin(t * 2), 0);
}
function Sofa() {
  const g = new THREE.Group(), col = 0x3b2a6b;
  const seat = M(RB(1.9, 0.22, 0.85, 0.08, 3), col, { px: 5 }); seat.position.set(0, 0.36, 0); g.add(seat);
  const base = M(RB(1.9, 0.25, 0.8, 0.05, 2), 0x2a1e4f, { px: 5 }); base.position.set(0, 0.13, 0); g.add(base);
  const backr = M(RB(1.9, 0.75, 0.25, 0.1, 3), col, { px: 5 }); backr.position.set(0, 0.75, -0.38); g.add(backr);
  for (const x of [-1.05, 1.05]) { const arm = M(RB(0.25, 0.55, 0.9, 0.1, 3), col, { px: 5 }); arm.position.set(x, 0.45, 0); g.add(arm); }
  return g;
}
// living room at night, lit by a TV that sits behind the camera
function livingRoom(scene) {
  bgGrad(scene, [[0, '#120726'], [0.6, '#2a0f45'], [1, '#3a1240']]);
  lights(scene, { hemi: 0.85, sky: 0xe8dcff, ground: 0x1a0a2a, keyI: 1.3, key: 0xfff0e6, keyPos: [-3, 5, 4], rim: PINK, rimI: 1.4, rimPos: [3, 3, -4] });
  const tv = new THREE.PointLight(0xffffff, 10, 14, 1.6); tv.position.set(0, 1.4, 3.2); scene.add(tv);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(0x2b1f3f)); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.8, 48), toon(0x5a2a6a)); rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.005, 0.6); scene.add(rug);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), toon(0x24123d)); wall.position.set(0, 6, -1.2); scene.add(wall);
  // neon window with a generic sunset + palms
  const win = canvasTex(512, 640, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#3a0f6a'); g.addColorStop(0.5, '#ff3ea5'); g.addColorStop(0.75, '#ff8a3d'); g.addColorStop(1, '#ffd60a'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.fillStyle = '#ffe38a'; x.beginPath(); x.arc(w / 2, h * 0.72, 90, 0, 7); x.fill(); x.fillStyle = '#1a0a2a';
    for (const [px, ph, s] of [[90, 420, 1], [420, 380, -1], [330, 470, 1]]) { x.fillRect(px - 6, h - ph, 12, ph); for (let k = 0; k < 6; k++) { x.beginPath(); x.ellipse(px + s * Math.cos(k) * 40, h - ph + Math.sin(k * 2) * 8, 60, 14, (k - 2.5) * 0.45, 0, 7); x.fill(); } }
    x.fillRect(0, h - 40, w, 40); });
  const wm = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2.0), new THREE.MeshBasicMaterial({ map: win })); wm.position.set(1.9, 2.0, -1.15); scene.add(wm);
  const fr = M(RB(1.75, 2.15, 0.08, 0.02, 2), 0x120726, { px: 4 }); fr.position.set(1.9, 2.0, -1.2); scene.add(fr);
  const lamp = halo(PINK, 3, 0.35); lamp.position.set(-2, 2.6, -1); scene.add(lamp);
  return tv;
}
function tvColor(tv, t) { const k = (Math.sin(t * 2.3) + 1) / 2, k2 = (Math.sin(t * 5.1 + 1) + 1) / 2; tv.color.setRGB(lerp(0.75, 1.0, k), lerp(0.85, 0.75, k2), lerp(1.0, 0.85, k)); tv.intensity = 9 + 3 * Math.sin(t * 9) * Math.sin(t * 3.3); }

// =============== s01 + loop (s11): HOOK — a soldier and an office worker on the couch, gaming at launch ===============
export function couch(mode = 'in') {
  const scene = new THREE.Scene(); const tv = livingRoom(scene);
  const sofa = Sofa(); scene.add(sofa);
  const S = Soldier(), Wk = Worker(); S.position.set(-0.45, 0, 0.05); Wk.position.set(0.45, 0, 0.05); scene.add(S, Wk);
  const pads = [S, Wk].map(g => { const p = Pad(1.0); scene.add(p); return p; });
  const snacks = M(RB(0.3, 0.06, 0.2, 0.02, 2), ORANGE, { px: 3 }); snacks.position.set(0, 0.5, 0.15); scene.add(snacks);
  const wp = new THREE.Vector3(), wq = new THREE.Vector3();
  const c = cam(34), P0 = V(0.1, 1.3, 7.2), P1 = V(0.05, 1.25, 6.5), TG = V(0, 0.85, 0);
  return {
    scene, camera: c,
    update(t, d) {
      tvColor(tv, t);
      sitPad(S, t, 1); sitPad(Wk, t + 0.7, 1);
      [S, Wk].forEach((g, i) => { const J = g.userData.J; J.arm.L.hand.getWorldPosition(wp); J.arm.R.hand.getWorldPosition(wq); pads[i].position.copy(wp).add(wq).multiplyScalar(0.5).add(V(0, 0.02, 0.03)); pads[i].rotation.set(0.9, 0, 0); g.userData.face({ open: 0.35 + 0.35 * Math.abs(Math.sin(t * 6 + i)), wide: 0.7, lookX: i ? -0.2 : 0.2 }); });
      if (mode === 'in') look(c, mix(P0, P1, eio(t / d)), TG); else look(c, mix(V(0.3, 1.5, 8.6), P0, eio(ss(0, d, t))), TG);
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// paperwork canvas
function paperTex(title, lines, stamp, stampCol = '#e0242f') {
  return canvasTex(640, 860, (x, w, h) => {
    x.fillStyle = '#f7f1e3'; x.fillRect(0, 0, w, h); x.fillStyle = '#1d2438'; x.font = '900 52px Inter'; x.textAlign = 'center'; x.fillText(title, w / 2, 96);
    x.fillRect(60, 120, w - 120, 6); x.textAlign = 'left'; x.font = '700 30px Inter';
    lines.forEach((l, i) => { if (l) x.fillText(l, 64, 190 + i * 46); else { x.fillStyle = '#b8ad95'; x.fillRect(64, 172 + i * 46, 380 + (i * 53) % 120, 14); x.fillStyle = '#1d2438'; } });
    x.strokeStyle = '#1d2438'; x.lineWidth = 3; x.beginPath(); x.moveTo(64, 790); x.lineTo(330, 790); x.stroke(); x.font = '600 22px Inter'; x.fillText('SIGNATURE', 64, 820);
  });
}
function stampTex(text, col = '#e0242f') { return canvasTex(720, 240, (x, w, h) => { x.strokeStyle = col; x.lineWidth = 16; x.strokeRect(14, 14, w - 28, h - 28); x.fillStyle = col; x.font = '900 112px Inter'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2 + 6); }); }
function deskScene(scene, col = '#1b1030') {
  bgGrad(scene, [[0, '#0e0a1c'], [1, col]]);
  lights(scene, { hemi: 1.0, sky: 0xfff2e0, ground: 0x1b1030, keyI: 1.8, key: 0xffe8cc, keyPos: [-2, 6, 4], rim: PINK, rimI: 0.9 });
  const tx = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#4a3a2c'; x.fillRect(0, 0, w, h); for (let i = 0; i < 30; i++) { x.strokeStyle = `rgba(20,10,5,${0.15 + 0.2 * Math.random()})`; x.lineWidth = 2 + Math.random() * 3; x.beginPath(); const y = Math.random() * h; x.moveTo(0, y); x.bezierCurveTo(w * 0.3, y + 15, w * 0.6, y - 15, w, y + 6); x.stroke(); } });
  tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(2, 2);
  const tb = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), new THREE.MeshToonMaterial({ map: tx })); tb.rotation.x = -Math.PI / 2; scene.add(tb);
  const lampH = halo(0xffd29a, 8, 0.3); lampH.position.set(-1, 3, -1); scene.add(lampH);
}
// =============== s02: "I'm not kidding!" — the memo ===============
export function memo(tStamp) {
  const scene = new THREE.Scene(); deskScene(scene);
  const P = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.55), new THREE.MeshBasicMaterial({ map: paperTex('THE OFFER', ['REENLISTMENT INCENTIVE', '(ONE ARMY UNIT, GEORGIA)', null, null, 'Soldiers who reenlist', 'receive a special', '4-DAY PASS', 'for the release of', 'GRAND THEFT AUTO VI.', null, null, null]) }));
  P.rotation.x = -Math.PI / 2; P.rotation.z = 0.06; P.position.y = 0.01; P.scale.setScalar(0.85); scene.add(P);
  const st = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.5), new THREE.MeshBasicMaterial({ map: stampTex('4-DAY PASS'), transparent: true })); st.rotation.x = -Math.PI / 2; st.rotation.z = 0.25; st.position.set(0.05, 0.03, 0.45); scene.add(st);
  const pad = Pad(1.8); pad.position.set(0.55, 0.1, 1.45); pad.rotation.y = -0.4; scene.add(pad);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const k = clamp((t - tStamp) / 0.18); st.scale.setScalar(lerp(2.2, 1, eout(k))); st.visible = t > tStamp; st.material.opacity = k;
      look(c, mix(V(0, 6.4, 1.2), V(0, 6.0, 1.0), eio(t / d)), V(0, 0, 0.0)); shake(c, t, tStamp + 0.18, 0.04, 0.25);
    },
    ui: () => ({ vig: 0.35 }),
  };
}
// =============== s03: an Army unit in Georgia — a 4-day pass timed to the launch ===============
export function pass(t4) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#120726'], [0.6, '#3a0f5a'], [1, '#ff3ea5']]);
  lights(scene, { hemi: 1.0, sky: 0xffffff, ground: 0x2a0f45, keyI: 1.6, keyPos: [-2, 4, 6], rim: ORANGE, rimI: 1.0 });
  const sun = halo(0xffb86a, 10, 0.5); sun.position.set(0, -2.5, -6); scene.add(sun);
  const S = Soldier(); S.position.set(0, -1.9, 0); S.scale.setScalar(1.15); scene.add(S);
  const tiles = [];
  for (let i = 0; i < 4; i++) {
    const tex = canvasTex(256, 300, (x, w, h) => { x.fillStyle = '#fff7ea'; x.fillRect(0, 0, w, h); x.fillStyle = i === 0 ? '#ff3ea5' : '#6a2bd9'; x.fillRect(0, 0, w, 80); x.fillStyle = '#fff'; x.font = '900 46px Inter'; x.textAlign = 'center'; x.fillText(i === 0 ? 'LAUNCH' : 'DAY ' + (i + 1), w / 2, 56);
      x.fillStyle = '#1d2438'; x.beginPath(); x.roundRect(48, 140, 160, 90, 40); x.fill(); x.fillStyle = '#ff3ea5'; x.beginPath(); x.arc(170, 175, 10, 0, 7); x.fill(); x.fillStyle = '#22d3ee'; x.beginPath(); x.arc(190, 195, 10, 0, 7); x.fill(); x.fillStyle = '#3a3f52'; x.beginPath(); x.arc(92, 180, 16, 0, 7); x.fill(); });
    const m = M(RB(0.62, 0.74, 0.06, 0.04, 2), 0xfff7ea, { px: 4 }); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.71), new THREE.MeshBasicMaterial({ map: tex })); f.position.z = 0.035; m.add(f);
    m.scale.setScalar(0.66); m.position.set(-0.66 + i * 0.44, 0.35, 0.6); scene.add(m); tiles.push(m);
  }
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      poseStand(S, t); const J = S.userData.J; J.arm.R.a.rotation.set(-0.2, 0, 2.3); J.arm.R.b.rotation.set(-1.9, 0, 0); S.userData.face({ open: 0.25, wide: 0.3 }); // salute
      tiles.forEach((m, i) => { const k = back(clamp((t - t4 - i * 0.15) / 0.3)); m.scale.setScalar(Math.max(0.001, k * 0.66)); m.visible = k > 0.01; m.rotation.z = 0.06 * Math.sin(t * 2 + i); });
      look(c, mix(V(0, 0.0, 6.9), V(0, 0.0, 6.4), eio(t / d)), V(0, 0.0, 0));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// =============== s04: the catch — sign up for at least two more years ===============
export function contract(tSign, tStamp) {
  const scene = new THREE.Scene(); deskScene(scene, '#2a0a1a');
  const P = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 2.55), new THREE.MeshBasicMaterial({ map: paperTex('REENLISTMENT', ['CONTRACT', null, null, 'Term of service:', 'MINIMUM 2 YEARS', '(UP TO 6)', null, null, null, null, null, null]) }));
  P.rotation.x = -Math.PI / 2; P.rotation.z = -0.05; P.position.y = 0.01; P.scale.setScalar(0.85); scene.add(P);
  const ink = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.025), new THREE.MeshBasicMaterial({ color: 0x1d2a6a })); ink.geometry.translate(0.5, 0, 0); ink.rotation.x = -Math.PI / 2; ink.position.set(-0.66, 0.02, 0.84); scene.add(ink);
  const pen = new THREE.Group(); const pb = M(new THREE.CylinderGeometry(0.035, 0.035, 0.9, 12), 0x1d2438, { px: 3 }); pb.position.y = 0.45; pen.add(pb); const nib = M(new THREE.ConeGeometry(0.035, 0.12, 12), 0xf2b84b, { px: 2 }); nib.rotation.x = Math.PI; nib.position.y = -0.04; pen.add(nib); pen.rotation.set(0.5, 0, -0.4); scene.add(pen);
  const st = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.53), new THREE.MeshBasicMaterial({ map: stampTex('+2 YEARS'), transparent: true })); st.rotation.x = -Math.PI / 2; st.rotation.z = -0.2; st.position.set(0.05, 0.03, -0.1); scene.add(st);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      const k = ss(tSign, tSign + 0.9, t); ink.scale.x = Math.max(0.001, k * 0.55); ink.visible = k > 0.01; pen.position.set(-0.66 + 0.55 * k + 0.05 * Math.sin(t * 30) * (k > 0 && k < 1 ? 1 : 0), 0.08, 0.84);
      const ks = clamp((t - tStamp) / 0.18); st.scale.setScalar(lerp(2.2, 1, eout(ks))); st.visible = t > tStamp; st.material.opacity = ks;
      look(c, mix(V(0, 6.4, 1.2), V(0, 6.0, 1.0), eio(t / d)), V(0, 0, 0.0)); shake(c, t, tStamp + 0.18, 0.04, 0.25);
    },
    ui: () => ({ vig: 0.35 }),
  };
}
// =============== s05: twenty soldiers said yes — a formation of 20 ===============
export function twenty() {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#120726'], [0.55, '#5a1a6a'], [1, '#ff8a3d']]);
  lights(scene, { hemi: 1.05, sky: 0xfff0e6, ground: 0x3a1a3a, keyI: 1.7, keyPos: [-3, 6, 6], rim: PINK, rimI: 1.2 });
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(0x3a2a3a)); gr.rotation.x = -Math.PI / 2; scene.add(gr);
  const N = 20, body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.17, 0.75, 6, 14), toon(OLIVE), N), head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.14, 16, 12), toon(C.skin), N), capI = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.135, 0.145, 0.09, 16), toon(OLIVE2), N), legs = new THREE.InstancedMesh(new THREE.CapsuleGeometry(0.075, 0.5, 4, 10), toon(OLIVE2), N * 2);
  const eyes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.022, 8, 6), new THREE.MeshBasicMaterial({ color: 0x0b0b0f }), N * 2); scene.add(eyes);
  const pos = []; for (let i = 0; i < N; i++) pos.push(V(((i % 5) - 2) * 0.62 + (Math.floor(i / 5) % 2) * 0.12, 0, -Math.floor(i / 5) * 0.75));
  const m4 = new THREE.Matrix4(); scene.add(body, head, capI, legs);
  const pads = pos.map(() => { const p = Pad(1.1); scene.add(p); return p; });
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      pos.forEach((p, i) => { const k = back(clamp((t - i * 0.05) / 0.3)), y = 0.04 * Math.abs(Math.sin(t * 6 + i)), s = Math.max(0.001, k);
        body.setMatrixAt(i, m4.compose(V(p.x, 1.05 * s + y, p.z), new THREE.Quaternion(), V(s, s, s))); head.setMatrixAt(i, m4.compose(V(p.x, 1.75 * s + y, p.z), new THREE.Quaternion(), V(s, s, s))); capI.setMatrixAt(i, m4.compose(V(p.x, 1.86 * s + y, p.z), new THREE.Quaternion(), V(s, s, s)));
        for (const L of [0, 1]) eyes.setMatrixAt(i * 2 + L, m4.compose(V(p.x + (L ? 0.05 : -0.05), 1.77 * s + y, p.z + 0.13 * s), new THREE.Quaternion(), V(s, s, s)));
        for (const L of [0, 1]) legs.setMatrixAt(i * 2 + L, m4.compose(V(p.x + (L ? 0.08 : -0.08), 0.35 * s, p.z), new THREE.Quaternion(), V(s, s, s)));
        pads[i].position.set(p.x, (1.35 + 0.35 * Math.abs(Math.sin(t * 5 + i))) * s, p.z + 0.25); pads[i].rotation.set(0.6, t * 2 + i, 0.3 * Math.sin(t * 4 + i)); pads[i].visible = k > 0.05; });
      for (const im of [body, head, capI, legs, eyes]) im.instanceMatrix.needsUpdate = true;
      look(c, mix(V(0, 3.0, 6.8), V(0, 2.7, 6.0), eio(t / d)), V(0, 0.75, -1.2));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
// office row: 5 desks with workers; mode 'empty' makes one chair empty (1 in 5)
function Desk() { const g = new THREE.Group(); const top = M(RB(0.9, 0.05, 0.55, 0.02, 2), 0xd9cdb8, { px: 4 }); top.position.y = 0.74; g.add(top);
  for (const x of [-0.4, 0.4]) { const l = M(new THREE.BoxGeometry(0.04, 0.72, 0.5), 0x8a8f96, { px: 3 }); l.position.set(x, 0.36, 0); g.add(l); }
  const mon = M(RB(0.5, 0.32, 0.03, 0.02, 2), 0x1d2230, { px: 3 }); mon.position.set(0, 1.0, -0.15); g.add(mon); const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.27), glowMat(0x7ad7ff, 0.9)); scr.position.set(0, 1.0, -0.13); g.add(scr);
  const st = M(new THREE.BoxGeometry(0.05, 0.18, 0.05), 0x3a3f52, { px: 2 }); st.position.set(0, 0.84, -0.15); g.add(st); g.userData.scr = scr; return g; }
function Chair() { const g = new THREE.Group(); const s = M(RB(0.42, 0.07, 0.42, 0.03, 2), 0x2a2f3c, { px: 3 }); s.position.y = 0.48; g.add(s); const b = M(RB(0.42, 0.5, 0.06, 0.03, 2), 0x2a2f3c, { px: 3 }); b.position.set(0, 0.78, 0.22); g.add(b); const p = M(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 8), 0x55596a, { px: 2 }); p.position.y = 0.24; g.add(p); return g; }
export function office(mode = 'wide', tGone = 1, tSkip = 9) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#dfe7f2'], [1, '#b9c6d9']]);
  lights(scene, { hemi: 1.1, sky: 0xffffff, ground: 0x8a8f96, keyI: 1.6, keyPos: [-3, 6, 6], rim: 0x9fd0ff, rimI: 0.8 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(0x9aa3b2)); fl.rotation.x = -Math.PI / 2; scene.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 10), toon(0xcfd8e6)); wall.position.set(0, 5, -1.6); scene.add(wall);
  const cols = [0x8ecae6, 0xf4f1ea, 0xffb4a2, 0xcdeac0, 0xe0c3fc], seats = [];
  for (let i = 0; i < 5; i++) {
    const x = (i - 2) * 1.0, d = Desk(), ch = Chair(), w = Worker(cols[i], [RED, 0x1d4ed8, 0x15803d, 0x7c3aed, 0xb45309][i]);
    d.position.set(x, 0, -0.55); ch.position.set(x, 0, 0.0); w.position.set(x, 0, 0.0); w.rotation.y = Math.PI; scene.add(d, ch, w); seats.push({ w, x, d });
  }
  const poof = []; for (let i = 0; i < 14; i++) { const p = halo(i % 2 ? PINK : YEL, 0.35, 0); scene.add(p); poof.push(p); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.03, 8, 48), glowMat(RED, 1)); ring.position.set(0, 0.75, 0.3); scene.add(ring);
  const lab = labelSprite('GONE GAMING', '#FF3EA5', 1.3); scene.add(lab);
  const c = cam(34), gi = 2;
  return {
    scene, camera: c,
    update(t, d) {
      seats.forEach(({ w }, i) => { const J = w.userData.J; poseStand(w, t); J.hips.position.y = 0.55; J.leg.L.l.rotation.set(-1.45, 0, 0); J.leg.R.l.rotation.set(-1.45, 0, 0); J.leg.L.kn.rotation.x = 1.4; J.leg.R.kn.rotation.x = 1.4;
        J.arm.L.a.rotation.set(-0.7, 0, -0.1); J.arm.R.a.rotation.set(-0.7, 0, 0.1); J.arm.L.b.rotation.set(-0.6 + 0.1 * Math.sin(t * 14 + i), 0, 0); J.arm.R.b.rotation.set(-0.6 + 0.1 * Math.sin(t * 13 + i), 0, 0); J.head.rotation.set(0.05, 0, 0); });
      const kg = mode === 'empty' ? ss(tGone, tGone + 0.25, t) : 0, gw = seats[gi].w; gw.scale.setScalar(Math.max(0.001, 1 - kg)); gw.visible = kg < 0.99;
      poof.forEach((p, i) => { const u = clamp((t - tGone) / 0.6); const a = i / 14 * Math.PI * 2; p.position.set(seats[gi].x + Math.cos(a) * u * 0.6, 1.0 + Math.sin(a) * u * 0.6, 0.1); p.material.opacity = mode === 'empty' ? 0.8 * Math.sin(Math.PI * u) : 0; });
      ring.position.x = seats[gi].x; const rk = mode === 'empty' ? back(clamp((t - tGone - 0.2) / 0.3)) : 0; ring.scale.setScalar(Math.max(0.001, rk)); ring.visible = rk > 0.01;
      lab.position.set(seats[gi].x, 1.55, 0.4); popLabel(lab, 1.3, mode === 'empty' ? back(clamp((t - tSkip) / 0.3)) : 0);
      look(c, mix(V(0, 2.3, 6.4), V(0, 2.1, 5.8), eio(t / d)), V(0, 0.7, -0.3));
    },
    ui: () => ({ vig: 0.15 }),
  };
}
// =============== s08: half call in sick — the phone call from bed ===============
export function sick(tSick) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#0e0a1c'], [1, '#2a1240']]);
  lights(scene, { hemi: 1.0, sky: 0xe8dcff, ground: 0x1a0a2a, keyI: 1.5, keyPos: [-2, 5, 4], rim: PINK, rimI: 1.0 });
  const quilt = canvasTex(512, 512, (x, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#6a4fb5' : '#8f73d9'; x.fillRect(i * 64, j * 64, 64, 64); } x.strokeStyle = 'rgba(255,255,255,.35)'; x.setLineDash([8, 8]); x.lineWidth = 3; for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, h); x.stroke(); x.beginPath(); x.moveTo(0, i * 64); x.lineTo(w, i * 64); x.stroke(); } });
  quilt.wrapS = quilt.wrapT = THREE.RepeatWrapping; quilt.repeat.set(3, 3);
  const bed = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshToonMaterial({ map: quilt })); bed.rotation.x = -Math.PI / 2; scene.add(bed);
  const scrT = canvasTex(540, 1080, (x, w, h) => { x.fillStyle = '#141826'; x.fillRect(0, 0, w, h); x.fillStyle = '#9aa3b2'; x.font = '600 40px Inter'; x.textAlign = 'center'; x.fillText('calling...', w / 2, 210);
    x.fillStyle = '#e0c3fc'; x.beginPath(); x.arc(w / 2, 400, 120, 0, 7); x.fill(); x.fillStyle = '#3a2a5a'; x.font = '900 120px Inter'; x.fillText('B', w / 2, 444); x.fillStyle = '#ffffff'; x.font = '900 86px Inter'; x.fillText('BOSS', w / 2, 640);
    x.fillStyle = '#ff3b30'; x.beginPath(); x.arc(w / 2, 900, 70, 0, 7); x.fill(); });
  const ph = new THREE.Group(); scene.add(ph); const body = M(RB(1.3, 2.6, 0.12, 0.16, 4), 0x2b2f3a, { px: 5 }); ph.add(body); const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 2.38), new THREE.MeshBasicMaterial({ map: scrT })); scr.position.z = 0.07; ph.add(scr);
  ph.rotation.x = -Math.PI / 2 + 0.25; ph.rotation.z = 0.12; ph.position.set(-0.3, 0.12, -0.3);
  const pad = Pad(3.0); pad.position.set(0.75, 0.12, 0.95); pad.rotation.set(0.15, -0.6, 0); scene.add(pad);
  const bubble = labelSprite('"I\'m sick..."', '#ffffff', 1.6), wink = labelSprite('(not sick)', '#FFD60A', 1.1); scene.add(bubble, wink);
  const therm = new THREE.Group(); const tb = M(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 12), 0xf4f1ea, { px: 3 }); therm.add(tb); const bulb = M(new THREE.SphereGeometry(0.09, 14, 10), RED, { px: 3 }); bulb.position.y = -0.52; therm.add(bulb); therm.rotation.set(-Math.PI / 2, 0, 0.9); therm.position.set(1.0, 0.1, 0.65); scene.add(therm);
  const c = cam(34);
  return {
    scene, camera: c,
    update(t, d) {
      ph.position.y = 0.12 + 0.02 * Math.sin(t * 20) * (t < tSick ? 1 : 0);
      bubble.position.set(0.05, 1.1, 1.35); popLabel(bubble, 1.6, back(clamp((t - tSick) / 0.3)));
      wink.position.set(0.55, 0.9, -0.2); popLabel(wink, 1.1, back(clamp((t - tSick - 0.6) / 0.3)));
      pad.rotation.y = -0.6 + 0.08 * Math.sin(t * 3);
      look(c, mix(V(0.1, 7.4, 2.4), V(0.1, 7.0, 2.1), eio(t / d)), V(0.1, 0, -0.3));
    },
    ui: () => ({ vig: 0.3 }),
  };
}
// =============== s09: "the GTA flu" — x-ray diagnosis: a gamepad where the brain should be busy ===============
export function flu(tX) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x07121c);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.5, rimI: 1.1 });
  const bh = halo(0x0f5f78, 8, 0.55); bh.position.set(0, 1.2, -3); scene.add(bh);
  const solid = Worker(0xf4f1ea, RED), ghost = Subject({ xray: true }); scene.add(solid, ghost); poseStand(ghost);
  const pad = Pad(1.1); scene.add(pad); const glow = halo(PINK, 0.9, 0); scene.add(glow);
  const fever = halo(RED, 0.8, 0); ghost.userData.J.head.add(fever);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.014), glowMat(TEAL, 1)); scene.add(scan);
  const therm = new THREE.Group(); const tube = M(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 14), 0xf4f1ea, { px: 4 }); therm.add(tube); const bulb = M(new THREE.SphereGeometry(0.13, 16, 12), RED, { px: 4 }); bulb.position.y = -0.85; therm.add(bulb);
  const merc = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.02), glowMat(RED, 1)); merc.geometry.translate(0, 0.5, 0); merc.position.set(0, -0.8, 0.072); therm.add(merc); therm.scale.setScalar(0.7); therm.position.set(0.62, 1.15, 0.3); scene.add(therm);
  const lab = labelSprite('DIAGNOSED!', '#ff3b30', 1.4); scene.add(lab);
  const wp = new THREE.Vector3(), wq = new THREE.Vector3(), c = cam(33);
  return {
    scene, camera: c,
    update(t, d) {
      const k = ss(tX, tX + 0.5, t); setOpacity(solid, 1 - k); setOpacity(ghost, k);
      for (const g of [solid, ghost]) { poseStand(g, t); const J = g.userData.J; J.arm.L.a.rotation.set(-0.7, 0, -0.25); J.arm.R.a.rotation.set(-0.7, 0, 0.25); J.arm.L.b.rotation.set(-1.1 + 0.1 * Math.sin(t * 16), 0, 0.5); J.arm.R.b.rotation.set(-1.1 + 0.1 * Math.sin(t * 14), 0, -0.5); g.rotation.y = -0.25 + 0.15 * Math.sin(t * 0.8); }
      solid.userData.face({ open: 0.4, wide: 0.6 });
      solid.userData.J.arm.L.hand.getWorldPosition(wp); solid.userData.J.arm.R.hand.getWorldPosition(wq); pad.position.copy(wp).add(wq).multiplyScalar(0.5).add(V(0, 0.03, 0.04)); pad.rotation.set(0.9, solid.rotation.y, 0);
      glow.position.copy(pad.position); glow.material.opacity = 0.8 * k * (0.7 + 0.3 * Math.sin(t * 10)); fever.material.opacity = 0.7 * k * (0.6 + 0.4 * Math.sin(t * 6));
      scan.visible = k > 0.01 && k < 0.99; scan.position.set(0, lerp(1.95, 0.05, k), 0.4);
      merc.scale.y = lerp(0.25, 1.02, ss(tX + 0.2, tX + 1.2, t));
      lab.position.set(0, 0.45, 0.6); popLabel(lab, 1.4, back(clamp((t - tX - 0.6) / 0.3)));
      look(c, mix(V(0, 1.35, 5.4), V(0, 1.3, 4.8), eio(t / d)), V(0, 1.2, 0));
    },
    ui: t => ({ vig: 0.3, flash: Math.max(0, 0.3 - Math.abs(t - tX - 0.1) * 1.6) }),
  };
}
// =============== s10: one tech company gave ~7,000 employees a day off to game — the tower switches to game mode ===============
export function tower(tOn) {
  const scene = new THREE.Scene(); bgGrad(scene, [[0, '#0a0620'], [0.6, '#2a0f45'], [1, '#ff3ea5']]);
  lights(scene, { hemi: 0.9, sky: 0xffe0f0, ground: 0x2a0f45, keyI: 1.4, keyPos: [-4, 6, 6], rim: TEAL, rimI: 1.2 });
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), toon(0x1a1030)); gr.rotation.x = -Math.PI / 2; scene.add(gr);
  const b = M(RB(3.0, 7.0, 2.0, 0.05, 2), 0x2b2550, { px: 5 }); b.position.set(0, 3.5, 0); scene.add(b);
  for (const [x, h] of [[-3.6, 4.5], [3.7, 5.2], [-2.6, 3.0], [2.8, 3.4]]) { const o = M(RB(1.4, h, 1.5, 0.04, 2), 0x1f1a40, { px: 4 }); o.position.set(x, h / 2, -1.2); scene.add(o); }
  const cols = 8, rows = 16, N = cols * rows, wins = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.26, 0.3), new THREE.MeshBasicMaterial({ color: 0xffffff }), N);
  const m4 = new THREE.Matrix4(), cc = new THREE.Color(), r = rnd(3), order = []; for (let i = 0; i < N; i++) { const x = -1.25 + (i % cols) * 0.357, y = 0.6 + Math.floor(i / cols) * 0.4; m4.makeTranslation(x, y, 1.011); wins.setMatrixAt(i, m4); order.push(r()); } scene.add(wins);
  const neon = [PINK, TEAL, ORANGE, VIOLET, YEL, GREEN];
  const c = cam(36);
  return {
    scene, camera: c,
    update(t, d) {
      for (let i = 0; i < N; i++) { const on = t > tOn + order[i] * 1.6; if (on) cc.setHex(neon[(i + Math.floor(t * 4)) % neon.length]); else cc.setHex(0xfff2c8); wins.setColorAt(i, cc); }
      wins.instanceColor.needsUpdate = true;
      look(c, mix(V(0, 2.4, 13.5), V(0, 3.0, 12.0), eio(t / d)), V(0, 3.6, 0));
    },
    ui: () => ({ vig: 0.25 }),
  };
}
