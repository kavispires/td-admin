/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */
import { useQuery } from '@tanstack/react-query';
import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useLoadWordLibrary } from 'hooks/useLoadWordLibrary';
import { useTDResource } from 'hooks/useTDResource';
import { sample, sampleSize, shuffle } from 'lodash';
import type { ImageCardPasscodeSet } from 'types';
import { SEPARATOR } from 'utils/constants';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

type Corridor = {
  /**
   * Passcode string to guess
   */
  passcode: string;
  /**
   * Image card IDs as clues
   */
  imagesIds: string[];
  /**
   * Three-letter words representing letters
   */
  words: string[];
  /**
   * Number of moves to solve this corridor
   */
  goal: number;
};

export type DailyPortaisEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Combined set identifier
   */
  setId: string;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'portais';
  /**
   * Three corridors to solve
   */
  corridors: Corridor[];
  /**
   * Total moves needed to solve all corridors
   */
  goal: number;
};

/**
 * Hook for generating daily Portais games
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for the words
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used passcodes
 * @returns Generated Portais game entries with history updates
 */
export const useDailyPortaisGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyPortaisEntry> => {
  // Fetch prerequisite data
  const [portaisHistory] = useParsedHistory(DAILY_GAMES_KEYS.PORTAIS, dailyHistory);
  const imageCardPasscodeSetsQuery = useTDResource<ImageCardPasscodeSet>('daily-passcode-sets', { enabled });
  const wordsThreeQuery = useLoadWordLibrary(3, queryLanguage, enabled, true);

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate =
    enabled && imageCardPasscodeSetsQuery.isSuccess && wordsThreeQuery.isSuccess && !!portaisHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: [
      'generate-daily',
      'portais',
      batchSize,
      imageCardPasscodeSetsQuery.dataUpdatedAt,
      wordsThreeQuery.dataUpdatedAt,
    ],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!portaisHistory || !imageCardPasscodeSetsQuery.data || !wordsThreeQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      // Build letter dictionary for word lookups
      const wordsLettersDict: Record<string, string[]> = {
        ' ': ['  '],
        '-': [' - '],
      };

      for (const word of wordsThreeQuery.data) {
        for (const letter of word) {
          if (!wordsLettersDict[letter]) {
            wordsLettersDict[letter] = [];
          }
          wordsLettersDict[letter].push(word);
        }
      }

      return buildDailyPortaisGames(
        batchSize,
        portaisHistory,
        imageCardPasscodeSetsQuery.data,
        wordsLettersDict,
      );
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || imageCardPasscodeSetsQuery.isLoading || wordsThreeQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: portaisHistory?.latestDate ?? '',
      latestNumber: portaisHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Portais games
 *
 * Generates games with 3 corridors each, where each corridor has a passcode to guess using
 * image clues and three-letter words. Corridors are ordered by difficulty (3 images → 2 images → 1 image).
 * Tracks used passcodes to avoid duplicates.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used passcodes
 * @param passcodeSets - Available passcode sets with images
 * @param wordsLettersDict - Dictionary mapping letters to three-letter words
 * @returns Generated entries, errors, and history update
 */
export const buildDailyPortaisGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  passcodeSets: Dictionary<ImageCardPasscodeSet>,
  wordsLettersDict: Record<string, string[]>,
) => {
  if (debugDailyStore.state.portais) {
    console.count('Creating Portais...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyPortaisEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  // Track globally used passcodes to avoid duplicates
  const usedPasscodesTracker = new Set(history.used);

  // Filter valid sets (must have at least some images)
  const allValidSets = Object.values(passcodeSets).filter((s) => s.imageCardsIds.length > 0);

  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(latestDate);
    latestDate = id;
    latestNumber = history.latestNumber + i + 1;

    try {
      if (allValidSets.length < 3) {
        throw new Error('Critical: Not enough valid passcode sets in the database to build a game.');
      }

      const dailySets: ImageCardPasscodeSet[] = [];
      const corridors: Corridor[] = [];

      // Create 3 corridors with increasing difficulty (1, 2, 3 images)
      for (let c = 1; c <= 3; c++) {
        // Find eligible sets with required image count and not used today
        const eligibleSets = shuffle(
          allValidSets.filter((s) => s.imageCardsIds.length >= c && !dailySets.some((ds) => ds.id === s.id)),
        );

        if (eligibleSets.length === 0) {
          throw new Error(`Not enough distinct sets available with at least ${c} images.`);
        }

        let selectedSet: ImageCardPasscodeSet | null = null;
        let selectedPasscode = '';

        // Try to find a set with a fresh passcode
        for (const set of eligibleSets) {
          const validPasscodes = set.passcode?.filter((p) => p && p.length <= 12) ?? [];
          const unusedPasscodes = validPasscodes.filter((p) => !usedPasscodesTracker.has(p));

          if (unusedPasscodes.length > 0) {
            selectedSet = set;
            selectedPasscode = sample(unusedPasscodes) ?? unusedPasscodes[0];
            break;
          }
        }

        // Fallback: recycle old passcode if data exhausted
        if (!selectedSet) {
          if (debugDailyStore.state.portais) {
            console.log('🔆 Not enough fresh passcodes left, recycling...');
          }
          selectedSet = eligibleSets[0];
          const validPasscodes = selectedSet.passcode?.filter((p) => p && p.length <= 12) ?? [];

          if (validPasscodes.length === 0) {
            throw new Error(`Set ${selectedSet.id} has no valid passcodes <= 12 characters.`);
          }

          selectedPasscode = sample(validPasscodes) ?? validPasscodes[0];
        }

        // Mark as used and track
        usedPasscodesTracker.add(selectedPasscode);
        used.push(selectedPasscode);
        dailySets.push(selectedSet);

        // Build corridor mechanics
        const words = selectedPasscode
          .split('')
          .map((letter) => sample(wordsLettersDict[letter]) ?? ` ${letter} `);

        const imagesIds = sampleSize(selectedSet.imageCardsIds, c);

        corridors.push({
          passcode: selectedPasscode,
          imagesIds,
          words,
          goal: calculateMovesToSolve(selectedPasscode, words),
        });
      }

      // Reverse corridors (3 images → 2 images → 1 image)
      entries[id] = {
        id,
        type: 'portais',
        setId: dailySets.map((s) => s.id).join(SEPARATOR),
        number: latestNumber,
        corridors: corridors.reverse(),
        goal: corridors.reduce((acc, c) => acc + c.goal, 0),
      };
    } catch (error: unknown) {
      if (debugDailyStore.state.portais) {
        console.error(`Portais Day ${id} Failed:`, error);
      }
      errors.push(`Day ${id}: ${(error as Error).message || 'Unknown generation error'}`);
    }
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
 * Calculates the minimum number of moves needed to solve a corridor
 *
 * Each three-letter word can be rotated to reveal the target letter in the middle position.
 * Calculates moves needed: position 0 needs 2 moves, position 1 needs 0 moves, position 2 needs 1 move.
 *
 * @param secretWord - The passcode to solve
 * @param threeLetterWords - Array of three-letter words representing each letter
 * @returns Total number of moves needed
 */
function calculateMovesToSolve(secretWord: string, threeLetterWords: string[]): number {
  if (secretWord.length !== threeLetterWords.length) {
    throw new Error('Secret word length must match the number of 3-letter words');
  }

  let totalMoves = 0;

  for (let i = 0; i < secretWord.length; i++) {
    const targetLetter = secretWord[i].toUpperCase();
    const word = threeLetterWords[i].toUpperCase();

    // Find which position in the 3-letter word contains the target letter
    let targetPosition = -1;
    for (let j = 0; j < 3; j++) {
      if (word[j] === targetLetter) {
        targetPosition = j;
        break;
      }
    }

    if (targetPosition === -1) {
      throw new Error(`Target letter '${targetLetter}' not found in word '${word}' at position ${i}`);
    }

    // Calculate moves needed to get the target letter to the middle position (index 1)
    // The word starts with position 0 at the top, 1 in middle, 2 at bottom
    // We need the target letter to be in position 1 (middle)
    let movesNeeded = 0;

    if (targetPosition === 0) {
      // Letter is at top, need 2 moves to get to middle (0 -> 2 -> 1)
      movesNeeded = 2;
    } else if (targetPosition === 1) {
      // Letter is already in middle, no moves needed
      movesNeeded = 0;
    } else if (targetPosition === 2) {
      // Letter is at bottom, need 1 move to get to middle (2 -> 0 -> 1)
      movesNeeded = 1;
    }

    totalMoves += movesNeeded;
  }

  return totalMoves;
}
