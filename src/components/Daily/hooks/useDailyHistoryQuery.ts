import { App } from 'antd';
import { getDocQueryFunction } from 'hooks/useGetFirebaseDoc';
import { useEffect } from 'react';

import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';

import { DailyHistory } from '../utils/types';
import { printFirebase } from 'services/firebase';

export function useDailyHistoryQuery(
  source: string,
  options: UseQueryOptions<DailyHistory, Error, DailyHistory, QueryKey> = {}
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
  }, [historyQuery.isError]); // eslint-disable-line react-hooks/exhaustive-deps

  return historyQuery;
}
