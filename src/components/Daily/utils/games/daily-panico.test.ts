import lodash, { random, shuffle } from 'lodash';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getNextDay } from '../utils';
import {
  buildDailyPanicoGames,
  generateAllButtonsSequence,
  generateGameSequence,
  generateSampleTestAllPoolsSequence,
  generateSampleTestSequence,
} from './daily-panico';
import { BUTTONS_LIBRARY, POOLS, shuffleAndReplace } from './daily-panico-data';

vi.mock('@components/Daily/hooks/useParsedHistory', () => ({
  useParsedHistory: vi.fn(),
}));
vi.mock('./debug-daily', () => ({
  debugDailyStore: { state: { panico: false } },
}));
vi.mock('../utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils')>();
  return { ...actual, getNextDay: vi.fn(actual.getNextDay) };
});
vi.mock('lodash', async (importOriginal) => {
  const { default: actual } = await importOriginal<{ default: typeof import('lodash') }>();
  return {
    ...actual,
    default: actual,
    random: vi.fn(actual.random),
    shuffle: vi.fn(actual.shuffle),
  };
});

afterEach(() => {
  vi.clearAllMocks();
  vi.mocked(shuffle).mockReset().mockImplementation(lodash.shuffle);
});

const history = { latestDate: '2026-10-20', latestNumber: 10, used: [], reset: 0 };

function expectValidSequence(sequence: string[], length: number) {
  expect(sequence).toHaveLength(length);
  expect(sequence[0]).toBe('1::BASIC_PRESS::');
  expect(sequence.at(-1)).toBe(`${length}::FINAL_PRESS::`);
  const keys = sequence.map((button) => button.split('::')[1]);
  const definitions = keys.map((key) => {
    const definition = Object.values(BUTTONS_LIBRARY).find((button) => button.key === key);
    if (!definition) {
      throw new Error(`Unknown generated button: ${key}`);
    }
    return definition;
  });
  let restrictedStreak = 0;

  sequence.forEach((encoded, index) => {
    const fields = encoded.split('::');
    const definition = definitions[index];
    expect(fields).toHaveLength(3);
    expect(fields[0]).toBe(String(index + 1));
    if (definition.pool) {
      expect(Number(fields[2])).toBeGreaterThanOrEqual(0);
      expect(Number(fields[2])).toBeLessThan(Object.keys(POOLS[definition.pool]).length);
    } else {
      expect(fields[2]).toBe('');
    }
    if (definition.dependsOn) {
      const prerequisiteIndex = keys.indexOf(definition.dependsOn);
      expect(prerequisiteIndex).toBeGreaterThanOrEqual(0);
      expect(index - prerequisiteIndex).toBeGreaterThanOrEqual(5);
    }
    if (definition.key === 'SAME_AS_PREVIOUS') {
      expect(['ANY', 'TBD']).not.toContain(definitions[index - 1].expectedAction);
    }
    expect(keys[index - 1]).not.toBe(definition.key);
    expect(keys[index - 2]).not.toBe(definition.key);
    for (const excluded of definition.eitherOr ?? []) {
      expect(keys).not.toContain(excluded);
    }
    if (index < length - 1) {
      restrictedStreak =
        definition.targetCount === 0 || definition.targetCount === -2 ? restrictedStreak + 1 : 0;
      expect(restrictedStreak).toBeLessThanOrEqual(5);
      expect(keys.filter((key) => key === definition.key).length).toBeLessThanOrEqual(
        definition.maxOccurrence,
      );
    }
  });
}

