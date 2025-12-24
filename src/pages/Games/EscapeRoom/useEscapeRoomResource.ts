import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import type {
  EscapeRoomCardType,
  EscapeRoomDatabase,
  EscapeRoomSet,
} from 'components/EscapeRoom/cards/escape-room-types';
import { useGetFirestoreDoc } from 'hooks/useGetFirestoreDoc';
import { useTDResourceNonCollection } from 'hooks/useTDResource';
import { useUpdateFirestoreDoc } from 'hooks/useUpdateFirestoreDoc';
import { cloneDeep, isEmpty, keyBy, merge, orderBy } from 'lodash';
import { useMemo, useState } from 'react';

export type UseEscapeRoomResourceReturnType = {
  isLoading: boolean;
  isSuccess: boolean;
  error: ResponseError;
  data: EscapeRoomDatabase;
  cards: EscapeRoomDatabase['cards'];
  missionSets: EscapeRoomDatabase['missionSets'];
  hasNewData: boolean;
  isSaving: boolean;
  save: () => void;
  addCardToUpdate: (id: string, entry: EscapeRoomCardType) => void;
  addMissionSetToUpdate: (id: string, entry: EscapeRoomSet) => void;
  // TODO: probably need a "add both" function
  entriesToUpdate: EscapeRoomDatabase;
  isDirty: boolean;
};

export function useEscapeRoomResource(): UseEscapeRoomResourceReturnType {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const tdrQuery = useTDResourceNonCollection<EscapeRoomDatabase>('escape-room');
  const firestoreQuery = useGetFirestoreDoc<StringifyValues<EscapeRoomDatabase>, EscapeRoomDatabase>(
    'tdr',
    'escapeRoom',
    {
      select: (data) => {
        const missionSets: EscapeRoomSet[] = data?.missionSets ? JSON.parse(data.missionSets) : [];
        const cards: Dictionary<EscapeRoomCardType> = data?.cards ? JSON.parse(data.cards) : [];

        return {
          missionSets,
          cards,
        };
      },
    },
  );

  // Keeps track of items that have been modified
  const [modifiedEntries, setModifiedEntries] = useState<EscapeRoomDatabase>({
    cards: {},
    missionSets: [],
  });

  const mutation = useUpdateFirestoreDoc('tdr', 'escapeRoom', {
    onSuccess: () => {
      notification.success({
        title: 'tdr/escapeRoom updated',
      });
      queryClient.refetchQueries({
        queryKey: ['firestore', 'tdr', 'escapeRoom'],
      });
      setModifiedEntries({
        cards: {},
        missionSets: [],
      });
    },
    onError: (error) => {
      notification.error({
        title: 'tdr/escapeRoom update failed',
        description: error.message,
      });
    },
  });

  const data: EscapeRoomDatabase = useMemo(() => {
    if (!tdrQuery.isSuccess || !firestoreQuery.isSuccess || mutation.isPending)
      return {
        cards: {},
        missionSets: [],
      };

    console.log('%cMerging tdr/escape-room+firestore/escapeRoom data...', 'color: #f0f');
    // Extract the actual data structures properly
    const tdrCards = tdrQuery.data?.cards ?? {};
    const firestoreCards = firestoreQuery.data?.cards ?? {};
    const tdrMissionSets = tdrQuery.data?.missionSets ?? [];
    const firestoreMissionSets = firestoreQuery.data?.missionSets ?? [];

    return {
      cards: cloneDeep({
        ...tdrCards,
        ...firestoreCards,
        ...modifiedEntries.cards,
      }),
      missionSets: cloneDeep([...tdrMissionSets, ...firestoreMissionSets, ...modifiedEntries.missionSets]),
    };
  }, [
    tdrQuery.data,
    firestoreQuery.data,
    tdrQuery.isSuccess,
    firestoreQuery.isSuccess,
    mutation.isPending,
    modifiedEntries,
  ]);

  const isDirty = !isEmpty(modifiedEntries.cards) || !isEmpty(modifiedEntries.missionSets);

  const addCardToUpdate = (id: string, entry: EscapeRoomCardType) => {
    setModifiedEntries((prev) => ({
      ...prev,
      cards: { ...prev.cards, [id]: entry },
    }));
  };

  const addMissionSetToUpdate = (id: string, entry: EscapeRoomSet) => {
    setModifiedEntries((prev) => ({
      ...prev,
      missionSets: [...prev.missionSets.filter((ms) => ms.id !== id), entry],
    }));
  };

  const firestoreData = firestoreQuery.data;

  const save = () => {
    const mergedCards = merge({}, firestoreData?.cards ?? {}, modifiedEntries.cards);
    const missionSets = keyBy(firestoreData?.missionSets ?? [], 'id');
    modifiedEntries.missionSets.forEach((ms) => {
      missionSets[ms.id] = ms;
    });
    const mergedMissionSets = orderBy(merge([], Object.values(missionSets)), ['updatedAt'], ['desc']);
    const dataToSave: StringifyValues<EscapeRoomDatabase> = {
      cards: JSON.stringify(mergedCards),
      missionSets: JSON.stringify(mergedMissionSets),
    };
    mutation.mutate(dataToSave);
  };

  return {
    data,
    cards: data.cards,
    missionSets: data.missionSets,
    isLoading: tdrQuery.isLoading || firestoreQuery.isLoading,
    isSuccess: tdrQuery.isSuccess && firestoreQuery.isSuccess,
    error: tdrQuery.error || firestoreQuery.error,
    hasNewData: !isEmpty(firestoreData?.cards) && !isEmpty(firestoreData?.missionSets),
    isSaving: mutation.isPending,
    save,
    addCardToUpdate,
    addMissionSetToUpdate,
    entriesToUpdate: modifiedEntries,
    isDirty,
  };
}
