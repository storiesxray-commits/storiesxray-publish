import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, rnd, toon, outlineMat, M, fresnel, glowMat, addMat, halo, setOpacity, Subject, poseFloat, poseStand, lights, stars, earth, shake } from '../../engine/engine.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const back0 = t => { t = clamp(t); const c = 1.70158; return Math.max(0.001, 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2)); };
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l, up) { c.position.copy(p); if (up) c.up.copy(up); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);

// =============== SPACE (shots 1, 2, 13) ===============
export function space(mode) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x060a17);
  const c = cam(mode === 'close' ? 30 : 36);
  lights(scene, { hemi: 0.75, sky: 0x9fc4ff, ground: 0x1b2440, keyI: 2.5, rimI: 1.6, keyPos: [-4, 3, 5], rimPos: [3, -2, -4] });
  scene.add(stars(900, 80, 5));
  const e = earth(9); e.position.set(0.5, -8.3, -12); e.rotation.set(0.4, 1.2, 0.2); scene.add(e);
  const eh = halo(0x3aa0ff, 30, 0.35); eh.position.set(0.5, -6.5, -14); scene.add(eh);
  const s = Subject(); scene.add(s);
  const pivot = new THREE.Group(); scene.add(pivot); pivot.add(s); s.position.y = -1.25; pivot.position.y = 1.25;
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      poseFloat(s, t * 1.6 + 2);
      pivot.rotation.set(0.1 * Math.sin(t * 0.5), -0.15 + 0.06 * t, 0.16 + 0.05 * t);
      e.rotation.y = 1.2 + t * 0.012;
      if (mode === 'close') {
        s.userData.face({ open: 0.75 + 0.15 * Math.sin(t * 5), wide: 1, lookX: 0, lookY: 0.2 });
        const head = new THREE.Vector3(); s.userData.J.head.getWorldPosition(head);
        const k = eout(u);
        look(c, V(lerp(0.6, 0.3, k), head.y + lerp(0.3, 0.16, k), lerp(2.9, 2.05, k)), V(head.x * 0.8, head.y - lerp(0.13, 0.085, k), head.z));
        c.rotation.z += 0.05 - 0.03 * k;
      } else {
        s.userData.face({ open: 0.5, wide: 0.8 });
        const a = lerp(-0.75, 0.8, eio(u)), R = lerp(6.8, 5.6, u);
        look(c, V(Math.sin(a) * R, 1.9 + 0.5 * u, Math.cos(a) * R), V(0, 0.75, 0));
      }
    },
  };
}

