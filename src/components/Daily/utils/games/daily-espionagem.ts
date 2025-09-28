import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { calculateSuspectAnswersData } from 'components/Testimonies/utils';
import { useTDResource } from 'hooks/useTDResource';
import { cloneDeep, difference, intersection, isEmpty, sample, sampleSize, shuffle, uniq } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { CrimeReason, SuspectCard, TestimonyQuestionCard } from 'types';
import { ATTEMPTS_THRESHOLD, DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

/**
 * Debug logging function that only logs if debug mode is enabled for espionagem
 */
const debugLog = (...args: unknown[]) => {
  if (debugDailyStore.state.espionagem) {
    console.log(...args);
  }
};

/**
 * Debug count function that only counts if debug mode is enabled for espionagem
 */
const debugCount = (label: string) => {
  if (debugDailyStore.state.espionagem) {
    console.count(label);
  }
};

/**
 * Debug error function that only logs errors if debug mode is enabled for espionagem
 */
const debugError = (...args: unknown[]) => {
  if (debugDailyStore.state.espionagem) {
    console.error(...args);
  }
};

const FEATURE_PT_TRANSLATIONS: Dictionary<string> = {
  male: 'é homem',
  female: 'é mulher',
  caucasian: 'é branco(a)',
  black: 'é negro(a)',
  asian: 'é asiático(a)',
  latino: 'é latino(a)',
  thin: 'é magrelo(a)',
  fat: 'é gordo(a)',
  large: 'é gordo(a)',
  tall: 'é alto(a)',
  short: 'é baixinho(a)',
  young: 'é jovem',
  adult: 'é adulto(a)',
  senior: 'é da terceira idade',
  average: 'tem corpo normal',
  medium: 'é de altura média',
  mixed: 'é mestiço(a)',
  hat: 'está usando um chapéu',
  tie: 'está usando uma gravata',
  glasses: 'está usando óculos',
  brownHair: 'tem cabelo castanho',
  shortHair: 'tem cabelo curto',
  beard: 'tem barba',
  scarf: 'está usando um cachecol',
  blondeHair: 'tem cabelo loiro',
  longHair: 'tem cabelo longo',
  greyHair: 'tem cabelo grisalho',
  bald: 'é careca',
  mustache: 'tem bigode',
  goatee: 'tem cavanhaque',
  muscular: 'é sarado(a)',
  blackHair: 'tem cabelo preto',
  hoodie: 'está usando um moletom',
  earrings: 'está usando brincos',
  lipstick: 'está usando batom',
  necklace: 'está usando um colar',
  mediumHair: 'tem cabelo médio',
  'middle-eastern': 'é do Oriente Médio',
  headscarf: 'está usando um lenço na cabeça',
  redHair: 'tem cabelo ruivo',
  piercings: 'tem piercings',
  coloredHair: 'tem cabelo colorido',
  indian: 'é indiano(a)',
  'native-american': 'é nativo-americano(a)',
  noAccessories: 'está sem nenhum acessório',
  avoidingCamera: 'está evitando olhar para a câmera',
  wearingStripes: 'tem listras na roupa',
  blackClothes: 'está vestindo roupas pretas',
  blueClothes: 'está vestindo roupas azuis',
  greenClothes: 'está vestindo roupas verdes',
  redClothes: 'está vestindo roupas vermelhas',
  yellowClothes: 'está vestindo roupas amarelas',
  purpleClothes: 'está vestindo roupas roxas',
  orangeClothes: 'está vestindo roupas laranjas',
  brownClothes: 'está vestindo roupas marrons',
  whiteShirt: 'está usando camisa branca',
  pinkClothes: 'está vestindo roupas rosas',
  patternedShirt: 'está usando roupa estampada',
  buttonShirt: 'está usando camisa com botões',
  bow: 'está usando um laço',
  hairyChest: 'tem peito peludo',
  wearingFlowers: 'está usando flores',
  showTeeth: 'está mostrando os dentes',
  hairTie: 'está usando um xuxinha ou fita no cabelo',
  'non-binary': 'é não-binário(a)',
};

const TOTAL_SUSPECTS = 12;

type TestimonySuspectAnswers = Dictionary<Dictionary<boolean>>;

type StatementClue = {
  key: string;
  text: string;
  excludes: string[];
  type: 'testimony' | 'feature' | 'grid';
};

type SuspectEntry = {
  id: string;
  name: DualLanguageValue;
  gender: string;
  features: string[];
};

export type DailyEspionagemEntry = {
  id: DateKey;
  number: number;
  type: 'espionagem';
  setId: string;
  culpritId: string;
  statements: StatementClue[];
  additionalStatements: StatementClue[];
  isNsfw: boolean;
  suspects: SuspectEntry[];
  reason: DualLanguageValue;
  level: number;
};

export const useDailyEspionagemGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [espionagemHistory] = useParsedHistory(DAILY_GAMES_KEYS.ESPIONAGEM, dailyHistory);

  const suspectsQuery = useTDResource<SuspectCard>('suspects', enabled);
  const questionsQuery = useTDResource<TestimonyQuestionCard>(
    `testimony-questions-${queryLanguage}`,
    enabled,
  );
  const answersQuery = useTDResource<TestimonyAnswers>('testimony-answers', enabled);
  const reasonsQuery = useTDResource<CrimeReason>('crime-reasons', enabled);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only if data query is updated
  const testimonySuspectAnswers = useMemo(
    () => calculateSuspectAnswers(answersQuery.data),
    [answersQuery.dataUpdatedAt],
  );

  const featuresStats = useMemo(() => calculateFeaturesStats(suspectsQuery.data), [suspectsQuery.data]);

  const entries = useMemo(() => {
    if (
      !enabled ||
      !espionagemHistory ||
      !suspectsQuery.isSuccess ||
      !questionsQuery.isSuccess ||
      !answersQuery.isSuccess ||
      !reasonsQuery.isSuccess
    ) {
      return {};
    }

    return buildDailyEspionagemGames(
      batchSize,
      espionagemHistory,
      suspectsQuery.data,
      questionsQuery.data,
      testimonySuspectAnswers,
      featuresStats,
      reasonsQuery.data,
    );
  }, [
    enabled,
    espionagemHistory,
    suspectsQuery,
    questionsQuery,
    answersQuery,
    batchSize,
    testimonySuspectAnswers,
    featuresStats,
    reasonsQuery,
  ]);

  return {
    entries,
    isLoading: suspectsQuery.isLoading || questionsQuery.isLoading || answersQuery.isLoading,
  };
};

