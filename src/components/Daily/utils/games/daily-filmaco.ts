/** biome-ignore-all lint/suspicious/noConsole: debugging purposes */

import { useParsedHistory } from '@components/Daily/hooks/useParsedHistory';
import { useTDResource } from '@hooks/useTDResource';
import { useQuery } from '@tanstack/react-query';
import type { DailyMovieSet } from '@types';
import { removeDuplicates } from '@utils/array';
import { groupBy, intersection, sampleSize, shuffle } from 'lodash';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry, UseDailyGeneratorResponse } from '../types';
import { checkWeekend, getNextDay } from '../utils';
import { debugDailyStore } from './debug-daily';

export type DailyFilmacoEntry = {
  /**
   * Date-based identifier (YYYY-MM-DD)
   */
  id: DateKey;
  /**
   * Daily puzzle number
   */
  number: number;
  type: 'filmaco';
  /**
   * Movie set identifier
   */
  setId: string;
  /**
   * Movie title
   */
  title: string;
  /**
   * Item IDs representing movie scenes
   */
  itemsIds: string[];
  /**
   * Movie year or combined year for double features
   */
  year: number | string;
  /**
   * Whether this is a weekend double feature
   */
  isDoubleFeature?: boolean;
};

/**
 * Hook for generating daily Filmaço games
 *
 * @param enabled - Whether the generation is enabled
 * @param _queryLanguage - Target language (currently unused)
 * @param batchSize - Number of games to generate
 * @param dailyHistory - Historical data for tracking used movies
 * @returns Generated Filmaço game entries with history updates
 */
export const useDailyFilmacoGames = (
  enabled: boolean,
  _queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
): UseDailyGeneratorResponse<DailyFilmacoEntry> => {
  // Fetch prerequisite data
  const [filmacoHistory] = useParsedHistory(DAILY_GAMES_KEYS.FILMACO, dailyHistory);
  const movieSetsQuery = useTDResource<DailyMovieSet>('daily-movie-sets', { enabled });

  // Ensure all prerequisite data is available before generating
  const isReadyToGenerate = enabled && movieSetsQuery.isSuccess && !!filmacoHistory;

  // Generator query
  const generatorQuery = useQuery({
    queryKey: ['generate-daily', 'filmaco', batchSize, movieSetsQuery.dataUpdatedAt],
    queryFn: () => {
      // Type narrowing to satisfy non-null assertion rules
      if (!filmacoHistory || !movieSetsQuery.data) {
        throw new Error('Critical: Prerequisite data is missing during query execution.');
      }

      return buildDailyFilmacoGames(batchSize, filmacoHistory, movieSetsQuery.data);
    },
    enabled: isReadyToGenerate,
    staleTime: Number.POSITIVE_INFINITY,
  });

  // Map TanStack states to response type
  return {
    entries: generatorQuery.data?.entries ?? {},
    isLoading: !isReadyToGenerate || generatorQuery.isLoading,
    isGenerating: generatorQuery.isFetching,
    isError: generatorQuery.isError || !!generatorQuery.data?.errors?.length,
    errors: generatorQuery.data?.errors ?? (generatorQuery.error ? [generatorQuery.error.message] : []),
    isSuccess: generatorQuery.isSuccess && Object.keys(generatorQuery.data?.entries ?? {}).length > 0,
    historyUpdate: generatorQuery.data?.historyUpdate ?? {
      latestDate: filmacoHistory?.latestDate ?? '',
      latestNumber: filmacoHistory?.latestNumber ?? 0,
      used: [],
      updateType: 'add',
    },
  };
};

/**
 * Builds a batch of daily Filmaço games
 *
 * Generates games using movie sets for weekdays and double features (two movies from the same year)
 * for weekends. Uses recycling when fresh movies run out.
 *
 * @param batchSize - Number of games to generate
 * @param history - Historical data for tracking used movies
 * @param movies - Available movie sets
 * @returns Generated entries, errors, and history update
 */
