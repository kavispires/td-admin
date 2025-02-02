import { chain, isNull, isObject, isUndefined, orderBy, set, transform } from 'lodash';
import stringSimilarity from 'string-similarity';
import { SEARCH_THRESHOLD } from './constants';

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
  // biome-ignore lint/suspicious/noMisleadingCharacterClass: the regex is used to remove accents
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
 * @returns The sorted JSON object.
 */
export const sortJsonKeys = (library: PlainObject, keyOrder: string[] = []): PlainObject => {
  function sortKeys(obj: any): any {
    if (isObject(obj) && !Array.isArray(obj)) {
      const sortedKeys = Object.keys(obj)
        .filter((key) => ['id', 'name', 'title', 'type'].includes(key))
        .filter((key) => keyOrder.includes(key))
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
export const deserializeFirebaseData = <TData, TParsedData = TData>(
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
export const serializeFirebaseData = <TData, TParsedData = TData>(
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
