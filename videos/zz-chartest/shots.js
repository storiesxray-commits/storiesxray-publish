import * as S from './scenes.js';
export const KEY = [];
export function build(st, wd) { return [['s01', 0, () => S.lineup(), null], ['s02', 1, () => S.close(0), null], ['s03', 2, () => S.interior(), null], ['s04', 3, () => S.street(), null], ['s05', 4, () => S.product(), null]]; }
