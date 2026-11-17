import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['soldiers', 'reenlisted...', 'gta', '6.', 'kidding!', 'army', 'georgia', 'four-day', 'pass,', 'catch?', 'two', 'years.', 'twenty', 'yes!', 'five', 'skip', 'sick.', 'flu.', 'flu?', 'seven', 'thousand', 'game.', 'you'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const M = (a, cls = '') => `<span class="mid ${cls}">${a}</span>`, B = (a, cls = '', fs = 260) => `<span class="big ${cls}" style="font-size:${fs}px">${a}</span>`;
  const r = (i, j) => wd(i, j) - st(i);
  const T3 = r(3, 7) - 0.05, T4 = r(4, 2) - 0.05, T7 = r(7, 4) - 0.05, T8 = r(8, 5) - 0.05, T9 = r(9, 4) - 0.05, T10 = r(10, 4) - 0.05;
  return [
    ['s01', 0, () => S.couch('in'), { html: M('SOLDIERS REENLISTED') + M('TO PLAY GTA 6', 'y'), t0: 0 }],
    ['s02', st(2), () => S.memo(0.25), { html: M("I'M NOT") + M('KIDDING!', 'r'), t0: 0.05 }],
    ['s03', st(3), () => S.pass(T3), { fn: t => t < T3 ? M('ARMY UNIT') + M('IN GEORGIA', 'y') : B('4', '', 250) + M('DAYS OFF', 'y'), t0: 0.05, pop: [T3] }],
    ['s04', st(4), () => S.contract(r(4, 2), r(4, 7)), { fn: t => t < T4 ? M('THE') + M('CATCH?', 'r') : M('SIGN UP FOR') + M('2+ MORE YEARS', 'y'), t0: 0.05, pop: [T4] }],
    ['s05', st(5), () => S.twenty(), { html: B('20', '', 270) + M('SAID YES', 'g'), t0: 0.05 }],
    ['s06', st(6), () => S.office('wide'), { html: M("IT'S NOT JUST") + M('SOLDIERS', 'y'), t0: 0.05 }],
    ['s07', st(7), () => S.office('empty', r(7, 3), r(7, 8)), { fn: t => t < T7 ? M('ALMOST') + B('1 IN 5', '', 230) : M('SKIP') + M('LAUNCH DAY', 'y'), t0: 0.05, pop: [T7] }],
    ['s08', st(8), () => S.sick(T8), { fn: t => t < T8 ? M('HALF THE GAMERS') + M('TAKING OFF?') : M("THEY'LL CALL") + M('IN SICK', 'r'), t0: 0.05, pop: [T8] }],
    ['s09', st(9), () => S.flu(T9), { fn: t => t < T9 ? M('PEOPLE CALL IT...') : M('THE') + B('GTA FLU', 'r', 210), t0: 0.05, pop: [T9] }],
    ['s10', st(10), () => S.tower(T10), { fn: t => t < T10 ? M('ONE TECH') + M('COMPANY') : B('7,000', '', 240) + M('DAY OFF TO GAME', 'y'), t0: 0.05, pop: [T10] }],
    ['s11', st(11), () => S.couch('end'), { html: M('ARE YOU CATCHING') + M('THE GTA FLU?', 'y'), t0: 0.05 }],
  ];
}
