import { sampleSize } from 'lodash';
import type { useDrawingsResourceData } from 'pages/ArteRuim/useArteRuimDrawings';
import type { ArteRuimCard } from 'types';
import type { DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

export type DailyArtistaEntry = {
  id: DateKey;
  number: number;
  type: 'artista';
  cards: ArteRuimCard[];
};

export const buildDailyArtistaGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  arteRuimHistory: ParsedDailyHistoryEntry,
  arteRuimCards: Dictionary<ArteRuimCard>,
  recentlyUsedIds: CardId[],
  drawings: ReturnType<typeof useDrawingsResourceData>['drawings'],
) => {
  console.count('Creating Artista...');

  let lastDate = history.latestDate;

  const entries: Dictionary<DailyArtistaEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    const availableCardsIds = Object.keys(arteRuimCards ?? {}).filter(
      (cardId) =>
        !arteRuimHistory.used.includes(cardId) &&
        !recentlyUsedIds.includes(cardId) &&
        drawings?.[cardId]?.drawings?.length < 4,
    );
    const cards = sampleSize(availableCardsIds, 20).map((cardId) => arteRuimCards[cardId]);
    lastDate = id;
    entries[id] = {
      id,
      type: 'artista',
      number: history.latestNumber + i + 1,
      cards,
    };
  }
  return entries;
};
