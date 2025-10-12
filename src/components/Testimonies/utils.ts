import { isEmpty } from 'lodash';
import type { TestimonyAnswers, TestimonyAnswersValues } from 'pages/Testimonies/useTestimoniesResource';

export const calculateSuspectAnswersData = (
  suspectCardId: string,
  answers: TestimonyAnswers,
  options?: {
    reliabilityThreshold?: number;
    projectionThreshold?: number;
  },
) => {
  const { reliabilityThreshold = 4, projectionThreshold = 55 } = options || {};

  const num = suspectCardId.split('-')[1];
  const imageId = `us-gb-${num}`;
  const values = isEmpty(answers[suspectCardId]) ? [] : answers[suspectCardId];

  let systemYesCount = 0;
  let systemNoCount = 0;

  values.forEach((v) => {
    if (v > 0) systemYesCount += v;
    if (v < 0) systemNoCount += Math.abs(v);
  });
  const valuesWithoutSystem = values.filter((v) => ![-4, -3, 3, 4, -32, 32].includes(v));

  const votesCount = valuesWithoutSystem.length + systemYesCount + systemNoCount;
  const total = Math.max(votesCount, 5);
  const baseYesCount = values.filter((v) => v === 1).length;
  const yesCount = baseYesCount + systemYesCount;
  const yesPercentage = Math.round((yesCount / total) * 100);
  const baseNoCount = values.filter((v) => v === 0).length;
  const noCount = baseNoCount + systemNoCount;
  const noPercentage = Math.round((noCount / total) * 100);
  const blankPercentage = Math.round(((total - yesCount - noCount) / total) * 100);
  const complete = valuesWithoutSystem.length + systemYesCount + systemNoCount >= 5;

  const enoughData = votesCount > 3;
  const reliable = votesCount > reliabilityThreshold;

  const resolution = (() => {
    if (reliable && Math.abs(yesPercentage - noPercentage) > 40)
      return yesPercentage > noPercentage ? '👍' : '👎';
    return null;
  })();

  // Calculate projected likelihood
  // If it is not reliable, but has enough data, if the current data is more than 70% to yes or no, declare it's side (yes or no). If there's not enough data, likelihood is null
  const projection = (() => {
    if (!enoughData) return null;
    if (Math.abs(yesPercentage - noPercentage) < 60) return null;
    if (yesPercentage >= projectionThreshold) return '👍';
    if (noPercentage >= projectionThreshold) return '👎';
    return null;
  })();

  return {
    suspectCardId,
    imageId,
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
  // Keep all 3 and -3 as is
  const final: number[] = arr.filter((v) => v === -32 || v === 32 || v === 4 || v === -4);

  // Process -1 and 1 values
  const ones = processed.filter((v) => v === -1 || v === 1);

  // This should be done just now because after the first time everything
  const others = processed
    .filter((v) => ![-32, 32, 3, -3, -1, 1].includes(v))
    .flatMap((v) => {
      return Array.from({ length: Math.abs(v) }, () => (v > 0 ? 1 : -1));
    });

  const allOnes = [...ones, ...others].sort((a, b) => a - b);

  /// From allOnes, every the THRESHOLD -1s become a -THRESHOLD, every THRESHOLD 1s become a +THRESHOLD, the reminder stay as is
  const counts: { [-1]: number; [1]: number } = {
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
