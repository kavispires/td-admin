import { calculateSuspectAnswersData } from 'components/Testimonies/utils';
import { useTDResource } from 'hooks/useTDResource';
import { keyBy } from 'lodash';
import type { TestimonyAnswers } from 'pages/Libraries/Testimonies/useTestimoniesResource';
import { useMemo } from 'react';
import type { SuspectCard, TestimonyQuestionCard } from 'types';

export type CrossReferenceData = {
  id: string;
  name: string;
  description: string;
  relatedTestimonyIds: string[];
  unrelatedTestimonyIds: string[];
};

type SuspectPersonality = {
  suspectId: string;
  zodiacSign: string;
  ascendantSign: string;
  mbtiType: string;
  notEnoughData?: boolean;
};

export function useSuspectPersonalitiesData() {
  // Get Suspects
  const suspectsQuery = useTDResource<SuspectCard>('suspects');

  // Get Testimonies
  const testimoniesQuery = useTDResource<TestimonyQuestionCard>('testimony-questions-pt');

  // Get Testimonies answers
  const testimonyAnswersQuery = useTDResource<TestimonyAnswers>('testimony-answers');

  // Get Cross-reference Zodiac
  const zodiacCrossRefQuery = useTDResource<CrossReferenceData>('suspect-testimony-crossreference-zodiac-pt');

  // Get Cross-reference MBTI
  const mbtiCrossRefQuery = useTDResource<CrossReferenceData>('suspect-testimony-crossreference-mbti-pt');

  // Process data to derive personalities
  const personalities: Dictionary<SuspectPersonality> = useMemo(() => {
    if (
      !suspectsQuery.data ||
      !testimoniesQuery.data ||
      !testimonyAnswersQuery.data ||
      !zodiacCrossRefQuery.data ||
      !mbtiCrossRefQuery.data
    ) {
      return {};
    }

    return getSuspectPersonalities(
      suspectsQuery.data,
      testimoniesQuery.data,
      testimonyAnswersQuery.data,
      zodiacCrossRefQuery.data,
      mbtiCrossRefQuery.data,
    );
  }, [
    suspectsQuery.data,
    testimoniesQuery.data,
    testimonyAnswersQuery.data,
    zodiacCrossRefQuery.data,
    mbtiCrossRefQuery.data,
  ]);

  const { unusedZodiacTestimonyIds, unusedMbtiTestimonyIds } = useMemo(() => {
    const allZodiacTestimonyIds = Object.values(zodiacCrossRefQuery.data ?? {}).reduce(
      (acc: Dictionary<true>, crossRef) => {
        crossRef.relatedTestimonyIds.forEach((id) => {
          acc[id] = true;
        });
        crossRef.unrelatedTestimonyIds.forEach((id) => {
          acc[id] = true;
        });
        return acc;
      },
      {},
    );
    const allMbtiTestimonyIds: Dictionary<true> = Object.values(mbtiCrossRefQuery.data ?? {}).reduce(
      (acc: Dictionary<true>, crossRef) => {
        crossRef.relatedTestimonyIds.forEach((id) => {
          acc[id] = true;
        });
        crossRef.unrelatedTestimonyIds.forEach((id) => {
          acc[id] = true;
        });
        return acc;
      },
      {},
    );

    return {
      unusedZodiacTestimonyIds: Object.keys(allZodiacTestimonyIds).sort(),
      unusedMbtiTestimonyIds: Object.keys(allMbtiTestimonyIds).sort(),
    };
  }, [zodiacCrossRefQuery.data, mbtiCrossRefQuery.data]);

  console.log(
    'Unused Zodiac Testimony IDs:',
    unusedZodiacTestimonyIds.map((id) => `${id} - ${testimoniesQuery.data?.[id]?.question || 'N/A'}`),
  );
  console.log(
    'Unused MBTI Testimony IDs:',
    unusedMbtiTestimonyIds.map((id) => `${id} - ${testimoniesQuery.data?.[id]?.question || 'N/A'}`),
  );

  return {
    error:
      suspectsQuery.error ||
      testimoniesQuery.error ||
      testimonyAnswersQuery.error ||
      zodiacCrossRefQuery.error ||
      mbtiCrossRefQuery.error,
    isLoading:
      suspectsQuery.isLoading ||
      testimoniesQuery.isLoading ||
      testimonyAnswersQuery.isLoading ||
      zodiacCrossRefQuery.isLoading ||
      mbtiCrossRefQuery.isLoading,
    data: {
      suspects: suspectsQuery.data,
      testimonies: testimoniesQuery.data,
      testimonyAnswers: testimonyAnswersQuery.data,
      zodiacCrossReference: zodiacCrossRefQuery.data,
      mbtiCrossReference: mbtiCrossRefQuery.data,
      personalities,
      unusedZodiacTestimonyIds,
      unusedMbtiTestimonyIds,
    },
  };
}

