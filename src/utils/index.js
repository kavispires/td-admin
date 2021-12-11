import { SEARCH_THRESHOLD } from './constants';

/**
 *
 * @param {string} str
 * @returns
 */
export function stringRemoveAccents(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 *
 * @param {*} data
 * @param {string} property
 * @returns
 */
export const checkForDuplicates = (data, property = 'text') => {
  const unique = {};
  const duplicates = {};

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
 * @param {string} value
 * @param {*} data
 * @param {string} property
 * @returns
 */
export const findSimilar = (str, data, property = 'text') => {
  const similar = {};
  const value = stringRemoveAccents(str.trim().toLowerCase());
  if (!value || value.length < SEARCH_THRESHOLD) return {};

  Object.values(data).forEach((entry) => {
    const entryStr = stringRemoveAccents(entry[property].toLowerCase());

    if (entryStr.includes(value)) {
      similar[entry.id] = entry[property];
    }
  });

  return similar;
};
