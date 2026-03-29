import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useImagesDecks } from 'hooks/useImagesDecks';
import { random, sample } from 'lodash';
import { useMemo } from 'react';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

export type DailyConexoesEntry = {
  id: DateKey;
  number: number;
  type: 'conexoes';
  imageIds: string[];
};

/**
 * Hook for generating daily Conexoes game entries
 * @param enabled - Whether the hook should be active
 * @param _queryLanguage - Language for queries (not used but kept for consistency)
 * @param batchSize - Number of daily entries to generate
 * @param dailyHistory - History of daily games
 * @returns Entries dictionary and loading state
 */
export const useDailyConexoesGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [conexoesHistory] = useParsedHistory(DAILY_GAMES_KEYS.CONEXOES, dailyHistory);
  console.log('Parsed Conexoes history:', conexoesHistory);

  const imageDecksQuery = useImagesDecks();

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || imageDecksQuery.isLoading || !conexoesHistory) {
      return {};
    }

    return buildDailyConexoesGames(batchSize, conexoesHistory, imageDecksQuery.data);
  }, [enabled, imageDecksQuery.dataUpdatedAt, conexoesHistory, batchSize]);

  return {
    entries,
    isLoading: imageDecksQuery.isLoading,
  };
};

/**
 * Generates a random image card ID
 * @param decks - Dictionary of deck names to card counts
 * @returns A random image card ID in format: td-{deck}-{paddedNum}
 */
const generateRandomImageId = (decks: NumberDictionary): string => {
  const deckNames = Object.keys(decks);
  const randomDeck = sample(deckNames) as string;
  const deckCount = decks[randomDeck];
  const randomNum = random(1, deckCount);
  const paddedNum = randomNum < 10 ? `0${randomNum}` : `${randomNum}`;
  return `${randomDeck}-${paddedNum}`;
};

/**
 * Builds daily Conexoes game entries
 * @param batchSize - Number of daily entries to generate
 * @param history - Parsed history entry with latest date and number
 * @param decks - Dictionary of deck names to card counts
 * @returns Dictionary of daily Conexoes entries keyed by date
 */
export const buildDailyConexoesGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  decks: NumberDictionary,
) => {
  console.count('Creating Conexoes...');

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyConexoesEntry> = {};

  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;

    // Generate 50 unique random image IDs
    const imageIds = new Set<string>();
    while (imageIds.size < 50) {
      const randomId = generateRandomImageId(decks);
      imageIds.add(randomId);
    }

    entries[id] = {
      id,
      type: 'conexoes',
      number: history.latestNumber + i + 1,
      imageIds: Array.from(imageIds),
    };
  }

  return entries;
};