export const buildDailyEspionagemGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  suspects: Dictionary<SuspectCard>,
  questions: Dictionary<TestimonyQuestionCard>,
  suspectTestimonyAnswers: TestimonySuspectAnswers,
  featuresStats: Dictionary<Dictionary<true>>,
  reasons: Dictionary<CrimeReason>,
) => {
  debugCount('Creating Espionagem...');
  let lastDate = history.latestDate;
  const usedIds: string[] = [];

  const entries: Record<string, DailyEspionagemEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;

    // Try up to 100 times to generate a valid game
    let validGame = null;
    let attempts = 0;
    while (validGame === null && attempts < ATTEMPTS_THRESHOLD) {
      try {
        attempts++;
        const game = generateEspionagemGame(
          suspects,
          questions,
          suspectTestimonyAnswers,
          featuresStats,
          usedIds,
          reasons,
        );

        if (verifyGameDoability(game.statements)) {
          validGame = game;
          throw new Error(`Game is invalid after ${attempts} attempts`);
        }
      } catch (_error) {
        // debugError('BOOM', _error);
      }
    }

    if (!validGame) {
      throw new Error(`Failed to generate valid game for ${id} after ${attempts} attempts`);
    }
    debugLog(`Generated valid game for ${id} after ${attempts} attempts`);

    // Add culprit to used IDs to avoid reusing in future games
    usedIds.push(validGame.culpritId);

    entries[id] = {
      id,
      type: 'espionagem',
      number: history.latestNumber + i + 1,
      ...validGame,
    };
  }

  return entries;
};

