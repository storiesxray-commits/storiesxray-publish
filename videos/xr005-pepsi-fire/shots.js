import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['fire','fire.','dancing','january','twenty-seventh','nineteen','eighty-four','pepsi','thousands','six','six.','staircase','fireworks','early','sparks','slicked-back','notice','spins','tackles','smothers','flames','second','third','degree','burns','scalp','million','dollars','all','hospital','burn','named'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const T2 = wd(2, 0) - 0.05;
  const T4 = wd(4, 6) - st(4) - 0.05;
  const T8 = wd(8, 4) - st(8) - 0.05;
  const T10 = wd(10, 2) - st(9);
  const T16 = wd(16, 2) - st(16) - 0.05;
  const T18 = wd(18, 4) - st(17);
  const T19 = wd(19, 2) - st(19) - 0.05;
  return [
    ['s01', 0, () => S.hook('in'), { fn: t => t < T2 ? '<span class="mid">HIS HAIR WAS</span><span class="mid r">ON FIRE</span>' : '<span class="mid">HE KEPT</span><span class="mid y">DANCING</span>', t0: 0, pop: [T2] }],
    ['s02', st(3), () => S.establish(), { html: '<span class="mid">JAN 27</span><span class="big" style="font-size:240px">1984</span>', t0: 0.1 }],
    ['s03', st(4), () => S.filmcam(), { fn: t => t < T4 ? '<span class="mid">LOS ANGELES</span>' : '<span class="mid y">PEPSI</span><span class="mid">COMMERCIAL</span>', t0: 0.1, pop: [T4] }],
    ['s04', st(5), () => S.fans(), { html: '<span class="mid y">THOUSANDS</span><span class="mid">OF FANS</span>', t0: 0.05 }],
    ['s05', st(6), () => S.clapper(wd(6, 2) - st(6) + 0.05)],
    ['s06', st(7), () => S.descend()],
    ['s07', st(8), () => S.pyro(wd(8, 2) - st(8) - 0.05), { html: '<span class="mid r">TOO EARLY</span>', t0: T8 }],
    ['s08', st(9), () => S.ignite(wd(9, 1) - st(9), T10), { fn: t => t < T10 ? '' : '<span class="big r" style="font-size:220px;color:#ff3b30">ON FIRE</span>', t0: 0, pop: [T10] }],
    ['s09', st(11), () => S.spin(wd(12, 4) - st(11)), { html: '<span class="mid">HE DIDN\'T</span><span class="mid y">NOTICE</span>', t0: 0.1 }],
    ['s10', st(13), () => S.crew(wd(13, 3) - st(13), wd(13, 6) - st(13))],
    ['s11', st(14), () => S.scalp(0.3), { html: '<span class="mid">SCALP</span><span class="mid y">BURNS</span>', t0: 0.25 }],
    ['s12', st(15), () => S.cash(wd(15, 4) - st(15)), { html: '<span class="mid">SETTLED</span>', t0: 0.1 }],
    ['s13', st(16), () => S.giveaway('give'), { html: '<span class="mid">HE GAVE</span><span class="mid y">ALL OF IT</span>', t0: T16 }],
    ['s14', st(17), () => S.giveaway('sign', T18), { fn: t => t < T18 ? '<span class="mid">TO THE</span><span class="mid">HOSPITAL</span>' : '', t0: 0.1 }],
    ['s15', st(19), () => S.loopEnd(), { html: '<span class="mid">ON TAKE</span><span class="big" style="font-size:240px">6</span>', t0: T19 }],
  ];
}
