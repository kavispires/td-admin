import { App } from 'antd';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { sampleSize, shuffle } from 'lodash';
import { useMemo, useState } from 'react';
import { firestore } from 'services/firebase';
import { removeDuplicates } from 'utils';

import {
  QueryKey,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';

import { DailyEntry, DailyHistory, DataDrawing, DataSuffixCounts } from './types';
import { getNextDay } from './utils';
import { getDocQueryFunction } from 'hooks/useGetFirebaseDoc';

const LANGUAGE_PREFIX = {
  SUFFIX_DATA: {
    pt: 'drawingsPT',
    en: 'drawingsEN',
  },
  DAILY: {
    pt: 'diario',
    en: 'daily',
  },
};

export type UseLoadDailySetup = {
  isLoading: boolean;
  entries: {
    id: string;
    number: number;
    type: string;
    language: Language;
    cardId: string;
    text: string;
    drawings: string[];
    dataIds: string[];
  }[];
  latestDate: string;
  latestNumber: number;
  round5sample: DailyEntry[];
};

/**
 * Custom hook for loading daily setup data.
 *
 * @param enabled - Indicates whether the loading is enabled or not.
 * @param queryLanguage - Optional language parameter for the query.
 * @param drawingsCount - The number of drawings to load.
 * @param batchSize - The size of the batch to load.
 * @returns An object containing the loading status, daily entries, latest date, latest number, and round 5 sample.
 */
export function useLoadDailySetup(
  enabled: boolean,
  queryLanguage: Language,
  drawingsCount: number,
  batchSize: number
): UseLoadDailySetup {
  const { notification } = App.useApp();
  console.log('useLoadDailySetup', { enabled, queryLanguage });

  // Step 1: Load suffix counts
  const suffixCountsQuery = useQuery<any, Error, DataSuffixCounts, QueryKey>({
    queryKey: ['data', 'suffixCounts'],
    queryFn: getDocQueryFunction<DataSuffixCounts>('data', 'suffixCounts'),
    enabled,
    onSuccess: () => {
      notification.info({
        message: 'Data Suffix Counts loaded',
        placement: 'bottomLeft',
      });
    },
    onError: () => {
      notification.error({
        message: 'Error loading suffix counts',
        placement: 'bottomLeft',
      });
    },
  });

  console.log(suffixCountsQuery.data);

  const suffixData = LANGUAGE_PREFIX.SUFFIX_DATA[queryLanguage ?? 'pt'];

  // Step 2: Load drawings
  const drawingsQuery = useLoadDrawings(
    enabled && Boolean(suffixCountsQuery.data?.[suffixData]),
    suffixCountsQuery.data?.[suffixData] ?? 0,
    queryLanguage ?? 'pt'
  );
  const areDrawingsLoading = drawingsQuery.some((q) => q.isLoading);

  console.log(drawingsQuery?.[0]?.data);

  const source = LANGUAGE_PREFIX.DAILY[queryLanguage ?? 'pt'];

  // Step 3: Load daily history
  const historyQuery = useQuery<any, Error, DailyHistory, QueryKey>({
    queryKey: [source, 'history'],
    queryFn: getDocQueryFunction<DataSuffixCounts>(source, 'history'),
    enabled,
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

  const usedCards = useMemo(() => historyQuery.data?.used ?? [], [historyQuery.data?.used]);
  const latestDate = historyQuery.data?.latestDate ?? '2023-10-31';
  const latestNumber = historyQuery.data?.latestNumber ?? 0;
  console.log({ usedCards, latestDate });

  // Step 4: Parse entries
  const entries = useMemo(() => {
    const drawings = (drawingsQuery ?? []).reduce((acc: Record<CardId, DailyEntry>, drawingEntry) => {
      const drawingsLibrary = (drawingEntry.data ?? {}) as Record<string, DataDrawing>;
      Object.entries(drawingsLibrary).forEach(([key, dataDrawing]) => {
        if (dataDrawing.drawing.trim().length < 10) {
          console.log('Empty drawing', dataDrawing.cardId);
          return acc;
        }
        if (acc[dataDrawing.cardId] === undefined) {
          acc[dataDrawing.cardId] = {
            id: dataDrawing.cardId,
            type: 'arte-ruim',
            language: queryLanguage ?? 'pt',
            cardId: dataDrawing.cardId,
            text: dataDrawing.text,
            drawings: [dataDrawing.drawing],
            number: 0,
            dataIds: [key],
          };
        } else {
          acc[dataDrawing.cardId].drawings.push(dataDrawing.drawing);
          acc[dataDrawing.cardId].dataIds.push(key);
        }
      });

      return acc;
    }, {});

    console.log({ totalCardCount: Object.keys(drawings).length });

    const atLeastTwoDrawingsList = Object.values(drawings).filter(
      (e) => e.drawings.length >= drawingsCount && e.cardId && !e.cardId?.includes('--')
    );

    console.log({ shortlistCardCount: atLeastTwoDrawingsList.length });

    const shortList = Object.values(atLeastTwoDrawingsList).filter((e) => !usedCards.includes(e.cardId));

    const shuffledShortList = sampleSize(shuffle(shortList), batchSize);

    let lastDate = latestDate;

    return shuffledShortList.map((e, index) => {
      const id = getNextDay(lastDate);

      lastDate = id;
      return {
        ...e,
        id,
        number: latestNumber + index + 1,
      };
    });
  }, [drawingsQuery, usedCards, latestDate, queryLanguage, latestNumber, batchSize, drawingsCount]);

  const round5sample = useMemo(() => {
    const drawings = (drawingsQuery ?? []).reduce((acc: Record<CardId, DailyEntry>, drawingEntry) => {
      const drawingsLibrary = (drawingEntry.data ?? {}) as Record<string, DataDrawing>;
      Object.entries(drawingsLibrary).forEach(([key, dataDrawing]) => {
        if (dataDrawing.drawing.trim().length < 10) {
          console.log('Empty drawing', dataDrawing.cardId);
          return acc;
        }
        if (acc[dataDrawing.cardId] === undefined) {
          acc[dataDrawing.cardId] = {
            id: dataDrawing.cardId,
            type: 'arte-ruim',
            language: queryLanguage ?? 'pt',
            cardId: dataDrawing.cardId,
            text: dataDrawing.text,
            drawings: [dataDrawing.drawing],
            number: 0,
            dataIds: [key],
          };
        } else {
          acc[dataDrawing.cardId].drawings.push(dataDrawing.drawing);
          acc[dataDrawing.cardId].dataIds.push(key);
        }
      });

      return acc;
    }, {});

    return Object.values(drawings).filter((e) => e.cardId?.includes('--'));
  }, [drawingsQuery, queryLanguage]);

  return {
    isLoading: suffixCountsQuery.isLoading || areDrawingsLoading || historyQuery.isLoading,
    entries,
    latestDate,
    latestNumber,
    round5sample,
  };
}

/**
 * Custom hook for loading drawings.
 *
 * @param enabled - Indicates whether the loading of drawings is enabled.
 * @param libraryCount - The number of libraries to load drawings from.
 * @param queryLanguage - The language for the query.
 * @returns The result of the useQueries hook.
 */
function useLoadDrawings(enabled: boolean, libraryCount: number, queryLanguage: Language) {
  const { notification } = App.useApp();
  const docPrefix = `drawings${queryLanguage === 'pt' ? 'PT' : 'EN'}`;
  const queries: UseQueryOptions[] = useMemo(() => {
    return new Array(libraryCount).fill(0).map((_, index) => {
      return {
        queryKey: ['data', `${docPrefix}${index + 1}`],
        queryFn: getDocQueryFunction('data', `${docPrefix}${index + 1}`),
        enabled,
        onSuccess: () => {
          notification.info({
            message: `Data Drawings ${docPrefix}${index + 1} loaded`,
            placement: 'bottomLeft',
          });
        },
      };
    });
  }, [libraryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return useQueries({ queries });
}

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

      const history: DailyHistory = {
        latestDate: data[data.length - 1].id,
        latestNumber: data[data.length - 1].number,
        used: removeDuplicates([...previousHistory.used, ...data.map((e) => e.cardId)]),
      };
      setDoc(docRec, history);

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

  useQuery<any, Error, string[], QueryKey>({
    queryKey: [source, 'allDocs'],
    queryFn: async () => {
      const querySnapshot = await getDocs(collection(firestore, source));
      const ids: string[] = [];
      querySnapshot.forEach((doc) => {
        const snapshot = doc.data() as DailyEntry;
        console.log('Getting', snapshot.id);
        if (snapshot.dataIds) {
          ids.push(...snapshot.dataIds.map((e) => e.split('::')[0]));
        }
      });
      return removeDuplicates(ids);
    },
    enabled: Boolean(historyQuery.data?.used),
    onSuccess: (data) => {
      const history = historyQuery.data as DailyHistory;

      mutation.mutateAsync({
        ...history,
        used: data,
      });
    },
  });
}
