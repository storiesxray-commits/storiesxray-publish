import { THREE, RoundedBoxGeometry, W, H, C, clamp, lerp, ss, eio, eout, back, rnd, toon, outlineMat, M, fresnel, glowMat, addMat, halo, setOpacity, Subject, poseStand, lights, shake } from '../../engine/engine.js';

const V = (x, y, z) => new THREE.Vector3(x, y, z);
const cam = (fov = 35) => new THREE.PerspectiveCamera(fov, W / H, 0.05, 400);
function look(c, p, l, up) { c.position.copy(p); if (up) c.up.copy(up); c.lookAt(l); }
const mix = (a, b, t) => a.clone().lerp(b, t);
const RB = (w, h, d, r = 0.05, s = 3) => new RoundedBoxGeometry(w, h, d, s, r);
const BROWN = 0x4a2a16, ELDER = { col: { torso: 0xb79ad6, upper: 0xb79ad6, fore: 0xb79ad6, thigh: 0x9aa0a8, shin: 0x9aa0a8, shoe: 0xf4f1ea }, hair: 0xdfe2e6, elder: true };

function steam(parent, n, seed, color = 0xffffff) {
  const r = rnd(seed), arr = [];
  for (let i = 0; i < n; i++) { const s = halo(color, 0.3, 0); s.userData = { a: r(), b: r(), c: r() }; parent.add(s); arr.push(s); }
  return (t, o, spread = 0.3, rise = 1.1, size = 0.5, op = 0.3) => {
    for (const s of arr) { const a = s.userData, f = (t * (0.35 + a.b * 0.2) + a.a) % 1;
      s.position.set(o.x + (a.c - .5) * spread + 0.12 * Math.sin(t * 1.5 + a.a * 9) * f, o.y + f * rise, o.z + (a.b - .5) * spread);
      s.scale.setScalar(size * (0.35 + f)); s.material.opacity = op * Math.sin(f * Math.PI); }
  };
}
function paperCup(lid = true) {
  const g = new THREE.Group();
  const body = M(new THREE.CylinderGeometry(0.42, 0.3, 1.05, 48), 0xf3efe6); body.position.y = 0.525; g.add(body);
  const sl = M(new THREE.CylinderGeometry(0.413, 0.352, 0.44, 48), 0xb9824f, { px: 3 }); sl.position.y = 0.55; g.add(sl);
  for (let i = 0; i < 3; i++) { const rg = new THREE.Mesh(new THREE.TorusGeometry(0.39 - i * 0.012 + 0.012, 0.008, 6, 48), new THREE.MeshBasicMaterial({ color: 0x8f5f36 })); rg.rotation.x = Math.PI / 2; rg.position.y = 0.66 - i * 0.11; g.add(rg); }
  if (lid) {
    const l = new THREE.Group(); l.position.y = 1.05; g.add(l); g.userData.lid = l;
    const a = M(new THREE.CylinderGeometry(0.455, 0.455, 0.07, 48), 0xffffff); a.position.y = 0.035; l.add(a);
    const b = M(new THREE.CylinderGeometry(0.36, 0.43, 0.08, 48), 0xffffff); b.position.y = 0.105; l.add(b);
    const h = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 8), new THREE.MeshBasicMaterial({ color: 0x2a1a10 })); h.scale.set(1.4, 0.2, 0.7); h.position.set(0.24, 0.146, 0); l.add(h);
  } else {
    const cf = new THREE.Mesh(new THREE.CircleGeometry(0.4, 40), toon(BROWN)); cf.rotation.x = -Math.PI / 2; cf.position.y = 1.0; g.add(cf);
    const rim = M(new THREE.TorusGeometry(0.42, 0.025, 8, 48), 0xffffff, { px: 3 }); rim.rotation.x = Math.PI / 2; rim.position.y = 1.05; g.add(rim);
  }
  return g;
}

// =============== CUP (shots 1, 2, 12) ===============
export function cup(mode) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x15171c);
  const c = cam(32);
  lights(scene, { hemi: 0.8, keyI: 2.4, rimI: 1.3, keyPos: [-3, 4, 4], shadow: true, shadowR: 4 });
  const table = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(0x2b2622)); table.rotation.x = -Math.PI / 2; table.receiveShadow = true; scene.add(table);
  const bh = halo(0xff9d4d, 9, 0.28); bh.position.set(0, 1.4, -3); scene.add(bh);
  const pivot = new THREE.Group(); pivot.position.set(0.3, 0, 0); scene.add(pivot);
  const cp = paperCup(true); cp.position.x = -0.3; pivot.add(cp);
  const drops = []; for (let i = 0; i < 16; i++) { const d = M(new THREE.SphereGeometry(1, 14, 10), BROWN, { px: 3 }); scene.add(d); drops.push(d); }
  const st = steam(scene, 12, 3);
  const world = new THREE.Group();
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      const ang = mode === 'tip' ? lerp(0.12, 0.98, eio(u * 0.9 + 0.05)) : mode === 'flip' ? 0.98 + 0.05 * u : lerp(0.1, 0.2, u);
      pivot.rotation.z = -ang;
      // pour from the sip hole
      const hole = new THREE.Vector3(0.24 - 0.3, 1.2, 0).applyAxisAngle(V(0, 0, 1), -ang).add(pivot.position);
      const flow = clamp((ang - 0.62) / 0.3);
      drops.forEach((dr, i) => {
        const f = ((t * 0.9 + i / drops.length) % 1); const vis = flow > 0 && f < flow + 0.15;
        dr.visible = vis; if (!vis) return;
        const tt = f * 0.75; dr.position.set(hole.x + 0.7 * tt + 0.02 * Math.sin(i * 7), hole.y - 3.2 * tt * tt + 0.1 * tt, hole.z + 0.04 * Math.sin(i * 3));
        if (dr.position.y < 0.03) dr.position.y = 0.03;
        const s = 0.13 * (1 - f * 0.45) * (0.6 + 0.4 * flow); dr.scale.set(s, s * (1 + 2.2 * tt), s);
      });
      st(t, V(hole.x, hole.y + 0.05, 0), 0.25, 1.3, 0.55, 0.34);
      const k = mode === 'end' ? 0 : eout(u);
      look(c, mix(V(0.6, 1.75, 6.5), V(0.85, 1.3, 5.6), mode === 'flip' ? 1 : k), mix(V(0.5, 0.45, 0), V(0.85, 0.42, 0), mode === 'flip' ? 1 : k));
      if (mode === 'flip') c.rotation.z += Math.PI * eio(clamp(u / 0.75));
    },
  };
}

