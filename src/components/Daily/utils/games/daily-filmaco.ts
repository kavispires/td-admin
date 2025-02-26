import { shuffle } from 'lodash';
import type { DailyMovieSet } from 'types';
import type { DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

export type DailyFilmacoEntry = {
  id: DateKey;
  number: number;
  type: 'filmaco';
  setId: string;
  title: string;
  itemsIds: string[];
  year: number;
};

/**
 * Builds a dictionary of DailyFilmacoEntry objects based on the given parameters.
 *
 * @param batchSize - The number of DailyFilmacoEntry objects to generate.
 * @param history - The parsed daily history entry.
 * @param movies - The dictionary of DailyMovieSet objects.
 * @returns A dictionary of DailyFilmacoEntry objects.
 */
export const buildDailyFilmacoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  movies: Dictionary<DailyMovieSet>,
) => {
  console.count('Creating Filmaço...');
  // Filter complete sets only
  const completeSets = shuffle(
    Object.values(movies).filter((setEntry) => setEntry.itemsIds.filter(Boolean).length > 0),
  );
  // Filter not-used sets only
  const notUsedSets = completeSets.filter((setEntry) => !history.used.includes(setEntry.id));

  if (notUsedSets.length < batchSize) {
    notUsedSets.push(...shuffle(completeSets));
  }

  let lastDate = history.latestDate;
  // Get list, if not enough, get from complete
  const entries: Dictionary<DailyFilmacoEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const setEntry = notUsedSets[i];
    if (!setEntry) {
      console.error('No filmaço sets left');
      break;
    }
    const id = getNextDay(lastDate);
    lastDate = id;
    entries[id] = {
      id,
      type: 'filmaco',
      number: history.latestNumber + i + 1,
      setId: setEntry.id,
      title: setEntry.title,
      itemsIds: setEntry.itemsIds,
      year: setEntry.year,
    };
  }

  return entries;
};
