import { App } from 'antd';
import { getNewItem, getNewItemAttributeValues } from 'components/Items/utils';
import { useItemsAttribution } from 'hooks/useItemsAttribution';
import { useQueryParams } from 'hooks/useQueryParams';
import { isEmpty, orderBy, random } from 'lodash';
import { createContext, type ReactNode, useContext, useMemo, useState } from 'react';
import type { Item, ItemAttribute, ItemAttributesValues } from 'types';
import { sortJsonKeys } from 'utils';

export type ItemsAttributeValuesContextType = {
  getItem: (itemId: string) => Item;
  getItemAttributeValues: (itemId: string) => ItemAttributesValues;
  isLoading: boolean;
  error: ResponseError;
  hasResponseData: boolean;
  isDirty: boolean;
  itemAttributeValues: ItemAttributesValues;
  prepareItemsAttributesFileForDownload: () => Dictionary<ItemAttributesValues>;
  jumpToItem: (direction: string, itemId?: string) => void;
  activeItem: Item;
  onAttributeChange: (attributeId: string, value: number) => void;
  isSaving: boolean;
  save: () => void;
  attributesList: ItemAttribute[];
  availableItemIds: string[];
  addAttributesToUpdate: (itemId: string, attributes: ItemAttributesValues) => void;
  addMultipleAttributesToUpdate: (itemsArr: ItemAttributesValues[]) => void;
  attributes: Dictionary<ItemAttribute>;
  attributesToUpdate: Dictionary<ItemAttributesValues>;
  hasFirestoreData: boolean;
};

const ItemsAttributeValuesContext = createContext<ItemsAttributeValuesContextType>({
  getItem: () => getNewItem(),
  getItemAttributeValues: () => getNewItemAttributeValues(),
  isLoading: true,
  error: null,
  hasResponseData: false,
  isDirty: false,
  jumpToItem: () => {},
  activeItem: getNewItem(),
  itemAttributeValues: getNewItemAttributeValues(),
  onAttributeChange: () => {},
  isSaving: false,
  save: () => {},
  attributesList: [],
  availableItemIds: [],
  addAttributesToUpdate: () => {},
  addMultipleAttributesToUpdate: () => {},
  prepareItemsAttributesFileForDownload: () => ({}),
  attributes: {},
  attributesToUpdate: {},
  hasFirestoreData: false,
});

type ItemsAttributeValuesProviderProps = {
  children: ReactNode;
};

export const ItemsAttributeValuesProvider = ({ children }: ItemsAttributeValuesProviderProps) => {
  const {
    getItem,
    getItemAttributeValues,
    availableItemIds,
    isLoading,
    error,
    isSaving,
    save,
    addAttributesToUpdate,
    isDirty,
    attributes,
    addMultipleAttributesToUpdate,
    attributesToUpdate,
    hasFirestoreData,
  } = useItemsAttribution();
  const { message } = App.useApp();

  const attributesList = useMemo(() => orderBy(Object.values(attributes), 'name.en', 'asc'), [attributes]);

  const { queryParams } = useQueryParams();
  const sortBy = queryParams.get('sortBy');

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const sortedAvailableItemsIds = useMemo(() => {
    if (sortBy === 'id') {
      return orderBy(availableItemIds, (id) => Number(id), 'asc');
    }

    if (sortBy === 'updatedAt') {
      return orderBy(availableItemIds, (id) => getItemAttributeValues(id).updatedAt, 'desc');
    }

    if (sortBy === 'fewestAttributesLeft') {
      return orderBy(
        availableItemIds,
        (id) => {
          const left = attributesList.length - Object.keys(getItemAttributeValues(id).attributes).length;
          if (left === 0) {
            return Number.POSITIVE_INFINITY;
          }
          return left;
        },
        'asc',
      );
    }

    return availableItemIds;
  }, [availableItemIds, sortBy]);

  const [itemIndex, setItemIndex] = useState(random(0, sortedAvailableItemsIds.length - 1));
  const activeItem = getItem(sortedAvailableItemsIds[itemIndex]);
  const itemAttributeValues = getItemAttributeValues(activeItem.id);

  const jumpToItem = (direction: string, itemId?: string) => {
    if (direction === 'next') {
      setItemIndex((prev) => (prev + 1) % sortedAvailableItemsIds.length);
      return;
    }
    if (direction === 'previous') {
      setItemIndex((prev) => (prev - 1 + sortedAvailableItemsIds.length) % sortedAvailableItemsIds.length);
      return;
    }
    if (direction === 'random') {
      setItemIndex(random(0, sortedAvailableItemsIds.length - 1));
      return;
    }

    if (direction === 'first') {
      setItemIndex(0);
      return;
    }
    if (direction === 'last') {
      setItemIndex(sortedAvailableItemsIds.length - 1);
      return;
    }
    if (direction === 'next10') {
      setItemIndex((prev) => (prev + 10) % sortedAvailableItemsIds.length);
      return;
    }
    if (direction === 'previous10') {
      setItemIndex((prev) => (prev - 10 + sortedAvailableItemsIds.length) % sortedAvailableItemsIds.length);
      return;
    }

    if (direction === 'incomplete') {
      setItemIndex((prev) => {
        let index = prev + 1;
        while (index < sortedAvailableItemsIds.length) {
          const item = getItemAttributeValues(sortedAvailableItemsIds[index]);
          if (Object.keys(item.attributes).length !== attributesList.length) {
            // TODO: Account for filtered attributes in qp
            return index;
          }
          if (index === sortedAvailableItemsIds.length - 1) {
            message.info('No more incomplete items found.');
            return prev;
          }
          index++;
        }
        return prev;
      });
      return;
    }

    if (direction === 'goTo' && itemId !== undefined) {
      const index = sortedAvailableItemsIds.indexOf(itemId);
      if (index !== -1) {
        setItemIndex(index);
        return;
      }
      message.error(`Item ${itemId} is not available for attribution.`);
    }
  };

  const onAttributeChange = (attributeId: string, value: number) => {
    addAttributesToUpdate(activeItem.id, {
      ...itemAttributeValues,
      attributes: {
        ...itemAttributeValues.attributes,
        [attributeId]: value,
      },
    });
  };

  const prepareItemsAttributesFileForDownload = () => {
    return sortJsonKeys(
      availableItemIds.reduce((acc: Dictionary<ItemAttributesValues>, itemId) => {
        // Get items and only the ones with attributes
        const item = getItemAttributeValues(itemId);

        if (isEmpty(item.attributes)) {
          return acc;
        }

        // Assess item completion
        if (Object.keys(item.attributes).length === attributesList.length) {
          item.complete = true;
        } else {
          // biome-ignore lint/performance/noDelete: <explanation>
          delete item.complete;
        }

        acc[item.id] = item;

        return acc;
      }, {}),
    );
  };

  return (
    <ItemsAttributeValuesContext.Provider
      value={{
        getItem,
        getItemAttributeValues,
        availableItemIds,
        isLoading,
        error,
        hasResponseData: availableItemIds.length > 0 && !isEmpty(attributes),
        isDirty,
        itemAttributeValues,
        jumpToItem,
        activeItem,
        onAttributeChange,
        isSaving,
        save,
        attributes,
        attributesList,
        addAttributesToUpdate,
        addMultipleAttributesToUpdate,
        prepareItemsAttributesFileForDownload,
        attributesToUpdate,
        hasFirestoreData,
      }}
    >
      {children}
    </ItemsAttributeValuesContext.Provider>
  );
};

export const useItemsAttributeValuesContext = () => useContext(ItemsAttributeValuesContext);