function generateEspionagemGame(
  suspects: Dictionary<SuspectCard>,
  questions: Dictionary<TestimonyQuestionCard>,
  suspectTestimonyAnswers: TestimonySuspectAnswers,
  featuresStats: Dictionary<Dictionary<true>>,
  usedIds: string[],
  reasons: Dictionary<CrimeReason>,
): Omit<DailyEspionagemEntry, 'id' | 'number' | 'type'> {
  const statements: StatementClue[] = [];
  const excludeScoreBoard: Dictionary<number> = {};
  debugLog('SuspectTestimonyAnswers', suspectTestimonyAnswers);
  // Get two related testimonies, the culprit ID, and the common suspects
  const { selectedTestimonyId1, selectedTestimonyId2, culpritId, possibleSuspects, impossibleSuspects } =
    getTwoRelatedTestimonies(suspectTestimonyAnswers, usedIds);

  if (possibleSuspects.length < 2) {
    throw new Error('Not enough possible suspects');
  }

  let suspectsIds: string[] = [...possibleSuspects];

  // If there are not enough possible suspects, add new suspects that are not an impossible suspect
  if (possibleSuspects.length < TOTAL_SUSPECTS - 1) {
    const additionalSuspects = sampleSize(
      Object.keys(suspects).filter(
        (id) => !impossibleSuspects.includes(id) && !possibleSuspects.includes(id),
      ),
      TOTAL_SUSPECTS - possibleSuspects.length - 1,
    );
    suspectsIds.push(...additionalSuspects);
  }

  // Gather features the culprit does not have
  const featuresCulpritDoesNotHave: Dictionary<Dictionary<true>> = {};
  Object.keys(featuresStats).forEach((featureKey) => {
    if (featuresStats[featureKey][culpritId] === undefined) {
      // If at least one of the suspects has the feature, add it to the list
      const suspectsWithFeature = Object.keys(featuresStats[featureKey]).filter((suspectId) =>
        suspectsIds.includes(suspectId),
      );

      if (suspectsWithFeature.length > 0) {
        // Remove any suspect that is not part of the game
        const filteredSample: Dictionary<true> = {};
        suspectsWithFeature.forEach((id) => {
          if (suspectsIds.includes(id)) {
            filteredSample[id] = true;
          }
        });
        featuresCulpritDoesNotHave[featureKey] = filteredSample;
      }
    }
  });

  // TESTIMONY STATEMENT 1: Add testimony to statements
  const testimony1 = questions[selectedTestimonyId1];
  const testimonyStatement1 = getTestimonyStatement(
    culpritId,
    suspectsIds,
    testimony1,
    suspectTestimonyAnswers[selectedTestimonyId1],
  );
  statements.push(testimonyStatement1);
  updateExcludeScoreBoard(excludeScoreBoard, testimonyStatement1.excludes);

  // TESTIMONY STATEMENT 2: Add second testimony to statements
  const testimony2 = questions[selectedTestimonyId2];
  const testimonyStatement2 = getTestimonyStatement(
    culpritId,
    suspectsIds,
    testimony2,
    suspectTestimonyAnswers[selectedTestimonyId2],
  );
  statements.push(testimonyStatement2);
  updateExcludeScoreBoard(excludeScoreBoard, testimonyStatement2.excludes);

  // BEST FEATURE STATEMENT 1
  const bestFeatureStatement1 = getFeatureStatement(
    culpritId,
    suspectsIds,
    featuresCulpritDoesNotHave,
    [],
    'best',
  );
  if (bestFeatureStatement1.excludes.length === TOTAL_SUSPECTS - 2) {
    throw new Error('Best feature statement excludes too many suspects');
  }

  statements.push(bestFeatureStatement1);
  updateExcludeScoreBoard(excludeScoreBoard, bestFeatureStatement1.excludes);

  // BEST FEATURE STATEMENT 2
  const bestFeatureStatement2 = getFeatureStatement(
    culpritId,
    suspectsIds,
    featuresCulpritDoesNotHave,
    [bestFeatureStatement1],
    'best',
  );
  statements.push(bestFeatureStatement2);
  // updateExcludeScoreBoard(excludeScoreBoard, bestFeatureStatement2.excludes);

  // WORST FEATURE STATEMENT 1
  const worstFeatureStatement1 = getFeatureStatement(
    culpritId,
    suspectsIds,
    featuresCulpritDoesNotHave,
    [bestFeatureStatement1, bestFeatureStatement2], // Pass previous statements
    'worst',
  );
  statements.push(worstFeatureStatement1);
  updateExcludeScoreBoard(excludeScoreBoard, worstFeatureStatement1.excludes);

  // WORST FEATURE STATEMENT 2
  const worstFeatureStatement2 = getFeatureStatement(
    culpritId,
    suspectsIds,
    featuresCulpritDoesNotHave,
    [bestFeatureStatement1, bestFeatureStatement2, worstFeatureStatement1], // Pass previous statements
    'worst',
  );
  statements.push(worstFeatureStatement2);

  if (statements.length < 6) {
    throw new Error('Not enough statements generated');
  }

  // Create random grid positions for the suspects
  suspectsIds = shuffle([...suspectsIds, culpritId]);

  // COLUMN POSITION STATEMENT
  const columnPositionStatement = getGridStatement(culpritId, suspectsIds, statements, 'columns');
  statements.push(columnPositionStatement);
  updateExcludeScoreBoard(excludeScoreBoard, columnPositionStatement.excludes);

  // ROW POSITION STATEMENT
  const rowPositionStatement = getGridStatement(culpritId, suspectsIds, statements, 'rows');
  statements.push(rowPositionStatement);
  // updateExcludeScoreBoard(excludeScoreBoard, rowPositionStatement.excludes);

  // Order the statements by (testimony, feature, grid, then the other features)
  const sortedStatements = [
    testimonyStatement1,
    worstFeatureStatement1,
    testimonyStatement2,
    bestFeatureStatement1,
    columnPositionStatement,
    worstFeatureStatement2,
  ];

  const additionalStatements = [bestFeatureStatement2, rowPositionStatement];

  // Get reason
  const reason = getReason(suspects[culpritId], reasons);

  const relevantSuspectsFeaturesDict = getRelevantSuspectsFeaturesDict([
    ...sortedStatements,
    ...additionalStatements,
  ]);

  return {
    isNsfw: testimony1.nsfw || testimony2.nsfw || false,
    culpritId,
    statements: sortedStatements,
    additionalStatements,
    suspects: createSuspectEntry(suspectsIds, suspects, relevantSuspectsFeaturesDict),
    reason: reason.title,
    setId: `${culpritId}::${reason.id}::${sortedStatements[0].key}`,
    level: determineLevel(sortedStatements),
  };
}

