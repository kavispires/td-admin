/**
 * Pânico button definitions and the content pools referenced by saved placements.
 * Dynamic actions and answers are resolved by the game client, not this module.
 * Pool entry order is part of the saved format; randomized arrangements are
 * generated once per module load and are not seeded by challenge date.
 *
 * @module
 */

import { random, sample, shuffle } from 'lodash';

/**
 * Authoring metadata shared by sequence placement and client-side gameplay.
 * Raw targets and actions may be placeholders until a pool or resolver is applied.
 *
 * @template Key - Allowed button keys for identifiers and cross-button references
 */
export type ButtonDictionaryEntry<Key extends string = string> = {
  /**
   * Unique key identifier of the button type
   */
  key: Key;
  /**
   * The category of the button
   */
  category: 'standard' | 'trick' | 'memory' | 'logic' | 'question' | 'conditional' | 'math' | 'count';
  /**
   * Description of the button
   */
  doc: string;
  /**
   * Stable three-letter code included in history fingerprints. Some rule
   * buttons intentionally have no code, so fingerprints are not unique.
   */
  hash?: string;
  /**
   * Difficulty level of the button (1-5)
   */
  level: 1 | 2 | 3 | 4 | 5;
  /**
   * Static press target or comparison threshold. -1 allows any press count;
   * -2 defers the target to pool data or a client-side resolver (including
   * SAME_AS_PREVIOUS). Placement rules use these raw values, not resolved answers.
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
   * Normal selection limit. FINAL_PRESS is placed explicitly despite its zero
   * limit; basic fallback buttons may exceed their limits to complete a sequence.
   */
  maxOccurrence: number;
  /**
   * Duration scale that affects the button time to complete the task
   */
  durationScale: 'quick' | 'normal' | 'long';
  /**
   * Keyword establishing a rule for subsequent buttons.
   */
  keyword?: string;
  /**
   * Optional key of another button that must appear before this one in the sequence
   */
  dependsOn?: Key;
  /**
   * Reverse dependency list for content authoring. Placement checks dependsOn;
   * it does not guarantee that these follow-up buttons will be selected.
   */
  dependents?: readonly Key[];
  /**
   * Button types that cannot coexist with this button in a generated sequence.
   */
  eitherOr?: readonly Key[];
  /**
   * Use a specific set of data that the game randomly picks an item to use in the game
   */
  pool?: keyof typeof POOLS;
  /**
   * Optional variant for styling purposes (e.g., to indicate a red button that must not be pressed)
   */
  buttonVariant?: string;
  /**
   * Optional client-side resolution strategy. Other dynamic buttons are
   * resolved by pool data or button-specific client logic.
   */
  resolver?: 'PREVIOUS_BUTTON_PRESS_COUNT' | 'POOL_KEYWORD_MATCH' | 'POOL_KEYWORD_MATCH_REVERSE' | 'RED';
};

/**
 * Source definitions retaining literal keys for {@link ButtonKey}. Each entry's
 * doc describes its gameplay purpose; {@link BUTTONS_LIBRARY} checks references
 * against the complete key set before exposing definitions to the generator.
 */
const BUTTON_DEFINITIONS = {
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
    doc: 'Establishes a rule that subsequent red buttons must not be pressed.',
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
    doc: 'A red button whose expected action is resolved using the red-button rule.',
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
    doc: 'Check whether all displayed numbers are odd.',
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
    doc: 'Check whether all displayed numbers are even.',
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
    doc: 'An icon is displayed; do not press if it matches the earlier avoidance rule.',
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
    doc: 'After the all-same rule, press if every displayed item is identical.',
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
} as const satisfies Dictionary<ButtonDictionaryEntry>;

/**
 * Shuffles a copy and, when decoys are supplied, replaces exactly one item.
 * Module-level pools call this once during initialization, not by puzzle date.
 * Neither input is mutated, and replacement preserves the original array length.
 *
 * @param array - Items to arrange, or an empty array when no replacement is requested
 * @param decoys - Replacement candidates; an empty list requests shuffling only
 * @returns A shuffled copy with one randomly chosen item replaced when decoys are supplied
 * @throws If replacement is requested for an empty array or a decoy cannot be selected
 */
export const shuffleAndReplace = (array: string[], decoys: string[] = []): string[] => {
  const shuffled = shuffle(array);
  if (decoys.length > 0) {
    if (shuffled.length === 0) {
      throw new Error('Cannot replace an item in an empty Pânico pool arrangement.');
    }
    const decoy = sample(decoys);
    if (decoy === undefined) {
      throw new Error('Could not select a Pânico decoy.');
    }
    shuffled[random(0, shuffled.length - 1)] = decoy;
  }
  return shuffled;
};

