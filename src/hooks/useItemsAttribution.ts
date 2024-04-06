import { cloneDeep, isEmpty, mapKeys } from 'lodash';
import { useMemo, useState } from 'react';
import { Item, ItemAtributesValues, ItemAttribute } from 'types';

import { useGetFirebaseDoc } from './useGetFirebaseDoc';
import { useTDResource } from './useTDResource';
import { useQueryClient } from '@tanstack/react-query';
import { useUpdateFirebaseDoc } from './useUpdateFirebaseDoc';
import { App } from 'antd';
import { getNewItem, getNewItemAttributeValues } from 'utils';

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
  >('data', 'itemsAttributeValues', {
    select: parseItemsAttributeValuesData,
  });

  const [modifiedAttributeValues, setModifiedAttributeValues] = useState<Dictionary<ItemAtributesValues>>({});

  const mutation = useUpdateFirebaseDoc('data', 'itemsAttributeValues', {
    onSuccess: () => {
      notification.success({
        message: 'itemsAttributeValues updated',
      });
      queryClient.refetchQueries(['firebase', 'data', 'itemsAttributeValues']);
      setModifiedAttributeValues({});
    },
    onError: (error) => {
      notification.error({
        message: 'itemsAttributeValues update failed',
        description: error.message,
      });
    },
  });

  const itemsAttributeValues = useMemo(() => {
    if (
      tdrItemsAttributesValuesQuery.isLoading ||
      firebaseItemsAttributeValuesQuery.isLoading ||
      mutation.isLoading
    )
      return {};
    console.log('%cMerging items-attribute-values data...', 'color: #f0f');
    return cloneDeep({
      ...(tdrItemsAttributesValuesQuery.data ?? {}),
      ...(firebaseItemsAttributeValuesQuery.data ?? {}),
      ...modifiedAttributeValues,
    });
  }, [
    tdrItemsAttributesValuesQuery.data,
    firebaseItemsAttributeValuesQuery.data,
    tdrItemsAttributesValuesQuery.isLoading,
    firebaseItemsAttributeValuesQuery.isLoading,
    mutation.isLoading,
    modifiedAttributeValues,
  ]);

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
    mutation.mutate(stringifyItemsAttributeValuesData({ ...firebaseData, ...modifiedAttributeValues }));
  };

  const getItem = (id: string) => {
    if (tdrItemsQuery.data?.[id]) {
      return tdrItemsQuery.data[id];
    }
    message.info(`Item ${id} not found in TDR. Creating a new item...`);
    getNewItem({ id });
  };

  const getItemAttributeValues = (id: string) => {
    if (itemsAttributeValues[id]) {
      return itemsAttributeValues[id];
    }
    message.info(`Item ${id} not found in itemsAttributeValues. Creating a new item attribute...`);
    return getNewItemAttributeValues({ id });
  };

  return {
    items: tdrItemsQuery.data ?? {},
    attributes: tdrAttributesQuery.data ?? {},
    itemsAttributeValues,
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
    isSaving: mutation.isLoading,
    save,
    addAttributesToUpdate,
    addMultipleAttributesToUpdate,
    attributesToUpdate: modifiedAttributeValues,
    isDirty,
  };
}

const parseItemsAttributeValuesData = (data: Dictionary<string>) => {
  return Object.keys(data).reduce((acc: Dictionary<ItemAtributesValues>, key) => {
    acc[key] = JSON.parse(data[key]);
    return acc;
  }, {});
};

const stringifyItemsAttributeValuesData = (data: Dictionary<ItemAtributesValues>) => {
  return Object.keys(data).reduce((acc: Dictionary<string>, key) => {
    acc[key] = JSON.stringify(data[key]);
    return acc;
  }, {});
};
