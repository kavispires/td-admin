import { isEmpty } from 'lodash';
import type {
  TestimonyAnswers,
  TestimonyAnswersValues,
} from 'pages/Libraries/Testimonies/useTestimoniesResource';

/**
 * Calculates statistical data and projections for a suspect's answers to a specific question.
 *
 * This function aggregates system and audience votes, determines reliability, completeness,
 * and provides a projected resolution based on configurable thresholds.
 *
 * @param suspectCardId - The unique identifier for the suspect card (e.g., "suspect-1").
 * @param questionId - The unique identifier for the question being answered.
 * @param answers - An object containing all answers for suspects, keyed by suspectCardId.
 * @param options - Optional configuration for calculation thresholds.
 * @param options.reliabilityThreshold - Minimum total value required for reliable calculation (default: 4).
 * @param options.projectionThreshold - Percentage threshold for projecting a likely outcome (default: 55).
 * @param options.forceProjection - If true, forces projection calculation even with insufficient data.
 *
 * @returns An object containing calculated statistics and projections:
 * - suspectCardId: The input suspectCardId.
 * - imageId: The derived image identifier for the suspect.
 * - questionId: The input questionId.
 * - enoughData: Whether there is enough data to make a judgment.
 * - reliable: Whether the data is considered reliable.
 * - total: The total sum of absolute answer values.
 * - yesCount: Aggregated "yes" votes from system and audience.
 * - yesPercentage: Percentage of "yes" votes.
 * - noCount: Aggregated "no" votes from system and audience.
 * - noPercentage: Percentage of "no" votes.
 * - blankPercentage: Percentage of unanswered or blank votes.
 * - complete: Whether the answer set is complete or deterministic.
 * - values: The array of answer values for the suspect.
 * - resolution: The resolved outcome ('👍', '👎', or null).
 * - projection: The projected likely outcome ('👍', '👎', or null).
 */
export const calculateSuspectAnswersData = (
  suspectCardId: string,
  questionId: string,
  answers: TestimonyAnswers,
  options?: {
    reliabilityThreshold?: number;
    projectionThreshold?: number;
    // Ignores enough data to calculate projection
    forceProjection?: boolean;
  },
) => {
  const { reliabilityThreshold = 4, projectionThreshold = 55 } = options || {};

  const num = suspectCardId.split('-')[1];
  const imageId = `us-gb-${num}`;
  const values = isEmpty(answers[suspectCardId]) ? [] : answers[suspectCardId];

  const hasDeterministicValue = values.some((v) => v === 32 || v === -32); // Automatic enough data
  let yesCountFromSystem = 0;
  let noCountFromSystem = 0;
  let yesCountAudience = 0;
  let noCountAudience = 0;
  let total = 0;

  values.forEach((v) => {
    if (v === 32) {
      yesCountFromSystem += 35;
    } else if (v === -32) {
      noCountFromSystem += 35;
    } else if (v === 4) {
      yesCountFromSystem += 4;
    } else if (v === -4) {
      noCountFromSystem += 4;
    } else if (v > 0) {
      yesCountAudience += v;
    } else if (v < 0) {
      noCountAudience += Math.abs(v);
    }

    total += Math.abs(v);
  });
  const audienceCount = yesCountAudience + noCountAudience;

  // Use reliabilityThreshold as minimum denominator for percentage calculations
  const percentageDenominator = Math.max(total, reliabilityThreshold);
  const yesPercentage =
    total === 0 ? 0 : Math.round(((yesCountFromSystem + yesCountAudience) / percentageDenominator) * 100);
  const noPercentage =
    total === 0 ? 0 : Math.round(((noCountFromSystem + noCountAudience) / percentageDenominator) * 100);
  const yesCount = yesCountFromSystem + yesCountAudience;
  const noCount = noCountFromSystem + noCountAudience;
  const blankPercentage =
    total === 0
      ? 100
      : Math.round(((percentageDenominator - yesCount - noCount) / percentageDenominator) * 100);
  const complete = hasDeterministicValue || total >= reliabilityThreshold;

  const enoughData = hasDeterministicValue || audienceCount > reliabilityThreshold / 1.5 || total >= 4;

  // if (total > 3) {
  //   console.log({ suspectCardId, total, enoughData, complete, values });
  // }
  const reliable = enoughData && total > reliabilityThreshold && Math.abs(yesPercentage - noPercentage) >= 40;

  const resolution = (() => {
    if (reliable && Math.abs(yesPercentage - noPercentage) > 40)
      return yesPercentage > noPercentage ? '👍' : '👎';
    return null;
  })();

  // Calculate projected likelihood
  // If it is not reliable, but has enough data, if the current data is more than 70% to yes or no, declare it's side (yes or no). If there's not enough data, likelihood is null
  const projection = (() => {
    if (Math.abs(yesPercentage - noPercentage) < 50) return null;
    if (yesPercentage >= projectionThreshold) return '👍';
    if (noPercentage >= projectionThreshold) return '👎';
    return null;
  })();

  return {
    suspectCardId,
    imageId,
    questionId,
    enoughData,
    reliable,
    total,
    yesCount,
    yesPercentage,
    noCount,
    noPercentage,
    blankPercentage,
    complete,
    values,
    resolution,
    projection,
  };
};