describe('Pânico pool arrangements', () => {
  it.each([0, 8])('replaces exactly one item at index %i without mutating inputs', (index) => {
    const items = Array.from({ length: 9 }, (_, i) => `item-${i}`);
    const original = [...items];
    const decoys = ['decoy'];
    vi.mocked(random).mockReturnValueOnce(index);

    const result = shuffleAndReplace(items, decoys);

    expect(random).toHaveBeenLastCalledWith(0, 8);
    expect(result).toHaveLength(9);
    expect(result[index]).toBe('decoy');
    expect(result.filter((item) => item === 'decoy')).toHaveLength(1);
    expect(result.filter((item) => original.includes(item))).toHaveLength(8);
    expect(items).toEqual(original);
    expect(decoys).toEqual(['decoy']);
  });

  it('shuffles without replacement when no decoys are supplied and rejects impossible replacements', () => {
    const items = ['first', 'second', 'third'];
    expect(shuffleAndReplace(items).sort()).toEqual([...items].sort());
    expect(shuffleAndReplace([])).toEqual([]);
    expect(() => shuffleAndReplace([], ['decoy'])).toThrow('empty Pânico pool arrangement');
  });

  it('preserves grid and sprite sizes and gives color-grid entries distinct identities', () => {
    const grid = Object.values(POOLS.THINGS_COLOR_GRID);
    expect(grid.map((entry) => entry.id)).toEqual([
      'THINGS_COLOR_GRID_BLUE_TRUE',
      'THINGS_COLOR_GRID_BLUE_FALSE',
      'THINGS_COLOR_GRID_RED_TRUE',
      'THINGS_COLOR_GRID_RED_FALSE',
    ]);
    for (const entry of grid) {
      expect(entry.itemsIds).toHaveLength(9);
    }
    for (const entry of Object.values(POOLS.SAME_THINGS_LIST)) {
      expect(entry.goodsIds).toHaveLength(30);
    }
    for (const entry of Object.values(POOLS.THINGS_TO_SEE)) {
      expect(entry.decoyItemsIds).toHaveLength(9);
      expect(entry.decoyItemsIds.filter((id) => id === entry.itemId)).toHaveLength(1);
    }
  });
});

describe('Pânico sequence encoding', () => {
  it('expands both standalone and dependent pools before numbering placements', () => {
    const sequence = generateSampleTestAllPoolsSequence([
      'BASIC_PRESS',
      'COUNT_SENTENCE',
      'REMEMBER_NUMBER',
      'REMEMBERED_NUMBER',
      'FINAL_PRESS',
    ]);
    const poolKeys = ['COUNT_SENTENCE', 'REMEMBER_NUMBER', 'REMEMBERED_NUMBER'] as const;
    const poolSize = Object.keys(POOLS.SENTENCES_FOR_COUNTING).length;
    const numberPoolSize = Object.keys(POOLS.NUMBERS_MUST_REMEMBER).length;

    expect(sequence).toHaveLength(2 + poolSize + 2 * numberPoolSize);
    expect(sequence[0]).toBe('1::BASIC_PRESS::');
    expect(sequence.at(-1)).toBe(`${sequence.length}::FINAL_PRESS::`);
    for (const key of poolKeys) {
      const size = key === 'COUNT_SENTENCE' ? poolSize : numberPoolSize;
      expect(
        sequence.filter((value) => value.split('::')[1] === key).map((value) => value.split('::')[2]),
      ).toEqual(Array.from({ length: size }, (_, index) => String(index)));
    }
    sequence.forEach((encoded, index) => {
      expect(encoded.split('::')).toHaveLength(3);
      expect(encoded.split('::')[0]).toBe(String(index + 1));
    });
  });

  it('uses the same three-field format for production and development sequences', () => {
    const sequences = [
      generateGameSequence().sequence,
      generateAllButtonsSequence(),
      generateSampleTestSequence(),
      generateSampleTestAllPoolsSequence(),
    ];
    for (const sequence of sequences) {
      sequence.forEach((encoded, index) => {
        const fields = encoded.split('::');
        expect(fields).toHaveLength(3);
        expect(fields[0]).toBe(String(index + 1));
        const button = Object.values(BUTTONS_LIBRARY).find((entry) => entry.key === fields[1]);
        expect(button).toBeDefined();
        if (button?.pool) {
          expect(Number(fields[2])).toBeGreaterThanOrEqual(0);
          expect(Number(fields[2])).toBeLessThan(Object.keys(POOLS[button.pool]).length);
        } else {
          expect(fields[2]).toBe('');
        }
      });
    }
  });
});

