import { type QueryKey, type UseQueryOptions, useQuery } from '@tanstack/react-query';
import { App } from 'antd';
import { getDocQueryFunction } from 'hooks/useGetFirestoreDoc';
import { useEffect } from 'react';
import { printFirebase } from 'services/firebase';
import type { DailyHistory } from '../utils/types';

export function useDailyHistoryQuery(
  source: string,
  options: Omit<UseQueryOptions<DailyHistory, Error, DailyHistory, QueryKey>, 'queryKey'> = {},
) {
  const { notification } = App.useApp();

  const historyQuery = useQuery<DailyHistory, Error, DailyHistory, QueryKey>({
    queryKey: [source, 'history'],
    queryFn: getDocQueryFunction<DailyHistory>(source, 'history'),
    ...options,
  });

  useEffect(() => {
    if (historyQuery.isSuccess) {
      printFirebase('Loaded daily/history');
    }
  }, [historyQuery.isSuccess]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: only the error should cause this notification
  useEffect(() => {
    if (historyQuery.isError) {
      notification.error({
        message: 'Error loading daily/history',
        placement: 'bottomLeft',
      });
    }
  }, [historyQuery.isError]);

  return historyQuery;
}