// =============== LAB EXTERIOR (shot 3) ===============
function gauge(r = 0.16) {
  const g = new THREE.Group();
  const b = M(new THREE.CylinderGeometry(r, r, 0.07, 28), C.steelDark, { px: 4 }); b.rotation.x = Math.PI / 2; g.add(b);
  const f = new THREE.Mesh(new THREE.CircleGeometry(r * 0.82, 28), new THREE.MeshBasicMaterial({ color: 0xf3efe2 })); f.position.z = 0.037; g.add(f);
  const n = new THREE.Mesh(new THREE.PlaneGeometry(r * 0.1, r * 0.7), new THREE.MeshBasicMaterial({ color: C.red })); n.position.z = 0.04; n.geometry.translate(0, r * 0.3, 0); g.add(n);
  g.userData.needle = n; return g;
}
function pipe(pts, r = 0.07, color = C.steelDark) {
  const curve = new THREE.CatmullRomCurve3(pts.map(p => V(...p)), false, 'catmullrom', 0.05);
  return M(new THREE.TubeGeometry(curve, 48, r, 12), color, { px: 4 });
}
export function labExterior(mode) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1a2029);
  scene.fog = new THREE.Fog(0x1a2029, 12, 30);
  const c = cam(34);
  const L = lights(scene, { hemi: 0.75, sky: 0xcfe0ff, ground: 0x2a2f38, keyI: 2.2, rimI: 0.7, keyPos: [-5, 8, 7], shadow: true, shadowR: 6 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(0x333c48)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 14), toon(0x424d5b)); wall.position.set(0, 7, -4.2); scene.add(wall);
  const band = new THREE.Mesh(new THREE.PlaneGeometry(40, 0.5), toon(0xd9a441)); band.position.set(0, 1.1, -4.18); scene.add(band);
  // chamber
  const ch = new THREE.Group(); scene.add(ch);
  const sh = new THREE.Shape(); const w = 1.75, h0 = 0, h1 = 3.7;
  sh.moveTo(-w, h0); sh.lineTo(w, h0); sh.lineTo(w, h1); sh.lineTo(-w, h1); sh.lineTo(-w, h0);
  const hole = new THREE.Path(); hole.absarc(0, 2.0, 0.95, 0, Math.PI * 2, true); sh.holes.push(hole);
  const front = M(new THREE.ExtrudeGeometry(sh, { depth: 0.3, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 2, curveSegments: 48 }), C.steel, { px: 5 });
  ch.add(front);
  const body = M(new RoundedBoxGeometry(3.5, 3.7, 0.3, 3, 0.05), C.steelDark); body.position.set(0, 1.85, -2.9); ch.add(body);
  for (const s of [-1, 1]) { const side = M(new RoundedBoxGeometry(0.3, 3.7, 3.0, 3, 0.05), C.steelDark); side.position.set(s * 1.6, 1.85, -1.45); ch.add(side); }
  const top = M(new RoundedBoxGeometry(3.7, 0.35, 3.3, 3, 0.08), C.steel); top.position.set(0, 3.8, -1.35); ch.add(top);
  const inBack = new THREE.Mesh(new THREE.PlaneGeometry(3, 3.6), new THREE.MeshBasicMaterial({ color: 0x58483a })); inBack.position.set(0, 1.9, -2.7); ch.add(inBack);
  for (let i = 0; i < 4; i++) { const r = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.08), new THREE.MeshBasicMaterial({ color: 0x3b3029 })); r.position.set(0, 0.9 + i * 0.75, -2.69); ch.add(r); }
  const plat = M(new THREE.CylinderGeometry(0.8, 0.8, 0.5, 32), C.steelDark, { px: 4 }); plat.position.set(0, 0.25, -1.5); ch.add(plat);
  const ring = M(new THREE.TorusGeometry(0.98, 0.11, 14, 64), 0xaab4bf, { px: 5 }); ring.position.set(0, 2.0, 0.33); ch.add(ring);
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2; const b = M(new THREE.SphereGeometry(0.05, 10, 8), C.steelDark, { px: 3 }); b.position.set(Math.cos(a) * 1.2, 2.0 + Math.sin(a) * 1.2, 0.33); ch.add(b); }
  const glass = new THREE.Mesh(new THREE.CircleGeometry(0.95, 48), new THREE.MeshBasicMaterial({ color: 0xbfefff, transparent: true, opacity: 0.12, depthWrite: false })); glass.position.set(0, 2.0, 0.2); glass.renderOrder = 4; ch.add(glass);
  for (const [x, o] of [[-0.35, 0.55], [-0.12, 0.3]]) { const st = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 1.1), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: o, depthWrite: false })); st.position.set(x, 2.15, 0.21); st.rotation.z = -0.6; st.renderOrder = 5; ch.add(st); }
  const g1 = gauge(0.2); g1.position.set(-1.25, 3.25, 0.37); ch.add(g1);
  const g2 = gauge(0.15); g2.position.set(-0.8, 3.3, 0.37); ch.add(g2);
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), new THREE.MeshBasicMaterial({ color: 0x4dff88 })); lamp.position.set(1.3, 3.3, 0.36); ch.add(lamp);
  const lh = halo(0x4dff88, 0.9, 0.7); lh.position.copy(lamp.position); ch.add(lh);
  ch.add(pipe([[1.2, 3.95, -0.6], [1.2, 5.2, -0.6], [1.2, 5.6, -1.2], [1.2, 5.6, -4.1]], 0.12));
  ch.add(pipe([[-1.0, 3.95, -1.6], [-1.0, 4.6, -1.6], [-1.6, 5.0, -1.6], [-4.5, 5.0, -1.6], [-4.5, 5.0, -4.1]], 0.09, 0x9aa5b1));
  for (const s of [-1, 1]) for (let i = 0; i < 5; i++) { const hz = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x15171c : C.yellow })); hz.position.set(s * (1.15 + 0), 0.2, 0.34); hz.position.x = -1.5 + (s > 0 ? 2.1 : 0) + i * 0.22; ch.add(hz); }
  // console
  const con = M(new RoundedBoxGeometry(1.1, 1.0, 0.7, 3, 0.06), 0x55616e); con.position.set(-3.0, 0.5, 0.9); con.rotation.y = 0.5; scene.add(con);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), new THREE.MeshBasicMaterial({ color: 0x8ef0c0 })); scr.position.set(-2.82, 0.72, 1.22); scr.rotation.y = 0.5; scene.add(scr);
  const inL = new THREE.PointLight(0xffc98a, 14, 6); inL.position.set(0, 3.1, -1.2); scene.add(inL);
  const s = Subject({ suit: true }); s.position.set(0, 0.5, -1.5); scene.add(s); poseStand(s);
  const J = s.userData.J;
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d; poseStand(s, t * 2);
      g1.userData.needle.rotation.z = -0.6 + 0.08 * Math.sin(t * 7); g2.userData.needle.rotation.z = 0.9 + 0.05 * Math.sin(t * 9);
      lh.material.opacity = 0.5 + 0.25 * Math.sin(t * 6);
      if (mode === 'wide') {
        const k = eio(u);
        look(c, mix(V(3.6, 7.4, 9.5), V(1.5, 2.9, 8.2), k), mix(V(0, 3.0, 0), V(0, 2.1, 0), k));
        s.userData.face({ open: 0.1 });
      } else {
        const k = eout(u);
        look(c, mix(V(0.9, 2.35, 5.6), V(0.25, 2.25, 3.25), k), V(0, 2.08, -1));
        // thumbs-up / wave
        const wv = ss(0.1, 0.5, u);
        J.arm.R.a.rotation.set(0, 0, 0.16 + 2.2 * wv); J.arm.R.b.rotation.set(0, 0, 0.5 * wv + 0.3 * wv * Math.sin(t * 9));
        J.head.rotation.y = 0.15 * Math.sin(t * 1.5); s.userData.face({ open: 0.25, wide: 0.1 });
      }
    },
  };
}

