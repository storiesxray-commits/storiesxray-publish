import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['wrinkle','water','body',"doesn't",'nerves','minutes','signal','vessels','squeeze','shrinks','ridges','thirties','damaged','soak','grip','thirteen','marbles','faster','wrinkled','tire','treads','rain','tires'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {
  const W2 = wd(2, 8) - st(2);
  const defs = [
    ['s01', 0, () => S.hook('in'), { html: '<span class="mid">IT\'S NOT</span><span class="mid y">THE WATER</span>', t0: 0.0 }],
    ['s02', st(2), () => S.wholeBody(W2), { fn: (t) => t < W2 ? '' : '<span class="mid r">IT DOESN\'T</span>', t0: 0, pop: [W2] }],
    ['s03', st(3), () => S.nerves(), { html: '<span class="mid y">NERVES</span>', t0: wd(3, 5) - st(3) - 0.05 }],
    ['s04a', st(4), () => S.soak(), { fn: (t, d) => { const sec = Math.round(300 * Math.min(1, Math.pow(t / (d * 0.8), 1.3))); return `<span class="mid" style="font-size:190px">${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}</span>`; }, t0: 0.05 }],
    ['s04b', wd(4, 5) - 0.08, () => S.signal('signal')],
    ['s05a', st(5), () => S.signal('squeeze'), { html: '<span class="mid r">SQUEEZE</span>', t0: wd(5, 2) - st(5) - 0.05 }],
    ['s05b', wd(5, 4) - 0.1, () => S.crossSection(), { html: '<span class="mid y">RIDGES</span>', t0: wd(5, 14) - wd(5, 4) + 0.05 }],
    ['s06a', st(6), () => S.thirties(), { html: '<span class="big" style="font-size:230px">1930s</span>', t0: wd(6, 7) - st(6) - 0.05 }],
    ['s06b', wd(6, 9) - 0.1, () => S.compare('b')],
    ['s06c', wd(6, 15) - 0.1, () => S.compare('c'), { html: '<span class="mid">STILL</span><span class="mid r">SMOOTH</span>', t0: 0.3 }],
    ['s07', st(7), () => S.grip(), { html: '<span class="big" style="font-size:250px">GRIP</span>', t0: wd(7, 7) - st(7) - 0.05 }],
    ['s08a', st(8), () => S.study('intro'), { html: '<span class="big" style="font-size:230px">2013</span><span class="mid">STUDY</span>', t0: 0.25 }],
    ['s08b', wd(8, 5) - 0.1, () => S.study('race'), { html: '<span class="mid g">FASTER</span>', t0: wd(8, 9) - wd(8, 5) + 0.05 }],
    ['s09a', st(9), () => S.ridges()],
    ['s09b', wd(9, 5) - 0.05, () => S.tire(), { html: '<span class="mid">TIRE</span><span class="mid y">TREADS</span>', t0: 0.25 }],
    ['s10', st(10), () => S.hook('out')],
  ];
  return defs;
}