const getRelevantSuspectsFeaturesDict = (statements: StatementClue[]) => {
  const usedFeaturesDictionary: Dictionary<true> = {};
  statements.forEach((feature) => {
    if (feature.key.includes('.feature.')) {
      const featureKey = feature.key.split('not.feature.')[1];
      usedFeaturesDictionary[featureKey] = true;
    }
  });
  const RELATED_FEATURE_GROUPS = {
    hairColor: ['brownHair', 'blondeHair', 'greyHair', 'redHair', 'blackHair', 'coloredHair'],
    hairLength: ['shortHair', 'mediumHair', 'longHair', 'bald'],
    facialHair: ['beard', 'mustache', 'goatee'],
  };
  // Make sure related features are always included
  for (const [, features] of Object.entries(RELATED_FEATURE_GROUPS)) {
    if (features.some((feature) => usedFeaturesDictionary[feature])) {
      features.forEach((feature) => {
        usedFeaturesDictionary[feature] = true;
      });
    }
  }
  return usedFeaturesDictionary;
};

const createSuspectEntry = (
  suspectsIds: string[],
  suspects: Dictionary<SuspectCard>,
  relevantSuspectsFeaturesDict: Dictionary<true>,
): SuspectEntry[] => {
  return suspectsIds.map((id) => {
    const suspect = suspects[id];

    const age: string =
      {
        '18-21': 'young',
        '21-30': 'adult',
        '30-40': 'adult',
        '40-50': 'adult',
        '50-60': 'senior',
        '60-70': 'senior',
        '70-80': 'senior',
        '80-90': 'senior',
      }[suspect.age as string] || suspect.age;

    const allFeatures = [suspect.gender, age, suspect.ethnicity, suspect.height, suspect.build];

    // Keep only the features that are used in the statements (and directly related ones)
    const features = suspect.features.filter((feature) => relevantSuspectsFeaturesDict[feature]);

    return {
      id: suspect.id,
      name: suspect.name,
      gender: suspect.gender,
      features: [...allFeatures, ...features],
    };
  });
};

/**
 * Calculates suspect answers based on testimonies data.
 *
 * @param data - Dictionary of testimony answers organized by question ID and then by suspect ID
 * @returns A processed object containing determined boolean values for each question and suspect
 *
 * The function applies the following rules:
 * - Ignores testimonies with less than 3 answers per suspect
 * - If all answers for a suspect are the same (all 0s or all 1s), uses that value
 * - If a testimony has at least 3 zeroes, considers it false
 * - If a testimony has at least 3 ones, considers it true
 * - Removes questions with no valid testimonies
 * - Removes questions with less than 3 suspect answers
 * - Removes questions where all suspects gave the same answer
 */
