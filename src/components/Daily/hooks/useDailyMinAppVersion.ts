import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_MIN_APP_VERSION, MIN_APP_VERSION_STORAGE_KEY } from '../utils/constants';
import { compareAppVersions, getMinAppVersionError, normalizeMinAppVersion } from '../utils/minAppVersion';

/**
 * Keeps a possibly invalid input draft separate from the version used in bundles.
 * An undefined minimum denotes a provisional default awaiting saved history.
 */
export type MinAppVersionState = {
  /** Editable draft, including incomplete input. */
  value: string;
  /** Last accepted version included in generated documents. */
  version: string;
  /** Newest known saved or explicitly accepted version; cannot be downgraded. */
  minimum?: string;
  /** Read/write failures or malformed local preferences to surface in the UI. */
  storageWarning?: string;
};

/** Reads the saved preference without persisting a provisional fallback. */
export function readMinAppVersionState(): MinAppVersionState {
  let version: string | undefined;
  let storageWarning: string | undefined;
  try {
    const stored = localStorage.getItem(MIN_APP_VERSION_STORAGE_KEY);
    version = normalizeMinAppVersion(stored);
    if (stored !== null && !version) {
      storageWarning = 'The saved local app version is invalid and has been ignored.';
    }
  } catch {
    storageWarning = 'Could not read the minimum app version from localStorage.';
  }
  return {
    value: version ?? DEFAULT_MIN_APP_VERSION,
    version: version ?? DEFAULT_MIN_APP_VERSION,
    minimum: version,
    storageWarning,
  };
}

/** Accepts valid, non-decreasing edits while retaining invalid drafts for feedback. */
export function changeMinAppVersion(state: MinAppVersionState, value: string): MinAppVersionState {
  const version = normalizeMinAppVersion(value);
  if (!version || getMinAppVersionError(value, state.minimum)) {
    return { ...state, value };
  }
  return { ...state, value: version, version, minimum: version };
}

/**
 * Resolves the provisional default against loaded history and only advances
 * established minima. Invalid drafts remain visible and continue blocking Save.
 */
export function reconcileMinAppVersion(
  state: MinAppVersionState,
  historyVersion?: string,
): MinAppVersionState {
  const version =
    !state.minimum || (historyVersion && compareAppVersions(historyVersion, state.minimum) > 0)
      ? (historyVersion ?? DEFAULT_MIN_APP_VERSION)
      : state.minimum;
  if (state.minimum === version) {
    return state;
  }
  const invalidDraft = getMinAppVersionError(state.value, state.minimum);
  return { ...state, value: invalidDraft ? state.value : version, version, minimum: version };
}

/** Persists an accepted version, returning a visible warning instead of hiding I/O failures. */
export function persistMinAppVersion(version: string): string | undefined {
  try {
    localStorage.setItem(MIN_APP_VERSION_STORAGE_KEY, version);
    return undefined;
  } catch {
    return 'Could not save the minimum app version to localStorage.';
  }
}

/**
 * Owns Population's draft and monotonically increasing accepted version.
 * History is supplied by the existing generator query rather than a new query.
 */
export function useDailyMinAppVersion() {
  const [state, setState] = useState(readMinAppVersionState);

  useEffect(() => {
    if (state.minimum) {
      const storageWarning = persistMinAppVersion(state.minimum);
      setState((previous) =>
        previous.storageWarning === storageWarning ? previous : { ...previous, storageWarning },
      );
    }
  }, [state.minimum]);

  const onChange = useCallback((value: string) => {
    setState((previous) => changeMinAppVersion(previous, value));
  }, []);

  const reconcileHistory = useCallback((version?: string) => {
    setState((previous) => reconcileMinAppVersion(previous, version));
  }, []);

  return {
    value: state.value,
    minAppVersion: state.version,
    error: getMinAppVersionError(state.value, state.minimum),
    storageWarning: state.storageWarning,
    onChange,
    reconcileHistory,
  };
}
