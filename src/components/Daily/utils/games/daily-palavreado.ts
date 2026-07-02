/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useLoadWordLibrary } from '@hooks/useLoadWordLibrary';
import { useTDResource } from '@hooks/useTDResource';
import { useQuery } from '@tanstack/react-query';
import { difference, flatMap, shuffle, sortBy, uniq } from 'lodash';
import { useMemo } from 'react';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

export type DailyPalavreadoEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'palavreado';
  /**
   * Keyword to spell along the diagonal
   */
  keyword: string;
  /**
   * Words forming the grid rows
   */
  words: string[];
  /**
   * Shuffled letters for the grid
   */
  letters: string[];
  /**
   * Additional valid words findable by swapping
   */
  scoringWords?: string[];
};

/**
 * Hook for generating daily Palavreado games
 *
 * Creates word grid puzzles where players swap letters to form words that spell a keyword
 * along the diagonal. Weekday games use 4x4 grids, weekend games use 5x5 grids.
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for word dictionaries
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used keywords
 * @returns Generated Palavreado game entries with history updates
 */
/**
 * Hook for generating daily Palavreado games
 *
 * Creates word grid puzzles where players swap letters to form words that spell a keyword
 * along the diagonal. Weekday games use 4x4 grids, weekend games use 5x5 grids.
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for word dictionaries
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used keywords
 * @returns Generated Palavreado game entries with history updates
 */
