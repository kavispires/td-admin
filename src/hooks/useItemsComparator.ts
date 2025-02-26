import { filterMessage, getItemAttributePriorityResponse } from 'components/Items/utils';
import { useItemsAttributeValuesContext } from 'context/ItemsAttributeValuesContext';
import { keyBy, orderBy } from 'lodash';
import { useMemo } from 'react';
import type { Item, ItemAttributesValues } from 'types';
import { useItemQueryParams } from './useItemQueryParams';

export type ItemMessageObject = {
  item: Item;
  itemAttributesValues: ItemAttributesValues;
  message: string[];
  fullMessage: string[];
};

export function useItemsComparator() {
  const { attributes, getItemAttributeValues, availableItemIds, getItem, isLoading } =
    useItemsAttributeValuesContext();
  const { searchParams } = useItemQueryParams();
  const showComplete = searchParams.get('showComplete') === 'true';
  const showUnclear = searchParams.get('showUnclear') === 'true';
  const showUnrelated = searchParams.get('showUnrelated') === 'true';

  const { itemMessages, itemMessagesDict, grouping } = useMemo(() => {
    if (isLoading) {
      const itemMessages: ItemMessageObject[] = [];
      return {
        itemMessages,
        itemMessagesDict: {},
        grouping: {},
      };
    }

    const itemMessages = orderBy(
      availableItemIds
        .map((id) => {
          const itemAttributesValues = getItemAttributeValues(id);
          const itemMessage = getItemAttributePriorityResponse(itemAttributesValues, attributes);
          return {
            item: getItem(id),
            itemAttributesValues,
            message: filterMessage(itemMessage, showUnclear, showUnrelated),
            fullMessage: itemMessage,
          };
        })
        .filter(({ itemAttributesValues }) => (showComplete ? itemAttributesValues.complete : true)),
      ['message'],
      ['asc'],
    );

    const grouping = itemMessages.reduce((acc: Dictionary<string[]>, { message, item: { id } }) => {
      const key = message.join(' ');

      if (acc[key] === undefined) {
        acc[key] = [];
      }
      acc[key].push(id);

      return acc;
    }, {});

    const moreThanOne = Object.values(grouping).filter((ids) => ids.length > 1);
    if (moreThanOne.length > 0) {
      console.log('More than one', moreThanOne);
    }

    return {
      itemMessages,
      itemMessagesDict: keyBy(itemMessages, 'item.id'),
      grouping,
    };
  }, [
    attributes,
    availableItemIds,
    getItemAttributeValues,
    getItem,
    isLoading,
    showComplete,
    showUnclear,
    showUnrelated,
  ]);

  return {
    itemMessages,
    itemMessagesDict,
    grouping,
  };
}
