import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { capitalize, sampleSize, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { ItemGroup } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';
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
      (group) => group.itemsIds.length > 5 && history.used.includes(group.id) === false,
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

    const group = eligibleGroups[i];
    const itemsIds = sampleSize(group.itemsIds, 5);

    // let tries = 0;
    // let valid = false;
    const grid = generateRandomLatinSquare(itemsIds);
    const defaultRevealedIndexes = revealGridItems(grid, itemsIds, 1);

    // while (!valid && tries < 1000) {
    //   tries++;
    //   grid = generateRandomLatinSquare(itemsIds);
    //   defaultRevealedIndexes = revealGridItems(grid, itemsIds, 1);
    //   valid = verifyBoardIsSolvable(grid, defaultRevealedIndexes, 18);
    // }

    // console.log(`𖣯 Created Organiku game ${id} after ${tries} tries`);

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

/**
 * Verifies if the board can be solved in the specified number of moves or less
 * using only logical deduction without guessing, mistakes, or peeking
 * @param grid The complete game grid
 * @param revealedIndices Indices of initially revealed tiles
 * @param maxMoves Maximum number of moves allowed
 * @returns Whether the board is solvable within the move limit
 */
function _verifyBoardIsSolvable(grid: string[], revealedIndices: number[], maxMoves: number): boolean {
  // Create a game state tracker
  const gameState = new GameSolver(grid, revealedIndices);

  // Try to solve the game using only logical deduction
  const result = gameState.solveLogically();

  // For 18 moves: we need exactly 9 pairs (18 tiles / 2 = 9 pairs)
  // Each pair costs exactly 2 moves, so 9 * 2 = 18 moves
  return result.solvable && result.movesRequired === maxMoves;
}

/**
 * Game solver that uses constraint satisfaction and logical deduction
 */
class GameSolver {
  private grid: string[];
  private revealed: boolean[];
  private knownPositions: Map<string, Set<number>>; // item -> possible positions
  private rowConstraints: Map<number, Set<string>>; // row -> remaining items
  private colConstraints: Map<number, Set<string>>; // col -> remaining items
  private moves: number;

  constructor(grid: string[], revealedIndices: number[]) {
    this.grid = [...grid];
    this.revealed = new Array(25).fill(false);
    this.knownPositions = new Map();
    this.rowConstraints = new Map();
    this.colConstraints = new Map();
    this.moves = 0;

    // Initialize constraints - each row and column must have all 5 items
    const allItems = new Set(grid);
    for (let i = 0; i < 5; i++) {
      this.rowConstraints.set(i, new Set(allItems));
      this.colConstraints.set(i, new Set(allItems));
    }

    // Initialize known positions for each item type
    for (const item of allItems) {
      this.knownPositions.set(item, new Set());
    }

    // Mark initially revealed tiles
    for (const index of revealedIndices) {
      this.revealed[index] = true;
      const item = this.grid[index];
      const row = Math.floor(index / 5);
      const col = index % 5;

      // Remove this item from row/col constraints since it's already placed
      this.rowConstraints.get(row)?.delete(item);
      this.colConstraints.get(col)?.delete(item);

      // Add to known positions
      this.knownPositions.get(item)?.add(index);
    }
  }

  /**
   * Attempts to solve the game using only logical deduction
   */
  solveLogically(): { solvable: boolean; movesRequired: number } {
    let progress = true;

    while (progress && !this.isComplete()) {
      progress = false;

      // Try to find pairs that can be logically deduced
      const deducedPair = this.findLogicalPair();

      if (deducedPair) {
        // Reveal the pair (costs 2 moves)
        this.revealPair(deducedPair.index1, deducedPair.index2);
        this.moves += 2;
        progress = true;
      } else {
        // Try constraint propagation to deduce more positions
        progress = this.propagateConstraints();
      }
    }

    return {
      solvable: this.isComplete(),
      movesRequired: this.moves,
    };
  }

  /**
   * Finds a pair of tiles that can be logically deduced as matching
   */
  private findLogicalPair(): { index1: number; index2: number } | null {
    // For each unrevealed position, check if we can logically deduce what item it contains
    for (let i = 0; i < 25; i++) {
      if (this.revealed[i]) continue;

      const possibleItem = this.deduceItemAtPosition(i);
      if (!possibleItem) continue;

      // Find another unrevealed position that must contain the same item
      for (let j = i + 1; j < 25; j++) {
        if (this.revealed[j]) continue;

        const otherPossibleItem = this.deduceItemAtPosition(j);
        if (otherPossibleItem === possibleItem) {
          return { index1: i, index2: j };
        }
      }
    }

    return null;
  }

  /**
   * Deduces what item must be at a given position based on constraints
   */
  private deduceItemAtPosition(index: number): string | null {
    const row = Math.floor(index / 5);
    const col = index % 5;

    // Get items that could still be placed in this row and column
    const rowPossible = this.rowConstraints.get(row);
    const colPossible = this.colConstraints.get(col);

    if (!rowPossible || !colPossible) return null;

    // The item at this position must be in both sets
    const intersection = new Set([...rowPossible].filter((x) => colPossible.has(x)));

    // If only one item is possible, we can deduce it
    if (intersection.size === 1) {
      return Array.from(intersection)[0];
    }

    // Check if any item type has only one possible position left in this row/col
    for (const item of intersection) {
      const itemPositions = this.knownPositions.get(item);
      if (!itemPositions) continue;

      // Count how many positions this item could go in this row
      let rowPossibleCount = 0;
      let colPossibleCount = 0;

      for (let c = 0; c < 5; c++) {
        const rowIndex = row * 5 + c;
        if (!this.revealed[rowIndex] && this.canItemGoAtPosition(item, rowIndex)) {
          rowPossibleCount++;
        }
      }

      for (let r = 0; r < 5; r++) {
        const colIndex = r * 5 + col;
        if (!this.revealed[colIndex] && this.canItemGoAtPosition(item, colIndex)) {
          colPossibleCount++;
        }
      }

      // If this is the only position for this item in the row or column
      if (rowPossibleCount === 1 || colPossibleCount === 1) {
        return item;
      }
    }

    return null;
  }

  /**
   * Checks if an item can be placed at a given position based on constraints
   */
  private canItemGoAtPosition(item: string, index: number): boolean {
    const row = Math.floor(index / 5);
    const col = index % 5;

    const rowPossible = this.rowConstraints.get(row);
    const colPossible = this.colConstraints.get(col);

    return Boolean(rowPossible?.has(item) && colPossible?.has(item));
  }

  /**
   * Reveals a matching pair and updates constraints
   */
  private revealPair(index1: number, index2: number): void {
    this.revealed[index1] = true;
    this.revealed[index2] = true;

    const item = this.grid[index1]; // Both should be the same item

    // Update constraints for both positions
    for (const index of [index1, index2]) {
      const row = Math.floor(index / 5);
      const col = index % 5;

      this.rowConstraints.get(row)?.delete(item);
      this.colConstraints.get(col)?.delete(item);
      this.knownPositions.get(item)?.add(index);
    }
  }

  /**
   * Propagates constraints to eliminate impossible positions
   */
  private propagateConstraints(): boolean {
    const changed = false;

    // For each item type, check if we can eliminate positions
    for (const [item, positions] of this.knownPositions) {
      const currentCount = positions.size;

      // If we already have 5 of this item revealed, skip
      if (currentCount >= 5) continue;

      // Check each unrevealed position to see if this item could go there
      for (let i = 0; i < 25; i++) {
        if (this.revealed[i]) continue;

        if (!this.canItemGoAtPosition(item, i)) {
          // This position is impossible for this item
          // This doesn't directly change our state, but helps with deduction
        }
      }
    }

    return changed;
  }

  /**
   * Checks if the game is complete (all tiles revealed)
   */
  private isComplete(): boolean {
    return this.revealed.every((r) => r);
  }
}