const getSuspectPersonalities = (
  suspects: Dictionary<SuspectCard>,
  testimonies: Dictionary<TestimonyQuestionCard>,
  testimonyAnswers: Dictionary<TestimonyAnswers>,
  zodiacCrossReference: Dictionary<CrossReferenceData>,
  mbtiCrossReference: Dictionary<CrossReferenceData>,
) => {
  const positiveResolutions: Dictionary<Dictionary<true>> = {};
  const negativeResolutions: Dictionary<Dictionary<true>> = {};

  for (const suspectId in suspects) {
    for (const testimonyId in testimonies) {
      const answers = testimonyAnswers[testimonyId] ?? {};
      const result = calculateSuspectAnswersData(suspectId, testimonyId, answers);

      if (result.resolution === '👍' || result.projection === '👍') {
        positiveResolutions[suspectId] = positiveResolutions[suspectId] || {};
        positiveResolutions[suspectId][testimonyId] = true;
      } else if (result.resolution === '👎' || result.projection === '👎') {
        negativeResolutions[suspectId] = negativeResolutions[suspectId] || {};
        negativeResolutions[suspectId][testimonyId] = true;
      }
    }
  }

  const personalities: Dictionary<SuspectPersonality> = {};

  for (const suspectId in suspects) {
    const zodiacCounts: Dictionary<number> = {};
    const mbtiCounts: Dictionary<number> = {};

    for (const crossRef of Object.values(zodiacCrossReference)) {
      zodiacCounts[crossRef.id] = 0;

      crossRef.relatedTestimonyIds.forEach((id) => {
        if (positiveResolutions[suspectId]?.[id]) {
          zodiacCounts[crossRef.id] += 1;
        }
      });
      crossRef.unrelatedTestimonyIds.forEach((id) => {
        if (negativeResolutions[suspectId]?.[id]) {
          zodiacCounts[crossRef.id] += 1;
        }
      });
    }

    // Determine zodiacSign and ascendantSign based on counts
    const sortedZodiac = Object.entries(zodiacCounts).sort((a, b) => b[1] - a[1]);
    const zodiacSign = sortedZodiac[0]?.[0] || '';
    const ascendantSign = sortedZodiac[1]?.[0] || '';

    // Count MBTI types from positive and negative resolutions
    for (const crossRef of Object.values(mbtiCrossReference)) {
      mbtiCounts[crossRef.id] = 0;

      crossRef.relatedTestimonyIds.forEach((id) => {
        if (positiveResolutions[suspectId]?.[id]) {
          mbtiCounts[crossRef.id] += 1;
        }
      });
      crossRef.unrelatedTestimonyIds.forEach((id) => {
        if (negativeResolutions[suspectId]?.[id]) {
          mbtiCounts[crossRef.id] += 1;
        }
      });
    }

    // Between pairs, get the higher value, if the different is less than 2, marks with X
    const PAIRS = [
      ['E', 'I'],
      ['S', 'N'],
      ['T', 'F'],
      ['J', 'P'],
    ];
    let insufficientData = false;
    let mbtiType = '';

    for (const [typeA, typeB] of PAIRS) {
      const countA = mbtiCounts[typeA] || 0;
      const countB = mbtiCounts[typeB] || 0;
      if (Math.abs(countA - countB) < 1) {
        insufficientData = true;
        mbtiType += 'X';
      } else if (countA > countB) {
        mbtiType += typeA;
      } else {
        mbtiType += typeB;
      }
    }

    personalities[suspectId] = {
      suspectId,
      zodiacSign,
      ascendantSign,
      mbtiType,
      // notEnoughData: insufficientData,
    };
  }

  return personalities;
};
