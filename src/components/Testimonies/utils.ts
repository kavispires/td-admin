import type {
  TestimonyAnswers,
  TestimonyAnswersValues,
} from '@pages/Libraries/Testimonies/useTestimoniesResource';
import type { SuspectCardData } from '@types';
import { isEmpty } from 'lodash';

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

  const num = suspectCardId.split('-')[1].padStart(3, '0');
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
      yesCountFromSystem += 32;
    } else if (v === -32) {
      noCountFromSystem += 32;
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

/** Reserved marker values that carry a special, non-summable meaning. */
const KEY_VALUES = [4, -4, 32, -32];
/** Magnitude ceiling applied to summed values when the two sides diverge too much. */
const CAP = 31;
/** Difference (between the remaining positive/negative sums) above which the cap kicks in. */
const CAP_DIFF_THRESHOLD = 13;

/**
 * Reduces a computed sum that happens to land exactly on a reserved marker value (4, -4, 32, -32)
 * by 1 towards zero, pushing the removed unit into a separate +1/-1 padding entry so the total
 * weight is preserved. This avoids ambiguity between a "real" curated marker and a coincidental
 * sum, while leaving sums that don't collide untouched.
 *
 * @param sum - Computed sum for one polarity (all positive or all negative)
 * @returns Array with either the untouched sum, the sum split into a reduced value plus padding, or nothing (if the sum is 0)
 */
const splitIfCollidesWithKeyValue = (sum: number): number[] => {
  if (sum === 0) return [];
  if (!KEY_VALUES.includes(sum)) return [sum];

  const padding = sum > 0 ? 1 : -1;
  return [sum - padding, padding];
};

/**
 * Normalizes an array of testimony answer values.
 *
 * - `32`/`-32` ("Sure"/"Unsure") are always kept untouched, one entry per occurrence: they are
 *   never folded into any sum.
 * - `4`/`-4` ("Fit"/"Unfit", curated by an admin) are reserved one per polarity (if present) as
 *   untouched markers. Any additional `4`s/`-4`s beyond the first are folded into the regular sum.
 * - Every other value (regular `1`/`-1` votes, extra `4`/`-4`s, and any other magnitude) is summed,
 *   separately for positive and negative.
 * - If a computed sum lands exactly on a reserved marker value (`4`, `-4`, `32`, `-32`), it is
 *   split via `splitIfCollidesWithKeyValue` to avoid ambiguity with the marker's meaning.
 * - Otherwise, if the absolute difference between the (remaining) positive and negative sums
 *   exceeds `CAP_DIFF_THRESHOLD`, each sum is lossily capped to `+/-CAP` (excess is discarded).
 * - Legacy `0` values are treated the same as `-1` ("does not fit").
 *
 * The final array places the reserved markers first (`32`, `-32`, `4`, `-4`, whichever are
 * present), followed by the computed sums and any padding values, ascending.
 *
 * @param arr - Array of testimony answer values to normalize
 * @returns Normalized array of testimony answer values
 *
 * @example
 * normalizeValues([1, 1, 1, 1, 4]) // => [4, 1, 3]
 * @example
 * normalizeValues([1, 1, 4, 4, 4]) // => [4, 10]
 * @example
 * normalizeValues([-1, 4, 4, 4, 4, 4, 4, 4, 8]) // => [4, -1, 1, 31]
 * @example
 * normalizeValues([-4, -4, -7, -12, -1, 4, 4, 4, 4, 4, 4, 4, 8]) // => [-4, 4, -24, 1, 31]
 */
export default function normalizeValues(arr: TestimonyAnswersValues[]): TestimonyAnswersValues[] {
  // Legacy encoding: 0 means "does not fit", same polarity as -1
  const processed = arr.map((v) => (v === 0 ? -1 : v));

  // 32/-32 ("Sure"/"Unsure"): always kept untouched, one entry per occurrence
  const sureMarkers = processed.filter((v) => v === 32 || v === -32);

  // 4/-4 ("Fit"/"Unfit"): reserve exactly one of each polarity (if present) as an untouched marker
  const hasFitMarker = processed.includes(4);
  const hasUnfitMarker = processed.includes(-4);

  // Everything else (regular votes, extra 4/-4s beyond the reserved one, other magnitudes) is summed
  const remaining = [...processed];
  if (hasFitMarker) remaining.splice(remaining.indexOf(4), 1);
  if (hasUnfitMarker) remaining.splice(remaining.indexOf(-4), 1);
  const toSum = remaining.filter((v) => v !== 32 && v !== -32);

  const rawPositiveSum = toSum.filter((v) => v > 0).reduce((acc, v) => acc + v, 0);
  const rawNegativeSum = toSum.filter((v) => v < 0).reduce((acc, v) => acc + v, 0);

  // Collision-avoidance always takes priority over the general cap: an exact match against a
  // reserved marker (e.g. a raw sum of exactly 32) must be split before any capping happens,
  // otherwise the lossy cap would silently swallow it with no padding.
  const collidesPositive = KEY_VALUES.includes(rawPositiveSum);
  const collidesNegative = KEY_VALUES.includes(rawNegativeSum);

  const diff = Math.abs(Math.abs(rawPositiveSum) - Math.abs(rawNegativeSum));
  const shouldCap = diff > CAP_DIFF_THRESHOLD;

  const positiveResult = collidesPositive
    ? splitIfCollidesWithKeyValue(rawPositiveSum)
    : splitIfCollidesWithKeyValue(shouldCap ? Math.min(rawPositiveSum, CAP) : rawPositiveSum);
  const negativeResult = collidesNegative
    ? splitIfCollidesWithKeyValue(rawNegativeSum)
    : splitIfCollidesWithKeyValue(shouldCap ? Math.max(rawNegativeSum, -CAP) : rawNegativeSum);

  const sortedKeyMarkers = [
    ...sureMarkers.filter((v) => v === 32),
    ...sureMarkers.filter((v) => v === -32),
    ...(hasFitMarker ? [4] : []),
    ...(hasUnfitMarker ? [-4] : []),
  ];

  const sumsAndPadding = [...positiveResult, ...negativeResult].sort((a, b) => a - b);

  return [...sortedKeyMarkers, ...sumsAndPadding] as TestimonyAnswersValues[];
}

/**
 * Calculates the total count of answers based on specific values.
 *
 * @param values - An array of testimony answer values to be counted
 * @returns The total count of answers, where:
 *  - Values 0 or 1 contribute 1 to the count
 *  - Values 3 or -3 contribute 3 to the count
 *  - Values 4 or -4 contribute 4 to the count
 *  - Any other value contributes its absolute value to the count
 */
export const countAnswersAbsoluteTotal = (values: TestimonyAnswersValues[]): number => {
  return values.reduce((acc: number, value) => {
    const absValue = Math.abs(value);
    if (absValue) {
      return acc + absValue;
    }

    return acc;
  }, 0);
};

/**
 * Filters suspects to include only those from the adult deck.
 * Only adult suspects should participate in testimonies per business rules.
 *
 * @param suspects - Dictionary of suspects to filter
 * @returns Dictionary containing only suspects with deck === 'adult'
 */
export const filterAdultSuspects = (suspects: Dictionary<SuspectCardData>): Dictionary<SuspectCardData> => {
  return Object.fromEntries(Object.entries(suspects).filter(([_, suspect]) => suspect.deck === 'adult'));
};
