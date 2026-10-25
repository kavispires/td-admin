import { afterEach, describe, expect, it, vi } from 'vitest';
import { generatePuzzle } from './daily-pirralhos';

vi.mock('@components/Daily/hooks/useParsedHistory', () => ({
  useParsedHistory: vi.fn(),
}));
vi.mock('./debug-daily', () => ({
  debugDailyStore: { state: { pirralhos: false } },
}));
vi.mock('lodash', async (importOriginal) => {
  const { default: actual } = await importOriginal<{ default: typeof import('lodash') }>();
  return {
    ...actual,
    default: actual,
    sampleSize: <T>(items: T[], count: number) => items.slice(0, count),
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Pirralhos possible liar counts', () => {
  it.each([
    [5, 3, 0.99],
    [6, 2, 0],
    [6, 3, 0.5],
    [7, 2, 0],
    [7, 3, 0.5],
  ])(
    'limits three actual liars to two or three possible liars with %i kids at difficulty %i',
    (kids, difficulty, liarSelection) => {
      for (const [varianceSelection, expectedCount] of [
        [0, 2],
        [0.99, 3],
      ]) {
        let seed = 42;
        const random = vi.spyOn(Math, 'random').mockImplementation(() => {
          seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
          return seed / 4294967296;
        });
        random.mockReturnValueOnce(liarSelection).mockReturnValueOnce(varianceSelection);

        const puzzle = generatePuzzle(kids, difficulty);

        expect(puzzle.liarsIds).toHaveLength(3);
        expect(puzzle.possibleLiars).toBe(expectedCount);
        random.mockRestore();
      }
    },
  );
});
