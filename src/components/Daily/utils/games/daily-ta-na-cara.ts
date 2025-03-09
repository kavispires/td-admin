import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { orderBy, sampleSize, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { SuspectCard, TestimonyQuestionCard } from 'types';
import { SEPARATOR } from 'utils/constants';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

type TaNaCaraQuestion = {
  testimonyId: string;
  question: string;
  nsfw?: boolean;
  /**
   * @deprecated
   */
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

  const entries = useMemo(() => {
    if (!enabled || !suspectsQuery.isSuccess || !testimoniesQuery.isSuccess || !taNaCaraHistory) {
      return {};
    }

    return buildDailyTaNaCaraGames(batchSize, taNaCaraHistory, suspectsQuery.data, testimoniesQuery.data);
  }, [enabled, suspectsQuery, testimoniesQuery, taNaCaraHistory, batchSize]);

  return {
    entries,
    isLoading: suspectsQuery.isLoading || testimoniesQuery.isLoading,
  };
};

const TESTIMONY_SIZE = 12;
const SUSPECTS_SIZE = 15;

export const buildDailyTaNaCaraGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  suspects: Dictionary<SuspectCard>,
  testimonies: Dictionary<TestimonyQuestionCard>,
) => {
  console.count('Creating Tá Na Cara...');

  const dict = getTaNaCaraUsedDictionary(history.used);

  const suspectsBatch = orderBy(
    shuffle(Object.values(suspects)).map((suspect) => {
      const [, idNum] = suspect.id.split('-');
      return `us-ct-${idNum}`;
    }),
    [(o) => dict?.[o]],
    ['asc'],
  );

  const testimoniesBatch = shuffle(Object.values(testimonies));

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyTaNaCaraEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const testimonies = sampleSize(testimoniesBatch, TESTIMONY_SIZE).map((testimony) => {
      return {
        testimonyId: testimony.id,
        question: testimony.question,
        nsfw: !!testimony.nsfw,
      };
    });

    const id = getNextDay(lastDate);
    lastDate = id;
    entries[id] = {
      id,
      type: 'ta-na-cara',
      number: history.latestNumber + i + 1,
      suspectsIds: sampleSize(suspectsBatch, SUSPECTS_SIZE),
      testimonies,
    };
  }

  return entries;
};

const getTaNaCaraUsedDictionary = (previousHistory: string[]) => {
  return previousHistory.reduce((acc: Dictionary<number>, entry) => {
    const split = entry.split(SEPARATOR);
    const entryId = split[0];
    const count = Number(split[1]);
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

      testimony?.suspectsIds?.forEach((suspectId) => {
        if (dict[suspectId] === undefined) {
          dict[suspectId] = 0;
        }
        dict[suspectId] += 1;
      });
    });
    entry.suspectsIds?.forEach((suspectId) => {
      if (dict[suspectId] === undefined) {
        dict[suspectId] = 0;
      }
      dict[suspectId] += 1;
    });
  });

  return Object.entries(dict).map(([id, count]) => `${id}${SEPARATOR}${count}`);
};