/**
 * Normalizes an array of testimony answer values according to specific rules.
 *
 * This function processes an array of testimony values, specifically handling values 0 and 1 in a special way:
 * - Values that are not 0 or 1 are kept as is
 * - Values of 0 and 1 are grouped:
 *   - For every 4 occurrences of 0, a -4 is added to the result
 *   - For every 4 occurrences of 1, a 4 is added to the result
 *   - Any remaining 0s or 1s after grouping are kept as is
 *
 * The function returns a sorted array of the normalized values.
 *
 * @param arr - Array of testimony answer values to normalize
 * @returns Sorted array of normalized testimony answer values
 * @throws Error if an unexpected value is encountered in the input array
 *
 * @example
 * Returns [-4, 2, 3, 4]
 * normalizeValues([0, 0, 0, 0, 1, 1, 1, 1, 2, 3])
 */
export default function normalizeValues(arr: TestimonyAnswersValues[]): TestimonyAnswersValues[] {
  // Convert all 0 values to -1 for easier processing
  const processed = arr.map((v) => (v === 0 ? -1 : v));

  // Keep all -32 and 32 as is
  // Keep all 4 and -4 as is
  const final: number[] = arr.filter((v) => v === -32 || v === 32 || v === 4 || v === -4);

  // Process -1 and 1 values
  const ones = processed.filter((v) => v === -1 || v === 1);

  // This should be done just now because after the first time everything
  const others = processed
    .filter((v) => ![-32, 32, 4, -4, -1, 1].includes(v))
    .flatMap((v) => {
      return Array.from({ length: Math.abs(v) }, () => (v > 0 ? 1 : -1));
    });

  const allOnes = [...ones, ...others].sort((a, b) => a - b);

  /// From allOnes, every the THRESHOLD -1s become a -THRESHOLD, every THRESHOLD 1s become a +THRESHOLD, the reminder stay as is
  const counts: { [-1]: number; 1: number } = {
    '-1': 0,
    '1': 0,
  };

  allOnes.forEach((v) => {
    if (v === -1 || v === 1) {
      counts[v] += 1;
    }
  });

  const THRESHOLD = 8;

  for (const [key, value] of Object.entries(counts)) {
    const groups = Math.floor(value / THRESHOLD);
    const remainder = value % THRESHOLD;

    for (let i = 0; i < groups; i++) {
      final.push(key === '-1' ? -THRESHOLD : THRESHOLD);
    }
    if (remainder > 0) {
      const remainderArr = Array.from({ length: remainder }, () => (key === '-1' ? -1 : 1));
      final.push(...remainderArr);
    }
  }

  return final.sort((a, b) => a - b) as TestimonyAnswersValues[];
}
