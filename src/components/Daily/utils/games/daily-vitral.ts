/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useTDResource } from '@hooks/useTDResource';
import { useQuery } from '@tanstack/react-query';
import type { ImageCardDescriptorData } from '@types';
import { sample, shuffle } from 'lodash';
import { ATTEMPTS_THRESHOLD, DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getDayOfTheWeek, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

export type Point = {
  /**
   * X coordinate
   */
  x: number;
  /**
   * Y coordinate
   */
  y: number;
};

export type Piece = {
  /**
   * Piece identifier
   */
  id: string;
  /**
   * Correct grid index for this piece
   */
  correctPos: number;
  /**
   * Shape defined by points
   */
  shape: Point[];
};

export type PieceState = Point & {
  /**
   * Whether piece is locked in position
   */
  isLocked: boolean;
};

export type DailyVitralEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'vitral';
  /**
   * Image title in Portuguese
   */
  title: string;
  /**
   * Image card identifier
   */
  cardId: string;
  /**
   * Shuffled piece indices (derangement: no piece at correct position)
   */
  pieces: number[];
};

/**
 * Hook for generating daily Vitral games
 *
 * Creates jigsaw puzzles from image cards. Piece count varies by day of week
 * (Mondays have fewest pieces, weekends have most). Uses LRU recycling when
 * data is exhausted. Ensures no piece starts in its correct position (derangement).
 *
 * @param enabled - Whether the generation is enabled
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used image cards
 * @returns Generated Vitral game entries with history updates
 */
export const useDailyVitralGames = (
  enabled: boolean,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyVitralEntry> => {
  // Fetch prerequisite data
  const [vitralHistory] = useParsedHistory(DAILY_GAMES_KEYS.VITRAL, dailyHistory);
  const dailyVitralSetQuery = useTDResource<ImageCardDescriptorData>('image-cards', { enabled });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate = enabled && dailyVitralSetQuery.isSuccess && !!vitralHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: ['generate-daily', 'vitral', batchSize, dailyVitralSetQuery.dataUpdatedAt],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!vitralHistory || !dailyVitralSetQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyVitralGames(batchSize, vitralHistory, dailyVitralSetQuery.data);
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || dailyVitralSetQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: vitralHistory?.latestDate ?? '',
      latestNumber: vitralHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

export const buildDailyVitralGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  puzzleSets: Dictionary<ImageCardDescriptorData>,
) => {
  if (debugDailyStore.state.vitral) {
    console.count('Creating Vitral...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyVitralEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    // Filter sets with Portuguese titles only
    const allValidSets = Object.values(puzzleSets).filter((setEntry) => !!setEntry.title?.pt);

    if (allValidSets.length === 0) {
      throw new Error('Critical: No valid Vitral sets (with Portuguese titles) found in the database.');
    }

    // Separate into fresh pool
    const freshSets = allValidSets.filter((setEntry) => !history.used.includes(setEntry.id));
    let eligibleSets = shuffle(freshSets);

    // History recycling using LRU strategy
    if (eligibleSets.length < batchSize) {
      if (debugDailyStore.state.vitral) {
        console.log('🔆 Not enough fresh vitral sets left, recycling...');
      }
      errors.push('Not enough fresh Vitral sets. Recycling historical data.');

      const needed = batchSize - eligibleSets.length;

      // Prioritize least recently used sets (LRU)
      const usedSetsLRU = allValidSets
        .filter((s) => history.used.includes(s.id))
        .sort((a, b) => history.used.indexOf(a.id) - history.used.indexOf(b.id));

      const fallbackPool = usedSetsLRU.length > 0 ? usedSetsLRU : shuffle(allValidSets);

      // Generate recycled sets safely
      const recycledPool = Array.from({ length: needed }).map((_, index) => {
        return fallbackPool[index % fallbackPool.length];
      });

      eligibleSets = [...eligibleSets, ...recycledPool];
    }

    // Build the batch
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;
      const dayOfWeek = getDayOfTheWeek(id);

      const selectedSet = eligibleSets[i];

      // Track usage
      used.push(selectedSet.id);

      entries[id] = {
        id,
        number: latestNumber,
        type: 'vitral',
        title: selectedSet.title.pt,
        cardId: selectedSet.id,
        pieces: shufflePieces(dayOfWeek),
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.vitral) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Vitral generation.');
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

/**
 * Shuffles puzzle pieces ensuring no piece is in its correct position (derangement)
 *
 * Uses random shuffling until a valid derangement is found. For arrays N >= 9,
 * a random shuffle has ~36.8% chance of being a perfect derangement.
 *
 * @param dayOfWeek - Day of week (0-6) determines piece count
 * @returns Shuffled piece indices where pieces[i] !== i for all i
 */
function shufflePieces(dayOfWeek: number): number[] {
  const piecesOptions: Record<number, number[]> = {
    0: [30, 33, 36], // Sunday
    1: [9, 12], // Monday
    2: [12, 18], // Tuesday
    3: [18, 21, 24], // Wednesday
    4: [21, 24, 27], // Thursday
    5: [24, 27, 30], // Friday
    6: [27, 30, 33], // Saturday
  };

  const piecesCount = sample(piecesOptions[dayOfWeek]) ?? 12;
  const pieces = Array.from({ length: piecesCount }, (_, i) => i);
  let tries = 0;
  let valid = false;
  let shuffled = [...pieces];

  while (tries < ATTEMPTS_THRESHOLD && !valid) {
    shuffled = shuffle(pieces);

    // Check for valid derangement
    valid = shuffled.every((pieceId, index) => pieceId !== index);

    tries++;
  }

  if (!valid) {
    throw new Error(
      `Failed to generate valid derangement for ${piecesCount} pieces after ${ATTEMPTS_THRESHOLD} attempts`,
    );
  }

  return shuffled;
}
