import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { capitalize, sampleSize, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { ItemGroup } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { addWarning } from '../warnings';

export type DailyOrganikuEntry = {
  id: DateKey;
  number: number;
  type: 'organiku';
  setId: string;
  title: string;
  itemsIds: CardId[];
  grid: CardId[];
  defaultRevealedIndexes: number[];
};

export const useDailyOrganikuGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [organikuHistory] = useParsedHistory(DAILY_GAMES_KEYS.ORGANIKU, dailyHistory);

  const itemGroupsQuery = useTDResource<ItemGroup>('items-groups', enabled);

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || itemGroupsQuery.isLoading || !organikuHistory) {
      return {};
    }

    return buildDailyOrganikuGames(batchSize, organikuHistory, queryLanguage, itemGroupsQuery.data);
  }, [enabled, queryLanguage, organikuHistory, batchSize, itemGroupsQuery.dataUpdatedAt]);

  return {
    entries,
    isLoading: itemGroupsQuery.isLoading,
  };
};

export const buildDailyOrganikuGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  queryLanguage: Language,
  itemsGroups: Dictionary<ItemGroup>,
) => {
  console.count('Creating Organiku...');

  const eligibleGroups: ItemGroup[] = shuffle(
    Object.values(itemsGroups).filter(
      (group) => group.itemsIds.length > 6 && history.used.includes(group.id) === false,
    ),
  );
  if (eligibleGroups.length < batchSize) {
    addWarning('organiku', 'Not enough organiku groups left');
  }

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyOrganikuEntry> = {};

  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;

    const isWeekend = checkWeekend(id);

    const group = eligibleGroups[i];
    const itemsIds = sampleSize(group.itemsIds, isWeekend ? 6 : 5);

    // let tries = 0;
    // let valid = false;
    const grid = generateRandomLatinSquare(itemsIds);
    const defaultRevealedIndexes = revealGridItems(grid, itemsIds, 1);

    entries[id] = {
      id,
      number: history.latestNumber + i + 1,
      setId: group.id,
      type: 'organiku',
      title: capitalize(group.name[queryLanguage]),
      grid,
      defaultRevealedIndexes,
      itemsIds,
    };
  }

  return entries;
};

/**
 * Reveals a specific number of items in a grid for the given elements.
 *
 * The function uses a two-step approach to determine which grid indexes to reveal:
 * 1. For each element in the elements array, it reveals either 1 or 2 instances depending on
 *    whether the total count of that element in the grid is odd or even.
 * 2. It then reveals additional pairs of elements, cycling through the elements array,
 *    until it has processed revealCount elements.
 *
 * @param grid - An array of strings representing all items in the grid
 * @param elements - An array of string elements to reveal from the grid
 * @param revealCount - The number of additional element pairs to reveal
 * @returns An array of indexes in the grid that should be revealed
 *
 * @example
 * Reveal some items from a grid of fruits
 * const grid = ['apple', 'banana', 'apple', 'orange', 'banana', 'grape'];
 * const elements = ['apple', 'banana'];
 * const revealedIndexes = revealGridItems(grid, elements, 1);
 * Might return [0, 2, 1, 4] representing the indexes of revealed items
 */
function revealGridItems(grid: string[], elements: string[], revealCount: number): number[] {
  const revealedSet = new Set<number>();
  const elementToIndexes: Record<string, number[]> = {};

  // Build a map of element -> all indexes in grid
  grid.forEach((el, i) => {
    if (!elementToIndexes[el]) elementToIndexes[el] = [];
    elementToIndexes[el].push(i);
  });

  // Step 1: Reveal 1 or 2 from each element based on odd/even count
  for (const el of elements) {
    const indexes = elementToIndexes[el] ?? [];
    const count = indexes.length;
    const revealNum = count % 2 === 0 ? 2 : 1;
    const shuffled = shuffle(indexes);

    for (let i = 0; i < revealNum && i < shuffled.length; i++) {
      revealedSet.add(shuffled[i]);
    }
  }

  // Step 2: Reveal extra pairs (2 from each) from start of elements[]
  for (let i = 0; i < revealCount; i++) {
    const el = elements[i % elements.length];
    const available = (elementToIndexes[el] ?? []).filter((i) => !revealedSet.has(i));
    const shuffled = shuffle(available);

    for (let j = 0; j < 2 && j < shuffled.length; j++) {
      revealedSet.add(shuffled[j]);
    }
  }

  return Array.from(revealedSet);
}

function generateRandomLatinSquare(elements: string[]): string[] {
  const size = elements.length;
  const grid: string[][] = [];

  // Start with a shuffled first row
  grid.push(shuffle(elements));

  function isValidNextRow(candidateRow: string[], rowIndex: number): boolean {
    for (let col = 0; col < size; col++) {
      for (let prevRow = 0; prevRow < rowIndex; prevRow++) {
        if (grid[prevRow][col] === candidateRow[col]) {
          return false; // Duplicate in the same column
        }
      }
    }
    return true;
  }

  function backtrack(rowIndex: number): boolean {
    if (rowIndex === size) return true;

    const permutations = generatePermutations(elements);
    while (permutations.length > 0) {
      const candidateRow = permutations.splice(Math.floor(Math.random() * permutations.length), 1)[0];
      if (isValidNextRow(candidateRow, rowIndex)) {
        grid.push(candidateRow);
        if (backtrack(rowIndex + 1)) return true;
        grid.pop(); // backtrack
      }
    }

    return false;
  }

  backtrack(1);

  // Flatten the 2D array
  return grid.flat();
}

function generatePermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr.slice()];
  const result: T[][] = [];

  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of generatePermutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }

  return result;
}
