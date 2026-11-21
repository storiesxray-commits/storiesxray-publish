// Stories X-Ray cast: modern everyday people as flat 2D "bean" cards (own designs), drawn with the Pen / head / face
// helpers from toonbase.js. Design space 600 x 1000 units, soles at y = 975, card height 2.25 m (1 unit = 2.25 mm).
// person(p, look, opts) draws one character. Looks are plain objects (see LOOKS) so every video can dress its own cast.
import * as T from './toonbase.js';
const { INK, SKIN, Pen, blobPts, headBlob, thickAngle, mul, shade, mix } = T;
const { WHITE, SH_SKIN, SH_CLOTH, SH_FELT, rad, rnd, rotAbout, curve, ellPts, rrect, taper, FACE, lidOf, faceFront, dmouth } = T;
export { Pen, INK, SKIN };

// ---------- extra expressions (eyes [back, front], brows [inner, outer] (+ = down), mouth) ----------
Object.assign(FACE, {
  angry: { eye: ['lid', 'lid'], brow: [7, -3], mouth: 'frown' },
  furious: { eye: ['slit', 'slit'], brow: [9, -4], mouth: 'teeth' },
  annoyed: { eye: ['lid', 'lid'], brow: [4, -1], mouth: 'dash' },
  bored: { eye: ['slit', 'slit'], brow: [1, 0], mouth: 'dash' },
  gasp: { eye: ['shock', 'shock'], brow: [-7, -6], mouth: 'O' },
  smug: { eye: ['happy', 'happy'], brow: [-1, -3], mouth: 'smirk' },
  chew: { eye: ['happy', 'happy'], brow: [-2, -2], mouth: 'o' },
  happy: { eye: ['dot', 'dot'], brow: [-2, -2], mouth: 'smileWide' },
  sideeye: { eye: ['lid', 'lid'], brow: [4, -2], mouth: 'wave' },
  sad: { eye: ['dot', 'dot'], brow: [-4, 3], mouth: 'frown' },
  think: { eye: ['dot', 'dot'], brow: [-3, -1], mouth: 'smirk' },
  shout: { eye: ['lid', 'lid'], brow: [8, -3], mouth: 'O' },
  whisper: { eye: ['lid', 'lid'], brow: [-2, 0], mouth: 'o' },
});

// skin tones (light -> deep) and ready-made looks
export const SKINS = ['#ffe2c2', '#f5c9a0', '#e8b48a', '#c99067', '#a8714a', '#7d5236'];
export const LOOKS = {
  diner: { skin: SKINS[3], hair: '#2a1c16', style: 'bun', top: '#e0a63a', topKind: 'sweater', pants: '#34425e', shoes: '#3a2a22' },
  date1: { skin: SKINS[1], hair: '#c7642e', style: 'side', top: '#4f7fb8', topKind: 'shirt', pants: '#2e3446', shoes: '#4a2f22' },
  date2: { skin: SKINS[4], hair: '#1e1512', style: 'curly', top: '#c0476a', topKind: 'tee', pants: '#3b3f52', shoes: '#f0ece4' },
  waiter: { skin: SKINS[2], hair: '#3b2a20', style: 'short', top: '#f4f1ea', topKind: 'vest', vest: '#24242c', bow: '#b8282b', pants: '#24242c', shoes: '#151519', apron: '#24242c' },
  prof: { skin: SKINS[0], hair: '#9a9aa2', style: 'balding', top: '#6d4f3a', topKind: 'cardigan', shirt: '#dfe6ee', pants: '#4a4a54', shoes: '#2b211c', glasses: '#2a2430', moustache: '#9a9aa2' },
  prof76: { skin: SKINS[0], hair: '#6b4628', style: 'side', top: '#b9793a', topKind: 'shirt', pants: '#5a4630', shoes: '#3a2a1c', glasses: '#2a2430', moustache: '#6b4628', flare: true },
  kid76: { skin: SKINS[0], hair: '#8a5a2e', style: 'short', top: '#d6493a', topKind: 'tee', stripe: '#f2e6c8', pants: '#3b5b9a', shoes: '#f4f1ea', kid: true },
  clerk76: { skin: SKINS[2], hair: '#3a2a1c', style: 'side', top: '#e9dcb8', topKind: 'shirt', tie: '#7a3b22', pants: '#5a4a3a', shoes: '#2a1c14', apron: '#3f6a4a', moustache: '#3a2a1c' },
  cutter76: { skin: SKINS[1], hair: '#e0c070', style: 'side', top: '#6a8a3a', topKind: 'shirt', pants: '#8a6a3a', shoes: '#2a1c14', flare: true, sideburns: true },
  q1: { skin: SKINS[1], hair: '#5a3b2a', style: 'pony', top: '#3f8f7a', topKind: 'hoodie', pants: '#2e3446', shoes: '#f0ece4' },
  q2: { skin: SKINS[4], hair: '#1e1512', style: 'short', top: '#7b5ac9', topKind: 'tee', pants: '#3a3a44', shoes: '#2a2a2a', beard: '#1e1512' },
  q3: { skin: SKINS[0], hair: '#e0c070', style: 'bob', top: '#e86e4a', topKind: 'blouse', pants: '#2e3446', shoes: '#8a2f2f' },
  q4: { skin: SKINS[2], hair: '#2a1c16', style: 'spiky', top: '#5d8a3a', topKind: 'polo', pants: '#4a4030', shoes: '#3a2a22', stout: true },
  cutter: { skin: SKINS[1], hair: '#2a1c16', style: 'side', top: '#d9d24a', topKind: 'shirt', pants: '#3b3f52', shoes: '#1d1b22', shades: true },
};

