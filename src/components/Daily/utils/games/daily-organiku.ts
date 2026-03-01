import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { capitalize, range, sampleSize, shuffle } from 'lodash';
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

  const itemGroupsQuery = useTDResource<ItemGroup>('items-groups', { enabled });

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || !itemGroupsQuery.isSuccess || !organikuHistory) {
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

    // SPECIAL DATA HANDLER: Modify the date below
    // if (id === '2026-01-01') {
    //   const group = itemsGroups['2a97f']; // Add the group id here
    //   const itemsIds = sampleSize(group.itemsIds, isWeekend ? 6 : 5);

    // let tries = 0;
    // let valid = false;
    //   const grid = generateRandomLatinSquare(itemsIds);
    //   const defaultRevealedIndexes = revealGridItems(grid, itemsIds, 1);

    //   entries[id] = {
    //     id,
    //     number: history.latestNumber + i + 1,
    //     setId: group.id,
    //     type: 'organiku',
    //     title: capitalize(group.name[queryLanguage]),
    //     grid,
    //     defaultRevealedIndexes,
    //     itemsIds,
    //   };
    // } else {
    //   const group = eligibleGroups[i];
    //   const itemsIds = sampleSize(group.itemsIds, isWeekend ? 6 : 5);

    //   // let tries = 0;
    //   // let valid = false;
    //   const grid = generateRandomLatinSquare(itemsIds);
    //   const defaultRevealedIndexes = revealGridItems(grid, itemsIds, 1);

    //   entries[id] = {
    //     id,
    //     number: history.latestNumber + i + 1,
    //     setId: group.id,
    //     type: 'organiku',
    //     title: capitalize(group.name[queryLanguage]),
    //     grid,
    //     defaultRevealedIndexes,
    //     itemsIds,
    //   };
    // }

    const size = isWeekend ? 6 : 5;
    const group = eligibleGroups[i];
    const partialGame = generateOrganiku(size, group.itemsIds);

    entries[id] = {
      id,
      number: history.latestNumber + i + 1,
      setId: group.id,
      type: 'organiku',
      title: capitalize(group.name[queryLanguage]),
      grid: partialGame.grid,
      defaultRevealedIndexes: partialGame.defaultRevealedIndexes,
      itemsIds: partialGame.itemsIds,
    };
  }

  return entries;
};

function generateOrganiku(
  size: 5 | 6 | 7,
  cardIds: CardId[],
): Pick<DailyOrganikuEntry, 'itemsIds' | 'grid' | 'defaultRevealedIndexes'> {
  if (cardIds.length < size) {
    throw new Error(`Need at least ${size} card IDs, got ${cardIds.length}`);
  }
  const n = size;
  const grid = generateLatinSquare(n);
  const defaultRevealedIndexes = findMinimalReveals(grid, n);
  const itemsIds = sampleSize(cardIds, n);

  return {
    itemsIds,
    grid: grid.map((v) => itemsIds[v]),
    defaultRevealedIndexes,
  };
}

// --- Latin square generation (backtracking with random value ordering) ---

function generateLatinSquare(n: number): number[] {
  const grid = new Array(n * n).fill(-1);

  function isValid(row: number, col: number, val: number): boolean {
    for (let c = 0; c < col; c++) {
      if (grid[row * n + c] === val) return false;
    }
    for (let r = 0; r < row; r++) {
      if (grid[r * n + col] === val) return false;
    }
    return true;
  }

  function fill(pos: number): boolean {
    if (pos === n * n) return true;
    const row = Math.floor(pos / n);
    const col = pos % n;
    const values = shuffle(range(n));
    for (const val of values) {
      if (isValid(row, col, val)) {
        grid[pos] = val;
        if (fill(pos + 1)) return true;
        grid[pos] = -1;
      }
    }
    return false;
  }

  fill(0);
  return [...grid];
}

// --- Solvability check via constraint propagation (naked + hidden singles) ---

function isSolvable(grid: number[], n: number, revealed: ReadonlySet<number>): boolean {
  const total = n * n;
  const known = new Set(revealed);
  const possible: (Set<number> | null)[] = [];
  for (let i = 0; i < total; i++) {
    possible.push(known.has(i) ? null : new Set(range(n)));
  }

  let changed = true;
  while (changed) {
    changed = false;

    // Naked singles: if a cell has only one possible type left, it's determined
    for (let idx = 0; idx < total; idx++) {
      const p = possible[idx];
      if (p === null) continue;
      const row = Math.floor(idx / n);
      const col = idx % n;

      for (let c = 0; c < n; c++) {
        const ri = row * n + c;
        if (known.has(ri)) p.delete(grid[ri]);
      }
      for (let r = 0; r < n; r++) {
        const ci = r * n + col;
        if (known.has(ci)) p.delete(grid[ci]);
      }

      if (p.size === 1) {
        known.add(idx);
        possible[idx] = null;
        changed = true;
      }
    }

    // Hidden singles: if a type can only go in one cell within a row/column
    for (let row = 0; row < n; row++) {
      for (let type = 0; type < n; type++) {
        let found = false;
        const candidates: number[] = [];
        for (let c = 0; c < n; c++) {
          const idx = row * n + c;
          if (known.has(idx) && grid[idx] === type) {
            found = true;
            break;
          }
          if (possible[idx]?.has(type)) candidates.push(idx);
        }
        if (!found && candidates.length === 1) {
          known.add(candidates[0]);
          possible[candidates[0]] = null;
          changed = true;
        }
      }
    }

    for (let col = 0; col < n; col++) {
      for (let type = 0; type < n; type++) {
        let found = false;
        const candidates: number[] = [];
        for (let r = 0; r < n; r++) {
          const idx = r * n + col;
          if (known.has(idx) && grid[idx] === type) {
            found = true;
            break;
          }
          if (possible[idx]?.has(type)) candidates.push(idx);
        }
        if (!found && candidates.length === 1) {
          known.add(candidates[0]);
          possible[candidates[0]] = null;
          changed = true;
        }
      }
    }
  }

  return known.size === total;
}

// --- Find minimal revealed cells (top-down: start full, remove pairs greedily) ---

function findMinimalReveals(grid: number[], n: number): number[] {
  const total = n * n;
  const revealed = new Set(range(total));

  // Build all same-type pairs
  const cellsByType: number[][] = Array.from({ length: n }, () => []);
  for (let i = 0; i < total; i++) cellsByType[grid[i]].push(i);

  const pairs: [number, number][] = [];
  for (const cells of cellsByType) {
    for (let i = 0; i < cells.length; i++) {
      for (let j = i + 1; j < cells.length; j++) {
        pairs.push([cells[i], cells[j]]);
      }
    }
  }

  // Greedily remove pairs while puzzle stays solvable
  let progress = true;
  while (progress) {
    progress = false;
    const shuffled = shuffle(pairs);
    pairs.length = 0;
    pairs.push(...shuffled);

    for (let p = pairs.length - 1; p >= 0; p--) {
      const [a, b] = pairs[p];
      if (!revealed.has(a) || !revealed.has(b)) {
        pairs.splice(p, 1);
        continue;
      }

      revealed.delete(a);
      revealed.delete(b);

      if (isSolvable(grid, n, revealed)) {
        pairs.splice(p, 1);
        progress = true;
      } else {
        revealed.add(a);
        revealed.add(b);
      }
    }
  }

  return [...revealed].sort((a, b) => a - b);
}
