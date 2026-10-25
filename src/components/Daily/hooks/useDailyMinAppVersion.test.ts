import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_MIN_APP_VERSION, MIN_APP_VERSION_STORAGE_KEY } from '../utils/constants';
import { getMinAppVersionError } from '../utils/minAppVersion';
import {
  changeMinAppVersion,
  persistMinAppVersion,
  readMinAppVersionState,
  reconcileMinAppVersion,
} from './useDailyMinAppVersion';

const storage = {
  getItem: vi.fn<(key: string) => string | null>(),
  setItem: vi.fn<(key: string, value: string) => void>(),
};

beforeEach(() => {
  storage.getItem.mockReset().mockReturnValue(null);
  storage.setItem.mockReset();
  vi.stubGlobal('localStorage', storage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('minimum app version state', () => {
  it('uses the default provisionally without writing it over pending history', () => {
    const state = readMinAppVersionState();
    expect(state.version).toBe(DEFAULT_MIN_APP_VERSION);
    expect(state.minimum).toBeUndefined();
    expect(storage.setItem).not.toHaveBeenCalled();

    const hydrated = reconcileMinAppVersion(state, '2.0.20');
    expect(hydrated.value).toBe('2.0.20');
    expect(hydrated.minimum).toBe('2.0.20');
    expect(reconcileMinAppVersion(state).version).toBe(DEFAULT_MIN_APP_VERSION);
  });

  it('initializes from localStorage and promotes only newer history versions', () => {
    storage.getItem.mockReturnValue('2.0.40');
    const state = readMinAppVersionState();
    expect(state.value).toBe('2.0.40');
    expect(reconcileMinAppVersion(state, '2.0.35')).toBe(state);
    expect(reconcileMinAppVersion(state, '2.0.40')).toBe(state);
    expect(reconcileMinAppVersion(state, '2.0.100')).toMatchObject({
      value: '2.0.100',
      version: '2.0.100',
      minimum: '2.0.100',
    });
  });

  it('accepts higher valid edits for persistence and rejects subsequent downgrades', () => {
    const hydrated = reconcileMinAppVersion(readMinAppVersionState(), '2.0.40');
    const accepted = changeMinAppVersion(hydrated, ' 2.0.45 ');
    expect(accepted.value).toBe('2.0.45');
    expect(persistMinAppVersion(accepted.version)).toBeUndefined();
    expect(storage.setItem).toHaveBeenCalledWith(MIN_APP_VERSION_STORAGE_KEY, '2.0.45');

    const downgrade = changeMinAppVersion(accepted, '2.0.41');
    expect(downgrade.value).toBe('2.0.41');
    expect(downgrade.version).toBe('2.0.45');
    expect(getMinAppVersionError(downgrade.value, downgrade.minimum)).toContain('cannot be lower');
    expect(reconcileMinAppVersion(accepted, '2.0.42')).toBe(accepted);
  });

  it('keeps invalid drafts visible through history promotion until corrected', () => {
    const state = reconcileMinAppVersion(readMinAppVersionState(), '2.0.40');
    const draft = changeMinAppVersion(state, '');
    const promoted = reconcileMinAppVersion(draft, '2.0.50');
    expect(promoted.value).toBe('');
    expect(promoted.version).toBe('2.0.50');
    expect(getMinAppVersionError(promoted.value, promoted.minimum)).toBeDefined();
    const corrected = changeMinAppVersion(promoted, '2.0.50');
    expect(getMinAppVersionError(corrected.value, corrected.minimum)).toBeUndefined();
  });

  it('does not replace accepted user edits with older history during hydration', () => {
    const edited = changeMinAppVersion(readMinAppVersionState(), '3.0.0');
    expect(reconcileMinAppVersion(edited, '2.0.50')).toBe(edited);
  });

  it('surfaces invalid preferences and storage failures instead of hiding them', () => {
    storage.getItem.mockReturnValue('bad');
    expect(readMinAppVersionState()).toMatchObject({
      version: DEFAULT_MIN_APP_VERSION,
      minimum: undefined,
      storageWarning: expect.stringContaining('invalid'),
    });
    storage.getItem.mockImplementation(() => {
      throw new Error('Storage disabled');
    });
    expect(readMinAppVersionState().storageWarning).toContain('Could not read');
    storage.setItem.mockImplementation(() => {
      throw new Error('Storage full');
    });
    expect(persistMinAppVersion('2.0.40')).toContain('Could not save');
  });
});
