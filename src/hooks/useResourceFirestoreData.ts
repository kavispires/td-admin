import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { cloneDeep, isEmpty } from 'lodash';
import { useMemo, useState } from 'react';
import { deserializeFirestoreData, serializeFirestoreData } from 'utils';
import { useGetFirestoreDoc } from './useGetFirestoreDoc';
import { useTDResource } from './useTDResource';
import { useUpdateFirestoreDoc } from './useUpdateFirestoreDoc';

export type UseResourceFirestoreDataProps<TDRData, TDRSerializedData = TDRData> = {
  tdrResourceName: string;
  firestoreDataCollectionName: string;
  serialize?: boolean;
  deserializer?: (data: Dictionary<TDRSerializedData>) => Dictionary<TDRData>;
};

export type UseResourceFirestoreDataReturnType<TDRData> = {
  data: Dictionary<TDRData>;
  isLoading: boolean;
  isSuccess: boolean;
  error: ResponseError;
  firestoreData: Dictionary<TDRData> | undefined;
  hasFirestoreData: boolean;
  isSaving: boolean;
  save: () => void;
  addEntryToUpdate: (id: string, item: TDRData) => void;
  entriesToUpdate: Dictionary<TDRData>;
  isDirty: boolean;
};

/**
 * Custom hook that fetches and manages data from both TDR (The Daily Refactor) and Firestore.
 * It merges the data from both sources and provides functions to update and save the data.
 *
 * @template TDRData - The deserialized/final type of data from TDR (after deserializer runs).
 * @template TFirestoreData - The type of data fetched from Firestore.
 * @template TDRSerializedData - The raw serialized type from TDR before deserialization (defaults to TDRData if no deserializer).
 *
 * The hook return object containing the merged data, loading state, error, and functions to update and save the data.
 */
export function useResourceFirestoreData<
  TDRData = PlainObject,
  TDRSerializedData = TDRData,
  TFirestoreData = TDRData,
>({
  tdrResourceName,
  firestoreDataCollectionName,
  serialize,
  deserializer,
}: UseResourceFirestoreDataProps<TDRData, TDRSerializedData>): UseResourceFirestoreDataReturnType<TDRData> {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const tdrQuery = useTDResource<TDRData, TDRSerializedData>(tdrResourceName, {
    select: deserializer ? deserializer : undefined,
  });
  const firestoreQuery = useGetFirestoreDoc<Dictionary<TFirestoreData>, Dictionary<TDRData>>(
    'tdr',
    firestoreDataCollectionName,
    {
      select: serialize ? deserializeFirestoreData : undefined,
    },
  );

  // Keeps track of items that have been modified
  const [modifiedEntries, setModifiedEntries] = useState<Dictionary<TDRData>>({});

  const mutation = useUpdateFirestoreDoc('tdr', firestoreDataCollectionName, {
    onSuccess: () => {
      notification.success({
        title: `${firestoreDataCollectionName} updated`,
      });
      queryClient.refetchQueries({
        queryKey: ['firestore', 'tdr', firestoreDataCollectionName],
      });
      setModifiedEntries({});
    },
    onError: (error) => {
      notification.error({
        title: `${firestoreDataCollectionName} update failed`,
        description: error.message,
      });
    },
  });

  const data = useMemo(() => {
    if (!tdrQuery.isSuccess || !firestoreQuery.isSuccess || mutation.isPending) return {};

    console.log(`%cMerging ${tdrResourceName}+${firestoreDataCollectionName} data...`, 'color: #f0f');
    return cloneDeep({
      ...(tdrQuery.data ?? {}),
      ...(firestoreQuery.data ?? {}),
      ...modifiedEntries,
    });
  }, [
    tdrResourceName,
    firestoreDataCollectionName,
    tdrQuery.data,
    firestoreQuery.data,
    tdrQuery.isSuccess,
    firestoreQuery.isSuccess,
    mutation.isPending,
    modifiedEntries,
  ]);

  const isDirty = !isEmpty(modifiedEntries);
  const addEntryToUpdate = (id: string, item: TDRData) => {
    setModifiedEntries((prev) => ({ ...prev, [id]: item }));
  };

  const firestoreData = firestoreQuery.data;

  const save = () => {
    mutation.mutate(serialize ? serializeFirestoreData(modifiedEntries) : modifiedEntries);
  };

  return {
    data,
    isLoading: tdrQuery.isLoading || firestoreQuery.isLoading,
    isSuccess: tdrQuery.isSuccess && firestoreQuery.isSuccess,
    error: tdrQuery.error || firestoreQuery.error,
    firestoreData,
    hasFirestoreData: !isEmpty(firestoreData),
    isSaving: mutation.isPending,
    save,
    addEntryToUpdate,
    entriesToUpdate: modifiedEntries,
    isDirty,
  };
}
