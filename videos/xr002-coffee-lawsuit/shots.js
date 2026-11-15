import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['laughed','backwards','albuquerque','ninety-two','seventy-nine','spilled','ninety','degrees','burns','three','sweatpants','skin','eight','hospital','grafts','bills','trial','hundred','complaints','million','eighty','thousand','frivolous','warnings','fifteen','seconds','space','suit','sixty-six','nasa','pressure','vacuum','lungs','saliva','boil','bubbling','blood','oxygen','brain','lights','fourteen','fine','air'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {

  const defs = [
    ['s01', 0, () => S.cup('tip'), { html: '<span class="mid">THE HOT COFFEE</span><span class="mid y">LAWSUIT</span>', t0: 0.0 }],
    ['s02', st(2), () => S.cup('flip'), { html: '<span class="mid y">BACKWARDS</span>', t0: 0.45 }],
    ['s03a', st(3), () => S.driveThru('wide'), { html: '<span class="mid">ALBUQUERQUE,</span><span class="mid y">1992</span>', t0: 0.15 }],
    ['s03b', st(4), () => S.driveThru('close')],
    ['s04', wd(4, 4) - 0.1, () => S.spill()],
    ['s05', st(5), () => S.thermo(), { fn: (t, d) => `<span class="big" style="font-size:230px;color:${t / d > 0.62 ? '#ff3b30' : '#FFD60A'}">${Math.round(70 + 120 * Math.min(1, Math.pow(Math.max(0, (t - 0.3) / (d * 0.62 - 0.3)), 0.8)))}°F</span>`, t0: 0.3 }],
    ['s06', st(6), () => S.skin(), { fn: (t, d) => { const u = t / d; return u < 0.45 ? '' : u < 0.58 ? '<span class="big">3</span>' : u < 0.71 ? '<span class="big">2</span>' : u < 0.84 ? '<span class="big r" style="color:#ff3b30">1</span>' : '<span class="mid r">3 SECONDS</span>'; }, t0: 0, popFrac: [0.45, 0.58, 0.71, 0.84] }],
    ['s07', st(7), () => S.fabric()],
    ['s08', st(8), () => S.hospital(), { fn: (t, d) => { const n = Math.min(8, 1 + Math.floor(t / (d * 0.5) * 8)); return n < 8 ? `<span class="mid">DAY ${n}</span>` : '<span class="big">8</span><span class="mid">DAYS</span>'; }, t0: 0.1 }],
    ['s09a', st(9), () => S.bills()],
    ['s09b', st(10), () => S.courthouse()],
    ['s10', st(11), () => S.folder(), { fn: (t, d) => `<span class="big" style="font-size:250px">${Math.round(700 * Math.min(1, Math.pow(Math.max(0, (t - 1.2) / 1.5), 0.7)))}${t > 2.7 ? '+' : ''}</span><span class="mid">COMPLAINTS</span>`, t0: 1.2 }],
    ['s11a', st(12), () => S.cash('a'), { html: '<span class="big" style="font-size:250px;color:#4dff88">$2.7M</span>', t0: 0.55 }],
    ['s11b', st(13), () => S.cash('b'), { fn: (t, d) => t < 1.05 ? '<span class="big" style="font-size:250px;color:#4dff88">$2.7M</span>' : '<span class="big" style="font-size:250px">$480K</span>', t0: 0, pop: [1.05] }],
    ['s12', st(14), () => S.cup('end')],
  ];
  return defs;
}
