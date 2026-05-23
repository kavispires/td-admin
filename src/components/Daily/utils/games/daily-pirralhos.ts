import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { sample, sampleSize } from 'lodash';
import { useMemo } from 'react';
import { ATTEMPTS_THRESHOLD, DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getDayOfTheWeek, getNextDay } from '../utils';

export type Gender = 'boy' | 'girl';
export interface Kid {
  id: UID;
  cardId: string;
  name: DualLanguageValue;
  gender: Gender;
  height: number;
  color: string;
}

export const KIDS_LIBRARY: Dictionary<Kid> = {
  '1': {
    id: '1',
    cardId: 'us-gb-231',
    name: { en: 'Miles', pt: 'Marcus Vinícius' },
    gender: 'boy',
    height: 124,
    color: '#2b72ff',
  },
  '2': {
    id: '2',
    cardId: 'us-gb-232',
    name: { en: 'Penny', pt: 'Penélope' },
    gender: 'girl',
    height: 120,
    color: '#ff69c0',
  },
  '3': {
    id: '3',
    cardId: 'us-gb-233',
    name: { en: 'Dylan', pt: 'Daniel' },
    gender: 'boy',
    height: 109,
    color: '#41a00b',
  },
  '4': {
    id: '4',
    cardId: 'us-gb-234',
    name: { en: 'Sandy', pt: 'Sabrina' },
    gender: 'girl',
    height: 100,
    color: '#962196',
  },
  '5': {
    id: '5',
    cardId: 'us-gb-235',
    name: { en: 'Brent', pt: 'Breno' },
    gender: 'boy',
    height: 122,
    color: '#e54122',
  },
  '6': {
    id: '6',
    cardId: 'us-gb-236',
    name: { en: 'Alice', pt: 'Alice' },
    gender: 'girl',
    height: 117,
    color: '#ffd800',
  },
  '7': {
    id: '7',
    cardId: 'us-gb-237',
    name: { en: 'Isaac', pt: 'Igor' },
    gender: 'boy',
    height: 127,
    color: 'white',
  },
  '8': {
    id: '8',
    cardId: 'us-gb-238',
    name: { en: 'Anna', pt: 'Aninha' },
    gender: 'girl',
    height: 104,
    color: 'orange',
  },
  '9': {
    id: '9',
    cardId: 'us-gb-239',
    name: { en: 'Linus', pt: 'Lino' },
    gender: 'boy',
    height: 112,
    color: 'teal',
  },
  '10': {
    id: '10',
    cardId: 'us-gb-240',
    name: { en: 'Matilda', pt: 'Matilda' },
    gender: 'girl',
    height: 115,
    color: 'brown',
  },
};

export interface GeneratedKid {
  kidId: UID;
  statement: DualLanguageValue;
}

export interface StatementContext {
  speaker: Kid;
  allKids: Kid[];
  culprits: Kid[];
  liars: Kid[];
}

export type DailyPirralhosEntry = {
  id: DateKey;
  number: number;
  type: 'pirralhos';
  hashId: string;
  kids: GeneratedKid[];
  culpritId: UID;
  liarsIds: UID[];
  possibleLiars: number;
  difficulty: number; // The calculated 1-100 difficulty score
};

export const useDailyPirralhosGames = (enabled: boolean, batchSize: number, dailyHistory: DailyHistory) => {
  const [pirralhosHistory] = useParsedHistory(DAILY_GAMES_KEYS.PIRRALHOS, dailyHistory);

  const entries = useMemo(() => {
    if (!enabled || !pirralhosHistory) {
      return {};
    }

    return buildDailyPirralhosGames(batchSize, pirralhosHistory);
  }, [enabled, pirralhosHistory, batchSize]);

  return {
    entries,
    isLoading: false,
  };
};

