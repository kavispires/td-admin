import { useMemo, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';

import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
  useQueries,
  UseQueryOptions,
} from '@tanstack/react-query';
import { App } from 'antd';
import { DailyEntry, DailyHistory, DataDrawing, DataSuffixCounts } from './types';
import { sampleSize, shuffle } from 'lodash';
import { getNextDay } from './utils';
import { firestore } from 'services/firebase';

function getDocQueryFunction<T>(path: string, docId: string) {
  return async () => {
    console.log(`${path}/${docId}`);
    const docRef = doc(firestore, `${path}/${docId}`);
    const querySnapshot = await getDoc(docRef);
    return (querySnapshot.data() ?? {}) as T;
  };
}

const MINIMUM_DRAWINGS = 3;

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

export function useLoadDailySetup(enabled: boolean, queryLanguage?: Language): UseLoadDailySetup {
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
      (e) => e.drawings.length >= MINIMUM_DRAWINGS && e.cardId && !e.cardId?.includes('--')
    );

    console.log({ shortlistCardCount: atLeastTwoDrawingsList.length });

    const shortList = Object.values(atLeastTwoDrawingsList).filter((e) => !usedCards.includes(e.cardId));

    const shuffledShortList = sampleSize(shuffle(shortList), 45);

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
  }, [drawingsQuery, usedCards, latestDate, queryLanguage, latestNumber]);

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

export function useSaveDailySetup(queryLanguage: Language) {
  const { notification } = App.useApp();
  const queryClient = useQueryClient();

  const source = LANGUAGE_PREFIX.DAILY[queryLanguage ?? 'pt'];

  const [isDirty, setIsDirty] = useState(false);

  const query = useMutation<any, Error, DailyEntry[], QueryKey>(
    async (data) => {
      const saves = data.map((entry) => {
        const docRef = doc(firestore, `${source}/${entry.id}`);
        return setDoc(docRef, entry);
      });

      const docRec = doc(firestore, `${source}/history`);
      const history: DailyHistory = {
        latestDate: data[data.length - 1].id,
        latestNumber: data[data.length - 1].number,
        used: data.map((e) => e.cardId),
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
    save: query.mutateAsync,
    isLoading: query.isLoading,
  };
}
