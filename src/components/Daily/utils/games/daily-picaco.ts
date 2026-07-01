/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */
import { useQuery } from '@tanstack/react-query';
import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { shuffle } from 'lodash';
import { useDrawingsResourceData } from 'pages/Games/ArteRuim/useArteRuimDrawings';
import type { ArteRuimCardData } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getNextDay } from '../utils';
import type { DailyArteRuimEntry } from './daily-arte-ruim';
import { debugDailyStore } from './debug-daily';

export type DailyPicacoEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'picaco';
  /**
   * Arte Ruim cards to draw
   */
  cards: ArteRuimCardData[];
};

/**
 * Hook for generating daily Picaço games
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for the cards
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used cards
 * @param arteRuimEntries - Current Arte Ruim batch to avoid duplicates
 * @returns Generated Picaço game entries with history updates
 */
export const useDailyPicacoGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
  arteRuimEntries: Record<string, DailyArteRuimEntry>,
): UseDailyGeneratorResponse<DailyPicacoEntry> => {
  // Fetch prerequisite data
  const [picacoHistory] = useParsedHistory(DAILY_GAMES_KEYS.PICACO, dailyHistory);
  const [arteRuimHistory] = useParsedHistory(DAILY_GAMES_KEYS.ARTE_RUIM, dailyHistory);

  const arteRuimCardsQuery = useTDResource<ArteRuimCardData>(`arte-ruim-cards-${queryLanguage}`, { enabled });
  const drawingsQuery = useDrawingsResourceData(enabled, queryLanguage);

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate =
    enabled &&
    arteRuimCardsQuery.isSuccess &&
    !!drawingsQuery.drawings &&
    !!picacoHistory &&
    !!arteRuimHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: [
      'generate-daily',
      'picaco',
      batchSize,
      arteRuimCardsQuery.dataUpdatedAt,
      drawingsQuery.dataUpdatedAt,
    ],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!picacoHistory || !arteRuimHistory || !arteRuimCardsQuery.data || !drawingsQuery.drawings) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      // Extract IDs used in current Arte Ruim batch to avoid duplicates
      const usedArteRuimIds = Object.values(arteRuimEntries).map((arteRuim) => arteRuim.cardId);

      return buildDailyPicacoGames(
        batchSize,
        picacoHistory,
        arteRuimHistory,
        arteRuimCardsQuery.data,
        usedArteRuimIds,
        drawingsQuery.drawings,
      );
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || arteRuimCardsQuery.isLoading || drawingsQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: picacoHistory?.latestDate ?? '',
      latestNumber: picacoHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Picaço games
 *
 * Generates games by selecting cards that need drawings (< 3) and avoiding cards used in Arte Ruim.
 * Uses queue system to prioritize fresh cards with LRU fallback. Each day includes 20 cards.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used cards (Picaço history)
 * @param arteRuimHistory - Arte Ruim history to avoid duplicates
 * @param arteRuimCards - Available Arte Ruim cards
 * @param recentlyUsedIds - IDs used in current Arte Ruim batch
 * @param drawings - Available drawings data
 * @returns Generated entries, errors, and history update
 */
export const buildDailyPicacoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  arteRuimHistory: ParsedDailyHistoryEntry,
  arteRuimCards: Dictionary<ArteRuimCardData>,
  recentlyUsedIds: CardId[],
  drawings: ReturnType<typeof useDrawingsResourceData>['drawings'],
) => {
  if (debugDailyStore.state.picaco) {
    console.count('Creating Picaço...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyPicacoEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    const allCardIds = Object.keys(arteRuimCards ?? {});

    if (allCardIds.length === 0) {
      throw new Error('Critical: No Arte Ruim cards found in the database.');
    }

    // Find cards that need drawings (< 3) and not used in Arte Ruim
    const eligibleForDrawings = allCardIds.filter((cardId) => {
      const isUsedInArteRuimHistory = arteRuimHistory.used.includes(cardId);
      const isUsedInCurrentArteRuimBatch = recentlyUsedIds.includes(cardId);
      const drawingCount = drawings?.[cardId]?.drawings?.length ?? 0;

      return !isUsedInArteRuimHistory && !isUsedInCurrentArteRuimBatch && drawingCount < 3;
    });

    if (eligibleForDrawings.length === 0) {
      errors.push('No cards need drawings. Falling back to global pool.');
      // Extreme fallback: all cards have enough drawings
      const fallbackEligible = allCardIds.filter(
        (id) => !arteRuimHistory.used.includes(id) && !recentlyUsedIds.includes(id),
      );

      if (fallbackEligible.length === 0) {
        throw new Error('Critical: Data exhaustion. Every card is currently used in Arte Ruim.');
      }
      eligibleForDrawings.push(...fallbackEligible);
    }

    // Setup queue: fresh cards first, then LRU recycled cards
    const freshForPicaco = eligibleForDrawings.filter((id) => !history.used.includes(id));
    const usedInPicacoLRU = eligibleForDrawings
      .filter((id) => history.used.includes(id))
      .sort((a, b) => history.used.indexOf(a) - history.used.indexOf(b));

    let drawQueue = [...shuffle(freshForPicaco), ...usedInPicacoLRU];
    let queueIndex = 0;

    let recycleWarningLogged = false;

    // Build the batch
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;

      const dailyCards: ArteRuimCardData[] = [];

      // Each day needs exactly 20 cards
      for (let j = 0; j < 20; j++) {
        // Reshuffle queue if exhausted (data starvation fallback)
        if (queueIndex >= drawQueue.length) {
          if (!recycleWarningLogged) {
            if (debugDailyStore.state.picaco) {
              console.log('🔆 Not enough unique cards for Picaço batch, repeating cards...');
            }
            errors.push('Batch size exceeds available unique cards. Repeating cards within batch.');
            recycleWarningLogged = true;
          }
          drawQueue = [...drawQueue, ...shuffle(drawQueue)];
        }

        const selectedCardId = drawQueue[queueIndex++];
        dailyCards.push(arteRuimCards[selectedCardId]);

        // Track usage
        used.push(selectedCardId);
      }

      entries[id] = {
        id,
        type: 'picaco',
        number: latestNumber,
        cards: dailyCards,
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.picaco) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Picaço generation.');
  }

  return {
    entries,
    errors,
    historyUpdate: {
      latestDate,
      latestNumber,
      used: [], // Picaço does not keep history
      updateType: 'add' as const,
    },
  };
};
