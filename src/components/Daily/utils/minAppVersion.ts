import { APP_VERSION_HISTORY_KEY } from './constants';
import type { DailyHistory } from './types';

/** Returns a canonical major.minor.patch version, or undefined for invalid input. */
export function normalizeMinAppVersion(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const version = value.trim();
  return /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version) ? version : undefined;
}

/**
 * Compares validated versions component by component without integer precision loss.
 *
 * @returns Negative, zero, or positive when left is older, equal, or newer.
 * @throws If either argument is not a major.minor.patch version.
 */
export function compareAppVersions(left: string, right: string): number {
  const normalizedLeft = normalizeMinAppVersion(left);
  const normalizedRight = normalizeMinAppVersion(right);
  if (!normalizedLeft || !normalizedRight) {
    throw new Error('App versions must use major.minor.patch format.');
  }
  const leftParts = normalizedLeft.split('.').map(BigInt);
  const rightParts = normalizedRight.split('.').map(BigInt);
  for (let index = 0; index < leftParts.length; index++) {
    if (leftParts[index] !== rightParts[index]) {
      return leftParts[index] < rightParts[index] ? -1 : 1;
    }
  }
  return 0;
}

/** Returns format or downgrade feedback suitable for the Population input. */
export function getMinAppVersionError(value: string, minimum?: string): string | undefined {
  const version = normalizeMinAppVersion(value);
  if (!version) {
    return 'Enter a version in major.minor.patch format, for example 2.0.35.';
  }
  if (minimum && compareAppVersions(version, minimum) < 0) {
    return `Minimum app version cannot be lower than ${minimum}.`;
  }
  return undefined;
}

/**
 * Reads the reserved history entry without changing the shared history schema.
 * Invalid persisted data is returned as a warning so callers can surface it.
 */
export function readHistoryAppVersion(history?: DailyHistory): {
  version?: string;
  warning?: string;
} {
  const entry = history?.[APP_VERSION_HISTORY_KEY];
  if (!entry) {
    return {};
  }
  const warning = 'The saved _app-version history is invalid and has been ignored.';
  let used: unknown;
  try {
    used = JSON.parse(entry.used);
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      throw error;
    }
    return { warning };
  }
  const version = Array.isArray(used) && used.length === 1 ? normalizeMinAppVersion(used[0]) : undefined;
  return version ? { version } : { warning };
}