// =============== CHAMBER INTERIOR (shots 4, 11, 12) ===============
function interior(scene) {
  const R = 3.7, q = R / 2.3;
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 5, 64, 1, true), toon(0x6d7986, { side: THREE.BackSide })); wall.position.y = 2.5; wall.receiveShadow = true; scene.add(wall);
  for (let i = 0; i < 5; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(R - 0.03, 0.06, 8, 64), toon(0x485360)); r.rotation.x = Math.PI / 2; r.position.y = 0.5 + i * 0.95; scene.add(r); }
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + 0.2; const st = new THREE.Mesh(new THREE.BoxGeometry(0.1, 5, 0.06), toon(0x56626f)); st.position.set(Math.sin(a) * (R - 0.04), 2.5, Math.cos(a) * (R - 0.04)); st.rotation.y = a; scene.add(st); }
  const floor = new THREE.Mesh(new THREE.CircleGeometry(R, 64), toon(0x39424e)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  for (let i = -12; i <= 12; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.035, 7.4), new THREE.MeshBasicMaterial({ color: 0x252b33 })); l.rotation.x = -Math.PI / 2; l.position.set(i * 0.3, 0.004, 0); scene.add(l); }
  // window (to the lab)
  const win = new THREE.Group(); win.position.set(-0.9 * q, 2.05, -2.1 * q); win.rotation.y = 0.4; win.scale.setScalar(1.5); scene.add(win);
  const wr = M(new THREE.TorusGeometry(0.55, 0.08, 12, 48), 0xaab4bf, { px: 4 }); win.add(wr);
  const wg = new THREE.Mesh(new THREE.CircleGeometry(0.55, 40), new THREE.MeshBasicMaterial({ color: 0xffe7b0 })); wg.position.z = -0.02; win.add(wg);
  const wh = halo(0xffd9a0, 2.6, 0.35); win.add(wh);
  // warning lamp
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), new THREE.MeshBasicMaterial({ color: 0x5a1512 })); lamp.position.set(1.05 * q, 2.9, -2.0 * q); scene.add(lamp);
  const lb = M(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 20), C.steelDark, { px: 3 }); lb.rotation.x = Math.PI / 2; lb.position.set(1.07 * q, 2.9, -2.06 * q); scene.add(lb);
  const lhalo = halo(C.red, 3.2, 0); lhalo.position.copy(lamp.position); scene.add(lhalo);
  const lred = new THREE.PointLight(C.red, 0, 12); lred.position.set(1.2, 2.8, -2.0); scene.add(lred);
  // vents
  const vents = [];
  for (const s of [-1, 1]) {
    const v = M(new RoundedBoxGeometry(0.7, 0.4, 0.12, 2, 0.03), C.steelDark, { px: 4 }); v.position.set(s * 1.75 * q, 0.55, -1.42 * q); v.rotation.y = -s * 0.9; scene.add(v); vents.push(v);
  }
  const setAlarm = (on, t) => {
    const b = on ? (0.55 + 0.45 * Math.sin(t * 11)) : 0;
    lamp.material.color.setHex(on ? 0xff3b30 : 0x5a1512); lhalo.material.opacity = 0.75 * b; lred.intensity = 22 * b;
  };
  return { setAlarm, vents, win };
}
function mist(scene, n, seed) {
  const r = rnd(seed), arr = [];
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }));
    m.userData = { a: r(), b: r(), c: r(), d: r() }; scene.add(m); arr.push(m);
  }
  return arr;
}

export function hoseSnap() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x12161d);
  const c = cam(34);
  const L = lights(scene, { hemi: 0.6, keyI: 2.0, rimI: 0.9, keyPos: [-3, 6, 5], shadow: true, shadowR: 4 });
  const I = interior(scene);
  const s = Subject({ suit: true }); scene.add(s); poseStand(s); const J = s.userData.J;
  s.rotation.y = -0.25;
  const hoseMat = toon(0x2e3640); let hose = new THREE.Mesh(new THREE.BufferGeometry(), hoseMat), hol = new THREE.Mesh(new THREE.BufferGeometry(), outlineMat(4)); scene.add(hose, hol);
  const nozzle = M(new THREE.CylinderGeometry(0.045, 0.055, 0.1, 16), 0xc9a13a, { px: 3 }); scene.add(nozzle);
  const puffs = mist(scene, 26, 3);
  const TS = 0.78;
  return {
    scene, camera: c,
    update(t, d) {
      const k = t - TS, after = k > 0;
      poseStand(s, t * 2);
      s.updateMatrixWorld(true);
      const vp = new THREE.Vector3(); J.valve.getWorldPosition(vp); const vn = V(0, 0, 1).applyQuaternion(J.valve.getWorldQuaternion(new THREE.Quaternion()));
      // hose end
      let end = vp.clone().add(vn.clone().multiplyScalar(0.07));
      if (after) {
        const q = eout(k / 0.9), wob = Math.exp(-k * 1.6);
        end = vp.clone().add(V(0.25 + 0.95 * q + 0.25 * Math.sin(k * 17) * wob, -0.05 + 0.5 * Math.sin(k * 6.5) * wob - 0.75 * q, 0.35 + 0.55 * q + 0.3 * Math.cos(k * 14) * wob));
      }
      const base = V(2.3, 0.2, 1.3);
      const mid1 = end.clone().add((after ? V(0.2, -0.2, 0.25) : vn.clone().multiplyScalar(0.32).add(V(0.1, -0.12, 0))));
      const mid2 = mix(end, base, 0.55).add(V(0.1, after ? -0.15 + 0.2 * Math.sin(k * 9) * Math.exp(-k * 1.5) : -0.45, 0.45));
      const curve = new THREE.CatmullRomCurve3([end, mid1, mid2, base]);
      hose.geometry.dispose(); hose.geometry = new THREE.TubeGeometry(curve, 40, 0.04, 10); hol.geometry = hose.geometry;
      nozzle.position.copy(end); nozzle.quaternion.setFromUnitVectors(V(0, 1, 0), mid1.clone().sub(end).normalize());
      // reaction
      const re = after ? ss(0.05, 0.45, k) : 0;
      J.arm.L.a.rotation.z = -0.16 - 1.0 * re; J.arm.R.a.rotation.z = 0.16 + 0.9 * re; J.arm.L.b.rotation.x = -0.12 - 1.1 * re; J.arm.R.b.rotation.x = -0.12 - 1.2 * re;
      J.chest.rotation.x = -0.12 * re + 0.05 * re * Math.sin(k * 5); J.head.rotation.x = 0.25 * re; J.head.rotation.y = 0.3 * re;
      s.userData.face({ open: 0.2 + 0.7 * re, wide: re, lookX: 0.6 * re, lookY: -0.6 * re });
      I.setAlarm(after && k > 0.15, k);
      // vapor
      for (const p of puffs) {
        const u0 = p.userData, life = 0.9 + u0.b * 0.7, kk = k - u0.a * 0.9;
        if (!after || kk < 0 || kk > life) { p.material.opacity = 0; p.visible = false; continue; }
        const f = kk / life; p.visible = true;
        const dir = vn.clone().add(V(u0.c - 0.5, u0.d - 0.3, 0).multiplyScalar(1.1)).normalize();
        p.position.copy(vp).add(dir.multiplyScalar(0.08 + eout(f) * (0.5 + u0.b * 0.6))); p.position.y += f * 0.2;
        p.scale.setScalar(0.03 + 0.2 * eout(f) * (0.6 + u0.c)); p.material.opacity = 0.7 * (1 - f);
      }
      // camera
      const q = after ? eio(clamp(k / 1.0)) : 0;
      const p0 = vp.clone().add(V(0.42, 0.1, 0.95 - 0.12 * t)), p1 = V(0.85, 1.5, 3.25 - 0.15 * Math.max(k, 0));
      look(c, mix(p0, p1, q), mix(vp, V(0.05, 1.32, 0), q));
      shake(c, t, TS, 0.035, 0.3);
    },
  };
}

