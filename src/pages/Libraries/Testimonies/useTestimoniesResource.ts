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
  const dataQuery = useResourceFirestoreData<TestimonyAnswers, Dictionary<string>>({
    tdrResourceName: 'testimony-answers',
    firestoreDataCollectionName: 'testimonies',
    serialize: true,
    deserializer: testimoniesDeserializer,
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
 * Serializes a dictionary of testimony answers into a dictionary of dictionaries,
 * where each inner dictionary's values are stringified JSON representations of the answers.
 *
 * @param data - A dictionary mapping testimony IDs to another dictionary of suspect IDs and their corresponding answers.
 * @returns A dictionary mapping testimony IDs to dictionaries of suspect IDs and their answers as JSON strings.
 */
export function testimoniesSerializer(data: Dictionary<TestimonyAnswers>): Dictionary<Dictionary<string>> {
  const serializedData: Dictionary<Dictionary<string>> = {};

  Object.entries(data).forEach(([testimonyId, answers]) => {
    serializedData[testimonyId] = {};
    Object.entries(answers).forEach(([suspectId, values]) => {
      serializedData[testimonyId][suspectId] = JSON.stringify(values);
    });
  });

  return serializedData;
}

/**
 * Deserializes a nested dictionary of testimony answers from JSON strings.
 *
 * @param data - A dictionary where each key is a testimony ID and each value is another dictionary.
 *               The inner dictionary maps suspect IDs to JSON stringified testimony answers.
 * @returns A dictionary mapping testimony IDs to another dictionary, which maps suspect IDs to deserialized `TestimonyAnswers` objects.
 */
export function testimoniesDeserializer(data: Dictionary<Dictionary<string>>): Dictionary<TestimonyAnswers> {
  const deserializedData: Dictionary<TestimonyAnswers> = {};

  Object.entries(data).forEach(([testimonyId, answers]) => {
    deserializedData[testimonyId] = {};
    Object.entries(answers).forEach(([suspectId, values]) => {
      deserializedData[testimonyId][suspectId] = JSON.parse(values);
    });
  });

  return deserializedData;
}
