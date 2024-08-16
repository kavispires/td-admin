import { DailyAquiOEntry, ParsedDailyHistoryEntry } from '../types';
import { sampleSize, shuffle } from 'lodash';
import { getNextDay } from '../utils';
import { DailyDiscSet } from 'types';

/**
 * Builds a dictionary of DailyAquiOEntry objects based on the given parameters.
 *
 * @param batchSize - The number of DailyAquiOEntry objects to generate.
 * @param history - The parsed daily history entry.
 * @param discSets - The dictionary of DailyDiscSet objects.
 * @returns A dictionary of DailyAquiOEntry objects.
 */
export const buildDailyAquiOGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  discSets: Dictionary<DailyDiscSet>
) => {
  console.count('Creating Aqui Ó...');
  // Filter complete sets only
  const completeSets = shuffle(
    Object.values(discSets).filter((setEntry) => setEntry.itemsIds.filter(Boolean).length >= 20)
  );
  // Filter not-used sets only
  let notUsedSets = completeSets.filter((setEntry) => !history.used.includes(setEntry.id));

  if (notUsedSets.length < batchSize) {
    notUsedSets.push(...shuffle(completeSets));
  }

  let lastDate = history.latestDate;
  // Get list, if not enough, get from complete
  const entries: Dictionary<DailyAquiOEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const setEntry = notUsedSets[i];
    if (!setEntry) {
      console.error('No aqui-o sets left');
    }
    const id = getNextDay(lastDate);
    lastDate = id;
    entries[id] = {
      id,
      type: 'aqui-o',
      number: history.latestNumber + i + 1,
      setId: setEntry.id,
      title: setEntry.title,
      itemsIds: ['0', ...sampleSize(setEntry.itemsIds, 20)],
    };
  }

  return entries;
};
