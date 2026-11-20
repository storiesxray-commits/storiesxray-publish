import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['eighteen', 'minutes.', 'food.', 'not', 'mad.', 'couple', 'after', 'already', 'eating.', 'mit', 'larson', 'decades.', 'annoying.', 'skipped', 'furious.', 'happened', "isn't", 'problem.', 'someone', 'first', 'stew?'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const M = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B = (a, cls = '', fs = 240) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const r = (i, j) => wd(i, j) - st(i);
  const TF = wd(2, 0) - 0.05;                        // "No food" (still in s01)
  const TN = r(3, 2) - 0.05;                         // "NOT"
  const TA = r(4, 8) - 0.05;                         // "already"
  const TW = wd(7, 0) - st(6) - 0.05;                // "Waiting is annoying" (s05 starts at "His take?")
  const TK = r(8, 1) - 0.05, TM = r(8, 6) - 0.05;    // "skipped", "furious"
  const TS = r(10, 1) - 0.05;                        // "isn't"
  return [
    ['s01', 0, () => S.waiting('hook'), { fn: t => t < TF ? M('18 MINUTES', 'y') : M('18 MINUTES', 'y') + M('NO FOOD'), t0: 0, pop: [TF] }],
    ['s02', st(3), () => S.waiting('not', TN + 0.05), { fn: t => t < TN ? M("THAT'S NOT") : M("THAT'S NOT") + M('WHY YOU’RE MAD', 'r'), t0: 0.03, pop: [TN] }],
    ['s03', st(4), () => S.couple('served', TA + 0.05), { fn: t => t < TA ? M('THEY SAT DOWN') + M('AFTER YOU', 'y') : M('ALREADY') + M('EATING', 'r'), t0: 0.05, pop: [TA] }],
    ['s04', st(5), () => S.queue('wide'), { html: M('MIT PROFESSOR') + M('STUDIED LINES', 'y'), t0: 0.1 }],
    ['s05', st(6), () => S.queue('watch'), { fn: t => t < TW ? M('HIS TAKE?') : M('WAITING =') + M('ANNOYING', 'y'), t0: 0.05, pop: [TW] }],
    ['s06', st(8), () => S.queue('skip', TK + 0.05, TM + 0.05), { fn: t => t < TM ? M('GETTING') + M('SKIPPED', 'y') : B('FURIOUS', 'r', 200), t0: 0.05, pop: [TM] }],
    ['s07', st(9), () => S.counter1976(), { html: B('1976', 'y', 220) + M('HE GOT SKIPPED'), t0: 0.05 }],
    ['s08', st(10), () => S.waiting('strike', 0, TS + 0.05), { html: M('WAITING') + M("ISN'T IT", 'y'), t0: 0.05 }],
    ['s09', st(11), () => S.couple('eat'), { html: M('WATCHING THEM') + M('GO FIRST', 'r'), t0: 0.05 }],
    ['s10', st(12), () => S.waiting('end'), { html: M('SAY SOMETHING?') + M('OR JUST STEW?', 'y'), t0: 0.05 }],
  ];
}
