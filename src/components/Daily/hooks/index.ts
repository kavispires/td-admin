import { type QueryKey, useMutation } from '@tanstack/react-query';
import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { firestore } from 'services/firebase';
import { LANGUAGE_PREFIX } from '../utils/constants';
import type { DailyHistory } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';

export function useTempDaily(enabled = true) {
  const { notification } = App.useApp();

  const source = LANGUAGE_PREFIX.DAILY.pt;

  const mutation = useMutation<any, Error, DailyHistory, QueryKey>({
    mutationFn: async (data) => {
      const docRec = doc(firestore, `${source}/history`);
      setDoc(docRec, data);
    },
    onSuccess: () => {
      notification.info({
        title: 'New history data saved',
        placement: 'bottomLeft',
      });
    },
  });

  // Load docs
  // Get used ids
  // Rewrite history
  const historyQuery = useDailyHistoryQuery(source, { enabled });

  return {
    mutation,
    historyQuery,
  };
}

export * from './useLoadDailySetup';
export * from './useSaveDailySetup';
