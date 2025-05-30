import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { getSuspectImageId } from 'components/Suspects/utils';
import { useTDResource } from 'hooks/useTDResource';
import { orderBy, shuffle } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard, TestimonyQuestionCard } from 'types';
import { makeBooleanDictionary } from 'utils';
import { SEPARATOR } from 'utils/constants';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

type TaNaCaraQuestion = {
  testimonyId: string;
  question: string;
  nsfw?: boolean;
  suspectsIds?: string[];
};

export type DailyTaNaCaraEntry = {
  id: DateKey;
  number: number;
  type: 'ta-na-cara';
  testimonies: TaNaCaraQuestion[];
  suspectsIds?: string[];
};

export const useDailyTaNaCaraGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [taNaCaraHistory] = useParsedHistory(DAILY_GAMES_KEYS.TA_NA_CARA, dailyHistory);

  const suspectsQuery = useTDResource<SuspectCard>('suspects', enabled);
  const testimoniesQuery = useTDResource<TestimonyQuestionCard>(
    `testimony-questions-${queryLanguage}`,
    enabled,
  );
  const answersQuery = useTDResource<TestimonyAnswers>('testimony-answers', enabled);

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (
      !enabled ||
      !suspectsQuery.isSuccess ||
      !testimoniesQuery.isSuccess ||
      !taNaCaraHistory ||
      !answersQuery.isSuccess
    ) {
      return {};
    }

    const sortedTestimoniesCounts = countTestimonyAnswers(
      testimoniesQuery.data,
      answersQuery.data,
      suspectsQuery.data,
    );

    const gbSuspectIds = Object.keys(suspectsQuery.data).map((v) => getSuspectImageId(v, 'gb'));

    return buildDailyTaNaCaraGames(
      batchSize,
      taNaCaraHistory,
      gbSuspectIds,
      testimoniesQuery.data,
      sortedTestimoniesCounts,
    );
  }, [
    enabled,
    suspectsQuery.dataUpdatedAt,
    testimoniesQuery.dataUpdatedAt,
    answersQuery.dataUpdatedAt,
    taNaCaraHistory,
    batchSize,
  ]);

  return {
    entries,
    isLoading: suspectsQuery.isLoading || testimoniesQuery.isLoading,
  };
};

const TESTIMONY_SIZE = 15;
const SUSPECTS_SIZE = 13;

export const buildDailyTaNaCaraGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  allSuspectsIds: string[],
  testimoniesDict: Dictionary<TestimonyQuestionCard>,
  sortedTestimoniesCounts: ReturnType<typeof countTestimonyAnswers>,
) => {
  console.count('Creating Tá Na Cara...');

  let sortedTestimoniesCountsIndex = 0;

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyTaNaCaraEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;

    // Get testimony
    const testimonies: TaNaCaraQuestion[] = [];
    for (let j = 0; j < TESTIMONY_SIZE; j++) {
      if (sortedTestimoniesCountsIndex >= sortedTestimoniesCounts.length) {
        sortedTestimoniesCountsIndex = 0;
      }
      const testimonyCount = sortedTestimoniesCounts[sortedTestimoniesCountsIndex];
      testimonies.push(buildTestimonyEntry(testimonyCount, testimoniesDict[testimonyCount.testimonyId]));
      sortedTestimoniesCountsIndex += 1;
    }

    // Get 6 extra suspects that don't appear in any of the selected testimonies
    const selectedSuspectsIds = makeBooleanDictionary(
      testimonies.flatMap((testimony) => testimony.suspectsIds || []),
    );

    // Get 6 extra suspects that don't appear in any of the selected testimonies
    const extraSuspects = shuffle(allSuspectsIds.filter((id) => !selectedSuspectsIds[id])).slice(
      0,
      SUSPECTS_SIZE,
    );

    entries[id] = {
      id,
      type: 'ta-na-cara',
      number: history.latestNumber + i + 1,
      suspectsIds: extraSuspects,
      testimonies,
    };
  }

  return entries;
};

const buildTestimonyEntry = (
  sortedCounts: {
    testimonyId: string;
    counts: Dictionary<string[]>;
  },
  testimony: TestimonyQuestionCard,
): TaNaCaraQuestion => {
  const suspectsIds = [
    ...shuffle(sortedCounts.counts[3]),
    ...shuffle(sortedCounts.counts[2]),
    ...sortedCounts.counts[1],
    ...sortedCounts.counts[0],
    ...sortedCounts.counts[5],
  ]
    .slice(0, 6)
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
      const suspectId = entryId.split('-');
      const suspectKey = `${suspectId[0]}-${suspectId[2]}`;

      // TODO: REMOVE
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

export const gatherUsedTaNaCaraEntries = (previousHistory: string[], currentData: DailyTaNaCaraEntry[]) => {
  const dict = getTaNaCaraUsedDictionary(previousHistory);

  currentData.forEach((entry) => {
    entry.testimonies.forEach((testimony) => {
      if (dict[testimony.testimonyId] === undefined) {
        dict[testimony.testimonyId] = 0;
      }
      dict[testimony.testimonyId] += 1;
    });
    entry.suspectsIds?.forEach((suspectId) => {
      const suspectIdSplit = suspectId.split('-');
      const suspectKey = `${suspectIdSplit[0]}-${suspectIdSplit[2]}`;
      if (dict[suspectKey] === undefined) {
        dict[suspectKey] = 0;
      }
      dict[suspectKey] += 1;
    });
  });

  return Object.entries(dict).map(([id, count]) => `${id}${SEPARATOR}${count}`);
};

const countTestimonyAnswers = (
  testimonies: Dictionary<TestimonyQuestionCard>,
  answers: Dictionary<TestimonyAnswers>,
  suspects: Dictionary<SuspectCard>,
) => {
  // Iterate over testimonies, for each testimony group suspectIds by the number of answers (0, 1, 2, 3, 4, 5+)
  // Define proper types for the counts structure
  type SuspectCounts = Dictionary<string[]>;
  type TestimonyCounts = Dictionary<SuspectCounts>;

  const globalCounts: TestimonyCounts = {};
  Object.keys(testimonies).forEach((testimonyId) => {
    if (globalCounts[testimonyId] === undefined) {
      globalCounts[testimonyId] = {
        0: [],
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
      };
    }

    const answersForSuspects = answers[testimonyId] || {};

    Object.keys(suspects).forEach((suspectId) => {
      const suspectAnswers = answersForSuspects[suspectId] || [];
      const suspectAnswersCount = countAnswers(suspectAnswers);
      if (suspectAnswersCount >= 5) {
        globalCounts[testimonyId][5].push(suspectId);
      } else {
        globalCounts[testimonyId][suspectAnswersCount].push(suspectId);
      }
    });
  });

  const sorted = orderBy(
    Object.keys(globalCounts).map((testimonyId) => ({ testimonyId, counts: globalCounts[testimonyId] })),
    [
      (o) => o.counts[3].length,
      (o) => o.counts[2].length,
      (o) => o.counts[1].length,
      (o) => o.counts[0].length,
    ],
    ['desc'],
  );

  return sorted;
};

const countAnswers = (values: (0 | 1 | 3 | -3)[]): number => {
  return values.reduce((acc: number, value) => {
    if (value === 0 || value === 1) {
      return acc + 1;
    }
    if (value === 3 || value === -3) {
      return acc + 3;
    }
    return acc;
  }, 0);
};
