import type { ImageCardDescriptorData } from '@types';
import { describe, expect, it, vi } from 'vitest';
import type { ParsedDailyHistoryEntry } from '../types';
import { buildDailyVitralGames } from './daily-vitral';

vi.mock('@components/Daily/hooks/useParsedHistory', () => ({}));
vi.mock('@hooks/useTDResource', () => ({}));
vi.mock('./debug-daily', () => ({
  debugDailyStore: { state: { vitral: false } },
}));

const historicalIds = ['old-1', 'old-2', 'old-3', 'old-4'];
const freshIds = ['new-1', 'new-2'];
const puzzleSets: Dictionary<ImageCardDescriptorData> = Object.fromEntries(
  [...historicalIds, ...freshIds].map((id) => [
    id,
    {
      id,
      title: { pt: `Title ${id}`, en: `Title ${id}` },
      description: { pt: '', en: '' },
      keywords: { pt: '', en: '' },
      updatedAt: 0,
    },
  ]),
);

const history: ParsedDailyHistoryEntry = {
  latestDate: '2026-10-15',
  latestNumber: 10,
  used: historicalIds,
  reset: 0,
};

describe('buildDailyVitralGames', () => {
  it('uses three distinct historical images on both weekend days without consuming fresh weekday images', () => {
    const result = buildDailyVitralGames(4, history, puzzleSets);

    expect(result.errors).toEqual([]);
    expect(Object.keys(result.entries)).toEqual(['2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19']);

    for (const id of ['2026-10-17', '2026-10-18']) {
      const entry = result.entries[id];
      expect(entry.title).toBe('Vitrais Especiais');
      expect(entry.cardsIds).toHaveLength(3);
      expect(new Set(entry.cardsIds).size).toBe(3);
      expect(entry.cardsIds?.[1]).toBe(entry.cardId);
      expect(entry.cardsIds?.every((cardId) => historicalIds.includes(cardId))).toBe(true);
      expect(entry.pieces.every((piece, index) => piece !== index)).toBe(true);
    }

    const weekdays = [result.entries['2026-10-16'], result.entries['2026-10-19']];
    expect(weekdays.map((entry) => entry.cardId).sort()).toEqual(freshIds);
    for (const entry of weekdays) {
      expect(entry.title).toBe(puzzleSets[entry.cardId].title.pt);
      expect(entry).not.toHaveProperty('cardsIds');
    }

    expect(Object.values(result.entries).map((entry) => entry.number)).toEqual([11, 12, 13, 14]);
    expect(result.historyUpdate).toEqual({
      latestDate: '2026-10-19',
      latestNumber: 14,
      used: weekdays.map((entry) => entry.cardId),
      updateType: 'add',
    });
    expect(history.used).toEqual(historicalIds);
  });

  it('does not recycle the weekday pool for a weekend-only batch', () => {
    const result = buildDailyVitralGames(
      2,
      { ...history, latestDate: '2026-10-16', used: Object.keys(puzzleSets) },
      puzzleSets,
    );

    expect(result.errors).toEqual([]);
    expect(Object.keys(result.entries)).toHaveLength(2);
    expect(result.historyUpdate.used).toEqual([]);
  });

  it.each([
    { used: [] },
    { used: ['old-1'] },
    { used: ['old-1', 'old-2', 'missing'] },
    { used: ['old-1', 'old-1', 'old-2'] },
  ])(
    'reports insufficient historical images instead of using fresh or duplicate images ($used)',
    ({ used }) => {
      const result = buildDailyVitralGames(1, { ...history, latestDate: '2026-10-16', used }, puzzleSets);

      expect(result.entries).toEqual({});
      expect(result.errors).toEqual([
        'Critical: At least three historical Vitral images are required for weekend entries.',
      ]);
      expect(result.historyUpdate).toMatchObject({
        latestDate: '2026-10-16',
        latestNumber: history.latestNumber,
        used: [],
      });
    },
  );

  it('still generates normal weekdays without historical images', () => {
    const result = buildDailyVitralGames(1, { ...history, used: [] }, puzzleSets);
    const entry = result.entries['2026-10-16'];

    expect(result.errors).toEqual([]);
    expect(entry.title).toBe(puzzleSets[entry.cardId].title.pt);
    expect(entry).not.toHaveProperty('cardsIds');
  });
});