const curveN = (a, k, b) => curve(a, k, b, 12);
const lighten = (c, k) => mix(c, '#ffffff', k);

// ---------- hair ----------
function hairBack(p, O, H, cx, hc, light, thick, ow, u) {
  const col = O.hair, dark = mul(col, SH_FELT), st = O.style;
  if (st === 'long' || st === 'bob') {
    const bot = st === 'long' ? hc + 1.55 * H.b : hc + 0.85 * H.b;
    const pts = [...ellPts(cx, hc - 0.05 * H.b, H.a * 1.16, H.b * 1.12, 180, 360, 0, 30), [cx + H.a * 1.18, bot], [cx - H.a * 1.18, bot]];
    p.shadedFill(pts, col, dark, light, H.a * 1.2, 0.4); p.inkRing(pts, ow * 0.85, thick);
  } else if (st === 'curly') {
    const r = rnd(O.seed || 3, 9);
    for (let i = 0; i < 11; i++) { const a = Math.PI * (1.02 + 0.96 * i / 10), R = H.a * (1.12 + 0.06 * Math.sin(i * 2.7 + r));
      p.ell(cx + Math.cos(a) * R, hc - 0.12 * H.b + Math.sin(a) * R * 1.02, 0.34 * H.a, 0.32 * H.a, col, ow * 0.7); }
    p.ell(cx, hc - 0.25 * H.b, H.a * 1.12, H.b * 1.02, col, 0);
  } else if (st === 'pony') {
    const s = O.ponySide || 1, pts = curveN([cx + s * 0.75 * H.a, hc - 0.55 * H.b], [cx + s * 1.45 * H.a, hc - 0.2 * H.b], [cx + s * 1.2 * H.a, hc + 0.9 * H.b]);
    p.stroke(pts, 0.34 * H.a + ow, INK); p.stroke(pts, 0.34 * H.a, col);
  } else if (st === 'bun') {
    p.ell(cx + 0.05 * H.a, hc - 1.12 * H.b, 0.42 * H.a, 0.36 * H.a, col, ow * 0.9);
    p.ell(cx - 0.08 * H.a, hc - 1.18 * H.b, 0.16 * H.a, 0.08 * H.a, lighten(col, 0.25), 0);
  }
}
function hairTop(p, O, hp, H, cx, hc, light, facing, ow, u) {
  const st = O.style, col = O.hair, dark = mul(col, SH_FELT);
  if (!st || st === 'bald') return;
  if (st === 'balding') {
    for (const s of [-1, 1]) { const tp = ellPts(cx + s * 0.95 * H.a, hc - 0.3 * H.b, 0.13 * H.a, 0.24 * H.b, 0, 360, s * 12, 20); p.shadedFill(tp, col, dark, light, 0.3 * H.a); p.poly(tp, null, ow * 0.75); }
    p.stroke(ellPts(cx - 0.25 * H.a, hc - 0.72 * H.b, 0.3 * H.a, 0.12 * H.b, 200, 320, 0, 10), 3 * u, '#ffffff55');
    return;
  }
  if (st === 'curly') { // front curls over the forehead
    for (let i = 0; i < 6; i++) p.ell(cx + (i - 2.5) * 0.32 * H.a, hc - 0.78 * H.b + Math.abs(i - 2.5) * 0.06 * H.b, 0.24 * H.a, 0.2 * H.a, col, ow * 0.6);
    return;
  }
  const cutBase = hc - H.b + (st === 'spiky' ? 0.2 : st === 'bob' || st === 'long' ? 0.27 : 0.23) * 2 * H.b;
  const n = hp.length, part = st === 'side' ? (O.part || (facing || 1)) : 0;
  const cutAt = (x) => cutBase + part * (x - cx) / H.a * 0.1 * H.b;
  const keep = (x, y) => y < cutAt(x);
  const startIdx = Math.max(0, hp.findIndex(([x, y], i) => keep(x, y) && !keep(...hp[(i + n - 1) % n])));
  const arc = [...hp.slice(startIdx), ...hp.slice(0, startIdx)].filter(([x, y]) => keep(x, y)).map(([x, y]) => [cx + (x - cx) * 1.05, hc + (y - hc) * 1.05]);
  if (arc.length < 3) return;
  const [x0, y0] = arc[arc.length - 1], [x1, y1] = arc[0];
  if (st === 'spiky') {
    const top = [];
    for (let i = 0; i <= 9; i++) { const a = Math.PI * (1.05 + 0.9 * i / 9), R = i % 2 ? 1.3 : 1.02; top.push([cx + Math.cos(a) * H.a * R * 1.02, hc - 0.05 * H.b + Math.sin(a) * H.b * R]); }
    arc.splice(0, arc.length, ...top);
  } else if (st === 'side') { // swoop: fringe dips toward one side
    for (let i = 1; i < 8; i++) { const t = i / 8; arc.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + Math.sin(t * Math.PI) * 0.16 * H.b * (part > 0 ? t : 1 - t) * 2]); }
  } else if (st === 'bob' || st === 'long') {
    for (let i = 1; i < 8; i++) { const t = i / 8; arc.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + (i % 2 ? 0.05 : 0.02) * H.b]); }
  } else { // short / bun / pony: scalloped hairline
    for (let i = 1; i < 6; i++) { const t = i / 6; arc.push([x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + (i % 2 ? 4 * u : 0)]); }
  }
  p.shadedFill(arc, col, dark, light, H.a, 0.35); p.poly(arc, null, ow);
  // shine streak
  p.clip(arc, () => p.stroke(ellPts(cx - 0.3 * H.a * (facing || 1), hc - 0.78 * H.b, 0.28 * H.a, 0.1 * H.b, 200, 320, 0, 10), 3 * u, '#ffffff40'));
  if (O.sideburns) for (const s of [-1, 1]) p.poly([[cx + s * 0.9 * H.a, hc - 0.35 * H.b], [cx + s * 1.0 * H.a, hc - 0.3 * H.b], [cx + s * 0.95 * H.a, hc + 0.3 * H.b], [cx + s * 0.86 * H.a, hc + 0.2 * H.b]], col, ow * 0.6);
}

