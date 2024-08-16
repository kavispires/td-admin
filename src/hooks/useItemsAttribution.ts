import { App } from 'antd';
import { isEmpty, mapKeys, merge, orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import { Item, ItemAtributesValues, ItemAttribute } from 'types';
import { deserializeFirebaseData, getNewItem, getNewItemAttributeValues, serializeFirebaseData } from 'utils';

import { useQueryClient } from '@tanstack/react-query';

import { useGetFirebaseDoc } from './useGetFirebaseDoc';
import { useTDResource } from './useTDResource';
import { useUpdateFirebaseDoc } from './useUpdateFirebaseDoc';

/**
 * This is to avoid new items being generated and unused just for the sake of placeholders.
 */
const globalNewItemsAttributesValues: Dictionary<ItemAtributesValues> = {};

export function useItemsAttribution() {
  const { notification, message } = App.useApp();
  const queryClient = useQueryClient();

  // Gather basic item data
  const tdrItemsQuery = useTDResource<Item>('items');
  const tdrAttributesQuery = useTDResource<ItemAttribute>('items-attributes');
  const tdrItemsAttributesValuesQuery = useTDResource<ItemAtributesValues>('items-attribute-values');
  const firebaseItemsAttributeValuesQuery = useGetFirebaseDoc<
    Dictionary<string>,
    Dictionary<ItemAtributesValues>
  >('tdr', 'itemsAttributeValues', {
    select: deserializeFirebaseData,
  });

  const [modifiedAttributeValues, setModifiedAttributeValues] = useState<Dictionary<ItemAtributesValues>>({});

  const mutation = useUpdateFirebaseDoc('tdr', 'itemsAttributeValues', {
    onSuccess: () => {
      notification.success({
        message: 'itemsAttributeValues updated',
      });
      queryClient.refetchQueries({
        queryKey: ['firebase', 'tdr', 'itemsAttributeValues'],
      });
      setModifiedAttributeValues({});
    },
    onError: (error) => {
      notification.error({
        message: 'itemsAttributeValues update failed',
        description: error.message,
      });
    },
  });

  const savedItemsAttributeValues = useMemo(() => {
    return {
      ...(tdrItemsAttributesValuesQuery.data ?? {}),
      ...(firebaseItemsAttributeValuesQuery.data ?? {}),
    };
  }, [tdrItemsAttributesValuesQuery.data, firebaseItemsAttributeValuesQuery.data]);

  const isDirty = !isEmpty(modifiedAttributeValues);
  const addAttributesToUpdate = (id: string, item: ItemAtributesValues) => {
    setModifiedAttributeValues((prev) => ({ ...prev, [id]: { ...item, updatedAt: Date.now() } }));
  };
  const addMultipleAttributesToUpdate = (itemsArr: ItemAtributesValues[]) => {
    setModifiedAttributeValues((prev) => ({
      ...prev,
      ...mapKeys(
        itemsArr.map((item) => ({ ...item, updatedAt: Date.now() })),
        'id'
      ),
    }));
  };

  const firebaseData = firebaseItemsAttributeValuesQuery.data;

  const save = () => {
    mutation.mutate(serializeFirebaseData({ ...firebaseData, ...modifiedAttributeValues }));
  };

  // Filter items that have the alien deck only
  const availableItemIds = useMemo(() => {
    const items = tdrItemsQuery.data ?? {};
    return orderBy(
      Object.keys(items).filter((id) => {
        return (items[id]?.decks ?? []).includes('alien');
      }),
      (id) => Number(id),
      'asc'
    );
  }, [tdrItemsQuery.data]);

  const getItem = (id: string) => {
    if ((tdrItemsQuery.data ?? {})?.[id]) {
      return tdrItemsQuery.data[id];
    }
    if (id) {
      message.info(`Item ${id} not found in TDR. Creating a new item...`);
    }
    return getNewItem({ id });
  };

  const getItemAttributeValues = (id: string) => {
    const storedValue = savedItemsAttributeValues?.[id] ?? {};
    const modifiedValue = modifiedAttributeValues[id] ?? {};

    if (isEmpty(storedValue) && isEmpty(modifiedValue)) {
      globalNewItemsAttributesValues[id] = getNewItemAttributeValues({ id });
      return globalNewItemsAttributesValues[id];
    }

    return merge(globalNewItemsAttributesValues?.[id] ?? {}, storedValue, modifiedValue);
  };

  return {
    availableItemIds,
    getItem,
    getItemAttributeValues,
    attributes: tdrAttributesQuery.data ?? {},
    isLoading:
      tdrItemsQuery.isLoading ||
      tdrAttributesQuery.isLoading ||
      tdrItemsAttributesValuesQuery.isLoading ||
      firebaseItemsAttributeValuesQuery.isLoading,
    error:
      tdrItemsQuery.error ||
      tdrAttributesQuery.error ||
      tdrItemsAttributesValuesQuery.error ||
      firebaseItemsAttributeValuesQuery.error,
    firebaseData,
    isSaving: mutation.isPending,
    save,
    addAttributesToUpdate,
    addMultipleAttributesToUpdate,
    attributesToUpdate: modifiedAttributeValues,
    isDirty,
  };
}
