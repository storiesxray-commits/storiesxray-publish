import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, outlineMat, M, fresnel, glowMat, addMat, halo, setOpacity, lights, shake } from '../../engine/engine.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l) { c.position.copy(p); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);
const BONE = 0xd9fbff, MUSC = 0xff3b30, TEND = 0xf2fbff;

function xbase(scene, hy = 0) {
  scene.background = new THREE.Color(C.bg);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.6, key: 0xffffff, rimI: 1.0 });
  const r = rnd(11), n = 170, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (r() - .5) * 9; pos[i * 3 + 1] = (r() - .5) * 12 + hy; pos[i * 3 + 2] = (r() - .5) * 6 - 3; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x2aa9c4, size: 4, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false })); scene.add(dust);
  const bh = halo(0x0f5f78, 11, 0.55); bh.position.set(0, hy, -3); scene.add(bh);
  return dust;
}

// ---------------- x-ray arm: bones + tendons in the fingers, muscles only in the forearm ----------------
function ArmX() {
  const fm = fresnel(C.cyan, 1.7, 1.25, 0.04);
  const g = new THREE.Group(), U = { joints: [], tops: [], muscles: [], mhalos: [], curves: [] };
  const palm = new THREE.Mesh(RB(1.02, 1.0, 0.36, 0.16, 4), fm); g.add(palm);
  const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.44, 2.7, 8, 28), fm); fore.position.y = -2.15; fore.scale.set(1, 1, 0.7); g.add(fore);
  // wrist bones
  for (const x of [-0.16, 0.16]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 2.6, 4, 10), glowMat(BONE, 0.45)); b.position.set(x, -2.05, -0.06); g.add(b); }
  const defs = [[-0.36, 0.8, 0.42, 0.1], [-0.12, 0.98, 0.48, 0.108], [0.12, 0.92, 0.47, 0.105], [0.36, 0.72, 0.4, 0.095]];
  const mx = [-0.24, -0.08, 0.08, 0.24];
  defs.forEach(([x, L, by, r], i) => {
    const j1 = new THREE.Group(); j1.position.set(x, by, 0); g.add(j1);
    const l1 = L * 0.42, l2 = L * 0.32, l3 = L * 0.26;
    const s1 = new THREE.Mesh(new THREE.CapsuleGeometry(r, l1, 6, 18), fm); s1.position.y = l1 / 2; j1.add(s1);
    const j2 = new THREE.Group(); j2.position.y = l1; j1.add(j2);
    const s2 = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.93, l2, 6, 18), fm); s2.position.y = l2 / 2; j2.add(s2);
    const j3 = new THREE.Group(); j3.position.y = l2; j2.add(j3);
    const s3 = new THREE.Mesh(new THREE.CapsuleGeometry(r * 0.87, l3, 6, 18), fm); s3.position.y = l3 / 2; j3.add(s3);
    for (const [par, ln] of [[j1, l1], [j2, l2], [j3, l3]]) {
      const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, ln * 0.78, 4, 8), glowMat(BONE, 0.6)); b.position.set(0, ln / 2, -0.015); par.add(b);
      const td = new THREE.Mesh(new THREE.CapsuleGeometry(0.017, ln * 0.92, 4, 8), glowMat(TEND, 0.95)); td.position.set(0, ln / 2, r * 0.55); par.add(td);
      const tg = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, ln * 0.92, 4, 8), addMat(TEND, 0.22)); tg.position.copy(td.position); par.add(tg);
    }
    const mc = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 0.7, 4, 8), glowMat(BONE, 0.6)); mc.position.set(x * 0.8, -0.02, -0.02); mc.rotation.z = -x * 0.5; g.add(mc);
    U.joints.push([j1, j2, j3]); U.tops.push([j3, l3]);
    // tendon: forearm muscle -> wrist -> finger base (palm side)
    const cv = new THREE.CatmullRomCurve3([V(mx[i], -1.55, 0.2), V(mx[i] * 1.05, -0.75, 0.2), V(x * 0.7, -0.2, 0.21), V(x, by - 0.02, r * 0.55)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 50, 0.019, 8), glowMat(TEND, 0.95)));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 50, 0.045, 8), addMat(TEND, 0.2)));
    U.curves.push(cv);
    // forearm muscle belly
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.085, 1.25, 8, 16), glowMat(MUSC, 0.9)); m.position.set(mx[i], -2.3, 0.16); g.add(m);
    const mh = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 1.3, 8, 16), addMat(MUSC, 0.3)); m.add(mh);
    U.muscles.push(m);
  });
  // thumb
  const tj = new THREE.Group(); tj.position.set(-0.5, -0.22, 0.05); tj.rotation.z = 0.72; g.add(tj);
  const ts1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.125, 0.36, 6, 18), fm); ts1.position.y = 0.18; tj.add(ts1);
  const tj2 = new THREE.Group(); tj2.position.y = 0.36; tj2.rotation.z = -0.25; tj.add(tj2);
  const ts2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.27, 6, 18), fm); ts2.position.y = 0.135; tj2.add(ts2);
  for (const [par, ln] of [[tj, 0.36], [tj2, 0.27]]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.026, ln * 0.78, 4, 8), glowMat(BONE, 0.6)); b.position.set(0, ln / 2, -0.01); par.add(b); }
  const mh = halo(MUSC, 2.6, 0.0); mh.position.set(0, -2.3, 0.4); g.add(mh); U.mglow = mh;
  // pulses travelling up the tendons
  U.pulses = U.curves.map(() => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true })); p.add(halo(0xffe7a0, 0.55, 0.9)); g.add(p); return p; });
  U.curlF = (i, c) => { const [a, b, d] = U.joints[i]; a.rotation.x = 0.55 * c; b.rotation.x = 0.85 * c; d.rotation.x = 0.6 * c; };
  U.curl = c => { for (let i = 0; i < 4; i++) U.curlF(i, c); tj.rotation.x = 0.35 * c; };
  U.muscle = (k, on = 1) => { // k = contraction 0..1, on = visibility
    U.muscles.forEach((m, i) => { const kk = Array.isArray(k) ? k[i] : k; m.scale.set(1 + 0.45 * kk, 1 - 0.2 * kk, 1 + 0.45 * kk); m.position.y = -2.3 - 0.12 * kk; m.material.opacity = 0.9 * on; m.children[0].material.opacity = (0.22 + 0.25 * kk) * on; m.visible = on > 0.01; });
    U.mglow.material.opacity = on * (0.18 + 0.3 * (Array.isArray(k) ? Math.max(...k) : k));
  };
  U.pulse = (t, on) => U.pulses.forEach((p, i) => { const q = (t * 0.9 + i * 0.23) % 1; p.position.copy(U.curves[i].getPoint(1 - q)); p.visible = on > 0.01; p.material.opacity = on; p.children[0].material.opacity = 0.9 * on * Math.sin(q * Math.PI); });
  U.tip = i => { const [j, l] = U.tops[i]; return j.localToWorld(V(0, l + 0.08, 0)); };
  U.curl(0); U.muscle(0, 1); U.pulse(0, 0); g.userData = U; return g;
}