/**
 * Content and target metadata interpreted by the game client.
 * Additional display fields vary by pool, such as localized text, item IDs,
 * or keywords used to compare a dependent button with its prerequisite.
 *
 * @template T - Pool-specific display and rule metadata
 */
type PoolGroupEntry<T extends Dictionary<unknown> = Dictionary<unknown>> = {
  /**
   * Identifier unique within this pool.
   */
  id: string;
  /**
   * Press target attached to this pool entry.
   */
  targetCount: number;
} & T;

/**
 * Localized word-counting instructions. Some sentences explicitly override
 * counting with a stated press count; targetCount stores the intended answer.
 */
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

/**
 * Exclusive upper bounds for PRESS_LESS; targetCount is a threshold, not an exact answer.
 */
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

/**
 * Exclusive lower bounds for PRESS_MORE; targetCount is a threshold, not an exact answer.
 */
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

/**
 * Shape illustrations and side counts for PRESS_SHAPE_SIDE.
 * The cube entry uses its six faces as the displayed counting target.
 */
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

/**
 * Shape item IDs and exact corner counts for PRESS_SHAPE_CORNER.
 */
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

/**
 * Localized instructions paired with exact press counts for PRESS_TARGET_NUMBER.
 */
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

/**
 * Starting counts for PRESS_TARGET_COUNTDOWN, whose presses count down to completion.
 */
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

/**
 * Shared number choices for REMEMBER_NUMBER and REMEMBERED_NUMBER.
 * value is displayed; keyword identifies the choice for client-side matching.
 * Reusing the same pool index selects the same remembered number.
 */
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

/**
 * Display strings and precomputed vowel counts, including accented vowels.
 */
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

/**
 * Display strings and precomputed consonant counts for COUNT_CONSONANTS.
 */
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

/**
 * Display-only arithmetic expressions with precomputed numeric press targets.
 * The generator does not evaluate the expression strings.
 */
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

/**
 * Number lists for the all-odd question: targetCount is 1 for true and 0 for false.
 */
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

/**
 * Number lists for the all-even question: targetCount is 1 for true and 0 for false.
 */
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

/**
 * Distractor item IDs used as the base arrangement for icon-recognition prompts.
 * Each THINGS_TO_SEE arrangement replaces one distractor with its rule's item.
 */
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

/**
 * Shared icon choices for WHEN_YOU_SEE_RULE and its dependent prompts.
 * keyword and value identify the rule; decoyItemsIds contains the target item
 * once among distractors for prompts that display multiple icons.
 */
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
    decoyItemsIds: shuffleAndReplace(DECOY_ITEMS, ['item-470']),
  },
  THING_TO_SEE_2: {
    id: 'THING_TO_SEE_2',
    targetCount: -1,
    itemId: 'item-390',
    keyword: 'SEE_KITE',
    value: 'SEE_KITE',
    decoyItemsIds: shuffleAndReplace(DECOY_ITEMS, ['item-390']),
  },
  THING_TO_SEE_4: {
    id: 'THING_TO_SEE_4',
    targetCount: -1,
    itemId: 'item-1575',
    keyword: 'SEE_RAINBOW',
    value: 'SEE_RAINBOW',
    decoyItemsIds: shuffleAndReplace(DECOY_ITEMS, ['item-1575']),
  },
};

/**
 * Blue item illustrations used to build monochromatic grids or red-grid distractors.
 */
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
/**
 * Red item illustrations used to build monochromatic grids or blue-grid distractors.
 */
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

/**
 * Nine-item color grids for COLOR_GRID. True variants are monochromatic;
 * false variants replace one item with an illustration of the opposite color.
 * targetCount is 1 for a match and 0 otherwise.
 */
const THINGS_COLOR_GRID: Dictionary<PoolGroupEntry<{ itemsIds: string[] }>> = {
  THINGS_COLOR_GRID_BLUE_TRUE: {
    id: 'THINGS_COLOR_GRID_BLUE_TRUE',
    targetCount: 1,
    itemsIds: shuffleAndReplace(BLUE_THINGS),
  },
  THINGS_COLOR_GRID_BLUE_FALSE: {
    id: 'THINGS_COLOR_GRID_BLUE_FALSE',
    targetCount: 0,
    itemsIds: shuffleAndReplace(BLUE_THINGS, RED_THINGS),
  },
  THINGS_COLOR_GRID_RED_TRUE: {
    id: 'THINGS_COLOR_GRID_RED_TRUE',
    targetCount: 1,
    itemsIds: shuffleAndReplace(RED_THINGS),
  },
  THINGS_COLOR_GRID_RED_FALSE: {
    id: 'THINGS_COLOR_GRID_RED_FALSE',
    targetCount: 0,
    itemsIds: shuffleAndReplace(RED_THINGS, BLUE_THINGS),
  },
};

