import * as S from './scenes.js';
export const KEY = [];
export function build(st, wd) { return [['s01', 0, () => S.lineup(), null], ['s02', 1, () => S.close(0), null], ['s03', 2, () => S.close(1), null], ['s04', 3, () => S.close(2), null], ['s05', 4, () => S.close(3), null]]; }