function scanRing(color = MUSC) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.011, 8, 48), glowMat(color, 1)); r.add(new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.032, 8, 48), addMat(color, 0.35))); r.rotation.x = Math.PI / 2; return r; }
function bigZero() { // floating red "0" ring + slash, reads instantly without sound
  const g = new THREE.Group(); const o = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.075, 16, 64), glowMat(MUSC, 1)); o.scale.set(0.78, 1.08, 1); g.add(o);
  const og = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.17, 16, 64), addMat(MUSC, 0.3)); og.scale.copy(o.scale); g.add(og); return g;
}

// =============== HOOK / LOOP (s01, s08): extreme close-up of x-ray fingers, red scan finds no muscle ===============
export function hook(mode, tNot = 99) {
  const scene = new THREE.Scene(); const c = cam(34); const dust = xbase(scene, 0.8);
  const a = ArmX(); scene.add(a); const U = a.userData; U.muscle(0, 0);
  const rings = [0, 1, 2, 3].map(() => { const r = scanRing(); scene.add(r); return r; });
  const z = bigZero(); z.position.set(0.62, 1.85, 0.2); z.scale.setScalar(0.5); scene.add(z);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      a.rotation.set(-0.08, -0.22 + 0.08 * Math.sin(t * 1.4), 0.03 * Math.sin(t * 1.9));
      U.curl(0.18 + 0.16 * (0.5 + 0.5 * Math.sin(t * 3.2)));
      a.updateMatrixWorld(true);
      rings.forEach((rg, i) => { const [j, l] = U.tops[i]; const f = (t * 0.85 + i * 0.25) % 1; const p0 = U.joints[i][0].localToWorld(V(0, 0, 0)), p1 = j.localToWorld(V(0, l, 0)); rg.position.copy(mix(p0, p1, f)); rg.quaternion.copy(U.joints[i][1].getWorldQuaternion(new THREE.Quaternion())); rg.rotateX(Math.PI / 2); rg.material.opacity = Math.sin(f * Math.PI); rg.children[0].material.opacity = 0.35 * Math.sin(f * Math.PI); rg.visible = f > 0.12; });
      const zp = mode === 'in' ? clamp((t - tNot) / 0.25) : ss(0.55, 0.85, u);
      z.scale.setScalar(Math.max(0.001, 0.5 * back(clamp(zp * 1.0)) * (1 + 0.06 * Math.sin(t * 10)))); z.rotation.z = 0.15 * Math.sin(t * 2);
      if (t > tNot) { const k = eout(clamp((t - tNot) / 0.25)); z.position.x = lerp(0.62, 0.0, k); z.position.y = lerp(1.85, 1.45, k); z.position.z = lerp(0.2, -0.6, k); z.scale.multiplyScalar(1 + 0.6 * k); }
      look(c, mode === 'in' ? mix(V(0.25, 1.05, 3.4), V(0.1, 1.0, 3.95), eout(u)) : mix(V(0.12, 1.0, 4.4), V(0.25, 1.05, 3.4), eio(u)), V(0, 0.95, 0));
      if (mode === 'in') shake(c, t, 0.0, 0.035, 0.25);
      if (t > tNot) shake(c, t, tNot, 0.04, 0.25);
      dust.rotation.y = t * 0.03;
    },
  };
}

