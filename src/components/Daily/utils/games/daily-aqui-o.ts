import { intersection, sampleSize, shuffle } from 'lodash';
import type { DailyDiscSet, Item } from 'types';
import type { DailyAquiOEntry, ParsedDailyHistoryEntry } from '../types';
import { checkWeekend, getNextDay } from '../utils';

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
  discSets: Dictionary<DailyDiscSet>,
  items: Dictionary<Item>,
  updateWarnings: (warning: string) => void,
) => {
  console.count('Creating Aqui Ó...');
  // Filter complete sets only
  const completeSets = shuffle(
    Object.values(discSets).filter((setEntry) => setEntry.itemsIds.filter(Boolean).length >= 20),
  );
  // Filter not-used sets only
  const notUsedSets = completeSets.filter((setEntry) => !history.used.includes(setEntry.id));

  if (notUsedSets.length < batchSize) {
    console.log('🔆 Not enough aqui-o sets left, shuffling...');
    updateWarnings('Not enough aqui-o sets left');
    notUsedSets.push(...shuffle(completeSets));
  }

  const availableItems = Object.values(items).filter((item) => {
    if (item?.nsfw) return false;
    return intersection(item.decks ?? [], ['alien', 'dream', 'thing']).length > 0;
  });

  let lastDate = history.latestDate;
  // Get list, if not enough, get from complete
  const entries: Dictionary<DailyAquiOEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const setEntry = notUsedSets[i];
    if (!setEntry) {
      console.error('No aqui-o sets left');
    }
    const id = getNextDay(lastDate);
    const isWeekend = checkWeekend(id);
    lastDate = id;

    if (isWeekend) {
      entries[id] = {
        id,
        type: 'aqui-o',
        number: history.latestNumber + i + 1,
        setId: 'special',
        title: {
          pt: 'Especial Fim de Semana',
          en: 'Weekend Special',
        },
        itemsIds: ['0', ...sampleSize(availableItems, 25).map((item) => item.id)],
      };
    } else {
      entries[id] = {
        id,
        type: 'aqui-o',
        number: history.latestNumber + i + 1,
        setId: setEntry.id,
        title: setEntry.title,
        itemsIds: ['0', ...sampleSize(setEntry.itemsIds, 20)],
      };
    }
  }

  return entries;
};
