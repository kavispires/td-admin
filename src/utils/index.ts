import { chain, cloneDeep, isObject, merge } from 'lodash';
import { SEARCH_THRESHOLD } from './constants';
import stringSimilarity from 'string-similarity';
import { Item, ItemAtributesValues } from 'types';

/**
 *
 * @param str
 * @returns
 */
export function stringRemoveAccents(str: string) {
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

export const findBestMatch = (str: string, list: string[]) => {};

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
            .sort()
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
      partialItem
    )
  );
};

/**
 * Creates a new `ItemAtributesValues` object by merging the provided `partialItemAttributeValues`
 * with a default object that has an empty `id` and an empty `attributes` object.
 *
 * @param partialItemAttributeValues - The partial item attribute values to merge.
 * @returns The new `ItemAtributesValues` object.
 */
export const getNewItemAttributeValues = (
  partialItemAttributeValues: Partial<ItemAtributesValues> = {}
): ItemAtributesValues => {
  return cloneDeep(
    merge(
      {
        id: '',
        attributes: {},
      },
      partialItemAttributeValues
    )
  );
};