// =============== DRIVE-THRU (shot 3) ===============
function car() {
  const g = new THREE.Group(), col = 0x8f3440;
  const low = M(RB(4.3, 0.72, 1.75, 0.18, 4), col); low.position.y = 0.66; g.add(low);
  const cab = M(RB(2.35, 0.72, 1.62, 0.22, 4), col); cab.position.set(-0.15, 1.3, 0); g.add(cab);
  for (const s of [-1, 1]) {
    const w = new THREE.Mesh(RB(1.9, 0.46, 0.04, 0.08, 2), new THREE.MeshBasicMaterial({ color: 0x9fd0e6 })); w.position.set(-0.15, 1.36, s * 0.815); g.add(w);
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.05), new THREE.MeshBasicMaterial({ color: col })); p.position.set(-0.2, 1.36, s * 0.82); g.add(p);
    for (const x of [-1.35, 1.3]) { const wh = M(new THREE.CylinderGeometry(0.37, 0.37, 0.26, 28), 0x1c1d21, { px: 4 }); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.37, s * 0.82); g.add(wh);
      const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.27, 20), toon(0xc9ced4)); hub.rotation.x = Math.PI / 2; hub.position.copy(wh.position); g.add(hub); }
  }
  const fw = new THREE.Mesh(RB(0.04, 0.46, 1.4, 0.08, 2), new THREE.MeshBasicMaterial({ color: 0x9fd0e6 })); fw.position.set(1.03, 1.34, 0); g.add(fw);
  for (const x of [-2.2, 2.2]) { const b = M(RB(0.16, 0.2, 1.8, 0.06), 0xb9bec5, { px: 3 }); b.position.set(x, 0.45, 0); g.add(b); }
  for (const s of [-1, 1]) { const hl = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff2b0 })); hl.position.set(2.16, 0.75, s * 0.6); g.add(hl); const tl = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.16, 0.34), new THREE.MeshBasicMaterial({ color: 0xff3b30 })); tl.position.set(-2.17, 0.78, s * 0.6); g.add(tl); }
  return g;
}
export function driveThru(mode) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x27324d); scene.fog = new THREE.Fog(0x27324d, 16, 42);
  const c = cam(34);
  lights(scene, { hemi: 0.85, sky: 0xbfd0ff, ground: 0x2a2f3a, keyI: 2.0, key: 0xffd7a8, rimI: 0.9, keyPos: [-5, 6, 6], shadow: true, shadowR: 8 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), toon(0x2f343e)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const sun = halo(0xff8a4d, 26, 0.5); sun.position.set(6, 3, -30); scene.add(sun);
  if (mode === 'wide') {
    for (let i = -2; i <= 3; i++) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 3.4), new THREE.MeshBasicMaterial({ color: 0xd9dde3 })); l.rotation.x = -Math.PI / 2; l.position.set(i * 2.9 - 1.4, 0.01, 1.2); scene.add(l); }
    const b = M(RB(6.5, 3.1, 4.5, 0.08), 0xe9dfca); b.position.set(-1.2, 1.55, -5.0); scene.add(b);
    const roof = M(RB(7.1, 0.45, 5.1, 0.1), 0x2f8f8f); roof.position.set(-1.2, 3.3, -5.0); scene.add(roof);
    const win = new THREE.Mesh(RB(1.5, 1.1, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xffe9a8 })); win.position.set(0.3, 1.7, -2.72); scene.add(win);
    const wf = M(RB(1.8, 0.16, 0.5, 0.05), 0xb9bec5, { px: 3 }); wf.position.set(0.3, 1.08, -2.6); scene.add(wf);
    const aw = M(RB(2.1, 0.14, 1.0, 0.05), 0x2f8f8f, { px: 4 }); aw.position.set(0.3, 2.55, -2.35); aw.rotation.x = 0.3; scene.add(aw);
    const wh = halo(0xffd98a, 4, 0.45); wh.position.set(0.3, 1.7, -2.5); scene.add(wh);
    const door = new THREE.Mesh(RB(1.1, 2.1, 0.06, 0.04), new THREE.MeshBasicMaterial({ color: 0x5c6b78 })); door.position.set(-2.8, 1.05, -2.73); scene.add(door);
    const post = M(new THREE.CylinderGeometry(0.07, 0.07, 1.6, 10), 0x4e5964, { px: 3 }); post.position.set(3.4, 0.8, -2.2); scene.add(post);
    const board = M(RB(1.3, 1.5, 0.14, 0.05), 0x30363f); board.position.set(3.4, 2.2, -2.2); board.rotation.y = -0.35; scene.add(board);
    for (let i = 0; i < 5; i++) { const ln = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.09), new THREE.MeshBasicMaterial({ color: i ? 0xd9dde3 : 0xffd60a })); ln.position.set(3.4 + 0.03, 2.7 - i * 0.24, -2.11); ln.rotation.y = -0.35; scene.add(ln); }
    const lp = M(new THREE.CylinderGeometry(0.07, 0.09, 5.2, 10), 0x4e5964, { px: 3 }); lp.position.set(-5.2, 2.6, -1.4); scene.add(lp);
    const lpb = new THREE.Mesh(new THREE.SphereGeometry(0.22, 14, 10), new THREE.MeshBasicMaterial({ color: 0xfff2c4 })); lpb.position.set(-5.2, 5.25, -1.4); scene.add(lpb);
    const lph = halo(0xffe6a8, 4.5, 0.55); lph.position.copy(lpb.position); scene.add(lph);
    for (const [x, z, s] of [[-5.6, -2.6, 0.7], [-4.7, -2.7, 0.5], [5.2, -3.2, 0.8]]) { const bu = M(new THREE.SphereGeometry(s, 16, 12), 0x3f8f57); bu.position.set(x, s * 0.7, z); bu.scale.y = 0.8; scene.add(bu); }
    const cr = car(); cr.position.set(0.5, 0, 0.2); cr.rotation.y = 0.12; scene.add(cr);
    // passenger silhouette in the near window
    const hr = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), new THREE.MeshBasicMaterial({ color: 0xe6e9ed })); hr.position.set(0.3, 1.4, 0.845); hr.scale.z = 0.1; cr.add(hr);
    const hd = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshBasicMaterial({ color: 0xd2bfae })); hd.position.set(0.37, 1.35, 0.862); hd.scale.z = 0.1; cr.add(hd);
    const sh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 12), new THREE.MeshBasicMaterial({ color: 0xb79ad6 })); sh.position.set(0.3, 1.1, 0.85); sh.scale.set(1, 0.6, 0.1); cr.add(sh);
    return { scene, camera: c, update(t, d) { const k = eio(t / d); look(c, mix(V(5.5, 8.5, 14.5), V(3.4, 3.0, 11.2), k), mix(V(0, 2.2, -1.5), V(0.2, 1.5, -0.8), k)); lph.material.opacity = 0.5 + 0.06 * Math.sin(t * 9); } };
  }
  // close: passenger seen through the open window
  const col = 0x8f3440;
  const door = M(RB(3.2, 1.05, 0.22, 0.1), col); door.position.set(0, 0.55, 0.75); scene.add(door);
  const sill = M(RB(3.2, 0.1, 0.3, 0.04), 0x6f2832, { px: 3 }); sill.position.set(0, 1.1, 0.75); scene.add(sill);
  const roof = M(RB(3.6, 0.22, 2.0, 0.1), col); roof.position.set(0, 2.2, 0); scene.add(roof);
  for (const x of [-1.5, 1.5]) { const p = M(RB(0.2, 1.12, 0.22, 0.06), col); p.position.set(x, 1.66, 0.75); p.rotation.z = x > 0 ? -0.35 : 0.12; scene.add(p); }
  const far = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 1.2), new THREE.MeshBasicMaterial({ color: 0x4a5a7d })); far.position.set(0, 1.65, -0.85); scene.add(far);
  const seat = M(RB(0.28, 1.3, 0.95, 0.1), 0x6e7781); seat.position.set(-0.72, 1.05, 0); seat.rotation.z = 0.12; scene.add(seat);
  const cush = M(RB(1.0, 0.22, 0.95, 0.1), 0x6e7781); cush.position.set(-0.15, 0.52, 0); scene.add(cush);
  const headrest = M(RB(0.2, 0.32, 0.5, 0.08), 0x6e7781, { px: 3 }); headrest.position.set(-0.82, 1.86, 0); scene.add(headrest);
  const dash = M(RB(0.7, 0.5, 1.7, 0.12), 0x3b424b); dash.position.set(1.25, 1.0, 0); scene.add(dash);
  const whl = M(new THREE.TorusGeometry(0.2, 0.03, 8, 24), 0x22252b, { px: 3 }); whl.position.set(0.85, 1.25, -0.55); whl.rotation.y = Math.PI / 2; scene.add(whl);
  const il = new THREE.PointLight(0xffd9a0, 5, 4); il.position.set(0.3, 1.9, 0.3); scene.add(il);
  const w = Subject(ELDER); w.rotation.y = Math.PI / 2; w.position.set(-0.3, -0.22, 0); scene.add(w); const J = w.userData.J;
  poseStand(w);
  for (const n of ['L', 'R']) { J.leg[n].l.rotation.x = -1.5; J.leg[n].kn.rotation.x = 1.45; }
  const cp = paperCup(true); cp.scale.setScalar(0.17); scene.add(cp);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      J.arm.L.a.rotation.set(-0.75, 0, 0.1); J.arm.R.a.rotation.set(-0.75, 0, -0.1); J.arm.L.b.rotation.set(-0.9, 0, 0.35); J.arm.R.b.rotation.set(-0.9, 0, -0.35);
      J.head.rotation.set(0.22 + 0.04 * Math.sin(t * 2), -0.5, 0); w.userData.face({ open: 0.12, wide: 0.05, lookY: -0.6 });
      w.updateMatrixWorld(true);
      const hl = new THREE.Vector3(), hr = new THREE.Vector3(); J.arm.L.hand.getWorldPosition(hl); J.arm.R.hand.getWorldPosition(hr);
      cp.position.copy(hl.add(hr).multiplyScalar(0.5)); cp.position.y -= 0.1; cp.rotation.z = 0.06 * Math.sin(t * 3);
      const k = eout(u); look(c, mix(V(1.3, 1.8, 3.2), V(0.6, 1.6, 1.95), k), V(-0.1, 1.3, 0));
    },
  };
}

