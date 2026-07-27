/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { calculateSuspectAnswersData } from '@components/Testimonies/utils';
import { useTDResource } from '@hooks/useTDResource';
import {
  type TestimonyAnswers,
  testimoniesDeserializer,
} from '@pages/Libraries/Testimonies/useTestimoniesResource';
import { useQuery } from '@tanstack/react-query';
import type { CrimeReasonData, SuspectCardData, TestimonyQuestionCardData } from '@types';
import { cloneDeep, difference, isEmpty, sample, sampleSize, shuffle, uniq } from 'lodash';
import { ATTEMPTS_THRESHOLD, DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

const FEATURE_PT_TRANSLATIONS: Dictionary<string> = {
  male: 'é homem',
  female: 'é mulher',
  caucasian: 'é branco(a)',
  white: 'é branco(a)',
  black: 'é negro(a)',
  asian: 'é asiático(a)',
  latino: 'é latino(a)',
  brown: 'é pardo/moreno/marrom',
  thin: 'é magrelo(a)',
  fat: 'é gordo(a)',
  large: 'é gordo(a)',
  tall: 'é alto(a)',
  short: 'é baixinho(a)',
  undefinedAge: 'sem idade definida',
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
  beigeClothes: 'está vestindo roupas bege',
  greyClothes: 'está vestindo roupas cinzas',
  whiteShirt: 'está usando camisa branca',
  pinkClothes: 'está vestindo roupas rosas',
  patternedShirt: 'está usando roupa estampada',
  buttonShirt: 'está usando camisa com botões',
  bow: 'está usando um laço',
  hairyChest: 'está mostrando o peito peludo',
  wearingFlowers: 'está usando flores',
  showTeeth: 'está mostrando os dentes',
  hairTie: 'está usando um xuxinha ou fita no cabelo',
  'non-binary': 'é não-binário(a)',
  shirtless: 'está sem camisa/roupa',
  holdingSomething: 'está segurando algo',
  suspenders: 'está usando suspensórios',
  zipper: 'tem zíper na roupa',
  turtleNeck: 'está usando gola rolê',
};

const TOTAL_SUSPECTS_WEEKDAY = 12;
const TOTAL_SUSPECTS_WEEKEND = 16;

type TestimonySuspectAnswers = Dictionary<Dictionary<boolean>>;

type StatementClue = {
  /**
   * Unique identifier for this statement
   */
  key: string;
  /**
   * Display text for the clue
   */
  text: string;
  /**
   * Suspect IDs excluded by this statement
   */
  excludes: string[];
  /**
   * Statement category
   */
  type: 'testimony' | 'feature' | 'grid';
};

type SuspectEntry = {
  /**
   * Suspect card ID
   */
  id: string;
  /**
   * Suspect's name in multiple languages
   */
  name: DualLanguageValue;
  /**
   * Gender identifier
   */
  gender: string;
  /**
   * Physical and clothing features
   */
  features: string[];
};

export type DailyInvestigacaoEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'investigacao';
  /**
   * Combined identifier: culpritId::reasonId::firstStatementKey
   */
  setId: string;
  /**
   * Suspect card ID of the culprit
   */
  culpritId: string;
  /**
   * Main clue statements (6 for weekday, 8 for weekend)
   */
  statements: StatementClue[];
  /**
   * Additional grid position statements
   */
  additionalStatements: StatementClue[];
  /**
   * Whether testimonies contain NSFW content
   */
  isNsfw: boolean;
  /**
   * Suspect lineup (12 for weekday, 16 for weekend)
   */
  suspects: SuspectEntry[];
  /**
   * Crime motive
   */
  reason: DualLanguageValue;
  /**
   * Difficulty level (1-3)
   */
  level: number;
};

/**
 * Hook for generating daily Investigação games
 *
 * Creates suspect investigation puzzles where players eliminate suspects using testimony, feature,
 * and grid position clues. Weekday games have 12 suspects and 6 statements; weekend games have
 * 16 suspects and 8 statements.
 *
 * @param enabled - Whether the generation is enabled
 * @param queryLanguage - Target language for testimony questions
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used culprits
 * @returns Generated Investigação game entries with history updates
 */
