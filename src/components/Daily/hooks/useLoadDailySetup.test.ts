import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_VERSION_HISTORY_KEY, DEFAULT_MIN_APP_VERSION } from '../utils/constants';
import type { DailyPanicoEntry } from '../utils/games/daily-panico';
import type { UseDailyGeneratorResponse } from '../utils/types';
import { type UseLoadDailySetupResponse, useLoadDailySetup } from './useLoadDailySetup';

const mocks = vi.hoisted(() => ({
  game: vi.fn(),
  panico: vi.fn(),
  history: vi.fn(),
  resource: vi.fn(),
}));

vi.mock('@hooks/useTDResource', () => ({ useTDResource: mocks.resource }));
vi.mock('./useDailyHistoryQuery', () => ({ useDailyHistoryQuery: mocks.history }));
vi.mock('../utils/games/daily-alienado', () => ({ useDailyAlienadoGames: mocks.game }));
vi.mock('../utils/games/daily-aqui-o', () => ({ useDailyAquiOGames: mocks.game }));
vi.mock('../utils/games/daily-arte-ruim', () => ({ useDailyArteRuimGames: mocks.game }));
vi.mock('../utils/games/daily-conjuntos', () => ({ useDailyConjuntosGames: mocks.game }));
vi.mock('../utils/games/daily-filmaco', () => ({ useDailyFilmacoGames: mocks.game }));
vi.mock('../utils/games/daily-investigacao', () => ({ useDailyInvestigacaoGames: mocks.game }));
vi.mock('../utils/games/daily-mapeamento', () => ({ useDailyMapeamentoGames: mocks.game }));
vi.mock('../utils/games/daily-organiku', () => ({ useDailyOrganikuGames: mocks.game }));
vi.mock('../utils/games/daily-palavreado', () => ({ useDailyPalavreadoGames: mocks.game }));
vi.mock('../utils/games/daily-panico', () => ({ useDailyPanicoGames: mocks.panico }));
vi.mock('../utils/games/daily-picaco', () => ({ useDailyPicacoGames: mocks.game }));
vi.mock('../utils/games/daily-pirralhos', () => ({ useDailyPirralhosGames: mocks.game }));
vi.mock('../utils/games/daily-portais', () => ({ useDailyPortaisGames: mocks.game }));
vi.mock('../utils/games/daily-quartetos', () => ({ useDailyQuartetosGames: mocks.game }));
vi.mock('../utils/games/daily-ta-na-cara', () => ({ useDailyTaNaCaraGames: mocks.game }));
vi.mock('../utils/games/daily-vitral', () => ({ useDailyVitralGames: mocks.game }));

const id = '2026-10-21';
const panicoEntry: DailyPanicoEntry = {
  id,
  number: 1,
  type: 'panico',
  hashId: 'aeb',
  buttons: ['1::BASIC_PRESS::', '2::FINAL_PRESS::'],
};

const completed: UseDailyGeneratorResponse<{ id: string; number: number }> = {
  entries: { [id]: { id, number: 1 } },
  isLoading: false,
  isGenerating: false,
  isError: false,
  isSuccess: true,
  errors: [],
  historyUpdate: {
    latestDate: id,
    latestNumber: 1,
    used: [],
    updateType: 'add',
  },
};

function loadSetup(enabled = true, minAppVersion?: string): UseLoadDailySetupResponse {
  const captured: { response?: UseLoadDailySetupResponse } = {};
  function HookHarness() {
    captured.response = useLoadDailySetup(enabled, 'pt', 1, minAppVersion);
    return null;
  }
  renderToStaticMarkup(createElement(HookHarness));
  if (!captured.response) {
    throw new Error('Daily setup hook did not render.');
  }
  return captured.response;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.game.mockReturnValue(completed);
  mocks.panico.mockReturnValue({
    ...completed,
    entries: { [id]: panicoEntry },
    historyUpdate: { ...completed.historyUpdate, used: [panicoEntry.hashId] },
  });

  mocks.history.mockReturnValue({ data: {}, isSuccess: true, isLoading: false, isError: false });
  mocks.resource.mockReturnValue({ data: {}, isLoading: false, isError: false });
});

