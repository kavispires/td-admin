import type { DailyDiagramItemData, DailyDiagramRuleData } from '@types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { prepareDiagramItemsForDownload } from './prepareDiagramItemsForDownload';

const item: DailyDiagramItemData = {
  itemId: '3293',
  name: 'escotilha',
  rules: [1, 8, 3, 43],
  syllables: 'es|co|ti|lha',
  stressedSyllable: 1,
  updatedAt: 100,
};

const rule = (id: string, method: DailyDiagramRuleData['method']): DailyDiagramRuleData => ({
  id,
  method,
  title: id,
  level: 1,
  type: 'count',
  updatedAt: 50,
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('prepareDiagramItemsForDownload', () => {
  it('recalculates numeric memberships using full-ID auto and dependency verifiers', () => {
    vi.spyOn(Date, 'now').mockReturnValue(200);
    const original = structuredClone(item);
    const rules = Object.fromEntries(
      [
        rule('ddr-1-pt', 'manual'),
        rule('ddr-8-pt', 'auto'),
        rule('ddr-73-pt', 'auto'),
        rule('ddr-3-pt', 'dependency'),
        rule('ddr-22-pt', 'dependency'),
        rule('ddr-43-pt', 'dependency'),
        rule('ddr-44-pt', 'dependency'),
      ].map((entry) => [entry.id, entry]),
    );

    expect(prepareDiagramItemsForDownload({ 3293: item }, rules)).toEqual({
      3293: { ...item, rules: [1, 22, 44, 73], updatedAt: 200 },
    });
    expect(item).toEqual(original);
  });

  it('does not change timestamps when memberships stay the same', () => {
    const unchanged = { ...item, rules: [73, 1] };

    expect(
      prepareDiagramItemsForDownload({ 3293: unchanged }, { 'ddr-73-pt': rule('ddr-73-pt', 'auto') }),
    ).toEqual({
      3293: { ...unchanged, rules: [1, 73] },
    });
  });

  it('checks acronym membership numerically when recalculating syllable rules', () => {
    const acronym = { ...item, name: 'ONU', rules: [46, 51], syllables: 'ONU' };

    const result = prepareDiagramItemsForDownload(
      { 3293: acronym },
      { 'ddr-46-pt': rule('ddr-46-pt', 'dependency') },
    );

    expect(result['3293'].rules).toEqual([51]);
    expect(acronym.rules).toEqual([46, 51]);
  });

  it('rejects a non-Portuguese auto rule instead of adding an invalid numeric reference', () => {
    expect(() =>
      prepareDiagramItemsForDownload({ 3293: item }, { 'ddr-1-en': rule('ddr-1-en', 'auto') }),
    ).toThrow('Invalid Portuguese Diagram rule ID "ddr-1-en".');
  });
});
