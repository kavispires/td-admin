import { SEARCH_THRESHOLD } from './constants';
import stringSimilarity from 'string-similarity';

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
 * Returns the URL of the TDR resource folder.
 */
export const getTDRUrl = (path: string): string => {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? process.env.REACT_APP_LOCAL_URL
      : process.env.REACT_APP_TD_BASE_URL;
  const folder = process.env.REACT_APP_TD_RESOURCES;

  return [baseUrl, folder, path].join('/');
};

/**
 * Returns the URL of the TDI resource.
 */
export const getTDIUrl = (path: string): string => {
  const baseUrl = process.env.REACT_APP_TD_BASE_URL;
  const folder = process.env.REACT_APP_TDI_DATA;
  return [baseUrl, folder, path].join('/');
};
