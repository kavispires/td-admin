import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { cloneDeep, intersection } from 'lodash';
import { useState } from 'react';
import { firestore } from 'services/firebase';
import { removeDuplicates } from 'utils';
import { DAILY_GAMES_KEYS, LANGUAGE_PREFIX } from '../utils/constants';
import type { DailyHistory } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';
import type { UseLoadDailySetupResponse } from './useLoadDailySetup';

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
    mutationFn: async (data: UseLoadDailySetupResponse) => {
      const previousHistory = historyQuery.data;
      if (!previousHistory) {
        throw new Error('No previous history');
      }

      const { entries, historyUpdates } = data;

      const saves = entries.map((entry) => {
        const docRef = doc(firestore, `${source}/${entry.id}`);
        return setDoc(docRef, entry);
      });

      const historyDocRec = doc(firestore, `${source}/history`);

      const newHistory: DailyHistory = cloneDeep(previousHistory);
      Object.entries(historyUpdates).forEach(([key, update]) => {
        newHistory[key] = {
          latestDate: update.latestDate,
          latestNumber: update.latestNumber,
          used: '',
          reset: previousHistory[key]?.reset ?? 0,
        };

        const previousUsed = JSON.parse(previousHistory[key]?.used ?? '[]');
        if (update.updateType === 'add') {
          const newUsed = removeDuplicates([...previousUsed, ...update.used])
            .flat()
            .sort();
          newHistory[key].used = JSON.stringify(newUsed);
        } else if (update.updateType === 'replace') {
          // Compare the current used and only keep items in the new used that do not exist in the previous used using lodash
          const newUsed = intersection(update.used, previousUsed).sort();
          newHistory[key].used = JSON.stringify(newUsed);
          newHistory[key].reset = (previousHistory[key]?.reset ?? 0) + 1;
        }
      });

      saves.push(setDoc(historyDocRec, newHistory));

      return Promise.all(saves);
    },

    onSuccess: () => {
      notification.info({
        title: 'Data saved',
        placement: 'bottomLeft',
      });
      queryClient.invalidateQueries({
        queryKey: [source, 'history'],
      });
      queryClient.invalidateQueries({
        queryKey: ['generate-daily'],
      });
      setIsDirty(false);
    },

    onError: () => {
      notification.error({
        title: 'Error saving data',
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
