import { describe, expect, it } from 'vitest';
import { APP_VERSION_HISTORY_KEY } from './constants';
import {
  compareAppVersions,
  getMinAppVersionError,
  normalizeMinAppVersion,
  readHistoryAppVersion,
} from './minAppVersion';

describe('daily app version validation', () => {
  it('accepts and normalizes release versions', () => {
    expect(normalizeMinAppVersion(' 2.0.35 ')).toBe('2.0.35');
    expect(normalizeMinAppVersion('0.0.0')).toBe('0.0.0');
    expect(getMinAppVersionError('2.0.35', '2.0.35')).toBeUndefined();
  });

  it.each(['', '2.0', '2.0.35-beta', '2.0.35+build', 'v2.0.35', '02.0.35', '2.-1.35', 2035])(
    'rejects invalid version %s',
    (value) => {
      expect(normalizeMinAppVersion(value)).toBeUndefined();
    },
  );

  it.each([
    ['2.0.9', '2.0.35'],
    ['2.0.35', '2.0.100'],
    ['2.9.0', '2.10.0'],
    ['2.100.100', '3.0.0'],
    ['2.0.9007199254740992', '2.0.9007199254740993'],
  ])('compares %s numerically below %s', (older, newer) => {
    expect(compareAppVersions(older, newer)).toBeLessThan(0);
    expect(compareAppVersions(newer, older)).toBeGreaterThan(0);
    expect(compareAppVersions(older, older)).toBe(0);
    expect(getMinAppVersionError(older, newer)).toContain(`cannot be lower than ${newer}`);
  });
});

describe('reserved version history', () => {
  const entry = { latestDate: '2026-10-26', latestNumber: 0, reset: 0 };

  it('reads the singleton version without requiring history metadata on legacy documents', () => {
    expect(readHistoryAppVersion()).toEqual({});
    expect(readHistoryAppVersion({})).toEqual({});
    expect(
      readHistoryAppVersion({
        [APP_VERSION_HISTORY_KEY]: { ...entry, used: '["2.0.40"]' },
      }),
    ).toEqual({ version: '2.0.40' });
  });

  it.each(['not JSON', 'null', '"2.0.35"', '[]', '["2.0.35","2.0.40"]', '["bad"]', '[35]'])(
    'reports malformed saved history %s',
    (used) => {
      expect(
        readHistoryAppVersion({
          [APP_VERSION_HISTORY_KEY]: { ...entry, used },
        }),
      ).toEqual({ warning: expect.stringContaining('_app-version history is invalid') });
    },
  );
});
