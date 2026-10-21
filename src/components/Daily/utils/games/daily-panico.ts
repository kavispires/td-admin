/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useQuery } from '@tanstack/react-query';
import { random, sampleSize, shuffle } from 'lodash';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getDayOfTheWeek, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

/**
 * Today's Panico challenge payload.
 */
export type DailyPanicoEntry = {
  /**
   * Today's daily challenge id (a date string).
   */
  id: DateKey;
  /**
   * Sequential challenge number shown to the player.
   */
  number: number;
  /**
   * Unique hash identifier for the day's game sequence.
   */
  hashId: string;
  /**
   * Discriminator for Panico payloads.
   */
  type: 'panico';
  /**
   * Encoded button sequence for the day. Each entry resolves to one timed
   * button instruction plus its pool selection.
   */
  buttons: string[];
};

/**
 * Hook for generating daily Pânico games
 *
 * Creates Latin square puzzles where players arrange items in a grid following the constraint
 * that each item appears exactly once per row and column. Weekday games use 5x5 grids,
 * weekend games use 6x6 grids.
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for group titles
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used groups
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
 * Generates Latin square puzzles with minimal revealed cells for solvability.
 * Uses recycling when data is exhausted. Weekday games use 5x5 grids, weekends use 6x6.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used groups
 * @param queryLanguage - Target language for group titles
 * @param itemsGroups - Available item groups
 * @returns Generated entries, errors, and history update
 */
