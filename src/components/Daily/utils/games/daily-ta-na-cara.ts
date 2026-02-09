import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { getSuspectImageId } from 'components/Suspects/SuspectImageCard';
import { countAnswersAbsoluteTotal } from 'components/Testimonies/utils';
import { useTDResource } from 'hooks/useTDResource';
import { orderBy, shuffle } from 'lodash';
import {
  type TestimonyAnswers,
  testimoniesDeserializer,
} from 'pages/Libraries/Testimonies/useTestimoniesResource';
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
  suspectsIds: string[];
  names: Dictionary<string>;
};

export const useDailyTaNaCaraGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [taNaCaraHistory] = useParsedHistory(DAILY_GAMES_KEYS.TA_NA_CARA, dailyHistory);

  const suspectsQuery = useTDResource<SuspectCard>('suspects', { enabled });
  const testimoniesQuery = useTDResource<TestimonyQuestionCard>(`testimony-questions-${queryLanguage}`, {
    enabled,
  });
  const answersQuery = useTDResource<TestimonyAnswers, Dictionary<string>>('testimony-answers', {
    select: testimoniesDeserializer,
    enabled,
  });

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

    const suspectDict = suspectsQuery.data ?? {};
    const gbSuspectIds = Object.keys(suspectsQuery.data).map((v) => getSuspectImageId(v, 'gb'));

    return buildDailyTaNaCaraGames(
      batchSize,
      taNaCaraHistory,
      gbSuspectIds,
      testimoniesQuery.data,
      sortedTestimoniesCounts,
      suspectDict,
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
const SUSPECTS_SIZE = 7;

export const buildDailyTaNaCaraGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  allSuspectsIds: string[],
  testimoniesDict: Dictionary<TestimonyQuestionCard>,
  sortedTestimoniesCounts: ReturnType<typeof countTestimonyAnswers>,
  suspectDict: Dictionary<SuspectCard>,
) => {
  console.count('Creating Tá Na Cara...');

  let sortedTestimoniesCountsIndex = 0;

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyTaNaCaraEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;
    const names: Dictionary<string> = {};

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
      true,
    );

    // Gather the names of the selected suspects
    Object.keys(selectedSuspectsIds).forEach((suspectId) => {
      names[suspectId] = suspectDict[getSuspectTDRId(suspectId)].name.pt;
    });

    // Gather 6 suspects that don't appear in any of the selected testimonies but that also don't have more than 30 answers on any of the selected testimonies either
    const extraSuspects: string[] = [];
    for (const suspectId of shuffle(allSuspectsIds)) {
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
        names[suspectId] = suspectDict[getSuspectTDRId(suspectId)].name.pt;
      }
    }

    entries[id] = {
      id,
      type: 'ta-na-cara',
      number: history.latestNumber + i + 1,
      suspectsIds: extraSuspects,
      testimonies,
      names,
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
      const suspectKey = getSuspectTDRId(suspectId);
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
        '5+': [],
        '32+': [],
      };
    }

    const answersForSuspects = answers[testimonyId] || {};

    Object.keys(suspects).forEach((suspectId) => {
      const suspectAnswers = answersForSuspects[suspectId] || [];
      const suspectAnswersCount = countAnswersAbsoluteTotal(suspectAnswers);
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
  });

  const sorted = orderBy(
    Object.keys(globalCounts).map((testimonyId) => ({ testimonyId, counts: globalCounts[testimonyId] })),
    [
      (o) => o.counts[0].length,
      (o) => o.counts[1].length,
      (o) => o.counts[2].length,
      (o) => o.counts[3].length,
      (o) => o.counts[4].length,
    ],
    ['desc'],
  );

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
