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
    // biome-ignore lint/suspicious/noConsole: on purpose
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
