import { chain, isObject } from 'lodash';

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