describe('daily bundle minimum app version', () => {
  it('uses the default for existing callers and stamps each date at the root', () => {
    mocks.game.mockReturnValue({
      ...completed,
      entries: { [id]: { id, number: 1 }, '2026-10-22': { id: '2026-10-22', number: 2 } },
    });
    const result = loadSetup();
    expect(result.minAppVersion).toBe(DEFAULT_MIN_APP_VERSION);
    expect(result.entries).toHaveLength(2);
    expect(result.entries.every((entry) => entry.minAppVersion === DEFAULT_MIN_APP_VERSION)).toBe(true);
  });

  it('updates metadata without changing generated challenge payloads or generator arguments', () => {
    const first = loadSetup();
    const updated = loadSetup(true, '2.0.50');
    expect(updated.entries[0].minAppVersion).toBe('2.0.50');
    expect(updated.entries[0].challenges).toEqual(first.entries[0].challenges);
    expect(updated.entries[0].contributions).toEqual(first.entries[0].contributions);
    expect(mocks.panico.mock.calls[0]).toEqual(mocks.panico.mock.calls[1]);
  });

  it('exposes reserved history for reconciliation without treating it as a game', () => {
    mocks.history.mockReturnValue({
      data: {
        [APP_VERSION_HISTORY_KEY]: {
          latestDate: '2026-10-20',
          latestNumber: 0,
          reset: 0,
          used: '["2.0.50"]',
        },
      },
      isSuccess: true,
      isLoading: false,
      isError: false,
    });
    const result = loadSetup();
    expect(result.historyMinAppVersion).toBe('2.0.50');
    expect(result.isHistoryLoaded).toBe(true);
    expect(result.historyUpdates).not.toHaveProperty(APP_VERSION_HISTORY_KEY);
    expect(result.entries[0].challenges).not.toHaveProperty(APP_VERSION_HISTORY_KEY);
    expect(result.isMissingEntries).toBe(false);
  });
});

describe('Pânico daily setup integration', () => {
  it('bundles the challenge and its additive history update into the save payload', () => {
    const result = loadSetup();

    expect(mocks.panico).toHaveBeenCalledWith(true, 'pt', 1, {});
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].challenges.panico).toEqual(panicoEntry);
    expect(result.historyUpdates.panico).toEqual({
      ...completed.historyUpdate,
      used: ['aeb'],
    });
    expect(result.isMissingEntries).toBe(false);
    expect(result.errors).toEqual([]);
  });

  it('marks the daily bundle incomplete if Pânico did not produce its date', () => {
    mocks.panico.mockReturnValue({ ...completed, entries: {} });

    const result = loadSetup();

    expect(result.entries[0].challenges.panico).toBeUndefined();
    expect(result.isMissingEntries).toBe(true);
    expect(result.missingEntries).toEqual([id]);
  });

  it.each(['isLoading', 'isGenerating', 'isError'] as const)(
    'includes Pânico in aggregate %s state',
    (state) => {
      mocks.panico.mockReturnValue({
        ...completed,
        entries: { [id]: panicoEntry },
        [state]: true,
      });

      expect(loadSetup()[state]).toBe(true);
    },
  );

  it('surfaces Pânico errors with the game label', () => {
    mocks.panico.mockReturnValue({
      ...completed,
      entries: {},
      errors: ['Could not generate a complete sequence.'],
      isError: true,
    });

    const result = loadSetup();

    expect(result.errors).toEqual(['[Pânico] Could not generate a complete sequence.']);
    expect(result.isError).toBe(true);
  });

  it('waits for history before enabling Pânico generation', () => {
    const history = { panico: { latestDate: '2026-10-20', latestNumber: 0, used: '[]' } };
    mocks.history.mockReturnValue({ data: history, isSuccess: false, isLoading: true, isError: false });

    loadSetup();

    expect(mocks.panico).toHaveBeenCalledWith(false, 'pt', 1, history);
  });

  it('starts a new Pânico history on the batch schedule without changing other history', () => {
    const history = {
      'arte-ruim': { latestDate: '2026-11-01', latestNumber: 900, used: '["drawing"]' },
    };
    mocks.history.mockReturnValue({ data: history, isSuccess: true, isLoading: false, isError: false });

    loadSetup();

    expect(mocks.panico).toHaveBeenCalledWith(true, 'pt', 1, {
      ...history,
      panico: { latestDate: '2026-11-01', latestNumber: 0, used: '[]', reset: 0 },
    });
    expect(history).not.toHaveProperty('panico');
  });

  it('preserves existing Pânico history instead of resetting its date or challenge number', () => {
    const history = {
      'arte-ruim': { latestDate: '2026-11-01', latestNumber: 900, used: '["drawing"]' },
      panico: { latestDate: '2026-10-30', latestNumber: 20, used: '["aeb"]', reset: 0 },
    };
    mocks.history.mockReturnValue({ data: history, isSuccess: true, isLoading: false, isError: false });

    loadSetup();

    expect(mocks.panico).toHaveBeenCalledWith(true, 'pt', 1, history);
  });
});
