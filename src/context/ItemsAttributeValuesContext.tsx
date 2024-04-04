import { useItemsAttribution } from 'hooks/useItemsAttribution';
import { isEmpty, orderBy, random } from 'lodash';
import { ReactNode, useContext, createContext, useMemo, useState } from 'react';
import { Item, ItemAtributesValues, ItemAttributes } from 'types';

export type ItemsAttributeValuesContextType = {
  items: Dictionary<Item>;
  isLoading: boolean;
  error: ResponseError;
  hasResponseData: boolean;
  isDirty: boolean;
  itemAttributeValues: ItemAtributesValues;
  itemsAttributeValues: Dictionary<ItemAtributesValues>;
  jumpToItem: (direction: string) => void;
  activeItem: Item;
  onAttributeChange: (attributeId: string, value: number) => void;
  isSaving: boolean;
  save: () => void;
  attributesList: ItemAttributes[];
  availableItemIds: string[];
};

const ItemsAttributeValuesContext = createContext<ItemsAttributeValuesContextType>({
  items: {},
  isLoading: true,
  error: null,
  hasResponseData: false,
  isDirty: false,
  jumpToItem: () => {},
  activeItem: {
    id: '-1',
    name: {
      en: '',
      pt: '',
    },
    groups: [],
  },
  itemAttributeValues: {
    id: '-1',
    attributes: {},
  },
  itemsAttributeValues: {},
  onAttributeChange: () => {},
  isSaving: false,
  save: () => {},
  attributesList: [],
  availableItemIds: [],
});

type ItemsAttributeValuesProviderProps = {
  children: ReactNode;
};

export const ItemsAttributeValuesProvider = ({ children }: ItemsAttributeValuesProviderProps) => {
  const {
    items,
    isLoading,
    error,
    isSaving,
    save,
    addAttributesToUpdate,
    isDirty,
    attributes,
    itemsAttributeValues,
  } = useItemsAttribution();

  // Filter items that have the alien group only
  const availableItemIds = useMemo(() => {
    return orderBy(
      Object.keys(items).filter((id) => {
        return (items[id]?.groups ?? []).includes('alien');
      }),
      (id) => Number(id),
      'asc'
    );
  }, [items]);

  const [itemIndex, setItemIndex] = useState(random(0, availableItemIds.length - 1));
  const activeItem = items[availableItemIds[itemIndex]];
  const itemAttributeValues = itemsAttributeValues[activeItem?.id] ?? { id: activeItem?.id, attributes: {} };

  const jumpToItem = (direction: string) => {
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

  return (
    <ItemsAttributeValuesContext.Provider
      value={{
        items,
        availableItemIds,
        isLoading,
        error,
        hasResponseData: availableItemIds.length > 0 && !isEmpty(attributes),
        isDirty,
        itemAttributeValues,
        itemsAttributeValues,
        jumpToItem,
        activeItem,
        onAttributeChange,
        isSaving,
        save,
        attributesList,
      }}
    >
      {children}
    </ItemsAttributeValuesContext.Provider>
  );
};

export const useItemsAttributeValuesContext = () => useContext(ItemsAttributeValuesContext);
