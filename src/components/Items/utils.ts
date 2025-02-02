import { cloneDeep, memoize, merge, orderBy } from 'lodash';
import type { Item, ItemAttributesValues, ItemAttribute } from 'types';
import { ATTRIBUTE_VALUE, ATTRIBUTE_VALUE_PREFIX } from 'utils/constants';

/**
 * Creates a new item with default values and merges it with the provided partial item.
 *
 * @param partialItem - The partial item to merge with the default values.
 * @returns The new item with merged values.
 */
export const getNewItem = (partialItem: Partial<Item> = {}): Item => {
  return cloneDeep(
    merge(
      {
        id: '',
        name: { en: '', pt: '' },
        groups: [],
        attributes: {},
      },
      partialItem,
    ),
  );
};

/**
 * Creates a new `ItemAttributesValues` object by merging the provided `partialItemAttributeValues`
 * with a default object that has an empty `id` and an empty `attributes` object.
 *
 * @param partialItemAttributeValues - The partial item attribute values to merge.
 * @returns The new `ItemAttributesValues` object.
 */
export const getNewItemAttributeValues = (
  partialItemAttributeValues: Partial<ItemAttributesValues> = {},
): ItemAttributesValues => {
  return cloneDeep(
    merge(
      {
        id: '',
        attributes: {},
      },
      partialItemAttributeValues,
    ),
  );
};

export const getItemAttributePriorityResponse = (
  itemAttributesValues: ItemAttributesValues,
  itemAttributes: Dictionary<ItemAttribute>,
  /**
   * Ignore attributes that are UNRELATED or UNCLEAR
   */
  onlyRelevant?: boolean,
) => {
  const priorityOrder: string[] = orderBy(
    Object.values(itemAttributes),
    ['priority', 'id'],
    ['asc', 'asc'],
  ).map((attribute) => attribute.id);

  function sortAttributesByPriority(attributeKeys: string[], prefix: string) {
    return orderBy(attributeKeys, (key) => priorityOrder.indexOf(key), ['asc']).map(
      (key) => `${prefix}${key}`,
    );
  }

  const opposite: string[] = [];
  const deterministic: string[] = [];
  const related: string[] = [];
  const unrelated: string[] = [];
  const unclear: string[] = [];

  Object.entries(itemAttributesValues.attributes).forEach(([attributeId, value]) => {
    const attribute = itemAttributes[attributeId];
    if (!attribute) return;

    switch (value) {
      case ATTRIBUTE_VALUE.OPPOSITE:
        opposite.push(attributeId);
        break;
      case ATTRIBUTE_VALUE.DETERMINISTIC:
        deterministic.push(attributeId);
        break;
      case ATTRIBUTE_VALUE.RELATED:
        related.push(attributeId);
        break;
      case ATTRIBUTE_VALUE.UNRELATED:
        unrelated.push(attributeId);
        break;
      case ATTRIBUTE_VALUE.UNCLEAR:
        unclear.push(attributeId);
        break;
      default:
        unclear.push(attributeId);
        break;
    }
  });

  return [
    ...sortAttributesByPriority(opposite, ATTRIBUTE_VALUE_PREFIX.OPPOSITE),
    ...sortAttributesByPriority(deterministic, ATTRIBUTE_VALUE_PREFIX.DETERMINISTIC),
    ...sortAttributesByPriority(related, ATTRIBUTE_VALUE_PREFIX.RELATED),

    ...(onlyRelevant ? [] : sortAttributesByPriority(unrelated, ATTRIBUTE_VALUE_PREFIX.UNRELATED)),
    ...(onlyRelevant ? [] : sortAttributesByPriority(unclear, ATTRIBUTE_VALUE_PREFIX.UNCLEAR)),
  ];
};

export const parseAttribute = memoize((keyVariant: string) => {
  if (keyVariant.length === 3) {
    return {
      key: keyVariant,
      className: '',
      text: '',
    };
  }

  const variant = keyVariant[0];
  const key = keyVariant.slice(1, 4);

  return {
    key,
    className: {
      [ATTRIBUTE_VALUE_PREFIX.DETERMINISTIC]: 'deterministic',
      [ATTRIBUTE_VALUE_PREFIX.UNRELATED]: 'unrelated',
      [ATTRIBUTE_VALUE_PREFIX.UNCLEAR]: 'unclear',
      [ATTRIBUTE_VALUE_PREFIX.OPPOSITE]: 'opposite',
    }[variant],
    text: {
      [ATTRIBUTE_VALUE_PREFIX.DETERMINISTIC]: 'very',
      [ATTRIBUTE_VALUE_PREFIX.UNRELATED]: 'not',
      [ATTRIBUTE_VALUE_PREFIX.UNCLEAR]: 'maybe',
      [ATTRIBUTE_VALUE_PREFIX.OPPOSITE]: 'very not',
    }[variant],
  };
});

export const filterMessage = (message: string[], showUnclear: boolean, showUnrelated: boolean) => {
  return message.filter((keyVariant) => {
    if (!showUnclear && keyVariant.includes(ATTRIBUTE_VALUE_PREFIX.UNCLEAR)) {
      return false;
    }

    if (!showUnrelated && keyVariant.includes(ATTRIBUTE_VALUE_PREFIX.UNRELATED)) {
      return false;
    }

    return true;
  });
};