// =============== SPILL (shot 4) ===============
export function spill() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x1b1f27);
  const c = cam(34);
  lights(scene, { hemi: 0.85, keyI: 2.2, key: 0xffe2bd, rimI: 0.9, keyPos: [-3, 5, 4] });
  const seat = M(RB(3.4, 0.5, 3.2, 0.2), 0x6e7781); seat.position.set(0, -0.45, 0); scene.add(seat);
  for (const s of [-1, 1]) { const th = M(new THREE.CapsuleGeometry(0.42, 2.2, 8, 24), 0x9aa0a8); th.rotation.x = Math.PI / 2; th.position.set(s * 0.5, 0.1, 0.35); scene.add(th); }
  const torso = M(new THREE.CapsuleGeometry(0.75, 1.2, 8, 24), 0xb79ad6); torso.position.set(0, 1.1, -1.05); torso.scale.z = 0.7; scene.add(torso);
  const pv = new THREE.Group(); pv.position.set(0, 0.42, 0.55); scene.add(pv);
  const cp = paperCup(true); cp.scale.setScalar(0.62); pv.add(cp); const lid = cp.userData.lid;
  const r = rnd(12), blobs = [];
  for (let i = 0; i < 20; i++) { const b = M(new THREE.SphereGeometry(1, 14, 10), BROWN, { px: 3 }); b.userData = { a: r() * Math.PI * 2, v: 0.35 + r() * 1.0, up: 0.6 + r() * 1.4, s: 0.04 + r() * 0.07, o: r() * 0.25 }; scene.add(b); blobs.push(b); }
  const pud = M(new THREE.SphereGeometry(1, 28, 16), BROWN, { px: 4 }); scene.add(pud);
  const st = steam(scene, 14, 5);
  const TP = 0.3;
  return {
    scene, camera: c,
    update(t, d) {
      const k = t - TP, after = k > 0, kk = Math.max(k, 0) * 0.55;   // slow motion
      pv.rotation.x = after ? Math.min(1.25, 0.25 + kk * 2.2) : 0.25 * (t / TP);
      lid.position.set(0, 1.05 + (after ? 2.4 * kk - 1.2 * kk * kk : 0), after ? -0.5 * kk : 0); lid.rotation.set(after ? kk * 5 : 0, 0, after ? kk * 2.5 : 0);
      const mouth = V(0, 0.62 * 1.05, 0).applyAxisAngle(V(1, 0, 0), pv.rotation.x).add(pv.position);
      for (const b of blobs) {
        const a = b.userData, q = kk - a.o * 0.4; b.visible = after && q > 0; if (!b.visible) continue;
        b.position.set(mouth.x + Math.cos(a.a) * a.v * q * 0.9, Math.max(0.52, mouth.y + a.up * q - 3.4 * q * q), mouth.z + 0.25 + Math.abs(Math.sin(a.a)) * a.v * q * 1.3);
        const fl = b.position.y <= 0.53; b.scale.set(a.s * (fl ? 1.8 : 1), a.s * (fl ? 0.35 : 1.25), a.s * (fl ? 1.8 : 1));
      }
      const pg = after ? eout(clamp(kk / 0.9)) : 0; pud.visible = pg > 0.02; pud.position.set(0, 0.5, 1.15); pud.scale.set(0.2 + 0.45 * pg, 0.08, 0.2 + 0.4 * pg);
      st(t, V(0, 0.7, 1.0), 0.9, 1.4, 0.7, after ? 0.32 * clamp(kk * 2) : 0.08);
      const u = t / d; look(c, mix(V(0.8, 4.6, 5.6), V(0.4, 3.7, 4.6), eout(u)), V(0, 0.45, 0.4));
      shake(c, t, TP, 0.05, 0.3);
    },
  };
}

