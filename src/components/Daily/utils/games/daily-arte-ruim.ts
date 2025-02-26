import { sampleSize, shuffle } from 'lodash';
import type { useDrawingsResourceData } from 'pages/ArteRuim/useArteRuimDrawings';
import type { DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

export type DailyArteRuimEntry = {
  id: DateKey;
  number: number;
  type: 'arte-ruim';
  language: Language;
  cardId: CardId;
  text: string;
  drawings: string[];
  dataIds: string[];
};

/**
 * Builds the daily Arte Ruim games.
 *
 * @param batchSize - The number of games to generate.
 * @param drawingsQuery - The result of the drawings query.
 * @param queryLanguage - The language for the query.
 * @param drawingsCount - The minimum number of drawings required for a game.
 * @param history - The parsed daily history entry.
 * @returns An array of generated Arte Ruim games.
 */
export const buildDailyArteRuimGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  drawingsQuery: ReturnType<typeof useDrawingsResourceData>,
  queryLanguage: Language,
  drawingsCount: number,
) => {
  console.count('Creating Arte Ruim...');
  const drawings: DailyArteRuimEntry[] = Object.values(drawingsQuery.drawings)
    .filter((d) => {
      // Remove used cards
      if (history.used.includes(d.id)) {
        return false;
      }

      // Remove cards with less than the required number of drawings
      if (d.drawings.length < drawingsCount) {
        return false;
      }

      return true;
    })
    .map((d) => ({
      id: d.id,
      type: 'arte-ruim',
      language: queryLanguage ?? 'pt',
      cardId: d.id,
      text: d.text,
      drawings: d.drawings.map((drawing) => drawing.drawing),
      number: 0,
      dataIds: d.drawings.map((drawing) => drawing.id),
    }));

  // Slice to batchSize
  const shuffledShortList = sampleSize(shuffle(drawings), batchSize);

  let lastDate = history.latestDate;

  const entries: DailyArteRuimEntry[] = shuffledShortList.map((e, index) => {
    const id = getNextDay(lastDate);

    lastDate = id;
    return {
      ...e,
      id,
      number: history.latestNumber + index + 1,
    };
  });

  return entries;
};