// =============== "So what moves them?" -> "Your forearm!" (s02) ===============
export function reveal(tF) {
  const scene = new THREE.Scene(); const c = cam(34); const dust = xbase(scene, -0.6);
  const a = ArmX(); scene.add(a); const U = a.userData;
  const q = new THREE.Group(); const qm = M(new THREE.TorusGeometry(0.22, 0.07, 12, 40, Math.PI * 1.3), C.yellow, { px: 3, shadow: false }); qm.rotation.z = -0.6; q.add(qm);
  const qd = M(new THREE.SphereGeometry(0.075, 12, 10), C.yellow, { px: 3, shadow: false }); qd.position.y = -0.45; q.add(qd); q.position.set(0.85, 1.7, 0.3); scene.add(q);
  return {
    scene, camera: c,
    update(t, d) {
      const on = ss(tF - 0.02, tF + 0.12, t), k = eio(clamp((t - tF + 0.05) / 0.5));
      U.curl(0.5 + 0.5 * Math.sin(t * 5.5 - 1.5)); U.muscle(on * (0.5 + 0.5 * Math.sin(t * 5.5 - 1.5)), on); U.pulse(t, on);
      a.rotation.set(-0.06, -0.2 + 0.1 * Math.sin(t * 1.2), 0.02);
      q.scale.setScalar(Math.max(0.001, back(clamp(t / 0.3)) * (1 - on))); q.rotation.y = 0.4 * Math.sin(t * 4);
      look(c, mix(V(0.2, 1.0, 3.9), V(0.6, -1.2, 7.6), k), mix(V(0, 0.95, 0), V(0, -1.1, 0), k));
      shake(c, t, tF, 0.06, 0.3);
      dust.rotation.y = t * 0.03;
    },
  };
}

// =============== muscles contract, tendons pull, fingers curl (s03) ===============
export function pull() {
  const scene = new THREE.Scene(); const c = cam(34); const dust = xbase(scene, -0.8);
  const a = ArmX(); scene.add(a); const U = a.userData;
  const arrows = [-0.62, 0.62].map(x => { const g = new THREE.Group(); const s = M(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 10), C.yellow, { px: 3, shadow: false }); s.position.y = -0.35; g.add(s); const h = M(new THREE.ConeGeometry(0.1, 0.18, 14), C.yellow, { px: 3, shadow: false }); h.rotation.x = Math.PI; h.position.y = -0.75; g.add(h); g.position.set(x, -1.1, 0.4); scene.add(g); return g; });
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, cyc = 0.5 - 0.5 * Math.cos(t * 4.2);
      U.curl(cyc); U.muscle(cyc, 1); U.pulse(t * 1.4, 1);
      arrows.forEach(g => { g.position.y = -1.1 - 0.25 * cyc; g.scale.setScalar(Math.max(0.001, back(clamp(t / 0.3)))); });
      a.rotation.set(-0.05, -0.35 + 0.25 * u, 0.02);
      look(c, mix(V(-0.4, -1.4, 6.6), V(0.3, -0.7, 7.4), eio(u)), V(0, -0.8, 0));
      dust.rotation.y = t * 0.03;
    },
  };
}

