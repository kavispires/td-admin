import { App } from 'antd';
import { useItemsAttribution } from 'hooks/useItemsAttribution';
import { isEmpty, orderBy, random } from 'lodash';
import { ReactNode, useContext, createContext, useMemo, useState } from 'react';
import { Item, ItemAtributesValues, ItemAttribute } from 'types';
import { getNewItem, getNewItemAttributeValues, sortJsonKeys } from 'utils';

export type ItemsAttributeValuesContextType = {
  getItem: (itemId: string) => Item;
  getItemAttributeValues: (itemId: string) => ItemAtributesValues;
  isLoading: boolean;
  error: ResponseError;
  hasResponseData: boolean;
  isDirty: boolean;
  itemAttributeValues: ItemAtributesValues;
  prepareItemsAttributesFileForDownload: () => Dictionary<ItemAtributesValues>;
  jumpToItem: (direction: string, itemId?: string) => void;
  activeItem: Item;
  onAttributeChange: (attributeId: string, value: number) => void;
  isSaving: boolean;
  save: () => void;
  attributesList: ItemAttribute[];
  availableItemIds: string[];
  addAttributesToUpdate: (itemId: string, attributes: ItemAtributesValues) => void;
  addMultipleAttributesToUpdate: (itemsArr: ItemAtributesValues[]) => void;
  attributes: Dictionary<ItemAttribute>;
  attributesToUpdate: Dictionary<ItemAtributesValues>;
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
  } = useItemsAttribution();
  const { message } = App.useApp();

  const [itemIndex, setItemIndex] = useState(random(0, availableItemIds.length - 1));
  const activeItem = getItem(availableItemIds[itemIndex]);
  const itemAttributeValues = getItemAttributeValues(activeItem.id);

  const jumpToItem = (direction: string, itemId?: string) => {
    if (direction === 'next') {
      setItemIndex((prev) => (prev + 1) % availableItemIds.length);
    }
    if (direction === 'previous') {
      setItemIndex((prev) => (prev - 1 + availableItemIds.length) % availableItemIds.length);
    }
    if (direction === 'random') {
      setItemIndex(random(0, availableItemIds.length - 1));
    }

    if (direction === 'first') {
      setItemIndex(0);
    }
    if (direction === 'last') {
      setItemIndex(availableItemIds.length - 1);
    }
    if (direction === 'next10') {
      setItemIndex((prev) => (prev + 10) % availableItemIds.length);
    }
    if (direction === 'previous10') {
      setItemIndex((prev) => (prev - 10 + availableItemIds.length) % availableItemIds.length);
    }

    if (direction === 'goTo' && itemId !== undefined) {
      const index = availableItemIds.indexOf(itemId);
      if (index !== -1) {
        setItemIndex(index);
      } else {
        message.error(`Item ${itemId} is not available for attribution.`);
      }
    }
  };

  const attributesList = useMemo(() => orderBy(Object.values(attributes), 'name.en', 'asc'), [attributes]);

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
      availableItemIds.reduce((acc: Dictionary<ItemAtributesValues>, itemId) => {
        // Get items and only the ones with attributes
        const item = getItemAttributeValues(itemId);

        if (isEmpty(item.attributes)) {
          return acc;
        }

        // Assess item completion
        if (Object.keys(item.attributes).length === attributesList.length) {
          item.complete = true;
        } else {
          delete item.complete;
        }

        acc[item.id] = item;

        return acc;
      }, {})
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
      }}
    >
      {children}
    </ItemsAttributeValuesContext.Provider>
  );
};

export const useItemsAttributeValuesContext = () => useContext(ItemsAttributeValuesContext);
