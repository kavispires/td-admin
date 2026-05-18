import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { shuffle } from 'lodash';
import { useMemo } from 'react';
import type { DailyLocationSet } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';
import { addWarning } from '../warnings';

export type DailyMapeamentoEntry = {
  id: DateKey;
  number: number;
  type: 'mapeamento';
  language: Language;
  setId: string;
  location: string;
  clues: string[];
};

export const useDailyMapeamentoGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [mapeamentoHistory] = useParsedHistory(DAILY_GAMES_KEYS.MAPEAMENTO, dailyHistory);

  const locationSetsQuery = useTDResource<DailyLocationSet>('daily-location-sets', { enabled });

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || !locationSetsQuery.isSuccess || !mapeamentoHistory) {
      return {};
    }

    const unusedLocations = Object.values(locationSetsQuery.data).filter(
      (location) => !mapeamentoHistory.used.includes(location.id),
    );

    if (unusedLocations.length <= batchSize) {
      addWarning('mapeamento', 'Not enough unused locations left');
    }

    return buildDailyMapeamentoGames(batchSize, mapeamentoHistory, locationSetsQuery.data);
  }, [enabled, locationSetsQuery.dataUpdatedAt, mapeamentoHistory, batchSize]);

  return {
    entries,
    isLoading: locationSetsQuery.isLoading,
  };
};

/**
 * Builds a dictionary of DailyMapeamentoEntry objects based on the given parameters.
 *
 * @param batchSize - The number of DailyMapeamentoEntry objects to generate.
 * @param history - The parsed daily history entry.
 * @param locations - The dictionary of DailyLocationSet objects.
 * @returns A dictionary of DailyMapeamentoEntry objects.
 */
export const buildDailyMapeamentoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  locations: Dictionary<DailyLocationSet>,
) => {
  console.count('Creating Mapeamento...');

  // Filter not-used sets only
  const availableLocations = shuffle(
    Object.values(locations).filter((location) => !history.used.includes(location.id)),
  );

  if (availableLocations.length < batchSize) {
    availableLocations.push(...shuffle(Object.values(locations)));
  }

  let lastDate = history.latestDate;
  // Get list, if not enough, get from complete
  const entries: Dictionary<DailyMapeamentoEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);

    const setEntry = availableLocations.pop();

    if (!setEntry) {
      addWarning('mapeamento', 'No mapeamento sets left');
      break;
    }

    lastDate = id;
    entries[id] = {
      id,
      type: 'mapeamento',
      number: history.latestNumber + i + 1,
      setId: setEntry.id,
      location: setEntry.location,
      clues: setEntry.clues,
      language: 'pt',
    };
  }

  return entries;
};
