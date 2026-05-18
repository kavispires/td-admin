import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { calculateSuspectAnswersData } from 'components/Testimonies/utils';
import { useTDResource } from 'hooks/useTDResource';
import { cloneDeep, difference, isEmpty, sample, sampleSize, shuffle, uniq } from 'lodash';
import {
  type TestimonyAnswers,
  testimoniesDeserializer,
} from 'pages/Libraries/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { CrimeReason, SuspectCard, TestimonyQuestionCard } from 'types';
import { ATTEMPTS_THRESHOLD, DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

/**
 * Debug logging function that only logs if debug mode is enabled for espionagem
 */
const debugLog = (...args: unknown[]) => {
  if (debugDailyStore.state.investigacao) {
    console.log(...args);
  }
};

/**
 * Debug count function that only counts if debug mode is enabled for espionagem
 */
const debugCount = (label: string) => {
  if (debugDailyStore.state.investigacao) {
    console.count(label);
  }
};

/**
 * Debug error function that only logs errors if debug mode is enabled for espionagem
 */
const debugError = (...args: unknown[]) => {
  if (debugDailyStore.state.investigacao) {
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
  brown: 'é pardo/moreno/marrom',
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
  hairyChest: 'está mostrando o peito peludo',
  wearingFlowers: 'está usando flores',
  showTeeth: 'está mostrando os dentes',
  hairTie: 'está usando um xuxinha ou fita no cabelo',
  'non-binary': 'é não-binário(a)',
};

const TOTAL_SUSPECTS_WEEKDAY = 12;
const TOTAL_SUSPECTS_WEEKEND = 16;

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

export type DailyInvestigacaoEntry = {
  id: DateKey;
  number: number;
  type: 'investigacao';
  setId: string;
  culpritId: string;
  statements: StatementClue[];
  additionalStatements: StatementClue[];
  isNsfw: boolean;
  suspects: SuspectEntry[];
  reason: DualLanguageValue;
  level: number;
};

/**
 * Custom React hook to prepare and manage the data required for the "Daily Espionagem" games.
 *
 * This hook fetches and processes all necessary resources (suspects, questions, answers, and crime reasons)
 * and computes derived data such as suspect answers and feature statistics. It then builds the daily espionagem
 * game entries based on the provided batch size and user history.
 *
 * @param enabled - Whether the hook should be active and perform data fetching.
 * @param queryLanguage - The language to use when querying for testimony questions.
 * @param batchSize - The number of game entries to generate in a batch.
 * @param dailyHistory - The user's daily game history, used to determine which games have been played.
 *
 * @returns An object containing:
 * - `entries`: The generated espionagem game entries, or an empty object if data is not ready.
 * - `isLoading`: A boolean indicating if any of the required resources are still loading.
 */
export const useDailyInvestigacaoGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [investigacaoHistory] = useParsedHistory(DAILY_GAMES_KEYS.INVESTIGACAO, dailyHistory);

  const suspectsQuery = useTDResource<SuspectCard>('suspects', { enabled });
  const questionsQuery = useTDResource<TestimonyQuestionCard>(`testimony-questions-${queryLanguage}`, {
    enabled,
  });
  const answersQuery = useTDResource<TestimonyAnswers, Dictionary<string>>('testimony-answers', {
    select: testimoniesDeserializer,
    enabled,
  });
  const reasonsQuery = useTDResource<CrimeReason>('crime-reasons', { enabled });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Only if data query is updated
  const testimonySuspectAnswers = useMemo(
    () => calculateSuspectAnswers(answersQuery.data),
    [answersQuery.dataUpdatedAt],
  );

  const featuresStats = useMemo(() => calculateFeaturesStats(suspectsQuery.data), [suspectsQuery.data]);

  const entries = useMemo(() => {
    if (
      !enabled ||
      !investigacaoHistory ||
      !suspectsQuery.isSuccess ||
      !questionsQuery.isSuccess ||
      !answersQuery.isSuccess ||
      !reasonsQuery.isSuccess
    ) {
      return {};
    }

    return buildDailyInvestigacaoGames(
      batchSize,
      investigacaoHistory,
      suspectsQuery.data,
      questionsQuery.data,
      testimonySuspectAnswers,
      featuresStats,
      reasonsQuery.data,
    );
  }, [
    enabled,
    investigacaoHistory,
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

/**
 * Generates a batch of daily espionagem games, ensuring each game is valid and unique.
 *
 * @param batchSize - The number of games to generate in this batch.
 * @param history - The parsed daily history entry, used to determine the latest date and number.
 * @param suspects - A dictionary of suspect cards available for game generation.
 * @param questions - A dictionary of testimony question cards available for game generation.
 * @param suspectTestimonyAnswers - The mapping of suspects to their testimony answers.
 * @param featuresStats - A dictionary containing feature statistics for suspects and questions.
 * @param reasons - A dictionary of possible crime reasons.
 * @returns A record mapping each generated game ID to its corresponding `DailyEspionagemEntry`.
 * @throws Will throw an error if a valid game cannot be generated after the allowed number of attempts.
 */
export const buildDailyInvestigacaoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  suspects: Dictionary<SuspectCard>,
  questions: Dictionary<TestimonyQuestionCard>,
  suspectTestimonyAnswers: TestimonySuspectAnswers,
  featuresStats: Dictionary<Dictionary<true>>,
  reasons: Dictionary<CrimeReason>,
) => {
  debugCount('Creating Investigacao...');
  let lastDate = history.latestDate;
  const usedIds: string[] = [];

  const entries: Record<string, DailyInvestigacaoEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    const isWeekend = checkWeekend(id);
    lastDate = id;

    // Try up to 100 times to generate a valid game
    let validGame = null;
    let attempts = 0;

    while (validGame === null && attempts < ATTEMPTS_THRESHOLD) {
      try {
        attempts++;
        const game = generateInvestigacaoGame(
          suspects,
          questions,
          suspectTestimonyAnswers,
          featuresStats,
          usedIds,
          reasons,
          isWeekend,
        );

        if (verifyGameDoability(game.statements, isWeekend)) {
          validGame = game;
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
      type: 'investigacao',
      number: history.latestNumber + i + 1,
      ...validGame,
    };
  }

  return entries;
};

/**
 * Generates a daily espionagem game entry by selecting suspects, testimonies, and feature-based statements.
 *
 * This function orchestrates the creation of a game round by:
 * - Selecting testimonies (3 for weekdays, 4 for weekends) and determining the culprit and possible suspects.
 * - Gathering features that the culprit does not possess for use in feature statements.
 * - Generating alternating testimony and feature statements (6 for weekdays, 8 for weekends).
 * - Creating 3 grid-based statements (column, row, corners) as additional clues.
 * - Randomizing suspect positions and assembling the final game entry object.
 *
 * @param suspects - A dictionary of all available suspects keyed by their IDs.
 * @param questions - A dictionary of all available testimony question cards keyed by their IDs.
 * @param suspectTestimonyAnswers - Mapping of testimony IDs to suspect answers.
 * @param featuresStats - A dictionary mapping feature keys to dictionaries of suspect IDs who have that feature.
 * @param usedIds - An array of suspect IDs that have already been used and should be excluded.
 * @param reasons - A dictionary of possible crime reasons keyed by their IDs.
 * @param isWeekend - Whether the game is for a weekend date (larger grid with more statements).
 * @returns An object representing the generated espionagem game entry, omitting 'id', 'number', and 'type' fields.
 * @throws If there are not enough possible suspects or if the generated statements are insufficient.
 */
function generateInvestigacaoGame(
  suspects: Dictionary<SuspectCard>,
  questions: Dictionary<TestimonyQuestionCard>,
  suspectTestimonyAnswers: TestimonySuspectAnswers,
  featuresStats: Dictionary<Dictionary<true>>,
  usedIds: string[],
  reasons: Dictionary<CrimeReason>,
  isWeekend: boolean,
): Omit<DailyInvestigacaoEntry, 'id' | 'number' | 'type'> {
  const statements: StatementClue[] = [];
  const excludeScoreBoard: Dictionary<number> = {};
  const totalSuspects = isWeekend ? TOTAL_SUSPECTS_WEEKEND : TOTAL_SUSPECTS_WEEKDAY;

  debugLog('SuspectTestimonyAnswers', suspectTestimonyAnswers);

  // Get testimonies, the culprit ID, and the common suspects
  const {
    selectedTestimonyId1,
    selectedTestimonyId2,
    selectedTestimonyId3,
    selectedTestimonyId4,
    culpritId,
    suspectsIds,
  } = findInvestigacaoScenario(suspectTestimonyAnswers, usedIds, isWeekend);

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

  // TESTIMONY STATEMENT 3: Add third testimony to statements (both weekday and weekend now have 3)
  const testimony3 = questions[selectedTestimonyId3];
  const testimonyStatement3 = getTestimonyStatement(
    culpritId,
    suspectsIds,
    testimony3,
    suspectTestimonyAnswers[selectedTestimonyId3],
  );
  statements.push(testimonyStatement3);
  updateExcludeScoreBoard(excludeScoreBoard, testimonyStatement3.excludes);

  // TESTIMONY STATEMENT 4: Add fourth testimony to statements (weekend only)
  let testimonyStatement4: StatementClue | undefined;
  if (isWeekend && selectedTestimonyId4) {
    const testimony4 = questions[selectedTestimonyId4];
    testimonyStatement4 = getTestimonyStatement(
      culpritId,
      suspectsIds,
      testimony4,
      suspectTestimonyAnswers[selectedTestimonyId4],
    );
    statements.push(testimonyStatement4);
    updateExcludeScoreBoard(excludeScoreBoard, testimonyStatement4.excludes);
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

  // Create random grid positions for the suspects
  const shuffledSuspectsIds = shuffle(suspectsIds);

  // Track used grid keys to avoid duplicates
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
  // Extract the grid key from the statement key (e.g., "not.grid.column2" -> "column2")
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

  // GRID STATEMENT 3 - Try corners first, but if culprit is in corners, pick the best remaining option
  const culpritPosition = shuffledSuspectsIds.indexOf(culpritId);
  const cornersIndexes = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? [0, 3, 12, 15] : [0, 3, 8, 11];
  const isCulpritInCorners = cornersIndexes.includes(culpritPosition);

  const gridStatement3 = isCulpritInCorners
    ? getGridStatement(culpritId, shuffledSuspectsIds, statements, 'any', totalSuspects, usedGridKeys)
    : getGridStatement(culpritId, shuffledSuspectsIds, statements, 'corners', totalSuspects, usedGridKeys);

  // Order the statements to alternate between testimony and feature
  let sortedStatements: StatementClue[] = [];
  if (isWeekend && testimonyStatement4 && featureStatement4) {
    // Weekend: T1, F1, T2, F2, T3, F3, T4, F4
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
    // Weekday: T1, F1, T2, F2, T3, F3
    sortedStatements = [
      testimonyStatement1,
      featureStatement1,
      testimonyStatement2,
      featureStatement2,
      testimonyStatement3,
      featureStatement3,
    ];
  }

  // Additional statements are always the 3 grid statements
  const additionalStatements = shuffle([gridStatement1, gridStatement2, gridStatement3]);

  // Get reason
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
      (isWeekend && selectedTestimonyId4 ? questions[selectedTestimonyId4].nsfw : false) ||
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

/**
 * Extracts and groups all relevant features from the provided statement clues.
 *
 * This function identifies all feature-based statements (those containing '.feature.' in their key),
 * extracts the feature keys, and adds related features from the same feature group.
 * For example, if 'brownHair' is used, all hair color features will be included.
 *
 * @param statements - An array of statement clues to analyze for feature usage
 * @returns A dictionary mapping feature keys to true for all features that should be included in the game
 */
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

/**
 * Creates an array of `SuspectEntry` objects from the provided suspect IDs and dictionaries.
 *
 * For each suspect ID, this function:
 * - Retrieves the corresponding suspect from the `suspects` dictionary.
 * - Maps the suspect's age to a descriptive category (e.g., 'young', 'adult', 'senior') if possible.
 * - Constructs a list of all basic features (gender, mapped age, ethnicity, height, build).
 * - Filters the suspect's additional features to include only those present in `relevantSuspectsFeaturesDict`.
 * - Combines all features and returns a `SuspectEntry` object with the suspect's id, name, gender, and features.
 *
 * @param suspectsIds - An array of suspect IDs to process.
 * @param suspects - A dictionary mapping suspect IDs to `SuspectCard` objects.
 * @param relevantSuspectsFeaturesDict - A dictionary indicating which features are relevant (keys are feature names, values are `true`).
 * @returns An array of `SuspectEntry` objects, each representing a suspect with filtered and mapped features.
 */
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

    const allFeatures = [suspect.gender, age, suspect.race, suspect.height, suspect.build];

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
        // continue;
      }
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
    const { gender, race, age, build, height, features } = data[suspectId];
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

    if (result[race] === undefined) {
      result[race] = {};
    }
    result[race][suspectId] = true;

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

  // Remove the features that are not helpful
  BANNED_FEATURES.forEach((feature) => {
    delete result[feature];
  });

  return result;
};

/**
 * Finds a valid game scenario by selecting a culprit and testimonies that
 * effectively split the suspect pool according to specific constraints.
 *
 * Weekday Constraints (12 suspects, 3 testimonies):
 * 1. Q1 must divide the suspects such that some suspects (40-60% of 12) have a different answer than the culprit.
 * 2. Q2 excludes a portion of the survivors of Q1.
 * 3. Q3 excludes the remaining survivors.
 * 4. The final pool of 12 suspects is constructed to satisfy these splits.
 *
 * Weekend Constraints (16 suspects, 4 testimonies):
 * 1. Q1 must divide the suspects such that 6-10 suspects (40-60% of 16) have a different answer than the culprit.
 * 2. Q2 excludes a portion of the survivors of Q1.
 * 3. Q3 excludes a portion of the remaining survivors.
 * 4. Q4 excludes the final remaining survivors.
 * 5. The final pool of 16 suspects is constructed to satisfy these splits.
 *
 * @param suspectTestimonyAnswers - A dictionary mapping testimony IDs to suspect answers.
 * @param usedIds - An array of previously used suspect IDs to avoid as culprits.
 * @param isWeekend - Whether the game is for a weekend date (larger pool, 4 questions vs 3).
 * @returns An object containing the selected culpritId, testimony IDs (3 for weekday, 4 for weekend), and the list of suspect IDs.
 * @throws If no valid scenario can be found after the attempt threshold.
 */
const findInvestigacaoScenario = (
  suspectTestimonyAnswers: TestimonySuspectAnswers,
  usedIds: string[],
  isWeekend: boolean,
) => {
  const questions = Object.keys(suspectTestimonyAnswers);
  let attempts = 0;

  const totalSuspects = isWeekend ? TOTAL_SUSPECTS_WEEKEND : TOTAL_SUSPECTS_WEEKDAY;

  // Determine split range for Q1
  const minDiff1 = Math.floor(totalSuspects * 0.4);
  const maxDiff1 = Math.ceil(totalSuspects * 0.6);

  while (attempts < ATTEMPTS_THRESHOLD) {
    attempts++;
    // Step 1: Pick a random Question 1
    const q1Id = sample(questions);
    if (!q1Id) continue;

    const suspectsInQ1 = Object.keys(suspectTestimonyAnswers[q1Id]);
    // Step 2: Pick a random Culprit from Q1 who hasn't been used recently
    const culpritId = sample(difference(suspectsInQ1, usedIds));
    if (!culpritId) continue;

    const q1Answer = suspectTestimonyAnswers[q1Id][culpritId];

    // Split suspects in Q1
    const poolS1Diff = suspectsInQ1.filter(
      (id) => id !== culpritId && suspectTestimonyAnswers[q1Id][id] !== q1Answer,
    );
    const poolS1Match = suspectsInQ1.filter(
      (id) => id !== culpritId && suspectTestimonyAnswers[q1Id][id] === q1Answer,
    );

    // Constraint: Q1 must exclude 40-60% of the total pool
    if (poolS1Diff.length < minDiff1) continue;

    // Step 4: Find Question 2 (and 3 if weekend)
    const q2Candidates = sampleSize(questions, 20);

    for (const q2Id of q2Candidates) {
      if (q2Id === q1Id) continue;
      // Culprit must have an answer for Q2
      if (suspectTestimonyAnswers[q2Id][culpritId] === undefined) continue;

      const q2Answer = suspectTestimonyAnswers[q2Id][culpritId];

      // Identify survivors from Q1 who are ALSO excluded by Q2
      const poolS1Match_S2Diff = poolS1Match.filter(
        (id) =>
          suspectTestimonyAnswers[q2Id][id] !== undefined && suspectTestimonyAnswers[q2Id][id] !== q2Answer,
      );

      // Identify survivors from Q1 who match Q2
      const poolS1Match_S2Match = poolS1Match.filter(
        (id) =>
          suspectTestimonyAnswers[q2Id][id] !== undefined && suspectTestimonyAnswers[q2Id][id] === q2Answer,
      );

      // Both weekday and weekend now use 3+ testimonies
      const q3Candidates = sampleSize(questions, 10);
      for (const q3Id of q3Candidates) {
        if (q3Id === q1Id || q3Id === q2Id) continue;
        if (suspectTestimonyAnswers[q3Id][culpritId] === undefined) continue;

        const q3Answer = suspectTestimonyAnswers[q3Id][culpritId];

        // Identify survivors from Q1+Q2 who are excluded by Q3
        const poolS1Match_S2Match_S3Diff = poolS1Match_S2Match.filter(
          (id) =>
            suspectTestimonyAnswers[q3Id][id] !== undefined && suspectTestimonyAnswers[q3Id][id] !== q3Answer,
        );

        // Identify survivors from Q1+Q2 who match Q3
        const poolS1Match_S2Match_S3Match = poolS1Match_S2Match.filter(
          (id) =>
            suspectTestimonyAnswers[q3Id][id] !== undefined && suspectTestimonyAnswers[q3Id][id] === q3Answer,
        );

        if (isWeekend) {
          // Weekend Logic: 4 Questions, 16 Suspects
          const q4Candidates = sampleSize(questions, 10);
          for (const q4Id of q4Candidates) {
            if (q4Id === q1Id || q4Id === q2Id || q4Id === q3Id) continue;
            if (suspectTestimonyAnswers[q4Id][culpritId] === undefined) continue;

            const q4Answer = suspectTestimonyAnswers[q4Id][culpritId];

            // Identify survivors from Q1+Q2+Q3 who are excluded by Q4
            const poolS1Match_S2Match_S3Match_S4Diff = poolS1Match_S2Match_S3Match.filter(
              (id) =>
                suspectTestimonyAnswers[q4Id][id] !== undefined &&
                suspectTestimonyAnswers[q4Id][id] !== q4Answer,
            );

            // Construct Pool for Weekend (4 Questions)
            // We need totalSuspects - 1 non-culprits (15)
            // N1 from Diff1, N2 from S1Match_S2Diff, N3 from S1Match_S2Match_S3Diff, N4 from S1Match_S2Match_S3Match_S4Diff
            const validConfigs = [];
            for (let n = minDiff1; n <= maxDiff1; n++) {
              if (poolS1Diff.length >= n) {
                const remaining = totalSuspects - 1 - n;
                // We need to fill 'remaining' with S2Diff, S3Diff, and S4Diff
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

              // Distribute remaining spots between Q2, Q3, and Q4
              const minQ4 = 1; // At least 1 for Q4
              const minQ3 = 1; // At least 1 for Q3
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

                  debugLog('<===============>');
                  debugLog(`⚙️ Weekend Mode: ${totalSuspects} Suspects`);
                  debugLog(`⚙️ Culprit ID: ${culpritId}`);
                  debugLog(`⚙️ Q1: ${q1Id} (Excludes ${chosenDiff1.length})`);
                  debugLog(`⚙️ Q2: ${q2Id} (Excludes ${chosenDiff2.length})`);
                  debugLog(`⚙️ Q3: ${q3Id} (Excludes ${chosenDiff3.length})`);
                  debugLog(`⚙️ Q4: ${q4Id} (Excludes ${chosenDiff4.length})`);
                  debugLog('>===============<');

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
          // Weekday Logic: 3 Questions, 12 Suspects
          // We need 11 non-culprits.
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

            // Distribute remaining spots between Q2 and Q3
            const minQ3 = 1; // At least 1 for Q3
            const maxQ2 = Math.min(poolS1Match_S2Diff.length, remainingForQ2Q3 - minQ3);
            const minQ2 = Math.max(1, remainingForQ2Q3 - poolS1Match_S2Match_S3Diff.length);

            if (maxQ2 >= minQ2) {
              const chosenN2 = Math.floor(Math.random() * (maxQ2 - minQ2 + 1)) + minQ2;
              const chosenN3 = remainingForQ2Q3 - chosenN2;

              const chosenDiff1 = sampleSize(poolS1Diff, chosenN1);
              const chosenDiff2 = sampleSize(poolS1Match_S2Diff, chosenN2);
              const chosenDiff3 = sampleSize(poolS1Match_S2Match_S3Diff, chosenN3);

              const suspectsIds = [culpritId, ...chosenDiff1, ...chosenDiff2, ...chosenDiff3];

              debugLog('<===============>');
              debugLog(`⚙️ Weekday Mode: ${totalSuspects} Suspects`);
              debugLog(`⚙️ Culprit ID: ${culpritId}`);
              debugLog(`⚙️ Q1: ${q1Id} (Excludes ${chosenDiff1.length})`);
              debugLog(`⚙️ Q2: ${q2Id} (Excludes ${chosenDiff2.length})`);
              debugLog(`⚙️ Q3: ${q3Id} (Excludes ${chosenDiff3.length})`);
              debugLog('>===============<');

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

/**
 * Updates the exclusion scoreboard by incrementing the count for each excluded suspect.
 *
 * @param scoreboard - A dictionary tracking how many times each suspect ID has been excluded
 * @param excludes - An array of suspect IDs to increment in the scoreboard
 */
const updateExcludeScoreBoard = (scoreboard: Dictionary<number>, excludes: string[]) => {
  excludes.forEach((id) => {
    if (scoreboard[id] === undefined) {
      scoreboard[id] = 0;
    }
    scoreboard[id]++;
  });
};

/**
 * Generates a statement clue based on a suspect's testimony and their answer.
 *
 * @param culpritId - The ID of the suspect whose testimony is being processed.
 * @param suspectsIds - An array of all suspect IDs involved in the testimony.
 * @param testimony - The testimony question card containing the question and answer.
 * @param answers - A dictionary mapping suspect IDs to their boolean answers.
 * @returns A `StatementClue` object containing the generated statement, excluded suspects, and metadata.
 */
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

const GRID_4X4_COLUMNS: Dictionary<{ indexes: number[]; text: string }> = {
  column1: {
    indexes: [0, 4, 8, 12],
    text: 'na primeira coluna',
  },
  column2: {
    indexes: [1, 5, 9, 13],
    text: 'na segunda coluna',
  },
  column3: {
    indexes: [2, 6, 10, 14],
    text: 'na terceira coluna',
  },
  column4: {
    indexes: [3, 7, 11, 15],
    text: 'na quarta coluna',
  },
  corners: {
    indexes: [0, 3, 12, 15],
    text: 'nos cantos',
  },
};

const GRID_4X4_ROWS: Dictionary<{ indexes: number[]; text: string }> = {
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
  row4: {
    indexes: [12, 13, 14, 15],
    text: 'na quarta linha',
  },
};

/**
 * Generates a grid-based statement clue for a deduction game, selecting a grid rule (row, column, corners, or any)
 * that excludes the culprit and has the least overlap with existing basic exclusion statements.
 *
 * @param culpritId - The ID of the culprit suspect.
 * @param suspectsIds - An array of all suspect IDs, representing their positions in the grid.
 * @param statements - An array of existing basic statement clues to consider for exclusion overlap.
 * @param type - Specifies whether to use 'rows', 'columns', 'corners', or 'any' (picks best from all) grid rules.
 * @param totalSuspects - The total number of suspects (determines grid size).
 * @param usedGridKeys - Optional array of grid keys that have already been used to avoid duplicates.
 * @returns A new StatementClue object representing a grid-based exclusion statement.
 */
const getGridStatement = (
  culpritId: string,
  suspectsIds: string[],
  statements: StatementClue[],
  type: 'rows' | 'columns' | 'corners' | 'any',
  totalSuspects: number,
  usedGridKeys: string[] = [],
): StatementClue => {
  // Get culprit row and column
  const culpritPosition = suspectsIds.indexOf(culpritId);

  // Calculate the grid rule that has the least amount of excludes
  const basicStatements = statements.slice(0, 3);

  // Select the correct grid definition based on total suspects and type
  let INDEXES: Dictionary<{ indexes: number[]; text: string }>;
  if (type === 'corners') {
    // Corners are defined in the column indexes
    const sourceIndexes = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_COLUMNS : GRID_COLUMNS_INDEXES;
    // Filter to only use corners
    INDEXES = { corners: sourceIndexes.corners };
  } else if (type === 'columns') {
    // For columns, exclude corners to avoid repetition
    const sourceIndexes = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_COLUMNS : GRID_COLUMNS_INDEXES;
    INDEXES = { ...sourceIndexes };
    delete INDEXES.corners;
  } else if (type === 'rows') {
    // For rows
    INDEXES = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_ROWS : ROWS_COLUMNS_GRID_INDEXES;
  } else {
    // type === 'any': Use all available grid positions
    const columns = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_COLUMNS : GRID_COLUMNS_INDEXES;
    const rows = totalSuspects === TOTAL_SUSPECTS_WEEKEND ? GRID_4X4_ROWS : ROWS_COLUMNS_GRID_INDEXES;
    INDEXES = { ...columns, ...rows };
  }

  const gridIndexesCounts: Dictionary<number> = {};
  for (const key of Object.keys(INDEXES)) {
    const { indexes } = INDEXES[key];

    if (indexes.includes(culpritPosition)) {
      continue;
    }

    // Skip if this grid key has already been used
    if (usedGridKeys.includes(key)) {
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

  const excludes = INDEXES[bestGridCondition].indexes
    .map((index) => suspectsIds[index])
    .filter((id): id is string => id !== undefined); // Filter out any undefined values

  if (excludes.length === 0) {
    debugError(
      `No valid excludes found for grid ${bestGridCondition}. Culprit at ${culpritPosition}, total suspects: ${totalSuspects}, suspects array length: ${suspectsIds.length}`,
    );
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
 * Generates a statement clue based on a feature that the culprit does not have, aiming to exclude suspects.
 *
 * @param culpritId - The ID of the culprit.
 * @param suspectsIds - Array of all suspect IDs.
 * @param featuresCulpritDoesNotHave - A dictionary mapping feature names to dictionaries of suspect IDs that do not have the feature.
 * @param previousStatements - (Optional) Array of previously generated statement clues to avoid repeating features and suspects.
 * @param type - (Optional) The selection strategy: 'best' (default) selects the most effective feature, 'worst' selects a less optimal one.
 * @param totalSuspects - The total number of suspects to calculate thresholds.
 * @returns A `StatementClue` object representing the generated clue, including the feature, translated text, and excluded suspects.
 * @throws If no suitable feature is found after a maximum number of attempts.
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

  // Extract used features from previous statements
  const usedFeatures = previousStatements
    .filter((stmt) => stmt.key.startsWith('not.feature.'))
    .map((stmt) => stmt.key.replace('not.feature.', ''));

  // Get all previously excluded suspects
  const previouslyExcludedSuspects = new Set(previousStatements.flatMap((stmt) => stmt.excludes));

  // Rank features by the number of suspects that have them
  // Ignore any features that have more than half of the suspects (loose heuristic)
  const maxSuspectsWithFeature = Math.ceil(totalSuspects / 2);

  // Sort them by number of suspects that have them
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

  // Try to find a feature that excludes at least one suspect not previously excluded
  let selectedFeature: string | undefined;
  let excludes: string[] = [];
  let attempts = 0;
  const maxAttempts = 500;

  while (attempts < maxAttempts) {
    attempts++;

    // Select a candidate feature based on the type
    let candidateFeature: string | undefined;
    if (type === 'best') {
      candidateFeature = sortedFeatures[0];
    } else {
      // Pick randomly from index 2 to 5 (or less if fewer features exist)
      const start = Math.min(2, sortedFeatures.length - 1);
      const end = Math.min(5, sortedFeatures.length);
      candidateFeature = sample(sortedFeatures.slice(start, end)) ?? sortedFeatures[start];
    }

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

/**
 * Determines whether a game is doable based on the provided statement clues.
 *
 * The function checks the following conditions using all main statements (excluding grid statements):
 * 1. The total number of excludes across all main statements must meet minimum thresholds.
 * 2. The set of unique excludes from these statements must cover all but a few of the total suspects.
 *
 * @param statements - An array of `StatementClue` objects representing the clues for the game.
 * @param isWeekend - Whether it is a weekend game.
 * @returns `true` if the game is considered doable according to the criteria; otherwise, `false`.
 */
const verifyGameDoability = (statements: StatementClue[], isWeekend: boolean) => {
  // Use all main statements (6 for weekday, 8 for weekend)
  // These are all testimony and feature statements (alternating T-F-T-F-T-F or T-F-T-F-T-F-T-F)
  const limit = isWeekend ? 8 : 6;
  const mainStatements = statements.slice(0, limit);
  const totalSuspects = isWeekend ? TOTAL_SUSPECTS_WEEKEND : TOTAL_SUSPECTS_WEEKDAY;
  const minExcludes = isWeekend ? 18 : 12;

  // Easiness of puzzle based on total excludes
  const totalExcludes = mainStatements.reduce((acc, stmt) => acc + stmt.excludes.length, 0);
  if (totalExcludes < minExcludes) {
    return false;
  }

  // Gather all unique excludes from main statements
  const uniqueExcludes = new Set(mainStatements.flatMap((stmt) => stmt.excludes));
  // Ideally, we want almost everyone excluded by the main statements
  return uniqueExcludes.size >= totalSuspects - 2;
};

/**
 * Selects a crime reason for a given suspect from a dictionary of possible reasons.
 *
 * Iterates through all available reasons and collects those that are either general
 * or match one of the suspect's features. Randomly selects one of the collected reasons.
 * If no suitable reason is found, returns a default "unknown" reason.
 *
 * @param suspect - The suspect card containing features to match against reasons.
 * @param reasons - A dictionary of possible crime reasons keyed by their IDs.
 * @returns The selected `CrimeReason` object, or a default "unknown" reason if none match.
 */
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

/**
 * Determines the difficulty level based on the first three `StatementClue` objects.
 *
 * The function maps the number of excludes in each statement to a predefined level,
 * calculates the average level (rounded to the nearest integer), and ensures the result
 * is between 1 and 3 (inclusive).
 *
 * @param statements - An array of `StatementClue` objects to evaluate.
 * @returns The calculated difficulty level (1, 2, or 3).
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

  // Return the average level rounded up
  const average = Math.round(levels.reduce((acc, level) => acc + level, 0) / levels.length);
  // make sure the average is at least 1 and the max is 3
  return Math.min(Math.max(average, 1), 3);
};
