import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useLoadWordLibrary } from 'hooks/useLoadWordLibrary';
import { useTDResource } from 'hooks/useTDResource';
import { difference, flatMap, shuffle, sortBy, uniq } from 'lodash';
import { useMemo } from 'react';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { checkWeekend, getNextDay } from '../utils';

export type DailyPalavreadoEntry = {
  id: DateKey;
  number: number;
  type: 'palavreado';
  keyword: string;
  words: string[];
  letters: string[];
  scoringWords?: string[];
};

export const useDailyPalavreadoGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [palavreadoHistory] = useParsedHistory(DAILY_GAMES_KEYS.PALAVREADO, dailyHistory);

  const wordsFourQuery = useLoadWordLibrary(4, queryLanguage, enabled, true);
  const wordsFiveQuery = useLoadWordLibrary(5, queryLanguage, enabled, true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || !wordsFourQuery.data?.length || !wordsFiveQuery.data?.length || !palavreadoHistory) {
      return {};
    }

    return buildDailyPalavreadoGames(batchSize, palavreadoHistory, wordsFourQuery.data, wordsFiveQuery.data);
  }, [enabled, wordsFourQuery.dataUpdatedAt, wordsFiveQuery.dataUpdatedAt, palavreadoHistory, batchSize]);

  return {
    entries,
    isLoading: wordsFourQuery.isLoading || wordsFiveQuery.isLoading,
  };
};

/**
 * Builds a dictionary of DailyPalavreadoEntry games.
 *
 * @param batchSize - The number of games to generate.
 * @param history - The parsed daily history entry.
 * @param fourLetterWords - An array of four-letter words.
 * @returns A dictionary of DailyPalavreadoEntry games.
 */
export const buildDailyPalavreadoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  fourLetterWords: string[],
  fiveLetterWords: string[],
) => {
  console.count('Creating Palavreado...');
  let lastDate = history.latestDate;
  const usedWords: string[] = [];

  const entries: Dictionary<DailyPalavreadoEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    const isWeekend = checkWeekend(id);
    const size = isWeekend ? 5 : 4;
    lastDate = id;

    // SPECIAL DATA HANDLER: Modify the date below
    let fixedKeyword: string | undefined;
    if (id === '2026-01-01') {
      fixedKeyword = 'novo';
    }

    entries[id] = {
      id,
      type: 'palavreado',
      number: history.latestNumber + i + 1,
      ...generatePalavreadoGame(
        isWeekend ? fiveLetterWords : fourLetterWords,
        [...Object.values(entries).map((e) => e.keyword), ...history.used],
        usedWords,
        size,
        fixedKeyword,
      ),
    };
  }
  return entries;
};

// ===========================
// PALAVREADO GENERATOR
// ===========================

/**
 * Generates a Palavreado game.
 *
 * @param words - An array of words to choose from.
 * @param previouslyUsedWords - An array of words that have been used previously.
 * @param newUsedWords - An array of words that have been used in this game.
 * @param size - The number of words to generate.
 * @returns An object containing the keyword, selected words, and shuffled letters.
 */
