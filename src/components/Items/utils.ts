import { cloneDeep, keyBy, memoize, merge, orderBy, sortBy } from 'lodash';
import { alienAttributesUtils } from 'toolKits/alien-attributes';
import type { Item, ItemAttribute, ItemAttributesValues } from 'types';
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

/**
 *
 * @param itemAttributesValues
 * @param itemAttributes
 * @param onlyRelevant
 * @deprecated - i don't know what to do yet
 * @returns
 */
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

/**
 * Generates a signature string for a given AlienItem based on its attributes and their values.
 * The signature string is constructed by concatenating the prefix character for each attribute value with the attribute ID.
 * The prefix character is determined by the value of the attribute and is one of the following: ^, *, +, ~, !.
 * The attribute ID is a sequence of alphanumeric characters.
 * @param item - The AlienItem for which to generate the signature.
 * @param itemAttributes - A dictionary of all available item attributes.
 * @param options - An optional object containing additional options:
 * - `onlyRelevant`: A boolean indicating whether to include only relevant attributes in the signature.
 * - `length`: A number indicating the maximum number of attributes to include in the signature.
 **/
export function constructItemSignature(
  item: ItemAttributesValues,
  itemAttributes: Dictionary<ItemAttribute>,
  options?: {
    onlyRelevant?: boolean;
    length?: number;
  },
): string {
  // Create a list of signature entries based on the item attributes
  const signatureEntries: { prefix: string; id: string; priority: number }[] = [];

  for (const [attributeId, value] of Object.entries(item.attributes)) {
    const attribute = itemAttributes[attributeId];
    if (attribute) {
      // Find the prefix for the value from ATTRIBUTE_VALUE_DICT
      const entry = Object.values(alienAttributesUtils.ATTRIBUTE_VALUE_DICT).find(
        (dictEntry) => dictEntry.value === value,
      );

      if (entry) {
        signatureEntries.push({
          prefix: entry.prefix,
          id: attribute.id,
          priority: attribute.priority,
        });
      }
    }
  }

  const sortedEntries = sortBy(signatureEntries, [
    (o) => alienAttributesUtils.ATTRIBUTE_VALUE_PRIORITY.indexOf(o.prefix),
    (o) => {
      if (o.prefix === alienAttributesUtils.ATTRIBUTE_VALUE_DICT.UNRELATED.prefix) {
        return -1;
      }
      return o.priority;
    },
    ['asc', 'asc'],
  ]);

  // Limit the number of attributes if a length is provided
  const limitedEntries = options?.length ? sortedEntries.slice(0, options?.length) : sortedEntries;

  if (options?.onlyRelevant) {
    return limitedEntries
      .filter((entry) => {
        return [
          alienAttributesUtils.ATTRIBUTE_VALUE_DICT.UNCLEAR.prefix,
          alienAttributesUtils.ATTRIBUTE_VALUE_DICT.UNRELATED.prefix,
        ].includes(entry.prefix);
      })
      .map((entry) => `${entry.prefix}${entry.id}`)
      .join('');
  }

  // Generate the final signature string
  return limitedEntries.map((entry) => `${entry.prefix}${entry.id}`).join('');
}

const prefixDictionary = keyBy(alienAttributesUtils.ATTRIBUTE_VALUE_DICT, 'prefix');

/**
 * Constructs item attributes from a given signature string.
 *
 * The function parses the signature string to extract entries that match
 * a specific pattern (prefix followed by alphanumeric characters). It then
 * uses a dictionary to map the prefix to a value and constructs an object
 * where the keys are the extracted IDs and the values are the corresponding
 * values from the dictionary.
 *
 * @param signature - The signature string containing the attributes.
 * @returns An object representing the item attributes.
 */
export function constructItemAttributes(signature: string): ItemAttributesValues['attributes'] {
  const entries = signature.match(/[\^*+~!][a-zA-Z0-9]+/g) ?? [];
  return entries.reduce((acc: ItemAttributesValues['attributes'], entry) => {
    const prefix = entry[0];
    const id = entry.slice(1);
    const value = prefixDictionary[prefix].value;
    acc[id] = value;
    return acc;
  }, {});
}

export function calculateItemScore(itemAttributesValues: ItemAttributesValues): number {
  return Object.values(itemAttributesValues.attributes).reduce((acc: number, value) => {
    if (value <= 0) {
      if (value === alienAttributesUtils.ATTRIBUTE_VALUE_DICT.OPPOSITE.value) {
        acc += value / 2;
      }
      return acc;
    }

    return acc + value;
  }, 0);
}

export function calculateItemReliability(
  itemAttributesValues: ItemAttributesValues,
  totalAttributes: number,
): number {
  const unclearCount = Object.values(itemAttributesValues.attributes).filter(
    (value) => value === alienAttributesUtils.ATTRIBUTE_VALUE_DICT.UNCLEAR.value,
  ).length;
  return Math.floor(((totalAttributes - unclearCount) / totalAttributes) * 100);
}
