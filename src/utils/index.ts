import { chain, isNull, isObject, isUndefined, orderBy, set, transform } from 'lodash';
import stringSimilarity from 'string-similarity';
import { SEARCH_THRESHOLD } from './constants';

/**
 * Generates a unique identifier that does not exist in the provided list of existing IDs.
 * The generated ID is a substring of a UUID, limited to 5 characters.
 * If a unique ID cannot be generated within 500 attempts, an error is logged.
 *
 * @param existingIds - An array of existing IDs to check against.
 * @param [length=5] - The length of the generated ID. Defaults to 5.
 * @returns A unique identifier.
 */
export function createUUID(existingIds: string[], length = 5): string {
  let newId = crypto.randomUUID().substring(0, length);
  let tries = 0;
  while (existingIds.includes(newId) && tries < 500) {
    newId = crypto.randomUUID().substring(0, length);
    tries++;
  }
  if (tries > 500) {
    console.error('Unable to generate unique id');
  }
  return newId;
}

/**
 * Creates a unique identifier with an incremental numerical value based on existing IDs.
 *
 * @param existingIds - An array of existing IDs to evaluate for determining the next incremental value. Usually Object.keys(data).
 * @param prefix - A string to prepend to the ID.
 * @param suffix - A string to append to the ID. Default is an empty string.
 * @param delimiter - A string to separate the prefix, incremental value, and suffix. Default is '-'.
 * @param paddingThreshold - The minimum number of digits in the incremental value. Values with fewer digits will be padded with zeros. Default is 2.
 * @returns A unique string ID in the format `prefix{delimiter}incrementalValue{delimiter}suffix`.
 *
 * @example
 * returns 'user-03-'
 * createIncrementalUID(['user-01-', 'user-02-'], 'user', '', '-', 2);
 *
 * @example
 * returns 'item-004-xyz'
 * createIncrementalUID(['item-001-xyz', 'item-003-xyz'], 'item', 'xyz', '-', 3);
 */
export function createIncrementalUID(
  existingIds: string[],
  prefix: string,
  suffix = '',
  delimiter = '-',
  paddingThreshold = 1,
): string {
  let lastId = 0;

  existingIds.forEach((id) => {
    const match = id.match(/(\d+)/);
    if (match) {
      const num = Number.parseInt(match[0], 10);
      if (num > lastId) {
        lastId = num;
      }
    }
  });

  lastId++;

  const paddedId = lastId.toString().padStart(paddingThreshold, '0');
  return `${prefix}${delimiter}${paddedId}${delimiter}${suffix}`;
}

/**
 * Removes accents from a given string.
 *
 * This function normalizes the input string to its decomposed form (NFD)
 * and then removes any combining diacritical marks (accents).
 *
 * @param str - The input string from which to remove accents.
 * @returns The input string with accents removed.
 */
export function stringRemoveAccents(str: string) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Checks for duplicate entries in the provided data based on a specified property.
 *
 * @param data - The data to check for duplicates.
 * @param [property='text'] - The property to check for duplicates. Defaults to 'text'.
 * @returns An object containing the duplicates found. The keys are the normalized property values, and the values are arrays of IDs of the duplicate entries.
 *
 * @throws {Error} If the specified property does not exist in an entry.
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
 * Finds and returns similar entries from a given data object based on a provided string.
 *
 * @param str - The string to compare against the data entries.
 * @param data - The data object containing entries to search through.
 * @param property - The property of the data entries to compare the string with. Defaults to 'text'.
 * @returns An object containing entries that are similar to the provided string.
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
 * @param keyOrder - An array of keys to place after the default keys.
 * @returns The sorted JSON object.
 */
export const sortJsonKeys = <T = PlainObject>(library: T, keyOrder: string[] = []): T => {
  const DEFAULT_ORDERED_KEYS = ['id', 'name', 'title', 'type'];

  function sortKeys(obj: any): any {
    if (isObject(obj) && !Array.isArray(obj)) {
      const otherKeys = Object.keys(obj).filter(
        (key) => !(DEFAULT_ORDERED_KEYS.includes(key) || keyOrder.includes(key)),
      );

      const sortedKeys = [...DEFAULT_ORDERED_KEYS, ...keyOrder, ...otherKeys.sort()];

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
 * Deserializes the data received from Firestore into a dictionary of specified type.
 *
 * @template TData - The type of data to deserialize.
 * @param data - The data to be deserialized.
 * @returns A dictionary of deserialized data.
 */
export const deserializeFirestoreData = <TData, TParsedData = TData>(
  data: Dictionary<string>,
  entryDeserializer?: (e: TData) => TParsedData,
): Dictionary<TParsedData> => {
  return Object.keys(data).reduce((acc: Dictionary<TParsedData>, key) => {
    acc[key] = entryDeserializer ? entryDeserializer(JSON.parse(data[key])) : JSON.parse(data[key]);
    return acc;
  }, {});
};

/**
 * Serializes the data in a dictionary to a dictionary of strings.
 *
 * @param data - The dictionary containing the data to be serialized.
 * @returns A new dictionary with the same keys as the input dictionary, but with the values serialized as strings.
 */
export const serializeFirestoreData = <TData, TParsedData = TData>(
  data: Dictionary<TData>,
  entrySerializer?: (e: TData) => TParsedData,
): Dictionary<string> => {
  return Object.keys(data).reduce((acc: Dictionary<string>, key) => {
    acc[key] = JSON.stringify(entrySerializer ? entrySerializer(data[key]) : data[key]);
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

/**
 * Creates a dictionary where all specified keys have boolean values initialized to false.
 *
 * @param keys - An array of strings to be used as keys in the dictionary
 * @param value - The boolean value to set for each key. Default is false.
 * @returns A dictionary object with all keys set to the specified value
 */
export const makeBooleanDictionary = (keys: string[], value = false): Dictionary<boolean> => {
  return keys.reduce(
    (acc, key) => {
      acc[key] = value;
      return acc;
    },
    {} as Dictionary<boolean>,
  );
};
