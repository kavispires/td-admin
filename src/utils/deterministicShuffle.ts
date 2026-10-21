/**
 * A simple Linear Congruential Generator (LCG) for seeded randomness. Given
 * the same seed, it always produces the exact same sequence of floats
 * between 0 and 1, so content derived from it is identical for every
 * caller using that seed (e.g. every player on the same puzzle day).
 *
 * @param seed Numeric seed to initialize the generator with.
 * @returns A function that returns the next pseudo-random float in `[0, 1)`
 *   on each call.
 */
export function createSeededRandom(seed: number): () => number {
  let currentSeed = seed;
  return () => {
    currentSeed = (currentSeed * 16807) % 2147483647;
    return (currentSeed - 1) / 2147483646;
  };
}

/**
 * Converts a `YYYY-MM-DD` date id into a numeric seed (e.g. `"2026-06-30"`
 * becomes `20260630`).
 *
 * @param id Date id in `YYYY-MM-DD` format.
 * @returns The numeric seed derived from that date.
 */
export function dateIdToSeed(id: string): number {
  return Number.parseInt(id.replaceAll('-', ''), 10);
}

/**
 * Creates a seeded random generator from an arbitrary `YYYY-MM-DD` date id,
 * so the same id always yields the exact same sequence of pseudo-random
 * floats. Mirrors how `Estoquista`'s generator derives its seed from the
 * server-provided daily id.
 *
 * @param id Date id in `YYYY-MM-DD` format.
 * @returns A seeded random generator, see {@link createSeededRandom}.
 */
export function seedById(id: string): () => number {
  return createSeededRandom(dateIdToSeed(id));
}

/**
 * A deterministic version of the Fisher-Yates shuffle, using a seeded
 * random function instead of `Math.random()` so the result is reproducible
 * given the same function instance's seed and call order.
 *
 * @param array Items to shuffle.
 * @param randomFunc Seeded random generator, see {@link createSeededRandom}.
 * @returns A new array containing the same items in deterministic shuffled
 *   order.
 */
export function deterministicShuffle<T>(array: T[], randomFunc: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(randomFunc() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
