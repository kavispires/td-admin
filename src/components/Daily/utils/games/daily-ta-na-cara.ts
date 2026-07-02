/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { getSuspectImageId } from '@components/Suspects/SuspectImageCard';
import { countAnswersAbsoluteTotal } from '@components/Testimonies/utils';
import { useTDResource } from '@hooks/useTDResource';
import {
  type TestimonyAnswers,
  testimoniesDeserializer,
} from '@pages/Libraries/Testimonies/useTestimoniesResource';
import { useQuery } from '@tanstack/react-query';
import type { SuspectCardData, TestimonyQuestionCardData } from '@types';
import { SEPARATOR } from '@utils/constants';
import { makeBooleanDictionary } from '@utils/object';
import { orderBy, shuffle } from 'lodash';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

/**
 * Testimony selection mode:
 * - BUCKET_DISTRIBUTION: prioritizes testimonies with more suspects in lower answer buckets
 * - TOTAL_ANSWERS: prioritizes testimonies with fewest total answers across all suspects
 */
const TESTIMONY_SELECTION_MODE: 'BUCKET_DISTRIBUTION' | 'TOTAL_ANSWERS' = 'TOTAL_ANSWERS';
const TESTIMONY_SIZE = 15;
const SUSPECTS_SIZE = 7;

type TaNaCaraQuestion = {
  /**
   * Testimony question identifier
   */
  testimonyId: string;
  /**
   * Question text
   */
  question: string;
  /**
   * Whether testimony contains NSFW content
   */
  nsfw?: boolean;
  /**
   * Suspects with low answer counts for this testimony
   */
  suspectsIds?: string[];
};

export type DailyTaNaCaraEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'ta-na-cara';
  /**
   * 15 testimony questions for this game
   */
  testimonies: TaNaCaraQuestion[];
  /**
   * 7 extra suspects not directly referenced in testimonies
   */
  suspectsIds: string[];
  /**
   * Suspect names dictionary
   */
  names: Dictionary<string>;
};

/**
 * Hook for generating daily Tá Na Cara games
 *
 * Creates suspect guessing puzzles using testimony questions. Selects 15 testimonies
 * with the fewest total answers, and 7 extra suspects not referenced in those testimonies.
 * Uses cumulative usage tracking to minimize repeats across daily games.
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for testimony questions
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking testimony/suspect usage
 * @returns Generated Tá Na Cara game entries with history updates
 */
export const useDailyTaNaCaraGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyTaNaCaraEntry> => {
  // Fetch prerequisite data
  const [taNaCaraHistory] = useParsedHistory(DAILY_GAMES_KEYS.TA_NA_CARA, dailyHistory);

  const suspectsQuery = useTDResource<SuspectCardData>('suspects', { enabled });
  const testimoniesQuery = useTDResource<TestimonyQuestionCardData>(`testimony-questions-${queryLanguage}`, {
    enabled,
  });
  const answersQuery = useTDResource<TestimonyAnswers, Dictionary<string>>('testimony-answers', {
    select: testimoniesDeserializer,
    enabled,
  });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate =
    enabled &&
    suspectsQuery.isSuccess &&
    testimoniesQuery.isSuccess &&
    answersQuery.isSuccess &&
    !!taNaCaraHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: [
      'generate-daily',
      'ta-na-cara',
      batchSize,
      suspectsQuery.dataUpdatedAt,
      testimoniesQuery.dataUpdatedAt,
      answersQuery.dataUpdatedAt,
    ],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!taNaCaraHistory || !suspectsQuery.data || !testimoniesQuery.data || !answersQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      const sortedTestimoniesCounts = countTestimonyAnswers(
        testimoniesQuery.data,
        answersQuery.data,
        suspectsQuery.data,
        TESTIMONY_SELECTION_MODE,
      );

      const suspectDict = suspectsQuery.data;
      const gbSuspectIds = Object.keys(suspectDict)
        .filter((id) => suspectDict[id]?.deck === 'adult')
        .map((v) => getSuspectImageId(v, 'gb'));

      return buildDailyTaNaCaraGames(
        batchSize,
        taNaCaraHistory,
        gbSuspectIds,
        testimoniesQuery.data,
        sortedTestimoniesCounts,
        suspectDict,
      );
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading:
      !isReadyToGenerate || suspectsQuery.isLoading || testimoniesQuery.isLoading || answersQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: taNaCaraHistory?.latestDate ?? '',
      latestNumber: taNaCaraHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'replace',
    },
  };
};

export const buildDailyTaNaCaraGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  allSuspectsIds: string[],
  testimoniesDict: Dictionary<TestimonyQuestionCardData>,
  sortedTestimoniesCounts: ReturnType<typeof countTestimonyAnswers>,
  suspectDict: Dictionary<SuspectCardData>,
) => {
  if (debugDailyStore.state['ta-na-cara']) {
    console.count('Creating Tá Na Cara...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyTaNaCaraEntry> = {};

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  // Initialize the cumulative usage dictionary from history (id::count format)
  const cumulativeUsedDict = getTaNaCaraUsedDictionary(history.used);

  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(latestDate);
    latestDate = id;
    latestNumber = history.latestNumber + i + 1;

    try {
      const names: Dictionary<string> = {};

      // 1. Dynamically sort testimonies based on DAILY usage first, to prevent repeats
      const dynamicAvailableTestimonies = orderBy(
        sortedTestimoniesCounts,
        [
          (t) => cumulativeUsedDict[t.testimonyId] || 0, // Least used in Daily games first
          (t) => t.totalAnswers, // Then fallback to the crowdsourced distribution logic
        ],
        ['asc', 'asc'],
      );

      const testimonies: TaNaCaraQuestion[] = [];
      const selectedTestimonies = dynamicAvailableTestimonies.slice(0, TESTIMONY_SIZE);

      if (selectedTestimonies.length < TESTIMONY_SIZE) {
        throw new Error('Critical: Not enough valid testimonies to build the game.');
      }

      // Build the testimonies and track usage
      for (const t of selectedTestimonies) {
        const testimonyData = testimoniesDict[t.testimonyId];
        if (!testimonyData) {
          throw new Error(`Testimony data missing for ID: ${t.testimonyId}`);
        }

        const entry = buildTestimonyEntry(t, testimonyData);
        testimonies.push(entry);

        // Increment usage count for history
        cumulativeUsedDict[t.testimonyId] = (cumulativeUsedDict[t.testimonyId] || 0) + 1;
      }

      // 2. Gather names for all suspects organically involved in the testimonies
      const selectedSuspectsIds = makeBooleanDictionary(
        testimonies.flatMap((testimony) => testimony.suspectsIds || []),
        true,
      );

      Object.keys(selectedSuspectsIds).forEach((suspectId) => {
        const tdrId = getSuspectTDRId(suspectId);
        if (suspectDict[tdrId]) {
          names[suspectId] = suspectDict[tdrId].name.pt;
        }
      });

      // 3. Find extra suspects that don't appear in the selected testimonies
      // Prioritize suspects that haven't been used often in daily games
      const sortedSuspects = orderBy(
        allSuspectsIds,
        [(s) => cumulativeUsedDict[getSuspectTDRId(s)] || 0],
        ['asc'],
      );

      const extraSuspects: string[] = [];

      for (const suspectId of sortedSuspects) {
        if (extraSuspects.length >= SUSPECTS_SIZE) {
          break;
        }
        if (selectedSuspectsIds[suspectId]) {
          continue;
        }

        let hasHighAnswers = false;
        for (const testimony of testimonies) {
          const testimonyId = testimony.testimonyId;
          const suspectTDRId = getSuspectTDRId(suspectId);
          const answersForTestimony = sortedTestimoniesCounts.find((t) => t.testimonyId === testimonyId);

          if (answersForTestimony) {
            const counts = answersForTestimony.counts;
            const highAnswerGroups = ['5+', '32+'];
            for (const group of highAnswerGroups) {
              if (counts[group]?.includes(suspectTDRId)) {
                hasHighAnswers = true;
                break;
              }
            }
          }
          if (hasHighAnswers) {
            break;
          }
        }

        if (!hasHighAnswers) {
          extraSuspects.push(suspectId);
          const tdrId = getSuspectTDRId(suspectId);

          if (suspectDict[tdrId]) {
            names[suspectId] = suspectDict[tdrId].name.pt;
          }

          // Increment usage count for the extra suspect
          cumulativeUsedDict[tdrId] = (cumulativeUsedDict[tdrId] || 0) + 1;
        }
      }

      entries[id] = {
        id,
        type: 'ta-na-cara',
        number: latestNumber,
        suspectsIds: extraSuspects,
        testimonies,
        names,
      };
    } catch (error: unknown) {
      if (debugDailyStore.state['ta-na-cara']) {
        console.error(`Tá Na Cara Day ${id} Failed:`, error);
      }
      errors.push(`Day ${id}: ${(error as Error).message || 'Unknown generation error'}`);
    }
  }

  return {
    entries,
    errors,
    historyUpdate: {
      latestDate,
      latestNumber,
      used: [],
      updateType: 'replace' as const, // We must REPLACE because this is an accumulated dictionary, appending will bloat it
    },
  };
};

const buildTestimonyEntry = (
  sortedCounts: {
    testimonyId: string;
    counts: Dictionary<string[]>;
    totalAnswers?: number;
  },
  testimony: TestimonyQuestionCardData,
): TaNaCaraQuestion => {
  const suspectsIds = [
    ...shuffle(sortedCounts.counts[0]),
    ...shuffle([...sortedCounts.counts[3], ...sortedCounts.counts[2]]),
    ...shuffle([...sortedCounts.counts[1], ...sortedCounts.counts[4]]),
    ...sortedCounts.counts[5],
    ...sortedCounts.counts['5+'],
  ]
    .filter(Boolean)
    .slice(0, SUSPECTS_SIZE)
    .map((id) => getSuspectImageId(id, 'gb'));

  return {
    testimonyId: testimony.id,
    question: testimony.question,
    nsfw: !!testimony.nsfw,
    suspectsIds,
  };
};

const getTaNaCaraUsedDictionary = (previousHistory: string[]) => {
  return previousHistory.reduce((acc: Dictionary<number>, entry) => {
    const split = entry.split(SEPARATOR);
    const entryId = split[0];
    const count = Number(split[1]);

    // Handle suspect ids
    if (entryId.startsWith('us')) {
      const suspectKey = getSuspectTDRId(entryId);
      if (suspectKey.includes('undefined')) {
        return acc;
      }
      acc[suspectKey] = count || 0;
      return acc;
    }

    acc[entryId] = count || 0;
    return acc;
  }, {});
};

const countTestimonyAnswers = (
  testimonies: Dictionary<TestimonyQuestionCardData>,
  answers: Dictionary<TestimonyAnswers>,
  suspects: Dictionary<SuspectCardData>,
  mode: 'BUCKET_DISTRIBUTION' | 'TOTAL_ANSWERS',
) => {
  type SuspectCounts = Dictionary<string[]>;
  type TestimonyCounts = Dictionary<SuspectCounts>;

  const globalCounts: TestimonyCounts = {};
  const totalAnswersPerTestimony: Dictionary<number> = {};

  Object.keys(testimonies).forEach((testimonyId) => {
    if (globalCounts[testimonyId] === undefined) {
      globalCounts[testimonyId] = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        '5+': [],
        '32+': [],
      };
    }

    const answersForSuspects = answers[testimonyId] || {};
    let totalAnswers = 0;

    Object.keys(suspects)
      .filter((suspectId) => suspects[suspectId]?.deck === 'adult')
      .forEach((suspectId) => {
        const suspectAnswers = answersForSuspects[suspectId] || [];
        const suspectAnswersCount = countAnswersAbsoluteTotal(suspectAnswers);
        totalAnswers += suspectAnswersCount;

        if (suspectAnswersCount >= 32) {
          globalCounts[testimonyId]['32+'].push(suspectId);
        } else if (suspectAnswersCount > 5 && suspectAnswersCount < 32) {
          globalCounts[testimonyId]['5+'].push(suspectId);
        } else {
          try {
            globalCounts[testimonyId][suspectAnswersCount].push(suspectId);
          } catch (error) {
            console.error('Error updating globalCounts:', error);
          }
        }
      });

    totalAnswersPerTestimony[testimonyId] = totalAnswers;
  });

  let sorted: Array<{ testimonyId: string; counts: Dictionary<string[]>; totalAnswers: number }>;

  if (mode === 'TOTAL_ANSWERS') {
    // Sort by total answers across all suspects (ascending - fewest first)
    sorted = orderBy(
      Object.keys(globalCounts).map((testimonyId) => ({
        testimonyId,
        counts: globalCounts[testimonyId],
        totalAnswers: totalAnswersPerTestimony[testimonyId],
      })),
      ['totalAnswers'],
      ['asc'],
    );
  } else {
    // Original mode: sort by bucket distribution (most suspects in lower buckets first)
    sorted = orderBy(
      Object.keys(globalCounts).map((testimonyId) => ({
        testimonyId,
        counts: globalCounts[testimonyId],
        totalAnswers: totalAnswersPerTestimony[testimonyId],
      })),
      [
        (o) => o.counts[0].length,
        (o) => o.counts[1].length,
        (o) => o.counts[2].length,
        (o) => o.counts[3].length,
        (o) => o.counts[4].length,
      ],
      ['desc'],
    );
  }

  for (let i = 0; i < sorted.length; i += 13) {
    const chunk = sorted.slice(i, i + 13);
    const shuffledChunk = shuffle(chunk);
    sorted.splice(i, 13, ...shuffledChunk);
  }

  return sorted;
};

const getSuspectTDRId = (suspectId: string) => {
  const parts = suspectId.split('-');
  if (parts.length < 3) {
    return suspectId;
  }
  return `${parts[0]}-${parts[2]}`;
};