export const useDailyInvestigacaoGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyInvestigacaoEntry> => {
  // Fetch prerequisite data
  const [investigacaoHistory] = useParsedHistory(DAILY_GAMES_KEYS.INVESTIGACAO, dailyHistory);

  const suspectsQuery = useTDResource<SuspectCardData>('suspects', { enabled });
  const questionsQuery = useTDResource<TestimonyQuestionCardData>(`testimony-questions-${queryLanguage}`, {
    enabled,
  });
  const answersQuery = useTDResource<TestimonyAnswers, Dictionary<string>>('testimony-answers', {
    select: testimoniesDeserializer,
    enabled,
  });
  const reasonsQuery = useTDResource<CrimeReasonData>('crime-reasons', { enabled });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate =
    enabled &&
    !!investigacaoHistory &&
    suspectsQuery.isSuccess &&
    questionsQuery.isSuccess &&
    answersQuery.isSuccess &&
    reasonsQuery.isSuccess;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: [
      'generate-daily',
      'investigacao',
      batchSize,
      suspectsQuery.dataUpdatedAt,
      questionsQuery.dataUpdatedAt,
      answersQuery.dataUpdatedAt,
      reasonsQuery.dataUpdatedAt,
    ],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (
        !investigacaoHistory ||
        !suspectsQuery.data ||
        !questionsQuery.data ||
        !answersQuery.data ||
        !reasonsQuery.data
      ) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      // Execute heavy calculations inside query to avoid blocking React renders
      const testimonySuspectAnswers = calculateSuspectAnswers(answersQuery.data);
      const featuresStats = calculateFeaturesStats(suspectsQuery.data);

      return buildDailyInvestigacaoGames(
        batchSize,
        investigacaoHistory,
        suspectsQuery.data,
        questionsQuery.data,
        testimonySuspectAnswers,
        featuresStats,
        reasonsQuery.data,
      );
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading:
      !isReadyToGenerate ||
      suspectsQuery.isLoading ||
      questionsQuery.isLoading ||
      answersQuery.isLoading ||
      reasonsQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: investigacaoHistory?.latestDate ?? '',
      latestNumber: investigacaoHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Investigação games
 *
 * Generates investigation puzzles by:
 * 1. Selecting a culprit and building a compatible suspect lineup
 * 2. Creating testimony statements that exclude different suspect groups
 * 3. Adding feature-based clues (physical characteristics)
 * 4. Including grid position hints
 * 5. Validating solvability before finalizing
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used culprits
 * @param suspects - Available suspect cards
 * @param questions - Testimony questions in target language
 * @param suspectTestimonyAnswers - Pre-calculated testimony answers per suspect
 * @param featuresStats - Feature distribution across suspects
 * @param reasons - Available crime motives
 * @returns Generated entries, errors, and history update
 */
export const buildDailyInvestigacaoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  suspects: Dictionary<SuspectCardData>,
  questions: Dictionary<TestimonyQuestionCardData>,
  suspectTestimonyAnswers: TestimonySuspectAnswers,
  featuresStats: Dictionary<Dictionary<true>>,
  reasons: Dictionary<CrimeReasonData>,
) => {
  if (debugDailyStore.state.investigacao) {
    console.count('Creating Investigacao...');
  }

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  const errors: string[] = [];
  const entries: Record<string, DailyInvestigacaoEntry> = {};
  const historyUsedStrings: string[] = [];

  // Extract culprit IDs from historical strings (Format: "culpritId::reasonId::statementKey")
  const usedCulpritIds: string[] = history.used.map((usedStr) => usedStr.split('::')[0]);

  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(latestDate);
    const isWeekend = checkWeekend(id);

    latestDate = id;
    latestNumber = history.latestNumber + i + 1;

    try {
      let validGame: Omit<DailyInvestigacaoEntry, 'id' | 'number' | 'type'> | null = null;
      let attempts = 0;

      // Retry until a solvable game is found
      while (validGame === null && attempts < ATTEMPTS_THRESHOLD) {
        try {
          attempts++;
          const game = generateInvestigacaoGame(
            suspects,
            questions,
            suspectTestimonyAnswers,
            featuresStats,
            usedCulpritIds,
            reasons,
            isWeekend,
          );

          if (verifyGameDoability(game.statements, isWeekend)) {
            validGame = game;
          }
        } catch (_error) {
          // Retry on inner iteration errors
        }
      }

      if (!validGame) {
        throw new Error(`Exhausted ${ATTEMPTS_THRESHOLD} attempts without finding a doable scenario.`);
      }

      if (debugDailyStore.state.investigacao) {
        console.log(`Generated valid game for ${id} after ${attempts} attempts`);
      }

      // Track culprit usage for history
      usedCulpritIds.push(validGame.culpritId);
      historyUsedStrings.push(validGame.setId);

      entries[id] = {
        id,
        type: 'investigacao',
        number: latestNumber,
        ...validGame,
      };
    } catch (error: unknown) {
      if (debugDailyStore.state.investigacao) {
        console.error(`Investigação Day ${id} Failed:`, error);
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
      used: historyUsedStrings,
      updateType: 'add' as const,
    },
  };
};

