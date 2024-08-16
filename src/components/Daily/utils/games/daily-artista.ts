import { DailyArtistaEntry, ParsedDailyHistoryEntry } from '../types';
import { sampleSize } from 'lodash';
import { getNextDay } from '../utils';
import { ArteRuimCard } from 'types';

export const buildDailyArtistaGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  arteRuimHistory: ParsedDailyHistoryEntry,
  arteRuimCards: Dictionary<ArteRuimCard>,
  recentlyUsedIds: CardId[]
) => {
  console.count('Creating Artista...');

  let lastDate = history.latestDate;

  const entries: Dictionary<DailyArtistaEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    const availableCardsIds = Object.keys(arteRuimCards ?? {}).filter(
      (cardId) => !arteRuimHistory.used.includes(cardId) && !recentlyUsedIds.includes(cardId)
    );
    const cards = sampleSize(availableCardsIds, 15).map((cardId) => arteRuimCards[cardId]);
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