const calculateSuspectAnswers = (data: Dictionary<TestimonyAnswers>) => {
  const result: TestimonySuspectAnswers = {};
  debugLog('⚙️ Calculating suspect answers...');
  for (const questionId of Object.keys(data)) {
    const questionTestimonies = data[questionId];
    for (const suspectId of Object.keys(questionTestimonies)) {
      const { resolution, projection } = calculateSuspectAnswersData(suspectId, questionTestimonies);

      if (!resolution && !projection) {
        // debugLog('⁉️ Ignoring testimony with no resolution or projection');
        continue;
      }

      if (result[questionId] === undefined) {
        result[questionId] = {};
      }

      if (resolution) {
        result[questionId][suspectId] = resolution === '👍';
        continue;
      }

      if (projection) {
        result[questionId][suspectId] = projection === '👍';
        // continue;
      }

      // debugLog('⁉️ Ignoring testimony with not enough values');
    }
  }

  // Remove any empty object in result
  Object.keys(result).forEach((key) => {
    if (isEmpty(result[key])) {
      delete result[key];
    }
  });

  // Delete any entry with less than 3 answers
  Object.keys(result).forEach((key) => {
    if (Object.keys(result[key]).length < 3) {
      debugLog('⁉️ Removing testimonies with less than 3 answers');
      delete result[key];
    }
  });

  // Delete any entry that all the answers are the same
  Object.keys(result).forEach((key) => {
    const answers = uniq(Object.values(result[key]));
    if (answers.length === 1) {
      debugLog('⁉️ Removing testimonies with the same answer');
      delete result[key];
    }
  });

  return result;
};

/**
 * Calculates statistics about each suspect based on their attributes.
 *
 * This function processes suspect data and organizes it by various attributes
 * (gender, ethnicity, age, build, height, and features) to create a mapping
 * where each attribute points to the suspects that have it.
 *
 * The function also:
 * - Creates aggregated age groups ('young', 'adult', 'senior')
 * - Removes certain attributes that are not useful for gameplay
 * - Logs warnings for suspects with missing required attributes
 *
 * @param data - Dictionary mapping suspect IDs to their attribute cards
 * @returns A dictionary where keys are attributes and values are dictionaries of suspect IDs that have those attributes
 */
const calculateFeaturesStats = (data: Dictionary<SuspectCard>) => {
  const result: Dictionary<Dictionary<true>> = {};

  // Gather the props (gender, ethnicity, build, and every feature) for each suspect
  for (const suspectId of Object.keys(data)) {
    const { gender, ethnicity, age, build, height, features } = data[suspectId];
    if (!build) {
      debugLog('⁉️ Ignoring suspect with missing build', suspectId);
      continue;
    }

    if (!height) {
      debugLog('⁉️ Ignoring suspect with missing height', suspectId);
      continue;
    }

    if (!features || features.length === 0) {
      debugLog('⁉️ Ignoring suspect with missing features', suspectId);
      continue;
    }

    if (result[gender] === undefined) {
      result[gender] = {};
    }
    result[gender][suspectId] = true;

    if (result[ethnicity] === undefined) {
      result[ethnicity] = {};
    }
    result[ethnicity][suspectId] = true;

    if (result[age] === undefined) {
      result[age] = {};
    }
    result[age][suspectId] = true;

    if (result[build] === undefined) {
      result[build] = {};
    }
    result[build][suspectId] = true;

    if (result[height] === undefined) {
      result[height] = {};
    }
    result[height][suspectId] = true;

    features.forEach((feature) => {
      if (result[feature] === undefined) {
        result[feature] = {};
      }
      result[feature][suspectId] = true;
    });
  }

  // Update age groups
  result.young = cloneDeep(result['18-21']);
  result.adult = cloneDeep({ ...result['21-30'], ...result['30-40'], ...result['40-50'] });
  result.senior = cloneDeep({
    ...result['50-60'],
    ...result['60-70'],
    ...result['70-80'],
    ...result['80-90'],
  });

  // List of features that will not be helpful in the game
  const BANNED_FEATURES = [
    '18-21',
    '21-30',
    '30-40',
    '40-50',
    '50-60',
    '60-70',
    '70-80',
    '80-90',
    'average',
    'medium',
    'mixed',
    'adult',
    'tall',
  ];

  // Remove the features that are not helpful
  BANNED_FEATURES.forEach((feature) => {
    delete result[feature];
  });

  return result;
};

