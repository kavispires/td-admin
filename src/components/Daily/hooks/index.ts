import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from 'services/firebase';

import { QueryKey, useMutation, useQuery } from '@tanstack/react-query';

import { DailyHistory, DataSuffixCounts } from '../utils/types';
import { getDocQueryFunction } from 'hooks/useGetFirebaseDoc';
import { LANGUAGE_PREFIX } from '../utils/constants';

export function useTempDaily(enabled = true) {
  const { notification } = App.useApp();

  const source = LANGUAGE_PREFIX.DAILY['pt'];

  const mutation = useMutation<any, Error, DailyHistory, QueryKey>({
    mutationFn: async (data) => {
      const docRec = doc(firestore, `${source}/history`);
      setDoc(docRec, data);
    },
    onSuccess: () => {
      notification.info({
        message: 'New history data saved',
        placement: 'bottomLeft',
      });
    },
  });

  // Load docs
  // Get used ids
  // Rewrite history

  const historyQuery = useQuery<any, Error, DailyHistory, QueryKey>({
    queryKey: [source, 'history'],
    queryFn: getDocQueryFunction<DataSuffixCounts>(source, 'history'),
    enabled,
    onSuccess: (data) => {
      notification.info({
        message: 'Data Daily History loaded',
        placement: 'bottomLeft',
      });
    },
    onError: () => {
      notification.error({
        message: 'Error loading daily history',
        placement: 'bottomLeft',
      });
    },
  });

  return {
    mutation,
    historyQuery,
  };

  // useQuery<any, Error, string[], QueryKey>({
  //   queryKey: [source, 'allDocs'],
  //   queryFn: async () => {
  //     const querySnapshot = await getDocs(collection(firestore, source));
  //     const ids: string[] = [];
  //     querySnapshot.forEach((doc) => {
  //       const snapshot = doc.data() as DailyEntry;
  //       console.log('Getting', snapshot.id);
  //       if (snapshot.dataIds) {
  //         ids.push(...snapshot.dataIds.map((e) => e.split('::')[0]));
  //       }
  //     });
  //     return removeDuplicates(ids);
  //   },
  //   enabled: Boolean(historyQuery.data?.used),
  //   onSuccess: (data) => {
  //     const history = historyQuery.data as DailyHistory;

  //     mutation.mutateAsync({
  //       ...history,
  //       used: data,
  //     });
  //   },
  // });
}

export * from './useLoadDrawings';
export * from './useLoadDailySetup';
export * from './useSaveDailySetup';
