import { useGetFirebaseDoc } from 'hooks/useGetFirebaseDoc';
import { useTDResource } from 'hooks/useTDResource';
import { cloneDeep } from 'lodash';
import { useMemo } from 'react';
import type { SuspectCard, TestimonyQuestionCard } from 'types';
import { deserializeFirebaseData } from 'utils';

export type TestimonyAnswers = Record<string, (1 | 0)[]>;

export function useTestimoniesResource() {
  const suspectsQuery = useTDResource<SuspectCard>('suspects');
  const questionsQuery = useTDResource<TestimonyQuestionCard>('testimony-questions-pt');
  const tdrQuery = useTDResource<TestimonyAnswers>('testimony-answers');
  const firebaseQuery = useGetFirebaseDoc<Dictionary<TestimonyAnswers>, Dictionary<TestimonyAnswers>>(
    'data',
    'testimonies',
    {
      select: deserializeFirebaseData,
    },
  );

  const mergedData: Dictionary<TestimonyAnswers> = useMemo(() => {
    if (!tdrQuery.data || !firebaseQuery.data) {
      return {};
    }

    const newData = cloneDeep(tdrQuery.data);

    Object.keys(firebaseQuery.data).forEach((questionId) => {
      const entry = firebaseQuery.data[questionId];
      if (newData[questionId] === undefined) {
        newData[questionId] = entry;
        return;
      }

      Object.keys(entry).forEach((suspectId) => {
        if (newData[questionId][suspectId] === undefined) {
          newData[questionId][suspectId] = entry[suspectId];
        } else {
          console.log('merging', questionId, suspectId);
          newData[questionId][suspectId].push(...entry[suspectId]);
        }
      });
    });

    return newData;
  }, [tdrQuery.data, firebaseQuery.data]);

  return {
    isLoading:
      tdrQuery.isLoading || firebaseQuery.isLoading || questionsQuery.isLoading || suspectsQuery.isLoading,
    isSuccess:
      tdrQuery.isSuccess && firebaseQuery.isSuccess && questionsQuery.isSuccess && suspectsQuery.isSuccess,
    error: tdrQuery.error || firebaseQuery.error,
    data: mergedData,
    questions: questionsQuery.data,
    suspects: suspectsQuery.data,
  };
}
