import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['deadliest','wave','water','molasses','molasses?','january','fifteenth','nineteen','noon','fifty-foot','million','gallons','warm','rivets','gunfire','splits','forty','heavier','ooze','surges','twenty-five','thirty-five','flattens','elevated','decades','sweet','rules','math','slow','not'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const T1 = wd(1, 6) - 0.05;                       // "wasn't"
  const T4 = wd(4, 5) - st(4) - 0.05;               // "North"
  const TX = wd(5, 4) - st(5) - 0.1;                // "holds" -> x-ray
  const T12a = wd(12, 4) - st(12) - 0.05, T12b = wd(12, 9) - st(12) - 0.05;
  const T15 = st(15) - st(14), T18 = st(18) - st(17), T20 = st(20) - st(19);
  return [
    ['s01', 0, () => S.hook('in'), { fn: t => t < T1 ? '<span class="mid">BOSTON\'S</span><span class="mid y">DEADLIEST WAVE</span>' : '<span class="mid">IT WASN\'T</span><span class="mid y">WATER</span>', t0: 0, pop: [T1] }],
    ['s02', st(2), () => S.drip(), { html: '<span class="big" style="font-size:200px">MOLASSES</span>', t0: wd(2, 2) - st(2) - 0.05 }],
    ['s03', st(3), () => S.boston('wide'), { html: '<span class="mid">JAN 15</span><span class="big" style="font-size:240px">1919</span>', t0: 0.1 }],
    ['s04', st(4), () => S.boston('clock'), { fn: t => t < T4 ? '<span class="mid y">12:30 PM</span>' : '<span class="mid y">12:30 PM</span><span class="mid">NORTH END</span>', t0: 0.1, pop: [T4] }],
    ['s05', st(5), () => S.tankXray(TX), { fn: t => t < wd(5, 5) - st(5) ? '' : '<span class="mid y">2.3 MILLION</span><span class="mid">GALLONS</span>', t0: 0, pop: [wd(5, 5) - st(5)] }],
    ['s06', st(6), () => S.thermo(), { html: '<span class="mid y">UNUSUALLY</span><span class="mid y">WARM</span>', t0: wd(6, 3) - st(6) - 0.05 }],
    ['s07', st(7), () => S.rivets('pop'), { html: '<span class="mid r">GUNFIRE</span>', t0: wd(7, 4) - st(7) - 0.05 }],
    ['s08', st(8), () => S.rivets('split'), { html: '<span class="mid r">SPLITS OPEN</span>', t0: wd(8, 3) - st(8) - 0.05 }],
    ['s09', st(9), () => S.scale(), { html: '<span class="big">40%</span><span class="mid">HEAVIER</span>', t0: wd(9, 2) - st(9) - 0.05 }],
    ['s10', st(10), () => S.ooze(), { html: '<span class="mid">OOZE</span>', t0: wd(10, 3) - st(10) - 0.05 }],
    ['s11', st(11), () => S.surge(), { html: '<span class="big" style="font-size:230px">SURGES</span>', t0: wd(11, 1) - st(11) - 0.05 }],
    ['s12', st(12), () => S.race(T12a), { fn: t => t < T12a ? '' : t < T12b ? '<span class="big">25 FT</span>' : '<span class="big">25 FT</span><span class="mid r">35 MPH</span>', t0: 0, pop: [T12a, T12b] }],
    ['s13', st(13), () => S.flatten(wd(13, 4) - st(13))],
    ['s14', st(14), () => S.aftermath(), { fn: t => t < T15 ? '<span class="mid">21 DIED</span>' : '<span class="mid">21 DIED</span><span class="mid">150 HURT</span>', t0: wd(14, 0) - st(14) + 0.1, pop: [T15] }],
    ['s15', st(16), () => S.smell(), { fn: t => t < wd(16, 8) - st(16) - 0.05 ? '<span class="mid">FOR DECADES</span>' : '<span class="mid">FOR DECADES</span><span class="mid y">SWEET</span>', t0: 0.15, pop: [wd(16, 8) - st(16) - 0.05] }],
    ['s16', st(17), () => S.blueprint(wd(18, 5) - st(17)), { fn: t => t < T18 ? '<span class="mid">NEW RULES</span>' : '<span class="mid">SHOW THE</span><span class="mid y">MATH</span>', t0: wd(17, 4) - st(17) - 0.05, pop: [T18] }],
    ['s17', st(19), () => S.hook('out'), { fn: t => t < T20 ? '<span class="mid">SLOW AS</span><span class="mid y">MOLASSES?</span>' : '<span class="mid r">NOT</span><span class="mid r">THAT DAY</span>', t0: 0.05, pop: [T20] }],
  ];
}
