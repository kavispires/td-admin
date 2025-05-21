import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { useGetFirestoreDoc } from 'hooks/useGetFirestoreDoc';
import { useTDResource } from 'hooks/useTDResource';
import { useUpdateFirestoreDoc } from 'hooks/useUpdateFirestoreDoc';
import { cloneDeep, isEmpty } from 'lodash';
import { useMemo, useState } from 'react';
import type { SuspectCard, TestimonyQuestionCard } from 'types';
import { deserializeFirestoreData } from 'utils';

/**
 * Values <suspectId, answers>
 * 0 = Does not fit
 * 1 = Fits
 * 3 = For sure fits (set by system)
 * -3 = For sure does not fit (set by system)
 */
export type TestimonyAnswers = Dictionary<(1 | 0 | 3 | -3)[]>;

export type UseTestimoniesResourceReturnType = {
  isLoading: boolean;
  isSuccess: boolean;
  error: Error | null;
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
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const suspectsQuery = useTDResource<SuspectCard>('suspects');
  const questionsQuery = useTDResource<TestimonyQuestionCard>('testimony-questions-pt');
  const tdrQuery = useTDResource<TestimonyAnswers>('testimony-answers');
  const firestoreQuery = useGetFirestoreDoc<Dictionary<string>, Dictionary<TestimonyAnswers>>(
    'data',
    'testimonies',
    {
      select: (d) =>
        deserializeFirestoreData(d, (entry: TestimonyAnswers) => {
          // Remove style code from suspect ids
          const newAnswers: TestimonyAnswers = {};
          Object.keys(entry).forEach((key) => {
            const newKey = key.replace(/us-\w{2}-(\d+)/, 'us-$1');
            newAnswers[newKey] = entry[key] || [];
          });

          return newAnswers;
        }) as Dictionary<TestimonyAnswers>,
    },
  );

  // Keeps track of items that have been modified
  const [modifiedEntries, setModifiedEntries] = useState<Dictionary<TestimonyAnswers>>({});

  const mutation = useUpdateFirestoreDoc('data', 'testimonies', {
    onSuccess: () => {
      notification.success({
        message: 'data/testimonies updated',
      });
      queryClient.refetchQueries({
        queryKey: ['firestore', 'data', 'testimonies'],
      });
      setModifiedEntries({});
    },
    onError: (error) => {
      notification.error({
        message: 'data/testimonies update failed',
        description: error.message,
      });
    },
  });

  const mergedData: Dictionary<TestimonyAnswers> = useMemo(() => {
    if (!tdrQuery.data || !firestoreQuery.data) {
      return {};
    }

    const newData = cloneDeep(tdrQuery.data);

    Object.keys(firestoreQuery.data).forEach((questionId) => {
      const modifiedEntry = modifiedEntries[questionId];
      if (modifiedEntry) {
        newData[questionId] = modifiedEntry;
        return;
      }

      const entry = firestoreQuery.data[questionId];
      if (newData[questionId] === undefined) {
        newData[questionId] = entry;
        return;
      }

      Object.keys(entry).forEach((suspectId) => {
        if (newData[questionId][suspectId] === undefined) {
          newData[questionId][suspectId] = entry[suspectId];
        } else {
          newData[questionId][suspectId].push(...entry[suspectId]);
        }
      });
    });

    return newData;
  }, [tdrQuery.data, firestoreQuery.data, modifiedEntries]);

  const isDirty = !isEmpty(modifiedEntries);
  const addEntryToUpdate = (id: string, item: TestimonyAnswers) => {
    setModifiedEntries((prev) => ({ ...prev, [id]: item }));
  };

  const save = () => {
    // Serialize the modified entries before saving
    console.log(modifiedEntries);
    // mutation.mutate(modifiedEntries);
  };

  return {
    isLoading:
      tdrQuery.isLoading || firestoreQuery.isLoading || questionsQuery.isLoading || suspectsQuery.isLoading,
    isSuccess:
      tdrQuery.isSuccess && firestoreQuery.isSuccess && questionsQuery.isSuccess && suspectsQuery.isSuccess,
    error: tdrQuery.error || firestoreQuery.error,
    data: mergedData,
    questions: questionsQuery.data,
    suspects: suspectsQuery.data,
    hasNewData: !isEmpty(firestoreQuery.data),
    isSaving: mutation.isPending,
    save,
    addEntryToUpdate,
    isDirty,
    entriesToUpdate: modifiedEntries,
  };
}