// =============== THERMOMETER (shot 5) ===============
export function thermo() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(C.bg);
  const c = cam(34);
  lights(scene, { hemi: 0.9, keyI: 2.1, rimI: 1.1 });
  const bh = halo(0xff3b30, 10, 0); bh.position.set(0, 2.4, -3); scene.add(bh);
  const table = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(0x1b2028)); table.rotation.x = -Math.PI / 2; scene.add(table);
  const cp = paperCup(false); cp.scale.setScalar(1.25); scene.add(cp);
  const g = new THREE.Group(); g.position.set(0.12, 0.35, 0); g.rotation.z = -0.1; scene.add(g);
  const tube = M(new THREE.CapsuleGeometry(0.17, 3.5, 8, 24), 0xf2f6f8); tube.position.y = 2.0; g.add(tube);
  const chan = new THREE.Mesh(new THREE.BoxGeometry(0.11, 3.3, 0.02), new THREE.MeshBasicMaterial({ color: 0x1b2028 })); chan.position.set(0, 2.0, 0.165); g.add(chan);
  const zone = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.75, 0.021), new THREE.MeshBasicMaterial({ color: 0x5a1512 })); zone.position.set(0, 3.27, 0.166); g.add(zone);
  const merc = new THREE.Mesh(new THREE.BoxGeometry(0.075, 1, 0.03), new THREE.MeshBasicMaterial({ color: C.red })); merc.geometry.translate(0, 0.5, 0); merc.position.set(0, 0.35, 0.17); g.add(merc);
  const bulb = M(new THREE.SphereGeometry(0.27, 24, 16), C.red); bulb.position.y = 0.2; g.add(bulb);
  for (let i = 0; i < 17; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(i % 4 ? 0.1 : 0.17, 0.022, 0.02), new THREE.MeshBasicMaterial({ color: 0x1b2028 })); tk.position.set(0.11, 0.6 + i * 0.19, 0.15); g.add(tk); }
  const mh = halo(C.red, 1.2, 0.0); g.add(mh);
  const st = steam(scene, 12, 8);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, f = Math.min(1, Math.pow(Math.max(0, (t - 0.3) / (d * 0.62 - 0.3)), 0.8));
      const hgt = 0.25 + 3.0 * f; merc.scale.y = hgt; mh.position.set(0, 0.35 + hgt, 0.2); mh.material.opacity = 0.5 * f;
      bh.material.opacity = 0.4 * ss(0.5, 1, f); bulb.scale.setScalar(1 + 0.04 * Math.sin(t * 14) * f);
      st(t, V(0, 1.35, 0.2), 0.6, 1.6, 0.8, 0.22 + 0.2 * f);
      look(c, mix(V(1.4, 1.4, 6.6), V(0.9, 2.4, 6.0), eio(clamp(u / 0.65))), mix(V(0.1, 1.2, 0), V(0, 2.25, 0), eio(clamp(u / 0.65))));
      shake(c, t, d * 0.62, 0.05, 0.3);
    },
  };
}

