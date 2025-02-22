import { orderBy, sampleSize, shuffle } from 'lodash';
import type { DailyTaNaCaraEntry, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';
import type { SuspectCard, TestimonyQuestionCard } from 'types';
import { SEPARATOR } from 'utils/constants';

export const buildDailyTaNaCaraGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  suspects: Dictionary<SuspectCard>,
  testimonies: Dictionary<TestimonyQuestionCard>,
) => {
  console.count('Creating Tá Na Cara...');

  const dict = getTaNaCaraUsedDictionary(history.used);

  const suspectsBatch = orderBy(
    shuffle(Object.values(suspects).slice(0, 30)).map((suspect) => {
      const [, idNum] = suspect.id.split('-');
      return `us-ct-${idNum}`;
    }),
    [(o) => dict?.[o]],
    ['asc'],
  );

  const testimoniesBatch = shuffle(Object.values(testimonies).slice(0, 30));

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyTaNaCaraEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const testimonies = sampleSize(testimoniesBatch, 7).map((testimony) => {
      return {
        testimonyId: testimony.id,
        question: testimony.question,
        nsfw: !!testimony.nsfw,
        suspectsIds: sampleSize(suspectsBatch, 3),
      };
    });

    const id = getNextDay(lastDate);
    lastDate = id;
    entries[id] = {
      id,
      type: 'ta-na-cara',
      number: history.latestNumber + i + 1,
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

export const parseTaNaCaraEntries = (previousHistory: string[], currentData: DailyTaNaCaraEntry[]) => {
  const dict = getTaNaCaraUsedDictionary(previousHistory);

  currentData.forEach((entry) => {
    entry.testimonies.forEach((testimony) => {
      if (dict[testimony.testimonyId] === undefined) {
        dict[testimony.testimonyId] = 0;
      }
      dict[testimony.testimonyId] += 1;

      testimony.suspectsIds.forEach((suspectId) => {
        if (dict[suspectId] === undefined) {
          dict[suspectId] = 0;
        }
        dict[suspectId] += 1;
      });
    });
  });

  return Object.entries(dict).map(([id, count]) => `${id}${SEPARATOR}${count}`);
};
