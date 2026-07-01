/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */
import { useQuery } from '@tanstack/react-query';
import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { intersection, sampleSize, shuffle } from 'lodash';
import type { DailyDiscSet, ItemData } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

export type DailyAquiOEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'aqui-o';
  /**
   * Set identifier (disc set ID or 'special' for weekends)
   */
  setId: string;
  /**
   * Set title in both languages
   */
  title: DualLanguageValue;
  /**
   * Item IDs included in the puzzle (starts with '0' placeholder)
   */
  itemsIds: string[];
};

/**
 * Hook for generating daily Aqui Ó games
 *
 * @param enabled - Whether the generation is enabled
 * @param _queryLanguage - Target language (currently unused)
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used sets
 * @returns Generated Aqui Ó game entries with history updates
 */
export const useDailyAquiOGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyAquiOEntry> => {
  // Fetch prerequisite data
  const [aquiOHistory] = useParsedHistory(DAILY_GAMES_KEYS.AQUI_O, dailyHistory);
  const tdrItemsQuery = useTDResource<ItemData>('items', { enabled });
  const aquiOSetsQuery = useTDResource<DailyDiscSet>('daily-disc-sets', { enabled });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate = enabled && tdrItemsQuery.isSuccess && aquiOSetsQuery.isSuccess && !!aquiOHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: [
      'generate-daily',
      'aqui-o',
      batchSize,
      aquiOSetsQuery.dataUpdatedAt,
      tdrItemsQuery.dataUpdatedAt,
    ],
    queryFn: () => {
      if (!aquiOHistory || !aquiOSetsQuery.data || !tdrItemsQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }
      return buildDailyAquiOGames(batchSize, aquiOHistory, aquiOSetsQuery.data, tdrItemsQuery.data);
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || generatorQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: aquiOHistory?.latestDate ?? '',
      latestNumber: aquiOHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Aqui Ó games
 *
 * Generates games using disc sets for weekdays and special random item sets for weekends.
 * Uses a queue system to prevent wasting sets and implements LRU recycling when fresh sets run out.
 * Special handler for New Year's Day (2026-01-01) uses the white set.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used sets
 * @param discSets - Available disc sets for weekday games
 * @param items - Available items for weekend specials
 * @returns Generated entries, errors, and history update
 */
export const buildDailyAquiOGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  discSets: Dictionary<DailyDiscSet>,
  items: Dictionary<ItemData>,
) => {
  if (debugDailyStore.state['aqui-o']) {
    console.count('Creating Aqui Ó...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyAquiOEntry> = {};

  let updateType: 'add' | 'replace' = 'add';
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    // Validate available items for weekend specials
    const availableItems = Object.values(items).filter((item) => {
      if (item?.nsfw) return false;
      return intersection(item.decks ?? [], ['alien', 'dream', 'thing']).length > 0;
    });

    if (availableItems.length < 35) {
      throw new Error('Critical: Not enough safe/valid items to generate weekend specials.');
    }

    // Validate available sets for weekday games (must have at least 20 items)
    const completeSets = Object.values(discSets).filter(
      (setEntry) => setEntry.itemsIds.filter(Boolean).length >= 20,
    );

    if (completeSets.length === 0) {
      throw new Error('Critical: No complete Aqui Ó sets (>= 20 items) found.');
    }

    const freshSets = completeSets.filter((setEntry) => !history.used.includes(setEntry.id));
    const setQueue = shuffle(freshSets);
    const fallbackPool = shuffle(completeSets);

    let queueIndex = 0;
    let warningLogged = false;

    const getNextSafeSet = (): DailyDiscSet => {
      if (queueIndex < setQueue.length) {
        return setQueue[queueIndex++];
      }

      if (!warningLogged) {
        errors.push('Not enough fresh aqui-o sets left. Recycling historical data.');
        updateType = 'replace';
        warningLogged = true;
      }

      const overflowIndex = queueIndex - setQueue.length;
      queueIndex++;
      return fallbackPool[overflowIndex % fallbackPool.length];
    };

    // Generate the batch
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;
      const isWeekend = checkWeekend(id);

      // Special case: New Year's Day uses the white set
      if (id === '2026-01-01' && discSets.white) {
        entries[id] = {
          id,
          type: 'aqui-o',
          number: latestNumber,
          setId: discSets.white.id,
          title: discSets.white.title,
          itemsIds: ['0', ...sampleSize(discSets.white.itemsIds, 20)],
        };
        used.push(discSets.white.id);
        continue;
      }

      if (isWeekend) {
        // Weekend special: random 35 items, does not consume a set from queue
        entries[id] = {
          id,
          type: 'aqui-o',
          number: latestNumber,
          setId: 'special',
          title: {
            pt: 'Especial Fim de Semana',
            en: 'Weekend Special',
          },
          itemsIds: ['0', ...sampleSize(availableItems, 35).map((item) => item.id)],
        };
      } else {
        // Weekday: use a disc set from the queue
        const setEntry = getNextSafeSet();

        entries[id] = {
          id,
          type: 'aqui-o',
          number: latestNumber,
          setId: setEntry.id,
          title: setEntry.title,
          itemsIds: ['0', ...sampleSize(setEntry.itemsIds, 20)],
        };
        used.push(setEntry.id);
      }
    }
  } catch (error: unknown) {
    if (debugDailyStore.state['aqui-o']) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Aqui Ó generation.');
  }

  return {
    entries,
    errors,
    historyUpdate: {
      latestDate,
      latestNumber,
      used,
      updateType,
    },
  };
};