export const buildDailyPirralhosGames = (batchSize: number, history: ParsedDailyHistoryEntry) => {
  console.count('Creating Pirralhos...');

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyPirralhosEntry> = {};

  const avoidIds = history.used;

  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;
    const dayOfTheWeek = getDayOfTheWeek(id);

    let kidsCount = 4;
    // Weekdays but Mondays
    if (dayOfTheWeek !== 1) {
      kidsCount = sample([4, 5, 6]) ?? 4;
    }
    // Sunday or Saturday
    if (dayOfTheWeek === 0 || dayOfTheWeek === 6) {
      kidsCount = sample([6, 7]) ?? 7;
    }

    let newGame = generatePuzzle(kidsCount, avoidIds);
    let attempts = 0;
    while (avoidIds.includes(newGame.hashId) && attempts < ATTEMPTS_THRESHOLD) {
      newGame = generatePuzzle(kidsCount, avoidIds);
      attempts++;
    }
    avoidIds.push(newGame.hashId);

    entries[id] = {
      id,
      number: history.latestNumber + i + 1,
      type: 'pirralhos',
      hashId: newGame.hashId,
      kids: newGame.kids,
      culpritId: newGame.culpritId,
      liarsIds: newGame.liarsIds,
      possibleLiars: newGame.possibleLiars,
      difficulty: newGame.difficulty,
    };
  }

  return entries;
};

export interface StatementDef {
  difficultyWeight: number; // 1 (Easy) to 3 (Hard)
  // Param can now be a string (UID) or a number (height)
  generateParam: (speaker: Kid, allKids: Kid[]) => string | number | undefined;
  build: (
    speaker: Kid,
    allKids: Kid[],
    param?: string | number,
  ) => { text: DualLanguageValue; evaluate: (ctx: StatementContext) => boolean };
}

export interface StatementInstance {
  type: number;
  param?: string | number;
  text: DualLanguageValue;
  evaluate: (ctx: StatementContext) => boolean;
}

// Derive the array for logic processing
const ALL_KIDS = Object.values(KIDS_LIBRARY);
const HEIGHT_THRESHOLDS = ALL_KIDS.map((k) => k.height).sort();

/**
 * Gets the left and right neighbors of a kid in the lineup.
 */
const getNeighbors = (kid: Kid, allKids: Kid[]) => {
  const index = allKids.findIndex((k) => k.id === kid.id);
  const left = allKids[(index - 1 + allKids.length) % allKids.length];
  const right = allKids[(index + 1) % allKids.length];
  return { left, right };
};

/**
 * Randomly selects an element from an array.
 */
