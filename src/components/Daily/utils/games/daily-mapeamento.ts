/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useTDResource } from '@hooks/useTDResource';
import { useQuery } from '@tanstack/react-query';
import type { DailyLocationSet } from '@types';
import { shuffle } from 'lodash';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

export type DailyMapeamentoEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'mapeamento';
  /**
   * Language of the location
   */
  language: Language;
  /**
   * Location set identifier
   */
  setId: string;
  /**
   * Location name
   */
  location: string;
  /**
   * Clue strings for the location
   */
  clues: string[];
};

/**
 * Hook for generating daily Mapeamento games
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for the locations
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used locations
 * @returns Generated Mapeamento game entries with history updates
 */
export const useDailyMapeamentoGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyMapeamentoEntry> => {
  // Fetch prerequisite data
  const [mapeamentoHistory] = useParsedHistory(DAILY_GAMES_KEYS.MAPEAMENTO, dailyHistory);
  const locationSetsQuery = useTDResource<DailyLocationSet>('daily-location-sets', { enabled });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate = enabled && locationSetsQuery.isSuccess && !!mapeamentoHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: ['generate-daily', 'mapeamento', batchSize, queryLanguage, locationSetsQuery.dataUpdatedAt],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!mapeamentoHistory || !locationSetsQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyMapeamentoGames(batchSize, mapeamentoHistory, locationSetsQuery.data, queryLanguage);
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || locationSetsQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: mapeamentoHistory?.latestDate ?? '',
      latestNumber: mapeamentoHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Mapeamento games
 *
 * Generates games using location sets with clues.
 * Uses LRU recycling when fresh locations run out to ensure the batch is always filled.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used locations
 * @param locations - Available location sets
 * @param queryLanguage - Target language for the locations
 * @returns Generated entries, errors, and history update
 */
export const buildDailyMapeamentoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  locations: Dictionary<DailyLocationSet>,
  queryLanguage: Language,
) => {
  if (debugDailyStore.state.mapeamento) {
    console.count('Creating Mapeamento...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyMapeamentoEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    const allLocations = Object.values(locations);

    if (allLocations.length === 0) {
      throw new Error('Critical: No mapeamento locations found in the database.');
    }

    // Separate into fresh and used pools
    const freshLocations = allLocations.filter((loc) => !history.used.includes(loc.id));
    let eligibleLocations = shuffle(freshLocations);

    // LRU recycling: ensure we have enough data to fill the batch
    if (eligibleLocations.length < batchSize) {
      if (debugDailyStore.state.mapeamento) {
        console.log('🔆 Not enough fresh mapeamento locations left, recycling...');
      }
      errors.push('Not enough fresh locations. Recycling historical data.');

      const needed = batchSize - eligibleLocations.length;

      // Sort by Least Recently Used
      const usedLocationsLRU = allLocations
        .filter((loc) => history.used.includes(loc.id))
        .sort((a, b) => history.used.indexOf(a.id) - history.used.indexOf(b.id));

      const fallbackPool = usedLocationsLRU.length > 0 ? usedLocationsLRU : shuffle(allLocations);

      // Fill recycled pool to avoid infinite loops
      const recycledPool = Array.from({ length: needed }).map((_, index) => {
        return fallbackPool[index % fallbackPool.length];
      });

      eligibleLocations = [...eligibleLocations, ...recycledPool];
    }

    // Build final entries
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;

      const setEntry = eligibleLocations[i];

      // Track usage for history update
      used.push(setEntry.id);

      entries[id] = {
        id,
        type: 'mapeamento',
        number: latestNumber,
        setId: setEntry.id,
        location: setEntry.location,
        clues: setEntry.clues,
        language: queryLanguage ?? 'pt',
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.mapeamento) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Mapeamento generation.');
  }

  return {
    entries,
    errors,
    historyUpdate: {
      latestDate,
      latestNumber,
      used,
      updateType: 'add' as const,
    },
  };
};
