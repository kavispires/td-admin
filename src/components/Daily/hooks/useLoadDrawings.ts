import { App } from 'antd';
import { getDocQueryFunction } from 'hooks/useGetFirebaseDoc';
import { useEffect, useMemo } from 'react';

import { QueryKey, useQueries, useQuery, UseQueryOptions } from '@tanstack/react-query';

import { LANGUAGE_PREFIX } from '../utils/constants';
import { DataSuffixCounts } from '../utils/types';
import { printFirebase } from 'services/firebase';

/**
 * Custom hook for loading drawings.
 *
 * @param enabled - Indicates whether the loading of drawings is enabled.
 * @param libraryCount - The number of libraries to load drawings from.
 * @param queryLanguage - The language for the query.
 * @returns The result of the useQueries hook.
 */
export function useLoadDrawings(enabled: boolean, queryLanguage: Language) {
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

  useEffect(() => {
    if (suffixCountsQuery.isError) {
      notification.error({
        message: 'Error loading data/suffixCounts',
        placement: 'bottomLeft',
      });
    }
  }, [suffixCountsQuery.isError]);

  const suffixData = LANGUAGE_PREFIX.SUFFIX_DATA[queryLanguage ?? 'pt'];

  const libraryCount = suffixCountsQuery.data?.[suffixData] ?? 0;

  const docPrefix = `drawings${queryLanguage === 'pt' ? 'PT' : 'EN'}`;
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
  }, [libraryCount]);

  return useQueries({ queries });
}
