import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['hundred','hundred?','more','more?','twenty-two','france','eighteen','seventy-five','smoked','seventeen','two','pounds','chocolate','eighty-five','fencing','bike','deal','ninety','apartment','lawyer','forty-seven','every','month','his','thirty','years','died','first','family','kept','paying','double','worth','twenty','future','short'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const M = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B = (a, cls = '', fs = 260) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const T2 = wd(2, 0) - 0.05;
  const c0 = wd(3, 4) - st(3), c1 = wd(3, 6) - st(3) + 0.35;
  const T4 = wd(4, 6) - st(4) - 0.05;
  const T5 = wd(5, 5) - st(5) - 0.05;
  const T7 = wd(7, 2) - st(7) - 0.1;
  const T9 = wd(9, 5) - st(9);
  const T10 = wd(10, 6) - st(10) - 0.05, T11 = st(11) - st(10);
  const T13 = st(13) - st(12);
  const T14 = wd(14, 3) - st(14) - 0.05;
  const T15 = wd(15, 2) - st(15) - 0.05;
  const T17 = wd(17, 2) - st(17) - 0.05;
  const T18 = wd(18, 4) - st(18) - 0.05;
  const T20 = wd(20, 0) - st(19) - 0.05;
  return [
    ['s01', 0, () => S.hook('in'), { fn: t => t < T2 ? M('WANT TO LIVE') + M('TO 100?', 'y') : B('OR MORE?', 'r', 200), t0: 0, pop: [T2] }],
    ['s02', st(3), () => S.xray(c0 - 0.1), { fn: t => { const n = 100 + Math.round(22 * ss(c0, c1, t)); return B(n, n === 122 ? 'y' : '', 280) + M(n === 122 ? 'YEARS OLD' : 'YEARS'); }, t0: 0, pop: [c1] }],
    ['s03', st(4), () => S.born(), { fn: t => t < T4 ? M('JEANNE') + M('CALMENT', 'y') : M('FRANCE') + B('1875', '', 250), t0: 0.05, pop: [T4] }],
    ['s04', st(5), () => S.smoke(), { fn: t => t < T5 ? M('SMOKED') + M('UNTIL...') : M('SMOKED UNTIL') + B('117', 'r', 270), t0: 0.05, pop: [T5] }],
    ['s05', st(6), () => S.choco(wd(6, 8) - st(6)), { fn: t => t < wd(6, 8) - st(6) - 0.05 ? M('CHOCOLATE', 'y') : M('CHOCOLATE', 'y') + M('2 LB A WEEK'), t0: wd(6, 3) - st(6) - 0.05, pop: [wd(6, 8) - st(6) - 0.05] }],
    ['s06', st(7), () => S.fence(wd(7, 5) - st(7)), { fn: t => t < T7 ? M('AT') + B('85', '', 270) : B('85', '', 270) + M('FENCING', 'y'), t0: 0.05, pop: [T7] }],
    ['s07', st(8), () => S.bike(), { fn: t => t < wd(8, 3) - st(8) - 0.05 ? M('AT') + B('100', '', 270) : B('100', '', 270) + M('ON A BIKE', 'y'), t0: 0.05, pop: [wd(8, 3) - st(8) - 0.05] }],
    ['s08', st(9), () => S.deal(T9), { fn: t => t < T9 ? M('HER BEST') + M('MOVE?', 'y') : M('A') + M('DEAL', 'y'), t0: 0.05, pop: [T9] }],
    ['s09', st(10), () => S.ages(T11), { fn: t => t < T10 ? M('SHE SOLD') + M('HER HOME', 'y') : t < T11 ? M('TO A') + M('LAWYER', 'y') : M('SHE: 90') + M('HIM: 47', 'y'), t0: 0.05, pop: [T10, T11] }],
    ['s10', st(12), () => S.monthly(T13), { fn: t => t < T13 ? M('PAID HER') + M('EVERY MONTH', 'y') : M('THEN IT\'S') + M('HIS', 'y'), t0: 0.05, pop: [T13] }],
    ['s11', st(14), () => S.years(wd(14, 1) - st(14), wd(14, 4) - st(14) + 0.3), { html: B('30', '', 270) + M('YEARS', 'y'), t0: T14 }],
    ['s12', st(15), () => S.first(T15), { html: M('HE DIED') + M('FIRST', 'r'), t0: T15 }],
    ['s13', st(16), () => S.family(), { html: M('FAMILY') + M('KEPT PAYING', 'y'), t0: 0.05 }],
    ['s14', st(17), () => S.double(T17), { html: M('MORE THAN') + M('DOUBLE', 'y'), t0: T17 }],
    ['s15', st(18), () => S.press(), { fn: t => t < T18 ? M('AGE') + B('120', '', 270) : M('HER') + M('FUTURE?', 'y'), t0: 0.05, pop: [T18] }],
    ['s16', st(19), () => S.answer(T20), { fn: t => t < T20 ? M('HER') + M('ANSWER?', 'y') : M('"A VERY') + M('SHORT ONE"', 'y'), t0: 0.05, pop: [T20] }],
  ];
}
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
