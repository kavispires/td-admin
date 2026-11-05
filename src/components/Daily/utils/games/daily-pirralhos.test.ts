import { afterEach, describe, expect, it, vi } from 'vitest';
import { generatePuzzle, getPuzzleById } from './daily-pirralhos';

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
        expect(getPuzzleById(puzzle.hashId).difficulty).toBe(puzzle.difficulty);
        random.mockRestore();
      }
    },
  );
});

describe('Pirralhos difficulty scoring', () => {
  it('does not penalize compatible relative-gender statements by opposite-gender speakers', () => {
    const puzzle = getPuzzleById(globalThis.btoa('231,232,233,234,235|1|3|3|3,233-9-13-7,124-8'));

    expect(puzzle.difficulty).toBe(52);
  });

  it('does not treat proximity statements about different neighbors as contradictions', () => {
    const puzzle = getPuzzleById(
      globalThis.btoa('231,232,233,234,235,236,237|1|3|3|3,234-0,234-1,237-13-11-8-12'),
    );

    expect(puzzle.difficulty).toBe(43);
  });

  it('increases the score for a misleading displayed liar count without changing the solution', () => {
    const exact = getPuzzleById(
      globalThis.btoa('231,232,233,234,235,236,237|1|3|3|3,234-0,234-1,237-13-11-8-12'),
    );
    const misleading = getPuzzleById(
      globalThis.btoa('231,232,233,234,235,236,237|1|3|2|3,234-0,234-1,237-13-11-8-12'),
    );

    expect(misleading.culpritId).toBe(exact.culpritId);
    expect(misleading.liarsIds).toEqual(exact.liarsIds);
    expect(misleading.difficulty).toBe(exact.difficulty + 10);
  });
});
