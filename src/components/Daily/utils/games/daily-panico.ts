/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

/**
 * Daily Pânico generation, history updates, and manual development sequences.
 * Content and client-side rule metadata live in {@link BUTTONS_LIBRARY} and
 * {@link POOLS}; saved payloads contain only encoded button placements.
 *
 * @module
 */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useQuery } from '@tanstack/react-query';
import { random, sampleSize, shuffle } from 'lodash';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getDayOfTheWeek, getNextDay } from '../utils';
import { BUTTONS_LIBRARY, type ButtonDictionaryEntry, type ButtonKey, POOLS } from './daily-panico-data';
import { debugDailyStore } from './debug-daily';

/**
 * A daily Pânico challenge payload.
 */
export type DailyPanicoEntry = {
  /**
   * Challenge date in YYYY-MM-DD format.
   */
  id: DateKey;
  /**
   * Sequential challenge number shown to the player.
   */
  number: number;
  /**
   * History fingerprint of hashed button types and pool selections.
   * Not unique: button types without hash codes are omitted.
   */
  hashId: string;
  /**
   * Discriminator for Panico payloads.
   */
  type: 'panico';
  /**
   * Encoded timed instructions: position::buttonKey::poolIndex.
   * Positions are one-based; pool indexes are zero-based, or empty without a pool.
   */
  buttons: string[];
};

/**
 * Hook for generating daily Pânico games
 *
 * Generates randomized, language-independent button sequences after history loads.
 * The game client resolves localized instructions and dynamic press targets.
 * Generated query results do not become stale with time.
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Cache partition retained for compatibility with other daily hooks
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Last generated date, challenge number, and history fingerprints
 * @returns Generated Pânico game entries with history updates
 */
export const useDailyPanicoGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyPanicoEntry> => {
  // Fetch prerequisite data
  const [panicoHistory] = useParsedHistory(DAILY_GAMES_KEYS.PANICO, dailyHistory);

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate = enabled && !!panicoHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: ['generate-daily', 'panico', batchSize, queryLanguage],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!panicoHistory) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyPanicoGames(batchSize, panicoHistory);
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || generatorQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: panicoHistory?.latestDate ?? '',
      latestNumber: panicoHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Pânico games
 *
 * Creates 25-button sequences with spacing, exclusion, and dependency rules.
 * History advances only for completed games. Fingerprints are recorded but
 * are not used to reject duplicates. Generation stops at the first failure and
 * reports it alongside any completed entries instead of rejecting the batch.
 *
 * @param batchSize - Non-negative integer number of games to generate; zero leaves history unchanged
 * @param history - Starting date and challenge number
 * @returns Completed entries keyed by date, collected errors, and an additive history update
 */
export const buildDailyPanicoGames = (batchSize: number, history: ParsedDailyHistoryEntry) => {
  if (debugDailyStore.state.panico) {
    console.count('Creating Pânico...');
  }

  const errors: string[] = [];
  const entries: Dictionary<DailyPanicoEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    if (!Number.isInteger(batchSize) || batchSize < 0) {
      throw new Error('Pânico batch size must be a non-negative integer.');
    }
    // Build the batch
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      const number = latestNumber + 1;

      const dayOfTheWeek = getDayOfTheWeek(id);
      const buttonCounts = [30, 10, 20, 20, 20, 15, 25];
      const partialGame = generateGameSequence(buttonCounts[dayOfTheWeek]);

      // Track usage
      used.push(partialGame.hash);

      entries[id] = {
        id,
        number,
        hashId: partialGame.hash,
        type: 'panico',
        buttons: partialGame.sequence,
      };
      latestDate = id;
      latestNumber = number;
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.panico) {
      console.error(error);
    }
    errors.push(
      error instanceof Error ? error.message : 'An unknown error occurred during Pânico generation.',
    );
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
 * Letters used to mint new 3-character button hash codes for
 * {@link generateUniqueHashes}.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Default sequence length, including the fixed opening and closing buttons.
 */
const NUMBER_OF_BUTTONS = 25;

/**
 * Button key always placed first in a generated sequence.
 */
const BASIC_PRESS_KEY = 'BASIC_PRESS';

/**
 * Button key always placed last in a generated sequence.
 */
const FINAL_PRESS_KEY = 'FINAL_PRESS';

/**
 * Fallback button key used when no other candidate satisfies the rules.
 */
const BASIC_DO_NOT_PRESS_KEY = 'BASIC_DO_NOT_PRESS';

/**
 * Button key whose target count must mirror the previous button's.
 */
const SAME_AS_PREVIOUS_KEY = 'SAME_AS_PREVIOUS';

/**
 * Separator for the position, button key, and optional pool index.
 */
const BUTTON_SEPARATOR = '::';

