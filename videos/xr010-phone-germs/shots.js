import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['phone?', 'dirtier', 'toilet', 'seat!', 'arizona', 'ten', 'bacteria', 'cleaned.', 'never.', 'bathroom.', 'flush', 'invisible', 'five', 'feet', 'eight', 'seconds!', 'face.', 'harmless.', 'clean', 'yours?'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const M = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B = (a, cls = '', fs = 260) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const r = (i, j) => wd(i, j) - st(i);
  const T5 = r(5, 1) - 0.05, T6 = r(6, 2) - 0.05, F5 = wd(8, 8) - st(8) - 0.05, F8 = wd(9, 1) - st(8) - 0.05, T11 = r(11, 2) - 0.05;
  return [
    ['s01', 0, () => S.hook('in'), { html: M('YOUR PHONE?') + M('DIRTIER THAN', 'y') + M('A TOILET SEAT', 'y'), t0: 0 }],
    ['s02', st(3), () => S.lab(r(3, 6)), { html: M('SCIENTISTS') + M('CHECKED', 'y'), t0: 0.05 }],
    ['s03', st(4), () => S.bars(r(4, 1)), { html: B('10X', 'r', 260) + M('MORE BACTERIA', 'y'), t0: r(4, 0) }],
    ['s04', st(5), () => S.scrub(T5), { fn: t => t < T5 ? M('WHY?', 'y') : M('TOILET SEATS') + M('GET CLEANED', 'g'), t0: 0.05, pop: [T5] }],
    ['s05', st(6), () => S.never(T6), { fn: t => t < T6 ? M('YOUR PHONE?') : M('ALMOST') + M('NEVER', 'r'), t0: 0.05, pop: [T6] }],
    ['s06', st(7), () => S.scroll(), { html: M('AND IT GOES TO') + M('THE BATHROOM', 'y'), t0: 0.05 }],
    ['s07', st(8), () => S.plume(F5, F8), { fn: t => t < F5 ? M('ONE FLUSH') + M('INVISIBLE SPRAY', 'y') : t < F8 ? B('5 FT', '', 240) + M('HIGH', 'y') : B('8 SEC', 'r', 240) + M('THAT FAST', 'y'), t0: 0.05, pop: [F5, F8] }],
    ['s08', st(10), () => S.face(r(10, 7)), { html: M('BACK TO') + M('YOUR FACE', 'r'), t0: r(10, 5) - 0.05 }],
    ['s09', st(11), () => S.harmless(T11), { fn: t => t < T11 ? M('GOOD NEWS?', 'g') : M('MOST ARE') + M('HARMLESS', 'g'), t0: 0.05, pop: [T11] }],
    ['s10', st(12), () => S.hook('end'), { html: M('WHEN DID YOU') + M('LAST CLEAN YOURS?', 'y'), t0: 0.05 }],
  ];
}