export function passOut() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0e1218);
  const c = cam(34);
  lights(scene, { hemi: 0.45, keyI: 1.5, rimI: 0.9, keyPos: [-3, 6, 5], shadow: true, shadowR: 4 });
  const I = interior(scene);
  const s = Subject({ suit: true }); scene.add(s); const J = s.userData.J; s.rotation.y = -0.3;
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d; poseStand(s, t * 2); I.setAlarm(true, t);
      const sway = (1 - ss(0.3, 0.5, u)) * Math.sin(t * 5.5);
      const f = eio(ss(0.3, 0.62, u)), f2 = eio(ss(0.45, 0.8, u));
      J.hips.position.y = lerp(0.95, 0.53, f); J.hips.rotation.z = 0.07 * sway;
      for (const n of ['L', 'R']) { J.leg[n].l.rotation.x = -1.15 * f; J.leg[n].kn.rotation.x = 2.05 * f; }
      J.chest.rotation.x = 0.06 * sway + 0.95 * f2; J.chest.rotation.z = 0.08 * sway + 0.12 * f2;
      J.head.rotation.x = 0.55 * f2; J.head.rotation.z = 0.1 * sway + 0.25 * f2;
      J.arm.L.a.rotation.set(-0.5 * f2, 0, -0.16 - 0.25 * (1 - f) * Math.abs(sway)); J.arm.R.a.rotation.set(-0.6 * f2, 0, 0.16 + 0.25 * (1 - f) * Math.abs(sway));
      s.userData.face({ open: 0.5 - 0.3 * f2, wide: 0.6 * (1 - f), closed: ss(0.25, 0.5, u) });
      const k = eio(u);
      look(c, mix(V(1.0, 2.45, 3.0), V(0.9, 0.95, 2.9), k), mix(V(0, 1.45, 0), V(0, 0.85, 0.15), k));
    },
  };
}

export function wakeUp() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0e1218);
  const c = cam(32);
  const L = lights(scene, { hemi: 0.4, keyI: 1.2, rimI: 0.8, keyPos: [-3, 6, 3], shadow: true, shadowR: 4 });
  const I = interior(scene);
  const s = Subject({ suit: true }); scene.add(s); const J = s.userData.J;
  s.rotation.x = -Math.PI / 2; s.position.set(0, 0.24, 0.9); poseStand(s);
  J.arm.L.a.rotation.z = -0.55; J.arm.R.a.rotation.z = 0.45; J.leg.L.l.rotation.z = -0.14; J.leg.R.l.rotation.z = 0.12;
  const puffs = mist(scene, 34, 9);
  const head = V(0, 0.42, -0.81);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, fl = ss(0.08, 0.3, u);
      I.setAlarm(u < 0.1, t);
      L.key.intensity = lerp(1.0, 3.0, fl); L.hemi.intensity = lerp(0.35, 1.25, fl); L.hemi.color.setHex(0xfff2dd);
      const open = ss(0.4, 0.5, u), blink = ss(0.66, 0.69, u) * (1 - ss(0.71, 0.74, u));
      s.userData.face({ open: 0.15 + 0.2 * ss(0.6, 0.75, u), wide: 0.05 * open, closed: Math.max(1 - open, blink), lookY: 0.2 });
      J.head.rotation.y = 0.25 * (1 - ss(0.55, 0.9, u)); J.arm.R.b.rotation.x = -0.12 - 0.7 * ss(0.7, 1, u);
      for (const p of puffs) {
        const a = p.userData, side = a.a < 0.5 ? -1 : 1, f = clamp((u - 0.05 - a.b * 0.35) / 0.6);
        if (f <= 0 || f >= 1) { p.visible = false; continue; } p.visible = true;
        p.position.set(side * lerp(1.8, 0.15 + a.c * 0.5, eout(f)), 0.2 + a.d * 0.5 + f * 0.5, -1.3 + a.c * 2.6 + (a.d - 0.5) * f);
        p.scale.setScalar(0.16 + 0.42 * f * (0.5 + a.d)); p.material.opacity = 0.2 * Math.sin(f * Math.PI);
      }
      const k = eio(u);
      look(c, mix(V(0.75, 3.3, 0.35), V(0.22, 1.75, -0.62), k), mix(V(0, 0.3, -0.3), head, k), V(0, 0, -1));
    },
    ui(t, d) { const u = t / d; return { flash: 0.85 * ss(0.06, 0.12, u) * (1 - ss(0.12, 0.3, u)) }; },
  };
}

// =============== X-RAY SCENES ===============
function xbase() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(C.bg);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.6, rimI: 1.0, key: 0xffffff });
  // floating dust for depth
  const r = rnd(11), n = 160, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = (r() - .5) * 8; pos[i * 3 + 1] = (r() - .5) * 10 + 1; pos[i * 3 + 2] = (r() - .5) * 8 - 2; }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x2aa9c4, size: 4, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false })); scene.add(dust);
  const bh = halo(0x0f5f78, 9, 0.5); bh.position.set(0, 1.3, -3); scene.add(bh);
  return { scene, dust, bh };
}
const bone = 0xd9fbff;
function glowMesh(geo, color = C.cyan, op = 0.95) { return new THREE.Mesh(geo, glowMat(color, op)); }

