import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { calculateSuspectAnswersData } from 'components/Testimonies/utils';
import { useTDResource } from 'hooks/useTDResource';
import { cloneDeep, difference, isEmpty, sample, sampleSize, shuffle, uniq } from 'lodash';
import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { CrimeReason, SuspectCard, TestimonyQuestionCard } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

const TOTAL_SUSPECTS = 9;

type TestimonySuspectAnswers = Dictionary<Dictionary<boolean>>;

type StatementClue = {
  key: string;
  text: string;
  excludes: string[];
};

export type DailyEspionagemEntry = {
  id: DateKey;
  number: number;
  type: 'espionagem';
  setId: string;
  culpritId: string;
  statements: StatementClue[];
  isNsfw: boolean;
  suspects: SuspectCard[];
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

  const testimonySuspectAnswers = useMemo(
    () => calculateSuspectAnswers(answersQuery.data),
    [answersQuery.data],
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
  console.count('Creating Espionagem...');
  let lastDate = history.latestDate;
  const usedIds: string[] = [];

  const entries: Record<string, DailyEspionagemEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;

    // Try up to 100 times to generate a valid game
    let validGame = null;
    let attempts = 0;

    while (!validGame && attempts < 100) {
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
        console.log(`Generated valid game for ${id} after ${attempts} attempts`);
        break;
      }
    }

    if (!validGame) {
      throw new Error(`Failed to generate valid game for ${id} after 100 attempts`);
    }

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
  let suspectsIds: string[] = [];
  const statements: StatementClue[] = [];
  const excludeScoreBoard: Dictionary<number> = {};

  // Get the culprit (it must use one of the testimonies)
  const selectedTestimonyId = sample(Object.keys(suspectTestimonyAnswers));
  if (!selectedTestimonyId) {
    throw new Error('No selected testimony ID found');
  }

  // Filter out suspects that have already been used as culprits
  const availableSuspects = Object.keys(suspectTestimonyAnswers[selectedTestimonyId]).filter(
    (id) => !usedIds.includes(id),
  );

  // If no available suspects, fall back to using any suspect from this testimony
  const culpritPool =
    availableSuspects.length > 0
      ? availableSuspects
      : Object.keys(suspectTestimonyAnswers[selectedTestimonyId]);

  const culpritId = sample(culpritPool);

  if (!culpritId) {
    throw new Error('No selected culprit ID found');
  }

  // Add other suspects in the testimony to the game
  const otherSuspects = sampleSize(
    Object.keys(suspectTestimonyAnswers[selectedTestimonyId]).filter((id) => id !== culpritId),
    TOTAL_SUSPECTS - 1,
  );
  suspectsIds.push(...otherSuspects);
  // Add more suspects to the game until there are 8 suspects
  while (suspectsIds.length < 8) {
    const additionalSuspectsIds = sampleSize(
      Object.keys(suspects).filter((id) => !suspectsIds.includes(id) && id !== culpritId),
      TOTAL_SUSPECTS - suspectsIds.length - 1,
    );
    suspectsIds.push(...additionalSuspectsIds);
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

  // STATEMENT 1: Add testimony to statements
  const testimony = questions[selectedTestimonyId];
  statements.push(
    getTestimonyStatement(culpritId, suspectsIds, testimony, suspectTestimonyAnswers[selectedTestimonyId]),
  );
  updateExcludeScoreBoard(excludeScoreBoard, statements[0].excludes);

  // STATEMENT 2: Add features that the culprit does not have
  const featureStatement = getFeatureStatement(culpritId, suspectsIds, featuresCulpritDoesNotHave);
  statements.push(featureStatement);
  updateExcludeScoreBoard(excludeScoreBoard, featureStatement.excludes);

  // Create random grid positions for the suspects
  suspectsIds = shuffle([...suspectsIds, culpritId]);

  // STATEMENT 3: Add new feature statement
  const newFeatureStatement = getFeatureStatement(
    culpritId,
    suspectsIds,
    featuresCulpritDoesNotHave,
    [featureStatement.key],
    'worst',
  );
  statements.push(newFeatureStatement);
  updateExcludeScoreBoard(excludeScoreBoard, newFeatureStatement.excludes);

  // STATEMENT 4: Add new feature statement
  const anotherFeatureStatement = getFeatureStatement(
    culpritId,
    suspectsIds,
    featuresCulpritDoesNotHave,
    [newFeatureStatement.key],
    'worst',
  );
  statements.push(anotherFeatureStatement);
  updateExcludeScoreBoard(excludeScoreBoard, anotherFeatureStatement.excludes);

  // STATEMENT 5: Get grid position statement
  const gridStatement = getGridStatement(culpritId, suspectsIds, statements);
  statements.push(gridStatement);
  updateExcludeScoreBoard(excludeScoreBoard, gridStatement.excludes);

  // Order the statements by (testimony, feature, grid, then the other features)
  const sortedStatements = [statements[0], statements[1], statements[2], statements[4], statements[3]];

  // Get reason
  const reason = getReason(suspects[culpritId], reasons);

  return {
    isNsfw: testimony.nsfw ?? false,
    culpritId,
    statements: sortedStatements,
    suspects: suspectsIds.map((id) => suspects[id]),
    reason: reason.title,
    setId: `${culpritId}::${reason.id}::${sortedStatements[0].key}`,
    level: determineLevel(sortedStatements),
  };
}

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
  console.log('⚙️ Calculating suspect answers...');
  for (const questionId of Object.keys(data)) {
    const questionTestimonies = data[questionId];
    for (const suspectId of Object.keys(questionTestimonies)) {
      const { resolution, projection } = calculateSuspectAnswersData(suspectId, questionTestimonies);

      if (!resolution && !projection) {
        console.log('⁉️ Ignoring testimony with no resolution or projection');
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
        continue;
      }

      console.log('⁉️ Ignoring testimony with not enough values');
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
      console.log('⁉️ Removing testimonies with less than 3 answers');
      delete result[key];
    }
  });

  // Delete any entry that all the answers are the same
  Object.keys(result).forEach((key) => {
    const answers = uniq(Object.values(result[key]));
    if (answers.length === 1) {
      console.log('⁉️ Removing testimonies with the same answer');
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
      console.log('⁉️ Ignoring suspect with missing build', suspectId);
      continue;
    }

    if (!height) {
      console.log('⁉️ Ignoring suspect with missing height', suspectId);
      continue;
    }

    if (!features || features.length === 0) {
      console.log('⁉️ Ignoring suspect with missing features', suspectId);
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
  };

  // if the text has "não já", replace this part with "nunca"
  if (result.text.includes('não já')) {
    result.text = result.text.replace('não já', 'nunca');
  }

  return result;
};

const GRID_INDEXES: Dictionary<{ indexes: number[]; text: string }> = {
  row1: {
    indexes: [0, 1, 2],
    text: 'na primeira linha',
  },
  row2: {
    indexes: [3, 4, 5],
    text: 'na segunda linha',
  },
  row3: {
    indexes: [6, 7, 8],
    text: 'na terceira linha',
  },
  column1: {
    indexes: [0, 3, 6],
    text: 'na primeira coluna',
  },
  column2: {
    indexes: [1, 4, 7],
    text: 'na segunda coluna',
  },
  column3: {
    indexes: [2, 5, 8],
    text: 'na terceira coluna',
  },
  corners: {
    indexes: [0, 2, 6, 8],
    text: 'nos cantos',
  },
};

const getGridStatement = (
  culpritId: string,
  suspectsIds: string[],
  statements: StatementClue[],
): StatementClue => {
  // Get culprit row and column
  const culpritPosition = suspectsIds.indexOf(culpritId);
  // Calculate the grid rule that has the least amount of excludes

  const basicStatements = statements.slice(0, 3);

  const gridIndexesCounts: Dictionary<number> = {};
  for (const key of Object.keys(GRID_INDEXES)) {
    const { indexes } = GRID_INDEXES[key];

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

  const excludes = GRID_INDEXES[bestGridCondition].indexes.map((index) => suspectsIds[index]);

  return {
    key: `not.grid.${bestGridCondition}`,
    text: `O(a) suspeito(a) não está ${GRID_INDEXES[bestGridCondition].text}`,
    excludes,
  };
};

const getFeatureStatement = (
  culpritId: string,
  suspectsIds: string[],
  featuresCulpritDoesNotHave: Dictionary<Dictionary<true>>,
  usedKeys: string[] = [],
  type: 'best' | 'worst' = 'best',
): StatementClue => {
  const suspectsWithoutCulprit = difference(suspectsIds, [culpritId]);
  const usedFeatures = usedKeys.map((key) => key.replace('not.feature.', ''));

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

  const selectedFeature =
    type === 'best' ? sortedFeatures[0] : (sample(sortedFeatures.slice(2, 5)) ?? sortedFeatures[2]);
  if (!selectedFeature) {
    throw Error(`No suitable feature found for ${type} selection`);
  }
  const excludes = suspectsWithoutCulprit.filter(
    (suspectId) => featuresCulpritDoesNotHave[selectedFeature][suspectId],
  );

  const translatedFeature = FEATURE_PT_TRANSLATIONS[selectedFeature];

  if (!translatedFeature) {
    console.warn(`Feature ${selectedFeature} not found in translations`);
  }

  return {
    key: `not.feature.${selectedFeature}`,
    text: `O(a) suspeito(a) não ${translatedFeature || selectedFeature}`,
    excludes,
  };
};

const FEATURE_PT_TRANSLATIONS: Dictionary<string> = {
  male: 'é homem',
  female: 'é mulher',
  black: 'é negro(a)',
  white: 'é branco(a)',
  asian: 'é asiático(a)',
  latino: 'é latino(a)',
  thin: 'é magrelo(a)',
  fat: 'é gordo(a)',
  large: 'é gordo(a)',
  tall: 'é alto(a)',
  short: 'é baixinho(a)',
  young: 'é jovem',
  adult: 'é adulto(a)',
  senior: 'é idoso(a)',
  average: 'é médio(a)',
  medium: 'é médio(a)',
  mixed: 'é mestiço(a)',
  hat: 'está usando um chapéu',
  tie: 'está usando uma gravata',
  glasses: 'está usando óculos',
  brownHair: 'tem cabelo castanho',
  shortHair: 'tem cabelo curto',
  beard: 'tem barba',
  caucasian: 'é caucasiano(a)',
  scarf: 'está usando um cachecol',
  blondeHair: 'tem cabelo loiro',
  longHair: 'tem cabelo longo',
  greyHair: 'tem cabelo grisalho',
  bald: 'é careca',
  mustache: 'tem bigode',
  goatee: 'tem cavanhaque',
  muscular: 'é musculoso(a)',
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
