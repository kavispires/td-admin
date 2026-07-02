/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useQuery } from '@tanstack/react-query';
import { sample, sampleSize } from 'lodash';
import { ATTEMPTS_THRESHOLD, DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { getDayOfTheWeek, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

export type Gender = 'boy' | 'girl';
export interface Kid {
  /**
   * Kid card identifier
   */
  id: UID;
  /**
   * Kid's name in multiple languages
   */
  name: DualLanguageValue;
  /**
   * Gender identifier
   */
  gender: Gender;
  /**
   * Height in centimeters
   */
  height: number;
  /**
   * Associated color code
   */
  color: string;
}

export const KIDS_LIBRARY: Dictionary<Kid> = {
  'us-gb-231': {
    id: 'us-gb-231',
    name: { en: 'Miles', pt: 'Marcus Vinícius' },
    gender: 'boy',
    height: 124,
    color: '#2b72ff',
  },
  'us-gb-232': {
    id: 'us-gb-232',
    name: { en: 'Penny', pt: 'Penélope' },
    gender: 'girl',
    height: 120,
    color: '#ff69c0',
  },
  'us-gb-233': {
    id: 'us-gb-233',
    name: { en: 'Dylan', pt: 'Daniel' },
    gender: 'boy',
    height: 109,
    color: '#41a00b',
  },
  'us-gb-234': {
    id: 'us-gb-234',
    name: { en: 'Sandy', pt: 'Sabrina' },
    gender: 'girl',
    height: 100,
    color: '#962196',
  },
  'us-gb-235': {
    id: 'us-gb-235',
    name: { en: 'Brent', pt: 'Breno' },
    gender: 'boy',
    height: 122,
    color: '#e54122',
  },
  'us-gb-236': {
    id: 'us-gb-236',
    name: { en: 'Alice', pt: 'Alice' },
    gender: 'girl',
    height: 117,
    color: '#ffd800',
  },
  'us-gb-237': {
    id: 'us-gb-237',
    name: { en: 'Isaac', pt: 'Igor' },
    gender: 'boy',
    height: 127,
    color: 'white',
  },
  'us-gb-238': {
    id: 'us-gb-238',
    name: { en: 'Anna', pt: 'Aninha' },
    gender: 'girl',
    height: 104,
    color: 'orange',
  },
  'us-gb-239': {
    id: 'us-gb-239',
    name: { en: 'Linus', pt: 'Lino' },
    gender: 'boy',
    height: 112,
    color: 'teal',
  },
  'us-gb-240': {
    id: 'us-gb-240',
    name: { en: 'Matilda', pt: 'Matilda' },
    gender: 'girl',
    height: 115,
    color: 'brown',
  },
};

export interface GeneratedKid {
  /**
   * Kid identifier
   */
  kidId: UID;
  /**
   * Kid's statement in multiple languages
   */
  statement: DualLanguageValue;
}

export interface StatementContext {
  /**
   * Kid making the statement
   */
  speaker: Kid;
  /**
   * All kids in this game
   */
  allKids: Kid[];
  /**
   * Kids who are culprits
   */
  culprits: Kid[];
  /**
   * Kids who are lying
   */
  liars: Kid[];
}

export type DailyPirralhosEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'pirralhos';
  /**
   * Unique base64-encoded puzzle identifier
   */
  hashId: string;
  /**
   * Kids and their statements
   */
  kids: GeneratedKid[];
  /**
   * Culprit kid identifier
   */
  culpritId: UID;
  /**
   * Liar kid identifiers
   */
  liarsIds: UID[];
  /**
   * Number of possible liars (may differ from actual)
   */
  possibleLiars: number;
  /**
   * Calculated difficulty score (1-100)
   */
  difficulty: number;
};

/**
 * Hook for generating daily Pirralhos games
 *
 * Creates logic puzzles where players identify a culprit and liars based on kids' statements.
 * Game complexity varies by day of the week (Mondays are simplest, weekends are hardest).
 *
 * @param enabled - Whether the generation is enabled
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used puzzles
 * @returns Generated Pirralhos game entries with history updates
 */
export const useDailyPirralhosGames = (
  enabled: boolean,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyPirralhosEntry> => {
  // Fetch prerequisite data
  const [pirralhosHistory] = useParsedHistory(DAILY_GAMES_KEYS.PIRRALHOS, dailyHistory);

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate = enabled && !!pirralhosHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: ['generate-daily', 'pirralhos', batchSize, pirralhosHistory?.latestDate],
    queryFn: () => {
      if (!pirralhosHistory) {
        throw new Error('Critical: Prerequisite history data is missing during query execution.');
      }
      return buildDailyPirralhosGames(batchSize, pirralhosHistory);
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
      latestDate: pirralhosHistory?.latestDate ?? '',
      latestNumber: pirralhosHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Pirralhos games
 *
 * Generates logic puzzles with varying complexity based on day of week:
 * - Mondays: 3 kids, difficulty 1
 * - Other weekdays: 5-6 kids, difficulty 1-2
 * - Saturdays: 6-7 kids, difficulty 2-3
 * - Sundays: 4-7 kids, variable difficulty
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used puzzle hashes
 * @returns Generated entries, errors, and history update
 */
export const buildDailyPirralhosGames = (batchSize: number, history: ParsedDailyHistoryEntry) => {
  if (debugDailyStore.state.pirralhos) {
    console.count('Creating Pirralhos...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyPirralhosEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  // Track used puzzle hashes during generation
  const avoidIds = [...history.used];

  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(latestDate);
    latestDate = id;
    latestNumber = history.latestNumber + i + 1;
    const dayOfTheWeek = getDayOfTheWeek(id);

    // Set difficulty and kid count by day of week
    let difficulty = 1;
    let kidsCount = 3;
    // Weekdays except Mondays
    if (dayOfTheWeek !== 1) {
      kidsCount = sample([5, 6]) ?? 5;
      difficulty = sample([1, 2]) ?? 1;
    }
    // Saturdays
    if (dayOfTheWeek === 6) {
      kidsCount = sample([6, 7]) ?? 6;
      difficulty = sample([2, 3]) ?? 2;
    }

    // Sundays
    if (dayOfTheWeek === 0) {
      kidsCount = sample([4, 4, 5, 6, 7]) ?? 6;
      difficulty = kidsCount === 4 ? 1 : (sample([2, 3]) ?? 3);
    }

    try {
      let newGame = generatePuzzle(kidsCount, difficulty, avoidIds);
      let attempts = 0;

      // Ensure unique puzzle hash
      while (avoidIds.includes(newGame.hashId) && attempts < ATTEMPTS_THRESHOLD) {
        newGame = generatePuzzle(kidsCount, difficulty, avoidIds);
        attempts++;
      }

      if (avoidIds.includes(newGame.hashId)) {
        throw new Error(
          `Exceeded ATTEMPTS_THRESHOLD (${ATTEMPTS_THRESHOLD}) trying to find a unique puzzle.`,
        );
      }

      avoidIds.push(newGame.hashId);
      used.push(newGame.hashId);

      entries[id] = {
        id,
        number: latestNumber,
        type: 'pirralhos',
        hashId: newGame.hashId,
        kids: newGame.kids,
        culpritId: newGame.culpritId,
        liarsIds: newGame.liarsIds,
        possibleLiars: newGame.possibleLiars,
        difficulty: newGame.difficulty,
      };
    } catch (error: unknown) {
      // Catch failure for this specific day
      if (debugDailyStore.state.pirralhos) {
        console.error(`Pirralhos Day ${id} Failed:`, error);
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

export interface StatementDef {
  /**
   * Difficulty weight (1 = Easy, 3 = Hard)
   */
  difficultyWeight: number;
  /**
   * Generates parameter for statement (kid ID or height)
   */
  generateParam: (speaker: Kid, allKids: Kid[]) => string | number | undefined;
  /**
   * Builds statement text and evaluation function
   */
  build: (
    speaker: Kid,
    allKids: Kid[],
    param?: string | number,
  ) => { text: DualLanguageValue; evaluate: (ctx: StatementContext) => boolean };
}

export interface StatementInstance {
  /**
   * Statement type index from STATEMENT_POOL
   */
  type: number;
  /**
   * Optional parameter (kid ID or height)
   */
  param?: string | number;
  /**
   * Statement text in multiple languages
   */
  text: DualLanguageValue;
  /**
   * Evaluation function for statement truth
   */
  evaluate: (ctx: StatementContext) => boolean;
}

// Derive array for logic processing
const ALL_KIDS = Object.values(KIDS_LIBRARY);
const HEIGHT_THRESHOLDS = ALL_KIDS.map((k) => k.height).sort();

/**
 * Gets the left and right neighbors of a kid in the lineup
 */
const getNeighbors = (kid: Kid, allKids: Kid[]) => {
  const index = allKids.findIndex((k) => k.id === kid.id);
  const left = allKids[(index - 1 + allKids.length) % allKids.length];
  const right = allKids[(index + 1) % allKids.length];
  return { left, right };
};

/**
 * Randomly selects an element from an array
 */
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const STATEMENT_POOL: StatementDef[] = [
  {
    // 0: <character> did it
    difficultyWeight: 1,
    generateParam: (speaker, allKids) => pickRandom(allKids.filter((k) => k.id !== speaker.id)).id,
    build: (_, allKids, param) => {
      const target = allKids.find((k) => k.id === param);
      if (!target) throw new Error('Invalid parameter for statement generation');
      return {
        text: {
          en: `${target.name.en} did it`,
          pt: `Foi ${target.gender === 'boy' ? 'o' : 'a'} ${target.name.pt}!`,
        },
        evaluate: (ctx) => ctx.culprits.some((c) => c.id === target.id),
      };
    },
  },
  {
    // 1: <character> didn't do it
    difficultyWeight: 1,
    generateParam: (speaker, allKids) => pickRandom(allKids.filter((k) => k.id !== speaker.id)).id,
    build: (_, allKids, param) => {
      const target = allKids.find((k) => k.id === param);
      if (!target) throw new Error('Invalid parameter for statement generation');
      return {
        text: {
          en: `${target.name.en} didn't do it`,
          pt: `Não foi ${target.gender === 'boy' ? 'o' : 'a'} ${target.name.pt}`,
        },
        evaluate: (ctx) => !ctx.culprits.some((c) => c.id === target.id),
      };
    },
  },
  {
    // 2: <character> is lying
    difficultyWeight: 2,
    generateParam: (speaker, allKids) => pickRandom(allKids.filter((k) => k.id !== speaker.id)).id,
    build: (_, allKids, param) => {
      const target = allKids.find((k) => k.id === param);
      if (!target) throw new Error('Invalid parameter for statement generation');
      return {
        text: { en: `${target.name.en} is lying`, pt: `${target.name.pt} tá mentindo` },
        evaluate: (ctx) => ctx.liars.some((l) => l.id === target.id),
      };
    },
  },
  {
    // 3: <character> or I did it (or both)
    difficultyWeight: 3,
    generateParam: (speaker, allKids) => pickRandom(allKids.filter((k) => k.id !== speaker.id)).id,
    build: (speaker, allKids, param) => {
      const target = allKids.find((k) => k.id === param);
      if (!target) throw new Error('Invalid parameter for statement generation');
      return {
        text: {
          en: `${target.name.en} or I did it`,
          pt: `Foi ${target.gender === 'boy' ? 'o' : 'a'} ${target.name.pt} ou eu `,
        },
        evaluate: (ctx) => ctx.culprits.some((c) => c.id === target.id || c.id === speaker.id),
      };
    },
  },
  {
    // 4: A boy did it
    difficultyWeight: 2,
    generateParam: () => undefined,
    build: () => ({
      text: { en: 'A boy did it', pt: 'Foi um menino' },
      evaluate: (ctx) => ctx.culprits.some((c) => c.gender === 'boy'),
    }),
  },
  {
    // 5: A girl did it
    difficultyWeight: 2,
    generateParam: () => undefined,
    build: () => ({
      text: { en: 'A girl did it', pt: 'Foi uma menina' },
      evaluate: (ctx) => ctx.culprits.some((c) => c.gender === 'girl'),
    }),
  },
  {
    // 6: Someone taller than me did it
    difficultyWeight: 3,
    generateParam: () => undefined,
    build: (speaker) => ({
      text: { en: 'Someone taller than me did it', pt: 'Foi alguém mais alto que eu' },
      evaluate: (ctx) => ctx.culprits.some((c) => c.height > speaker.height),
    }),
  },
  {
    // 7: Someone shorter than N cm did it
    difficultyWeight: 3,
    generateParam: () => pickRandom(HEIGHT_THRESHOLDS),
    build: (_, __, param) => ({
      text: {
        en: `Someone shorter than ${param} cm did it`,
        pt: `Foi alguém menor que ${param} cm`,
      },
      evaluate: (ctx) => ctx.culprits.some((c) => c.height < (param as number)),
    }),
  },
  {
    // 8: A suspect next to me did it
    difficultyWeight: 3,
    generateParam: () => undefined,
    build: (speaker, allKids) => ({
      text: { en: 'Someone next to me did it', pt: 'Foi alguém do meu lado' },
      evaluate: (ctx) => {
        const { left, right } = getNeighbors(speaker, allKids);
        return ctx.culprits.some((c) => c.id === left.id || c.id === right.id);
      },
    }),
  },
  {
    // 9: The culprit has a different gender than me
    difficultyWeight: 3,
    generateParam: () => undefined,
    build: (speaker) => ({
      text: {
        en: 'The culprit has a different gender than me',
        pt: 'Quem pegou é de um gênero diferente do meu',
      },
      evaluate: (ctx) => ctx.culprits.some((c) => c.gender !== speaker.gender),
    }),
  },
  {
    // 10: <character> is telling the truth
    difficultyWeight: 2,
    generateParam: (speaker, allKids) => pickRandom(allKids.filter((k) => k.id !== speaker.id)).id,
    build: (_, allKids, param) => {
      const target = allKids.find((k) => k.id === param);
      if (!target) throw new Error('Invalid parameter');
      return {
        text: {
          en: `${target.name.en} is telling the truth`,
          pt: `${target.name.pt} está falando a verdade`,
        },
        evaluate: (ctx) => !ctx.liars.some((l) => l.id === target.id),
      };
    },
  },
  {
    // 11: I didn't do it
    difficultyWeight: 1,
    generateParam: () => undefined,
    build: (speaker) => ({
      text: { en: "I didn't do it!", pt: 'Não fui eu!' },
      evaluate: (ctx) => !ctx.culprits.some((c) => c.id === speaker.id),
    }),
  },
  {
    // 12: The culprit is NOT next to me
    difficultyWeight: 2,
    generateParam: () => undefined,
    build: (speaker, allKids) => ({
      text: { en: 'The culprit is not next to me', pt: 'Não foi ninguém do meu lado' },
      evaluate: (ctx) => {
        const { left, right } = getNeighbors(speaker, allKids);
        return !ctx.culprits.some((c) => c.id === left.id || c.id === right.id);
      },
    }),
  },
  {
    // 13: The culprit has the same gender as me
    difficultyWeight: 2,
    generateParam: () => undefined,
    build: (speaker) => ({
      text: {
        en: 'The culprit has the same gender as me',
        pt: 'Quem pegou é do mesmo gênero que eu',
      },
      evaluate: (ctx) => ctx.culprits.some((c) => c.gender === speaker.gender),
    }),
  },
];

/**
 * Generates all possible combinations of a given size from an array.
 */
function getCombinations<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  function combine(start: number, combo: T[]) {
    if (combo.length === size) {
      result.push([...combo]);
      return;
    }
    for (let i = start; i < array.length; i++) {
      combine(i + 1, [...combo, array[i]]);
    }
  }
  combine(0, []);
  return result;
}

const KID_PREFIX = 'us-gb-';

/**
 * Encodes puzzle parameters into a base64 hash ID
 */
function encodePuzzleId(
  activeKids: Kid[],
  exactLiars: number,
  possibleLiars: number,
  stmts: StatementInstance[],
): string {
  // Strip the prefix from the active kids' IDs
  const kidsStr = activeKids.map((k) => k.id.replace(KID_PREFIX, '')).join(',');

  const stmtString = stmts
    .map((s) => {
      if (s.param === undefined) return `${s.type}`;

      // If param is a kid ID, strip prefix; otherwise (height) leave as is
      const paramStr = typeof s.param === 'string' ? s.param.replace(KID_PREFIX, '') : s.param;
      return `${s.type},${paramStr}`;
    })
    .join('-');

  // Format: kidIds|numCulprits|exactLiars|possibleLiars|statements
  const rawId = `${kidsStr}|1|${exactLiars}|${possibleLiars}|${stmtString}`;
  return globalThis.btoa(rawId);
}

/**
 * Decodes a base64 hash ID back into puzzle parameters
 */
function decodePuzzleId(hash: string) {
  const rawId = globalThis.atob(hash);
  const [kidsStr, culpritsStr, liarsStr, possibleLiarsStr, stmtsStr] = rawId.split('|');

  // Re-attach prefix to kid IDs
  const activeKidIds = kidsStr.split(',').map((id) => `${KID_PREFIX}${id}`);

  const numCulprits = Number.parseInt(culpritsStr, 10);
  const exactLiars = Number.parseInt(liarsStr, 10);
  const possibleLiars = Number.parseInt(possibleLiarsStr, 10);

  const parsedStmts = stmtsStr.split('-').map((s) => {
    const [typeStr, paramStr] = s.split(',');
    const type = Number.parseInt(typeStr, 10);

    let param: string | number | undefined;
    if (paramStr !== undefined && paramStr !== '') {
      // Type 7 is height (number). All other params are kid IDs (strings).
      param = type === 7 ? Number.parseInt(paramStr, 10) : `${KID_PREFIX}${paramStr}`;
    }

    return { type, param };
  });

  return { activeKidIds, numCulprits, exactLiars, possibleLiars, parsedStmts };
}

/**
 * Calculates the difficulty score for a puzzle
 */
function calculateDifficulty(
  numKids: number,
  numCulprits: number,
  exactLiars: number,
  stmts: StatementInstance[],
): number {
  const kidsScore = (numKids - 3) * 5;
  const culpritsScore = (numCulprits - 1) * 15;
  const liarsScore = exactLiars * 5;
  const totalWeight = stmts.reduce((sum, stmt) => sum + STATEMENT_POOL[stmt.type].difficultyWeight, 0);
  const avgWeight = totalWeight / stmts.length;
  const statementsScore = (avgWeight - 1) * 15;
  const totalScore = Math.round(kidsScore + culpritsScore + liarsScore + statementsScore);

  return Math.max(1, Math.min(100, totalScore));
}

/**
 * Solves a puzzle by testing all possible combinations of culprits and liars
 */
function solvePuzzle(
  activeKids: Kid[],
  statements: { kid: Kid; stmt: StatementInstance }[],
  possibleCulpritCombos: Kid[][],
  possibleLiarCombos: Kid[][],
) {
  let validSolutionsCount = 0;
  let finalCulprits: Kid[] = [];
  let finalLiars: Kid[] = [];

  for (const testCulprits of possibleCulpritCombos) {
    for (const testLiars of possibleLiarCombos) {
      let isValidState = true;
      for (const ks of statements) {
        const isLiarInThisState = testLiars.some((l) => l.id === ks.kid.id);
        const statementWouldBeTrue = ks.stmt.evaluate({
          speaker: ks.kid,
          allKids: activeKids,
          culprits: testCulprits,
          liars: testLiars,
        });

        if ((isLiarInThisState && statementWouldBeTrue) || (!isLiarInThisState && !statementWouldBeTrue)) {
          isValidState = false;
          break;
        }
      }
      if (isValidState) {
        validSolutionsCount++;
        finalCulprits = testCulprits;
        finalLiars = testLiars;
      }
    }
  }

  return { validSolutionsCount, finalCulprits, finalLiars };
}

/**
 * Generates a unique daily Pirralhos puzzle
 *
 * Creates a logic puzzle by:
 * 1. Selecting random kids, culprits, and liars
 * 2. Generating valid statements for each kid
 * 3. Verifying the puzzle has exactly one solution
 * 4. Encoding the puzzle into a unique hash ID
 *
 * @param numKids - Number of kids in the puzzle
 * @param difficultyOverride - Target difficulty level (1-3)
 * @param avoidIds - Previously used puzzle hashes to avoid duplicates
 * @returns Generated puzzle entry
 */
export function generatePuzzle(
  numKids: number,
  difficultyOverride = 1,
  avoidIds: string[] = [],
): DailyPirralhosEntry {
  const activeKids = sampleSize(ALL_KIDS, numKids);

  const numCulprits = 1;
  let exactLiars = 1;
  let possibleLiars = exactLiars;

  // Difficulty override logic
  if (difficultyOverride === 2) {
    if (numKids <= 5) {
      exactLiars = pickRandom([1, 2]);
    } else {
      exactLiars = pickRandom([3, 4]);
    }
    const variance = pickRandom([-1, 0, 0, 1]);
    possibleLiars = Math.max(0, exactLiars + variance);
  }

  if (difficultyOverride === 3) {
    if (numKids <= 5) {
      exactLiars = pickRandom([2, 3]);
      // More variance for harder puzzles
      const variance = pickRandom([-1, -1, 0, 1, 1]);
      possibleLiars = Math.max(0, exactLiars + variance);
    } else {
      exactLiars = pickRandom([2, 3, 4]);

      if (exactLiars === 2) {
        // For 2 liars, variance ranges from -2 to +2
        const variance = pickRandom([-2, -1, 0, 0, 1, 2]);
        possibleLiars = Math.max(0, exactLiars + variance);
      } else {
        // For 3 or 4 liars, variance ranges from -1 to +1
        const variance = pickRandom([-1, -1, 0, 1, 1]);
        possibleLiars = Math.max(0, exactLiars + variance);
      }
    }
  }

  // Special handling for 3-kid puzzles
  if (numKids === 3) {
    exactLiars = 0;
    possibleLiars = pickRandom([0, 0, 1]);
  }

  // Precompute combinations once
  const possibleCulpritCombos = getCombinations(activeKids, numCulprits);
  const possibleLiarCombos = getCombinations(activeKids, exactLiars);

  let attempts = 0;

  while (attempts < 5000) {
    attempts++;

    const trueCulprits = pickRandom(possibleCulpritCombos);
    const trueLiars = pickRandom(possibleLiarCombos);

    const kidStatements = activeKids.map((kid) => {
      let stmtInstance: StatementInstance | null = null;
      let isValid = false;

      while (!isValid) {
        const typeIndex = Math.floor(Math.random() * STATEMENT_POOL.length);
        const def = STATEMENT_POOL[typeIndex];
        const param = def.generateParam(kid, activeKids);
        const built = def.build(kid, activeKids, param);

        stmtInstance = { type: typeIndex, param, ...built };

        const isLiar = trueLiars.some((l) => l.id === kid.id);
        const statementIsActuallyTrue = stmtInstance.evaluate({
          speaker: kid,
          allKids: activeKids,
          culprits: trueCulprits,
          liars: trueLiars,
        });

        if ((isLiar && !statementIsActuallyTrue) || (!isLiar && statementIsActuallyTrue)) {
          isValid = true;
        }
      }
      if (!stmtInstance) {
        throw new Error('Failed to generate statement instance for Pirralhos puzzle');
      }

      return { kid, stmt: stmtInstance };
    });

    const statementTexts = kidStatements.map((ks) => ks.stmt.text.en);
    if (new Set(statementTexts).size !== activeKids.length) {
      continue;
    }

    const solution = solvePuzzle(activeKids, kidStatements, possibleCulpritCombos, possibleLiarCombos);

    if (solution.validSolutionsCount === 1) {
      const stmtInstances = kidStatements.map((ks) => ks.stmt);
      const puzzleId = encodePuzzleId(activeKids, exactLiars, possibleLiars, stmtInstances);

      if (avoidIds.includes(puzzleId)) {
        continue;
      }

      const difficulty = calculateDifficulty(numKids, numCulprits, exactLiars, stmtInstances);

      return {
        id: '',
        type: 'pirralhos',
        number: 0,
        hashId: puzzleId,
        kids: kidStatements.map((ks) => ({ kidId: ks.kid.id, statement: ks.stmt.text })),
        culpritId: trueCulprits[0]?.id ?? '',
        liarsIds: trueLiars.map((l) => l.id),
        possibleLiars,
        difficulty,
      };
    }
  }

  throw new Error('Could not generate a unique puzzle after 5000 attempts. Try adjusting the parameters.');
}

/**
 * Retrieves and reconstructs a puzzle from its hash ID
 */
export function getPuzzleById(hashId: string): DailyPirralhosEntry {
  const { activeKidIds, numCulprits, exactLiars, possibleLiars, parsedStmts } = decodePuzzleId(hashId);

  // Instantiate kids from library
  const activeKids = activeKidIds.map((id) => {
    const kid = KIDS_LIBRARY[id];
    if (!kid) throw new Error(`Kid ID ${id} not found in library.`);
    return kid;
  });

  const kidStatements = activeKids.map((kid, index) => {
    const parsed = parsedStmts[index];
    const built = STATEMENT_POOL[parsed.type].build(kid, activeKids, parsed.param);
    return {
      kid,
      stmt: { type: parsed.type, param: parsed.param, ...built },
    };
  });

  const possibleCulpritCombos = getCombinations(activeKids, numCulprits);
  const possibleLiarCombos = getCombinations(activeKids, exactLiars);

  const solution = solvePuzzle(activeKids, kidStatements, possibleCulpritCombos, possibleLiarCombos);

  if (solution.validSolutionsCount !== 1) {
    throw new Error('Invalid puzzle ID provided. Puzzle does not have a unique solution.');
  }

  const stmtInstances = kidStatements.map((ks) => ks.stmt);
  const difficulty = calculateDifficulty(activeKids.length, numCulprits, exactLiars, stmtInstances);

  return {
    id: '',
    type: 'pirralhos',
    number: 0,
    hashId,
    kids: kidStatements.map((ks) => ({ kidId: ks.kid.id, statement: ks.stmt.text })),
    culpritId: solution.finalCulprits[0]?.id ?? '',
    liarsIds: solution.finalLiars.map((l) => l.id),
    possibleLiars,
    difficulty,
  };
}
