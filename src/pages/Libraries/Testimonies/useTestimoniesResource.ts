import { useResourceFirestoreData } from '@hooks/useResourceFirestoreData';
import { useTDResource } from '@hooks/useTDResource';
import type { SuspectCardData, TestimonyStatementCardData } from '@types';
import { RESOURCES_NAMES } from '@utils/resources-list';

/**
 * Values <suspectId, answers>
 * -1 = Does not fit (regular vote)
 * 1 = Fits (regular vote)
 * -4 = Curated "Unfit" (manually set by an admin)
 * 4 = Curated "Fit" (manually set by an admin)
 * -32 = Curated "Unsure" (manually set by an admin, deterministic)
 * 32 = Curated "Sure" (manually set by an admin, deterministic)
 * Any other number = normalized sum of regular votes (see `normalizeValues`)
 */
export type TestimonyAnswersValues = -1 | 1 | 4 | -4 | 32 | -32 | number;

/**
 * Dictionary of suspect IDs to their corresponding testimony answers.
 * E.g., { "suspect-001": [1, 0, -1], "suspect-002": [0, 0, 1] }
 */
export type TestimonyAnswers = Dictionary<TestimonyAnswersValues[]>;

export type UseTestimoniesResourceReturnType = {
  isLoading: boolean;
  isSuccess: boolean;
  error: ResponseError;
  data: Dictionary<TestimonyAnswers>;
  questions: Dictionary<TestimonyStatementCardData>;
  suspects: Dictionary<SuspectCardData>;
  hasNewData: boolean;
  isSaving: boolean;
  save: () => void;
  addEntryToUpdate: (id: string, entry: TestimonyAnswers) => void;
  entriesToUpdate: Dictionary<TestimonyAnswers>;
  isDirty: boolean;
};

export function useTestimoniesResource(): UseTestimoniesResourceReturnType {
  const suspectsQuery = useTDResource<SuspectCardData>(RESOURCES_NAMES.SUSPECTS);
  const statementsQuery = useTDResource<TestimonyStatementCardData>(
    `${RESOURCES_NAMES.TESTIMONY_STATEMENTS}-pt`,
  );
  const dataQuery = useResourceFirestoreData<TestimonyAnswers, Dictionary<string>>({
    tdrResourceName: RESOURCES_NAMES.TESTIMONY_ANSWERS,
    firestoreDataCollectionName: 'testimonies',
    serialize: true,
    deserializer: testimoniesDeserializer,
  });

  return {
    ...dataQuery,
    isLoading: dataQuery.isLoading || statementsQuery.isLoading || suspectsQuery.isLoading,
    isSuccess: dataQuery.isSuccess && statementsQuery.isSuccess && suspectsQuery.isSuccess,
    error: dataQuery.error || statementsQuery.error || suspectsQuery.error,
    questions: statementsQuery.data,
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
