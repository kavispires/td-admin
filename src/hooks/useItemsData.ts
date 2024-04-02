import { cloneDeep, isEmpty } from 'lodash';
import { useMemo, useState } from 'react';
import { Item } from 'types';

import { useGetFirebaseDoc } from './useGetFirebaseDoc';
import { useTDResource } from './useTDResource';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateFirebaseDoc } from './useUpdateFirebaseDoc';
import { App } from 'antd';

export function useItemsData() {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  // Gather basic item data
  const tdrItemsQuery = useTDResource<Item>('items');
  const firebaseItemsQuery = useGetFirebaseDoc<Dictionary<Item>>('data', 'items');

  // Keeps track of items that have been modified
  const [modifiedItems, setModifiedItems] = useState<Dictionary<Item>>({});

  const mutation = useUpdateFirebaseDoc('data', 'items', {
    onSuccess: () => {
      notification.success({
        message: 'Item updated',
      });
      queryClient.refetchQueries(['firebase', 'data', 'items']);
      setModifiedItems({});
    },
    onError: (error) => {
      notification.error({
        message: 'Item update failed',
        description: error.message,
      });
    },
  });

  const items = useMemo(() => {
    if (tdrItemsQuery.isLoading || firebaseItemsQuery.isLoading || mutation.isLoading) return {};
    console.log('%cMerging items data...', 'color: #f0f');
    return cloneDeep({ ...(tdrItemsQuery.data ?? {}), ...(firebaseItemsQuery.data ?? {}), ...modifiedItems });
  }, [
    tdrItemsQuery.data,
    firebaseItemsQuery.data,
    tdrItemsQuery.isLoading,
    firebaseItemsQuery.isLoading,
    mutation.isLoading,
    modifiedItems,
  ]);

  const isDirty = !isEmpty(modifiedItems);
  const addItemToUpdate = (id: string, item: Item) => {
    setModifiedItems((prev) => ({ ...prev, [id]: item }));
  };

  const firebaseData = firebaseItemsQuery.data;

  const save = () => {
    mutation.mutate({ ...firebaseData, ...modifiedItems });
  };

  return {
    items,
    isLoading: tdrItemsQuery.isLoading || firebaseItemsQuery.isLoading,
    error: tdrItemsQuery.error || firebaseItemsQuery.error,
    firebaseData,
    isSaving: mutation.isLoading,
    save,
    addItemToUpdate,
    itemsToUpdate: modifiedItems,
    isDirty,
  };
}