const getTwoRelatedTestimonies = (suspectTestimonyAnswers: TestimonySuspectAnswers, usedIds: string[]) => {
  // Using while, try a maximum of 500 attempts to get a random testimony, and then another testimony that has the at least one suspect in common

  let attempts = 0;
  let testimonyId1: string | undefined;
  let testimonyId2: string | undefined;
  let commonSuspects: string[] = [];

  while (attempts < ATTEMPTS_THRESHOLD && !testimonyId2 && commonSuspects.length === 0) {
    attempts++;
    testimonyId1 = sample(Object.keys(suspectTestimonyAnswers));
    if (!testimonyId1) {
      throw new Error('Failed to find a testimony');
    }

    // Get the suspects in this testimony
    const suspectsInTestimony1 = Object.keys(suspectTestimonyAnswers[testimonyId1]);

    // Get a second testimony that has at least one suspect in common with the first
    testimonyId2 = sample(
      Object.keys(suspectTestimonyAnswers).filter(
        (id) =>
          id !== testimonyId1 &&
          !isEmpty(difference(suspectsInTestimony1, Object.keys(suspectTestimonyAnswers[id]))),
      ),
    );

    if (testimonyId2) {
      commonSuspects = intersection(
        Object.keys(suspectTestimonyAnswers[testimonyId1]),
        Object.keys(suspectTestimonyAnswers[testimonyId2]),
      );
      break;
    }
  }

  if (!testimonyId1 || !testimonyId2 || commonSuspects.length < 3) {
    throw new Error('Failed to find two related testimonies');
  }

  // Determine the culprit among the common suspects
  const culpritId = sample(commonSuspects.filter((id) => !usedIds.includes(id)));
  if (!culpritId) {
    throw new Error('Failed to determine a culprit from common suspects');
  }

  debugLog('<===============>');
  debugLog(`⚙️ Selected testimonies 1: ${testimonyId1}`);
  debugLog(suspectTestimonyAnswers[testimonyId1]);
  debugLog(`⚙️ Selected testimonies 2: ${testimonyId2}`);
  debugLog(suspectTestimonyAnswers[testimonyId2]);
  debugLog(`⚙️ Culprit ID: ${culpritId}`);
  debugLog(`Testimony 1 answers: ${suspectTestimonyAnswers[testimonyId1][culpritId]}`);
  debugLog(`Testimony 2 answers: ${suspectTestimonyAnswers[testimonyId2][culpritId]}`);

  // Remove any suspect that has the same answer in both testimonies as the culprit
  const culpritAnswerKey = `${suspectTestimonyAnswers[testimonyId1][culpritId]}-${suspectTestimonyAnswers[testimonyId2][culpritId]}`;

  // Filter out suspects that have the same answer as the culprit
  const possibleSuspects = sampleSize(
    commonSuspects.filter(
      (suspectId) =>
        suspectId !== culpritId &&
        `${suspectTestimonyAnswers[testimonyId1][suspectId]}-${suspectTestimonyAnswers[testimonyId2][suspectId]}` !==
          culpritAnswerKey,
    ),
    TOTAL_SUSPECTS - 1,
  );
  const impossibleSuspects = difference(commonSuspects, possibleSuspects);
  debugLog(`⚙️ Possible suspects: ${possibleSuspects.join(', ')}`);
  debugLog(`⚙️ Impossible suspects: ${impossibleSuspects.join(', ')}`);

  debugLog(`⚙️ Attempts made: ${attempts}`);
  debugLog('>===============<');
  return {
    selectedTestimonyId1: testimonyId1,
    selectedTestimonyId2: testimonyId2,
    culpritId,
    possibleSuspects,
    impossibleSuspects,
  };
};

const updateExcludeScoreBoard = (scoreboard: Dictionary<number>, excludes: string[]) => {
  excludes.forEach((id) => {
    if (scoreboard[id] === undefined) {
      scoreboard[id] = 0;
    }
    scoreboard[id]++;
  });
};

