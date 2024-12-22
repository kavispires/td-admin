import { fromPairs, isEqual, orderBy, range, sampleSize } from 'lodash';
import type { DailyDiscSet } from 'types';
import { LETTERS } from 'utils/constants';

export function generateUniqueArrays(sets: Dictionary<DailyDiscSet>, N: number): string[][] {
  const result: number[][] = [];
  const nsfwIds = [
    '239',
    '331',
    '256',
    '383',
    '420',
    '433',
    '584',
    '683',
    '769',
    '1122',
    '1174',
    '1188',
    '1316',
    '1320',
    '1388',
    '1396',
    '1480',
    '1549',
    '1550',
    '1591',
    '1677',
    '1778',
    '1790',
    '1792',
    '1820',
  ];
  let previouslyUsedIds: BooleanDictionary = {
    ...fromPairs(nsfwIds.map((key) => [key, true])),
  };
  Object.values(sets).forEach((set) => set.itemsIds.forEach((id) => (previouslyUsedIds[id] = true)));

  let availableRange = range(1, 1858).filter((n) => !previouslyUsedIds[n] && !nsfwIds.includes(String(n)));
  while (result.length < N) {
    const randomNumbers = sampleSize(availableRange, 21);
    if (!result.some((arr) => isEqual(arr, randomNumbers))) {
      previouslyUsedIds = { ...previouslyUsedIds, ...fromPairs(randomNumbers.map((key) => [key, true])) };
      availableRange = availableRange.filter((n) => !randomNumbers.includes(n));
      result.push([0, ...randomNumbers]);
    }
  }

  return result.map((arr) => orderBy(arr.map(String), (id) => Number(id)));
}

export function generateMiscSets(sets: Dictionary<DailyDiscSet>) {
  const newSets = generateUniqueArrays(sets, LETTERS.length).map((items, i) => ({
    title: {
      pt: `Diversos ${LETTERS[i]}`,
      en: `Misc ${LETTERS[i]}`,
    },
    itemsIds: items,
  }));

  console.log(JSON.stringify(newSets));
}
