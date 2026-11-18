import * as S from './scenes.js';
// Caption words highlighted in yellow (compared without . , :)
export const KEY = ['never', 'real', 'voice', 'skull', 'vibrates', 'inner', 'ear', 'low', 'notes!', 'deeper!', 'air', 'bass', 'thin', 'hate?', 'everyone', 'crush!', 'twist', 'secretly', 'recognize', 'attractive', 'loud'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const M = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B = (a, cls = '', fs = 260) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const r = (i, j) => wd(i, j) - st(i);
  const T1 = wd(2, 0) - 0.05;
  const T3 = r(3, 3) - 0.05;
  const B4 = wd(5, 4) - st(5), D4 = wd(6, 0) - st(5) - 0.05;
  const K5 = wd(8, 0) - st(7) - 0.05, N5 = wd(8, 2) - st(7) - 0.05;
  const A6 = wd(10, 0) - st(9) - 0.05;
  const C8 = wd(13, 0) - st(12) - 0.05, H8 = wd(14, 0) - st(12) - 0.05, X8 = wd(14, 4) - st(12);
  const R9 = wd(16, 1) - st(15) - 0.05;
  const S10 = r(17, 1) - 0.05;
  return [
    ['s01', 0, () => S.xhead('hook', T1), { fn: t => t < T1 ? M("YOU'VE NEVER HEARD") + M('YOUR REAL VOICE', 'y') : B('NOT ONCE!', 'r', 200), t0: 0, pop: [T1] }],
    ['s02', st(3), () => S.xhead('skull', T3 + 0.1), { fn: t => t < T3 ? M('WHEN YOU') + M('TALK...') : M('YOUR SKULL') + M('VIBRATES', 'y'), t0: 0.05, pop: [T3] }],
    ['s03', st(4), () => S.xhead('ear', r(4, 4)), { html: M('THE BUZZ HITS') + M('YOUR INNER EAR', 'y'), t0: 0.05 }],
    ['s04', st(5), () => S.eq(B4, wd(6, 6) - st(5)), { fn: t => t < D4 ? M('SKULL BOOSTS') + M('THE LOW NOTES', 'y') : M('IN YOUR HEAD') + M('YOU SOUND DEEPER', 'y'), t0: 0.05, pop: [D4] }],
    ['s05', st(7), () => S.record(K5 + 0.05, N5 + 0.05), { fn: t => t < K5 ? M('A RECORDING') + M('= AIR ONLY', 'y') : t < N5 ? M('NO SKULL', 'r') : M('NO SKULL', 'r') + M('NO BASS', 'r'), t0: 0.05, pop: [K5, N5] }],
    ['s06', st(9), () => S.hate(A6 + 0.05), { fn: t => t < A6 ? M('THAT THIN VOICE') + M('YOU HATE?', 'y') : M("THAT'S THE ONE") + M('EVERYONE HEARS', 'r'), t0: 0.05, pop: [A6] }],
    ['s07', st(11), () => S.people(r(11, 1), r(11, 3), r(11, 5)), { html: M('THEY ALL HEAR') + M('THAT VOICE', 'y'), t0: 0.05 }],
    ['s08', st(12), () => S.study(C8 + 0.05, X8), { fn: t => t < C8 ? B('PLOT', 'r', 230) + M('TWIST', 'y') : t < H8 ? M('A STUDY') + M('RATED VOICES', 'y') : M('THEIR OWN VOICE') + M('WAS HIDDEN IN', 'y'), t0: 0, pop: [C8, H8] }],
    ['s09', st(15), () => S.reveal(R9 + 0.05), { fn: t => t < R9 ? M("MOST DIDN'T") + M('RECOGNIZE IT', 'y') : M('AND RATED IT') + M('MORE ATTRACTIVE', 'g'), t0: 0.05, pop: [R9] }],
    ['s10', st(17), () => S.xhead('end', S10 + 0.05), { fn: t => t < S10 ? M('NOW...') : M('SAY SOMETHING') + M('OUT LOUD', 'y'), t0: 0.05, pop: [S10] }],
  ];
}