/**
 * Encodes a zero-based placement as position::buttonKey::poolIndex.
 * Always emits three fields, including an empty pool field for unpooled buttons.
 *
 * @param key - Button definition to reference
 * @param index - Zero-based sequence position, converted to a one-based payload position
 * @param poolIndex - Zero-based pool variation; omitted for buttons without a pool
 * @returns The encoded placement, preserving zero as a valid pool index
 *
 * @example
 * encodeButton('BASIC_PRESS', 0); // '1::BASIC_PRESS::'
 * encodeButton('COUNT_SENTENCE', 1, 0); // '2::COUNT_SENTENCE::0'
 */
function encodeButton(key: ButtonKey, index: number, poolIndex?: number): string {
  return `${index + 1}${BUTTON_SEPARATOR}${key}${BUTTON_SEPARATOR}${poolIndex ?? ''}`;
}

/**
 * A button placed in a sequence while it's still being generated.
 */
type PlacedButton = {
  /**
   * Button definition key from {@link BUTTONS_LIBRARY}.
   */
  key: ButtonKey;
  /**
   * Index into the button's pool, when it has one.
   */
  poolIndex?: number;
  /**
   * Raw library target used by placement rules; the client resolves dynamic targets.
   */
  targetCount: number;
  /**
   * Library action used for placement, including unresolved TBD actions.
   */
  expectedAction: ButtonDictionaryEntry['expectedAction'];
  /**
   * Difficulty level copied from the button's library entry.
   */
  level: ButtonDictionaryEntry['level'];
};

/**
 * Generates a Panico button sequence using the game's full set of placement
 * rules via recursive backtracking. Dependencies must be at least five positions
 * earlier. Difficulty balancing and ready dependents are selection preferences,
 * not quotas. Fallbacks may exceed occurrence limits but preserve spacing and
 * restricted-target streak limits. Dynamic targets remain client-resolved.
 *
 * @param length Total number of buttons in the sequence (default 25).
 * @returns The encoded sequence strings plus their history fingerprint.
 * @throws If length is not an integer of at least 8, or no sequence can be built.
 */
