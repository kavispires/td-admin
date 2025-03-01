import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { shuffle } from 'lodash';
import { useMemo } from 'react';
import type { DailyMovieSet } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

export type DailyFilmacoEntry = {
  id: DateKey;
  number: number;
  type: 'filmaco';
  setId: string;
  title: string;
  itemsIds: string[];
  year: number;
};

export const useDailyFilmacoGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
  _updateWarnings: (warning: string) => void,
) => {
  const [filmacoHistory] = useParsedHistory(DAILY_GAMES_KEYS.FILMACO, dailyHistory);

  const movieSetsQuery = useTDResource<DailyMovieSet>('daily-movie-sets', enabled);

  const entries = useMemo(() => {
    if (!enabled || !movieSetsQuery.isSuccess || !filmacoHistory) {
      return {};
    }

    return buildDailyFilmacoGames(batchSize, filmacoHistory, movieSetsQuery.data);
  }, [enabled, movieSetsQuery, filmacoHistory, batchSize]);

  return {
    entries,
    isLoading: movieSetsQuery.isLoading,
  };
};

/**
 * Builds a dictionary of DailyFilmacoEntry objects based on the given parameters.
 *
 * @param batchSize - The number of DailyFilmacoEntry objects to generate.
 * @param history - The parsed daily history entry.
 * @param movies - The dictionary of DailyMovieSet objects.
 * @returns A dictionary of DailyFilmacoEntry objects.
 */
export const buildDailyFilmacoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  movies: Dictionary<DailyMovieSet>,
) => {
  console.count('Creating Filmaço...');
  // Filter complete sets only
  const completeSets = shuffle(
    Object.values(movies).filter((setEntry) => setEntry.itemsIds.filter(Boolean).length > 0),
  );
  // Filter not-used sets only
  const notUsedSets = completeSets.filter((setEntry) => !history.used.includes(setEntry.id));

  if (notUsedSets.length < batchSize) {
    notUsedSets.push(...shuffle(completeSets));
  }

  let lastDate = history.latestDate;
  // Get list, if not enough, get from complete
  const entries: Dictionary<DailyFilmacoEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const setEntry = notUsedSets[i];
    if (!setEntry) {
      console.error('No filmaço sets left');
      break;
    }
    const id = getNextDay(lastDate);
    lastDate = id;
    entries[id] = {
      id,
      type: 'filmaco',
      number: history.latestNumber + i + 1,
      setId: setEntry.id,
      title: setEntry.title,
      itemsIds: setEntry.itemsIds,
      year: setEntry.year,
    };
  }

  return entries;
};
