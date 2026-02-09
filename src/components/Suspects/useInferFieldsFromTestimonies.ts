import { calculateSuspectAnswersData } from 'components/Testimonies/utils';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { capitalize } from 'lodash';
import {
  type TestimonyAnswers,
  testimoniesDeserializer,
} from 'pages/Libraries/Testimonies/useTestimoniesResource';
import { useState } from 'react';
import type { SuspectExtendedInfo, TestimonyQuestionCard } from 'types';

const POSITIVE_WEIGHT = 3;
const NEUTRAL_WEIGHT = 1;

/**
 * A custom React hook that infers suspect personality fields (MBTI, zodiac sign, and alignment)
 * based on testimony question answers.
 *
 * This hook fetches testimony questions and answers data, then analyzes how a suspect's answers
 * correlate with personality traits. It uses a weighted voting system where:
 * - Related positive answers add +2 points to a trait
 * - Related negative answers subtract -1 point from a trait
 * - Unrelated answers have inverse effects
 *
 * The inferred values are:
 * - **MBTI**: Determined by highest scores in each dimension (E/I, S/N, T/F, J/P)
 * - **Zodiac**: The sign with the highest count (or "Undefined" if tied)
 * - **Alignment**: Combination of highest-scoring ethical (Lawful/Neutral/Chaotic) and moral (Good/Neutral/Evil) axes
 *
 * @param addExtendedInfoEntryToUpdate - Callback function to update suspect extended info in Firestore
 * @returns An async function that performs inference for a given suspect and updates their extended info
 *
 * @example
 * ```typescript
 * const onInfer = useInferFieldsFromTestimonies(addEntryToUpdate);
 * await onInfer(suspectExtendedInfo);
 * ```
 */
