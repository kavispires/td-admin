import { firestore } from '@services/firebase';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeDuplicates } from '@utils/array';
import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { cloneDeep, intersection } from 'lodash';
import { useState } from 'react';
import { APP_VERSION_HISTORY_KEY, LANGUAGE_PREFIX } from '../utils/constants';
import { compareAppVersions, normalizeMinAppVersion, readHistoryAppVersion } from '../utils/minAppVersion';
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

      const { entries, historyUpdates, minAppVersion } = data;
      const version = normalizeMinAppVersion(minAppVersion);
      if (!version || version !== minAppVersion) {
        throw new Error('Minimum app version must use major.minor.patch format.');
      }
      if (entries.length === 0) {
        throw new Error('Cannot save an empty daily batch.');
      }
      if (entries.some((entry) => entry.minAppVersion !== version)) {
        throw new Error('Every daily entry must match the batch minimum app version.');
      }
      const historyVersion = readHistoryAppVersion(previousHistory).version;
      if (historyVersion && compareAppVersions(version, historyVersion) < 0) {
        throw new Error(`Minimum app version cannot be lower than ${historyVersion}.`);
      }

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

      newHistory[APP_VERSION_HISTORY_KEY] = {
        latestDate: entries.reduce((latest, entry) => (entry.id > latest ? entry.id : latest), entries[0].id),
        latestNumber: 0,
        used: JSON.stringify([version]),
        reset: 0,
      };

      const saves = entries.map((entry) => {
        const docRef = doc(firestore, `${source}/${entry.id}`);
        return setDoc(docRef, entry);
      });
      const historyDocRec = doc(firestore, `${source}/history`);
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

    onError: (error) => {
      notification.error({
        title: 'Error saving data',
        description: error.message,
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
