import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { firestore } from 'services/firebase';
import { removeDuplicates } from 'utils';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { LANGUAGE_PREFIX } from '../utils/constants';
import { DailyHistory } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';

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

  const historyQuery = useDailyHistoryQuery(source, { enabled: Boolean(source) });

  const mutation = useMutation({
    mutationFn: async (data: any[]) => {
      const saves = data.map((entry) => {
        const docRef = doc(firestore, `${source}/${entry.id}`);
        return setDoc(docRef, entry);
      });

      const docRec = doc(firestore, `${source}/history`);
      const previousHistory = historyQuery.data;

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
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory.palavreado.used),
              ...data.map((e) => e['palavreado'].keyword),
            ])
          ),
        },
        artista: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1]['artista'].number,
          used: '[]',
        },
        filmaco: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1]['filmaco'].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory?.['filmaco']?.used ?? '[]'),
              ...data.map((e) => e['filmaco'].setId),
            ])
          ),
        },
        'controle-de-estoque': {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1]['controle-de-estoque'].number,
          used: '[]',
        },
        'teoria-de-conjuntos': {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1]['teoria-de-conjuntos'].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory?.['teoria-de-conjuntos']?.used ?? '[]'),
              ...data.map((e) => e['teoria-de-conjuntos'].setId),
              ...data.map((e) => e['teoria-de-conjuntos'].intersectingThing.id),
            ])
          ),
        },
        'comunicacao-alienigena': {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1]['comunicacao-alienigena'].number,
          used: '[]',
        },
      };
      setDoc(docRec, newHistory);

      return Promise.all(saves);
    },

    onSuccess: () => {
      notification.info({
        message: 'Data saved',
        placement: 'bottomLeft',
      });
      queryClient.invalidateQueries({
        queryKey: [source, 'history'],
      });
      setIsDirty(false);
    },

    onError: () => {
      notification.error({
        message: 'Error saving data',
        placement: 'bottomLeft',
      });
    },
  });

  return {
    isDirty,
    setIsDirty,
    save: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}