export function useInferFieldsFromTestimonies(
  addExtendedInfoEntryToUpdate: UseResourceFirestoreDataReturnType<SuspectExtendedInfo>['addEntryToUpdate'],
) {
  const [enabled, setEnabled] = useState(true);

  // Get Testimonies
  const testimoniesQuery = useTDResource<TestimonyQuestionCard>('testimony-questions-pt', { enabled });

  // Get Testimonies answers
  const testimonyAnswersQuery = useTDResource<TestimonyAnswers, Dictionary<string>>('testimony-answers', {
    select: testimoniesDeserializer,
    enabled,
  });

  const onInfer = async (suspectExtendedInfo: SuspectExtendedInfo) => {
    const testimonies = testimoniesQuery.data;
    const answers = testimonyAnswersQuery.data;

    // Enable queries if not already enabled
    if (!testimonies || !answers || !enabled) {
      console.log('Enabling testimony queries for inference');
      setEnabled(true);
      return;
    }

    if (!testimonies || !answers) {
      console.warn('Testimonies or answers data not available');
      return;
    }

    const suspectAnswers = Object.keys(testimonies).reduce(
      (acc, testimonyId) => {
        const res = calculateSuspectAnswersData(
          suspectExtendedInfo.id,
          testimonyId,
          answers?.[testimonyId] || {},
        );
        if (res.enoughData) {
          acc[testimonyId] = res;
        }

        return acc;
      },
      {} as Record<string, ReturnType<typeof calculateSuspectAnswersData>>,
    );

    const mbtiCounts: Dictionary<number> = {};
    const zodiacCounts: Dictionary<number> = {};
    const alignmentCounts: Dictionary<number> = {};

    Object.values(testimonies).forEach((testimony) => {
      const projection = suspectAnswers?.[testimony.id]?.projection;
      if (!projection) return;
      const positiveAnswerResult = projection === '👍';

      // MBTI
      testimony?.mbti?.related.forEach((v) => {
        if (positiveAnswerResult) {
          mbtiCounts[v] = (mbtiCounts[v] || 0) + POSITIVE_WEIGHT;
        } else {
          mbtiCounts[v] = (mbtiCounts[v] || 0) - NEUTRAL_WEIGHT;
        }
      });

      testimony?.mbti?.unrelated.forEach((v) => {
        if (positiveAnswerResult) {
          mbtiCounts[v] = (mbtiCounts[v] || 0) - NEUTRAL_WEIGHT;
        } else {
          mbtiCounts[v] = (mbtiCounts[v] || 0) + NEUTRAL_WEIGHT;
        }
      });

      // Zodiac
      testimony?.zodiac?.related.forEach((v) => {
        if (positiveAnswerResult) {
          zodiacCounts[v] = (zodiacCounts[v] || 0) + POSITIVE_WEIGHT;
        } else {
          zodiacCounts[v] = (zodiacCounts[v] || 0) - NEUTRAL_WEIGHT;
        }
      });

      testimony?.zodiac?.unrelated.forEach((v) => {
        if (positiveAnswerResult) {
          zodiacCounts[v] = (zodiacCounts[v] || 0) - NEUTRAL_WEIGHT;
        } else {
          zodiacCounts[v] = (zodiacCounts[v] || 0) + NEUTRAL_WEIGHT;
        }
      });

      // Alignment
      testimony?.alignment?.related.forEach((v) => {
        if (positiveAnswerResult) {
          alignmentCounts[v] = (alignmentCounts[v] || 0) + POSITIVE_WEIGHT;
        } else {
          alignmentCounts[v] = (alignmentCounts[v] || 0) - NEUTRAL_WEIGHT;
        }
      });

      testimony?.alignment?.unrelated.forEach((v) => {
        if (positiveAnswerResult) {
          alignmentCounts[v] = (alignmentCounts[v] || 0) - NEUTRAL_WEIGHT;
        } else {
          alignmentCounts[v] = (alignmentCounts[v] || 0) + NEUTRAL_WEIGHT;
        }
      });
    });

    console.log('MBTI counts so far:', mbtiCounts);
    console.log('Zodiac counts so far:', zodiacCounts);
    console.log('Alignment counts so far:', alignmentCounts);

    const mbti = [
      (mbtiCounts.E || 0) >= (mbtiCounts.I || 0) ? 'E' : 'I',
      (mbtiCounts.S || 0) >= (mbtiCounts.N || 0) ? 'S' : 'N',
      (mbtiCounts.T || 0) >= (mbtiCounts.F || 0) ? 'T' : 'F',
      (mbtiCounts.J || 0) >= (mbtiCounts.P || 0) ? 'J' : 'P',
    ].join('');

    // Get the most voted zodiac sign, if there's a tie, use "Undefined"
    const zodiacEntries = Object.entries(zodiacCounts).sort((a, b) => b[1] - a[1]);
    const zodiac =
      zodiacEntries.length > 0 && (zodiacEntries.length === 1 || zodiacEntries[0][1] > zodiacEntries[1][1])
        ? zodiacEntries[0][0]
        : 'Undefined';

    const totalEthicalRange =
      Math.max(alignmentCounts.lawful ?? 0, 0) + Math.max(alignmentCounts.chaotic ?? 0, 0);
    const totalMoralRange = Math.max(alignmentCounts.good ?? 0, 0) + Math.max(alignmentCounts.evil ?? 0, 0);

    const ethicalAbsoluteValue = Math.min(
      Math.max((alignmentCounts.chaotic ?? 0) - (alignmentCounts.lawful ?? 0), 0),
      totalEthicalRange,
    );
    const moralAbsoluteValue = Math.min(
      Math.max((alignmentCounts.evil ?? 0) - (alignmentCounts.good ?? 0), 0),
      totalMoralRange,
    );

    console.log('Total Ethical Range:', totalEthicalRange, 'Absolute Ethical Value:', ethicalAbsoluteValue);
    console.log('Total Moral Range:', totalMoralRange, 'Absolute Moral Value:', moralAbsoluteValue);

    const xAxisTitles = ['Lawful', 'Neutral', 'Chaotic'];
    const xAxisValues = [totalEthicalRange / 3, (totalEthicalRange * 2) / 3, totalEthicalRange];

    const yAxisTitles = ['Good', 'Neutral', 'Evil'];
    const yAxisValues = [totalMoralRange / 3, (totalMoralRange * 2) / 3, totalMoralRange];

    console.log('Ethical Axis Values:', xAxisValues, ethicalAbsoluteValue);
    console.log('Moral Axis Values:', yAxisValues, moralAbsoluteValue);

    const ethicalIndex = xAxisValues.findIndex((v) => ethicalAbsoluteValue <= v);
    const moralIndex = yAxisValues.findIndex((v) => moralAbsoluteValue <= v);

    const ethicalPart = xAxisTitles[ethicalIndex] || 'Neutral';
    const moralPart = yAxisTitles[moralIndex] || 'Neutral';

    const inferredAlignment = `${ethicalPart}-${moralPart}`;
    console.log('Inferred Alignment:', inferredAlignment);
    // inferredAlignment = inferredAlignment.replace('Neutral-Neutral', 'True Neutral');

    // Update extended info with inferred values
    const updatedExtendedInfo = {
      ...suspectExtendedInfo,
      mbti,
      zodiacSign: zodiac,
      alignment: inferredAlignment,
    };

    addExtendedInfoEntryToUpdate(suspectExtendedInfo.id, updatedExtendedInfo);
  };

  return onInfer;
}