const getTestimonyStatement = (
  culpritId: string,
  suspectsIds: string[],
  testimony: TestimonyQuestionCard,
  answers: Dictionary<boolean>,
): StatementClue => {
  const culpritAnswer = answers[culpritId];

  const excludes = suspectsIds.filter(
    (suspectId) => answers[suspectId] !== undefined && answers[suspectId] !== culpritAnswer,
  );

  // Make first character in answer lowercase
  const answer = testimony.answer.charAt(0).toLowerCase() + testimony.answer.slice(1);

  const result = {
    key: `testimony.${testimony.id}`,
    text: `O(a) suspeito(a) ${culpritAnswer ? '' : 'não '}${answer}`,
    excludes,
    type: 'testimony' as const,
  };

  // if the text has "não já", replace this part with "nunca"
  if (result.text.includes('não já')) {
    result.text = result.text.replace('não já', 'nunca');
  }

  return result;
};

const GRID_COLUMNS_INDEXES: Dictionary<{ indexes: number[]; text: string }> = {
  column1: {
    indexes: [0, 4, 8],
    text: 'na primeira coluna',
  },
  column2: {
    indexes: [1, 5, 9],
    text: 'na segunda coluna',
  },
  column3: {
    indexes: [2, 6, 10],
    text: 'na terceira coluna',
  },
  column4: {
    indexes: [3, 7, 11],
    text: 'na quarta coluna',
  },
  corners: {
    indexes: [0, 3, 8, 11],
    text: 'nos cantos',
  },
};

const ROWS_COLUMNS_GRID_INDEXES: Dictionary<{ indexes: number[]; text: string }> = {
  row1: {
    indexes: [0, 1, 2, 3],
    text: 'na primeira linha',
  },
  row2: {
    indexes: [4, 5, 6, 7],
    text: 'na segunda linha',
  },
  row3: {
    indexes: [8, 9, 10, 11],
    text: 'na terceira linha',
  },
};

const getGridStatement = (
  culpritId: string,
  suspectsIds: string[],
  statements: StatementClue[],
  type: 'rows' | 'columns',
): StatementClue => {
  // Get culprit row and column
  const culpritPosition = suspectsIds.indexOf(culpritId);
  // Calculate the grid rule that has the least amount of excludes

  const basicStatements = statements.slice(0, 3);

  const INDEXES = type === 'rows' ? ROWS_COLUMNS_GRID_INDEXES : GRID_COLUMNS_INDEXES;

  const gridIndexesCounts: Dictionary<number> = {};
  for (const key of Object.keys(INDEXES)) {
    const { indexes } = INDEXES[key];

    if (indexes.includes(culpritPosition)) {
      continue;
    }

    gridIndexesCounts[key] = indexes.reduce((acc, index) => {
      const suspectId = suspectsIds[index];

      // Count how many times this suspect appears in the excludes array of basicStatements
      const excludeCount = basicStatements.filter((statement) =>
        statement.excludes.includes(suspectId),
      ).length;

      if (excludeCount > 0) {
        return acc + excludeCount;
      }

      return acc;
    }, 0);
  }

  // Group grid positions by their exclusion count
  const groupedByCount = Object.entries(gridIndexesCounts).reduce(
    (acc: Dictionary<string[]>, [key, count]) => {
      if (!acc[count]) {
        acc[count] = [];
      }
      acc[count].push(key);
      return acc;
    },
    {},
  );

  // Find the minimum count value
  const minCount = Math.min(...Object.keys(gridIndexesCounts).map((key) => gridIndexesCounts[key]));

  // Get all grid positions with the minimum count
  const bestOptions = groupedByCount[minCount.toString()];

  // Randomly select one of the best options
  const bestGridCondition = sample(bestOptions) || Object.keys(gridIndexesCounts)[0];

  const excludes = INDEXES[bestGridCondition].indexes.map((index) => suspectsIds[index]);

  return {
    key: `not.grid.${bestGridCondition}`,
    text: `O(a) suspeito(a) não está ${INDEXES[bestGridCondition].text}`,
    excludes,
    type: 'grid' as const,
  };
};