describe('Pânico generation and history', () => {
  it('generates complete batches with sequential dates, numbers, and valid dependencies', () => {
    const result = buildDailyPanicoGames(3, history);

    expect(result.errors).toEqual([]);
    expect(Object.keys(result.entries)).toEqual(['2026-10-21', '2026-10-22', '2026-10-23']);
    expect(result.historyUpdate).toEqual({
      latestDate: '2026-10-23',
      latestNumber: 13,
      used: Object.values(result.entries).map((entry) => entry.hashId),
      updateType: 'add',
    });
    Object.values(result.entries).forEach((entry, gameIndex) => {
      expect(entry.number).toBe(11 + gameIndex);
      expectValidSequence(entry.buttons, [15, 15, 10][gameIndex]);
    });
  });

  describe('Pânico button variety', () => {
    it('prefers an unused key over a repeatable button', () => {
      vi.mocked(shuffle)
        .mockReturnValueOnce([BUTTONS_LIBRARY.SAME_AS_PREVIOUS])
        .mockReturnValueOnce([BUTTONS_LIBRARY.TRICK_POLITE_DO_NOT_PRESS])
        .mockReturnValueOnce([BUTTONS_LIBRARY.TRICK_URGENT_PRESS])
        .mockReturnValueOnce([BUTTONS_LIBRARY.SAME_AS_PREVIOUS, BUTTONS_LIBRARY.REMEMBER_NUMBER]);

      expect(generateGameSequence(10).sequence[4].split('::')[1]).toBe('REMEMBER_NUMBER');
    });

    it('prefers less-used batch keys without mutating supplied usage', () => {
      const usage = Object.freeze({ TRICK_POLITE_DO_NOT_PRESS: 5, COUNT_SENTENCE: 0 });
      vi.mocked(shuffle).mockReturnValueOnce([
        BUTTONS_LIBRARY.TRICK_POLITE_DO_NOT_PRESS,
        BUTTONS_LIBRARY.COUNT_SENTENCE,
      ]);

      expect(generateGameSequence(10, usage).sequence[1].split('::')[1]).toBe('COUNT_SENTENCE');
      expect(usage).toEqual({ TRICK_POLITE_DO_NOT_PRESS: 5, COUNT_SENTENCE: 0 });
    });

    it('prefers a less-used category over the old level-balancing preference', () => {
      vi.mocked(shuffle)
        .mockReturnValueOnce([BUTTONS_LIBRARY.RANDOM_QUESTION])
        .mockReturnValueOnce([BUTTONS_LIBRARY.NUMBER_RIDDLE, BUTTONS_LIBRARY.TRICK_POLITE_DO_NOT_PRESS]);

      expect(generateGameSequence(10).sequence[2].split('::')[1]).toBe('TRICK_POLITE_DO_NOT_PRESS');
    });

    it('prioritizes batch rotation over category balance when current-game key usage ties', () => {
      vi.mocked(shuffle)
        .mockReturnValueOnce([BUTTONS_LIBRARY.RANDOM_QUESTION])
        .mockReturnValueOnce([BUTTONS_LIBRARY.TRICK_POLITE_DO_NOT_PRESS, BUTTONS_LIBRARY.NUMBER_RIDDLE]);

      const { sequence } = generateGameSequence(10, { TRICK_POLITE_DO_NOT_PRESS: 5 });

      expect(sequence[2].split('::')[1]).toBe('NUMBER_RIDDLE');
    });

    it('excludes the mandatory opening from category counts', () => {
      vi.mocked(shuffle).mockReturnValueOnce([
        BUTTONS_LIBRARY.BASIC_DO_NOT_PRESS,
        BUTTONS_LIBRARY.LOGIC_HUMAN_TRUE,
      ]);

      expect(generateGameSequence(10).sequence[1].split('::')[1]).toBe('BASIC_DO_NOT_PRESS');
    });

    it('prefers a new category over a ready dependent when key usage ties', () => {
      vi.mocked(shuffle)
        .mockReturnValueOnce([BUTTONS_LIBRARY.REMEMBER_NUMBER])
        .mockReturnValueOnce([BUTTONS_LIBRARY.COUNT_SENTENCE])
        .mockReturnValueOnce([BUTTONS_LIBRARY.TRICK_POLITE_DO_NOT_PRESS])
        .mockReturnValueOnce([BUTTONS_LIBRARY.RANDOM_QUESTION])
        .mockReturnValueOnce([BUTTONS_LIBRARY.PRESS_IF_WANTED])
        .mockReturnValueOnce([BUTTONS_LIBRARY.REMEMBERED_NUMBER, BUTTONS_LIBRARY.COLOR_GRID]);

      expect(generateGameSequence(10).sequence[6].split('::')[1]).toBe('COLOR_GRID');
    });

    it.each([
      ['TRICK_POLITE_DO_NOT_PRESS', 'TRICK_URGENT_PRESS'],
      ['TRICK_URGENT_PRESS', 'TRICK_POLITE_DO_NOT_PRESS'],
    ] as const)('preserves shuffled ties with %s before %s', (first, second) => {
      vi.mocked(shuffle).mockReturnValueOnce([BUTTONS_LIBRARY[first], BUTTONS_LIBRARY[second]]);

      expect(generateGameSequence(10).sequence[1].split('::')[1]).toBe(first);
    });

    it('applies unused-key preference to basic fallbacks while counting the fixed opening as used', () => {
      vi.mocked(shuffle)
        .mockReturnValueOnce([BUTTONS_LIBRARY.TRICK_POLITE_DO_NOT_PRESS])
        .mockReturnValueOnce([BUTTONS_LIBRARY.RANDOM_QUESTION])
        .mockReturnValueOnce([])
        .mockReturnValueOnce([BUTTONS_LIBRARY.BASIC_PRESS, BUTTONS_LIBRARY.BASIC_DO_NOT_PRESS]);

      expect(generateGameSequence(10).sequence[3].split('::')[1]).toBe('BASIC_DO_NOT_PRESS');
    });

    it.each([10, 12, 15, 20, 30])(
      'generates %i distinct button keys without violating placement rules',
      (length) => {
        vi.mocked(shuffle).mockImplementation(lodash.toArray);

        const { sequence } = generateGameSequence(length);

        expectValidSequence(sequence, length);
        expect(new Set(sequence.map((encoded) => encoded.split('::')[1])).size).toBe(length);
      },
    );

    it('rotates interior keys across a real batch and resets usage for the next build', () => {
      vi.mocked(shuffle).mockImplementation(lodash.toArray);
      const keysForBatch = () => {
        const result = buildDailyPanicoGames(3, history);
        expect(result.errors).toEqual([]);
        return Object.values(result.entries).map((entry) =>
          entry.buttons.slice(1, -1).map((encoded) => encoded.split('::')[1]),
        );
      };

      const first = keysForBatch();
      const allKeys = first.flat();

      expect(new Set(allKeys).size).toBe(allKeys.length);
      expect(keysForBatch()).toEqual(first);
    });

    it('preserves weekday lengths and completes a full week with balanced batch usage', () => {
      vi.mocked(shuffle).mockImplementation(lodash.toArray);
      const result = buildDailyPanicoGames(7, history);

      expect(result.errors).toEqual([]);
      expect(Object.values(result.entries)).toHaveLength(7);
      Object.values(result.entries).forEach((entry, index) => {
        expectValidSequence(entry.buttons, [15, 15, 10, 20, 30, 10, 12][index]);
      });
    });
  });

  it('throws instead of returning an incomplete sequence when no candidate can be placed', () => {
    vi.mocked(shuffle).mockReturnValueOnce([]).mockReturnValueOnce([]);
    expect(() => generateGameSequence()).toThrow('complete Pânico sequence');
  });

  it('keeps history at the last completed game if the next generation fails', () => {
    const nextDay = vi.mocked(getNextDay).getMockImplementation();
    if (!nextDay) {
      throw new Error('Missing date helper implementation.');
    }
    vi.mocked(getNextDay)
      .mockImplementationOnce(nextDay)
      .mockImplementationOnce((date) => {
        vi.mocked(shuffle).mockReturnValueOnce([]).mockReturnValueOnce([]);
        return nextDay(date);
      });

    const result = buildDailyPanicoGames(2, history);
    expect(Object.keys(result.entries)).toEqual(['2026-10-21']);
    expect(result.errors).toEqual([expect.stringContaining('complete Pânico sequence')]);
    expect(result.historyUpdate).toMatchObject({
      latestDate: '2026-10-21',
      latestNumber: 11,
      used: [result.entries['2026-10-21'].hashId],
    });
  });

  it.each([-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY])(
    'reports invalid batch size %s without advancing history',
    (batchSize) => {
      const result = buildDailyPanicoGames(batchSize, history);
      expect(result.entries).toEqual({});
      expect(result.errors).toEqual(['Pânico batch size must be a non-negative integer.']);
      expect(result.historyUpdate).toEqual({
        latestDate: history.latestDate,
        latestNumber: history.latestNumber,
        used: [],
        updateType: 'add',
      });
    },
  );

  it.each([7, 8.5, Number.NaN, Number.POSITIVE_INFINITY])('rejects invalid sequence length %s', (length) => {
    expect(() => generateGameSequence(length)).toThrow('integer of at least 8');
  });
});