export function xrayLungs() {
  const { scene, dust } = xbase(); const c = cam(32);
  const solid = Subject(); poseStand(solid); scene.add(solid);
  const x = Subject({ xray: true }); poseStand(x); scene.add(x); const J = x.userData.J;
  const org = new THREE.Group(); J.chest.add(org);
  // spine + ribs
  for (let i = 0; i < 11; i++) { const v = glowMesh(new RoundedBoxGeometry(0.04, 0.03, 0.04, 2, 0.01), bone, 0.75); v.position.set(0, 0.04 + i * 0.047, -0.075); org.add(v); }
  for (let i = 0; i < 7; i++) {
    const R = 0.118 + 0.028 * Math.sin((i + 0.6) / 7 * Math.PI);
    const rg = new THREE.TorusGeometry(R, 0.0095, 8, 40, Math.PI * 1.62); rg.rotateZ(-0.31 * Math.PI); rg.rotateX(Math.PI / 2); rg.scale(1.18, 1, 0.74);
    const rib = glowMesh(rg, bone, 0.72); rib.rotation.x = 0.16; rib.position.set(0, 0.45 - i * 0.043, -0.005); org.add(rib);
  }
  const st = glowMesh(new RoundedBoxGeometry(0.03, 0.2, 0.015, 2, 0.006), bone, 0.6); st.position.set(0, 0.34, 0.1); org.add(st);
  // lungs
  const lungs = [];
  for (const s of [-1, 1]) {
    const lg = new THREE.Group(); lg.position.set(s * 0.078, 0.42, 0.005); org.add(lg);
    const l = glowMesh(new THREE.SphereGeometry(1, 28, 20), C.cyan, 0.9); l.scale.set(0.07, 0.125, 0.075); l.position.y = -0.115; lg.add(l);
    const l2 = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), addMat(C.cyan, 0.3)); l2.scale.set(0.085, 0.14, 0.09); l2.position.y = -0.115; lg.add(l2);
    lungs.push(lg);
  }
  const tr = glowMesh(new THREE.CylinderGeometry(0.016, 0.016, 0.2, 10), 0x9eefff, 0.85); tr.position.set(0, 0.5, 0.01); org.add(tr);
  // air particles
  const r = rnd(4), parts = [];
  for (let i = 0; i < 70; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 6), new THREE.MeshBasicMaterial({ color: 0xe8fdff, transparent: true })); p.userData = { o: r(), s: r() < .5 ? -1 : 1, a: r() - .5, b: r() - .5, c: r() }; org.add(p); parts.push(p); }
  const path = (s) => new THREE.CatmullRomCurve3([V(s * 0.075, 0.3, 0.01), V(s * 0.03, 0.42, 0.01), V(0, 0.52, 0.02), V(0, 0.6, 0.06), V(0, 0.635, 0.15)]);
  const pL = path(-1), pR = path(1);
  const scan = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.035), addMat(0xaef6ff, 0.95)); scene.add(scan);
  const scan2 = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.35), addMat(C.cyan, 0.22)); scene.add(scan2);
  solid.userData.face({ open: 0.85, wide: 0.9 });
  org.traverse(o => { if (o.isMesh) { o.material = o.material.clone(); o.material.userData.o0 = o.material.opacity; } });
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, tr0 = ss(0.12, 0.42, t);
      setOpacity(solid, 1 - tr0); setOpacity(x, tr0);
      org.visible = tr0 > 0.05; org.traverse(o => { if (o.isMesh) { o.visible = true; o.material.opacity = o.material.userData.o0 * tr0; } });
      const sy = lerp(1.95, 0.95, clamp(t / 0.5)); scan.position.set(0, sy, 0.3); scan2.position.set(0, sy + 0.15, 0.3); scan.visible = scan2.visible = t < 0.5;
      const df = eio(ss(0.25, 0.95, u)), puls = 1 + 0.03 * Math.sin(t * 20) * (1 - df);
      for (const l of lungs) l.scale.set(lerp(1, 0.52, df) * puls, lerp(1, 0.6, df), lerp(1, 0.5, df) * puls);
      for (const p of parts) {
        const a = p.userData, f = (t * 0.85 + a.o * 1.4) % 1.4 / 1.4;
        if (f < 0.55) { const q = f / 0.55; p.position.copy((a.s < 0 ? pL : pR).getPoint(q)); p.position.x += a.a * 0.012; p.position.z += a.b * 0.012; }
        else { const q = (f - 0.55) / 0.45; p.position.set(a.a * 0.55 * q, 0.635 + (a.b * 0.3 - 0.05) * q, 0.15 + (0.5 + a.c * 0.6) * q); }
        p.material.opacity = tr0 * (f < 0.55 ? 1 : 1 - (f - 0.55) / 0.45) * (u > 0.12 ? 1 : 0); p.scale.setScalar(f < 0.55 ? 1 : 1 + 2 * (f - 0.55));
      }
      dust.rotation.y = t * 0.03;
      const k = eout(u);
      look(c, mix(V(0.8, 1.62, 3.0), V(0.42, 1.5, 1.6), k), mix(V(0, 1.42, 0), V(0, 1.36, 0), k));
    },
    ui(t) { return { flash: 0.35 * (1 - ss(0.0, 0.45, t)) * ss(0.02, 0.1, t) }; },
  };
}

