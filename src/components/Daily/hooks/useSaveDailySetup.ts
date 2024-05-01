import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { getDocQueryFunction } from 'hooks/useGetFirebaseDoc';
import { useState } from 'react';
import { firestore } from 'services/firebase';
import { removeDuplicates } from 'utils';

import { QueryKey, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { LANGUAGE_PREFIX } from '../utils/constants';
import { DailyEntry, DailyHistory, DataSuffixCounts } from '../utils/types';

/**
 * Custom hook for saving daily setup.
 *
 * @param queryLanguage The language for the query.
 * @returns An object containing the state and functions for saving daily setup.
 */
export function useSaveDailySetup(queryLanguage: Language) {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const source = LANGUAGE_PREFIX.DAILY[queryLanguage ?? 'pt'];

  const [isDirty, setIsDirty] = useState(false);

  const historyQuery = useQuery<any, Error, DailyHistory, QueryKey>({
    queryKey: [source, 'history'],
    queryFn: getDocQueryFunction<DataSuffixCounts>(source, 'history'),
    enabled: Boolean(source),
    onSuccess: () => {
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

  const mutation = useMutation<any, Error, DailyEntry[], QueryKey>(
    async (data) => {
      const saves = data.map((entry) => {
        const docRef = doc(firestore, `${source}/${entry.id}`);
        return setDoc(docRef, entry);
      });

      const docRec = doc(firestore, `${source}/history`);
      const previousHistory = historyQuery.data as DailyHistory;

      if (!previousHistory) {
        throw new Error('No previous history');
      }

      const newHistory: DailyHistory = {
        ...previousHistory,
        'arte-ruim': {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1]['arte-ruim'].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory['arte-ruim'].used),
              ...data.map((e) => e['arte-ruim'].cardId),
            ])
          ),
        },
        'aqui-o': {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1]['aqui-o'].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory['aqui-o'].used ?? '[]'),
              ...data.map((e) => e['aqui-o'].setId),
            ])
          ),
        },
        palavreado: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1]['palavreado'].number,
          used: '[]',
        },
        artista: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1]['artista'].number,
          used: '[]',
        },
      };
      setDoc(docRec, newHistory);

      return Promise.all(saves);
    },
    {
      onSuccess: () => {
        notification.info({
          message: 'Data saved',
          placement: 'bottomLeft',
        });
        queryClient.invalidateQueries([source, 'history']);
        setIsDirty(false);
      },
      onError: () => {
        notification.error({
          message: 'Error saving data',
          placement: 'bottomLeft',
        });
      },
    }
  );

  return {
    isDirty,
    setIsDirty,
    save: mutation.mutateAsync,
    isLoading: mutation.isLoading,
  };
}
