import type { useLoadDrawings } from 'components/Daily/hooks';
import { sampleSize, shuffle } from 'lodash';
import type { DailyArteRuimEntry, DailyEntry, FirebaseDataDrawing, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

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
  drawingsQuery: ReturnType<typeof useLoadDrawings>,
  queryLanguage: Language,
  drawingsCount: number,
) => {
  console.count('Creating Arte Ruim...');
  const drawings = (drawingsQuery ?? []).reduce(
    (acc: Record<CardId, DailyEntry['arte-ruim']>, drawingEntry) => {
      const drawingsLibrary = (drawingEntry.data ?? {}) as Record<string, FirebaseDataDrawing>;
      // Build entries for each available card possible
      Object.entries(drawingsLibrary).forEach(([key, dataDrawing]) => {
        const cardId = dataDrawing.cardId ?? dataDrawing.id;

        // Remove cards from "Level 5" or cards that were already used
        if (cardId?.includes('--') || history.used.includes(cardId)) {
          return acc;
        }

        // Skip empty drawings
        if (dataDrawing.drawing.trim().length < 10) {
          console.log('🔆 Empty drawing', cardId);
          return acc;
        }

        if (acc[cardId] === undefined) {
          acc[cardId] = {
            id: cardId,
            type: 'arte-ruim',
            language: queryLanguage ?? 'pt',
            cardId: cardId,
            text: dataDrawing.text,
            drawings: [dataDrawing.drawing],
            number: 0,
            dataIds: [key],
          };
        } else {
          acc[cardId].drawings.push(dataDrawing.drawing);
          acc[cardId].dataIds.push(key);
        }
      });

      return acc;
    },
    {},
  );

  // Remove anything that doesn't have at least 2 drawings
  const atLeastTwoDrawingsList = Object.values(drawings).filter(
    (e) => e.drawings.length >= drawingsCount && e.cardId && !e.cardId?.includes('--'),
  );

  // Slice to batchSize
  const shuffledShortList = sampleSize(shuffle(atLeastTwoDrawingsList), batchSize);

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
