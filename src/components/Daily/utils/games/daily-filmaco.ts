import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { intersection, orderBy, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { DailyMovieSet } from 'types';
import { removeDuplicates } from 'utils';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { addWarning } from '../warnings';

export type DailyFilmacoEntry = {
  id: DateKey;
  number: number;
  type: 'filmaco';
  setId: string;
  title: string;
  itemsIds: string[];
  year: number | string;
  isDoubleFeature?: boolean;
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
  const availableFilms = shuffle(completeSets.filter((setEntry) => !history.used.includes(setEntry.id)));

  if (availableFilms.length < batchSize) {
    availableFilms.push(...shuffle(completeSets));
  }

  // Double-feature for weekends
  const usedFilms = shuffle(
    Object.values(movies).filter((movie) => movie.itemsIds.length > 0 && history.used.includes(movie.id)),
  );

  let lastDate = history.latestDate;
  // Get list, if not enough, get from complete
  const entries: Dictionary<DailyFilmacoEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    const isWeekend = checkWeekend(id);

    const setEntry = isWeekend ? getWeekendFilms(usedFilms) : availableFilms[i];
    if (!setEntry) {
      console.error('No filmaço sets left');
      break;
    }
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

    if (isWeekend) {
      entries[id].isDoubleFeature = true;
    }
  }

  return entries;
};

const getWeekendFilms = (films: DailyMovieSet[]) => {
  let selectedFilms: DailyMovieSet[] = [];

  while (selectedFilms.length < 2 && films.length > 0) {
    const film = films.pop();
    if (film && intersection(film.itemsIds, selectedFilms?.[0]?.itemsIds || []).length === 0) {
      selectedFilms.push(film);
    }
  }

  selectedFilms = orderBy(selectedFilms, (f) => f.year, 'asc');

  const doubleFeatureSet: Merge<DailyMovieSet, { year: string }> = {
    id: `df-${selectedFilms.map((f) => f.id).join('-')}`,
    title: `${selectedFilms.map((f) => f.title).join(' × ')}`,
    itemsIds: shuffle(removeDuplicates(selectedFilms.flatMap((f) => f.itemsIds))),
    year: selectedFilms.map((f) => f.year).join(' × '),
  };

  return doubleFeatureSet;
};
