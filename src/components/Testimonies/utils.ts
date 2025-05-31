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
    if (v === 3) systemYesCount += 3;
    if (v === -3) systemNoCount += 3;
    if (v === 4) systemYesCount += 4;
    if (v === -4) systemNoCount += 4;
  });
  const valuesWithoutSystem = values.filter((v) => ![-4, -3, 3, 4].includes(v));

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
    if (reliable) return yesPercentage > noPercentage ? '👍' : '👎';
    return null;
  })();

  // Calculate projected likelihood
  // If it is not reliable, but has enough data, if the current data is more than 70% to yes or no, declare it's side (yes or no). If there's not enough data, likelihood is null
  const projection = (() => {
    if (!enoughData) return null;

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

export default function normalizeValues(arr: TestimonyAnswersValues[]): TestimonyAnswersValues[] {
  // Start result keeping all values that are not 0 or 1
  const result: TestimonyAnswersValues[] = arr.filter((v) => ![0, 1].includes(v));
  const singles: TestimonyAnswersValues[] = arr.filter((v) => [0, 1].includes(v));

  const counts: Dictionary<number> = {
    0: 0,
    1: 0,
  };

  singles.forEach((value) => {
    if (counts[value] === undefined) {
      throw Error(`what is this value? ${value}`);
    }
    counts[value] += 1;
  });

  Object.entries(counts).forEach(([value, count]) => {
    if (count > 0) {
      const groups = Math.floor(count / 4);
      const remainder = count % 4;

      for (let i = 0; i < groups; i++) {
        result.push(value === '0' ? -4 : 4);
      }
      if (remainder > 0) {
        const remainderArr = Array.from({ length: remainder }, () => (value === '0' ? 0 : 1));
        result.push(...remainderArr);
      }
    }
  });

  return result.sort((a, b) => a - b);
}