export const buildDailyFilmacoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  movies: Dictionary<DailyMovieSet>,
) => {
  if (debugDailyStore.state.filmaco) {
    console.count('Creating Filmaço...');
  }

  const errors: string[] = [];
  const entries: Record<string, DailyFilmacoEntry> = {};
  const used: string[] = [];

  let latestDate = history.latestDate;
  let latestNumber = history.latestNumber;

  try {
    // Filter complete sets only
    const completeSets = shuffle(
      Object.values(movies).filter((setEntry) => setEntry.itemsIds.filter(Boolean).length > 0),
    );

    if (completeSets.length === 0) {
      throw new Error('Critical: No valid Filmaço sets found.');
    }

    // Filter unused sets for weekdays
    const availableFilms = shuffle(completeSets.filter((setEntry) => !history.used.includes(setEntry.id)));

    if (availableFilms.length < batchSize) {
      if (debugDailyStore.state.filmaco) {
        console.log('🔆 Not enough fresh filmaco sets left, recycling...');
      }
      errors.push('Not enough unused films. Recycling historical data.');
      availableFilms.push(...shuffle(completeSets));
    }

    // Historical pool for weekend double features
    const usedFilms = shuffle(completeSets.filter((movie) => history.used.includes(movie.id)));

    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(latestDate);
      const isWeekend = checkWeekend(id);

      let setEntry: DailyMovieSet | null = null;
      let doubleFeatureSourceIds: string[] = [];

      // Get appropriate entry based on day type
      if (isWeekend) {
        const dfResult = getWeekendFilms(usedFilms, completeSets);
        if (dfResult) {
          setEntry = dfResult.set;
          doubleFeatureSourceIds = dfResult.sourceIds;
        }
      } else {
        setEntry = availableFilms.shift() ?? null;
      }

      if (!setEntry) {
        errors.push(`No filmaço sets left to generate day ${id}`);
        continue;
      }

      // Update counters
      latestDate = id;
      latestNumber = history.latestNumber + i + 1;

      // Track usage for history update
      if (isWeekend) {
        used.push(...doubleFeatureSourceIds);
      } else {
        used.push(setEntry.id);
      }

      entries[id] = {
        id,
        type: 'filmaco',
        number: latestNumber,
        setId: setEntry.id,
        title: setEntry.title,
        itemsIds: setEntry.itemsIds,
        year: setEntry.year,
        isDoubleFeature: isWeekend,
      };
    }
  } catch (error: unknown) {
    if (debugDailyStore.state.filmaco) {
      console.error(error);
    }
    errors.push((error as Error).message || 'An unknown error occurred during Filmaço generation.');
  }

  return {
    entries,
    errors,
    historyUpdate: {
      latestDate,
      latestNumber,
      used,
      updateType: 'add' as const,
    },
  };
};

/**
 * Finds two movies from the same year to create a weekend double feature
 *
 * Prioritizes historical movies and ensures non-intersecting item sets when possible.
 * Falls back to the full database if needed.
 *
 * @param usedFilms - Previously used movies
 * @param allFilms - All available movies
 * @returns Double feature set and source IDs, or null if no valid pair found
 */
const getWeekendFilms = (usedFilms: DailyMovieSet[], allFilms: DailyMovieSet[]) => {
  // Find a pair of non-intersecting movies from the same year
  const findValidPairByYear = (pool: DailyMovieSet[]) => {
    const filmsByYear = groupBy(pool, 'year');
    // Only consider years with at least 2 movies
    const validYears = Object.keys(filmsByYear).filter((year) => filmsByYear[year].length >= 2);

    for (const year of shuffle(validYears)) {
      const filmsOfYear = shuffle(filmsByYear[year]);

      // Look for two movies that don't share items
      for (let i = 0; i < filmsOfYear.length; i++) {
        for (let j = i + 1; j < filmsOfYear.length; j++) {
          if (intersection(filmsOfYear[i].itemsIds, filmsOfYear[j].itemsIds).length === 0) {
            return [filmsOfYear[i], filmsOfYear[j]];
          }
        }
      }
    }
    return null;
  };

  // Try to find a pair from historical movies
  let selectedFilms = findValidPairByYear(usedFilms);

  // Fallback: try the entire database
  if (!selectedFilms) {
    selectedFilms = findValidPairByYear(allFilms);
  }

  // Extreme fallback: allow intersecting pairs if database is very small
  if (!selectedFilms) {
    const allFilmsByYear = groupBy(allFilms, 'year');
    const fallbackYears = Object.keys(allFilmsByYear).filter((year) => allFilmsByYear[year].length >= 2);

    if (fallbackYears.length > 0) {
      const randomYear = shuffle(fallbackYears)[0];
      selectedFilms = sampleSize(allFilmsByYear[randomYear], 2);
    } else {
      // Absolute failure: database has fewer than 2 movies in any year
      selectedFilms = sampleSize(allFilms, 2);
    }
  }

  // If even the absolute fallback failed, bail out
  if (!selectedFilms || selectedFilms.length < 2) {
    return null;
  }

  const doubleFeatureSet = {
    id: `df-${selectedFilms.map((f) => f.id).join('-')}`,
    title: `${selectedFilms.map((f) => f.title).join(' × ')}`,
    itemsIds: shuffle(removeDuplicates(selectedFilms.flatMap((f) => f.itemsIds))),
    year: selectedFilms[0].year,
  } as DailyMovieSet;

  return {
    set: doubleFeatureSet,
    sourceIds: selectedFilms.map((f) => f.id),
  };
};
