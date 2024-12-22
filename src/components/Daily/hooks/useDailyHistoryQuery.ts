import { App } from 'antd';
import { getDocQueryFunction } from 'hooks/useGetFirebaseDoc';
import { useEffect } from 'react';

import { type QueryKey, useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type { DailyHistory } from '../utils/types';
import { printFirebase } from 'services/firebase';

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