export function generateGameSequence(length = NUMBER_OF_BUTTONS): {
  /**
   * Concatenated button hash codes and pool indexes; not a uniqueness guarantee.
   */
  hash: string;
  /**
   * Ordered, three-field encoded placements, including the fixed endpoints.
   */
  sequence: string[];
} {
  // Minimum length to safely accommodate the 5-space dependency gap.
  if (!Number.isInteger(length) || length < 8) {
    throw new Error('Sequence length must be an integer of at least 8 for the 5-position dependency gap.');
  }

  const sequence: PlacedButton[] = [];

  // 1. The game always starts with BASIC_PRESS.
  sequence.push({
    key: BASIC_PRESS_KEY,
    targetCount: BUTTONS_LIBRARY[BASIC_PRESS_KEY].targetCount,
    expectedAction: BUTTONS_LIBRARY[BASIC_PRESS_KEY].expectedAction,
    level: BUTTONS_LIBRARY[BASIC_PRESS_KEY].level,
  });

  /**
   * Checks if a target count is considered restricted (counts toward the
   * "no more than 5 restricted targets in a row" candidate-selection rule).
   *
   * @param targetCount - Raw library target, before client-side resolution
   * @returns Whether the target is zero or the dynamic-target sentinel -2
   */
  const isRestrictedTarget = (targetCount: number) => targetCount === 0 || targetCount === -2;

  /**
   * Recursive backtracking function that attempts to build a valid button
   * sequence from `currentIndex` to the end. Mutates the shared sequence;
   * failed branches remove their own placements before returning.
   * The final slot is filled directly, bypassing candidate filtering.
   *
   * @param currentIndex - Zero-based position to fill after the existing prefix
   * @returns Whether a complete suffix was found and left in the shared sequence
   */
  const solve = (currentIndex: number): boolean => {
    // Base case: the final slot always gets FINAL_PRESS.
    if (currentIndex === length - 1) {
      sequence.push({
        key: FINAL_PRESS_KEY,
        targetCount: BUTTONS_LIBRARY[FINAL_PRESS_KEY].targetCount,
        expectedAction: BUTTONS_LIBRARY[FINAL_PRESS_KEY].expectedAction,
        level: BUTTONS_LIBRARY[FINAL_PRESS_KEY].level,
      });
      return true;
    }

    const occurrences: Partial<Dictionary<number>> = {};
    const bannedByEitherOr = new Set<ButtonKey>();

    // Tracker to ensure a healthy mix of difficulty levels.
    const levelCounts: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    for (const placedButton of sequence) {
      occurrences[placedButton.key] = (occurrences[placedButton.key] || 0) + 1;
      const entry = BUTTONS_LIBRARY[placedButton.key];

      if (entry.eitherOr) {
        for (const key of entry.eitherOr) {
          bannedByEitherOr.add(key);
        }
      }

      // Tally level distributions, ignoring dependent buttons.
      if (!entry.dependsOn) {
        levelCounts[entry.level] = (levelCounts[entry.level] || 0) + 1;
      }
    }

    // Shuffle the entire library upfront to eliminate top-to-bottom list bias.
    const randomizedLibrary = shuffle(Object.values(BUTTONS_LIBRARY));

    let validCandidates = randomizedLibrary.filter((candidate) => {
      // RULE: FINAL_PRESS is strictly reserved for the end.
      if (candidate.key === FINAL_PRESS_KEY) {
        return false;
      }

      // RULE: Max occurrences.
      const currentCount = occurrences[candidate.key] || 0;
      if (currentCount >= candidate.maxOccurrence) {
        return false;
      }

      // RULE: Mutual exclusions.
      if (bannedByEitherOr.has(candidate.key)) {
        return false;
      }
      if (candidate.eitherOr?.some((key) => occurrences[key])) {
        return false;
      }

      // RULE: Spacing (cannot appear 2 in a row or within 2 positions).
      const last1 = sequence[currentIndex - 1]?.key;
      const last2 = sequence[currentIndex - 2]?.key;
      if (last1 === candidate.key || last2 === candidate.key) {
        return false;
      }

      // RULE: Dependencies (must be present at least 5 buttons prior).
      if (candidate.dependsOn) {
        const dependencyIndex = sequence.findIndex(
          (placedButton) => placedButton.key === candidate.dependsOn,
        );
        if (dependencyIndex === -1 || currentIndex - dependencyIndex < 5) {
          return false;
        }
      }

      // RULE: SAME_AS_PREVIOUS constraint.
      if (candidate.key === SAME_AS_PREVIOUS_KEY) {
        const previous = sequence[currentIndex - 1];
        if (previous.expectedAction === 'ANY' || previous.expectedAction === 'TBD') {
          return false;
        }
      }

      // RULE: Target count streak.
      if (isRestrictedTarget(candidate.targetCount)) {
        let streak = 0;
        for (let i = currentIndex - 1; i >= 0; i--) {
          if (isRestrictedTarget(sequence[i].targetCount)) {
            streak++;
          } else {
            break;
          }
        }
        if (streak >= 5) {
          return false;
        }
      }

      return true;
    });

    // RULE: Fallback completion.
    if (validCandidates.length === 0) {
      const fallbacks = [BUTTONS_LIBRARY[BASIC_PRESS_KEY], BUTTONS_LIBRARY[BASIC_DO_NOT_PRESS_KEY]];
      validCandidates = shuffle(fallbacks).filter((candidate) => {
        const last1 = sequence[currentIndex - 1]?.key;
        const last2 = sequence[currentIndex - 2]?.key;
        if (last1 === candidate.key || last2 === candidate.key) {
          return false;
        }

        if (isRestrictedTarget(candidate.targetCount)) {
          let streak = 0;
          for (let i = currentIndex - 1; i >= 0; i--) {
            if (isRestrictedTarget(sequence[i].targetCount)) {
              streak++;
            } else {
              break;
            }
          }
          if (streak >= 5) {
            return false;
          }
        }
        return true;
      });
    }

    if (validCandidates.length === 0) {
      return false;
    }

    // Sort valid candidates to enforce the mix of levels and dependencies.
    validCandidates.sort((a, b) => {
      // Priority 1: ready dependencies bubble to the top.
      const aReady = a.dependsOn && occurrences[a.dependsOn] ? 1 : 0;
      const bReady = b.dependsOn && occurrences[b.dependsOn] ? 1 : 0;
      if (aReady !== bReady) {
        return bReady - aReady;
      }

      // Priority 2: prioritize buttons whose difficulty level has appeared
      // the least so far. Ties keep the randomized shuffle order.
      const aLevelCount = a.dependsOn ? 0 : levelCounts[a.level] || 0;
      const bLevelCount = b.dependsOn ? 0 : levelCounts[b.level] || 0;

      return aLevelCount - bLevelCount;
    });

    // Attempt to place candidates.
    for (const candidate of validCandidates) {
      let poolIndex: number | undefined;

      // Reuse the dependency's pool index 60% of the time; otherwise sample freely.
      if (candidate.pool) {
        const poolSize = Object.values(POOLS[candidate.pool]).length;

        if (candidate.dependsOn) {
          const dependencyButton = sequence.find((placedButton) => placedButton.key === candidate.dependsOn);
          if (dependencyButton && dependencyButton.poolIndex !== undefined && random(1, 100) <= 60) {
            poolIndex = dependencyButton.poolIndex;
          } else {
            poolIndex = random(0, poolSize - 1);
          }
        } else {
          poolIndex = random(0, poolSize - 1);
        }
      }

      sequence.push({
        key: candidate.key,
        poolIndex,
        targetCount: candidate.targetCount,
        expectedAction: candidate.expectedAction,
        level: candidate.level,
      });

      // Recurse to the next index.
      if (solve(currentIndex + 1)) {
        return true;
      }

      // That path failed, pop the button off and try the next candidate.
      sequence.pop();
    }

    return false;
  };

  const success = solve(1);

  if (!success) {
    throw new Error('Could not generate a complete Pânico sequence matching the placement rules.');
  }

  const hash: string[] = [];
  const buttonSequence = sequence.map((placedButton, index) => {
    const poolSuffix = placedButton.poolIndex !== undefined ? placedButton.poolIndex.toString() : '';

    const buttonData = BUTTONS_LIBRARY[placedButton.key];
    if (buttonData?.hash) {
      hash.push(placedButton.poolIndex !== undefined ? `${buttonData.hash}${poolSuffix}` : buttonData.hash);
    }

    return encodeButton(placedButton.key, index, placedButton.poolIndex);
  });

  return {
    sequence: buttonSequence,
    hash: hash.join(''),
  };
}