const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const STATEMENT_POOL: StatementDef[] = [
  {
    // 0: <character> did it
    difficultyWeight: 1,
    generateParam: (speaker, allKids) => pickRandom(allKids.filter((k) => k.id !== speaker.id)).id,
    build: (_, allKids, param) => {
      const target = allKids.find((k) => k.id === param)!;
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
      const target = allKids.find((k) => k.id === param)!;
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
      const target = allKids.find((k) => k.id === param)!;
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
      const target = allKids.find((k) => k.id === param)!;
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

/**
 * Encodes puzzle parameters into a base64 hash ID.
 */
function encodePuzzleId(
  numKids: number,
  exactLiars: number,
  possibleLiars: number,
  stmts: StatementInstance[],
): string {
  const stmtString = stmts
    .map((s) => (s.param !== undefined ? `${s.type},${s.param}` : `${s.type}`))
    .join('-');
  const rawId = `${numKids}|1|${exactLiars}|${possibleLiars}|${stmtString}`;
  return globalThis.btoa(rawId);
}

/**
 * Decodes a base64 hash ID back into puzzle parameters.
 */
function decodePuzzleId(hash: string) {
  const rawId = globalThis.atob(hash);
  const [kidsStr, culpritsStr, liarsStr, possibleLiarsStr, stmtsStr] = rawId.split('|');
  const numKids = Number.parseInt(kidsStr, 10);
  const numCulprits = Number.parseInt(culpritsStr, 10);
  const exactLiars = Number.parseInt(liarsStr, 10);
  const possibleLiars = Number.parseInt(possibleLiarsStr, 10);

  const parsedStmts = stmtsStr.split('-').map((s) => {
    const [typeStr, paramStr] = s.split(',');
    const type = Number.parseInt(typeStr, 10);

    // Type 7 expects a Number param (height), all others expect a String param (UID) or undefined
    let param: string | number | undefined;
    if (paramStr !== undefined && paramStr !== '') {
      param = type === 7 ? Number.parseInt(paramStr, 10) : paramStr;
    }

    return { type, param };
  });

  return { numKids, numCulprits, exactLiars, possibleLiars, parsedStmts };
}

/**
 * Calculates the difficulty score for a puzzle.
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
 * Solves a puzzle by testing all possible combinations of culprits and liars to find a unique solution.
 */
function solvePuzzle(
  activeKids: Kid[],
  numCulprits: number,
  exactLiars: number,
  statements: { kid: Kid; stmt: StatementInstance }[],
) {
  const possibleCulpritCombos = getCombinations(activeKids, numCulprits);
  const possibleLiarCombos = getCombinations(activeKids, exactLiars);

  let validSolutionsCount = 0;
  let finalCulprits: Kid[] = [];
  let finalLiars: Kid[] = [];

  for (const testCulprits of possibleCulpritCombos) {
    for (const testLiars of possibleLiarCombos) {
      // RULE: The culprit must ALWAYS be a liar.
      if (!testLiars.some((l) => testCulprits.some((c) => c.id === l.id))) {
        continue;
      }

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
 * Generates a unique daily Pirralhos puzzle based strictly on numKids.
 */
export function generatePuzzle(numKids: number, avoidIds: string[] = []): DailyPirralhosEntry {
  const activeKids = sampleSize(ALL_KIDS, numKids);

  const numCulprits = 1;
  let exactLiars = 2;

  if (numKids >= 6) {
    exactLiars = pickRandom([2, 3, 4]);
  }

  const possibleLiars = exactLiars + (Math.random() > 0.5 ? 1 : 0);
  const possibleCulpritCombos = getCombinations(activeKids, numCulprits);

  let attempts = 0;

  while (attempts < 5000) {
    attempts++;

    const trueCulprits = pickRandom(possibleCulpritCombos);
    const theCulprit = trueCulprits[0];

    const otherKids = activeKids.filter((k) => k.id !== theCulprit.id);
    const otherLiarsCombos = getCombinations(otherKids, exactLiars - 1);
    const trueLiars = [theCulprit, ...pickRandom(otherLiarsCombos)];

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
      return { kid, stmt: stmtInstance! };
    });

    const statementTexts = kidStatements.map((ks) => ks.stmt.text.en);
    if (new Set(statementTexts).size !== activeKids.length) {
      continue;
    }

    const solution = solvePuzzle(activeKids, numCulprits, exactLiars, kidStatements);

    if (solution.validSolutionsCount === 1) {
      const stmtInstances = kidStatements.map((ks) => ks.stmt);
      const puzzleId = encodePuzzleId(numKids, exactLiars, possibleLiars, stmtInstances);

      if (avoidIds.includes(puzzleId)) {
        continue;
      }

      const difficulty = calculateDifficulty(numKids, numCulprits, exactLiars, stmtInstances);

      return {
        id: '',
        type: 'pirralhos',
        number: 0,
        hashId: puzzleId,
        // Using the updated GeneratedKid structure
        kids: kidStatements.map((ks) => ({ kidId: ks.kid.id, statement: ks.stmt.text })),
        // Changed mapping to map by ID instead of cardId
        culpritId: trueCulprits.map((c) => c.id)[0],
        liarsIds: trueLiars.map((l) => l.id),
        possibleLiars,
        difficulty,
      };
    }
  }

  throw new Error('Could not generate a unique puzzle after 5000 attempts. Try adjusting the parameters.');
}

/**
 * Retrieves and reconstructs a puzzle from its hash ID.
 */
export function getPuzzleById(hashId: string): DailyPirralhosEntry {
  const { numKids, numCulprits, exactLiars, possibleLiars, parsedStmts } = decodePuzzleId(hashId);
  const activeKids = ALL_KIDS.slice(0, numKids);

  const kidStatements = activeKids.map((kid, index) => {
    const parsed = parsedStmts[index];
    const built = STATEMENT_POOL[parsed.type].build(kid, activeKids, parsed.param);
    return {
      kid,
      stmt: { type: parsed.type, param: parsed.param, ...built },
    };
  });

  const solution = solvePuzzle(activeKids, numCulprits, exactLiars, kidStatements);

  if (solution.validSolutionsCount !== 1) {
    throw new Error('Invalid puzzle ID provided. Puzzle does not have a unique solution.');
  }

  const stmtInstances = kidStatements.map((ks) => ks.stmt);
  const difficulty = calculateDifficulty(numKids, numCulprits, exactLiars, stmtInstances);

  return {
    id: '',
    type: 'pirralhos',
    number: 0,
    hashId,
    // Using the updated GeneratedKid structure
    kids: kidStatements.map((ks) => ({ kidId: ks.kid.id, statement: ks.stmt.text })),
    // Changed mapping to map by ID instead of cardId
    culpritId: solution.finalCulprits.map((c) => c.id)[0],
    liarsIds: solution.finalLiars.map((l) => l.id),
    possibleLiars,
    difficulty,
  };
}