// =============== SKIN LAYERS (shot 6, x-ray) ===============
export function skin() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(C.bg);
  const c = cam(34);
  lights(scene, { hemi: 1.0, sky: 0xd8f6ff, ground: 0x15202b, keyI: 1.7, key: 0xffffff, rimI: 1.0 });
  const bh = halo(0x0f5f78, 10, 0.5); bh.position.set(0, 0, -3); scene.add(bh);
  const g = new THREE.Group(); scene.add(g);
  const defs = [[0.2, 0x9df1fb], [0.62, 0x22d3ee], [0.58, 0x1594ad], [0.4, 0x0c5f74]]; const layers = []; let y = 0;
  for (const [h, col] of defs) { const m = M(RB(2.6, h, 1.5, 0.05), col); m.position.y = y - h / 2; m.userData = { top: -y, bot: -(y - h) * -1, base: new THREE.Color(col), y0: -y, y1: -y + h }; g.add(m); layers.push(m); y -= h + 0.015; }
  const r = rnd(5);
  for (let i = 0; i < 16; i++) { const lump = M(new THREE.SphereGeometry(0.1 + r() * 0.05, 14, 10), 0x2bb9d2, { px: 2.5 }); lump.position.set(-1.15 + i * 0.155, -1.12 + (i % 2) * 0.16 - r() * 0.05, 0.72); lump.scale.z = 0.5; lump.userData.lay = 2; g.add(lump); layers[2].userData.extra = (layers[2].userData.extra || []).concat(lump); }
  for (let i = 0; i < 6; i++) { const hv = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.75, 6), glowMat(0xd9fbff, 0.9)); hv.position.set(-1.0 + i * 0.4, -0.3, 0.76); hv.rotation.z = 0.25; g.add(hv); const fb = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 8), glowMat(0xd9fbff, 0.9)); fb.position.set(-1.0 + i * 0.4 + 0.09, -0.66, 0.76); g.add(fb); }
  const vz = new THREE.CatmullRomCurve3([V(-1.3, -0.72, 0.77), V(-0.6, -0.62, 0.77), V(0, -0.74, 0.77), V(0.6, -0.6, 0.77), V(1.3, -0.72, 0.77)]);
  const vessel = new THREE.Mesh(new THREE.TubeGeometry(vz, 40, 0.022, 8), glowMat(0xffffff, 0.75)); g.add(vessel);
  const pud = M(new THREE.SphereGeometry(1, 28, 16), 0x7a4420, { px: 4, mat: new THREE.MeshBasicMaterial({ color: 0x6b3a1c }) }); pud.position.set(0, 0.03, 0.1); g.add(pud);
  const heat = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1, 1.52), addMat(C.red, 0.35)); heat.geometry.translate(0, -0.5, 0); heat.position.set(0, 0, 0.01); g.add(heat);
  const hh = halo(C.red, 3, 0); hh.position.set(0, 0, 0.9); g.add(hh);
  const st = steam(scene, 10, 2);
  const red = new THREE.Color(C.red), tot = 1.85;
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, front = tot * ss(0.45, 0.86, u);
      pud.scale.set(0.25 + 0.75 * eout(clamp(u / 0.4)), 0.07, 0.2 + 0.4 * eout(clamp(u / 0.4)));
      heat.scale.y = Math.max(front, 0.001); heat.visible = front > 0.01; hh.position.y = -front; hh.material.opacity = front > 0.01 ? 0.5 : 0;
      for (const m of layers) { const k = ss(m.userData.y0 - 0.05, m.userData.y1, front); m.material.color.copy(m.userData.base).lerp(red, k * 0.85); for (const e of (m.userData.extra || [])) e.material.color.setHex(0x2bb9d2).lerp(red, k * 0.85); }
      st(t, V(0, 0.1, 0.2), 1.2, 1.3, 0.7, 0.28);
      g.rotation.y = lerp(-0.45, 0.2, eio(u)); g.rotation.x = 0.16;
      look(c, mix(V(0, 0.9, 7.4), V(0, 0.35, 6.0), eout(u)), V(0, -0.55, 0));
      for (const p of [0.45, 0.58, 0.71, 0.84]) shake(c, t, p * d, 0.03, 0.18);
    },
    ui(t) { return { flash: 0.4 * (1 - ss(0.0, 0.45, t)) * ss(0.02, 0.1, t) }; },
  };
}

// =============== FABRIC (shot 7) ===============
export function fabric() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x14171d);
  const c = cam(34);
  lights(scene, { hemi: 0.9, keyI: 2.2, key: 0xffe9cf, rimI: 0.6, keyPos: [-3, 4, 5] });
  const g = new THREE.Group(); scene.add(g);
  const threads = [], N = 15, sp = 0.3, base = [new THREE.Color(0xa3a9b1), new THREE.Color(0x8b9199)], dark = new THREE.Color(0x4a3526);
  for (let i = 0; i < N; i++) for (const dir of [0, 1]) {
    const pts = []; for (let j = -1; j <= N; j++) { const a = (j + 0.5 - N / 2) * sp, wv = ((i + j) % 2 ? 1 : -1) * 0.055 * (dir ? 1 : -1); const o = (i + 0.5 - N / 2) * sp; pts.push(dir ? V(o, a, wv) : V(a, o, wv)); }
    const m = M(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.105, 8), 0xffffff, { px: 3 }); m.material.color.copy(base[dir]); m.userData = { dir, o: (i + 0.5 - N / 2) * sp }; g.add(m); threads.push(m);
  }
  const stain = new THREE.Mesh(new THREE.CircleGeometry(1, 48), new THREE.MeshBasicMaterial({ color: 0x2c160a, transparent: true, opacity: 0.62, depthWrite: false })); stain.position.z = 0.19; g.add(stain);
  const edge = new THREE.Mesh(new THREE.RingGeometry(0.97, 1.03, 48), new THREE.MeshBasicMaterial({ color: 0x1c0d05, transparent: true, opacity: 0.8, depthWrite: false })); edge.position.z = 0.195; g.add(edge);
  const drops = []; for (let i = 0; i < 5; i++) { const dr = M(new THREE.SphereGeometry(0.13, 14, 10), BROWN, { px: 3 }); g.add(dr); drops.push(dr); }
  const st = steam(scene, 10, 6);
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, R = 0.15 + 1.9 * eout(clamp((u - 0.1) / 0.8));
      stain.scale.set(R, R * 0.92, 1); edge.scale.copy(stain.scale); stain.visible = edge.visible = u > 0.1;
      for (const m of threads) { const k = ss(R + 0.2, R - 0.5, Math.abs(m.userData.o)) * (u > 0.1 ? 0.55 : 0); m.material.color.copy(base[m.userData.dir]).lerp(dark, k); }
      drops.forEach((dr, i) => { const f = (t - i * 0.12) / 0.32; dr.visible = f > 0 && f < 1; dr.position.set((i - 2) * 0.22, 0.1 * Math.sin(i * 5), lerp(2.6, 0.2, f * f)); });
      st(t, V(0, 0, 0.4), 1.6, 0.0, 0.9, 0.2 * ss(0.15, 0.5, u));
      g.rotation.set(-0.75, 0, 0.5 + 0.12 * u);
      look(c, mix(V(0.2, 0.6, 6.4), V(0.1, 0.35, 4.6), eout(u)), V(0, 0.05, 0));
    },
  };
}

