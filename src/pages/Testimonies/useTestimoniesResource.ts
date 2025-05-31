import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import type { SuspectCard, TestimonyQuestionCard } from 'types';

/**
 * Values <suspectId, answers>
 * 0 = Does not fit
 * 1 = Fits
 * 3 = For sure fits (set by system)
 * -3 = For sure does not fit (set by system)
 * 4 = Auto-grouped four 1s
 * -4 = Auto-grouped four 0s
 */
export type TestimonyAnswersValues = 1 | 0 | 3 | -3 | 4 | -4;
export type TestimonyAnswers = Dictionary<TestimonyAnswersValues[]>;

export type UseTestimoniesResourceReturnType = {
  isLoading: boolean;
  isSuccess: boolean;
  error: ResponseError;
  data: Dictionary<TestimonyAnswers>;
  questions: Dictionary<TestimonyQuestionCard>;
  suspects: Dictionary<SuspectCard>;
  hasNewData: boolean;
  isSaving: boolean;
  save: () => void;
  addEntryToUpdate: (id: string, entry: TestimonyAnswers) => void;
  entriesToUpdate: Dictionary<TestimonyAnswers>;
  isDirty: boolean;
};

export function useTestimoniesResource(): UseTestimoniesResourceReturnType {
  const suspectsQuery = useTDResource<SuspectCard>('suspects');
  const questionsQuery = useTDResource<TestimonyQuestionCard>('testimony-questions-pt');
  const dataQuery = useResourceFirestoreData<TestimonyAnswers>({
    tdrResourceName: 'testimony-answers',
    firestoreDataCollectionName: 'testimonies',
    serialize: true,
  });

  return {
    ...dataQuery,
    isLoading: dataQuery.isLoading || questionsQuery.isLoading || suspectsQuery.isLoading,
    isSuccess: dataQuery.isSuccess && questionsQuery.isSuccess && suspectsQuery.isSuccess,
    error: dataQuery.error || questionsQuery.error || suspectsQuery.error,
    questions: questionsQuery.data,
    suspects: suspectsQuery.data,
    hasNewData: dataQuery.hasFirestoreData,
  };
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
export const countAnswers = (values: TestimonyAnswersValues[]): number => {
  return values.reduce((acc: number, value) => {
    if (value === 0 || value === 1) {
      return acc + 1;
    }
    const absValue = Math.abs(value);
    if (absValue) {
      return acc + absValue;
    }

    return acc;
  }, 0);
};