const getFeatureStatement = (
  culpritId: string,
  suspectsIds: string[],
  featuresCulpritDoesNotHave: Dictionary<Dictionary<true>>,
  previousStatements: StatementClue[] = [],
  type: 'best' | 'worst' = 'best',
): StatementClue => {
  const suspectsWithoutCulprit = difference(suspectsIds, [culpritId]);

  // Extract used features from previous statements
  const usedFeatures = previousStatements
    .filter((stmt) => stmt.key.startsWith('not.feature.'))
    .map((stmt) => stmt.key.replace('not.feature.', ''));

  // Get all previously excluded suspects
  const previouslyExcludedSuspects = new Set(previousStatements.flatMap((stmt) => stmt.excludes));

  // Rank features by the number of suspects that have them
  // Ignore any features that have more than 6 suspects
  // Sort them by number of suspects that have them
  const sortedFeatures = Object.keys(featuresCulpritDoesNotHave)
    .filter(
      (feature) =>
        Object.keys(featuresCulpritDoesNotHave[feature]).length <= 6 && !usedFeatures.includes(feature),
    )
    .sort(
      (a, b) =>
        Object.keys(featuresCulpritDoesNotHave[b]).length - Object.keys(featuresCulpritDoesNotHave[a]).length,
    );

  // Try to find a feature that excludes at least one suspect not previously excluded
  let selectedFeature: string | undefined;
  let excludes: string[] = [];
  let attempts = 0;
  const maxAttempts = 500;

  while (attempts < maxAttempts) {
    attempts++;

    // Select a candidate feature based on the type
    const candidateFeature =
      type === 'best' ? sortedFeatures[0] : (sample(sortedFeatures.slice(2, 5)) ?? sortedFeatures[2]);

    if (!candidateFeature) {
      break;
    }

    // Find suspects excluded by this feature
    const candidateExcludes = suspectsWithoutCulprit.filter(
      (suspectId) => featuresCulpritDoesNotHave[candidateFeature][suspectId],
    );

    // Check if this excludes any new suspects
    const hasNewExcludes = candidateExcludes.some((id) => !previouslyExcludedSuspects.has(id));

    if (hasNewExcludes || attempts === maxAttempts) {
      selectedFeature = candidateFeature;
      excludes = candidateExcludes;
      break;
    }

    // Remove this feature from consideration and try again
    sortedFeatures.splice(sortedFeatures.indexOf(candidateFeature), 1);
  }

  if (!selectedFeature) {
    throw Error(`No suitable feature found for ${type} selection after ${maxAttempts} attempts`);
  }
  debugLog(`Selected feature after ${attempts} attempts: ${selectedFeature}`);

  const translatedFeature = FEATURE_PT_TRANSLATIONS[selectedFeature];

  if (!translatedFeature) {
    debugError(`Feature ${selectedFeature} not found in translations`);
  }

  return {
    key: `not.feature.${selectedFeature}`,
    text: `O(a) suspeito(a) não ${translatedFeature || selectedFeature}`,
    excludes,
    type: 'feature' as const,
  };
};

const verifyGameDoability = (statements: StatementClue[]) => {
  const firstThree = statements.slice(0, 3);

  // Easiness of puzzle based on total excludes
  const totalExcludes = firstThree.reduce((acc, stmt) => acc + stmt.excludes.length, 0);
  if (totalExcludes < 10) {
    return false;
  }

  // Gather the first 3 statements and all unique excludes
  const uniqueExcludes = new Set(firstThree.flatMap((stmt) => stmt.excludes));
  return uniqueExcludes.size === TOTAL_SUSPECTS - 1;
};

const getReason = (suspect: SuspectCard, reasons: Dictionary<CrimeReason>): CrimeReason => {
  const availableReasons: CrimeReason[] = [];

  Object.values(reasons).forEach((reason) => {
    if (reason.feature === 'general') {
      availableReasons.push(reason);
    }

    if (suspect.features?.includes(reason.feature)) {
      availableReasons.push(reason);
    }
  });

  const selection = sample(availableReasons);
  if (selection) {
    return selection;
  }

  return {
    id: 'unknown',
    title: {
      pt: 'Motivo desconhecido',
      en: 'Unknown reason',
    },
    feature: 'general',
  };
};

const determineLevel = (statements: StatementClue[]) => {
  const firstThree = statements.slice(0, 3);

  const levels: number[] = [];

  const levelsByExcludes: Dictionary<number> = {
    1: 4,
    2: 3,
    3: 3,
    4: 2,
    5: 2,
    6: 1,
    7: 0,
    8: 0,
  };

  firstThree.forEach((stmt) => {
    const excludesCount = stmt.excludes.length;
    if (levelsByExcludes[excludesCount] !== undefined) {
      levels.push(levelsByExcludes[excludesCount]);
    }
  });

  // Return the average level rounded up
  const average = Math.round(levels.reduce((acc, level) => acc + level, 0) / levels.length);
  // make sure the average is at least 1 and the max is 3
  return Math.min(Math.max(average, 1), 3);
};
