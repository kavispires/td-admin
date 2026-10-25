import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { APP_VERSION_HISTORY_KEY } from '../utils/constants';
import type { DailyHistory } from '../utils/types';
import type { UseLoadDailySetupResponse } from './useLoadDailySetup';
import { useSaveDailySetup } from './useSaveDailySetup';

type SaveOptions = {
  mutationFn: (data: UseLoadDailySetupResponse) => Promise<unknown>;
  onSuccess: () => void;
  onError: (error: Error) => void;
};

const mocks = vi.hoisted(() => ({
  mutation: vi.fn<(options: SaveOptions) => unknown>(),
  history: vi.fn(),
  setDoc: vi.fn<(path: string, value: unknown) => Promise<void>>(),
  info: vi.fn(),
  error: vi.fn(),
  invalidateQueries: vi.fn(),
}));

vi.mock('@services/firebase', () => ({ firestore: {} }));
vi.mock('firebase/firestore', () => ({
  doc: (_firestore: unknown, path: string) => path,
  setDoc: mocks.setDoc,
}));
vi.mock('@tanstack/react-query', () => ({
  useMutation: mocks.mutation,
  useQueryClient: () => ({ invalidateQueries: mocks.invalidateQueries }),
}));
vi.mock('antd', () => ({
  App: { useApp: () => ({ notification: { info: mocks.info, error: mocks.error } }) },
}));
vi.mock('./useDailyHistoryQuery', () => ({ useDailyHistoryQuery: mocks.history }));

function batch(version = '2.0.40'): UseLoadDailySetupResponse {
  const update = {
    latestDate: '2026-10-27',
    latestNumber: 12,
    used: ['new'],
    updateType: 'add' as const,
  };
  return {
    minAppVersion: version,
    isHistoryLoaded: true,
    isLoading: false,
    isGenerating: false,
    isError: false,
    isSuccess: true,
    errors: [],
    isMissingEntries: false,
    missingEntries: [],
    entries: ['2026-10-27', '2026-10-26'].map((id) => ({
      id,
      minAppVersion: version,
      challenges: {},
      contributions: {},
    })),
    historyUpdates: {
      'arte-ruim': update,
      'aqui-o': update,
      alienado: update,
      investigacao: update,
      filmaco: update,
      mapeamento: update,
      organiku: update,
      palavreado: update,
      panico: update,
      portais: update,
      quartetos: update,
      conjuntos: update,
      vitral: update,
      pirralhos: update,
      picaco: update,
      'ta-na-cara': update,
    },
  };
}

function saveOptions(): SaveOptions {
  function HookHarness() {
    useSaveDailySetup('pt');
    return null;
  }
  renderToStaticMarkup(createElement(HookHarness));
  const options = mocks.mutation.mock.calls.at(-1)?.[0];
  if (!options) {
    throw new Error('Save hook did not register a mutation.');
  }
  return options;
}

const previousHistory: DailyHistory = {
  'arte-ruim': { latestDate: '2026-10-25', latestNumber: 10, reset: 3, used: '["old"]' },
  untouched: { latestDate: '2026-10-20', latestNumber: 4, used: '["preserved"]' },
  [APP_VERSION_HISTORY_KEY]: {
    latestDate: '2026-10-25',
    latestNumber: 0,
    reset: 0,
    used: '["2.0.35"]',
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.history.mockReturnValue({ data: previousHistory });
  mocks.mutation.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
  mocks.setDoc.mockReset().mockResolvedValue(undefined);
});

describe('daily minimum app version saving', () => {
  it('writes every daily root and replaces the reserved entry while preserving game history', async () => {
    const original = structuredClone(previousHistory);
    const data = batch();
    await saveOptions().mutationFn(data);

    expect(mocks.setDoc).toHaveBeenCalledWith('diario/2026-10-27', data.entries[0]);
    expect(mocks.setDoc).toHaveBeenCalledWith('diario/2026-10-26', data.entries[1]);
    expect(mocks.setDoc).toHaveBeenCalledWith(
      'diario/history',
      expect.objectContaining({
        [APP_VERSION_HISTORY_KEY]: {
          latestDate: '2026-10-27',
          latestNumber: 0,
          reset: 0,
          used: '["2.0.40"]',
        },
        'arte-ruim': { latestDate: '2026-10-27', latestNumber: 12, reset: 3, used: '["new","old"]' },
        untouched: previousHistory.untouched,
      }),
    );
    expect(previousHistory).toEqual(original);
  });

  it('supports history documents that predate the reserved version entry', async () => {
    mocks.history.mockReturnValue({ data: {} });
    await saveOptions().mutationFn(batch());
    expect(mocks.setDoc).toHaveBeenCalledTimes(3);
  });

  it.each(['', '2.0', '2.0.40-beta', '2.0.34'])(
    'rejects invalid or downgraded version %s before writes',
    async (version) => {
      await expect(saveOptions().mutationFn(batch(version))).rejects.toThrow();
      expect(mocks.setDoc).not.toHaveBeenCalled();
    },
  );

  it('rejects mismatched entry metadata and empty batches before writes', async () => {
    const options = saveOptions();
    const data = batch();
    data.entries[0].minAppVersion = '2.0.35';
    await expect(options.mutationFn(data)).rejects.toThrow('Every daily entry must match');
    await expect(options.mutationFn({ ...batch(), entries: [] })).rejects.toThrow('empty daily batch');
    expect(mocks.setDoc).not.toHaveBeenCalled();
  });

  it('propagates write failures and surfaces their error messages', async () => {
    const options = saveOptions();
    const error = new Error('Firestore unavailable');
    mocks.setDoc.mockRejectedValue(error);
    await expect(options.mutationFn(batch())).rejects.toThrow('Firestore unavailable');
    options.onError(error);
    expect(mocks.error).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Error saving data', description: error.message }),
    );
    expect(mocks.info).not.toHaveBeenCalled();
  });
});
