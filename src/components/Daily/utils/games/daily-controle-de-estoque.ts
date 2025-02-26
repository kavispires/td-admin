import { sampleSize, shuffle } from 'lodash';
import type { DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

export type DailyControleDeEstoqueEntry = {
  id: DateKey;
  number: number;
  type: 'controle-de-estoque';
  language: Language;
  title: string;
  goods: string[];
  orders: string[];
};

/**
 * Builds the Controle de Estoque games for the Daily component.
 *
 * @param batchSize - The number of games to generate.
 * @param history - The parsed daily history entry.
 * @returns The dictionary of Controle de Estoque games.
 */
export const buildDailyControleDeEstoqueGames = (batchSize: number, history: ParsedDailyHistoryEntry) => {
  console.count('Creating Controle de Estoque...');

  let lastDate = history.latestDate;

  // Get list, if not enough, get from complete
  const entries: Dictionary<DailyControleDeEstoqueEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;

    entries[id] = generateControleDeEstoqueGame(id, history.latestNumber + i + 1);
  }
  return entries;
};

const TOTAL_GOODS = 256;
const GOODS_SIZE = 16;
const ORDER_SIZE = 4;
const OUT_OF_STOCK_SIZE = 1;
/**
 * Generates a DailyControleDeEstoqueEntry object based on the provided id and number.
 *
 * @param id - The id of the entry in the format "YYYY-MM-DD".
 * @param num - The number associated with the entry.
 * @returns The generated DailyControleDeEstoqueEntry object.
 */
export const generateControleDeEstoqueGame = (id: string, num: number) => {
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

  const entry: DailyControleDeEstoqueEntry = {
    id,
    number: num,
    type: 'controle-de-estoque',
    language: 'pt',
    title: dayOfTheWeek,
    goods: [],
    orders: [],
  };

  const goods = sampleSize(
    Array(TOTAL_GOODS)
      .fill('')
      .map((_, i) => `good-${i + 1}`),
    GOODS_SIZE + OUT_OF_STOCK_SIZE,
  );
  const outOfStockGood = goods.pop();

  entry.goods = goods;
  entry.orders = sampleSize(entry.goods, ORDER_SIZE);
  // Add non-available requests
  if (!outOfStockGood) {
    throw new Error('No out of stock good');
  }
  entry.orders.push(outOfStockGood);
  entry.orders = shuffle(entry.orders);

  return entry;
};