// =============== HOSPITAL (shot 8) ===============
export function hospital() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x22303a);
  const c = cam(36);
  lights(scene, { hemi: 1.0, sky: 0xe6f4ff, ground: 0x2a3a44, keyI: 1.7, key: 0xffffff, rimI: 0.5, keyPos: [-3, 8, 2], shadow: true, shadowR: 5 });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(0x3a5361)); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  for (let i = -8; i <= 8; i++) for (const rot of [0, 1]) { const l = new THREE.Mesh(new THREE.PlaneGeometry(0.03, 30), new THREE.MeshBasicMaterial({ color: 0x2c4350 })); l.rotation.x = -Math.PI / 2; if (rot) l.rotation.z = Math.PI / 2; l.position.set(rot ? 0 : i * 1.1, 0.005, rot ? i * 1.1 : 0); scene.add(l); }
  const frame = M(RB(1.75, 0.35, 3.3, 0.08), 0xc9d2da); frame.position.y = 0.45; scene.add(frame);
  const hb = M(RB(1.85, 0.9, 0.14, 0.06), 0xaab4bf); hb.position.set(0, 0.75, -1.68); scene.add(hb);
  const mat = M(RB(1.6, 0.22, 3.1, 0.1), 0xffffff); mat.position.y = 0.7; scene.add(mat);
  const pil = M(RB(1.1, 0.2, 0.62, 0.1), 0xf3f6f9); pil.position.set(0, 0.88, -1.12); scene.add(pil);
  const body = M(new THREE.CapsuleGeometry(0.33, 1.5, 8, 20), 0x8fc7e8); body.rotation.x = Math.PI / 2; body.position.set(0, 0.86, 0.3); body.scale.set(1.15, 1, 0.55); scene.add(body);
  const blanket = M(RB(1.62, 0.16, 2.15, 0.08), 0x8fc7e8); blanket.position.set(0, 0.84, 0.45); scene.add(blanket);
  const fold = M(RB(1.62, 0.1, 0.3, 0.05), 0xffffff, { px: 3 }); fold.position.set(0, 0.95, -0.6); scene.add(fold);
  const w = Subject(ELDER); const J = w.userData.J; const hd = J.head; hd.removeFromParent(); hd.position.set(0, 1.03, -1.1); hd.rotation.x = -Math.PI / 2; hd.scale.setScalar(1.75); scene.add(hd); w.userData.face({ open: 0.05, closed: 1 });
  const iv = M(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 8), 0xaab4bf, { px: 3 }); iv.position.set(1.35, 1.3, -1.1); scene.add(iv);
  const bag = M(RB(0.3, 0.42, 0.12, 0.06), 0xd8f6ff, { px: 3 }); bag.position.set(1.35, 2.45, -0.95); scene.add(bag);
  const mon = M(RB(0.9, 0.7, 0.5, 0.06), 0x3b424b); mon.position.set(-1.55, 1.1, -1.2); scene.add(mon);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.36), new THREE.MeshBasicMaterial({ color: 0x0e2a22 })); scr.rotation.x = -Math.PI / 2; scr.position.set(-1.55, 1.46, -1.2); scene.add(scr);
  const beat = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x4dff88 })); const line = new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x4dff88 })); scene.add(line);
  const dot = halo(0x4dff88, 0.35, 0.9); scene.add(dot);
  const tb = M(RB(0.7, 0.6, 0.7, 0.06), 0xd9c9a8); tb.position.set(1.5, 0.3, 0.2); scene.add(tb);
  const vase = M(new THREE.CylinderGeometry(0.1, 0.13, 0.3, 14), 0x7fb2e5, { px: 3 }); vase.position.set(1.5, 0.75, 0.2); scene.add(vase);
  for (const [x, z, col] of [[0, 0, 0xff8fa3], [0.14, 0.08, 0xffd60a], [-0.1, 0.12, 0xff8fa3]]) { const fl = M(new THREE.SphereGeometry(0.11, 12, 10), col, { px: 3 }); fl.position.set(1.5 + x, 1.0, 0.2 + z); scene.add(fl); }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d, pts = [];
      for (let i = 0; i <= 40; i++) { const x = i / 40, ph = (x * 3 - t * 1.4) % 1, s = ((ph + 1) % 1); const yv = s > 0.42 && s < 0.5 ? 0.13 : s >= 0.5 && s < 0.56 ? -0.07 : 0; pts.push(V(-1.87 + x * 0.64, 1.47, -1.2 - yv)); }
      line.geometry.dispose(); line.geometry = new THREE.BufferGeometry().setFromPoints(pts); dot.position.copy(pts[40]);
      body.scale.y = 1; blanket.position.y = 0.84 + 0.012 * Math.sin(t * 2.2);
      const k = eio(u), a = lerp(-0.22, 0.12, k);
      look(c, V(Math.sin(a) * 1.2, lerp(8.6, 6.9, k), 0.9 + Math.cos(a) * 0.9), V(0, 0.6, -0.75), V(Math.sin(a), 0, -1).normalize());
    },
  };
}

