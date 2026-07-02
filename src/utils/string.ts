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
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Represents the result of a string similarity search against multiple targets.
 */
export interface BestMatchResult {
  /**
   * An array containing the similarity rating for each target string evaluated.
   */
  ratings: Array<{ target: string; rating: number }>;
  /**
   * The target string that had the highest similarity rating, along with its rating.
   */
  bestMatch: { target: string; rating: number };
  /**
   * The index of the best match within the original `targetStrings` array.
   */
  bestMatchIndex: number;
}

/**
 * Calculates the similarity between two strings based on the Sørensen–Dice coefficient.
 * It works by comparing the number of identical adjacent character pairs (bigrams) shared between the two strings.
 * * Spaces are ignored during the comparison.
 * * @param first - The first string to compare.
 * @param second - The second string to compare.
 * @returns A number between 0.0 and 1.0. A value of 1.0 indicates identical strings,
 * while 0.0 indicates completely different strings (or strings too short to form bigrams).
 * * @example
 * compareTwoStrings('healed', 'sealed'); // returns 0.8
 * compareTwoStrings('hello', 'world');   // returns 0
 */
export function compareTwoStrings(first: string, second: string): number {
  first = first.replace(/\s+/g, '');
  second = second.replace(/\s+/g, '');

  if (first === second) return 1; // Identical strings
  if (first.length < 2 || second.length < 2) return 0; // Cannot form bigrams

  const firstBigrams = new Map<string, number>();

  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    firstBigrams.set(bigram, (firstBigrams.get(bigram) || 0) + 1);
  }

  let intersectionSize = 0;

  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = firstBigrams.get(bigram);

    if (count && count > 0) {
      firstBigrams.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

/**
 * Compares a main string against an array of target strings to find the closest match.
 * It calculates the Sørensen–Dice coefficient for each target and returns the most similar one.
 * * @param mainString - The string to match against the targets.
 * @param targetStrings - An array of strings to compare against the main string. Must contain at least one element.
 * @returns An object containing the ratings for all targets, the best match, and the index of the best match.
 * * @throws {Error} If `targetStrings` is not an array or is an empty array.
 * * @example
 * findBestStringMatch('healed', ['edward', 'sealed', 'theatre']);
 * returns {
 *   ratings: [
 *     { target: 'edward', rating: 0.2 },
 *     { target: 'sealed', rating: 0.8 },
 *     { target: 'theatre', rating: 0.14285714285714285 }
 *   ],
 *   bestMatch: { target: 'sealed', rating: 0.8 },
 *   bestMatchIndex: 1
 * }
 */
export function findBestStringMatch(mainString: string, targetStrings: string[]): BestMatchResult {
  if (!Array.isArray(targetStrings) || targetStrings.length === 0) {
    throw new Error('Bad arguments: targetStrings must be an array of strings');
  }

  const ratings = targetStrings.map((target) => ({
    target,
    rating: compareTwoStrings(mainString, target),
  }));

  let bestMatchIndex = 0;
  let bestMatch = ratings[0];

  for (let i = 1; i < ratings.length; i++) {
    if (ratings[i].rating > bestMatch.rating) {
      bestMatch = ratings[i];
      bestMatchIndex = i;
    }
  }

  return { ratings, bestMatch, bestMatchIndex };
}

/**
 * Calculates the Levenshtein distance between two strings.
 * This represents the minimum number of single-character edits (insertions, deletions,
 * or substitutions) required to change one string into the other.
 *
 * @param a - The first string to compare.
 * @param b - The second string to compare.
 * @returns The number of edits required. A value of 0 means the strings are identical.
 *
 * @example
 * levenshteinDistance('kitten', 'sitting'); // returns 3 (substitute k->s, e->i, add g)
 * levenshteinDistance('hello', 'hallo');    // returns 1 (substitute e->a)
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Optimize by only keeping the current and previous rows of the matrix in memory
  let v0 = Array.from({ length: b.length + 1 }, (_, i) => i);
  let v1 = new Array(b.length + 1);

  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;

    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(
        v1[j] + 1, // deletion
        v0[j + 1] + 1, // insertion
        v0[j] + cost, // substitution
      );
    }

    // Swap arrays for the next iteration
    const temp = v0;
    v0 = v1;
    v1 = temp;
  }

  return v0[b.length];
}

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

    if (entryStr.includes(value) || compareTwoStrings(str, entryStr) > 0.5) {
      similar[entry.id] = val;
    }
  });

  return similar;
};
