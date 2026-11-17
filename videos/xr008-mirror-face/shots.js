import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['never', 'real', 'face.', 'mirror', 'flips', 'left', 'right.', 'lopsided.', 'backwards.', '1977', 'flipped', 'most', 'friends?', 'like', 'prettier', 'edited', 'photo', 'prefer.'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const M = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B = (a, cls = '', fs = 260) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const r = (i, j) => wd(i, j) - st(i);
  const T1 = wd(2, 0) - 0.05;
  const T3 = r(3, 4) - 0.05;
  const T5 = r(5, 5) - 0.1;
  const T6 = r(6, 2) - 0.05;
  const Y = r(7, 1) - 0.05, F = wd(8, 1) - st(7) - 0.05;
  const T10a = r(10, 2) - 0.05, T10b = r(10, 9) - 0.05;
  const S9 = wd(11, 6) - 0.1, T11 = r(11, 1);
  return [
    ['s01', 0, () => S.hook('in', wd(2, 0)), { fn: t => t < T1 ? M('NEVER SEEN') + M('YOUR REAL FACE', 'y') : M('NOT THE WAY') + M('OTHERS SEE IT', 'y'), t0: 0, pop: [T1] }],
    ['s02', st(3), () => S.mirrorRoom(r(3, 2)), { fn: t => t < T3 ? M('MIRRORS') + M('FLIP YOU', 'y') : M('LEFT') + M('↔ RIGHT', 'y'), t0: 0.05, pop: [T3] }],
    ['s03', st(4), () => S.lopsided(r(4, 7)), { html: M('EVERY FACE IS') + M('LOPSIDED', 'r'), t0: r(4, 3) - 0.05 }],
    ['s04', st(5), () => S.backwards(T5 + 0.1), { fn: t => t < T5 ? M('THE FACE') + M('YOU KNOW...') : M('IS') + M('BACKWARDS', 'r'), t0: 0.05, pop: [T5] }],
    ['s05', st(6), () => S.photos('show', 0.7, r(6, 10)), { fn: t => t < T6 ? B('1977', '', 260) : M('REAL FACE') + M('VS. FLIPPED', 'y'), t0: 0.05, pop: [T6] }],
    ['s06', st(7), () => S.photos('vote', Y, F), { fn: t => t < F ? M('MOST PICKED') + M('THE FLIPPED', 'y') : M('FRIENDS PICKED') + M('THE REAL ONE', 'g'), t0: 0.05, pop: [F] }],
    ['s07', st(9), () => S.familiar(), { html: M('WE LIKE WHAT') + M('WE SEE MOST', 'y'), t0: 0.05 }],
    ['s08', st(10), () => S.lineup(r(10, 5), T10b), { fn: t => t < T10a ? M('ANOTHER') + M('STUDY', 'y') : t < T10b ? M('PICKED A') + M('PRETTIER EDIT', 'y') : M('AS THEIR') + M('REAL FACE', 'y'), t0: 0.05, pop: [T10a, T10b] }],
    ['s09', st(11), () => S.phone(r(11, 2)), { html: M('THAT PHOTO') + M("YOU CAN'T STAND?", 'y'), t0: T11 }],
    ['s10', S9, () => S.hook('end'), { html: M("THAT'S THE FACE") + M('FRIENDS PREFER', 'g'), t0: 0.05 }],
  ];
}
