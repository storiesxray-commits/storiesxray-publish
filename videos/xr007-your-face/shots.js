import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['billion','your','face?','face','perfect','copy?','impossible','eight','features','thousand','trillion!','look-alikes?','real','thirty-two','strangers','twins','three','sixteen','dna','nine','same','gene','height','weight...','smoking!','likely','somewhere'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const M = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B = (a, cls = '', fs = 260) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const r = (i, j) => wd(i, j) - st(i);
  const T1 = wd(2, 0) - 0.05;
  const T3 = r(3, 3);
  const T4 = r(4, 6) - 0.05;
  const T5 = r(5, 5) - 0.05;
  const T6 = r(6, 2) - 0.05;
  const T7 = r(7, 3) - 0.05;
  const T8 = r(8, 4) - 0.05, T8b = r(8, 6) + 0.2;
  const T9 = r(9, 4) - 0.15;
  const T10 = r(10, 6) - 0.05;
  const H = r(11, 5) - 0.05, Wt = r(11, 6) - 0.05, Sm = r(11, 8) - 0.05;
  const T12 = r(12, 7) - 0.05;
  const T13 = r(13, 3) - 0.05;
  return [
    ['s01', 0, () => S.hook('in', wd(2, 3)), { fn: t => t < T1 ? M('8 BILLION') + M('PEOPLE...', 'y') : M('HOW MANY HAVE') + B('YOUR FACE?', 'y', 150), t0: 0, pop: [T1] }],
    ['s02', st(3), () => S.copy(T3), { fn: t => t < T3 ? M('A PERFECT') + M('COPY?', 'y') : M('ALMOST') + M('IMPOSSIBLE', 'r'), t0: 0.05, pop: [T3] }],
    ['s03', st(4), () => S.measure(r(4, 2), r(4, 8) + 0.4), { fn: t => t < T4 ? B('8', '', 270) + M('FEATURES', 'y') : B('4,000', '', 240) + M('FACES', 'y'), t0: 0.05, pop: [T4] }],
    ['s04', st(5), () => S.odds(r(5, 9)), { fn: t => t < T5 ? M('EXACT') + M('MATCH?', 'y') : M('UNDER 1 IN A') + M('TRILLION', 'r'), t0: 0.05, pop: [T5] }],
    ['s05', st(6), () => S.meet(r(6, 1) + 0.45, T6), { fn: t => t < T6 ? M('LOOK-ALIKES?', 'y') : M("THEY'RE") + M('REAL', 'g'), t0: 0.05, pop: [T6] }],
    ['s06', st(7), () => S.wall(T7), { fn: t => t < T7 ? B('32', '', 270) + M('PAIRS', 'y') : M('STRANGERS') + M('LIKE TWINS', 'y'), t0: 0.05, pop: [T7] }],
    ['s07', st(8), () => S.scanners(T8), { fn: t => { if (t < T8) return M('3 FACE') + M('SCANNERS', 'y'); const n = Math.round(16 * ss(T8, T8b, t)); return B(n, n === 16 ? 'y' : '', 270) + M('PAIRS MATCH', 'g'); }, t0: 0.05, pop: [T8, T8b] }],
    ['s08', st(9), () => S.dna(T9), { fn: t => t < T9 ? M('THEN...') : M('THEIR') + B('DNA', 'y', 250), t0: 0.05, pop: [T9] }],
    ['s09', st(10), () => S.genes(T10), { fn: t => t < T10 ? B('9', '', 270) + M('PAIRS') : M('SAME GENE') + M('VARIANTS', 'y'), t0: 0.05, pop: [T10] }],
    ['s10', st(11), () => S.traits(H, Wt, Sm), { fn: t => t < H ? M('THEY EVEN') + M('SHARE...') : t < Wt ? M('HEIGHT', 'y') : t < Sm ? M('HEIGHT') + M('WEIGHT', 'y') : M('WEIGHT...') + M('SMOKING!', 'r'), t0: 0.05, pop: [H, Wt, Sm] }],
    ['s11', st(12), () => S.planet(T12), { fn: t => t < T12 ? M('8 BILLION') + M('OF US', 'y') : M('LOOK-ALIKES') + M('MORE LIKELY', 'y'), t0: 0.05, pop: [T12] }],
    ['s12', st(13), () => S.hook('end'), { fn: t => t < T13 ? M('SOMEWHERE') + M('OUT THERE...', 'y') : M('SOMEONE HAS') + M('YOUR FACE', 'y'), t0: 0.05, pop: [T13] }],
  ];
}
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
