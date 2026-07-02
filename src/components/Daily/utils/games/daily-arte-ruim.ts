/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useDrawingsResourceData } from '@pages/Games/ArteRuim/useArteRuimDrawings';
import { useQuery } from '@tanstack/react-query';
import { shuffle } from 'lodash';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

export type DailyArteRuimEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'arte-ruim';
  /**
   * Language of the card text
   */
  language: Language;
  /**
   * Card identifier
   */
  cardId: CardId;
  /**
   * Text prompt for the drawing
   */
  text: string;
  /**
   * SVG drawing data strings
   */
  drawings: string[];
  /**
   * Drawing entry IDs for tracking
   */
  dataIds: string[];
};

/**
 * Hook for generating daily Arte Ruim games
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for the cards
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used cards
 * @returns Generated Arte Ruim game entries with history updates
 */
export const useDailyArteRuimGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyArteRuimEntry> => {
  // Fetch prerequisite data
  const [arteRuimHistory] = useParsedHistory(DAILY_GAMES_KEYS.ARTE_RUIM, dailyHistory);
  const drawingsQuery = useDrawingsResourceData(enabled, queryLanguage);

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate =
    enabled && !drawingsQuery.isLoading && !!drawingsQuery.drawings && !!arteRuimHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: ['generate-daily', 'arte-ruim', batchSize, queryLanguage, drawingsQuery.dataUpdatedAt],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!arteRuimHistory || !drawingsQuery.drawings) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyArteRuimGames(batchSize, arteRuimHistory, drawingsQuery, queryLanguage);
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
      latestDate: arteRuimHistory?.latestDate ?? '',
      latestNumber: arteRuimHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Arte Ruim games
 *
 * Generates games by selecting cards with at least 3 drawings.
 * Uses LRU recycling when fresh cards run out to ensure the batch is always filled.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used cards
 * @param drawingsQuery - Query result containing available drawings
 * @param queryLanguage - Target language for the cards
 * @returns Generated entries, errors, and history update
 */
export const buildDailyArteRuimGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  drawingsQuery: ReturnType<typeof useDrawingsResourceData>,
  queryLanguage: Language,
) => {
  if (debugDailyStore.state['arte-ruim']) {
    console.count('Creating Arte Ruim...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyArteRuimEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    // Get all valid drawings (at least 3 drawings per card)
    const allValidDrawings = Object.values(drawingsQuery.drawings).filter((d) => d.drawings.length >= 3);

    if (allValidDrawings.length === 0) {
      throw new Error('Critical: No valid Arte Ruim drawings found in the database.');
    }

    // Filter out previously used cards for fresh pool
    const freshDrawings = allValidDrawings.filter((d) => !history.used.includes(d.id));
    let eligibleDrawings = shuffle(freshDrawings);

    // LRU recycling: ensure we have enough data to fill the batch
    if (eligibleDrawings.length < batchSize) {
      if (debugDailyStore.state['arte-ruim']) {
        console.log('🔆 Not enough fresh arte-ruim drawings left, recycling...');
      }
      errors.push('Not enough fresh Arte Ruim drawings. Recycling historical data.');

      const needed = batchSize - eligibleDrawings.length;

      // Sort by Least Recently Used
      const usedDrawingsLRU = allValidDrawings
        .filter((d) => history.used.includes(d.id))
        .sort((a, b) => history.used.indexOf(a.id) - history.used.indexOf(b.id));

      const fallbackPool = usedDrawingsLRU.length > 0 ? usedDrawingsLRU : shuffle(allValidDrawings);

      // Fill recycled pool to avoid infinite loops
      const recycledPool = Array.from({ length: needed }).map((_, index) => {
        return fallbackPool[index % fallbackPool.length];
      });

      eligibleDrawings = [...eligibleDrawings, ...recycledPool];
    }

    // Format drawings into entry structure
    const formattedDrawings = eligibleDrawings.slice(0, batchSize).map((d) => ({
      type: 'arte-ruim' as const,
      language: queryLanguage ?? 'pt',
      cardId: d.id,
      text: d.text,
      drawings: d.drawings.map((drawing) => drawing.drawing),
      dataIds: d.drawings.map((drawing) => drawing.id),
    }));

    // Build final entries
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;

      const entryData = formattedDrawings[i];

      // Track usage for history update
      used.push(entryData.cardId);

      entries[id] = {
        ...entryData,
        id,
        number: latestNumber,
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state['arte-ruim']) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Arte Ruim generation.');
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