export const buildDailyPanicoGames = (batchSize: number, history: ParsedDailyHistoryEntry) => {
  if (debugDailyStore.state.panico) {
    console.count('Creating Pânico...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyPanicoEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    // Build the batch
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;
      const dayOfTheWeek = getDayOfTheWeek(id);

      const numberOfButtons = [25, 25, 25, 25, 25, 25, 25];

      const partialGame = generateGameSequence(numberOfButtons[dayOfTheWeek]);

      // Track usage
      used.push(partialGame.hash);

      entries[id] = {
        id,
        number: latestNumber,
        hashId: partialGame.hash,
        type: 'panico',
        buttons: partialGame.sequence,
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.panico) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Pânico generation.');
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
 * Separator used to decode each encoded Panico button payload.
 */
const BUTTON_SEPARATOR = '::';

type ButtonDictionaryEntry = {
  /**
   * Unique key identifier of the button type
   */
  key: string;
  /**
   * The category of the button
   */
  category: 'standard' | 'trick' | 'memory' | 'logic' | 'question' | 'conditional' | 'math' | 'count';
  /**
   * Description of the button
   */
  doc: string;
  /**
   * A 3-length hash code used to track the sequence of buttons for each day
   *
   */
  hash?: string;
  /**
   * Difficulty level of the button (1-5)
   */
  level: number;
  /**
   * Number of required presses
   * -1 means that it doesn't matter how many times the button is pressed, it's always correct
   * -2 means the player must press the button the same number of times as the previous button
   */
  targetCount: number;
  /**
   * The expected action the player must take for this button to be considered correct. This is used for validation and feedback purposes.
   */
  expectedAction: 'PRESS' | 'DO_NOT_PRESS' | 'MULTI_PRESS' | 'PRESS_LESS' | 'PRESS_MORE' | 'ANY' | 'TBD';
  /**
   * When to verify if the action was correct. IMMEDIATE means the game checks as soon as the player finishes interacting with the button (e.g., after releasing it). DEFAULT means the game checks only after the full timer duration has elapsed, regardless of when the player interacts with the button.
   */
  verification: 'IMMEDIATE' | 'DEFAULT';
  /**
   * Maximum number of occurrences of this button in the sequence. Most are 1.
   */
  maxOccurrence: number;
  /**
   * Duration scale that affects the button time to complete the task
   */
  durationScale: 'quick' | 'normal' | 'long';
  /**
   * Optional array of keywords that creates conditions on other buttons.
   */
  keyword?: string; // Optional array of keywords to help players identify the button
  /**
   * Optional key of another button that must appear before this one in the sequence
   */
  dependsOn?: string;
  /**
   * Array of keys of buttons that depend on this button
   */
  dependents?: string[]; // Array of keys of buttons that depend on this button
  /**
   * Optional array of keys of other buttons that this button is mutually exclusive with (i.e., only one of them can be correct in the sequence)
   */
  eitherOr?: string[];
  /**
   * Use a specific set of data that the game randomly picks an item to use in the game
   */
  pool?: string;
  /**
   * Optional variant for styling purposes (e.g., to indicate a red button that must not be pressed)
   */
  buttonVariant?: string;
  /**
   * When a button is TBD, it needs a resolver
   */
  resolver?: 'PREVIOUS_BUTTON_PRESS_COUNT' | 'POOL_KEYWORD_MATCH' | 'POOL_KEYWORD_MATCH_REVERSE' | string;
};

const BUTTONS_LIBRARY: Record<string, ButtonDictionaryEntry> = {
  BASIC_PRESS: {
    key: 'BASIC_PRESS',
    category: 'standard',
    doc: 'Simple button that the player must press.',
    level: 1,
    targetCount: 1,
    expectedAction: 'PRESS',
    verification: 'IMMEDIATE',
    maxOccurrence: 2,
    durationScale: 'normal',
  },
  BASIC_DO_NOT_PRESS: {
    key: 'BASIC_DO_NOT_PRESS',
    category: 'standard',
    doc: 'Button that the player must NOT press.',
    level: 1,
    targetCount: 0,
    expectedAction: 'DO_NOT_PRESS',
    verification: 'DEFAULT',
    maxOccurrence: 2,
    durationScale: 'normal',
  },
  FINAL_PRESS: {
    key: 'FINAL_PRESS',
    category: 'standard',
    doc: 'The final button that the player must press at least once.',
    level: 1,
    targetCount: 0,
    expectedAction: 'PRESS_MORE',
    verification: 'DEFAULT',
    maxOccurrence: 0,
    durationScale: 'normal',
  },
  SAME_AS_PREVIOUS: {
    key: 'SAME_AS_PREVIOUS',
    category: 'memory',
    doc: 'The player must press a button the same number of times as the previous button.',
    level: 3,
    targetCount: -2,
    expectedAction: 'TBD',
    verification: 'DEFAULT',
    maxOccurrence: 2,
    durationScale: 'normal',
    resolver: 'PREVIOUS_BUTTON_PRESS_COUNT',
  },
  TRICK_POLITE_DO_NOT_PRESS: {
    key: 'TRICK_POLITE_DO_NOT_PRESS',
    category: 'trick',
    doc: 'Asks politely not to be pressed.',
    hash: 'aeb',
    level: 2,
    expectedAction: 'DO_NOT_PRESS',
    verification: 'DEFAULT',
    targetCount: 0,
    maxOccurrence: 1,
    durationScale: 'normal',
  },
  TRICK_URGENT_PRESS: {
    key: 'TRICK_URGENT_PRESS',
    category: 'trick',
    doc: 'Asks to be pressed urgently.',
    hash: 'aml',
    level: 2,
    expectedAction: 'PRESS',
    verification: 'IMMEDIATE',
    targetCount: 1,
    maxOccurrence: 1,
    durationScale: 'quick',
    eitherOr: ['QUICK_DO_NOT_PRESS'],
  },
  QUICK_DO_NOT_PRESS: {
    key: 'QUICK_DO_NOT_PRESS',
    category: 'trick',
    doc: 'Asks to quickly not press.',
    hash: 'aqp',
    level: 2,
    expectedAction: 'DO_NOT_PRESS',
    verification: 'DEFAULT',
    targetCount: 0,
    maxOccurrence: 1,
    durationScale: 'quick',
    eitherOr: ['TRICK_URGENT_PRESS'],
  },
  LOGIC_HUMAN_TRUE: {
    key: 'LOGIC_HUMAN_TRUE',
    category: 'question',
    doc: 'Asks if player is human.',
    hash: 'bfi',
    level: 1,
    expectedAction: 'PRESS',
    verification: 'IMMEDIATE',
    targetCount: 1,
    maxOccurrence: 1,
    durationScale: 'quick',
    eitherOr: ['LOGIC_HUMAN_FALSE'],
  },
  LOGIC_HUMAN_FALSE: {
    key: 'LOGIC_HUMAN_FALSE',
    category: 'question',
    doc: 'Asks if player is not human.',
    hash: 'bit',
    level: 1,
    expectedAction: 'DO_NOT_PRESS',
    verification: 'DEFAULT',
    targetCount: 0,
    maxOccurrence: 1,
    durationScale: 'quick',
    eitherOr: ['LOGIC_HUMAN_TRUE'],
  },
  LOGIC_ROBOT_TRUE: {
    key: 'LOGIC_ROBOT_TRUE',
    category: 'question',
    doc: 'Asks if player is a robot.',
    hash: 'bkv',
    level: 1,
    expectedAction: 'DO_NOT_PRESS',
    verification: 'DEFAULT',
    targetCount: 0,
    maxOccurrence: 1,
    durationScale: 'quick',
    eitherOr: ['LOGIC_ROBOT_FALSE'],
  },
  LOGIC_ROBOT_FALSE: {
    key: 'LOGIC_ROBOT_FALSE',
    category: 'question',
    doc: 'Asks if player is not a robot.',
    hash: 'bme',
    level: 1,
    expectedAction: 'PRESS',
    verification: 'IMMEDIATE',
    targetCount: 1,
    maxOccurrence: 1,
    durationScale: 'quick',
    eitherOr: ['LOGIC_ROBOT_TRUE'],
  },
  COUNT_SENTENCE: {
    key: 'COUNT_SENTENCE',
    category: 'logic',
    doc: 'Player must press the button for the number of words in the sentence',
    hash: 'caf',
    level: 3,
    expectedAction: 'MULTI_PRESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'SENTENCES_FOR_COUNTING',
  },
  PRESS_LESS: {
    key: 'PRESS_LESS',
    category: 'conditional',
    doc: 'Player must press this button less than the number of times displayed',
    hash: 'cig',
    level: 3,
    expectedAction: 'PRESS_LESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'PRESS_LESS_COMPARISON',
    eitherOr: ['PRESS_MORE'],
  },
  PRESS_MORE: {
    key: 'PRESS_MORE',
    category: 'conditional',
    doc: 'Player must press this button more than the number of times displayed',
    hash: 'cyw',
    level: 3,
    expectedAction: 'PRESS_MORE',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'PRESS_MORE_COMPARISON',
    eitherOr: ['PRESS_LESS'],
  },
  PRESS_SHAPE_SIDE: {
    key: 'PRESS_SHAPE_SIDE',
    category: 'count',
    doc: 'An shape is displayed, and press for the number of sides on the same',
    hash: 'dng',
    level: 3,
    expectedAction: 'MULTI_PRESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'SHAPES_FOR_SIDES_COUNTING',
    eitherOr: ['PRESS_SHAPE_CORNER'],
  },
  PRESS_SHAPE_CORNER: {
    key: 'PRESS_SHAPE_CORNER',
    category: 'count',
    doc: 'An shape is displayed, and press for the number of corners on the same',
    hash: 'dnv',
    level: 3,
    expectedAction: 'MULTI_PRESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'SHAPES_FOR_CORNERS_COUNTING',
    eitherOr: ['PRESS_SHAPE_SIDE'],
  },
  PRESS_TARGET_NUMBER: {
    key: 'PRESS_TARGET_NUMBER',
    category: 'math',
    doc: 'A number is displayed, and the player must press the button that many times.',
    hash: 'doa',
    level: 3,
    expectedAction: 'MULTI_PRESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'TARGET_NUMBERS_FOR_PRESSING',
  },
  PRESS_TARGET_COUNTDOWN: {
    key: 'PRESS_TARGET_COUNTDOWN',
    category: 'math',
    doc: 'A number is displayed, and the player must press the button that many times.',
    hash: 'doi',
    level: 3,
    expectedAction: 'MULTI_PRESS',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'PRESS_TARGET_COUNTDOWN_LIST',
  },
  DO_NOT_PRESS_RED_RULE: {
    key: 'DO_NOT_PRESS_RED_RULE',
    category: 'trick',
    doc: 'The button is red, but the player must not press it.',
    hash: 'dsc',
    level: 3,
    expectedAction: 'ANY',
    verification: 'DEFAULT',
    targetCount: 0,
    maxOccurrence: 1,
    durationScale: 'normal',
    keyword: 'RED',
  },
  RED_BUTTON: {
    key: 'RED_BUTTON',
    category: 'trick',
    doc: 'The button is red, but the player must not press it.',
    hash: 'dyx',
    level: 3,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: 1,
    maxOccurrence: 1,
    durationScale: 'quick',
    buttonVariant: 'RED',
    resolver: 'RED',
  },
  YELLOW_BUTTON: {
    key: 'YELLOW_BUTTON',
    category: 'trick',
    doc: 'The button is yellow, but the player must press it.',
    hash: 'eak',
    level: 1,
    expectedAction: 'PRESS',
    verification: 'IMMEDIATE',
    targetCount: 1,
    maxOccurrence: 1,
    durationScale: 'quick',
    buttonVariant: 'YELLOW',
    eitherOr: ['BLUE_BUTTON'],
  },
  BLUE_BUTTON: {
    key: 'BLUE_BUTTON',
    category: 'trick',
    doc: 'The button is blue, but the player must not press it.',
    hash: 'ehf',
    level: 1,
    expectedAction: 'DO_NOT_PRESS',
    verification: 'DEFAULT',
    targetCount: 0,
    maxOccurrence: 1,
    durationScale: 'quick',
    buttonVariant: 'BLUE',
    eitherOr: ['YELLOW_BUTTON'],
  },
  REMEMBER_NUMBER: {
    key: 'REMEMBER_NUMBER',
    category: 'memory',
    doc: 'A number is displayed, and the player must remember it to use as the target count for a later button.',
    level: 3,
    expectedAction: 'ANY',
    verification: 'DEFAULT',
    targetCount: 0,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'NUMBERS_MUST_REMEMBER',
    dependents: ['REMEMBERED_NUMBER'],
  },
  REMEMBERED_NUMBER: {
    key: 'REMEMBERED_NUMBER',
    category: 'memory',
    doc: 'If the number displayed was the one told to remember, press.',
    hash: 'etp',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'NUMBERS_MUST_REMEMBER',
    dependsOn: 'REMEMBER_NUMBER',
    resolver: 'POOL_KEYWORD_MATCH',
  },
  COUNT_VOWELS: {
    key: 'COUNT_VOWELS',
    category: 'logic',
    doc: 'Player must press the button for the number of vowels in the word displayed.',
    hash: 'ezc',
    level: 3,
    expectedAction: 'MULTI_PRESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'WORDS_FOR_VOWEL_COUNTING',
    eitherOr: ['COUNT_CONSONANTS'],
  },
  COUNT_CONSONANTS: {
    key: 'COUNT_CONSONANTS',
    category: 'logic',
    doc: 'Player must press the button for the number of consonants in the word displayed.',
    hash: 'fbc',
    level: 3,
    expectedAction: 'MULTI_PRESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'WORDS_FOR_CONSONANT_COUNTING',
    eitherOr: ['COUNT_VOWELS'],
  },
  EQUATION_RESULT: {
    key: 'EQUATION_RESULT',
    category: 'math',
    doc: 'An equation is displayed, and the player must solve it and press the button the number of times corresponding to the result.',
    hash: 'fgx',
    level: 3,
    expectedAction: 'MULTI_PRESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'EQUATIONS_TO_SOLVE',
  },
  ALL_ODD_NUMBERS: {
    key: 'ALL_ODD_NUMBERS',
    category: 'trick',
    doc: 'All numbers displayed are odd, but the player must press only for the even ones.',
    hash: 'fwq',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'ALL_ODD_NUMBERS',
    eitherOr: ['ALL_EVEN_NUMBERS'],
  },
  ALL_EVEN_NUMBERS: {
    key: 'ALL_EVEN_NUMBERS',
    category: 'trick',
    doc: 'All numbers displayed are even, but the player must press only for the odd ones.',
    hash: 'fyy',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'ALL_EVEN_NUMBERS',
    eitherOr: ['ALL_ODD_NUMBERS'],
  },
  WHEN_YOU_SEE_RULE: {
    key: 'WHEN_YOU_SEE_RULE',
    category: 'trick',
    doc: 'In the future, when an icon appears, the player must press.',
    level: 4,
    expectedAction: 'ANY',
    verification: 'DEFAULT',
    targetCount: -1,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'THINGS_TO_SEE',
    dependents: [
      'SEE_SOMETHING_PRESS',
      'SEE_SOMETHING_PRESS_TRICK',
      'SEE_SOMETHING_PRESS_ASIDE',
      'SPINNING_ICONS',
    ],
  },
  SEE_SOMETHING_PRESS: {
    key: 'SEE_SOMETHING_PRESS',
    category: 'trick',
    doc: 'An icon is displayed, and if the player has seen it before, they must press.',
    hash: 'gan',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'THINGS_TO_SEE',
    dependsOn: 'WHEN_YOU_SEE_RULE',
    eitherOr: ['SEE_SOMETHING_PRESS_TRICK'],
    resolver: 'POOL_KEYWORD_MATCH',
  },
  SEE_SOMETHING_PRESS_TRICK: {
    key: 'SEE_SOMETHING_PRESS_TRICK',
    category: 'trick',
    doc: 'An icon is displayed, but it says do not press, and if the player has seen it before, they must press.',
    hash: 'gdl',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'THINGS_TO_SEE',
    dependsOn: 'WHEN_YOU_SEE_RULE',
    eitherOr: ['SEE_SOMETHING_PRESS'],
    resolver: 'POOL_KEYWORD_MATCH',
  },
  SEE_SOMETHING_PRESS_ASIDE: {
    key: 'SEE_SOMETHING_PRESS_ASIDE',
    category: 'trick',
    doc: 'An icon is displayed aside from the button, and if the player has seen it before, they must press.',
    hash: 'ght',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'THINGS_TO_SEE',
    dependsOn: 'WHEN_YOU_SEE_RULE',
    eitherOr: ['SEE_SOMETHING_PRESS_ASIDE_TRICK'],
    resolver: 'POOL_KEYWORD_MATCH',
  },
  WHEN_YOU_SEE_RULE_AVOID: {
    key: 'WHEN_YOU_SEE_RULE_AVOID',
    category: 'trick',
    doc: 'In the future, when an icon appears, the player must not press.',
    level: 4,
    expectedAction: 'ANY',
    verification: 'DEFAULT',
    targetCount: -1,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'THINGS_TO_AVOID',
    eitherOr: ['WHEN_YOU_SEE_RULE'],
    dependents: ['SEE_SOMETHING_PRESS_AVOID'],
  },
  SEE_SOMETHING_PRESS_AVOID: {
    key: 'SEE_SOMETHING_PRESS_AVOID',
    category: 'trick',
    doc: 'An icon is displayed, and if the player has seen it before, they must press.',
    hash: 'gmn',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'THINGS_TO_AVOID',
    dependsOn: 'WHEN_YOU_SEE_RULE_AVOID',
    resolver: 'POOL_KEYWORD_MATCH_REVERSE',
  },
  SEE_AND_COUNT: {
    key: 'SEE_AND_COUNT',
    category: 'trick',
    doc: 'An icon is displayed, and the player must press for the number of times they have seen it before.',
    hash: 'gti',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'THINGS_TO_COUNT',
  },
  REMEMBER_SEQUENCE: {
    key: 'REMEMBER_SEQUENCE',
    category: 'memory',
    doc: 'Player is shown a sequence of items and must remember the order.',
    level: 3,
    expectedAction: 'ANY',
    verification: 'DEFAULT',
    targetCount: -1,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'SEQUENCES_TO_REMEMBER',
    dependents: ['REMEMBERED_SEQUENCE'],
  },
  REMEMBERED_SEQUENCE: {
    key: 'REMEMBERED_SEQUENCE',
    category: 'memory',
    doc: 'Player must recall the sequence of items they were shown.',
    hash: 'gvf',
    level: 5,
    expectedAction: 'ANY',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'SEQUENCES_TO_REMEMBER',
    dependsOn: 'REMEMBER_SEQUENCE',
    resolver: 'POOL_KEYWORD_MATCH',
  },
  RANDOM_QUESTION: {
    key: 'RANDOM_QUESTION',
    category: 'question',
    doc: 'A random question is displayed, and the player must answer it correctly by pressing or not pressing the button.',
    hash: 'hio',
    level: 2,
    expectedAction: 'ANY',
    verification: 'IMMEDIATE',
    targetCount: -1,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'RANDOM_QUESTIONS',
  },
  PRESS_IF_WANTED: {
    key: 'PRESS_IF_WANTED',
    category: 'conditional',
    doc: 'Player can choose to press or not press the button, but if they choose to press, they must press it the number of times displayed.',
    hash: 'hkd',
    level: 2,
    expectedAction: 'ANY',
    verification: 'DEFAULT',
    targetCount: -1,
    maxOccurrence: 1,
    durationScale: 'normal',
  },
  ICON_COMPARISON: {
    key: 'ICON_COMPARISON',
    category: 'logic',
    doc: 'There is a sequence of icons and the player must press or not depending the value is more than the other.',
    hash: 'hyt',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'ICON_COMPARISONS',
  },
  MISSING_NUMBER: {
    key: 'MISSING_NUMBER',
    category: 'math',
    doc: 'A number sequence with a missing number is displayed. Press for the missing value.',
    hash: 'irb',
    level: 3,
    expectedAction: 'TBD',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'MISSING_NUMBERS_SEQUENCES',
  },
  COUNT_SPECIFIC_LETTER: {
    key: 'COUNT_SPECIFIC_LETTER',
    category: 'count',
    doc: 'Player must count occurrences of a specific letter in a string.',
    hash: 'iys',
    level: 4,
    expectedAction: 'TBD',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'LETTER_SEARCH_STRINGS',
  },
  ALPHABET_POSITION: {
    key: 'ALPHABET_POSITION',
    category: 'logic',
    doc: 'A single letter is displayed. The player must press for its position in the alphabet (e.g., A=1, B=2).',
    hash: 'jba',
    level: 4,
    expectedAction: 'TBD',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'ALPHABET_POSITIONS',
  },
  ROMAN_NUMERALS: {
    key: 'ROMAN_NUMERALS',
    category: 'math',
    doc: 'A Roman numeral is displayed. The player must press the equivalent number of times.',
    hash: 'jej',
    level: 3,
    expectedAction: 'TBD',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'ROMAN_NUMERALS_POOL',
  },
  COUNT_ANIMAL_LEGS: {
    key: 'COUNT_ANIMAL_LEGS',
    category: 'count',
    doc: 'Animal emojis are displayed. The player must press for the total number of legs those animals have.',
    hash: 'jgo',
    level: 4,
    expectedAction: 'MULTI_PRESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'ANIMAL_LEGS',
  },
  NUMBER_RIDDLE: {
    key: 'NUMBER_RIDDLE',
    category: 'question',
    doc: 'A short riddle or trivia question is displayed where the answer is a number. Press that many times.',
    hash: 'jvw',
    level: 3,
    expectedAction: 'MULTI_PRESS',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'NUMBER_RIDDLES',
  },
  LONG_INSTRUCTION: {
    key: 'LONG_INSTRUCTION',
    category: 'trick',
    doc: 'A long instruction is displayed, and the player must read it carefully but in the end it just says if it should press it or not.',
    hash: 'jxd',
    level: 3,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'long',
    pool: 'LONG_INSTRUCTIONS',
  },
  SPINNING_ICONS: {
    key: 'SPINNING_ICONS',
    category: 'trick',
    doc: 'An animated icon is displayed, only press if one matches the dependency rule.',
    hash: 'kcd',
    level: 2,
    expectedAction: 'TBD',
    verification: 'DEFAULT',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'quick',
    pool: 'THINGS_TO_SEE',
    dependsOn: 'WHEN_YOU_SEE_RULE',
    resolver: 'POOL_KEYWORD_MATCH',
  },
  COLOR_GRID: {
    key: 'COLOR_GRID',
    category: 'count',
    doc: 'Check if all icons are the same color.',
    hash: 'kdc',
    level: 2,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -1,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'THINGS_COLOR_GRID',
  },
  ALL_SAME_RULE: {
    key: 'ALL_SAME_RULE',
    category: 'trick',
    doc: 'In the future, if all items displayed are the same, press the button.',
    level: 5,
    expectedAction: 'ANY',
    verification: 'DEFAULT',
    targetCount: -1,
    maxOccurrence: 1,
    durationScale: 'normal',
    dependents: ['SEE_SAME_THINGS_PRESS'],
  },
  SEE_SAME_THINGS_PRESS: {
    key: 'SEE_SAME_THINGS_PRESS',
    category: 'trick',
    doc: 'A set of items is displayed, and if the player has seen the exact same set before, they must press.',
    hash: 'kea',
    level: 5,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'quick',
    pool: 'SAME_THINGS_LIST',
    dependsOn: 'ALL_SAME_RULE',
  },
  COLOR_WORD_RULE: {
    key: 'COLOR_WORD_RULE',
    category: 'trick',
    doc: 'In the future, if the button text label matches the color, press the button.',
    level: 4,
    expectedAction: 'ANY',
    verification: 'DEFAULT',
    targetCount: -1,
    maxOccurrence: 1,
    durationScale: 'normal',
    dependents: ['COLOR_WORD'],
  },
  COLOR_WORD: {
    key: 'COLOR_WORD',
    category: 'trick',
    doc: 'A colored button label with a color name',
    hash: 'khh',
    level: 4,
    expectedAction: 'TBD',
    verification: 'IMMEDIATE',
    targetCount: -2,
    maxOccurrence: 1,
    durationScale: 'normal',
    pool: 'COLOR_WORDS',
    dependsOn: 'COLOR_WORD_RULE',
  },
};

const shuffleAndInsert = (array: string[], decoys: string[] = []): string[] => {
  const shuffle = (arr: string[]) => arr.sort(() => Math.random() - 0.5);
  const shuffled = shuffle([...array]);
  const randomIndex = Math.floor(Math.random() * (shuffled.length + 1));

  if (decoys.length === 0) {
    return shuffled;
  }

  const shuffledDecoys = shuffle([...decoys]);
  return shuffle([...shuffled.slice(0, randomIndex), shuffledDecoys[0], ...shuffled.slice(randomIndex + 1)]);
};

/**
 * Runtime-resolved entry from one of Panico's content pools.
 */
type PoolGroupEntry<T extends Record<string, unknown> = Record<string, unknown>> = {
  /**
   * Unique pool entry identifier.
   */
  id: string;
  /**
   * Press target attached to this pool entry.
   */
  targetCount: number;
} & T;

const SENTENCES_FOR_COUNTING: Dictionary<PoolGroupEntry<{ text: DualLanguageValue }>> = {
  SENTENCE_1: {
    id: 'SENTENCE_1',
    text: {
      en: 'Press once for each word in this sentence.',
      pt: 'Aperte uma vez para cada palavra nesta frase.',
    },
    targetCount: 8,
  },
  SENTENCE_2: {
    id: 'SENTENCE_2',
    text: {
      en: 'This sentence has exactly 10 words, but press 7 times.',
      pt: 'Esta frase tem exatamente 10 palavras, mas aperte 7 vezes.',
    },
    targetCount: 7,
  },
  SENTENCE_3: {
    id: 'SENTENCE_3',
    text: {
      en: 'This sentence has exactly six words. Press the button six times.',
      pt: 'Esta frase tem exatamente seis palavras. Aperte o botão seis vezes.',
    },
    targetCount: 6,
  },
  SENTENCE_4: {
    id: 'SENTENCE_4',
    text: {
      en: 'Press once for each word in this sentence, ok?',
      pt: 'Aperte uma vez para cada palavra nesta frase, ok?',
    },
    targetCount: 9,
  },
};

const PRESS_LESS_COMPARISON: Dictionary<PoolGroupEntry> = {
  PRESS_LESS_THAN_2: {
    id: 'PRESS_LESS_THAN_2',
    targetCount: 2,
  },
  PRESS_LESS_THAN_3: {
    id: 'PRESS_LESS_THAN_3',
    targetCount: 3,
  },
  PRESS_LESS_THAN_4: {
    id: 'PRESS_LESS_THAN_4',
    targetCount: 4,
  },
  PRESS_LESS_THAN_5: {
    id: 'PRESS_LESS_THAN_5',
    targetCount: 5,
  },
};

const PRESS_MORE_COMPARISON: Dictionary<PoolGroupEntry> = {
  PRESS_MORE_THAN_2: {
    id: 'PRESS_MORE_THAN_2',
    targetCount: 2,
  },
  PRESS_MORE_THAN_3: {
    id: 'PRESS_MORE_THAN_3',
    targetCount: 3,
  },
  PRESS_MORE_THAN_4: {
    id: 'PRESS_MORE_THAN_4',
    targetCount: 4,
  },
  PRESS_MORE_THAN_5: {
    id: 'PRESS_MORE_THAN_5',
    targetCount: 5,
  },
};

const SHAPES_FOR_SIDES_COUNTING: Dictionary<PoolGroupEntry> = {
  SHAPE_TRIANGLE: {
    id: 'SHAPE_TRIANGLE',
    itemId: 'item-2115',
    targetCount: 3,
  },
  SHAPE_CUBE: {
    id: 'SHAPE_CUBE',
    itemId: 'item-2117',
    targetCount: 6,
  },
  SHAPE_RECTANGLE: {
    id: 'SHAPE_RECTANGLE',
    itemId: 'item-2121',
    targetCount: 4,
  },
  SHAPE_HEXAGON: {
    id: 'SHAPE_HEXAGON',
    itemId: 'item-2119',
    targetCount: 6,
  },
};

const SHAPES_FOR_CORNERS_COUNTING: Dictionary<PoolGroupEntry<{ itemId: string }>> = {
  SHAPE_TRIANGLE: {
    id: 'SHAPE_TRIANGLE',
    itemId: 'item-2115',
    targetCount: 3,
  },
  SHAPE_SQUARE: {
    id: 'SHAPE_SQUARE',
    itemId: 'item-2114',
    targetCount: 4,
  },
  SHAPE_RHOMBUS: {
    id: 'SHAPE_RHOMBUS',
    itemId: 'item-2122',
    targetCount: 4,
  },
  SHAPE_HEXAGON: {
    id: 'SHAPE_HEXAGON',
    itemId: 'item-2119',
    targetCount: 6,
  },
};

const TARGET_NUMBERS_FOR_PRESSING: Dictionary<PoolGroupEntry<{ text: DualLanguageValue }>> = {
  NUMBER_1: {
    id: 'NUMBER_1',
    targetCount: 1,
    text: {
      en: 'Press exactly once',
      pt: 'Aperte exatamente uma vez',
    },
  },
  NUMBER_2: {
    id: 'NUMBER_2',
    targetCount: 2,
    text: {
      en: 'Press exactly twice',
      pt: 'Aperte exatamente duas vezes',
    },
  },
  NUMBER_3: {
    id: 'NUMBER_3',
    targetCount: 3,
    text: {
      en: 'Press exactly three times',
      pt: 'Aperte exatamente três vezes',
    },
  },
  NUMBER_5: {
    id: 'NUMBER_5',
    targetCount: 5,
    text: {
      en: 'Press exactly five times',
      pt: 'Aperte exatamente cinco vezes',
    },
  },
  NUMBER_6: {
    id: 'NUMBER_6',
    targetCount: 6,
    text: {
      en: 'Press exactly six times',
      pt: 'Aperte exatamente seis vezes',
    },
  },
};

const PRESS_TARGET_COUNTDOWN_LIST: Dictionary<PoolGroupEntry> = {
  NUMBER_5: {
    id: 'NUMBER_5',
    targetCount: 5,
  },
  NUMBER_6: {
    id: 'NUMBER_6',
    targetCount: 6,
  },
  NUMBER_7: {
    id: 'NUMBER_7',
    targetCount: 7,
  },
  NUMBER_8: {
    id: 'NUMBER_8',
    targetCount: 8,
  },
  NUMBER_10: {
    id: 'NUMBER_10',
    targetCount: 10,
  },
};

const NUMBERS_MUST_REMEMBER: Dictionary<PoolGroupEntry> = {
  NUMBER_TO_REMEMBER_1: {
    id: 'NUMBER_TO_REMEMBER_1',
    targetCount: -1,
    value: '42',
    keyword: '42',
  },
  NUMBER_TO_REMEMBER_2: {
    id: 'NUMBER_TO_REMEMBER_2',
    targetCount: -1,
    value: '17',
    keyword: '17',
  },
  NUMBER_TO_REMEMBER_3: {
    id: 'NUMBER_TO_REMEMBER_3',
    targetCount: -1,
    value: '68',
    keyword: '68',
  },
  NUMBER_TO_REMEMBER_4: {
    id: 'NUMBER_TO_REMEMBER_4',
    targetCount: -1,
    value: '73',
    keyword: '73',
  },
};

const WORDS_FOR_VOWEL_COUNTING: Dictionary<PoolGroupEntry<{ value: string }>> = {
  VOWEL_WORD_1: {
    id: 'VOWEL_WORD_1',
    targetCount: 5,
    value: 'AEIOU',
  },
  VOWEL_WORD_2: {
    id: 'VOWEL_WORD_2',
    targetCount: 3,
    value: 'BANANA',
  },
  VOWEL_WORD_3: {
    id: 'VOWEL_WORD_3',
    targetCount: 2,
    value: 'PODCAST',
  },
  VOWEL_WORD_4: {
    id: 'VOWEL_WORD_4',
    targetCount: 7,
    value: 'PARALELEPÍPEDO',
  },
};

const WORDS_FOR_CONSONANT_COUNTING: Dictionary<PoolGroupEntry<{ value: string }>> = {
  CONSONANT_WORD_1: {
    id: 'CONSONANT_WORD_1',
    targetCount: 0,
    value: 'AEIOU',
  },
  CONSONANT_WORD_2: {
    id: 'CONSONANT_WORD_2',
    targetCount: 3,
    value: 'BANANA',
  },
  CONSONANT_WORD_3: {
    id: 'CONSONANT_WORD_3',
    targetCount: 5,
    value: 'PODCAST',
  },
  CONSONANT_WORD_4: {
    id: 'CONSONANT_WORD_4',
    targetCount: 7,
    value: 'PARALELEPÍPEDO',
  },
};

const EQUATIONS_TO_SOLVE: Dictionary<PoolGroupEntry<{ value: string }>> = {
  EQUATION_1: {
    id: 'EQUATION_1',
    targetCount: 5,
    value: '2 + 3',
  },
  EQUATION_2: {
    id: 'EQUATION_2',
    targetCount: 4,
    value: '10 - 6',
  },
  EQUATION_3: {
    id: 'EQUATION_3',
    targetCount: 6,
    value: '2 × 3',
  },
  EQUATION_4: {
    id: 'EQUATION_4',
    targetCount: 4,
    value: '8 ÷ 2',
  },
  EQUATION_5: {
    id: 'EQUATION_5',
    targetCount: 4,
    value: '3 + 2 - 1',
  },
  EQUATION_6: {
    id: 'EQUATION_6',
    targetCount: 4,
    value: '2 × (1 + 1)',
  },
  EQUATION_7: {
    id: 'EQUATION_7',
    targetCount: 3,
    value: '1 + 1 + 1 - 1 + 1',
  },
};

const ALL_ODD_NUMBERS: Dictionary<PoolGroupEntry<{ value: string }>> = {
  ALL_ODD_1: {
    id: 'ALL_ODD_1',
    targetCount: 0,
    value: '1, 1, 1, 0, 1',
  },
  ALL_ODD_2: {
    id: 'ALL_ODD_2',
    targetCount: 1,
    value: '3, 19, 17, 9, 11',
  },
  ALL_ODD_3: {
    id: 'ALL_ODD_3',
    targetCount: 0,
    value: '5, 7, 1312, 15, 9',
  },
  ALL_ODD_4: {
    id: 'ALL_ODD_4',
    targetCount: 1,
    value: '33, 55, 77, 99, 101',
  },
};

const ALL_EVEN_NUMBERS: Dictionary<PoolGroupEntry<{ value: string }>> = {
  ALL_EVEN_1: {
    id: 'ALL_EVEN_1',
    targetCount: 1,
    value: '2, 4, 8, 16',
  },
  ALL_EVEN_2: {
    id: 'ALL_EVEN_2',
    targetCount: 1,
    value: '8, 12, 28, 16',
  },
  ALL_EVEN_3: {
    id: 'ALL_EVEN_3',
    targetCount: 0,
    value: '6, 4, 1, 10',
  },
  ALL_EVEN_4: {
    id: 'ALL_EVEN_4',
    targetCount: 0,
    value: '14, 22, 443, 4',
  },
};

const DECOY_ITEMS = [
  'item-0',
  'item-8',
  'item-57',
  'item-301',
  'item-155',
  'item-469',
  'item-2273',
  'item-723',
  'item-1220',
];

const THINGS_TO_SEE: Dictionary<
  PoolGroupEntry<{
    itemId: string;
    keyword: string;
    value: string;
    decoyItemsIds: string[];
  }>
> = {
  THING_TO_SEE_1: {
    id: 'THING_TO_SEE_1',
    targetCount: -1,
    itemId: 'item-470',
    keyword: 'SEE_PINWHEEL',
    value: 'SEE_PINWHEEL',
    decoyItemsIds: shuffleAndInsert(DECOY_ITEMS, ['item-470']),
  },
  THING_TO_SEE_2: {
    id: 'THING_TO_SEE_2',
    targetCount: -1,
    itemId: 'item-390',
    keyword: 'SEE_KITE',
    value: 'SEE_KITE',
    decoyItemsIds: shuffleAndInsert(DECOY_ITEMS, ['item-390']),
  },
  THING_TO_SEE_4: {
    id: 'THING_TO_SEE_4',
    targetCount: -1,
    itemId: 'item-1575',
    keyword: 'SEE_RAINBOW',
    value: 'SEE_RAINBOW',
    decoyItemsIds: shuffleAndInsert(DECOY_ITEMS, ['item-1575']),
  },
};

const BLUE_THINGS = [
  'item-207',
  'item-1948',
  'item-2372',
  'item-2417',
  'item-2140',
  'item-840',
  'item-299',
  'item-197',
  'item-1372',
];
const RED_THINGS = [
  'item-13',
  'item-548',
  'item-548',
  'item-1988',
  'item-2287',
  'item-1757',
  'item-1898',
  'item-1432',
  'item-812',
];

const THINGS_COLOR_GRID: Dictionary<PoolGroupEntry<{ itemsIds: string[] }>> = {
  THINGS_COLOR_GRID_BLUE_TRUE: {
    id: 'THINGS_COLOR_GRID_BLUE_TRUE',
    targetCount: 1,
    itemsIds: shuffleAndInsert(BLUE_THINGS),
  },
  THINGS_COLOR_GRID_BLUE_FALSE: {
    id: 'THINGS_COLOR_GRID_BLUE_FALSE',
    targetCount: 0,
    itemsIds: shuffleAndInsert(BLUE_THINGS, RED_THINGS),
  },
  THINGS_COLOR_GRID_BLUE_TRUE_B: {
    id: 'THINGS_COLOR_GRID_BLUE_TRUE_B',
    targetCount: 1,
    itemsIds: shuffleAndInsert(RED_THINGS),
  },
  THINGS_COLOR_GRID_BLUE_FALSE_B: {
    id: 'THINGS_COLOR_GRID_BLUE_FALSE_B',
    targetCount: 0,
    itemsIds: shuffleAndInsert(RED_THINGS, BLUE_THINGS),
  },
};

const CROCODILE_SPRITE = Array(30).fill('good-32'); // Crocodile sprite ID
const FROG_SPRITE = Array(30).fill('good-50'); // Frog sprite ID

const SAME_THINGS_LIST: Dictionary<PoolGroupEntry<{ goodsIds: string[] }>> = {
  SAME_THINGS_LIST_1: {
    id: 'SAME_THINGS_LIST_1',
    targetCount: -1,
    goodsIds: shuffleAndInsert(CROCODILE_SPRITE, ['good-50']),
  },
  SAME_THINGS_LIST_2: {
    id: 'SAME_THINGS_LIST_2',
    targetCount: 1,
    goodsIds: CROCODILE_SPRITE,
  },
  SAME_THINGS_LIST_3: {
    id: 'SAME_THINGS_LIST_3',
    targetCount: 0,
    goodsIds: shuffleAndInsert(FROG_SPRITE, ['good-32']),
  },
  SAME_THINGS_LIST_4: {
    id: 'SAME_THINGS_LIST_4',
    targetCount: 1,
    goodsIds: FROG_SPRITE,
  },
};

const THINGS_TO_AVOID: Dictionary<PoolGroupEntry<{ itemId: string; keyword: string; value: string }>> = {
  THING_TO_AVOID_1: {
    id: 'THING_TO_AVOID_1',
    targetCount: -1,
    itemId: 'item-135',
    keyword: 'SEE_COCKROACH',
    value: 'SEE_COCKROACH',
  },
  THING_TO_AVOID_2: {
    id: 'THING_TO_AVOID_2',
    targetCount: -1,
    itemId: 'item-304',
    keyword: 'SEE_DYNAMITE',
    value: 'SEE_DYNAMITE',
  },
  THING_TO_AVOID_3: {
    id: 'THING_TO_AVOID_3',
    targetCount: -1,
    itemId: 'item-276',
    keyword: 'AVOID_GHOST',
    value: 'AVOID_GHOST',
  },
};

const THINGS_TO_COUNT: Dictionary<PoolGroupEntry<{ itemId: string }>> = {
  THING_TO_COUNT_1: {
    id: 'THING_TO_COUNT_1',
    targetCount: 3,
    itemId: 'item-14', // strawberry
  },
  THING_TO_COUNT_2: {
    id: 'THING_TO_COUNT_2',
    targetCount: 4,
    itemId: 'item-621', // orange
  },
  THING_TO_COUNT_3: {
    id: 'THING_TO_COUNT_3',
    targetCount: 5,
    itemId: 'item-1858', // apple
  },
  THING_TO_COUNT_4: {
    id: 'THING_TO_COUNT_4',
    targetCount: 3,
    itemId: 'item-14', // strawberry
  },
  THING_TO_COUNT_5: {
    id: 'THING_TO_COUNT_5',
    targetCount: 2,
    itemId: 'item-621', // orange
  },
  THING_TO_COUNT_6: {
    id: 'THING_TO_COUNT_6',
    targetCount: 3,
    itemId: 'item-1858', // apple
  },
};

const SEQUENCES_TO_REMEMBER: Dictionary<
  PoolGroupEntry<{ value: string; keyword: string; itemsIds: string[] }>
> = {
  THING_SEQUENCE_1: {
    id: 'THING_SEQUENCE_1',
    targetCount: -1,
    value: 'MOON_MOON_SUN_MOON_SUN',
    keyword: 'MOON_MOON_SUN_MOON_SUN',
    itemsIds: ['item-1059', 'item-1059', 'item-1054', 'item-1059', 'item-1054'],
  },
  THING_SEQUENCE_2: {
    id: 'THING_SEQUENCE_2',
    targetCount: -1,
    value: 'MOON_SUN_SUN_MOON_MOON',
    keyword: 'MOON_SUN_SUN_MOON_MOON',
    itemsIds: ['item-1059', 'item-1054', 'item-1054', 'item-1059', 'item-1059'],
  },
  THING_SEQUENCE_3: {
    id: 'THING_SEQUENCE_3',
    targetCount: -1,
    value: 'SUN_SUN_MOON_SUN_MOON',
    keyword: 'SUN_SUN_MOON_SUN_MOON',
    itemsIds: ['item-1054', 'item-1054', 'item-1059', 'item-1054', 'item-1059'],
  },
  THING_SEQUENCE_4: {
    id: 'THING_SEQUENCE_4',
    targetCount: -1,
    value: 'SUN_MOON_SUN_MOON_SUN',
    keyword: 'SUN_MOON_SUN_MOON_SUN',
    itemsIds: ['item-1054', 'item-1059', 'item-1054', 'item-1059', 'item-1054'],
  },
  THING_SEQUENCE_5: {
    id: 'THING_SEQUENCE_5',
    targetCount: -1,
    value: 'MOON_MOON_MOON_SUN_SUN',
    keyword: 'MOON_MOON_MOON_SUN_SUN',
    itemsIds: ['item-1059', 'item-1059', 'item-1059', 'item-1054', 'item-1054'],
  },
};

const RANDOM_QUESTIONS: Dictionary<PoolGroupEntry<{ text: DualLanguageValue }>> = {
  RANDOM_QUESTION_1: {
    id: 'RANDOM_QUESTION_1',
    targetCount: -1,
    text: {
      en: 'Press if you think you are beautiful',
      pt: 'Pressione se você acha que é bonito',
    },
  },
  RANDOM_QUESTION_2: {
    id: 'RANDOM_QUESTION_2',
    targetCount: -1,
    text: {
      en: "Press if you think it's gonna rain tomorrow",
      pt: 'Pressione se você acha que vai chover amanhã',
    },
  },
  RANDOM_QUESTION_3: {
    id: 'RANDOM_QUESTION_3',
    targetCount: -1,
    text: {
      en: 'Press if you think water is wet',
      pt: 'Pressione se você acha que a água é molhada',
    },
  },
  RANDOM_QUESTION_4: {
    id: 'RANDOM_QUESTION_4',
    targetCount: -1,
    text: {
      en: "Press if you think you're smart",
      pt: 'Pressione se você acha que é inteligente',
    },
  },
};

const ICON_COMPARISONS: Dictionary<
  PoolGroupEntry<{
    more: DualLanguageValue;
    less: DualLanguageValue;
    itemsIds: string[];
  }>
> = {
  COMPARISON_1: {
    id: 'COMPARISON_1',
    targetCount: 0,
    more: {
      en: 'truffles',
      pt: 'brigadeiros',
    },
    less: {
      en: 'jellybeans',
      pt: 'jujubas',
    },
    itemsIds: ['item-837', 'item-837', 'item-1723'],
  },
  COMPARISON_2: {
    id: 'COMPARISON_2',
    targetCount: 0,
    more: {
      en: 'truffles',
      pt: 'brigadeiros',
    },
    less: {
      en: 'jellybeans',
      pt: 'jujubas',
    },
    itemsIds: ['item-837', 'item-837', 'item-837', 'item-1723'],
  },
  COMPARISON_3: {
    id: 'COMPARISON_3',
    targetCount: 1,
    more: {
      en: 'truffles',
      pt: 'brigadeiros',
    },
    less: {
      en: 'jellybeans',
      pt: 'jujubas',
    },
    itemsIds: ['item-837', 'item-1723', 'item-837', 'item-837', 'item-837'],
  },
  COMPARISON_4: {
    id: 'COMPARISON_4',
    targetCount: 0,
    more: {
      en: 'jellybeans',
      pt: 'jujubas',
    },
    less: {
      en: 'truffles',
      pt: 'brigadeiros',
    },
    itemsIds: ['item-837', 'item-1723', 'item-837', 'item-837', 'item-837'],
  },
  COMPARISON_5: {
    id: 'COMPARISON_5',
    targetCount: 1,
    more: {
      en: 'jellybeans',
      pt: 'jujubas',
    },
    less: {
      en: 'truffles',
      pt: 'brigadeiros',
    },
    itemsIds: ['item-837', 'item-1723', 'item-837'],
  },
};

const MISSING_NUMBERS_SEQUENCES: Dictionary<PoolGroupEntry<{ value: string }>> = {
  SEQ_1: {
    id: 'SEQ_1',
    targetCount: 6,
    value: '2, 4, ?, 8, 10',
  },
  SEQ_2: {
    id: 'SEQ_2',
    targetCount: 5,
    value: '15, 10, ?, 0',
  },
  SEQ_3: {
    id: 'SEQ_3',
    targetCount: 4,
    value: '1, 2, 3, ?, 5',
  },
  SEQ_4: {
    id: 'SEQ_4',
    targetCount: 3,
    value: '12, 9, 6, ?',
  },
};

const LETTER_SEARCH_STRINGS: Dictionary<PoolGroupEntry<{ letter: string; value: string }>> = {
  SEARCH_1: {
    id: 'SEARCH_1',
    targetCount: 4,
    letter: 'B',
    value: 'A B B C D B E B',
  },
  SEARCH_2: {
    id: 'SEARCH_2',
    targetCount: 2,
    letter: 'A',
    value: 'A B C D a B E B',
  },
  SEARCH_3: {
    id: 'SEARCH_3',
    targetCount: 3,
    letter: 'B',
    value: 'A B C D A b E B',
  },
  SEARCH_4: {
    id: 'SEARCH_4',
    targetCount: 0,
    letter: 'A',
    value: 'B C D F G E B C',
  },
};

const ALPHABET_POSITIONS: Dictionary<PoolGroupEntry<{ value: string }>> = {
  ALPHA_C: {
    id: 'ALPHA_C',
    targetCount: 3,
    value: 'C',
  },
  ALPHA_E: {
    id: 'ALPHA_E',
    targetCount: 5,
    value: 'E',
  },
  ALPHA_B: {
    id: 'ALPHA_B',
    targetCount: 2,
    value: 'B',
  },
  ALPHA_D: {
    id: 'ALPHA_D',
    targetCount: 4,
    value: 'D',
  },
};

const ROMAN_NUMERALS_POOL: Dictionary<PoolGroupEntry<{ value: string }>> = {
  ROMAN_3: {
    id: 'ROMAN_3',
    targetCount: 3,
    value: 'III',
  },
  ROMAN_4: {
    id: 'ROMAN_4',
    targetCount: 4,
    value: 'IV',
  },
  ROMAN_5: {
    id: 'ROMAN_5',
    targetCount: 5,
    value: 'V',
  },
  ROMAN_6: {
    id: 'ROMAN_6',
    targetCount: 6,
    value: 'VI',
  },
};

const ANIMAL_LEGS: Dictionary<PoolGroupEntry<{ itemsIds: string[] }>> = {
  LEGS_1: {
    id: 'LEGS_1',
    targetCount: 6,
    itemsIds: ['item-148', 'item-1205'], // Dog (4) + Duck (2)
  },
  LEGS_2: {
    id: 'LEGS_2',
    targetCount: 8,
    itemsIds: ['item-153', 'item-1079'], // Spider (8) + Worm (0)
  },
  LEGS_3: {
    id: 'LEGS_3',
    targetCount: 5,
    itemsIds: ['item-162', 'item-2157'], // cat (4) + pirate leg (1)
  },
  LEGS_4: {
    id: 'LEGS_4',
    targetCount: 0,
    itemsIds: ['item-1079', 'item-16'], // Worm (0) + Fish (0)
  },
};

const NUMBER_RIDDLES: Dictionary<PoolGroupEntry<{ text: DualLanguageValue }>> = {
  RIDDLE_1: {
    id: 'RIDDLE_1',
    targetCount: 8,
    text: {
      en: 'the sides on a stop sign',
      pt: 'os lados de uma placa de pare',
    },
  },
  RIDDLE_2: {
    id: 'RIDDLE_2',
    targetCount: 7,
    text: {
      en: 'the colors in a rainbow',
      pt: 'as cores em um arco-íris',
    },
  },
  RIDDLE_3: {
    id: 'RIDDLE_3',
    targetCount: 3,
    text: {
      en: 'the wheels on a tricycle',
      pt: 'as rodas de um triciclo',
    },
  },
  RIDDLE_4: {
    id: 'RIDDLE_4',
    targetCount: 5,
    text: {
      en: 'the fingers on one hand',
      pt: 'os dedos em uma mão',
    },
  },
};

const LONG_INSTRUCTIONS: Dictionary<PoolGroupEntry<{ text: DualLanguageValue }>> = {
  LONG_INSTRUCTION_1: {
    id: 'LONG_INSTRUCTION_1',
    targetCount: 1,
    text: {
      en: 'This is a long instruction that might be trying to trick you. It has a lot of words and details, but in the end, you should just press the button once.',
      pt: 'Esta é uma instrução longa que pode estar tentando te enganar. Ela tem muitas palavras e detalhes, mas no final, você deve apenas pressionar o botão uma vez.',
    },
  },
  LONG_INSTRUCTION_2: {
    id: 'LONG_INSTRUCTION_2',
    targetCount: 1,
    text: {
      en: "Don't be fooled by this long instruction. It's designed to make you overthink. Just press the button and ignore the rest.",
      pt: 'Não se deixe enganar por esta instrução longa. Ela é projetada para te fazer pensar demais. Apenas pressione o botão e ignore o resto.',
    },
  },
  LONG_INSTRUCTION_3: {
    id: 'LONG_INSTRUCTION_3',
    targetCount: 0,
    text: {
      en: "This instruction is very long and full of details, but it's actually a trick. You should not press the button at all.",
      pt: 'Esta instrução é muito longa e cheia de detalhes, mas na verdade é um truque. Você não deve pressionar o botão.',
    },
  },
};

const COLOR_WORDS: Dictionary<PoolGroupEntry<{ text: DualLanguageValue; color: string }>> = {
  COLOR_WORD_1: {
    id: 'COLOR_WORD_1',
    targetCount: -1,
    color: 'hotPink',
    text: {
      en: 'Blue',
      pt: 'Azul',
    },
  },
  COLOR_WORD_2: {
    id: 'COLOR_WORD_2',
    targetCount: 1,
    color: 'hotPink',
    text: {
      en: 'Pink',
      pt: 'Rosa',
    },
  },
  COLOR_WORD_3: {
    id: 'COLOR_WORD_3',
    targetCount: -1,
    color: 'cyan',
    text: {
      en: 'Pink',
      pt: 'Rosa',
    },
  },
  COLOR_WORD_4: {
    id: 'COLOR_WORD_4',
    targetCount: 1,
    color: 'cyan',
    text: {
      en: 'Blue',
      pt: 'Azul',
    },
  },
  COLOR_WORD_5: {
    id: 'COLOR_WORD_5',
    targetCount: 1,
    color: 'yellow',
    text: {
      en: 'Yellow',
      pt: 'Amarelo',
    },
  },
  COLOR_WORD_6: {
    id: 'COLOR_WORD_6',
    targetCount: -1,
    color: 'yellow',
    text: {
      en: 'Blue',
      pt: 'Azul',
    },
  },
};

const POOLS: Dictionary<Dictionary<PoolGroupEntry>> = {
  SENTENCES_FOR_COUNTING,
  PRESS_LESS_COMPARISON,
  PRESS_MORE_COMPARISON,
  SHAPES_FOR_SIDES_COUNTING,
  SHAPES_FOR_CORNERS_COUNTING,
  TARGET_NUMBERS_FOR_PRESSING,
  PRESS_TARGET_COUNTDOWN_LIST,
  NUMBERS_MUST_REMEMBER,
  WORDS_FOR_VOWEL_COUNTING,
  WORDS_FOR_CONSONANT_COUNTING,
  EQUATIONS_TO_SOLVE,
  ALL_ODD_NUMBERS,
  ALL_EVEN_NUMBERS,
  THINGS_TO_SEE,
  THINGS_TO_AVOID,
  THINGS_TO_COUNT,
  SEQUENCES_TO_REMEMBER,
  RANDOM_QUESTIONS,
  ICON_COMPARISONS,
  MISSING_NUMBERS_SEQUENCES,
  LETTER_SEARCH_STRINGS,
  ALPHABET_POSITIONS,
  ROMAN_NUMERALS_POOL,
  ANIMAL_LEGS,
  NUMBER_RIDDLES,
  LONG_INSTRUCTIONS,
  THINGS_COLOR_GRID,
  SAME_THINGS_LIST,
  COLOR_WORDS,
};

/**
 * A button placed in a sequence while it's still being generated.
 */
type PlacedButton = {
  /**
   * Button definition key from {@link BUTTONS_LIBRARY}.
   */
  key: string;
  /**
   * Index into the button's pool, when it has one.
   */
  poolIndex?: number;
  /**
   * Resolved required press count for this placement.
   */
  targetCount: number;
  /**
   * Resolved validation rule for this placement.
   */
  expectedAction: string;
  /**
   * Difficulty level copied from the button's library entry.
   */
  level: number;
};

/**
 * Generates a Panico button sequence using the game's full set of placement
 * rules (spacing, mutual exclusions, dependencies, difficulty-level mix,
 * and pool selection), via recursive backtracking.
 *
 * @param length Total number of buttons in the sequence (default 25).
 * @returns The encoded sequence strings plus a short hash identifying it.
 * @throws If `length` is below 8, the minimum needed for dependency spacing.
 */
function generateGameSequence(length = 25): {
  hash: string;
  sequence: string[];
} {
  // Minimum length to safely accommodate the 5-space dependency gap.
  if (length < 8) {
    throw new Error('Sequence length must be at least 8 to accommodate the 5-space dependency gap.');
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
   * "no more than 5 restricted targets in a row" rule).
   */
  const isRestrictedTarget = (targetCount: number) => targetCount === 0 || targetCount === -2;

  /**
   * Recursive backtracking function that attempts to build a valid button
   * sequence from `currentIndex` to the end.
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

    const occurrences: Record<string, number> = {};
    const bannedByEitherOr = new Set<string>();

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

      // RULE: Pool logic and 60% dependency matching.
      if (candidate.pool && POOLS[candidate.pool]) {
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
    console.warn('Could not generate a Panico sequence matching all strict constraints for this length.');
  }

  const hash: string[] = [];
  const buttonSequence = sequence.map((placedButton, index) => {
    const poolSuffix = placedButton.poolIndex !== undefined ? placedButton.poolIndex.toString() : '';

    const buttonData = BUTTONS_LIBRARY[placedButton.key];
    if (buttonData?.hash) {
      hash.push(placedButton.poolIndex !== undefined ? `${buttonData.hash}${poolSuffix}` : buttonData.hash);
    }

    return `${index + 1}${BUTTON_SEPARATOR}${placedButton.key}${BUTTON_SEPARATOR}${poolSuffix}`;
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
 * @param count Number of unique hash codes to generate.
 * @returns The newly generated hash codes, sorted alphabetically.
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
 */
function encodeTestButton(button: (typeof BUTTONS_LIBRARY)[string], index: number): string {
  let id = `${index + 1}${BUTTON_SEPARATOR}${button.key}`;
  if (button.pool) {
    id += `${BUTTON_SEPARATOR}${random(0, Object.values(POOLS[button.pool]).length - 1)}`;
  }
  return id;
}

/**
 * Generates a sequence containing every button in {@link BUTTONS_LIBRARY},
 * for manually exercising each button type during development.
 *
 * @returns The encoded sequence strings, one per library button.
 */
export function generateAllButtonsSequence(): string[] {
  return Object.values(BUTTONS_LIBRARY).map((button, index) => encodeTestButton(button, index));
}

/**
 * Generates a short, hand-picked test sequence for quick manual checks.
 *
 * @returns The encoded sequence strings for the hand-picked button keys.
 */
export function generateSampleTestSequence(): string[] {
  const sampleKeys = [
    'BASIC_PRESS',
    // Add buttons here.
    'FINAL_PRESS',
  ];

  return sampleKeys
    .map((key) => BUTTONS_LIBRARY[key])
    .map((button, index) => encodeTestButton(button, index));
}

/**
 * Generates a hand-picked test sequence that expands any pool-backed button
 * into one entry per pool variation, for exercising every pool option.
 *
 * @returns The encoded sequence strings, including one per pool variation.
 */
export function generateSampleTestAllPoolsSequence(): string[] {
  const sampleKeys = [
    'BASIC_PRESS',
    // Add buttons here.
    'FINAL_PRESS',
  ];

  return sampleKeys
    .map((key) => BUTTONS_LIBRARY[key])
    .flatMap((button, index) => {
      if (button.pool) {
        if (button.dependsOn) {
          return Object.keys(POOLS[button.pool]).map(
            (_, poolIndex) => `${index + 1}${BUTTON_SEPARATOR}${button.key}${BUTTON_SEPARATOR}${poolIndex}`,
          );
        }
        return encodeTestButton(button, index);
      }
      return `${index + 1}${BUTTON_SEPARATOR}${button.key}`;
    });
}
