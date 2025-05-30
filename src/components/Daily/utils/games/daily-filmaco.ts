import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { shuffle } from 'lodash';
import { useMemo } from 'react';
import type { DailyMovieSet } from 'types';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';
import { addWarning } from '../warnings';

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
) => {
  const [filmacoHistory] = useParsedHistory(DAILY_GAMES_KEYS.FILMACO, dailyHistory);

  const movieSetsQuery = useTDResource<DailyMovieSet>('daily-movie-sets', enabled);

  // biome-ignore lint/correctness/useExhaustiveDependencies: game should be recreated only if data has been updated
  const entries = useMemo(() => {
    if (!enabled || !movieSetsQuery.isSuccess || !filmacoHistory) {
      return {};
    }

    const unusedFilms = Object.values(movieSetsQuery.data).filter(
      (movie) => movie.itemsIds.length > 0 && !filmacoHistory.used.includes(movie.id),
    );
    if (unusedFilms.length <= batchSize) {
      addWarning('filmaco', 'Not enough unused films');
    }

    return buildDailyFilmacoGames(batchSize, filmacoHistory, movieSetsQuery.data);
  }, [enabled, movieSetsQuery.dataUpdatedAt, filmacoHistory, batchSize]);

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
