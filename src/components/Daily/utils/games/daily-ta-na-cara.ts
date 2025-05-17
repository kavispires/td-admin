import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { orderBy, shuffle } from 'lodash';
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

const TESTIMONY_SIZE = 15;
const SUSPECTS_SIZE = 13;

export const buildDailyTaNaCaraGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  suspects: Dictionary<SuspectCard>,
  testimonies: Dictionary<TestimonyQuestionCard>,
) => {
  console.count('Creating Tá Na Cara...');

  const dict = getTaNaCaraUsedDictionary(history.used);

  const suspectsBatch = orderBy(shuffle(Object.values(suspects)), [(o) => dict?.[o.id] ?? 0], ['asc'])
    .slice(0, SUSPECTS_SIZE * 4)
    .map((suspect) => {
      const [, idNum] = suspect.id.split('-');
      const suspectId = `us-gb-${idNum}`;

      return {
        id: suspectId,
        used: 0,
      };
    });

  const testimoniesBatch = orderBy(shuffle(Object.values(testimonies)), [(o) => dict?.[o.id]], ['asc'])
    .slice(0, TESTIMONY_SIZE * 4)
    .map((testimony) => ({
      testimony,
      used: 0,
    }));

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyTaNaCaraEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const testimonies = getSampleWithFewestUses(testimoniesBatch, TESTIMONY_SIZE).map((testimony) => {
      return {
        testimonyId: testimony.testimony.id,
        question: testimony.testimony.question,
        nsfw: !!testimony.testimony.nsfw,
      };
    });

    const id = getNextDay(lastDate);
    lastDate = id;
    entries[id] = {
      id,
      type: 'ta-na-cara',
      number: history.latestNumber + i + 1,
      suspectsIds: getSampleWithFewestUses(suspectsBatch, SUSPECTS_SIZE).map((suspect) => suspect.id),
      testimonies,
    };
  }

  return entries;
};

const getSampleWithFewestUses = <T extends { used: number }>(arr: T[], quantity: number) => {
  const ordered = orderBy(arr, [(o) => o.used], ['asc']);
  const sampled = ordered.slice(0, quantity);
  // update sampled with used + 1
  sampled.forEach((item) => {
    item.used += 1;
  });
  return sampled;
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