export const useDailyPalavreadoGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyPalavreadoEntry> => {
  // Fetch prerequisite data
  const [palavreadoHistory] = useParsedHistory(DAILY_GAMES_KEYS.PALAVREADO, dailyHistory);
  const wordsFourQuery = useLoadWordLibrary(4, queryLanguage, enabled, true);
  const wordsFiveQuery = useLoadWordLibrary(5, queryLanguage, enabled, true);

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate =
    enabled &&
    wordsFourQuery.isSuccess &&
    wordsFiveQuery.isSuccess &&
    !!palavreadoHistory &&
    !!wordsFourQuery.data?.length &&
    !!wordsFiveQuery.data?.length;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: [
      'generate-daily',
      'palavreado',
      batchSize,
      wordsFourQuery.dataUpdatedAt,
      wordsFiveQuery.dataUpdatedAt,
    ],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!palavreadoHistory || !wordsFourQuery.data || !wordsFiveQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyPalavreadoGames(
        batchSize,
        palavreadoHistory,
        wordsFourQuery.data,
        wordsFiveQuery.data,
      );
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || wordsFourQuery.isLoading || wordsFiveQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: palavreadoHistory?.latestDate ?? '',
      latestNumber: palavreadoHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Palavreado games
 *
 * Creates word grid puzzles where a keyword is spelled along the diagonal.
 * Uses backtracking to find valid word combinations. Supports special fixed keywords
 * for specific dates (e.g., 'novo' for New Year's Day).
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used keywords
 * @param fourLetterWords - 4-letter word dictionary (weekdays)
 * @param fiveLetterWords - 5-letter word dictionary (weekends)
 * @returns Generated entries, errors, and history update
 */
export const buildDailyPalavreadoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  fourLetterWords: string[],
  fiveLetterWords: string[],
) => {
  if (debugDailyStore.state.palavreado) {
    console.count('Creating Palavreado...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyPalavreadoEntry> = {};
  const usedWords: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    if (fourLetterWords.length === 0 || fiveLetterWords.length === 0) {
      throw new Error('Critical: Required word dictionaries are empty.');
    }

    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      const isWeekend = checkWeekend(id);
      const size = isWeekend ? 5 : 4;
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;

      // Special keyword handler for specific dates
      let fixedKeyword: string | undefined;
      if (id === '2026-01-01') {
        fixedKeyword = 'novo';
      }

      const gameData = generatePalavreadoGame(
        isWeekend ? fiveLetterWords : fourLetterWords,
        [...Object.values(entries).map((e) => e.keyword), ...history.used],
        usedWords,
        size,
        fixedKeyword,
      );

      entries[id] = {
        id,
        type: 'palavreado',
        number: latestNumber,
        ...gameData,
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.palavreado) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Palavreado generation.');
  }

  return {
    entries,
    errors,
    historyUpdate: {
      latestDate,
      latestNumber,
      used: Object.values(entries).map((e) => e.keyword),
      updateType: 'add' as const,
    },
  };
};

/**
 * Generates a single Palavreado puzzle
 *
 * Uses backtracking to find a valid grid where each row is a word and the diagonal
 * spells the keyword. Includes history recycling when keywords are exhausted.
 *
 * @param words - Available word dictionary
 * @param previouslyUsedWords - Historical keywords to avoid
 * @param newUsedWords - Keywords used in current batch
 * @param size - Grid dimension (4 or 5)
 * @param fixedKeyword - Optional specific keyword to use
 * @returns Puzzle with keyword, words, shuffled letters, and scoring words
 */
export const generatePalavreadoGame = (
  words: string[],
  previouslyUsedWords: string[],
  newUsedWords: string[],
  size = 4,
  fixedKeyword?: string,
) => {
  // History recycling logic
  let availableKeywords = difference(words, newUsedWords, previouslyUsedWords);

  if (availableKeywords.length === 0) {
    if (debugDailyStore.state.palavreado) {
      console.warn('Keyword pool exhausted. Recycling historical words.');
    }
    availableKeywords = difference(words, newUsedWords);
  }

  let shuffledKeywords = shuffle(availableKeywords);

  if (fixedKeyword) {
    shuffledKeywords = [fixedKeyword, ...difference(shuffledKeywords, [fixedKeyword])];
  }

  // Backtracking loop to find valid grid
  for (const keyword of shuffledKeywords) {
    const selectedWords: string[] = [];
    let isValidGrid = true;

    for (let i = 0; i < size; i++) {
      const newWord = getNewWord(words, keyword, selectedWords, i);

      if (!newWord) {
        isValidGrid = false;
        break;
      }

      selectedWords.push(newWord);
    }

    // Successfully found words for all rows
    if (isValidGrid) {
      newUsedWords.push(keyword, ...selectedWords);

      return {
        keyword,
        words: selectedWords,
        letters: shuffleLetters(selectedWords, size),
        scoringWords: getScoringWords(selectedWords, words, keyword, size),
      };
    }
  }

  // Fallback if no valid grid found
  throw new Error('Failed to generate a valid game grid with the available dictionary.');
};

/**
 * Finds a word for a specific row that matches the keyword character at that position
 *
 * Prioritizes words that reuse existing letters in the grid to minimize unique letters.
 *
 * @param words - Available word dictionary
 * @param keyword - Target keyword for diagonal
 * @param selectedWords - Already selected words for previous rows
 * @param index - Current row index
 * @returns Matching word or undefined if none found
 */
const getNewWord = (
  words: string[],
  keyword: string,
  selectedWords: string[],
  index: number,
): string | undefined => {
  const targetChar = keyword[index];

  // Find words matching the required letter at the required index
  const possibleWords = words.filter((word) => word[index] === targetChar && !selectedWords.includes(word));

  if (possibleWords.length === 0) {
    return undefined;
  }

  const usedLetters = uniq([...flatMap(selectedWords.map((word) => word.split(''))), ...keyword.split('')]);

  const shortList = shuffle(possibleWords);

  // Rank words by letter reuse to minimize unique letters
  const rankedList = sortBy(shortList, (word) => {
    let matchCount = 0;
    for (const char of word) {
      if (usedLetters.includes(char)) matchCount++;
    }
    return matchCount;
  });

  return rankedList[0];
};

/**
 * Shuffles grid letters while preserving diagonal positions
 *
 * @param selectedWords - Words forming the grid rows
 * @param size - Grid dimension
 * @returns Flattened array of shuffled letters with fixed diagonal
 */
const shuffleLetters = (selectedWords: string[], size: number) => {
  const letters = flatMap(selectedWords.map((word) => word.split('')));
  // Diagonal indexes: [0, 5, 10, 15] or [0, 6, 12, 18, 24]
  const preservedIndexes = Array.from({ length: size }, (_, i) => i * size + i);

  const otherLetters = shuffle(letters.filter((_, index) => !preservedIndexes.includes(index)));

  return letters.map((letter, index) =>
    preservedIndexes.includes(index) ? letter : (otherLetters.shift() ?? ''),
  );
};

/**
 * Finds additional valid words that can be formed by swapping letters
 *
 * Searches for words of the correct size that can be formed in any row by moving
 * letters from the movable pool while respecting the fixed diagonal letter.
 *
 * @param selectedWords - Main answer words
 * @param words - Full word dictionary
 * @param keyword - Diagonal keyword
 * @param size - Grid dimension
 * @returns Array of bonus words findable by swapping
 */
const getScoringWords = (selectedWords: string[], words: string[], keyword: string, size: number) => {
  // Get flat array of all grid letters
  const allLetters = flatMap(selectedWords.map((word) => word.split('')));

  // Diagonal indexes
  const preservedIndexes = Array.from({ length: size }, (_, i) => i * size + i);

  // Isolate movable letters
  const movablePool = allLetters.filter((_, index) => !preservedIndexes.includes(index));

  const scoringWordsSet = new Set<string>();

  // Find all possible bonus words
  for (const word of words) {
    // Skip if wrong size or already a main answer
    if (word.length !== size || selectedWords.includes(word)) continue;

    // Check if word can be formed in any row
    for (let row = 0; row < size; row++) {
      // Word must share the fixed letter for this row
      if (word[row] === keyword[row]) {
        let canForm = true;
        const availableLetters = [...movablePool];

        // Verify remaining letters are available
        for (let col = 0; col < size; col++) {
          if (row === col) continue;

          const neededChar = word[col];
          const poolIndex = availableLetters.indexOf(neededChar);

          if (poolIndex !== -1) {
            availableLetters.splice(poolIndex, 1);
          } else {
            canForm = false;
            break;
          }
        }

        // Successfully built the word
        if (canForm) {
          scoringWordsSet.add(word);
          break;
        }
      }
    }
  }

  return Array.from(scoringWordsSet);
};

const _usePalavreadoStats = () => {
  const palavreado100Query = useTDResource<Dictionary<DailyPalavreadoEntry>>('daily-archive-palavreado-100');
  const palavreado200Query = useTDResource<Dictionary<DailyPalavreadoEntry>>('daily-archive-palavreado-200');
  const palavreado300Query = useTDResource<Dictionary<DailyPalavreadoEntry>>('daily-archive-palavreado-300');
  const palavreado400Query = useTDResource<Dictionary<DailyPalavreadoEntry>>('daily-archive-palavreado-400');

  const isSuccess =
    palavreado100Query.isSuccess &&
    palavreado200Query.isSuccess &&
    palavreado300Query.isSuccess &&
    palavreado400Query.isSuccess;

  const data = useMemo(() => {
    if (!isSuccess) return {};

    return {
      ...palavreado100Query.data,
      ...palavreado200Query.data,
      ...palavreado300Query.data,
      ...palavreado400Query.data,
    };
  }, [
    isSuccess,
    palavreado100Query.data,
    palavreado200Query.data,
    palavreado300Query.data,
    palavreado400Query.data,
  ]);

  return useMemo(() => {
    if (!data || Object.keys(data).length === 0) return null;

    // Character frequency analysis
    const consonants = 'bcçdfghjklmnpqrstvwxyz';
    const vowels = 'aeiouáéíóúãõâêîôûàèìòùäëïöü';

    const charFrequency: Record<string, number> = {};
    const wordFrequency: Record<string, number> = {};
    let totalWords = 0;

    // Process all entries
    for (const dateKey in data) {
      const entry = data[dateKey];
      if (entry && Array.isArray(entry.words)) {
        totalWords += entry.words.length;

        // Process each word in the entry
        entry.words.forEach((word: string) => {
          // Count word frequency
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;

          // Count character frequency
          for (const char of word.toLowerCase()) {
            charFrequency[char] = (charFrequency[char] || 0) + 1;
          }
        });
      }
    }

    // Get top consonants
    const topConsonants = Object.entries(charFrequency)
      .filter(([char]) => consonants.includes(char))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([char, count]) => ({ char, count }));

    // Get top vowels
    const topVowels = Object.entries(charFrequency)
      .filter(([char]) => vowels.includes(char))
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([char, count]) => ({ char, count }));

    // Get top words
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    // Calculate totals
    const totalEntries = Object.keys(data).length;
    const totalChars = Object.values(charFrequency).reduce((sum, count) => sum + count, 0);

    return {
      totalEntries,
      totalWords,
      totalChars,
      topConsonants,
      topVowels,
      topWords,
    };
  }, [data]);
};