// ---------- held props (drawn at the hand) ----------
function held(p, kind, hx, hy, u, side, k = 0) {
  switch (kind) {
    case 'fork': {
      p.stroke([[hx, hy], [hx + side * 4 * u, hy - 30 * u]], 2.6 * u, '#c9ccd2');
      for (const d of [-3, 0, 3]) p.stroke([[hx + side * 4 * u + d * u, hy - 30 * u], [hx + side * 4 * u + d * u, hy - 40 * u]], 1.4 * u, '#c9ccd2');
      if (k < 0.5) p.ell(hx + side * 4 * u, hy - 42 * u, 6 * u, 5 * u, '#e0a050', 1.6 * u); // a bite on the fork
      break; }
    case 'phone': { const pts = rrect(hx - 9 * u, hy - 26 * u, hx + 9 * u, hy + 6 * u, 3 * u); p.poly(pts, '#2a2a33', 2 * u); p.poly(rrect(hx - 6.5 * u, hy - 23 * u, hx + 6.5 * u, hy + 2 * u, 2 * u), '#7fd0ff', 0); break; }
    case 'receipt': { p.poly([[hx - 8 * u, hy - 30 * u], [hx + 10 * u, hy - 32 * u], [hx + 12 * u, hy + 6 * u], [hx - 6 * u, hy + 8 * u]], '#fbf7ea', 1.8 * u);
      for (let i = 0; i < 4; i++) p.stroke([[hx - 4 * u, hy - 24 * u + i * 7 * u], [hx + 7 * u, hy - 25 * u + i * 7 * u]], 1.1 * u, '#9a9488'); break; }
    case 'ticket': { p.poly(rrect(hx - 10 * u, hy - 22 * u, hx + 10 * u, hy + 4 * u, 2 * u), '#ffd23f', 1.8 * u); p.stroke([[hx - 4 * u, hy - 9 * u], [hx + 4 * u, hy - 9 * u]], 2 * u); break; }
    case 'glass': { const pts = [[hx - 8 * u, hy - 26 * u], [hx + 8 * u, hy - 26 * u], [hx + 6 * u, hy + 6 * u], [hx - 6 * u, hy + 6 * u]]; p.poly(pts, '#cfe8f5', 1.8 * u); p.poly([[hx - 7 * u, hy - 12 * u], [hx + 7 * u, hy - 12 * u], [hx + 6 * u, hy + 5 * u], [hx - 6 * u, hy + 5 * u]], '#e8b04a', 0); break; }
    case 'plate': { p.ell(hx + side * 22 * u, hy - 4 * u, 30 * u, 9 * u, '#f6f3ec', 2 * u); p.ell(hx + side * 22 * u, hy - 9 * u, 16 * u, 8 * u, '#d9893a', 1.6 * u); p.ell(hx + side * 18 * u, hy - 13 * u, 6 * u, 3 * u, '#6fae4a', 0); break; }
    case 'menu': { p.poly([[hx - 4 * u, hy - 40 * u], [hx + side * 30 * u, hy - 44 * u], [hx + side * 32 * u, hy + 4 * u], [hx - 2 * u, hy + 6 * u]], '#7a2f2f', 2 * u); p.stroke([[hx + side * 8 * u, hy - 30 * u], [hx + side * 24 * u, hy - 32 * u]], 2 * u, '#f0d9a0'); break; }
    case 'chalk': p.stroke([[hx, hy], [hx + side * 8 * u, hy - 6 * u]], 3 * u, '#ffffff'); break;
  }
}

