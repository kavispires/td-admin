import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { sampleSize } from 'lodash';
import { useDrawingsResourceData } from 'pages/ArteRuim/useArteRuimDrawings';
import { useMemo } from 'react';
import type { ArteRuimCard } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';
import type { DailyArteRuimEntry } from './daily-arte-ruim';

export type DailyArtistaEntry = {
  id: DateKey;
  number: number;
  type: 'artista';
  cards: ArteRuimCard[];
};

export const useDailyArtistaGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
  arteRuimEntries: DailyArteRuimEntry[],
) => {
  const [artistaHistory] = useParsedHistory(DAILY_GAMES_KEYS.ARTISTA, dailyHistory);
  const [arteRuimHistory] = useParsedHistory(DAILY_GAMES_KEYS.ARTE_RUIM, dailyHistory);

  const arteRuimCardsQuery = useTDResource<ArteRuimCard>(`arte-ruim-cards-${queryLanguage}`, enabled);
  const drawingsQuery = useDrawingsResourceData(enabled, queryLanguage);

  const entries = useMemo(() => {
    if (!enabled || !arteRuimCardsQuery.isSuccess || drawingsQuery.isLoading || !artistaHistory) {
      return {};
    }

    const usedArteRuimIds = arteRuimEntries.map((arteRuim) => arteRuim.cardId);

    return buildDailyArtistaGames(
      batchSize,
      artistaHistory,
      arteRuimHistory,
      arteRuimCardsQuery.data,
      usedArteRuimIds,
      drawingsQuery.drawings,
    );
  }, [
    enabled,
    arteRuimCardsQuery,
    arteRuimHistory,
    artistaHistory,
    batchSize,
    arteRuimEntries,
    drawingsQuery.drawings,
    drawingsQuery.isLoading,
  ]);

  return {
    entries,
    isLoading: arteRuimCardsQuery.isLoading || drawingsQuery.isLoading,
  };
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
