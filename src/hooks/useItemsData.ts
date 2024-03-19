import { isEmpty, merge } from 'lodash';
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
  const tdrItemsQuery = useTDResource<Dictionary<Item>>('items');
  const firebaseItemsQuery = useGetFirebaseDoc<Dictionary<Item>>('data', 'items');

  const items = useMemo(() => {
    if (tdrItemsQuery.isLoading || firebaseItemsQuery.isLoading) return {};
    console.log('%cMerging items data...', 'color: #f0f');
    return merge(tdrItemsQuery.data ?? {}, firebaseItemsQuery.data ?? {});
  }, [tdrItemsQuery.data, firebaseItemsQuery.data, tdrItemsQuery.isLoading, firebaseItemsQuery.isLoading]);

  const [modifiedItems, setModifiedItems] = useState<Dictionary<Item>>({});
  const isDirty = !isEmpty(modifiedItems);
  const addItemToUpdate = (id: string, item: Item) => {
    setModifiedItems((prev) => ({ ...prev, [id]: item }));
  };

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
