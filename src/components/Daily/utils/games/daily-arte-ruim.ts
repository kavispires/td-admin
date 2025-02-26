import { sampleSize, shuffle } from 'lodash';
import { useDrawingsResourceData } from 'pages/ArteRuim/useArteRuimDrawings';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';
import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { DAILY_GAMES_KEYS } from '../constants';
import { useMemo } from 'react';

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

export const useDailyArteRuimGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
  _updateWarnings: (warning: string) => void,
) => {
  const [arteRuimHistory] = useParsedHistory(DAILY_GAMES_KEYS.ARTE_RUIM, dailyHistory);

  const drawingsQuery = useDrawingsResourceData(enabled, queryLanguage);

  const entries = useMemo(() => {
    if (!enabled || drawingsQuery.isLoading || !arteRuimHistory) {
      return [];
    }

    return buildDailyArteRuimGames(batchSize, arteRuimHistory, drawingsQuery, queryLanguage);
  }, [enabled, drawingsQuery, queryLanguage, arteRuimHistory, batchSize, drawingsQuery.isLoading]);

  return {
    entries,
    isLoading: drawingsQuery.isLoading,
  };
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
const buildDailyArteRuimGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  drawingsQuery: ReturnType<typeof useDrawingsResourceData>,
  queryLanguage: Language,
) => {
  console.count('Creating Arte Ruim...');
  const drawings: DailyArteRuimEntry[] = Object.values(drawingsQuery.drawings)
    .filter((d) => {
      // Remove used cards
      if (history.used.includes(d.id)) {
        return false;
      }

      // Remove cards with less than the required number of drawings
      if (d.drawings.length < 3) {
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
