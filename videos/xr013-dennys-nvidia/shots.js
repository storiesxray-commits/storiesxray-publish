import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['nvidia', "denny's?!", 'fifteen', 'dishes', "denny's!", '1993', 'booth', 'bottomless', 'coffee', 'trillions!', 'resigned', 'plaque', 'gone!', 'back!', 'billion-dollar', 'idea!'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const M = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B = (a, cls = '', fs = 260) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const r = (i, j) => wd(i, j) - st(i);
  const TN = r(4, 2) - 0.05, TB = r(5, 3) - 0.05, TT = r(6, 7) - 0.05, TR = r(7, 3) - 0.05;
  const TG = r(8, 5) - 0.05, TK = wd(9, 4) - st(8) - 0.05;
  return [
    ['s01', 0, () => S.hook('in'), { html: M('NVIDIA BORN') + M("AT DENNY'S?!", 'y'), t0: 0 }],
    ['s02', st(2), () => S.dishes(), { html: B('AGE 15', 'y', 230) + M('DISHWASHER'), t0: 0.05 }],
    ['s03', st(3), () => S.booth('wide'), { html: B('1993', 'y', 240) + M('ONE BOOTH'), t0: r(3, 1) - 0.05 }],
    ['s04', st(4), () => S.booth('coffee', 0), { fn: t => t < TN ? M('BOTTOMLESS', 'y') + M('COFFEE') : M('NOBODY KICKS') + M('YOU OUT', 'y'), t0: 0.05, pop: [TN] }],
    ['s05', st(5), () => S.became(TB + 0.05), { fn: t => t < TB ? M('THAT BOOTH') : M('THAT BOOTH') + M('= NVIDIA', 'g'), t0: 0.05, pop: [TB] }],
    ['s06', st(6), () => S.trillions(TT + 0.05), { fn: t => t < TT ? M('AI CHIP GIANT') : M('WORTH') + M('TRILLIONS', 'y'), t0: 0.05, pop: [TT] }],
    ['s07', st(7), () => S.resigned(TR + 0.05), { fn: t => t < TR ? M('BUT NOW?') : M('HE') + M('RESIGNED', 'r'), t0: 0.05, pop: [TR] }],
    ['s08', st(8), () => S.plaque(TG + 0.05, TK + 0.05), { fn: t => t < TG ? M('THE PLAQUE?') : t < TK ? B('GONE!', 'r', 240) : M("DENNY'S PUT IT") + M('BACK!', 'g'), t0: 0.05, pop: [TG, TK] }],
    ['s09', st(10), () => S.hook('end'), { html: M('SEND THIS') + M('TO A FRIEND') + M('WITH A $1B IDEA', 'y'), t0: 0.05 }],
  ];
}