export type GridCoordinate = {
  index: number;
  row: number;
  col: number;
};

export type SwapAction = {
  from: GridCoordinate;
  to: GridCoordinate;
};

/**
 * Calculates the optimal minimum sequence of swaps to solve a Palavreado puzzle
 *
 * Uses a greedy algorithm that prioritizes perfect swaps (2-cycles) where both positions
 * need each other's letters. Preserves diagonal letters throughout.
 *
 * @param targetWords - Final correct words (e.g., ['TENT', 'READ', 'SASH', 'TART'])
 * @param currentLetters - Current 1D array of letters in the grid
 * @param size - Grid dimension (4 or 5)
 * @returns Array of swap actions to solve the puzzle
 */
export const calculateOptimalSwaps = (
  targetWords: string[],
  currentLetters: string[],
  size: number,
): SwapAction[] => {
  // Flatten target words into 1D array
  const target = targetWords.join('').split('');

  const current = [...currentLetters];

  // Fixed diagonal indices (e.g., [0, 5, 10, 15] for size 4)
  const fixedIndexes = Array.from({ length: size }, (_, i) => i * size + i);

  const swaps: SwapAction[] = [];

  // Format 1D index into 2D coordinates
  const getCoords = (index: number): GridCoordinate => ({
    index,
    row: Math.floor(index / size),
    col: index % size,
  });

  while (true) {
    // Find first incorrect non-fixed letter
    const i = current.findIndex((char, idx) => char !== target[idx] && !fixedIndexes.includes(idx));

    // Puzzle is solved
    if (i === -1) break;

    const charNeededHere = target[i];
    const charCurrentlyHere = current[i];

    // Priority 1: Look for a perfect swap (2-cycle)
    let bestJ = current.findIndex(
      (char, idx) =>
        idx !== i &&
        !fixedIndexes.includes(idx) &&
        char === charNeededHere &&
        target[idx] === charCurrentlyHere,
    );

    // Priority 2: Any valid swap
    if (bestJ === -1) {
      bestJ = current.findIndex(
        (char, idx) =>
          idx !== i && !fixedIndexes.includes(idx) && char === charNeededHere && char !== target[idx],
      );
    }

    // Safety check for malformed input
    if (bestJ === -1) {
      if (debugDailyStore.state.palavreado) {
        console.warn(`Palavreado Solver: Could not find required letter '${charNeededHere}'`);
      }
      break;
    }

    // Execute the swap
    current[i] = current[bestJ];
    current[bestJ] = charCurrentlyHere;

    // Record the swap
    swaps.push({
      from: getCoords(i),
      to: getCoords(bestJ),
    });
  }

  return swaps;
};
