import { orderBy, range } from 'lodash';

/**
 * Creates array of given length filled with indexes
 * @param length the length of the array
 * @param startAt the starting value
 * @returns
 */

export const makeArray = (length = 1, startAt = 0): number[] => range(startAt, startAt + length); /**
 * Remove duplicated elements from a list
 * @param arr
 * @returns
 */

export const removeDuplicates = <T>(arr: T[]): T[] => {
  return Array.from(new Set(arr));
}; /**
 * Checks if an array has any duplicate elements.
 * @param arr - The array to check for duplicates.
 * @returns A boolean indicating whether the array has duplicates.
 * @template T - The type of elements in the array.
 */

export const hasDuplicates = <T>(arr: T[]): boolean => {
  return new Set(arr).size !== arr.length;
};
export const sortItemsIds = (itemsIds: string[]) => {
  return orderBy(itemsIds, (id) => Number(id));
};