// ---------- the person ----------
/** opts: expr, blink (0..1), look (-1..1 eye shift), facing (-1/0/1), seed, L / R arm pose names, tilt, headTilt, bob,
 *  mode 'stand' | 'sit' | 'walk', step (walk phase 0..1), tableY (design y of a table top for 'table'/'drum'/'fork'),
 *  hold {L, R} prop names, k (pose progress 0..1 for fork/drum/wave), talk (0..1 opens the mouth), light (canvas angle) */
export function person(p, O, opts = {}) {
  const { expr = 'neutral', blink = 0, look = 0, facing = 0, seed = 3, L = 'hang', R = 'hang', tilt = 0, headTilt = 0, bob = 0,
    mode = 'stand', step = 0, tableY = 726, hold = {}, k = 0, talk = 0, light = rad(-120), back = false } = opts;
  const lid = lidOf(blink), skin = O.skin ?? SKIN, kid = !!O.kid;
  const H = headBlob(seed, kid ? 112 : 118, facing), W = 2 * H.a, HH = 2 * H.b, u = W / 100;
  const sole = 975, legsL = kid ? 0.95 : 1.38, torsoL = kid ? 0.82 : (O.stout ? 1.12 : 1.06);
  const sitting = mode === 'sit';
  const torsoBot = (sitting ? sole - 0.66 * HH : sole - legsL * HH) - bob * HH;
  const chin = torsoBot - torsoL * HH, hc = chin - H.b, hipY = torsoBot - 0.1 * HH;
  const thick = thickAngle(light), ow = 5 * u, cx = 300, limb = 3.4 * u, LIMB = INK;
  const top = O.top, topD = mul(top, SH_CLOTH), pants = O.pants || '#34425e', shoes = O.shoes || '#2a211c';
  p.rot = null;
  // ---- legs ----
  if (sitting) {
    for (const side of [-1, 1]) { // knees toward the camera, shins straight down
      const kx = cx + side * 20 * u, ky = torsoBot + 0.02 * HH;
      const th = ellPts(kx, ky - 0.02 * HH, 15 * u, 0.13 * HH, 0, 360, 0, 24); p.gradFill(th, pants, mul(pants, SH_CLOTH), light); p.poly(th, null, ow * 0.8);
      p.stroke([[kx, ky + 0.1 * HH], [kx + side * 2 * u, sole - 6 * u]], limb * 1.6, pants); p.stroke([[kx, ky + 0.1 * HH], [kx + side * 2 * u, sole - 6 * u]], 1.2 * u, INK);
      p.ell(kx + side * 6 * u, sole - 5 * u, 11 * u, 6 * u, shoes, 2 * u);
    }
  } else {
    for (const side of [-1, 1]) {
      const ph = Math.sin(Math.PI * 2 * (step + (side > 0 ? 0.5 : 0)));
      const up = mode === 'walk' ? Math.max(0, ph) * 26 : 0, fwd = mode === 'walk' ? ph * 8 * u : 0;
      const hx = cx + side * 15 * u, fx = cx + side * (kid ? 16 : 19) * u + fwd, fy = sole - 5 * u - up;
      const legCol = O.flare ? pants : pants;
      p.stroke(curveN([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), limb * 2.1, INK);
      p.stroke(curveN([hx, hipY], [(hx + fx) / 2 + side * 2 * u, (hipY + fy) / 2], [fx, fy]), limb * 2.1 - 2.4 * u, legCol);
      if (O.flare) p.poly([[fx - 8 * u, fy - 22 * u], [fx + 8 * u, fy - 22 * u], [fx + 12 * u, fy], [fx - 12 * u, fy]], legCol, 1.6 * u);
      p.ell(fx + side * 6 * u, fy + 1 * u, 13 * u, 6.5 * u, shoes, 2.2 * u);
      p.stroke(ellPts(fx + side * 4 * u, fy - 1.5 * u, 7 * u, 2.5 * u, 200, 330, 0, 8), 1.6 * u, '#ffffff55');
    }
  }
  // ---- upper body ----
  p.rot = tilt ? [rad(tilt), cx, hipY] : null;
  const TB = { a: (0.4 * W) / 1.06 * (O.stout ? 1.12 : 1) * (kid ? 0.9 : 1), b: 0.5 * (torsoBot - (chin - 0.25 * HH)), nTop: 2.2, nBot: 2.6, egg: O.stout ? 0.17 : 0.12, asym: 0.04 * facing, rot: 0, noise: 0.006, seed: seed + 7 };
  const tcx = cx + 3 * u * facing, tcy = torsoBot - TB.b, tp = blobPts(tcx, tcy, TB);
  const S = (side) => [tcx + side * 0.82 * TB.a, chin + 0.14 * HH];
  const tY = tableY;
  const arm = (side, pose) => {
    const s = S(side), X = (kk) => tcx + side * (TB.a * 1.05 + kk * u);
    switch (pose) {
      case 'point': return { pts: [s, [X(28), s[1] - 0.02 * HH], [X(62), s[1] - 0.1 * HH]], finger: true };
      case 'up': return { pts: [s, [X(16), s[1] - 0.3 * HH], [X(24), s[1] - 0.78 * HH]] };
      case 'fist': return { pts: [s, [X(14), s[1] - 0.28 * HH], [X(16 + 4 * Math.sin(k * 25)), s[1] - 0.72 * HH]], fist: true };
      case 'wave': return { pts: [s, [X(16), s[1] - 0.2 * HH], [X(30 + 10 * Math.sin(k * 20)), s[1] - 0.62 * HH]] };
      case 'raise': return { pts: [s, [X(10), s[1] - 0.12 * HH * k], [X(14 + 6 * k), s[1] + (0.2 - 0.75 * k) * HH]], finger: k > 0.5 };
      case 'hip': return { pts: [s, [X(22), s[1] + 0.3 * HH], [tcx + side * TB.a * 0.95, torsoBot - 0.3 * HH]] };
      case 'cross': return { pts: [s, [X(2), s[1] + 0.38 * HH], [tcx - side * 0.45 * TB.a, s[1] + 0.32 * HH]], front: true };
      case 'chin': return { pts: [s, [tcx + side * 0.75 * TB.a, tY - 2 * u], [cx + side * 0.22 * H.a, hc + 1.06 * H.b]], front: true, fist: true, over: true };
      case 'temple': return { pts: [s, [X(26), s[1] + 0.05 * HH], [cx + side * (H.a + 14 * u), hc - 0.1 * HH]] };
      case 'cheek': return { pts: [s, [X(16), s[1] + 0.05 * HH], [cx + side * (H.a + 2 * u), hc + 0.25 * H.b]] };
      case 'table': return { pts: [s, [X(6), (s[1] + tY) / 2 + 6 * u], [tcx + side * 0.55 * TB.a, tY - 3 * u]], front: true };
      case 'drum': { const tap = Math.max(0, Math.sin(k * Math.PI * 2 * 6)) * 6 * u; return { pts: [s, [X(10), (s[1] + tY) / 2 + 4 * u], [X(4), tY - 4 * u - tap]], front: true, fingers: true }; }
      case 'fork': { const e = 0.5 - 0.5 * Math.cos(k * Math.PI * 2); const hy = tY - 6 * u - e * (tY - (hc + 0.55 * H.b)); const hx = tcx + side * (0.6 - 0.35 * e) * TB.a;
        return { pts: [s, [X(14), (s[1] + hy) / 2 + 10 * u], [hx, hy]], front: true, prop: 'fork', pk: e }; }
      case 'tray': return { pts: [s, [X(20), s[1] + 0.12 * HH], [X(34), s[1] - 0.06 * HH]], prop: 'plate' };
      case 'hold': return { pts: [s, [X(12), s[1] + 0.3 * HH], [tcx + side * 0.7 * TB.a, s[1] + 0.2 * HH]], front: true };
      case 'reach': return { pts: [s, [X(34), s[1] + 0.02 * HH], [X(66), s[1] - 0.04 * HH]] };
      case 'watch': return { pts: [s, [X(10), s[1] + 0.32 * HH], [tcx + side * 0.1 * TB.a, s[1] + 0.22 * HH]], front: true, watch: true };
      case 'shrug': return { pts: [s, [X(22), s[1] + 0.22 * HH], [X(40), s[1] + 0.02 * HH]], palm: true };
      default: return { pts: [s, [X(4), s[1] + 0.46 * HH], [X(3), chin + 1.0 * HH]] };
    }
  };
  const arms = [arm(-1, L), arm(1, R)];
  const drawArm = (a, side) => {
    const sleeve = O.topKind === 'tee' || O.topKind === 'polo' || O.topKind === 'blouse' ? 0.38 : O.topKind === 'vest' ? 0.9 : 0.85;
    const pts = curveN(a.pts[0], a.pts[1], a.pts[2]), cut = Math.round(pts.length * sleeve);
    const armTop = O.topKind === 'vest' || O.topKind === 'cardigan' ? (O.topKind === 'vest' ? top : O.top) : top;
    p.stroke(pts, limb * 2.4, INK);
    p.stroke(pts.slice(0, cut + 1), limb * 2.4 - 2.4 * u, armTop);
    p.stroke(pts.slice(cut), limb * 2.4 - 2.4 * u, skin);
    if (a.watch) p.ell(pts[cut + 1 < pts.length ? pts.length - 3 : cut][0], pts[pts.length - 3][1], 4 * u, 3 * u, '#e8c45a', 1.4 * u);
    const [hx, hy] = a.pts[2];
    if (a.prop) held(p, a.prop, hx, hy, u, side, a.pk ?? k);
    if (hold[side < 0 ? 'L' : 'R']) held(p, hold[side < 0 ? 'L' : 'R'], hx, hy, u, side, k);
    p.ell(hx, hy, (a.fist ? 7 : 6.2) * u, (a.fist ? 7 : 6.2) * u, skin, 2.2 * u);
    if (a.finger) { const dx = a.pts[2][0] - a.pts[1][0], dy = a.pts[2][1] - a.pts[1][1], l = Math.hypot(dx, dy); const f = [[hx, hy], [hx + dx / l * 13 * u, hy + dy / l * 13 * u]]; p.stroke(f, 4.4 * u, INK); p.stroke(f, 2.2 * u, skin); }
    if (a.fingers) for (const d of [-1, 1]) p.stroke([[hx + d * 3 * u, hy], [hx + d * 4 * u, hy + 6 * u]], 2 * u);
  };
  for (const [i, a] of arms.entries()) if (!a.front) drawArm(a, i ? 1 : -1);
  // torso + clothes
  const kind = O.topKind || 'tee';
  if (O.dress) { const D = { a: 0.5 * W * 0.98, b: 0.5 * ((sole - 0.4 * HH) - (chin - 0.2 * HH)), nTop: 2, nBot: 3, egg: 0.35, asym: 0, rot: 0, noise: 0.006, seed: seed + 9 };
    const dp = blobPts(cx, sole - 0.4 * HH - D.b, D); p.gradFill(dp, O.dress, mul(O.dress, SH_CLOTH), light); p.inkRing(dp, ow, thick); }
  const base = kind === 'vest' || kind === 'cardigan' ? (O.shirt || top) : top;
  p.gradFill(tp, base, mul(base, SH_CLOTH), light);
  p.clip(tp, () => {
    const nk = chin + 0.02 * HH;
    if (O.stripe) for (let i = 0; i < 4; i++) p.band([[tcx - 1.5 * TB.a, nk + (0.16 + i * 0.17) * HH], [tcx + 1.5 * TB.a, nk + (0.16 + i * 0.17) * HH]], O.stripe, 0.05 * HH, 0);
    if (kind === 'vest') { for (const s of [-1, 1]) p.poly([[tcx + s * 0.08 * TB.a, nk + 0.12 * HH], [tcx + s * 1.3 * TB.a, nk], [tcx + s * 1.3 * TB.a, torsoBot + 0.1 * HH], [tcx + s * 0.12 * TB.a, torsoBot + 0.1 * HH]], O.vest, 1.6 * u);
      for (let i = 0; i < 3; i++) p.dot(tcx - 0.18 * TB.a, nk + (0.3 + i * 0.16) * HH, 2.2 * u, '#d9dde0'); }
    if (kind === 'cardigan') { for (const s of [-1, 1]) p.poly([[tcx + s * 0.16 * TB.a, nk + 0.04 * HH], [tcx + s * 1.3 * TB.a, nk - 0.05 * HH], [tcx + s * 1.3 * TB.a, torsoBot + 0.1 * HH], [tcx + s * 0.22 * TB.a, torsoBot + 0.1 * HH]], top, 1.6 * u);
      for (let i = 0; i < 4; i++) p.dot(tcx + 0.3 * TB.a, nk + (0.18 + i * 0.16) * HH, 2.4 * u, '#e9d9b0'); }
    if (kind === 'hoodie') { p.poly([[tcx - 0.5 * TB.a, torsoBot - 0.34 * HH], [tcx + 0.5 * TB.a, torsoBot - 0.34 * HH], [tcx + 0.62 * TB.a, torsoBot - 0.08 * HH], [tcx - 0.62 * TB.a, torsoBot - 0.08 * HH]], mul(top, [0.86, 0.86, 0.9]), 1.6 * u);
      for (const s of [-1, 1]) p.stroke([[tcx + s * 0.14 * TB.a, nk + 0.06 * HH], [tcx + s * 0.16 * TB.a, nk + 0.32 * HH]], 1.8 * u, '#f4f1ea'); }
    if (kind === 'sweater') { p.band([[tcx - 1.5 * TB.a, torsoBot - 0.06 * HH], [tcx + 1.5 * TB.a, torsoBot - 0.06 * HH]], mul(top, [0.85, 0.85, 0.85]), 0.09 * HH, 1.2 * u);
      for (let i = -6; i <= 6; i++) p.stroke([[tcx + i * 0.2 * TB.a, torsoBot - 0.1 * HH], [tcx + i * 0.2 * TB.a, torsoBot - 0.02 * HH]], 1 * u, mul(top, [0.7, 0.7, 0.7])); }
    if (kind === 'polo') { p.stroke([[tcx, nk + 0.02 * HH], [tcx, nk + 0.2 * HH]], 1.6 * u); p.dot(tcx, nk + 0.1 * HH, 1.8 * u, '#f4f1ea'); }
    if (O.apron) p.poly([[tcx - 0.6 * TB.a, torsoBot - 0.25 * HH], [tcx + 0.6 * TB.a, torsoBot - 0.25 * HH], [tcx + 0.68 * TB.a, torsoBot + 0.3 * HH], [tcx - 0.68 * TB.a, torsoBot + 0.3 * HH]], O.apron, 1.6 * u);
    if (kind === 'shirt' || kind === 'vest' || kind === 'cardigan') p.stroke([[tcx, nk + 0.1 * HH], [tcx, torsoBot]], 1.2 * u, mul(base, [0.7, 0.7, 0.75]));
  });
  p.inkRing(tp, ow, thick);
  // collars / neck details over the outline
  const nk = chin + 0.02 * HH;
  if (kind === 'shirt' || kind === 'vest' || kind === 'cardigan') for (const s of [-1, 1]) p.poly([[tcx + s * 2 * u, nk + 0.1 * HH], [tcx + s * 0.32 * TB.a, nk - 0.03 * HH], [tcx + s * 0.4 * TB.a, nk + 0.06 * HH]], kind === 'cardigan' ? (O.shirt || '#ffffff') : base, 1.8 * u);
  else if (kind === 'hoodie') p.poly(ellPts(tcx, nk + 0.02 * HH, 0.55 * TB.a, 0.08 * HH, 0, 360, 0, 24), mul(top, [0.8, 0.8, 0.86]), 2 * u);
  else p.stroke(ellPts(tcx, nk, 0.3 * TB.a, 0.08 * HH, 10, 170, 0, 14), 2 * u);
  if (O.tie && !back) p.poly([[tcx - 4 * u, nk + 0.1 * HH], [tcx + 4 * u, nk + 0.1 * HH], [tcx + 6 * u, nk + 0.42 * HH], [tcx, nk + 0.5 * HH], [tcx - 6 * u, nk + 0.42 * HH]], O.tie, 1.6 * u);
  if (O.bow && !back) { p.poly([[tcx, nk + 0.09 * HH], [tcx - 11 * u, nk + 0.04 * HH], [tcx - 11 * u, nk + 0.15 * HH]], O.bow, 1.6 * u); p.poly([[tcx, nk + 0.09 * HH], [tcx + 11 * u, nk + 0.04 * HH], [tcx + 11 * u, nk + 0.15 * HH]], O.bow, 1.6 * u); p.dot(tcx, nk + 0.09 * HH, 2.6 * u, O.bow); }
  for (const [i, a] of arms.entries()) if (a.front && !a.over) drawArm(a, i ? 1 : -1);
  // ---- head ----
  const [cpx, cpy] = rotAbout([cx, chin], rad(tilt), [cx, hipY]);
  const Ah = tilt + headTilt;
  p.rot = Ah ? [rad(Ah), cx, chin, cpx - cx, cpy - chin] : null;
  O.seed = seed;
  hairBack(p, O, H, cx, hc, light, thick, ow, u);
  const hp = blobPts(cx, hc, H);
  p.shadedFill(hp, skin, mul(skin, SH_SKIN), light, H.a);
  p.inkRing(hp, ow, thick);
  for (const s of [-1, 1]) if (!(O.style === 'long' || O.style === 'bob') && facing !== -s) { // ears
    const ex = cx + s * 0.98 * H.a, ep = ellPts(ex, hc + 0.05 * H.b, 0.12 * H.a, 0.2 * H.b, 0, 360, 0, 16); p.shadedFill(ep, skin, mul(skin, SH_SKIN), light, 0.12 * H.a); p.poly(ep, null, ow * 0.6); }
  if (back) {
    if (O.style && O.style !== 'bald') { const cut = O.style === 'balding' ? hc + 0.1 * H.b : O.style === 'long' || O.style === 'bob' ? hc + 1.1 * H.b : hc + 0.62 * H.b;
      const hpb = hp.filter(([x, y]) => y < cut).map(([x, y]) => [cx + (x - cx) * 1.04, hc + (y - hc) * 1.04]);
      if (O.style === 'balding') { p.clip(hp, () => p.poly(hp.filter(([x, y]) => y > hc - 0.35 * H.b).map(([x, y]) => [x, y]), O.hair, 0)); p.inkRing(hp, ow, thick); }
      else { p.shadedFill(hpb, O.hair, mul(O.hair, SH_FELT), light, H.a, 0.35); p.poly(hpb, null, ow); }
      if (O.style === 'bun') p.ell(cx, hc - 0.92 * H.b, 0.42 * H.a, 0.36 * H.a, O.hair, ow * 0.9);
      if (O.style === 'pony') { const pts = curveN([cx, hc - 0.2 * H.b], [cx + 0.1 * H.a, hc + 0.6 * H.b], [cx - 0.05 * H.a, hc + 1.3 * H.b]); p.stroke(pts, 0.34 * H.a + ow, INK); p.stroke(pts, 0.34 * H.a, O.hair); }
    }
    p.rot = null; return;
  }
  hairTop(p, O, hp, H, cx, hc, light, facing, ow, u);
  if (O.beard) { const bd = ellPts(cx + 6 * u * facing, hc + 0.62 * H.b, 0.7 * H.a, 0.42 * H.b, 0, 180, 0, 24); p.poly([...bd], mul(O.beard, [1, 1, 1]), ow * 0.6); }
  const ex = expr;
  faceFront(p, cx, hc, W, ex, facing, look, lid, false, skin, O.moustache, !!O.stout);
  if (talk > 0.05 && !['gasp', 'shock', 'shout', 'laugh', 'grin'].includes(ex)) { // open mouth while talking / chewing
    const mx = cx + 8 * u * facing, my = hc + 20 * u; p.ell(mx, my + 2 * u, 8 * u, (3 + 8 * talk) * u, '#5a1e28', 2.6 * u); }
  if (O.glasses || O.shades) { const fx = cx + 7 * u * facing, col = O.shades ? '#16161c' : O.glasses;
    for (const s of [-1, 1]) p.ell(fx + s * 13 * u, hc, 10.5 * u, 9 * u, O.shades ? '#1d1d26' : null, 2.4 * u);
    p.stroke([[fx - 3 * u, hc - 2 * u], [fx + 3 * u, hc - 2 * u]], 2.2 * u, col);
    if (!O.shades) for (const s of [-1, 1]) p.stroke(ellPts(fx + s * 13 * u - 3 * u, hc - 3 * u, 4 * u, 3 * u, 200, 290, 0, 6), 1.4 * u, '#ffffff99'); }
  p.rot = null;
  for (const [i, a] of arms.entries()) if (a.over) drawArm(a, i ? 1 : -1);
}
/** y (design units) of the head centre for a pose, to anchor fx cards */
export const headY = (O = {}, mode = 'stand', seed = 3) => { const H = headBlob(seed, O.kid ? 112 : 118, 0), HH = 2 * H.b;
  const torsoBot = mode === 'sit' ? 975 - 0.66 * HH : 975 - (O.kid ? 0.95 : 1.38) * HH; return torsoBot - (O.kid ? 0.82 : O.stout ? 1.12 : 1.06) * HH - H.b; };

// ---------- 2D effects (cards) ----------
export const fx = {
  /** anger steam: two puffs shooting up from both sides of the head, k 0..1 loops */
  steam(p, k, y = 300) { const g = p.g; g.save();
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) { const t = (k + i / 3) % 1, r = 18 + 40 * t;
      g.globalAlpha = Math.max(0, 1 - t) * 0.95; p.ell(300 + s * (140 + 50 * t), y - 20 - 150 * t, r, r * 0.85, '#ffffff', 6); }
    g.restore(); },
  /** anime anger mark */
  vein(p, s = 1) { const c = '#e0302a'; p.g.save(); p.g.translate(300, 300); p.g.scale(s, s); p.g.translate(-300, -300);
    for (const [a, b] of [[[250, 250], [290, 290]], [[350, 250], [310, 290]], [[250, 350], [290, 310]], [[350, 350], [310, 310]]]) { p.stroke([a, [(a[0] + b[0]) / 2 + (a[1] < 300 ? 0 : 0), (a[1] + b[1]) / 2], b], 26, INK); p.stroke([a, b], 16, c); }
    p.g.restore(); },
  exclaim(p) { p.poly([[280, 120], [330, 120], [318, 420], [292, 420]], '#ffd23f', 12); p.ell(305, 500, 30, 30, '#ffd23f', 12); },
  question(p) { const g = p.g; g.save(); g.font = '900 420px Inter, Arial Black, Arial'; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 34; g.strokeStyle = INK; g.strokeText('?', 300, 560); g.fillStyle = '#ffffff'; g.fillText('?', 300, 560); g.restore(); },
  sweat(p) { p.poly([[300, 300], [340, 400], [300, 440], [260, 400]], '#9fd4ff', 10); },
  sparkle(p, k = 0) { const s = 0.6 + 0.4 * Math.sin(k * 12); p.g.save(); p.g.translate(300, 500); p.g.scale(s, s);
    p.poly([[0, -160], [36, -36], [160, 0], [36, 36], [0, 160], [-36, 36], [-160, 0], [-36, -36]], '#fff3b0', 10); p.g.restore(); },
  zzz(p, t) { const g = p.g; g.save(); g.font = '900 120px Inter, Arial Black, Arial'; g.lineJoin = 'round';
    for (let i = 0; i < 3; i++) { const kk = (t + i / 3) % 1, x = 220 + i * 70, y = 700 - kk * 500, s = 0.5 + kk * 0.7; g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha = Math.min(1, (1 - kk) * 2.5); g.lineWidth = 16; g.strokeStyle = INK; g.strokeText('Z', 0, 0); g.fillStyle = '#fff'; g.fillText('Z', 0, 0); g.restore(); }
    g.restore(); },
  /** speed lines for a fast move (dir -1 / 1) */
  speed(p, dir = 1) { for (let i = 0; i < 7; i++) { const y = 300 + i * 70, x0 = 300 - dir * (60 + (i % 3) * 50); p.stroke([[x0, y], [x0 - dir * (160 + (i % 2) * 90), y]], 10, '#ffffff'); } },
  puff(p, k) { const g = p.g; g.save(); g.globalAlpha = Math.max(0, 1 - k * k);
    for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2, r = 90 + 150 * k; p.ell(300 + Math.cos(a) * r, 720 + Math.sin(a) * r * 0.5, 90 + 50 * k, 70 + 40 * k, '#ece4d6', 10); }
    g.restore(); },
};
