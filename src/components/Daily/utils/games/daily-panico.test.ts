import { random, shuffle } from 'lodash';
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
});

const history = { latestDate: '2026-10-20', latestNumber: 10, used: [], reset: 0 };

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
      expect(entry.buttons).toHaveLength(25);
      expect(entry.buttons[0]).toBe('1::BASIC_PRESS::');
      expect(entry.buttons.at(-1)).toBe('25::FINAL_PRESS::');
      const keys = entry.buttons.map((button) => button.split('::')[1]);
      keys.forEach((key, index) => {
        const definition = Object.values(BUTTONS_LIBRARY).find((button) => button.key === key);
        expect(definition).toBeDefined();
        if (!definition) {
          throw new Error(`Unknown generated button: ${key}`);
        }
        if (definition.dependsOn) {
          const prerequisiteIndex = keys.indexOf(definition.dependsOn);
          expect(prerequisiteIndex).toBeGreaterThanOrEqual(0);
          expect(index - prerequisiteIndex).toBeGreaterThanOrEqual(5);
        }
        expect(keys[index - 1]).not.toBe(key);
        expect(keys[index - 2]).not.toBe(key);
        for (const excluded of definition.eitherOr ?? []) {
          expect(keys).not.toContain(excluded);
        }
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
