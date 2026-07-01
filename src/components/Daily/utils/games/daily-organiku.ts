/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */
import { useQuery } from '@tanstack/react-query';
import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { capitalize, range, sampleSize, shuffle } from 'lodash';
import type { ItemGroupData } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

export type DailyOrganikuEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'organiku';
  /**
   * Item group identifier
   */
  setId: string;
  /**
   * Group title in target language
   */
  title: string;
  /**
   * Item IDs used in this puzzle
   */
  itemsIds: CardId[];
  /**
   * Flattened Latin square grid
   */
  grid: CardId[];
  /**
   * Initially revealed cell positions
   */
  defaultRevealedIndexes: number[];
};

/**
 * Hook for generating daily Organiku games
 *
 * Creates Latin square puzzles where players arrange items in a grid following the constraint
 * that each item appears exactly once per row and column. Weekday games use 5x5 grids,
 * weekend games use 6x6 grids.
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for group titles
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used groups
 * @returns Generated Organiku game entries with history updates
 */
export const useDailyOrganikuGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyOrganikuEntry> => {
  // Fetch prerequisite data
  const [organikuHistory] = useParsedHistory(DAILY_GAMES_KEYS.ORGANIKU, dailyHistory);
  const itemGroupsQuery = useTDResource<ItemGroupData>('items-groups', { enabled });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate = enabled && itemGroupsQuery.isSuccess && !!organikuHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: ['generate-daily', 'organiku', batchSize, queryLanguage, itemGroupsQuery.dataUpdatedAt],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!organikuHistory || !itemGroupsQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyOrganikuGames(batchSize, organikuHistory, queryLanguage, itemGroupsQuery.data);
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || itemGroupsQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: organikuHistory?.latestDate ?? '',
      latestNumber: organikuHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Organiku games
 *
 * Generates Latin square puzzles with minimal revealed cells for solvability.
 * Uses recycling when data is exhausted. Weekday games use 5x5 grids, weekends use 6x6.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used groups
 * @param queryLanguage - Target language for group titles
 * @param itemsGroups - Available item groups
 * @returns Generated entries, errors, and history update
 */
export const buildDailyOrganikuGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  queryLanguage: Language,
  itemsGroups: Dictionary<ItemGroupData>,
) => {
  if (debugDailyStore.state.organiku) {
    console.count('Creating Organiku...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyOrganikuEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    // Filter groups with sufficient items for weekend grids
    const allValidGroups = Object.values(itemsGroups).filter((group) => group.itemsIds.length >= 6);

    if (allValidGroups.length === 0) {
      throw new Error('Critical: No valid Organiku groups (>= 6 items) found in the database.');
    }

    let eligibleGroups = shuffle(allValidGroups.filter((group) => !history.used.includes(group.id)));

    // Recycle when data exhausted
    if (eligibleGroups.length < batchSize) {
      if (debugDailyStore.state.organiku) {
        console.log('🔆 Not enough fresh organiku groups left, recycling...');
      }
      errors.push('Not enough fresh organiku groups left. Recycling historical data.');

      const needed = batchSize - eligibleGroups.length;

      const recycledPool = shuffle(
        allValidGroups.filter((group) => !eligibleGroups.some((eg) => eg.id === group.id)),
      );

      // Repeat groups if database is too small
      while (recycledPool.length < needed) {
        recycledPool.push(...shuffle(allValidGroups));
      }

      eligibleGroups = [...eligibleGroups, ...recycledPool.slice(0, needed)];
    }

    // Build the batch
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;
      const isWeekend = checkWeekend(id);

      const safeIndex = i % eligibleGroups.length;
      const group = eligibleGroups[safeIndex];

      const size = isWeekend ? 6 : 5;
      const partialGame = generateOrganiku(size, group.itemsIds);

      // Track usage
      used.push(group.id);

      entries[id] = {
        id,
        number: latestNumber,
        setId: group.id,
        type: 'organiku',
        title: capitalize(group.name[queryLanguage] ?? group.name.pt),
        grid: partialGame.grid,
        defaultRevealedIndexes: partialGame.defaultRevealedIndexes,
        itemsIds: partialGame.itemsIds,
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.organiku) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Organiku generation.');
  }

  return {
    entries,
    errors,
    historyUpdate: {
      latestDate,
      latestNumber,
      used,
      updateType: 'add' as const,
    },
  };
};

/**
 * Generates a single Organiku puzzle
 *
 * Creates a random Latin square, finds minimal reveals for solvability,
 * and maps numbers to actual item IDs.
 *
 * @param size - Grid dimension (5, 6, or 7)
 * @param cardIds - Available item card IDs
 * @returns Puzzle with items, grid, and revealed positions
 */
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

/**
 * Generates a random Latin square using backtracking
 *
 * Creates an NxN grid where each value 0..(N-1) appears exactly once per row and column.
 * Uses randomized value ordering to produce different squares each time.
 *
 * @param n - Grid dimension
 * @returns Flattened Latin square array
 */
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

/**
 * Checks if a puzzle is solvable using logical techniques
 *
 * Uses constraint propagation (naked singles + hidden singles) without guessing.
 * A puzzle is solvable if all cells can be determined from the revealed set.
 *
 * @param grid - Complete Latin square solution
 * @param n - Grid dimension
 * @param revealed - Set of revealed cell indexes
 * @returns Whether the puzzle can be solved logically
 */
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

/**
 * Finds minimal set of revealed cells for solvability
 *
 * Starts with all cells revealed, then greedily removes pairs of same-type cells
 * while maintaining solvability. Uses randomization to create variety.
 *
 * @param grid - Complete Latin square solution
 * @param n - Grid dimension
 * @returns Array of cell indexes that must be revealed
 */
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

export type GridCoordinate = {
  index: number;
  row: number;
  col: number;
};

export type PlacementAction = {
  at: GridCoordinate;
  itemId: string;
  /**
   * Solving technique used for this move
   */
  technique: 'naked_single' | 'hidden_row' | 'hidden_col' | 'deduction';
};

/**
 * Calculates the optimal sequence of logical placements to solve an Organiku puzzle
 *
 * Uses three logical techniques in order:
 * 1. Naked singles: cells with only one valid item
 * 2. Hidden row singles: items that can only go in one cell within a row
 * 3. Hidden column singles: items that can only go in one cell within a column
 *
 * @param currentGrid - Current board state (use null for empty cells)
 * @param allItemsIds - All unique item IDs in this puzzle
 * @param size - Grid dimension (5 or 6)
 * @returns Sequence of placement actions to solve the puzzle
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

  // Check if placing an item at a position violates Latin square rules
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

  // Loop until board is full or stuck
  while (progress && grid.includes(null)) {
    progress = false;

    // Naked singles: cells with only one valid item
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
        break;
      }
    }
    if (progress) continue;

    // Hidden row singles: items with only one valid cell in a row
    for (let row = 0; row < size; row++) {
      for (const item of allItemsIds) {
        // Skip if item already in this row
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
          break;
        }
      }
      if (progress) break;
    }
    if (progress) continue;

    // Hidden column singles: items with only one valid cell in a column
    for (let col = 0; col < size; col++) {
      for (const item of allItemsIds) {
        // Skip if item already in this column
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

  // Safety check for malformed puzzles
  if (grid.includes(null)) {
    console.warn('Organiku Solver: Grid requires guessing or is invalid. Cannot deduce further.');
  }

  return moves;
};