/**
 * Generates a set of unique 3-character hash codes that don't collide with
 * any hash already assigned in {@link BUTTONS_LIBRARY}. Used to mint new
 * button hashes when expanding the library.
 *
 * Does not assign codes to definitions; copy the chosen codes into the library.
 * Callers must request a finite, non-negative integer within the remaining
 * three-letter code space to ensure the retry loop can finish.
 *
 * @param count - Number of new codes to generate
 * @returns Lowercase three-letter codes, sorted alphabetically
 */
export function generateUniqueHashes(count: number): string[] {
  const usedHashes = new Set<string>();
  for (const button of Object.values(BUTTONS_LIBRARY)) {
    if (button.hash) {
      usedHashes.add(button.hash);
    }
  }

  const newHashes = new Set<string>();
  while (newHashes.size < count) {
    const hash =
      `${sampleSize(ALPHABET, 1)}${sampleSize(ALPHABET, 1)}${sampleSize(ALPHABET, 1)}`.toLowerCase();
    if (!usedHashes.has(hash) && !newHashes.has(hash)) {
      newHashes.add(hash);
    }
  }
  return Array.from(newHashes).sort();
}

/**
 * Builds the encoded id for one button in a hand-written test sequence,
 * resolving a random pool index when the button has one.
 *
 * @param button - Library definition to include without applying placement rules
 * @param index - Zero-based position in the development sequence
 * @returns A three-field placement with a random valid pool index, or an empty pool field
 */
function encodeTestButton(button: ButtonDictionaryEntry<ButtonKey>, index: number): string {
  const poolIndex = button.pool ? random(0, Object.values(POOLS[button.pool]).length - 1) : undefined;
  return encodeButton(button.key, index, poolIndex);
}

/**
 * Generates a sequence containing every button in {@link BUTTONS_LIBRARY},
 * for manually exercising each button type during development. These fixtures
 * deliberately bypass production spacing, dependency, and exclusion rules.
 *
 * @returns The encoded sequence strings, one per library button.
 */
export function generateAllButtonsSequence(): string[] {
  return Object.values(BUTTONS_LIBRARY).map((button, index) => encodeTestButton(button, index));
}

/**
 * Generates a short, hand-picked test sequence for quick manual checks.
 * Edit the local sample keys to exercise specific buttons; production placement
 * rules are intentionally not applied.
 *
 * @returns The encoded sequence strings for the hand-picked button keys.
 */
export function generateSampleTestSequence(): string[] {
  const sampleKeys: ButtonKey[] = [
    'BASIC_PRESS',
    // Add buttons here.
    'FINAL_PRESS',
  ];

  return sampleKeys
    .map((key) => BUTTONS_LIBRARY[key])
    .map((button, index) => encodeTestButton(button, index));
}

/**
 * Expands selected pool-backed buttons into one entry per pool variation.
 * Positions are assigned after expansion. This development fixture does not
 * enforce production placement rules; include prerequisite buttons as needed.
 *
 * @param sampleKeys - Ordered button keys to expand; defaults to the opening and closing buttons only
 * @returns The encoded sequence strings, including one per pool variation.
 */
export function generateSampleTestAllPoolsSequence(
  sampleKeys: readonly ButtonKey[] = ['BASIC_PRESS', 'FINAL_PRESS'],
): string[] {
  return sampleKeys
    .map((key) => BUTTONS_LIBRARY[key])
    .flatMap<Pick<PlacedButton, 'key' | 'poolIndex'>>((button) =>
      button.pool
        ? Object.values(POOLS[button.pool]).map((_, poolIndex) => ({ key: button.key, poolIndex }))
        : [{ key: button.key, poolIndex: undefined }],
    )
    .map((button, index) => encodeButton(button.key, index, button.poolIndex));
}
