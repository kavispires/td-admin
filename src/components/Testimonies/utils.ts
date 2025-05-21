import type { TestimonyAnswers } from 'pages/Testimonies/useTestimoniesResource';

export const calculateSuspectAnswersData = (suspectCardId: string, answers: TestimonyAnswers) => {
  const num = suspectCardId.split('-')[1];
  const imageId = `us-gb-${num}`;
  const values = answers[suspectCardId] ?? [];

  let systemYesCount = 0;
  let systemNoCount = 0;

  values.forEach((v) => {
    if (v === 3) systemYesCount += 3;
    if (v === -3) systemNoCount += 3;
  });
  const valuesWithoutSystem = values.filter((v) => v !== 3 && v !== -3);

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
  const reliable = votesCount > 4;

  const result = (() => {
    if (reliable) return yesPercentage > noPercentage ? '👍' : '👎';
    return null;
  })();

  // Calculate projected likelihood
  // If it is not reliable, but has enough data, if the current data is more than 70% to yes or no, declare it's side (yes or no). If there's not enough data, likelihood is null
  const projection = (() => {
    if (!enoughData) return null;

    if (yesPercentage >= 55) return '👍';
    if (noPercentage >= 55) return '👎';
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
    projection,
    result,
  };
};