// =============== BILLS (shot 9a) ===============
function paperTex(kind, seed = 1) {
  const cv = document.createElement('canvas'); cv.width = 512; cv.height = 680; const x = cv.getContext('2d'), r = rnd(seed);
  x.fillStyle = '#fbfaf5'; x.fillRect(0, 0, 512, 680);
  x.fillStyle = kind === 'bill' ? '#2f8f8f' : '#3b424b'; x.fillRect(36, 36, 440, kind === 'bill' ? 70 : 26);
  if (kind === 'bill') { x.fillStyle = '#fff'; x.font = '900 44px Inter, sans-serif'; x.fillText('MEDICAL BILL', 58, 88); }
  x.fillStyle = '#b9bec5'; for (let i = 0; i < 13; i++) x.fillRect(36, 150 + i * 30 - (kind === 'bill' ? 0 : 70), 220 + r() * 220, 11);
  if (kind === 'bill') { x.fillStyle = '#ff3b30'; x.fillRect(36, 560, 440, 84); x.fillStyle = '#fff'; x.font = '900 54px Inter, sans-serif'; x.fillText('TOTAL DUE  $', 58, 622); }
  if (kind === 'doc') { x.strokeStyle = '#0b0b0f'; x.lineWidth = 16; x.strokeRect(0, 0, 512, 680); }
  const tx = new THREE.CanvasTexture(cv); tx.anisotropy = 4; tx.colorSpace = THREE.SRGBColorSpace; return tx;
}
function sheet(kind, seed) {
  const g = new THREE.Group();
  const b = M(RB(1.5, 0.025, 2.0, 0.012, 1), 0xfbfaf5, { px: 3 }); g.add(b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(1.46, 1.94), new THREE.MeshBasicMaterial({ map: paperTex(kind, seed) })); f.rotation.x = -Math.PI / 2; f.position.y = 0.014; g.add(f);
  return g;
}
export function bills() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x15171c);
  const c = cam(34);
  lights(scene, { hemi: 0.95, keyI: 2.0, rimI: 0.6, keyPos: [-3, 6, 3], shadow: true, shadowR: 4 });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), toon(0x5b4130)); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  const r = rnd(4), sh = [];
  for (let i = 0; i < 7; i++) { const s = sheet('bill', i + 1); s.userData = { rot: (r() - .5) * 0.5, x: (r() - .5) * 0.25, z: (r() - .5) * 0.2, dir: r() < .5 ? -1 : 1 }; scene.add(s); sh.push(s); }
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      sh.forEach((s, i) => { const f = eout(clamp((t - i * 0.2) / 0.38)); s.visible = t >= i * 0.2; s.position.set(s.userData.x + s.userData.dir * 4 * (1 - f), 0.02 + i * 0.03 + 0.6 * (1 - f), s.userData.z); s.rotation.y = s.userData.rot + (1 - f) * s.userData.dir; });
      look(c, mix(V(0.9, 3.9, 3.5), V(0.45, 3.0, 2.3), eout(u)), V(0, 0.1, 0.1));
    },
  };
}

// =============== COURTHOUSE (shot 9b) ===============
export function courthouse() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x2b3653); scene.fog = new THREE.Fog(0x2b3653, 18, 45);
  const c = cam(36); const stone = 0xe9e4d8;
  lights(scene, { hemi: 0.85, sky: 0xbfd0ff, ground: 0x2a2f3a, keyI: 2.1, key: 0xffd7a8, rimI: 0.8, keyPos: [-6, 6, 8], shadow: true, shadowR: 9 });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), toon(0x2f343e)); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
  const sun = halo(0xff8a4d, 30, 0.45); sun.position.set(-4, 5, -30); scene.add(sun);
  for (let i = 0; i < 5; i++) { const st = M(RB(8.2 - i * 0.5, 0.22, 3.6 - i * 0.55, 0.03, 1), stone, { px: 4 }); st.position.set(0, 0.11 + i * 0.22, 1.2 - i * 0.27); scene.add(st); }
  const body = M(RB(7.2, 3.6, 3.0, 0.05), 0xd9d3c5); body.position.set(0, 2.9, -1.9); scene.add(body);
  for (let i = 0; i < 6; i++) { const x = -2.75 + i * 1.1; const col = M(new THREE.CylinderGeometry(0.2, 0.23, 2.9, 20), stone, { px: 4 }); col.position.set(x, 2.55, 0.1); scene.add(col);
    const cap = M(RB(0.56, 0.16, 0.56, 0.03, 1), stone, { px: 3 }); cap.position.set(x, 4.05, 0.1); scene.add(cap); const bs = M(RB(0.56, 0.14, 0.56, 0.03, 1), stone, { px: 3 }); bs.position.set(x, 1.15, 0.1); scene.add(bs); }
  const ent = M(RB(6.9, 0.42, 1.0, 0.04, 1), stone); ent.position.set(0, 4.34, 0.0); scene.add(ent);
  const tri = new THREE.Shape(); tri.moveTo(-3.6, 0); tri.lineTo(3.6, 0); tri.lineTo(0, 1.45); tri.lineTo(-3.6, 0);
  const ped = M(new THREE.ExtrudeGeometry(tri, { depth: 0.9, bevelEnabled: false }), stone); ped.position.set(0, 4.55, -0.45); scene.add(ped);
  const tin = new THREE.Shape(); tin.moveTo(-2.7, 0.18); tin.lineTo(2.7, 0.18); tin.lineTo(0, 1.12); tin.lineTo(-2.7, 0.18);
  const pin = new THREE.Mesh(new THREE.ShapeGeometry(tin), toon(0xc4bdac)); pin.position.set(0, 4.55, 0.46); scene.add(pin);
  const door = new THREE.Mesh(RB(1.2, 2.3, 0.1, 0.04), new THREE.MeshBasicMaterial({ color: 0x4b3a2c })); door.position.set(0, 2.25, -0.38); scene.add(door);
  const dh = halo(0xffd98a, 5, 0.4); dh.position.set(0, 2.4, 0.3); scene.add(dh);
  for (const x of [-2.2, 2.2]) { const wn = new THREE.Mesh(RB(0.7, 1.3, 0.1, 0.04), new THREE.MeshBasicMaterial({ color: 0xffe9a8 })); wn.position.set(x, 2.6, -0.38); scene.add(wn); }
  for (const s of [-1, 1]) { const lp = M(new THREE.CylinderGeometry(0.05, 0.07, 2.2, 8), 0x30363f, { px: 3 }); lp.position.set(s * 4.6, 1.1, 2.4); scene.add(lp); const lb = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 10), new THREE.MeshBasicMaterial({ color: 0xfff2c4 })); lb.position.set(s * 4.6, 2.35, 2.4); scene.add(lb); const lh = halo(0xffe6a8, 3, 0.5); lh.position.copy(lb.position); scene.add(lh); }
  return { scene, camera: c, update(t, d) { const k = eout(t / d); look(c, mix(V(2.8, 0.75, 16.5), V(1.1, 0.9, 12.8), k), mix(V(0, 2.6, 0), V(0, 3.1, 0), k)); } };
}

