import * as S from './scenes.js';
// Caption words highlighted in yellow (compared without . , :)
export const KEY = ['zero', 'muscles', 'one!', 'forearm!', 'tendons', 'strings', 'puppet!', 'wiggle', 'arm'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const M = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B = (a, cls = '', fs = 260) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const N1 = wd(2, 0) - 0.05;                    // "Not one!"
  const F2 = wd(4, 1) - st(3) - 0.04;            // "forearm!"
  const P4 = wd(6, 1) - st(6) - 0.05;            // "strings"
  const A5 = wd(7, 3) - st(7) - 0.05;            // "Watch your arm"
  return [
    ['s01', 0, () => S.hook('in', N1), { fn: t => t < N1 ? M('YOUR FINGERS HAVE') + B('ZERO', 'r', 250) + M('MUSCLES', 'y') : B('NOT ONE!', 'r', 210), t0: 0, pop: [N1] }],
    ['s02', st(3), () => S.reveal(F2), { fn: t => t < F2 ? M('SO WHAT') + M('MOVES THEM?', 'y') : M('YOUR') + B('FOREARM', 'r', 220), t0: 0.0, pop: [F2] }],
    ['s03', st(5), () => S.pull(), { html: M('MUSCLES UP HERE') + M('PULL TENDONS', 'y'), t0: 0.05 }],
    ['s04', st(6), () => S.puppet(), { fn: t => t < P4 ? '' : M('LIKE') + M('PUPPET STRINGS', 'y'), t0: 0, pop: [P4] }],
    ['s05', st(7), () => S.wiggle(), { fn: t => t < A5 ? M('WIGGLE') + M('YOUR FINGERS', 'y') : M('WATCH') + M('YOUR ARM', 'r'), t0: 0.05, pop: [A5] }],
    ['s06', st(8), () => S.hook('out'), { html: M('SEE?', 'y'), t0: 0.05 }],
  ];
}
