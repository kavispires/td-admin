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
export type TestimonyAnswersValues = -1 | 1 | 0 | 4 | -4 | -8 | 8 | 32 | -32;
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
