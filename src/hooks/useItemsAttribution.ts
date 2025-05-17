import { useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import {
  calculateItemReliability,
  calculateItemScore,
  constructItemAttributes,
  constructItemSignature,
  getNewItem,
  getNewItemAttributeValues,
} from 'components/Items/utils';
import { isEmpty, mapKeys, merge, orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import type { Item, ItemAttribute, ItemAttributesValues, ItemAttributesValuesFirestore } from 'types';
import { deserializeFirestoreData, serializeFirestoreData } from 'utils';
import { useGetFirestoreDoc } from './useGetFirestoreDoc';
import { useTDResource } from './useTDResource';
import { useUpdateFirestoreDoc } from './useUpdateFirestoreDoc';

/**
 * This is to avoid new items being generated and unused just for the sake of placeholders.
 */
const globalNewItemsAttributesValues: Dictionary<ItemAttributesValues> = {};

export function useItemsAttribution() {
  const { notification, message } = App.useApp();
  const queryClient = useQueryClient();

  // Gather basic item data
  const tdrItemsQuery = useTDResource<Item>('items');
  const tdrAttributesQuery = useTDResource<ItemAttribute>('items-attributes');
  const tdrItemsAttributesValuesQuery = useTDResource<ItemAttributesValues>('items-attribute-values');
  const firestoreItemsAttributeValuesQuery = useGetFirestoreDoc<
    Dictionary<string>,
    Dictionary<ItemAttributesValues>
  >('tdr', 'itemsAttributeValues', {
    select: (data) =>
      deserializeItemAttributesValues({
        itemAttributesValues: data,
        itemAttributes: tdrAttributesQuery.data ?? {},
      }),
  });

  const [modifiedAttributeValues, setModifiedAttributeValues] = useState<Dictionary<ItemAttributesValues>>(
    {},
  );

  const mutation = useUpdateFirestoreDoc('tdr', 'itemsAttributeValues', {
    onSuccess: () => {
      notification.success({
        message: 'itemsAttributeValues updated',
      });
      queryClient.refetchQueries({
        queryKey: ['firestore', 'tdr', 'itemsAttributeValues'],
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
      ...(firestoreItemsAttributeValuesQuery.data ?? {}),
    };
  }, [tdrItemsAttributesValuesQuery.data, firestoreItemsAttributeValuesQuery.data]);

  const isDirty = !isEmpty(modifiedAttributeValues);
  const addAttributesToUpdate = (id: string, item: ItemAttributesValues) => {
    setModifiedAttributeValues((prev) => ({ ...prev, [id]: { ...item, updatedAt: Date.now() } }));
  };
  const addMultipleAttributesToUpdate = (itemsArr: ItemAttributesValues[]) => {
    setModifiedAttributeValues((prev) => ({
      ...prev,
      ...mapKeys(
        itemsArr.map((item) => ({ ...item, updatedAt: Date.now() })),
        'id',
      ),
    }));
  };

  const firestoreData = firestoreItemsAttributeValuesQuery.data;

  const save = () => {
    mutation.mutate(
      serializeItemAttributesValues(
        { ...firestoreData, ...modifiedAttributeValues },
        tdrAttributesQuery.data,
      ),
    );
  };

  // Filter items that have the alien deck only
  const availableItemIds = useMemo(() => {
    const items = tdrItemsQuery.data ?? {};
    return orderBy(
      Object.keys(items).filter((id) => {
        return (items[id]?.decks ?? []).includes('alien');
      }),
      (id) => Number(id),
      'asc',
    );
  }, [tdrItemsQuery.data]);

  const getItem = (id: string) => {
    if (tdrItemsQuery.data?.[id]) {
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
      firestoreItemsAttributeValuesQuery.isLoading,
    error:
      tdrItemsQuery.error ||
      tdrAttributesQuery.error ||
      tdrItemsAttributesValuesQuery.error ||
      firestoreItemsAttributeValuesQuery.error,
    firestoreData,
    hasFirestoreData: !isEmpty(firestoreItemsAttributeValuesQuery.data),
    isSaving: mutation.isPending,
    save,
    addAttributesToUpdate,
    addMultipleAttributesToUpdate,
    attributesToUpdate: modifiedAttributeValues,
    isDirty,
  };
}

const serializeItemAttributesValues = (
  itemAttributesValues: Dictionary<ItemAttributesValues>,
  itemAttributes: Dictionary<ItemAttribute>,
): Dictionary<string> => {
  const serializeEntry = (entry: ItemAttributesValues): ItemAttributesValuesFirestore => {
    return {
      id: entry.id,
      tempSignature: constructItemSignature(entry, itemAttributes),
      updatedAt: entry.updatedAt,
    };
  };

  return serializeFirestoreData<ItemAttributesValues, ItemAttributesValuesFirestore>(
    itemAttributesValues,
    serializeEntry,
  );
};

const deserializeItemAttributesValues = (data: {
  itemAttributesValues: Dictionary<string>;
  itemAttributes: Dictionary<ItemAttribute>;
}): Dictionary<ItemAttributesValues> => {
  const { itemAttributesValues, itemAttributes } = data;
  const totalAttributes = Object.keys(itemAttributes).length;

  const deserializeEntry = (entry: ItemAttributesValuesFirestore): ItemAttributesValues => {
    const attributes = constructItemAttributes(entry.tempSignature);
    const complete = Object.keys(attributes).length === totalAttributes;

    const newEntry = {
      id: entry.id,
      updatedAt: entry.updatedAt,
      attributes,
    };

    if (complete) {
      return {
        ...newEntry,
        complete,
        reliability: calculateItemReliability(newEntry, totalAttributes),
        score: calculateItemScore(newEntry),
      };
    }

    return newEntry;
  };

  return deserializeFirestoreData<ItemAttributesValuesFirestore, ItemAttributesValues>(
    itemAttributesValues,
    deserializeEntry,
  );
};
