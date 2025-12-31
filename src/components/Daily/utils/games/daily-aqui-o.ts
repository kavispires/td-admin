import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { intersection, sampleSize, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { DailyDiscSet, Item } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { addWarning } from '../warnings';
import { debugDailyStore } from './debug-daily';

/**
 * Debug logging function that only logs if debug mode is enabled for aqui-o
 */
const debugLog = (...args: unknown[]) => {
  if (debugDailyStore.state['aqui-o']) {
    console.log(...args);
  }
};

/**
 * Debug count function that only counts if debug mode is enabled for aqui-o
 */
const debugCount = (label: string) => {
  if (debugDailyStore.state['aqui-o']) {
    console.count(label);
  }
};

/**
 * Debug error function that only logs errors if debug mode is enabled for aqui-o
 */
const debugError = (...args: unknown[]) => {
  if (debugDailyStore.state['aqui-o']) {
    console.error(...args);
  }
};

export type DailyAquiOEntry = {
  id: DateKey;
  number: number;
  type: 'aqui-o';
  setId: string;
  title: DualLanguageValue;
  itemsIds: string[];
};

export const useDailyAquiOGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [aquiOHistory] = useParsedHistory(DAILY_GAMES_KEYS.AQUI_O, dailyHistory);

  const tdrItemsQuery = useTDResource<Item>('items', { enabled });
  const aquiOSetsQuery = useTDResource<DailyDiscSet>('daily-disc-sets', { enabled });

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || !aquiOSetsQuery.isSuccess || !aquiOHistory || !tdrItemsQuery.isSuccess) {
      return {};
    }

    return buildDailyAquiOGames(batchSize, aquiOHistory, aquiOSetsQuery.data, tdrItemsQuery.data);
  }, [enabled, aquiOSetsQuery.dataUpdatedAt, tdrItemsQuery.dataUpdatedAt, aquiOHistory, batchSize]);

  return {
    entries,
    isLoading: tdrItemsQuery.isLoading || aquiOSetsQuery.isLoading,
  };
};

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
) => {
  debugCount('Creating Aqui Ó...');
  // Filter complete sets only
  const completeSets = shuffle(
    Object.values(discSets).filter((setEntry) => setEntry.itemsIds.filter(Boolean).length >= 20),
  );
  // Filter not-used sets only
  const notUsedSets = completeSets.filter((setEntry) => !history.used.includes(setEntry.id));

  if (notUsedSets.length < batchSize) {
    debugLog('🔆 Not enough aqui-o sets left, shuffling...');
    addWarning('aqui-o', 'Not enough aqui-o sets left');
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
    let setEntry = notUsedSets[i];
    if (!setEntry) {
      debugError('No aqui-o sets left');
    }
    const id = getNextDay(lastDate);
    const isWeekend = checkWeekend(id);
    lastDate = id;

    // SPECIAL DATA HANDLER: Modify the date below
    if (id === '2026-01-01') {
      setEntry = discSets['2a97f'];
    }

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
        itemsIds: ['0', ...sampleSize(availableItems, 45).map((item) => item.id)],
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
