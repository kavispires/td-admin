import {
  chain,
  cloneDeep,
  isNull,
  isObject,
  isUndefined,
  memoize,
  merge,
  orderBy,
  set,
  transform,
} from 'lodash';
import stringSimilarity from 'string-similarity';
import type { Item, ItemAttributesValues, ItemAttribute } from 'types';
import { ATTRIBUTE_VALUE, ATTRIBUTE_VALUE_PREFIX, SEARCH_THRESHOLD } from './constants';

/**
 *
 * @param str
 * @returns
 */
export function stringRemoveAccents(str: string) {
  // biome-ignore lint/suspicious/noMisleadingCharacterClass: the regex is used to remove accents
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 *
 * @param data
 * @param property
 * @returns
 */
export const checkForDuplicates = (data: PlainObject, property = 'text') => {
  const unique: PlainObject = {};
  const duplicates: PlainObject = {};

  Object.values(data).forEach((entry) => {
    if (!entry[property]) {
      console.error(`Property ${property} does not exist in ${entry}`);
    }

    const entryKey = stringRemoveAccents(entry[property].toLowerCase());

    if (unique[entryKey]) {
      if (duplicates[entryKey] === undefined) {
        duplicates[entryKey] = [unique[entryKey].id];
      }
      duplicates[entryKey].push(entry.id);
    } else {
      unique[entryKey] = entry;
    }
  });

  return duplicates;
};

/**
 *
 * @param str
 * @param data
 * @param property
 * @returns
 */
export const findSimilar = (str: string, data: PlainObject, property = 'text') => {
  const similar: PlainObject = {};
  const value = stringRemoveAccents(str.trim().toLowerCase());
  if (!value || value.length < SEARCH_THRESHOLD) return {};

  Object.values(data).forEach((entry) => {
    const val = typeof entry[property] === 'string' ? entry[property] : JSON.stringify(entry[property]);
    const entryStr = stringRemoveAccents(val.toLowerCase());

    if (entryStr.includes(value) || stringSimilarity.compareTwoStrings(str, entryStr) > 0.5) {
      similar[entry.id] = val;
    }
  });

  return similar;
};

/**
 * Creates array of given length filled with indexes
 * @param length the length of the array
 * @param startAt the starting value
 * @returns
 */
export const makeArray = (length = 1, startAt = 0): number[] =>
  new Array(length).fill(0).map((e, i) => e + i + startAt);

/**
 * Remove duplicated elements from a list
 * @param arr
 * @returns
 */
export const removeDuplicates = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr));
};

/**
 * Checks if an array has any duplicate elements.
 * @param arr - The array to check for duplicates.
 * @returns A boolean indicating whether the array has duplicates.
 * @template T - The type of elements in the array.
 */
export const hasDuplicates = <T>(arr: T[]): boolean => {
  return new Set(arr).size !== arr.length;
};

/**
 * Converts a object into a downloadable file and prompts download
 * @param obj
 * @param filename
 */
export function downloadObjectAsFile(obj: PlainObject, filename: string): void {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const anchorElement = document.createElement('a');
  anchorElement.href = window.URL.createObjectURL(blob);
  anchorElement.download = filename;
  anchorElement.click();
  window.URL.revokeObjectURL(anchorElement.href);
}

/**
 * Sorts the keys of a JSON object based on a predefined order.
 * The keys 'id', 'name', 'title', and 'type' will be placed first in the sorted object,
 * followed by the remaining keys in alphabetical order.
 *
 * @param library - The JSON object to sort.
 * @returns The sorted JSON object.
 */
export const sortJsonKeys = (library: PlainObject): PlainObject => {
  function sortKeys(obj: any): any {
    if (isObject(obj) && !Array.isArray(obj)) {
      const sortedKeys = Object.keys(obj)
        .filter((key) => ['id', 'name', 'title', 'type'].includes(key))
        .concat(
          Object.keys(obj)
            .filter((key) => !['id', 'name', 'title', 'type'].includes(key))
            .sort(),
        );

      return chain(obj)
        .toPairs()
        .sortBy(([key, _]) => sortedKeys.indexOf(key))
        .map(([key, value]) => [key, sortKeys(value)])
        .fromPairs()
        .value();
    }
    return obj;
  }

  return sortKeys(library);
};

/**
 * Recursively removes `undefined` values from an object or array.
 * @template T - The type of the object to clean.
 * @param {T} obj - The object to clean.
 * @returns {T} - The cleaned object with no `undefined` values.
 */
export const deepCleanObject = <T = unknown>(obj: T): T => {
  if (!isObject(obj) || isNull(obj)) {
    return obj;
  }

  // If the object is an array, filter out undefined values
  if (Array.isArray(obj)) {
    return obj.map((item) => deepCleanObject(item)).filter((item) => !isUndefined(item)) as unknown as T;
  }

  // Recursively process each key for objects
  return transform(
    obj,
    (result, value, key) => {
      if (isObject(value)) {
        value = deepCleanObject(value);
      }

      // Only assign if the value is not undefined
      if (!isUndefined(value)) {
        set(result as Partial<T>, key, value);
      }
    },
    {} as T,
  );
};

/**
 * Deserializes the data received from Firebase into a dictionary of specified type.
 *
 * @template TData - The type of data to deserialize.
 * @param data - The data to be deserialized.
 * @returns A dictionary of deserialized data.
 */
export const deserializeFirebaseData = <TData>(data: Dictionary<string>): Dictionary<TData> => {
  return Object.keys(data).reduce((acc: Dictionary<TData>, key) => {
    acc[key] = JSON.parse(data[key]);
    return acc;
  }, {});
};

/**
 * Serializes the data in a dictionary to a dictionary of strings.
 *
 * @param data - The dictionary containing the data to be serialized.
 * @returns A new dictionary with the same keys as the input dictionary, but with the values serialized as strings.
 */
export const serializeFirebaseData = <TData>(data: Dictionary<TData>): Dictionary<string> => {
  return Object.keys(data).reduce((acc: Dictionary<string>, key) => {
    acc[key] = JSON.stringify(data[key]);
    return acc;
  }, {});
};

export const getCurrentDateTime = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

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

export const sortItemsIds = (itemsIds: string[]) => {
  return orderBy(itemsIds, (id) => Number(id));
};

/**
 * Pauses the execution for a specified duration.
 * @param duration - The duration to wait in milliseconds. Default is 1000ms.
 */
export const wait = async (duration = 1000) => {
  await new Promise((resolve) => setTimeout(resolve, duration));
};
