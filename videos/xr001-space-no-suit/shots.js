import * as S from './scenes.js';
// Caption words highlighted in yellow
export const KEY = ['fifteen','seconds','space','suit','sixty-six','nasa','pressure','vacuum','lungs','saliva','boil','bubbling','blood','oxygen','brain','lights','fourteen','fine','air'];
// Shot list: [id, start time (s), scene factory, optional title]. st(i) = start of sentence i, wd(i, j) = start of word j of sentence i.
export function build(st, wd) {

  const defs = [
    ['s01', 0, () => S.space('close'), { html: '<span class="big">15</span><span class="mid">SECONDS</span>', t0: 0.0 }],
    ['s02', st(2), () => S.space('wide')],
    ['s03a', st(3), () => S.labExterior('wide'), { html: '<span class="mid">HOUSTON,</span><span class="mid y">1966</span>', t0: 0.15 }],
    ['s03b', wd(3, 7) - 0.06, () => S.labExterior('push')],
    ['s04', st(4), () => S.hoseSnap()],
    ['s05', st(5), () => S.xrayLungs()],
    ['s06a', st(6), () => S.xrayMouth('a'), { html: '<span class="mid">SALIVA</span><span class="mid r">BOILS</span>', t0: 0.45 }],
    ['s06b', st(7), () => S.xrayMouth('b')],
    ['s07', st(8), () => S.xrayArm(), { html: '<span class="mid">BLOOD:</span><span class="mid g">SAFE</span>', t0: 0.25 }],
    ['s08', st(9), () => S.vesselPressure()],
    ['s09', st(10), () => S.cellsNoOxygen(), { html: '<span class="mid">OXYGEN</span>', t0: 0.2 }],
    ['s10', st(11), () => S.brainOut()],
    ['s11', st(12), () => S.passOut(), { html: '<span class="big">14</span><span class="mid">SECONDS</span>', t0: wd(12, 4) - st(12) - 0.05 }],
    ['s12', st(13), () => S.wakeUp()],
    ['s13', st(14), () => S.space('close')],
  ];
  return defs;
}