function generateInvestigacaoGame(
  suspects: Dictionary<SuspectCardData>,
  questions: Dictionary<TestimonyQuestionCardData>,
  suspectTestimonyAnswers: TestimonySuspectAnswers,
  featuresStats: Dictionary<Dictionary<true>>,
  usedIds: string[],
  reasons: Dictionary<CrimeReasonData>,
  isWeekend: boolean,
): Omit<DailyInvestigacaoEntry, 'id' | 'number' | 'type'> {
  const statements: StatementClue[] = [];
  const excludeScoreBoard: Dictionary<number> = {};
  const totalSuspects = isWeekend ? TOTAL_SUSPECTS_WEEKEND : TOTAL_SUSPECTS_WEEKDAY;

  if (debugDailyStore.state.investigacao) {
    console.log('SuspectTestimonyAnswers', suspectTestimonyAnswers);
  }

  const scenario = findInvestigacaoScenario(suspectTestimonyAnswers, usedIds, isWeekend);
  const culpritId = scenario.culpritId;
  const suspectsIds = scenario.suspectsIds;

  // Gather features the culprit does not have
  const featuresCulpritDoesNotHave: Dictionary<Dictionary<true>> = {};
  Object.keys(featuresStats).forEach((featureKey) => {
    if (featuresStats[featureKey][culpritId] === undefined) {
      const suspectsWithFeature = Object.keys(featuresStats[featureKey]).filter((suspectId) =>
        suspectsIds.includes(suspectId),
      );

      if (suspectsWithFeature.length > 0) {
        const filteredSample: Dictionary<true> = {};
        suspectsWithFeature.forEach((sid) => {
          if (suspectsIds.includes(sid)) {
            filteredSample[sid] = true;
          }
        });
        featuresCulpritDoesNotHave[featureKey] = filteredSample;
      }
    }
  });

  // TESTIMONY STATEMENT 1
  const testimony1 = questions[scenario.selectedTestimonyId1];
  if (!testimony1) throw new Error('Failed to load Testimony 1');
  const testimonyStatement1 = getTestimonyStatement(
    culpritId,
    suspectsIds,
    testimony1,
    suspectTestimonyAnswers[scenario.selectedTestimonyId1],
  );
  statements.push(testimonyStatement1);
  updateExcludeScoreBoard(excludeScoreBoard, testimonyStatement1.excludes);

  // TESTIMONY STATEMENT 2
  const testimony2 = questions[scenario.selectedTestimonyId2];
  if (!testimony2) throw new Error('Failed to load Testimony 2');
  const testimonyStatement2 = getTestimonyStatement(
    culpritId,
    suspectsIds,
    testimony2,
    suspectTestimonyAnswers[scenario.selectedTestimonyId2],
  );
  statements.push(testimonyStatement2);
  updateExcludeScoreBoard(excludeScoreBoard, testimonyStatement2.excludes);

  // TESTIMONY STATEMENT 3
  const testimony3 = questions[scenario.selectedTestimonyId3];
  if (!testimony3) throw new Error('Failed to load Testimony 3');
  const testimonyStatement3 = getTestimonyStatement(
    culpritId,
    suspectsIds,
    testimony3,
    suspectTestimonyAnswers[scenario.selectedTestimonyId3],
  );
  statements.push(testimonyStatement3);
  updateExcludeScoreBoard(excludeScoreBoard, testimonyStatement3.excludes);

  // TESTIMONY STATEMENT 4 (weekend only)
  let testimonyStatement4: StatementClue | undefined;
  if (isWeekend && scenario.selectedTestimonyId4) {
    const testimony4 = questions[scenario.selectedTestimonyId4];
    if (testimony4) {
      testimonyStatement4 = getTestimonyStatement(
        culpritId,
        suspectsIds,
        testimony4,
        suspectTestimonyAnswers[scenario.selectedTestimonyId4],
      );
      statements.push(testimonyStatement4);
      updateExcludeScoreBoard(excludeScoreBoard, testimonyStatement4.excludes);
    }
  }

  // FEATURE STATEMENT 1
  const featureStatement1 = getFeatureStatement(
    culpritId,
    suspectsIds,
    featuresCulpritDoesNotHave,
    [],
    'worst',
    totalSuspects,
  );
  if (featureStatement1.excludes.length === totalSuspects - 2) {
    throw new Error('Feature statement 1 excludes too many suspects');
  }
  statements.push(featureStatement1);
  updateExcludeScoreBoard(excludeScoreBoard, featureStatement1.excludes);

  // FEATURE STATEMENT 2
  const featureStatement2 = getFeatureStatement(
    culpritId,
    suspectsIds,
    featuresCulpritDoesNotHave,
    [featureStatement1],
    'worst',
    totalSuspects,
  );
  statements.push(featureStatement2);
  updateExcludeScoreBoard(excludeScoreBoard, featureStatement2.excludes);

  // FEATURE STATEMENT 3
  const featureStatement3 = getFeatureStatement(
    culpritId,
    suspectsIds,
    featuresCulpritDoesNotHave,
    [featureStatement1, featureStatement2],
    'worst',
    totalSuspects,
  );
  statements.push(featureStatement3);
  updateExcludeScoreBoard(excludeScoreBoard, featureStatement3.excludes);

  // FEATURE STATEMENT 4 (weekend only)
  let featureStatement4: StatementClue | undefined;
  if (isWeekend) {
    featureStatement4 = getFeatureStatement(
      culpritId,
      suspectsIds,
      featuresCulpritDoesNotHave,
      [featureStatement1, featureStatement2, featureStatement3],
      'worst',
      totalSuspects,
    );
    statements.push(featureStatement4);
    updateExcludeScoreBoard(excludeScoreBoard, featureStatement4.excludes);
  }

  const expectedStatements = isWeekend ? 8 : 6;
  if (statements.length < expectedStatements) {
    throw new Error(`Not enough statements generated: ${statements.length} < ${expectedStatements}`);
  }

  const shuffledSuspectsIds = shuffle(suspectsIds);
  const usedGridKeys: string[] = [];

  // GRID STATEMENT 1 - COLUMN POSITION
  const gridStatement1 = getGridStatement(
    culpritId,
    shuffledSuspectsIds,
    statements,
    'columns',
    totalSuspects,
    usedGridKeys,
  );
  usedGridKeys.push(gridStatement1.key.replace('not.grid.', ''));

  // GRID STATEMENT 2 - ROW POSITION
  const gridStatement2 = getGridStatement(
    culpritId,
    shuffledSuspectsIds,
    statements,
    'rows',
    totalSuspects,
    usedGridKeys,
  );
  usedGridKeys.push(gridStatement2.key.replace('not.grid.', ''));

  // GRID STATEMENT 3 - CORNERS/ANY
  const culpritPosition = shuffledSuspectsIds.indexOf(culpritId);
  const cornersIndexes = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? [0, 3, 12, 15] : [0, 3, 8, 11];
  const isCulpritInCorners = cornersIndexes.includes(culpritPosition);

  const gridStatement3 = isCulpritInCorners
    ? getGridStatement(culpritId, shuffledSuspectsIds, statements, 'any', totalSuspects, usedGridKeys)
    : getGridStatement(culpritId, shuffledSuspectsIds, statements, 'corners', totalSuspects, usedGridKeys);

  // Order the statements to alternate between testimony and feature
  let sortedStatements: StatementClue[] = [];
  if (isWeekend && testimonyStatement4 && featureStatement4) {
    sortedStatements = [
      testimonyStatement1,
      featureStatement1,
      testimonyStatement2,
      featureStatement2,
      testimonyStatement3,
      featureStatement3,
      testimonyStatement4,
      featureStatement4,
    ];
  } else {
    sortedStatements = [
      testimonyStatement1,
      featureStatement1,
      testimonyStatement2,
      featureStatement2,
      testimonyStatement3,
      featureStatement3,
    ];
  }

  const additionalStatements = shuffle([gridStatement1, gridStatement2, gridStatement3]);
  const reason = getReason(suspects[culpritId], reasons);
  const relevantSuspectsFeaturesDict = getRelevantSuspectsFeaturesDict([
    ...sortedStatements,
    ...additionalStatements,
  ]);

  return {
    isNsfw:
      testimony1.nsfw ||
      testimony2.nsfw ||
      testimony3.nsfw ||
      (isWeekend && scenario.selectedTestimonyId4 ? questions[scenario.selectedTestimonyId4].nsfw : false) ||
      false,
    culpritId,
    statements: sortedStatements,
    additionalStatements,
    suspects: createSuspectEntry(shuffledSuspectsIds, suspects, relevantSuspectsFeaturesDict),
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
  suspects: Dictionary<SuspectCardData>,
  relevantSuspectsFeaturesDict: Dictionary<true>,
): SuspectEntry[] => {
  return suspectsIds.map((id) => {
    const suspect = suspects[id];

    const age: string =
      {
        '0': 'undefinedAge',
        '18-21': 'young',
        '21-30': 'adult',
        '30-40': 'adult',
        '40-50': 'adult',
        '50-60': 'senior',
        '60-70': 'senior',
        '70-80': 'senior',
        '80-90': 'senior',
      }[suspect.age as string] || suspect.age;

    const allFeatures = [suspect.gender, age, suspect.race, suspect.height, suspect.build];

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
 * Calculates testimony answers for each suspect across all questions
 *
 * Processes testimony data to determine which suspects answer true/false for each question.
 * Filters out questions with insufficient diversity or too few answers.
 *
 * @param data - Raw testimony answers data
 * @returns Dictionary mapping questionId -> suspectId -> boolean answer
 */
const calculateSuspectAnswers = (data: Dictionary<TestimonyAnswers>) => {
  const result: TestimonySuspectAnswers = {};
  if (debugDailyStore.state.investigacao) {
    console.log('⚙️ Calculating suspect answers...');
  }

  for (const questionId of Object.keys(data)) {
    const questionTestimonies = data[questionId];
    for (const suspectId of Object.keys(questionTestimonies)) {
      const { resolution, projection } = calculateSuspectAnswersData(
        suspectId,
        questionId,
        questionTestimonies,
      );

      if (!resolution && !projection) {
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
      }
    }
  }

  Object.keys(result).forEach((key) => {
    if (isEmpty(result[key])) {
      delete result[key];
    }
  });

  Object.keys(result).forEach((key) => {
    if (Object.keys(result[key]).length < 3) {
      delete result[key];
    }
  });

  Object.keys(result).forEach((key) => {
    const answers = uniq(Object.values(result[key]));
    if (answers.length === 1) {
      delete result[key];
    }
  });

  return result;
};

/**
 * Builds a feature distribution map across all suspects
 *
 * Creates a lookup structure for finding suspects by physical characteristics.
 * Consolidates age groups and filters out overly broad or banned features.
 *
 * @param data - Suspect card data
 * @returns Dictionary mapping featureKey -> suspectId -> true
 */
const calculateFeaturesStats = (data: Dictionary<SuspectCardData>) => {
  const result: Dictionary<Dictionary<true>> = {};

  for (const suspectId of Object.keys(data)) {
    const { gender, race, age, build, height, features } = data[suspectId];
    if (!build || !height || !features || features.length === 0) {
      continue;
    }

    if (result[gender] === undefined) result[gender] = {};
    result[gender][suspectId] = true;

    if (result[race] === undefined) result[race] = {};
    result[race][suspectId] = true;

    if (result[age] === undefined) result[age] = {};
    result[age][suspectId] = true;

    if (result[build] === undefined) result[build] = {};
    result[build][suspectId] = true;

    if (result[height] === undefined) result[height] = {};
    result[height][suspectId] = true;

    features.forEach((feature) => {
      if (result[feature] === undefined) {
        result[feature] = {};
      }
      result[feature][suspectId] = true;
    });
  }

  result.undefinedAge = cloneDeep(result['0']);
  result.young = cloneDeep(result['18-21']);
  result.adult = cloneDeep({ ...result['21-30'], ...result['30-40'], ...result['40-50'] });
  result.senior = cloneDeep({
    ...result['50-60'],
    ...result['60-70'],
    ...result['70-80'],
    ...result['80-90'],
  });

  const BANNED_FEATURES = [
    '0-10',
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

  BANNED_FEATURES.forEach((feature) => {
    delete result[feature];
  });

  return result;
};

/**
 * Finds a valid suspect lineup scenario for the investigation
 *
 * Selects a culprit and builds a compatible lineup where testimony answers create
 * distinct exclusion groups. Uses a complex algorithm to ensure statements progressively
 * narrow down suspects.
 *
 * @param suspectTestimonyAnswers - Pre-calculated testimony answers
 * @param usedIds - Previously used culprit IDs to avoid
 * @param isWeekend - Whether this is a weekend game (affects lineup size)
 * @returns Selected testimonies, culprit, and full suspect lineup
 */
const findInvestigacaoScenario = (
  suspectTestimonyAnswers: TestimonySuspectAnswers,
  usedIds: string[],
  isWeekend: boolean,
) => {
  const questions = Object.keys(suspectTestimonyAnswers);
  let attempts = 0;

  const totalSuspects = isWeekend ? TOTAL_SUSPECTS_WEEKEND : TOTAL_SUSPECTS_WEEKDAY;

  const minDiff1 = Math.floor(totalSuspects * 0.4);
  const maxDiff1 = Math.ceil(totalSuspects * 0.6);

  while (attempts < ATTEMPTS_THRESHOLD) {
    attempts++;
    const q1Id = sample(questions);
    if (!q1Id) continue;

    const suspectsInQ1 = Object.keys(suspectTestimonyAnswers[q1Id]);
    const culpritId = sample(difference(suspectsInQ1, usedIds));
    if (!culpritId) continue;

    const q1Answer = suspectTestimonyAnswers[q1Id][culpritId];

    const poolS1Diff = suspectsInQ1.filter(
      (id) => id !== culpritId && suspectTestimonyAnswers[q1Id][id] !== q1Answer,
    );
    const poolS1Match = suspectsInQ1.filter(
      (id) => id !== culpritId && suspectTestimonyAnswers[q1Id][id] === q1Answer,
    );

    if (poolS1Diff.length < minDiff1) continue;

    const q2Candidates = sampleSize(questions, 20);

    for (const q2Id of q2Candidates) {
      if (q2Id === q1Id) continue;
      if (suspectTestimonyAnswers[q2Id][culpritId] === undefined) continue;

      const q2Answer = suspectTestimonyAnswers[q2Id][culpritId];

      const poolS1Match_S2Diff = poolS1Match.filter(
        (id) =>
          suspectTestimonyAnswers[q2Id][id] !== undefined && suspectTestimonyAnswers[q2Id][id] !== q2Answer,
      );

      const poolS1Match_S2Match = poolS1Match.filter(
        (id) =>
          suspectTestimonyAnswers[q2Id][id] !== undefined && suspectTestimonyAnswers[q2Id][id] === q2Answer,
      );

      const q3Candidates = sampleSize(questions, 10);
      for (const q3Id of q3Candidates) {
        if (q3Id === q1Id || q3Id === q2Id) continue;
        if (suspectTestimonyAnswers[q3Id][culpritId] === undefined) continue;

        const q3Answer = suspectTestimonyAnswers[q3Id][culpritId];

        const poolS1Match_S2Match_S3Diff = poolS1Match_S2Match.filter(
          (id) =>
            suspectTestimonyAnswers[q3Id][id] !== undefined && suspectTestimonyAnswers[q3Id][id] !== q3Answer,
        );

        const poolS1Match_S2Match_S3Match = poolS1Match_S2Match.filter(
          (id) =>
            suspectTestimonyAnswers[q3Id][id] !== undefined && suspectTestimonyAnswers[q3Id][id] === q3Answer,
        );

        if (isWeekend) {
          const q4Candidates = sampleSize(questions, 10);
          for (const q4Id of q4Candidates) {
            if (q4Id === q1Id || q4Id === q2Id || q4Id === q3Id) continue;
            if (suspectTestimonyAnswers[q4Id][culpritId] === undefined) continue;

            const q4Answer = suspectTestimonyAnswers[q4Id][culpritId];

            const poolS1Match_S2Match_S3Match_S4Diff = poolS1Match_S2Match_S3Match.filter(
              (id) =>
                suspectTestimonyAnswers[q4Id][id] !== undefined &&
                suspectTestimonyAnswers[q4Id][id] !== q4Answer,
            );

            const validConfigs = [];
            for (let n = minDiff1; n <= maxDiff1; n++) {
              if (poolS1Diff.length >= n) {
                const remaining = totalSuspects - 1 - n;
                if (
                  poolS1Match_S2Diff.length +
                    poolS1Match_S2Match_S3Diff.length +
                    poolS1Match_S2Match_S3Match_S4Diff.length >=
                  remaining
                ) {
                  validConfigs.push(n);
                }
              }
            }

            if (validConfigs.length > 0) {
              const chosenN1 = sample(validConfigs) ?? validConfigs[0];
              const remainingForQ2Q3Q4 = totalSuspects - 1 - chosenN1;

              const minQ4 = 1;
              const minQ3 = 1;
              const maxAvailableForQ2Q3 = remainingForQ2Q3Q4 - minQ4;
              const maxQ2 = Math.min(poolS1Match_S2Diff.length, maxAvailableForQ2Q3 - minQ3);
              const minQ2 = Math.max(1, maxAvailableForQ2Q3 - poolS1Match_S2Match_S3Diff.length);

              if (maxQ2 >= minQ2) {
                const chosenN2 = Math.floor(Math.random() * (maxQ2 - minQ2 + 1)) + minQ2;
                const remainingForQ3Q4 = remainingForQ2Q3Q4 - chosenN2;
                const maxQ3 = Math.min(poolS1Match_S2Match_S3Diff.length, remainingForQ3Q4 - minQ4);
                const minQ3Actual = Math.max(
                  minQ3,
                  remainingForQ3Q4 - poolS1Match_S2Match_S3Match_S4Diff.length,
                );

                if (maxQ3 >= minQ3Actual) {
                  const chosenN3 = Math.floor(Math.random() * (maxQ3 - minQ3Actual + 1)) + minQ3Actual;
                  const chosenN4 = remainingForQ3Q4 - chosenN3;

                  const chosenDiff1 = sampleSize(poolS1Diff, chosenN1);
                  const chosenDiff2 = sampleSize(poolS1Match_S2Diff, chosenN2);
                  const chosenDiff3 = sampleSize(poolS1Match_S2Match_S3Diff, chosenN3);
                  const chosenDiff4 = sampleSize(poolS1Match_S2Match_S3Match_S4Diff, chosenN4);

                  const suspectsIds = [
                    culpritId,
                    ...chosenDiff1,
                    ...chosenDiff2,
                    ...chosenDiff3,
                    ...chosenDiff4,
                  ];

                  return {
                    selectedTestimonyId1: q1Id,
                    selectedTestimonyId2: q2Id,
                    selectedTestimonyId3: q3Id,
                    selectedTestimonyId4: q4Id,
                    culpritId,
                    suspectsIds,
                  };
                }
              }
            }
          }
        } else {
          const validConfigs = [];
          for (let n = minDiff1; n <= maxDiff1; n++) {
            if (poolS1Diff.length >= n) {
              const remaining = totalSuspects - 1 - n;
              if (poolS1Match_S2Diff.length + poolS1Match_S2Match_S3Diff.length >= remaining) {
                validConfigs.push(n);
              }
            }
          }

          if (validConfigs.length > 0) {
            const chosenN1 = sample(validConfigs) ?? validConfigs[0];
            const remainingForQ2Q3 = totalSuspects - 1 - chosenN1;

            const minQ3 = 1;
            const maxQ2 = Math.min(poolS1Match_S2Diff.length, remainingForQ2Q3 - minQ3);
            const minQ2 = Math.max(1, remainingForQ2Q3 - poolS1Match_S2Match_S3Diff.length);

            if (maxQ2 >= minQ2) {
              const chosenN2 = Math.floor(Math.random() * (maxQ2 - minQ2 + 1)) + minQ2;
              const chosenN3 = remainingForQ2Q3 - chosenN2;

              const chosenDiff1 = sampleSize(poolS1Diff, chosenN1);
              const chosenDiff2 = sampleSize(poolS1Match_S2Diff, chosenN2);
              const chosenDiff3 = sampleSize(poolS1Match_S2Match_S3Diff, chosenN3);

              const suspectsIds = [culpritId, ...chosenDiff1, ...chosenDiff2, ...chosenDiff3];

              return {
                selectedTestimonyId1: q1Id,
                selectedTestimonyId2: q2Id,
                selectedTestimonyId3: q3Id,
                culpritId,
                suspectsIds,
              };
            }
          }
        }
      }
    }
  }

  throw new Error('Failed to find a valid investigacao scenario');
};

const updateExcludeScoreBoard = (scoreboard: Dictionary<number>, excludes: string[]) => {
  excludes.forEach((id) => {
    if (scoreboard[id] === undefined) {
      scoreboard[id] = 0;
    }
    scoreboard[id]++;
  });
};

/**
 * Creates a testimony-based statement that excludes suspects
 *
 * @param culpritId - The culprit suspect ID
 * @param suspectsIds - All suspects in this game
 * @param testimony - The testimony question card
 * @param answers - Suspect answers for this testimony
 * @returns Statement with exclusion list
 */
const getTestimonyStatement = (
  culpritId: string,
  suspectsIds: string[],
  testimony: TestimonyQuestionCardData,
  answers: Dictionary<boolean>,
): StatementClue => {
  const culpritAnswer = answers[culpritId];

  const excludes = suspectsIds.filter(
    (suspectId) => answers[suspectId] !== undefined && answers[suspectId] !== culpritAnswer,
  );

  const answer = testimony.answer.charAt(0).toLowerCase() + testimony.answer.slice(1);

  const result = {
    key: `testimony.${testimony.id}`,
    text: `O(a) suspeito(a) ${culpritAnswer ? '' : 'não '}${answer}`,
    excludes,
    type: 'testimony' as const,
  };

  if (result.text.includes('não já')) {
    result.text = result.text.replace('não já', 'nunca');
  }

  return result;
};

const GRID_COLUMNS_INDEXES: Dictionary<{ indexes: number[]; text: string }> = {
  column1: { indexes: [0, 4, 8], text: 'na primeira coluna' },
  column2: { indexes: [1, 5, 9], text: 'na segunda coluna' },
  column3: { indexes: [2, 6, 10], text: 'na terceira coluna' },
  column4: { indexes: [3, 7, 11], text: 'na quarta coluna' },
  corners: { indexes: [0, 3, 8, 11], text: 'nos cantos' },
};

const ROWS_COLUMNS_GRID_INDEXES: Dictionary<{ indexes: number[]; text: string }> = {
  row1: { indexes: [0, 1, 2, 3], text: 'na primeira linha' },
  row2: { indexes: [4, 5, 6, 7], text: 'na segunda linha' },
  row3: { indexes: [8, 9, 10, 11], text: 'na terceira linha' },
};

const GRID_4X4_COLUMNS: Dictionary<{ indexes: number[]; text: string }> = {
  column1: { indexes: [0, 4, 8, 12], text: 'na primeira coluna' },
  column2: { indexes: [1, 5, 9, 13], text: 'na segunda coluna' },
  column3: { indexes: [2, 6, 10, 14], text: 'na terceira coluna' },
  column4: { indexes: [3, 7, 11, 15], text: 'na quarta coluna' },
  corners: { indexes: [0, 3, 12, 15], text: 'nos cantos' },
};

const GRID_4X4_ROWS: Dictionary<{ indexes: number[]; text: string }> = {
  row1: { indexes: [0, 1, 2, 3], text: 'na primeira linha' },
  row2: { indexes: [4, 5, 6, 7], text: 'na segunda linha' },
  row3: { indexes: [8, 9, 10, 11], text: 'na terceira linha' },
  row4: { indexes: [12, 13, 14, 15], text: 'na quarta linha' },
};

/**
 * Creates a grid position statement that excludes suspects
 *
 * Generates clues about where the culprit is NOT positioned in the grid.
 * Optimizes for statements that exclude suspects with the fewest overlapping exclusions.
 *
 * @param culpritId - The culprit suspect ID
 * @param suspectsIds - Ordered suspect lineup
 * @param statements - Previously generated statements
 * @param type - Type of grid statement to generate
 * @param totalSuspects - Total suspects in game
 * @param usedGridKeys - Previously used grid keys to avoid duplicates
 * @returns Grid position statement with exclusion list
 */
const getGridStatement = (
  culpritId: string,
  suspectsIds: string[],
  statements: StatementClue[],
  type: 'rows' | 'columns' | 'corners' | 'any',
  totalSuspects: number,
  usedGridKeys: string[] = [],
): StatementClue => {
  const culpritPosition = suspectsIds.indexOf(culpritId);
  const basicStatements = statements.slice(0, 3);

  let INDEXES: Dictionary<{ indexes: number[]; text: string }>;
  if (type === 'corners') {
    const sourceIndexes = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_COLUMNS : GRID_COLUMNS_INDEXES;
    INDEXES = { corners: sourceIndexes.corners };
  } else if (type === 'columns') {
    const sourceIndexes = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_COLUMNS : GRID_COLUMNS_INDEXES;
    INDEXES = { ...sourceIndexes };
    delete INDEXES.corners;
  } else if (type === 'rows') {
    INDEXES = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_ROWS : ROWS_COLUMNS_GRID_INDEXES;
  } else {
    const columns = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_COLUMNS : GRID_COLUMNS_INDEXES;
    const rows = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_ROWS : ROWS_COLUMNS_GRID_INDEXES;
    INDEXES = { ...columns, ...rows };
  }

  const gridIndexesCounts: Dictionary<number> = {};
  for (const key of Object.keys(INDEXES)) {
    const { indexes } = INDEXES[key];
    if (indexes.includes(culpritPosition) || usedGridKeys.includes(key)) continue;

    gridIndexesCounts[key] = indexes.reduce((acc, index) => {
      const suspectId = suspectsIds[index];
      const excludeCount = basicStatements.filter((statement) =>
        statement.excludes.includes(suspectId),
      ).length;
      return excludeCount > 0 ? acc + excludeCount : acc;
    }, 0);
  }

  const groupedByCount = Object.entries(gridIndexesCounts).reduce(
    (acc: Dictionary<string[]>, [key, count]) => {
      if (!acc[count]) acc[count] = [];
      acc[count].push(key);
      return acc;
    },
    {},
  );

  const minCount = Math.min(...Object.keys(gridIndexesCounts).map((key) => gridIndexesCounts[key]));
  const bestOptions = groupedByCount[minCount.toString()];
  const bestGridCondition = sample(bestOptions) || Object.keys(gridIndexesCounts)[0];

  const excludes = INDEXES[bestGridCondition].indexes
    .map((index) => suspectsIds[index])
    .filter((id): id is string => id !== undefined);

  if (excludes.length === 0) {
    throw new Error(`Failed to generate grid statement: no valid excludes for ${bestGridCondition}`);
  }

  return {
    key: `not.grid.${bestGridCondition}`,
    text: `O(a) suspeito(a) não está ${INDEXES[bestGridCondition].text}`,
    excludes,
    type: 'grid' as const,
  };
};

/**
 * Creates a feature-based statement that excludes suspects
 *
 * Selects a physical characteristic the culprit lacks and creates a negation statement.
 * Prefers features that exclude new suspects not already excluded by previous statements.
 *
 * @param culpritId - The culprit suspect ID
 * @param suspectsIds - All suspects in this game
 * @param featuresCulpritDoesNotHave - Features the culprit lacks
 * @param previousStatements - Previously generated statements
 * @param type - Selection strategy (best = most excludes, worst = moderate excludes)
 * @param totalSuspects - Total suspects in game
 * @returns Feature-based statement with exclusion list
 */
const getFeatureStatement = (
  culpritId: string,
  suspectsIds: string[],
  featuresCulpritDoesNotHave: Dictionary<Dictionary<true>>,
  previousStatements: StatementClue[] = [],
  type: 'best' | 'worst' = 'best',
  totalSuspects = 12,
): StatementClue => {
  const suspectsWithoutCulprit = difference(suspectsIds, [culpritId]);

  const usedFeatures = previousStatements
    .filter((stmt) => stmt.key.startsWith('not.feature.'))
    .map((stmt) => stmt.key.replace('not.feature.', ''));

  const previouslyExcludedSuspects = new Set(previousStatements.flatMap((stmt) => stmt.excludes));
  const maxSuspectsWithFeature = Math.ceil(totalSuspects / 2);

  const sortedFeatures = Object.keys(featuresCulpritDoesNotHave)
    .filter(
      (feature) =>
        Object.keys(featuresCulpritDoesNotHave[feature]).length <= maxSuspectsWithFeature &&
        !usedFeatures.includes(feature),
    )
    .sort(
      (a, b) =>
        Object.keys(featuresCulpritDoesNotHave[b]).length - Object.keys(featuresCulpritDoesNotHave[a]).length,
    );

  let selectedFeature: string | undefined;
  let excludes: string[] = [];
  let attempts = 0;
  const maxAttempts = 500;

  while (attempts < maxAttempts) {
    attempts++;

    let candidateFeature: string | undefined;
    if (type === 'best') {
      candidateFeature = sortedFeatures[0];
    } else {
      const start = Math.min(2, sortedFeatures.length - 1);
      const end = Math.min(5, sortedFeatures.length);
      candidateFeature = sample(sortedFeatures.slice(start, end)) ?? sortedFeatures[start];
    }

    if (!candidateFeature) break;

    const candidateExcludes = suspectsWithoutCulprit.filter(
      (suspectId) => featuresCulpritDoesNotHave[candidateFeature][suspectId],
    );

    const hasNewExcludes = candidateExcludes.some((id) => !previouslyExcludedSuspects.has(id));

    if (hasNewExcludes || attempts === maxAttempts) {
      selectedFeature = candidateFeature;
      excludes = candidateExcludes;
      break;
    }

    sortedFeatures.splice(sortedFeatures.indexOf(candidateFeature), 1);
  }

  if (!selectedFeature) {
    throw Error(`No suitable feature found for ${type} selection after ${maxAttempts} attempts`);
  }

  const translatedFeature = FEATURE_PT_TRANSLATIONS[selectedFeature];

  return {
    key: `not.feature.${selectedFeature}`,
    text: `O(a) suspeito(a) não ${translatedFeature ?? `tem o atributo '${selectedFeature}'`}`,
    excludes,
    type: 'feature' as const,
  };
};

/**
 * Verifies that a game is solvable with the given statements
 *
 * Checks that statements provide enough total exclusions and unique suspect eliminations
 * to narrow down to a single culprit.
 *
 * @param statements - Generated statements
 * @param isWeekend - Whether this is a weekend game
 * @returns Whether the game is solvable
 */
const verifyGameDoability = (statements: StatementClue[], isWeekend: boolean) => {
  const limit = isWeekend ? 8 : 6;
  const mainStatements = statements.slice(0, limit);
  const totalSuspects = isWeekend ? TOTAL_SUSPECTS_WEEKEND : TOTAL_SUSPECTS_WEEKDAY;
  const minExcludes = isWeekend ? 18 : 12;

  const totalExcludes = mainStatements.reduce((acc, stmt) => acc + stmt.excludes.length, 0);
  if (totalExcludes < minExcludes) return false;

  const uniqueExcludes = new Set(mainStatements.flatMap((stmt) => stmt.excludes));
  return uniqueExcludes.size >= totalSuspects - 2;
};

/**
 * Selects a crime motive that fits the suspect's characteristics
 *
 * @param suspect - The culprit suspect card
 * @param reasons - Available crime motives
 * @returns Selected crime reason
 */
const getReason = (suspect: SuspectCardData, reasons: Dictionary<CrimeReasonData>): CrimeReasonData => {
  const availableReasons: CrimeReasonData[] = [];

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
    title: { pt: 'Motivo desconhecido', en: 'Unknown reason' },
    feature: 'general',
  };
};

/**
 * Determines difficulty level based on first three statements
 *
 * Calculates average difficulty from exclusion counts per statement.
 * More exclusions = easier (fewer remaining suspects).
 *
 * @param statements - Generated statements
 * @returns Difficulty level (1-3)
 */
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

  const average = Math.round(levels.reduce((acc, level) => acc + level, 0) / levels.length);
  return Math.min(Math.max(average, 1), 3);
};