export const generatePalavreadoGame = (
  words: string[],
  previouslyUsedWords: string[],
  newUsedWords: string[],
  size = 4,
  fixedKeyword?: string,
) => {
  // 1. History Recycling Logic
  let availableKeywords = difference(words, newUsedWords, previouslyUsedWords);

  if (availableKeywords.length === 0) {
    console.warn('Keyword pool exhausted. Recycling historical words.');
    // Fall back to just avoiding words used in the current batch
    availableKeywords = difference(words, newUsedWords);
  }

  let shuffledKeywords = shuffle(availableKeywords);

  if (fixedKeyword) {
    shuffledKeywords = [fixedKeyword, ...difference(shuffledKeywords, [fixedKeyword])];
  }

  // 2. Backtracking Loop
  for (const keyword of shuffledKeywords) {
    const selectedWords: string[] = [];
    let isValidGrid = true;

    for (let i = 0; i < size; i++) {
      const newWord = getNewWord(words, keyword, selectedWords, i);

      if (!newWord) {
        isValidGrid = false; // Dead end reached
        break; // Break the inner loop, try the next keyword
      }

      selectedWords.push(newWord);
    }

    // If we successfully found a word for every row, lock it in!
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

  // 3. Absolute Fallback
  throw new Error('Failed to generate a valid game grid with the available dictionary.');
};

/**
 * Retrieves a new word from the given list of words based on the provided keyword, selected words, and index.
 *
 * @param words - The list of words to choose from.
 * @param keyword - The keyword to match against.
 * @param selectedWords - The list of already selected words.
 * @param index - The index to compare against in each word.
 * @returns The new word selected based on the keyword, selected words, and index.
 */
const getNewWord = (
  words: string[],
  keyword: string,
  selectedWords: string[],
  index: number,
): string | undefined => {
  // Explicitly mark return type
  const targetChar = keyword[index];

  // Find all words that match the required letter at the required index
  const possibleWords = words.filter((word) => word[index] === targetChar && !selectedWords.includes(word));

  if (possibleWords.length === 0) {
    return undefined; // Let the parent function know this path failed
  }

  const usedLetters = uniq([...flatMap(selectedWords.map((word) => word.split(''))), ...keyword.split('')]);

  const shortList = shuffle(possibleWords);

  // Only sort if you really want to bias towards reusing letters.
  // Otherwise, just returning shortList[0] is significantly faster.
  const rankedList = sortBy(shortList, (word) => {
    // Optimization: avoid split('') by iterating over the string directly
    let matchCount = 0;
    for (const char of word) {
      if (usedLetters.includes(char)) matchCount++;
    }
    return matchCount;
  });

  // Since we checked possibleWords.length > 0 earlier, this is safe
  return rankedList[0];
};

const shuffleLetters = (selectedWords: string[], size: number) => {
  const letters = flatMap(selectedWords.map((word) => word.split('')));
  // Create preserved indexes dynamically: [0, 5, 10, 15] or [0, 6, 12, 18, 24]
  const preservedIndexes = Array.from({ length: size }, (_, i) => i * size + i);

  const otherLetters = shuffle(letters.filter((_, index) => !preservedIndexes.includes(index)));

  return letters.map((letter, index) =>
    preservedIndexes.includes(index) ? letter : (otherLetters.shift() ?? ''),
  );
};

const getScoringWords = (selectedWords: string[], words: string[], keyword: string, size: number) => {
  // 1. Get the flat array of all letters in the grid
  const allLetters = flatMap(selectedWords.map((word) => word.split('')));

  // Create the diagonal indexes dynamically based on size (e.g., for size 4: [0, 5, 10, 15])
  const preservedIndexes = Array.from({ length: size }, (_, i) => i * size + i);

  // 2. Isolate the letters the player is allowed to move
  const movablePool = allLetters.filter((_, index) => !preservedIndexes.includes(index));

  const scoringWordsSet = new Set<string>();

  // 3. Find all possible bonus words
  for (const word of words) {
    // Skip if wrong size or if it's already one of the main answer words
    if (word.length !== size || selectedWords.includes(word)) continue;

    // Check if the word can be formed in ANY of the rows
    for (let row = 0; row < size; row++) {
      // The word MUST share the fixed letter for this specific row
      if (word[row] === keyword[row]) {
        let canForm = true;
        const availableLetters = [...movablePool];

        // Verify if we have the remaining letters in our movable pool
        for (let col = 0; col < size; col++) {
          if (row === col) continue; // Skip the fixed letter

          const neededChar = word[col];
          const poolIndex = availableLetters.indexOf(neededChar);

          if (poolIndex !== -1) {
            availableLetters.splice(poolIndex, 1); // Consume the letter
          } else {
            canForm = false; // Missing a required letter
            break;
          }
        }

        // If we successfully built the word, add it and stop checking other rows for this same word
        if (canForm) {
          scoringWordsSet.add(word);
          break;
        }
      }
    }
  }

  return Array.from(scoringWordsSet);
};

// ===========================
// STATS SUMMARIZER
// ===========================

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

// ===========================
// PALAVREADO SOLVER
// ===========================

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
 * Calculates the optimal minimum sequence of swaps to solve a Palavreado game.
 * * @param targetWords The final correct words (e.g., ['TENT', 'READ', 'SASH', 'TART'])
 * @param currentLetters The current 1D array of letters in the grid
 * @param size The grid size (4 or 5)
 * @returns An array of SwapActions representing the exact moves to win
 */
export const calculateOptimalSwaps = (
  targetWords: string[],
  currentLetters: string[],
  size: number,
): SwapAction[] => {
  // 1. Flatten the target words into a 1D target array
  const target = targetWords.join('').split('');

  // Clone the current letters so we can mutate them during simulation
  const current = [...currentLetters];

  // Calculate the fixed diagonal indices (e.g., [0, 5, 10, 15] for size 4)
  const fixedIndexes = Array.from({ length: size }, (_, i) => i * size + i);

  const swaps: SwapAction[] = [];

  // Helper to format the 1D index into 2D UI coordinates
  const getCoords = (index: number): GridCoordinate => ({
    index,
    row: Math.floor(index / size),
    col: index % size,
  });

  while (true) {
    // 2. Find the first letter that is NOT in its correct position (and is not fixed)
    const i = current.findIndex((char, idx) => char !== target[idx] && !fixedIndexes.includes(idx));

    // If no incorrect letters are found, the puzzle is solved!
    if (i === -1) break;

    const charNeededHere = target[i];
    const charCurrentlyHere = current[i];

    // 3. PRIORITY 1: Look for a "Perfect Swap" (2-cycle)
    // We want a position 'j' that currently has the character we need,
    // AND it specifically needs the character we are trying to get rid of.
    let bestJ = current.findIndex(
      (char, idx) =>
        idx !== i &&
        !fixedIndexes.includes(idx) &&
        char === charNeededHere &&
        target[idx] === charCurrentlyHere,
    );

    // 4. PRIORITY 2: Any valid swap
    // If no perfect swap exists, just find ANY movable position that has the
    // character we need and isn't already in its correct final spot.
    if (bestJ === -1) {
      bestJ = current.findIndex(
        (char, idx) =>
          idx !== i && !fixedIndexes.includes(idx) && char === charNeededHere && char !== target[idx],
      );
    }

    // Safety check (should only happen if the input data is malformed)
    if (bestJ === -1) {
      console.warn(`Palavreado Solver: Could not find required letter '${charNeededHere}'`);
      break;
    }

    // 5. Execute the swap in our simulated array
    current[i] = current[bestJ];
    current[bestJ] = charCurrentlyHere;

    // 6. Record the swap with helpful UI coordinates
    swaps.push({
      from: getCoords(i),
      to: getCoords(bestJ),
    });
  }

  return swaps;
};
