import { isNull, isObject, isUndefined, set, transform } from 'lodash';
import { stringRemoveAccents } from './string';

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
