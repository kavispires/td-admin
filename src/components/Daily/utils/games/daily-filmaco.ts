import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useTDResource } from 'hooks/useTDResource';
import { groupBy, intersection, orderBy, sampleSize, shuffle } from 'lodash';
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

  const movieSetsQuery = useTDResource<DailyMovieSet>('daily-movie-sets', { enabled });

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

  // 1. Filter complete sets only
  const completeSets = shuffle(
    Object.values(movies).filter((setEntry) => setEntry.itemsIds.filter(Boolean).length > 0),
  );

  // 2. Filter not-used sets only for weekdays
  const availableFilms = shuffle(completeSets.filter((setEntry) => !history.used.includes(setEntry.id)));

  if (availableFilms.length < batchSize) {
    availableFilms.push(...shuffle(completeSets));
  }

  // 3. Historical pool for weekends
  const usedFilms = shuffle(completeSets.filter((movie) => history.used.includes(movie.id)));

  let lastDate = history.latestDate;
  const entries: Dictionary<DailyFilmacoEntry> = {};

  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    const isWeekend = checkWeekend(id);

    // Use .shift() to safely pull from the top of the deck instead of indexing [i]
    const setEntry = isWeekend ? getWeekendFilms(usedFilms, completeSets) : availableFilms.shift();

    if (!setEntry) {
      addWarning('filmaco', `No filmaço sets left to generate day ${id}`);
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

/**
 * Finds two movies from the same year to create a Double Feature.
 * Prioritizes historical movies, falls back to the full database if needed.
 */
const getWeekendFilms = (usedFilms: DailyMovieSet[], allFilms: DailyMovieSet[]) => {
  // Helper to find a pair of non-intersecting movies from the same year
  const findValidPairByYear = (pool: DailyMovieSet[]) => {
    const filmsByYear = groupBy(pool, 'year');
    // Only look at years that actually have 2 or more movies
    const validYears = Object.keys(filmsByYear).filter((year) => filmsByYear[year].length >= 2);

    for (const year of shuffle(validYears)) {
      const filmsOfYear = shuffle(filmsByYear[year]);

      // Look for two movies in this year that don't share items
      for (let i = 0; i < filmsOfYear.length; i++) {
        for (let j = i + 1; j < filmsOfYear.length; j++) {
          if (intersection(filmsOfYear[i].itemsIds, filmsOfYear[j].itemsIds).length === 0) {
            return [filmsOfYear[i], filmsOfYear[j]];
          }
        }
      }
    }
    return null; // No valid disjoint pair found in this pool
  };

  // 1. Try to find a pair entirely from History
  let selectedFilms = findValidPairByYear(usedFilms);

  // 2. SAFE FALLBACK: Try the whole database if history doesn't have a matching pair
  if (!selectedFilms) {
    selectedFilms = findValidPairByYear(allFilms);
  }

  // 3. EXTREME FALLBACK: Database is very small/overlapping, just grab ANY two from same year
  if (!selectedFilms) {
    console.warn('Filmaço: Falling back to intersecting same-year pair.');
    const allFilmsByYear = groupBy(allFilms, 'year');
    const fallbackYears = Object.keys(allFilmsByYear).filter((year) => allFilmsByYear[year].length >= 2);

    if (fallbackYears.length > 0) {
      const randomYear = shuffle(fallbackYears)[0];
      selectedFilms = sampleSize(allFilmsByYear[randomYear], 2);
    } else {
      // Absolute failure state (Database has 0 years with >= 2 movies)
      selectedFilms = sampleSize(allFilms, 2);
    }
  }

  selectedFilms = orderBy(selectedFilms, (f) => f.year, 'asc');

  const doubleFeatureSet: Merge<DailyMovieSet, { year: string | number }> = {
    id: `df-${selectedFilms.map((f) => f.id).join('-')}`,
    title: `${selectedFilms.map((f) => f.title).join(' × ')}`,
    itemsIds: shuffle(removeDuplicates(selectedFilms.flatMap((f) => f.itemsIds))),
    // They are the same year, so we only need to display the year once!
    year: selectedFilms[0].year,
  };

  return doubleFeatureSet;
};
