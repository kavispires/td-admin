import type { DailyDiagramItemData, DailyDiagramRuleData } from '@types';
import { parseDiagramRuleId } from '@utils/diagram-items';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { DailyHistory } from '../types';
import { buildDailyConjuntosGames, useDailyConjuntosGames } from './daily-conjuntos';

const queryMocks = vi.hoisted(() => ({
  resourceError: new Error('Failed to load Diagram items.'),
  useResource: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('@components/Daily/hooks/useParsedHistory', () => ({
  useParsedHistory: () => [{ latestDate: '2026-10-15', latestNumber: 10, used: [], reset: 0 }],
}));
vi.mock('@hooks/useTDResource', () => ({ useTDResource: queryMocks.useResource }));
vi.mock('@tanstack/react-query', () => ({ useQuery: queryMocks.useQuery }));
vi.mock('./debug-daily', () => ({
  debugDailyStore: { state: { conjuntos: false } },
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Conjuntos numeric Diagram items', () => {
  it('matches numeric item memberships to full-ID rules and preserves game payloads and history', () => {
    const rules: Dictionary<DailyDiagramRuleData> = {
      'ddr-1-pt': {
        id: 'ddr-1-pt',
        title: 'Rule one',
        level: 1,
        type: 'contains',
        method: 'manual',
        updatedAt: 100,
      },
      'ddr-2-pt': {
        id: 'ddr-2-pt',
        title: 'Rule two',
        level: 2,
        type: 'count',
        method: 'manual',
        updatedAt: 100,
      },
    };
    const items: Dictionary<DailyDiagramItemData> = Object.fromEntries(
      Array.from({ length: 30 }, (_, index) => {
        const itemId = String(index);
        return [
          itemId,
          {
            itemId,
            name: `thing-${index}`,
            rules: index < 10 ? [1] : index < 20 ? [2] : [1, 2],
            updatedAt: 100,
          },
        ];
      }),
    );
    const history = { latestDate: '2026-10-15', latestNumber: 10, used: [], reset: 0 };

    let call = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => (++call % 2 === 0 ? 0.75 : 0.25));
    const original = structuredClone(items);
    const result = buildDailyConjuntosGames(1, history, rules, items);

    expect(result.errors).toEqual([]);
    expect(Object.keys(result.entries)).toEqual(['2026-10-16']);
    expect(result.historyUpdate.used.sort()).toEqual(['ddr-1-pt', 'ddr-2-pt']);
    const entry = result.entries['2026-10-16'];
    const rule1 = parseDiagramRuleId(entry.rule1.id);
    const rule2 = parseDiagramRuleId(entry.rule2.id);
    expect(entry.things).toHaveLength(8);
    expect(items[entry.intersectingThing.id].rules).toEqual(expect.arrayContaining([rule1, rule2]));
    expect(items[entry.rule1.thing.id].rules).toEqual([rule1]);
    expect(items[entry.rule2.thing.id].rules).toEqual([rule2]);
    for (const thing of entry.things) {
      const expectedRules = thing.rule === 0 ? [rule1, rule2] : [thing.rule === 1 ? rule1 : rule2];
      expect([...items[thing.id].rules].sort()).toEqual(expectedRules.sort());
    }
    expect(items).toEqual(original);
  });

  it('surfaces resource errors instead of reporting indefinite loading', () => {
    queryMocks.useResource.mockImplementation((name: string) => ({
      data: {},
      isSuccess: name !== 'daily-diagram-items',
      isError: name === 'daily-diagram-items',
      error: name === 'daily-diagram-items' ? queryMocks.resourceError : null,
      dataUpdatedAt: 0,
    }));
    queryMocks.useQuery.mockReturnValue({
      isLoading: false,
      isFetching: false,
      isError: false,
      isSuccess: false,
      error: null,
    });
    const history: DailyHistory = {};
    const response = useDailyConjuntosGames(true, 'pt', 1, history);

    expect(queryMocks.useResource).toHaveBeenCalledWith('daily-diagram-items', {
      enabled: true,
    });
    expect(queryMocks.useQuery).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
    expect(response.isLoading).toBe(false);
    expect(response.isError).toBe(true);
    expect(response.isSuccess).toBe(false);
    expect(response.errors).toEqual([queryMocks.resourceError.message]);
  });
});
