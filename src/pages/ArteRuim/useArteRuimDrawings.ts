import { type QueryKey, type UseQueryOptions, useQueries, useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import type { FirebaseDataDrawing } from 'components/Daily/utils/types';
import { getDocQueryFunction } from 'hooks/useGetFirebaseDoc';
import { useTDResource } from 'hooks/useTDResource';
import { isEmpty } from 'lodash';
import { useEffect, useMemo } from 'react';
import { printFirebase } from 'services/firebase';
import type { DrawingData, DrawingEntry } from 'types';
import { SEPARATOR } from 'utils/constants';

/**
 * Custom hook for loading drawings.
 * @param enabled - Indicates whether the loading of drawings is enabled.
 * @param libraryCount - The number of libraries to load drawings from.
 * @param queryLanguage - The language for the query.
 * @returns The result of the useQueries hook.
 */
export function useLoadFirebaseDrawings(enabled: boolean, queryLanguage: Language) {
  type DataSuffixCounts = {
    drawingsPT: number;
    drawingsEN: number;
  };

  const DRAWING_SUFFIX_DATA = {
    pt: 'drawingsPT',
    en: 'drawingsEN',
  };

  const { notification } = App.useApp();
  // Step 1: Load suffix counts
  const suffixCountsQuery = useQuery<any, Error, DataSuffixCounts, QueryKey>({
    queryKey: ['data', 'suffixCounts'],
    queryFn: getDocQueryFunction<DataSuffixCounts>('data', 'suffixCounts'),
    enabled,
  });

  useEffect(() => {
    if (suffixCountsQuery.isSuccess) {
      printFirebase('Loaded data/suffixCounts');
    }
  }, [suffixCountsQuery.isSuccess]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only notify on error
  useEffect(() => {
    if (suffixCountsQuery.isError) {
      notification.error({
        message: 'Error loading data/suffixCounts',
        placement: 'bottomLeft',
      });
    }
  }, [suffixCountsQuery.isError]);

  const suffixData = DRAWING_SUFFIX_DATA[queryLanguage ?? 'pt'];

  const libraryCount = suffixCountsQuery.data?.[suffixData as keyof DataSuffixCounts] ?? 0;

  const docPrefix = `drawings${queryLanguage === 'pt' ? 'PT' : 'EN'}`;
  // biome-ignore lint/correctness/useExhaustiveDependencies: notification function shouldn't trigger
  const queries: UseQueryOptions[] = useMemo(() => {
    return new Array(libraryCount).fill(0).map((_, index) => {
      return {
        queryKey: ['data', `${docPrefix}${index + 1}`],
        queryFn: getDocQueryFunction('data', `${docPrefix}${index + 1}`),
        enabled: enabled && Boolean(libraryCount),
        onSuccess: () => {
          notification.info({
            message: `Data Drawings ${docPrefix}${index + 1} loaded`,
            placement: 'bottomLeft',
          });
        },
      };
    });
  }, [libraryCount, docPrefix, enabled]);

  return useQueries({ queries });
}

function extractCreatedAt(key: string): number {
  const parts = key.split(/::|:;|;;/); // Split by either '::' or ':;'
  const createdAtPart = parts[1];
  const createdAt = Number(createdAtPart);
  if (Number.isNaN(createdAt)) {
    console.log('🔆 Invalid createdAt', key, createdAt);
  }
  return Number.isNaN(createdAt) ? 1619161200000 : createdAt;
}

export function useDrawingsResourceData(enabled: boolean, language: string) {
  const firebaseDrawingsQueries = useLoadFirebaseDrawings(enabled, language as Language);
  const tdrDrawingsQuery = useTDResource<DrawingData>(`arte-ruim-drawings-${language}`, enabled);

  const isDrawingsLoading = firebaseDrawingsQueries.some((q) => q.isLoading);
  const isDrawingsSuccess = firebaseDrawingsQueries.every((q) => q.isSuccess);

  const drawings = useMemo(() => {
    if (!isDrawingsSuccess) return {};
    if (!tdrDrawingsQuery.isSuccess) return {};

    const allDrawings = tdrDrawingsQuery.data ?? {};

    (firebaseDrawingsQueries ?? []).forEach((drawingEntry) => {
      const drawingsLibrary = (drawingEntry.data ?? {}) as Record<string, FirebaseDataDrawing>;
      // Build entries for each available card possible
      Object.entries(drawingsLibrary).forEach(([key, dataDrawing]) => {
        const cardId = dataDrawing.cardId ?? dataDrawing.id;

        // Remove cards from "Level 5" or cards that were already used
        if (cardId?.includes('--')) {
          return;
        }

        // Skip empty drawings
        if (dataDrawing.drawing.trim().length < 10) {
          console.log('🔆 Empty drawing', cardId);
          return;
        }

        const createdAt = extractCreatedAt(key);
        const artistId = dataDrawing.playerId ?? 'unknown';
        const entryId = [cardId, artistId, createdAt].join(SEPARATOR);
        const drawingEntry: DrawingEntry = {
          id: entryId,
          drawing: dataDrawing.drawing,
          artistId,
          createdAt,
        };

        if (allDrawings[cardId] === undefined) {
          allDrawings[cardId] = {
            id: cardId,
            text: dataDrawing.text,
            drawings: [drawingEntry],
            updatedAt: drawingEntry.createdAt,
          };
        } else {
          if (!allDrawings[cardId].drawings.some((d) => d.id === drawingEntry.id)) {
            allDrawings[cardId].drawings.push(drawingEntry);

            if (drawingEntry.createdAt > allDrawings[cardId].updatedAt) {
              allDrawings[cardId].updatedAt = drawingEntry.createdAt;
            }
          }
        }
      });
    });

    return allDrawings;
  }, [firebaseDrawingsQueries, isDrawingsSuccess, tdrDrawingsQuery.data, tdrDrawingsQuery.isSuccess]);

  const drawingsPerArtist = useMemo(() => {
    return Object.values(drawings).reduce((acc: Record<string, DrawingPerArtist>, drawing) => {
      drawing.drawings.forEach((drawingEntry) => {
        const artistId = drawingEntry.artistId;
        if (acc[artistId] === undefined) {
          acc[artistId] = {
            artistId,
            drawingsCount: 1,
            firstDrawingAt: drawingEntry.createdAt,
            lastDrawingAt: drawingEntry.createdAt,
          };
        } else {
          acc[artistId].drawingsCount += 1;

          if (drawingEntry.createdAt < acc[artistId].firstDrawingAt) {
            acc[artistId].firstDrawingAt = drawingEntry.createdAt;
          }
          if (drawingEntry.createdAt > acc[artistId].lastDrawingAt) {
            acc[artistId].lastDrawingAt = drawingEntry.createdAt;
          }
        }
      });

      return acc;
    }, {});
  }, [drawings]);

  return {
    isLoading: isDrawingsLoading || tdrDrawingsQuery.isLoading,
    error: tdrDrawingsQuery.error,
    hasResponseData: !isEmpty(drawings),
    drawings,
    drawingsPerArtist: Object.values(drawingsPerArtist),
  };
}

export type DrawingPerArtist = {
  artistId: string;
  drawingsCount: number;
  firstDrawingAt: DateMilliseconds;
  lastDrawingAt: DateMilliseconds;
};

export const ARTIST_ID_ALIAS: Record<string, string> = {
  '3PkJr': 'Flaviane',
  '3c4lY': 'Kavis',
  BPTEL: 'Maris',
  '0vuXf': 'Marcio',
  Bm6dr: 'Livia',
  QrfLz: 'Stephanie',
  AlRvI: 'Unknown',
  pK3OY: 'Unknown',
  VF9iG: 'Zenaide',
  WWUvD: 'Fernanda',
  aec7L: 'Anonymous',
  Xsimf: 'Carol',
  fV5ns: 'Diego',
  qQo9N: 'Laura',
  yVAl7: 'Rodrigo',
  O2IQm: 'Drica',
  '24qec': 'Mariana',
};
