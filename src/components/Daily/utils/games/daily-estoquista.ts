/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */
import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useMemo } from 'react';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

export type DailyEstoquistaEntry = {
  id: DateKey;
  number: number;
  type: 'estoquista';
  language: Language;
  title: string;
  goods: string[];
  orders: string[];
};

/**
 *
 * @param enabled
 * @param _queryLanguage
 * @param batchSize
 * @param dailyHistory
 * @returns
 * @deprecated Game will be generated in the UI
 */
export const useDailyEstoquistaGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [estoquistaHistory] = useParsedHistory(DAILY_GAMES_KEYS.ESTOQUISTA, dailyHistory);

  const entries = useMemo(() => {
    if (!enabled || !estoquistaHistory) {
      return {};
    }

    return buildDailyEstoquistaGames(batchSize, estoquistaHistory);
  }, [enabled, batchSize, estoquistaHistory]);

  return {
    entries,
    isLoading: false,
  };
};

/**
 * Builds the Estoquista games for the Daily component.
 *
 * @param batchSize - The number of games to generate.
 * @param history - The parsed daily history entry.
 * @returns The dictionary of Estoquista games.
 */
export const buildDailyEstoquistaGames = (batchSize: number, history: ParsedDailyHistoryEntry) => {
  console.count('Creating Estoquista...');

  let lastDate = history.latestDate;

  // Get list, if not enough, get from complete
  const entries: Dictionary<DailyEstoquistaEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;

    entries[id] = generateEstoquistaGame(id, history.latestNumber + i + 1);
  }
  return entries;
};

const TOTAL_GOODS = 256;
const GOODS_SIZE = 16;
const ORDER_SIZE = 4;
const OUT_OF_STOCK_SIZE = 1;
/**
 * A simple Linear Congruential Generator (LCG) for seeded randomness.
 * Given the same seed, it will always produce the exact same sequence of floats between 0 and 1.
 */
const createSeededRandom = (seed: number) => {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 16807) % 2147483647;
    return (currentSeed - 1) / 2147483646;
  };
};

/**
 * A deterministic version of the Fisher-Yates shuffle using our seeded random function.
 */
const deterministicShuffle = <T>(array: T[], randomFunc: () => number): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFunc() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Generates a purely deterministic DailyEstoquistaEntry based on the date.
 * Calling this with "2026-06-30" will always yield the exact same puzzle setup.
 *
 * @param id - The id of the entry in the format "YYYY-MM-DD".
 * @returns The generated DailyEstoquistaEntry object.
 */
export const generateEstoquistaGame = (id: string, puzzleNumber: number): DailyEstoquistaEntry => {
  // 1. Create a numeric seed from the date string (e.g., "2026-06-30" -> 20260630)
  const seed = Number.parseInt(id.replace(/-/g, ''), 10);

  // 2. Initialize the predictable random generator
  const seededRandom = createSeededRandom(seed);

  const [year, month, day] = id.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeekIndex = date.getDay();

  const dayOfTheWeek = [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ][dayOfWeekIndex];

  const entry: DailyEstoquistaEntry = {
    id,
    number: puzzleNumber ?? day, // Using the day of the month for the 'number' as requested
    type: 'estoquista',
    language: 'pt',
    title: dayOfTheWeek,
    goods: [],
    orders: [],
  };

  // 3. Build the full array of possible goods
  const allGoods = Array.from({ length: TOTAL_GOODS }, (_, i) => `good-${i + 1}`);

  // 4. Deterministically shuffle the massive pool and slice what we need
  const shuffledGoods = deterministicShuffle(allGoods, seededRandom);
  const selectedItems = shuffledGoods.slice(0, GOODS_SIZE + OUT_OF_STOCK_SIZE);

  // 5. Separate the out of stock good
  const outOfStockGood = selectedItems.pop();
  if (!outOfStockGood) {
    throw new Error('No out of stock good');
  }

  // Assign the remaining 16 goods to the entry
  entry.goods = selectedItems;

  // 6. Deterministically pick the orders from the selected goods
  // We shuffle the selected 16 to pick 4 random (but predictable) ones
  const shuffledSelectedGoods = deterministicShuffle(entry.goods, seededRandom);
  const baseOrders = shuffledSelectedGoods.slice(0, ORDER_SIZE);

  // 7. Add the impossible out-of-stock item and shuffle the orders list one last time
  baseOrders.push(outOfStockGood);
  entry.orders = deterministicShuffle(baseOrders, seededRandom);

  return entry;
};