export function xrayMouth(mode) {
  const { scene, dust, bh } = xbase(); const c = cam(34); bh.position.set(0, 0.3, -3);
  const shell = new THREE.Mesh(new THREE.SphereGeometry(1.75, 48, 32), fresnel(C.cyan, 2.4, 0.8, 0.01)); shell.position.set(0, 0.55, -0.9); shell.scale.set(0.95, 1.05, 1.05); scene.add(shell);
  const arc = (y, R, n, open, zs = 1) => {
    const g = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const a = lerp(-1.25, 1.25, i / (n - 1)); const big = Math.abs(a) > 0.65;
      const tth = glowMesh(new RoundedBoxGeometry(big ? 0.15 : 0.115, 0.17, big ? 0.15 : 0.07, 3, 0.03), bone, 0.92);
      tth.position.set(Math.sin(a) * R, y, Math.cos(a) * R * zs - R * zs); tth.rotation.y = a; g.add(tth);
    }
    const gum = glowMesh(new THREE.TorusGeometry(R, 0.075, 10, 40, 2.7), 0x1594ad, 0.75);
    gum.rotation.set(Math.PI / 2, 0, Math.PI / 2 - 1.35); gum.scale.y = zs; gum.position.set(0, y - open * 0.11, -R * zs); g.add(gum);
    return g;
  };
  const lower = arc(0.02, 0.68, 14, 1); lower.position.z = 0.62; scene.add(lower);
  const upper = arc(0.86, 0.72, 14, -1); upper.position.z = 0.68; scene.add(upper);
  const tongue = M(new THREE.SphereGeometry(1, 40, 28), 0xff5a4f, { px: 5, shadow: false }); tongue.scale.set(0.47, 0.15, 0.66); tongue.position.set(0, 0.03, 0.0); scene.add(tongue);
  const groove = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.01, 0.8), new THREE.MeshBasicMaterial({ color: 0xc23a33 })); groove.position.set(0, 0.181, 0.02); scene.add(groove);
  const th = halo(C.red, 2.6, 0.35); th.position.set(0, 0.2, 0.1); scene.add(th);
  const r = rnd(8), bubbles = [];
  const bm = toon(0xffd2cd);
  for (let i = 0; i < 46; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), bm); const ol = new THREE.Mesh(b.geometry, outlineMat(3)); b.add(ol);
    const hl = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff })); hl.position.set(-0.35, 0.45, 0.6); b.add(hl);
    const px = (r() - .5) * 0.74, pz = (r() - .5) * 1.05 + 0.02;
    const yy = 0.03 + 0.15 * Math.sqrt(Math.max(0.02, 1 - (px / 0.47) ** 2 - (pz / 0.66) ** 2));
    b.userData = { x: px, z: pz, y: yy, o: r() * 2, sp: 0.8 + r() * 0.9, s: 0.035 + r() * 0.05 }; scene.add(b); bubbles.push(b);
  }
  const steam = []; for (let i = 0; i < 14; i++) { const s = halo(0xffc9c4, 0.3, 0); s.userData = { x: (r() - .5) * 0.7, z: (r() - .5) * 0.8, o: r() }; scene.add(s); steam.push(s); }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, T = mode === 'b' ? t + 3 : t, inten = mode === 'b' ? 1 : ss(0, 0.5, u);
      for (const b of bubbles) {
        const a = b.userData, f = ((T * a.sp + a.o) % 1.6) / 1.6;
        const grow = ss(0, 0.6, f), pop = ss(0.6, 0.68, f);
        const sc = a.s * grow * (1 + 0.9 * pop) * (0.4 + 0.6 * inten);
        b.visible = f < 0.68 && sc > 0.004; b.scale.setScalar(Math.max(sc, 0.001)); b.position.set(a.x, a.y + sc * 0.7 + pop * 0.03, a.z);
      }
      for (const s of steam) { const a = s.userData, f = (T * 0.5 + a.o) % 1; s.position.set(a.x + 0.05 * Math.sin(T * 2 + a.o * 9), 0.25 + f * 0.75, a.z); s.material.opacity = 0.3 * inten * Math.sin(f * Math.PI); s.scale.setScalar(0.2 + f * 0.35); }
      tongue.scale.y = 0.15 + 0.006 * Math.sin(T * 12); th.material.opacity = 0.25 + 0.15 * Math.sin(T * 8);
      dust.rotation.y = t * 0.03;
      if (mode === 'a') { const k = eout(u); look(c, mix(V(1.5, 1.9, 4.9), V(0.75, 1.3, 3.3), k), V(0, 0.36, -0.05)); }
      else { const k = eio(u); look(c, mix(V(-1.15, 0.85, 2.5), V(-0.35, 0.72, 1.75), k), V(0.02, 0.22, 0.05)); }
    },
  };
}

export function xrayArm() {
  const { scene, dust, bh } = xbase(); const c = cam(34); bh.position.set(0, 0, -3);
  const fm = fresnel(C.cyan, 1.6, 1.7, 0.05); const g = new THREE.Group(); scene.add(g);
  const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.185, 1.7, 32, 1), fm); fa.rotation.z = -Math.PI / 2; fa.scale.z = 0.8; fa.position.x = -0.35; g.add(fa);
  const el = new THREE.Mesh(new THREE.SphereGeometry(0.185, 24, 16), fm); el.position.x = -1.2; el.scale.z = 0.8; g.add(el);
  const palm = new THREE.Mesh(new RoundedBoxGeometry(0.42, 0.34, 0.12, 4, 0.06), fm); palm.position.set(0.72, 0, 0); g.add(palm);
  const fingers = [];
  for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.036, 0.26, 6, 12), fm); f.rotation.z = -Math.PI / 2 + (i - 1.5) * 0.07; f.position.set(1.1, 0.135 - i * 0.09, 0); g.add(f); fingers.push(f); }
  const th = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.2, 6, 12), fm); th.rotation.z = -0.75; th.position.set(0.7, 0.26, 0); g.add(th);
  // bones
  const bm = glowMat(bone, 0.62);
  for (const y of [0.045, -0.05]) {
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.028, 1.5, 6, 12), bm); b.rotation.z = -Math.PI / 2; b.position.set(-0.35, y, -0.02); g.add(b);
    for (const x of [-1.1, 0.4]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.048, 12, 10), bm); e.position.set(x, y, -0.02); g.add(e); }
  }
  for (let i = 0; i < 4; i++) for (const [x, l] of [[0.72, 0.26], [1.03, 0.1], [1.2, 0.08]]) { const b = new THREE.Mesh(new THREE.CapsuleGeometry(0.014, l, 4, 8), bm); b.rotation.z = -Math.PI / 2 + (i - 1.5) * 0.07; b.position.set(x, (0.125 - i * 0.083) * (x < 0.9 ? 0.75 : 1), -0.01); g.add(b); }
  // veins
  const curves = [
    [[-1.25, 0.07, 0.09], [-0.8, 0.1, 0.11], [-0.3, 0.04, 0.1], [0.2, 0.07, 0.085], [0.6, 0.1, 0.06], [0.95, 0.12, 0.04], [1.3, 0.13, 0.03]],
    [[-1.25, -0.06, 0.1], [-0.75, -0.02, 0.12], [-0.25, -0.07, 0.1], [0.25, -0.03, 0.085], [0.62, -0.05, 0.06], [0.98, -0.04, 0.04], [1.3, -0.05, 0.03]],
    [[-0.3, 0.04, 0.1], [-0.05, -0.02, 0.1], [0.25, -0.03, 0.085]],
    [[0.2, 0.07, 0.085], [0.5, 0.02, 0.07], [0.8, 0.03, 0.05], [1.28, 0.04, 0.03]],
    [[0.25, -0.03, 0.085], [0.6, -0.11, 0.06], [0.95, -0.125, 0.04], [1.26, -0.13, 0.03]],
  ].map(p => new THREE.CatmullRomCurve3(p.map(q => V(...q))));
  const pulses = [];
  curves.forEach((cv, i) => {
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 60, i < 2 ? 0.017 : 0.012, 8), glowMat(C.cyan, 1)));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 60, i < 2 ? 0.045 : 0.03, 8), addMat(C.cyan, 0.28)));
    const n = i < 2 ? 9 : 4; for (let j = 0; j < n; j++) { const p = new THREE.Mesh(new THREE.SphereGeometry(i < 2 ? 0.026 : 0.019, 10, 8), new THREE.MeshBasicMaterial({ color: 0xeaffff })); const h = halo(0x8ff3ff, 0.16, 0.8); p.add(h); p.userData = { cv, o: j / n }; g.add(p); pulses.push(p); }
  });
  g.rotation.set(0.1, -0.25, -1.9); g.scale.set(1, 1.7, 1.5);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      for (const p of pulses) { const f = (t * 0.33 + p.userData.o) % 1; p.position.copy(p.userData.cv.getPoint(f)); p.scale.setScalar(Math.sin(f * Math.PI) > 0.08 ? 1 : 0.01); }
      fingers.forEach((f, i) => f.rotation.z = -Math.PI / 2 + (i - 1.5) * 0.07 + 0.03 * Math.sin(t * 2 + i));
      g.rotation.y = -0.35 + 0.4 * u; dust.rotation.y = t * 0.04;
      const k = eout(u); look(c, mix(V(0.3, 0.1, 6.3), V(0.1, 0.2, 5.3), k), V(0.0, 0.35, 0));
    },
  };
}