// =============== FOLDER (shot 10) ===============
export function folder() {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x15171c);
  const c = cam(36);
  lights(scene, { hemi: 0.95, keyI: 2.0, rimI: 0.9, keyPos: [-3, 6, 4], shadow: true, shadowR: 5 });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(0x4b3628)); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  const bh = halo(0xffd98a, 9, 0); bh.position.set(0, 2.5, -2); scene.add(bh);
  const bot = M(RB(2.4, 0.05, 1.7, 0.02, 1), 0xe3b860); bot.position.y = 0.03; scene.add(bot);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.08, -0.85); scene.add(hinge);
  const top = M(RB(2.4, 0.05, 1.7, 0.02, 1), 0xe9c373); top.position.set(0, 0, 0.85); hinge.add(top);
  const tab = M(RB(0.7, 0.05, 0.22, 0.02, 1), 0xe9c373, { px: 3 }); tab.position.set(0.7, 0, 1.78); hinge.add(tab);
  const r = rnd(9), pages = []; const texs = [paperTex('doc', 1), paperTex('doc', 2), paperTex('doc', 3)];
  for (let i = 0; i < 54; i++) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.0), new THREE.MeshBasicMaterial({ map: texs[i % 3], side: THREE.DoubleSide }));
    p.userData = { o: r() * 0.55, vx: (r() - .5) * 3.4, vz: (r() - .5) * 1.6 + 0.5, vy: 3.2 + r() * 3.4, rx: r() * 6, ry: r() * 6, w: 1.5 + r() * 2.5 }; scene.add(p); pages.push(p);
  }
  const TB = 1.05;
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d; hinge.rotation.x = -2.25 * back(clamp((t - 0.7) / 0.4)); bh.material.opacity = 0.4 * ss(TB, TB + 0.5, t);
      for (const p of pages) { const a = p.userData, q = t - TB - a.o; p.visible = q > 0; if (!p.visible) continue;
        const y = 0.15 + a.vy * q - 1.15 * q * q; p.position.set(a.vx * q * 0.8, Math.max(y, 0.3 + a.o), a.vz * q * 0.8); p.rotation.set(a.rx + q * a.w, a.ry + q * a.w * 0.7, 0.4 * Math.sin(q * 3 + a.rx)); }
      const k = eio(clamp((t - 0.6) / 1.6));
      look(c, mix(V(1.0, 3.8, 6.2), V(0.5, 2.6, 7.6), k), mix(V(0, 0.3, 0), V(0, 2.9, 0), k));
      shake(c, t, TB, 0.05, 0.3);
    },
  };
}

// =============== CASH (shot 11) ===============
function stack(n, seed) {
  const g = new THREE.Group(), r = rnd(seed);
  for (let i = 0; i < n; i++) { const b = M(RB(2.0, 0.12, 0.95, 0.03, 1), i % 2 ? 0x3fae6a : 0x57c481, { px: 3 }); b.position.set((r() - .5) * 0.06, 0.06 + i * 0.125, (r() - .5) * 0.06); b.rotation.y = (r() - .5) * 0.08; g.add(b);
    if (i % 4 === 1) { const band = M(RB(0.34, 0.135, 0.97, 0.02, 1), 0xf3efe6, { px: 2.5 }); band.position.copy(b.position); g.add(band); } }
  const top = new THREE.Mesh(new THREE.CircleGeometry(0.26, 24), toon(0x2f8f55)); top.rotation.x = -Math.PI / 2; top.position.set(0, n * 0.125 + 0.002, 0); g.add(top);
  return g;
}
export function cash(mode) {
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x15171c);
  const c = cam(34);
  lights(scene, { hemi: 0.95, keyI: 2.2, rimI: 1.0, keyPos: [-3, 6, 4], shadow: true, shadowR: 5 });
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), toon(0x4b3628)); desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; scene.add(desk);
  const bh = halo(0x4dff88, 9, 0.22); bh.position.set(0, 2, -3); scene.add(bh);
  const stacks = [[0, 0, 22, 1], [-2.15, -0.3, 17, 2], [2.15, -0.25, 19, 3], [-1.0, -1.25, 14, 4], [1.1, -1.3, 15, 5]].map(([x, z, n, sd]) => { const s = stack(n, sd); s.position.set(x, 0, z); s.rotation.y = (sd - 3) * 0.06; scene.add(s); return s; });
  const blk = M(new THREE.CylinderGeometry(0.5, 0.55, 0.18, 28), 0x6b4423); blk.position.set(0.6, 0.09, 1.6); scene.add(blk);
  const gp = new THREE.Group(); gp.position.set(2.6, 0.65, 1.6); scene.add(gp);
  const hdl = M(new THREE.CylinderGeometry(0.06, 0.075, 2.1, 12), 0x8a5a2b, { px: 3 }); hdl.rotation.z = Math.PI / 2; hdl.position.x = -1.0; gp.add(hdl);
  const hd = M(new THREE.CylinderGeometry(0.3, 0.3, 0.95, 24), 0x8a5a2b); hd.position.set(-2.0, 0, 0); gp.add(hd);
  for (const y of [-0.3, 0.3]) { const bd = M(new THREE.CylinderGeometry(0.315, 0.315, 0.1, 24), 0xffd60a, { px: 2.5 }); bd.position.set(-2.0, y, 0); gp.add(bd); }
  const TH = 1.0;
  return {
    scene, camera: c,
    update(t, d) {
      const u = t / d;
      if (mode === 'a') {
        gp.visible = blk.visible = false;
        stacks.forEach((s, i) => { const f = back(clamp((t - i * 0.09) / 0.4)); s.scale.set(1, Math.max(0.001, f), 1); });
        const a = lerp(-0.45, 0.1, eio(u)); look(c, V(Math.sin(a) * 8.6, lerp(2.2, 3.0, u), Math.cos(a) * 8.6), V(0, 1.45, -0.2));
      } else {
        const sw = t < TH ? -1.25 * eio(clamp(t / 0.55)) + 1.25 * Math.pow(clamp((t - 0.62) / (TH - 0.62)), 2.2) * (t > 0.62 ? 1 : 0) : 0.12 * Math.exp(-(t - TH) * 6) * Math.sin((t - TH) * 30);
        gp.rotation.z = (t < TH ? sw : -sw);
        const sh = t < TH ? 1 : lerp(1, 0.18, back(clamp((t - TH) / 0.45)));
        stacks.forEach(s => s.scale.set(1, sh, 1));
        bh.material.opacity = 0.22 * sh;
        look(c, mix(V(2.4, 3.6, 10.8), V(1.4, 2.6, 8.6), eout(u)), mix(V(0.9, 1.5, 0.3), V(0.8, 0.75, 0.4), ss(TH, TH + 0.6, t)));
        shake(c, t, TH, 0.07, 0.3);
      }
    },
  };
}