/**
 * Thirty identical crocodile good IDs forming a uniform sprite arrangement.
 */
const CROCODILE_SPRITE = Array(30).fill('good-32');
/**
 * Thirty identical frog good IDs forming a uniform sprite arrangement.
 */
const FROG_SPRITE = Array(30).fill('good-50');

/**
 * Uniform and single-outlier sprite arrangements for SEE_SAME_THINGS_PRESS.
 * Each variant retains its explicit target metadata for client-side resolution.
 */
const SAME_THINGS_LIST: Dictionary<PoolGroupEntry<{ goodsIds: string[] }>> = {
  SAME_THINGS_LIST_1: {
    id: 'SAME_THINGS_LIST_1',
    targetCount: -1,
    goodsIds: shuffleAndReplace(CROCODILE_SPRITE, ['good-50']),
  },
  SAME_THINGS_LIST_2: {
    id: 'SAME_THINGS_LIST_2',
    targetCount: 1,
    goodsIds: CROCODILE_SPRITE,
  },
  SAME_THINGS_LIST_3: {
    id: 'SAME_THINGS_LIST_3',
    targetCount: 0,
    goodsIds: shuffleAndReplace(FROG_SPRITE, ['good-32']),
  },
  SAME_THINGS_LIST_4: {
    id: 'SAME_THINGS_LIST_4',
    targetCount: 1,
    goodsIds: FROG_SPRITE,
  },
};

/**
 * Shared icons and matching keywords for the avoidance rule and its follow-up.
 * The client reverses the normal matching action through POOL_KEYWORD_MATCH_REVERSE.
 */
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

/**
 * Icon identities and count metadata for SEE_AND_COUNT.
 * Entries may reuse an illustration with different target counts.
 */
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

/**
 * Ordered icon sequences shared by REMEMBER_SEQUENCE and REMEMBERED_SEQUENCE.
 * itemsIds supplies the display order; value and keyword identify that order
 * for the client's later comparison.
 */
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

/**
 * Localized subjective questions with unrestricted press targets.
 */
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

/**
 * Icon arrangements with localized labels for the quantities being compared.
 * more and less label the comparison subjects; targetCount stores each variant's
 * expected result rather than being computed during sequence generation.
 */
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

/**
 * Display sequences containing a question-mark placeholder, paired with the
 * missing value to use as the exact press target.
 */
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

/**
 * Search strings and the letter to count, with case-insensitive expected totals.
 */
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

/**
 * Display letters paired with their one-based alphabet positions as press targets.
 */
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

/**
 * Roman numeral display strings paired with their numeric press targets.
 */
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

/**
 * Item illustrations paired with the total leg count used as the press target.
 * Counts follow the illustrated items, including the single pirate-leg item.
 */
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

/**
 * Localized numeric riddle prompts whose answers are stored as exact press targets.
 */
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

/**
 * Verbose localized prompts that ultimately require one press or no presses.
 * targetCount records the final instruction rather than the amount of text.
 */
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

/**
 * Localized color labels paired with visual color tokens for COLOR_WORD.
 * The client interprets each variant's target metadata under COLOR_WORD_RULE.
 */
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

/**
 * Saved buttons reference zero-based Object.values indexes. Preserve the
 * insertion order of existing entries within each pool; append new entries.
 * Randomized arrangements are session-local and are not saved in payloads.
 */
export const POOLS = {
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
} satisfies Dictionary<Dictionary<PoolGroupEntry>>;

/**
 * Supported button identifiers, derived from the source definitions so references
 * cannot silently drift from the available button types.
 */
export type ButtonKey = keyof typeof BUTTON_DEFINITIONS;

/**
 * Generator-facing library with validated identifiers and cross-button references.
 * Entries retain their literal key while sharing the complete metadata shape,
 * including optional fields absent from individual source definitions.
 */
export const BUTTONS_LIBRARY: {
  [Key in ButtonKey]: ButtonDictionaryEntry<ButtonKey> & { key: Key };
} = BUTTON_DEFINITIONS;