// =============== puppet strings (s04) ===============
export function puppet() {
  const scene = new THREE.Scene(); const c = cam(34); const dust = xbase(scene, 0.6);
  const a = ArmX(); scene.add(a); const U = a.userData; U.muscle(0.3, 1);
  const bar = new THREE.Group(); const b1 = M(RB(1.6, 0.09, 0.09, 0.03), 0xc58a4a, { px: 4 }); bar.add(b1); const b2 = M(RB(0.09, 0.09, 0.9, 0.03), 0xc58a4a, { px: 4 }); bar.add(b2); scene.add(bar);
  const strings = [0, 1, 2, 3].map(() => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); scene.add(s); return s; });
  const up = V(0, 1, 0);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      bar.position.set(0.05 * Math.sin(t * 3), 2.72 + 0.06 * Math.sin(t * 6), 0.1); bar.rotation.z = 0.22 * Math.sin(t * 5.5); bar.rotation.x = 0.1 * Math.sin(t * 4);
      for (let i = 0; i < 4; i++) U.curlF(i, 0.5 + 0.45 * Math.sin(t * 6.5 + i * 1.4 + bar.rotation.z * 3));
      U.muscle([0, 1, 2, 3].map(i => 0.5 + 0.45 * Math.sin(t * 6.5 + i * 1.4)), 1); U.pulse(t, 0.6);
      a.rotation.set(-0.04, -0.15 + 0.12 * Math.sin(t * 1.3), 0); a.updateMatrixWorld(true); bar.updateMatrixWorld(true);
      strings.forEach((s, i) => { const p0 = bar.localToWorld(V(-0.6 + i * 0.4, 0, 0)), p1 = U.tip(i); const dv = p1.clone().sub(p0); s.position.copy(p0).addScaledVector(dv, 0.5); s.scale.set(1, dv.length(), 1); s.quaternion.setFromUnitVectors(up, dv.normalize()); });
      look(c, mix(V(0.3, 1.5, 6.1), V(0.0, 1.3, 5.2), eout(u)), V(0, 1.25, 0));
      dust.rotation.y = t * 0.03;
    },
  };
}

// =============== wiggle your fingers, watch your arm (s05) ===============
export function wiggle() {
  const scene = new THREE.Scene(); const c = cam(34); const dust = xbase(scene, -0.6);
  const a = ArmX(); scene.add(a); const U = a.userData;
  const eye = new THREE.Group(); const ew = M(new THREE.SphereGeometry(0.2, 20, 14), 0xffffff, { px: 4, shadow: false }); ew.scale.set(1.5, 0.8, 0.3); eye.add(ew);
  const ep = M(new THREE.SphereGeometry(0.1, 16, 12), 0x0b0b0f, { px: 0, shadow: false }); ep.position.z = 0.06; eye.add(ep); eye.position.set(0.5, -1.7, 0.6); scene.add(eye);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, ph = [0, 1.3, 2.6, 3.9];
      for (let i = 0; i < 4; i++) U.curlF(i, 0.45 + 0.4 * Math.sin(t * 13 + ph[i]));
      U.muscle(ph.map(p => 0.45 + 0.4 * Math.sin(t * 13 + p)), 1); U.pulse(t * 2, 1);
      a.rotation.set(-0.05, -0.25 + 0.15 * u, 0.02);
      eye.scale.setScalar(Math.max(0.001, back(clamp((u - 0.35) / 0.12)))); ep.position.x = 0.1 * Math.sin(t * 13);
      look(c, mix(V(0.2, -0.3, 7.6), V(0.5, -1.6, 5.4), eio(ss(0.2, 0.8, u))), mix(V(0, -0.4, 0), V(0, -1.9, 0), eio(ss(0.2, 0.8, u))));
      dust.rotation.y = t * 0.03;
    },
  };
}