function cell(color = C.red, px = 4) {
  const pts = []; for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI; const x = Math.sin(a); const rr = 0.5 + 0.5 * (1 - Math.cos(a * 1)) / 2; pts.push(new THREE.Vector2(Math.sin(a * 0.5) * 1.0, 0)); }
  // biconcave disc: torus-like rim + flat centre
  const g = new THREE.Group();
  const mat = toon(color);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.3, 14, 32), mat); rim.rotation.x = Math.PI / 2; g.add(rim);
  const rol = new THREE.Mesh(rim.geometry, outlineMat(px)); rim.add(rol);
  const mid = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.26, 28), mat); g.add(mid);
  g.userData.mat = mat; return g;
}
function vessel(len = 9, R = 1) {
  const g = new THREE.Group(); const gap = 1.9, ts = gap / 2, tl = Math.PI * 2 - gap;
  const outer = new THREE.Mesh(new THREE.CylinderGeometry(R, R, len, 64, 1, true, ts, tl), toon(0x1fb5cf)); g.add(outer);
  outer.add(new THREE.Mesh(outer.geometry, outlineMat(5)));
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.84, R * 0.84, len, 64, 1, true, ts, tl), toon(0x0c5f74, { side: THREE.BackSide })); g.add(inner);
  for (const s of [-1, 1]) { const a = s * ts; const e = new THREE.Mesh(new THREE.BoxGeometry(R * 0.16, len, 0.04), new THREE.MeshBasicMaterial({ color: 0x8cecff })); e.position.set(Math.sin(a) * R * 0.92, 0, Math.cos(a) * R * 0.92); e.rotation.y = a + Math.PI / 2; g.add(e); }
  for (let i = 0; i < 9; i++) { const rg = new THREE.Mesh(new THREE.TorusGeometry(R * 1.01, 0.03, 6, 48, tl), new THREE.MeshBasicMaterial({ color: 0x0d7f98 })); rg.rotation.set(Math.PI / 2, 0, Math.PI / 2 - ts - tl); rg.position.y = -len / 2 + (i + 0.5) * len / 9; g.add(rg); }
  return g;
}
function arrow() {
  const g = new THREE.Group();
  const s = M(new THREE.CylinderGeometry(0.07, 0.07, 0.42, 12), C.yellow, { px: 4, shadow: false }); s.position.y = 0.36; g.add(s);
  const h = M(new THREE.ConeGeometry(0.18, 0.3, 16), C.yellow, { px: 4, shadow: false }); h.rotation.x = Math.PI; h.position.y = 0.06; g.add(h);
  return g;
}
export function vesselPressure() {
  const { scene, dust, bh } = xbase(); const c = cam(34); bh.position.set(0, 0, -3);
  const v = vessel(10, 1); v.rotation.z = Math.PI / 2; v.rotation.x = -0.55; scene.add(v);
  const r = rnd(2), cells = [];
  for (let i = 0; i < 16; i++) { const cl = cell(); cl.scale.setScalar(0.3); cl.userData.o = i / 16 + r() * 0.03; cl.userData.p = [(r() - .5) * 0.75, (r() - .5) * 0.7]; cl.userData.rot = [r() * 6, r() * 6, r() * 2 - 1]; v.add(cl); cells.push(cl); }
  const arrows = [];
  for (let j = 0; j < 3; j++) for (const sgn of [1, -1]) { const a = arrow(); a.userData = { x: (j - 1) * 1.25 + (sgn > 0 ? 0.3 : -0.3), sgn, o: j * 0.7 + (sgn > 0 ? 0 : 1.2) }; a.rotation.z = sgn > 0 ? 0 : Math.PI; scene.add(a); arrows.push(a); }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      for (const cl of cells) { const f = (t * 0.16 + cl.userData.o) % 1; cl.position.set(cl.userData.p[0] * 0.6, lerp(5, -5, f), cl.userData.p[1] * 0.6 - 0.05); cl.rotation.set(cl.userData.rot[0] + t * cl.userData.rot[2], cl.userData.rot[1], t * 0.8 * cl.userData.rot[2]); }
      for (const a of arrows) { const push = 0.5 + 0.5 * Math.sin(t * 7 - a.userData.o); const R = (a.userData.sgn > 0 ? 1.02 : 1.1) + 0.26 * (1 - push); a.position.set(a.userData.x, (a.userData.sgn > 0 ? R - 0.1 : -R + 0.85), 1.0); a.scale.setScalar(0.85 * back0(ss(0.04, 0.22, u - a.userData.o * 0.02))); }
      v.scale.set(1 - 0.012 * Math.sin(t * 7), 1, 1 - 0.012 * Math.sin(t * 7));
      dust.rotation.y = t * 0.04;
      const a = lerp(-0.32, 0.22, eio(u)); look(c, V(Math.sin(a) * 6.9, 1.2, Math.cos(a) * 6.9), V(0, -0.15, 0));
    },
  };
}
export function cellsNoOxygen() {
  const { scene, dust, bh } = xbase(); const c = cam(34); bh.position.set(0, 0, -3);
  const v = vessel(16, 1); scene.add(v);
  const r = rnd(6), cells = [];
  const red = new THREE.Color(C.red), grey = new THREE.Color(0x5b616b);
  for (let i = 0; i < 22; i++) { const cl = cell(); cl.scale.setScalar(0.33); cl.userData.o = i / 22 + r() * 0.02; cl.userData.p = [(r() - .5) * 0.9, (r() - .5) * 0.75]; cl.userData.rot = [r() * 6, r() * 6, r() * 2 - 1]; v.add(cl); cells.push(cl); }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, wave = lerp(-5.5, 4.5, ss(0.12, 0.92, u));
      for (const cl of cells) {
        const f = (t * 0.11 + cl.userData.o) % 1, y = lerp(-8, 8, f);
        cl.position.set(cl.userData.p[0] * 0.6, y, cl.userData.p[1] * 0.6 - 0.05); cl.rotation.set(cl.userData.rot[0] + t * 0.7 * cl.userData.rot[2], cl.userData.rot[1], Math.PI / 2 + 0.4 * cl.userData.rot[2]);
        const gk = ss(wave + 0.6, wave - 0.6, y); cl.userData.mat.color.copy(red).lerp(grey, gk);
      }
      dust.rotation.y = t * 0.04;
      const k = eout(u); look(c, mix(V(0.9, -1.6, 7.6), V(0.5, -0.5, 5.6), k), mix(V(0, 0.2, 0), V(0, 0.9, 0), k)); c.rotation.z += 0.06;
      shake(c, t, 0.05, 0.05, 0.25);
    },
    ui(t, d) { return { strike: ss(0.5, 0.62, t / d) }; },
  };
}

