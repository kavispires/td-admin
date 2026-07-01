import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { capitalize, range, sampleSize, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { ItemGroupData } from 'types';
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

  const itemGroupsQuery = useTDResource<ItemGroupData>('items-groups', { enabled });

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
  itemsGroups: Dictionary<ItemGroupData>,
) => {
  console.count('Creating Organiku...');

  // FIX 1: Change to >= 6 so groups with exactly 6 items are included
  const allValidGroups = Object.values(itemsGroups).filter((group) => group.itemsIds.length >= 6);

  let eligibleGroups = shuffle(allValidGroups.filter((group) => !history.used.includes(group.id)));

  // FIX 2: History Recycling to prevent fatal crashes
  if (eligibleGroups.length < batchSize) {
    addWarning('organiku', 'Not enough organiku groups left. Recycling historical data.');

    // Fill the remaining required slots by recycling groups we've used before,
    // prioritizing ones that haven't been used in this specific batch yet.
    const needed = batchSize - eligibleGroups.length;
    const recycledPool = shuffle(
      allValidGroups.filter((group) => !eligibleGroups.some((eg) => eg.id === group.id)),
    );

    eligibleGroups = [...eligibleGroups, ...recycledPool.slice(0, needed)];
  }

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyOrganikuEntry> = {};

  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;
    const isWeekend = checkWeekend(id);

    // FIX 3: Safe fallback using modulo just in case the total valid
    // groups in the database is somehow less than the batchSize
    const safeIndex = i % eligibleGroups.length;
    const group = eligibleGroups[safeIndex];

    const size = isWeekend ? 6 : 5;
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

// ===========================
// ORGANIKU GENERATOR
// ===========================

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

// ===========================
// ORGANIKU SOLVER
// ===========================

export type GridCoordinate = {
  index: number;
  row: number;
  col: number;
};

export type PlacementAction = {
  at: GridCoordinate;
  itemId: string;
  // Tells the UI *why* this was the best move, great for advanced hint text!
  technique: 'naked_single' | 'hidden_row' | 'hidden_col' | 'deduction';
};

/**
 * Calculates the optimal sequence of logical placements to win an Organiku game.
 * * @param currentGrid 1D array of the current board state (use `null` for empty cells)
 * @param allItemsIds Array of all unique item IDs available in this puzzle
 * @param size Grid size (5 or 6)
 * @returns An array of PlacementActions representing the exact sequence of moves to win
 */
export const calculateOptimalPlacements = (
  currentGrid: (string | null)[],
  allItemsIds: string[],
  size: number,
): PlacementAction[] => {
  const grid = [...currentGrid];
  const moves: PlacementAction[] = [];

  const getCoords = (index: number): GridCoordinate => ({
    index,
    row: Math.floor(index / size),
    col: index % size,
  });

  // Helper: Check if placing an item at a specific index violates Latin Square rules
  const isSafe = (index: number, itemId: string): boolean => {
    const { row, col } = getCoords(index);
    for (let i = 0; i < size; i++) {
      // Check row
      if (grid[row * size + i] === itemId) return false;
      // Check column
      if (grid[i * size + col] === itemId) return false;
    }
    return true;
  };

  let progress = true;

  // Loop until the board is full or we get stuck (which shouldn't happen with valid puzzles)
  while (progress && grid.includes(null)) {
    progress = false;

    // 1. NAKED SINGLES: Is there a cell that can only legally accept exactly ONE item?
    for (let i = 0; i < grid.length; i++) {
      if (grid[i] !== null) continue;

      const validItems = allItemsIds.filter((item) => isSafe(i, item));

      if (validItems.length === 1) {
        grid[i] = validItems[0];
        moves.push({
          at: getCoords(i),
          itemId: validItems[0],
          technique: 'naked_single',
        });
        progress = true;
        break; // Board state changed, restart logical scan
      }
    }
    if (progress) continue;

    // 2. HIDDEN SINGLES (ROWS): In this row, is there an item that can only go in ONE specific cell?
    for (let row = 0; row < size; row++) {
      for (const item of allItemsIds) {
        // If item is already in this row, skip
        if (Array.from({ length: size }, (_, c) => grid[row * size + c]).includes(item)) continue;

        const validCells = [];
        for (let col = 0; col < size; col++) {
          const index = row * size + col;
          if (grid[index] === null && isSafe(index, item)) {
            validCells.push(index);
          }
        }

        if (validCells.length === 1) {
          const targetIndex = validCells[0];
          grid[targetIndex] = item;
          moves.push({
            at: getCoords(targetIndex),
            itemId: item,
            technique: 'hidden_row',
          });
          progress = true;
          break; // Break inner item loop
        }
      }
      if (progress) break; // Break row loop to restart scan
    }
    if (progress) continue;

    // 3. HIDDEN SINGLES (COLS): Same concept, but checking columns vertically
    for (let col = 0; col < size; col++) {
      for (const item of allItemsIds) {
        // If item is already in this col, skip
        if (Array.from({ length: size }, (_, r) => grid[r * size + col]).includes(item)) continue;

        const validCells = [];
        for (let row = 0; row < size; row++) {
          const index = row * size + col;
          if (grid[index] === null && isSafe(index, item)) {
            validCells.push(index);
          }
        }

        if (validCells.length === 1) {
          const targetIndex = validCells[0];
          grid[targetIndex] = item;
          moves.push({
            at: getCoords(targetIndex),
            itemId: item,
            technique: 'hidden_col',
          });
          progress = true;
          break;
        }
      }
      if (progress) break;
    }
  }

  // Safety fallback for malformed puzzles
  if (grid.includes(null)) {
    console.warn('Organiku Solver: Grid requires guessing or is invalid. Cannot deduce further.');
  }

  return moves;
};
