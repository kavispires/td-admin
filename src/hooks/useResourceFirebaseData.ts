import { App } from 'antd';
import { cloneDeep, isEmpty } from 'lodash';
import { useMemo, useState } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useGetFirebaseDoc } from './useGetFirebaseDoc';
import { useTDResource } from './useTDResource';
import { useUpdateFirebaseDoc } from './useUpdateFirebaseDoc';
import { deserializeFirebaseData, serializeFirebaseData } from 'utils';

export type UseResourceFirebaseDataProps = {
  tdrResourceName: string;
  firebaseDataCollectionName: string;
  serialize?: boolean;
};

export type UseResourceFirebaseDataReturnType<TDRData> = {
  data: Dictionary<TDRData>;
  isLoading: boolean;
  error: ResponseError;
  firebaseData: Dictionary<TDRData> | undefined;
  isSaving: boolean;
  save: () => void;
  addEntryToUpdate: (id: string, item: TDRData) => void;
  entriesToUpdate: Dictionary<TDRData>;
  isDirty: boolean;
};

/**
 * Custom hook that fetches and manages data from both TDR (The Daily Refactor) and Firebase.
 * It merges the data from both sources and provides functions to update and save the data.
 *
 * @template TDRData - The type of data fetched from TDR.
 * @template TFirebaseData - The type of data fetched from Firebase.
 *
 * The hook return object containing the merged data, loading state, error, and functions to update and save the data.
 */
export function useResourceFirebaseData<TDRData = PlainObject, TFirebaseData = TDRData>({
  tdrResourceName,
  firebaseDataCollectionName,
  serialize,
}: UseResourceFirebaseDataProps): UseResourceFirebaseDataReturnType<TDRData> {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const tdrQuery = useTDResource<TDRData>(tdrResourceName);
  const firebaseQuery = useGetFirebaseDoc<Dictionary<TFirebaseData>, Dictionary<TDRData>>(
    'tdr',
    firebaseDataCollectionName,
    {
      select: serialize ? deserializeFirebaseData : undefined,
    }
  );

  // Keeps track of items that have been modified
  const [modifiedEntries, setModifiedEntries] = useState<Dictionary<TDRData>>({});

  const mutation = useUpdateFirebaseDoc('tdr', firebaseDataCollectionName, {
    onSuccess: () => {
      notification.success({
        message: `${firebaseDataCollectionName} updated`,
      });
      queryClient.refetchQueries({
        queryKey: ['firebase', 'tdr', firebaseDataCollectionName],
      });
      setModifiedEntries({});
    },
    onError: (error) => {
      notification.error({
        message: `${firebaseDataCollectionName} update failed`,
        description: error.message,
      });
    },
  });

  const data = useMemo(() => {
    if (!tdrQuery.isSuccess || !firebaseQuery.isSuccess || mutation.isPending) return {};

    console.log(`%cMerging ${tdrResourceName}+${firebaseDataCollectionName} data...`, 'color: #f0f');
    return cloneDeep({
      ...(tdrQuery.data ?? {}),
      ...(firebaseQuery.data ?? {}),
      ...modifiedEntries,
    });
  }, [
    tdrResourceName,
    firebaseDataCollectionName,
    tdrQuery.data,
    firebaseQuery.data,
    tdrQuery.isSuccess,
    firebaseQuery.isSuccess,
    mutation.isPending,
    modifiedEntries,
  ]);

  const isDirty = !isEmpty(modifiedEntries);
  const addEntryToUpdate = (id: string, item: TDRData) => {
    setModifiedEntries((prev) => ({ ...prev, [id]: item }));
  };

  const firebaseData = firebaseQuery.data;

  const save = () => {
    mutation.mutate(serialize ? serializeFirebaseData(modifiedEntries) : modifiedEntries);
  };

  return {
    data,
    isLoading: tdrQuery.isLoading || firebaseQuery.isLoading,
    error: tdrQuery.error || firebaseQuery.error,
    firebaseData,
    isSaving: mutation.isPending,
    save,
    addEntryToUpdate,
    entriesToUpdate: modifiedEntries,
    isDirty,
  };
}