export function brainOut() {
  const { scene, dust, bh } = xbase(); const c = cam(32); bh.position.set(0, 1.7, -3);
  const x = Subject({ xray: true }); poseStand(x); x.rotation.y = Math.PI / 2 - 0.25; scene.add(x); const J = x.userData.J;
  const br = new THREE.Group(); br.position.set(0, 0.035, -0.012); J.head.add(br);
  const r = rnd(31), bmat = toon(C.cyan), lobes = [];
  for (let i = 0; i < 22; i++) {
    const p = V((r() - .5) * 0.15, (r() - .5) * 0.1 + 0.012, (r() - .5) * 0.19);
    if ((p.x / 0.085) ** 2 + (p.y / 0.06) ** 2 + (p.z / 0.105) ** 2 > 1) { i--; continue; }
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.036 + r() * 0.018, 16, 12), bmat); m.position.copy(p); m.add(new THREE.Mesh(m.geometry, outlineMat(3.5, 0x04222b))); br.add(m); lobes.push(m);
  }
  const cb = new THREE.Mesh(new THREE.SphereGeometry(0.04, 14, 10), bmat); cb.position.set(0, -0.055, -0.07); cb.add(new THREE.Mesh(cb.geometry, outlineMat(3.5, 0x04222b))); br.add(cb);
  const bhalo = halo(C.cyan, 0.75, 0.55); bhalo.position.set(0, 0.03, 0); J.head.add(bhalo);
  const stemCurve = new THREE.CatmullRomCurve3([V(0, 0.2, 0.02), V(0, 0.42, 0.01), V(0, 0.56, -0.01), V(0, 0.66, -0.02), V(0, 0.71, -0.02)]);
  const art = new THREE.Mesh(new THREE.TubeGeometry(stemCurve, 30, 0.014, 8), glowMat(0x8cecff, 0.9)); J.chest.add(art);
  const cells = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.019, 12, 10), toon(0x5b616b)); m.add(new THREE.Mesh(m.geometry, outlineMat(2.5))); m.userData.o = i / 12; J.chest.add(m); cells.push(m); }
  const cy = new THREE.Color(C.cyan), dk = new THREE.Color(0x2f3640);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      const arrive = ss(0.02, 0.36, u);
      cells.forEach(m => { const f = arrive * 1.25 - m.userData.o * 0.3 + (u > 0.36 ? (u - 0.36) * 0.8 : 0); m.visible = f > 0 && f < 1; if (m.visible) m.position.copy(stemCurve.getPoint(clamp(f))); });
      let fade = ss(0.34, 0.74, u);
      const flick = (u > 0.4 && u < 0.72) ? (Math.sin(t * 34) > 0.45 ? 0.3 : 0) : 0; fade = clamp(fade + flick * (1 - fade) * 0.8);
      bmat.color.copy(cy).lerp(dk, fade); bhalo.material.opacity = 0.55 * (1 - fade);
      br.scale.setScalar(1 + 0.02 * Math.sin(t * 9) * (1 - fade));
      J.head.rotation.x = 0.28 * ss(0.6, 1, u); J.chest.rotation.x = 0.1 * ss(0.65, 1, u);
      dust.rotation.y = t * 0.03;
      const k = eout(u); look(c, mix(V(0.25, 1.85, 2.5), V(0.1, 1.76, 1.42), k), V(0.02, 1.7, 0));
    },
    ui(t, d) { const u = t / d; return { vig: ss(0.5, 0.97, u) }; },
  };
}
