import { useLoadWordLibrary } from 'hooks/useLoadWordLibrary';
import { useTDResource } from 'hooks/useTDResource';
import { sampleSize, shuffle } from 'lodash';
import { useMemo } from 'react';
import { DailyDiscSet, ArteRuimCard, DailyMovieSet } from 'types';

import { LANGUAGE_PREFIX } from '../utils/constants';
import {
  DailyAquiOEntry,
  DailyArtistaEntry,
  DailyEntry,
  DailyFilmacoEntry,
  DailyPalavreadoEntry,
  DataDrawing,
} from '../utils/types';
import { generatePalavreadoGame, getNextDay } from '../utils/utils';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';
import { useLoadDrawings } from './useLoadDrawings';
import { useParsedHistory } from './useParsedHistory';

export type UseLoadDailySetup = {
  isLoading: boolean;
  entries: DailyEntry[];
  // arteRuimHistory: ParsedDailyHistoryEntry;
  // round5sample: DailyEntry[];
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
  // STEP 1: HISTORY
  const source = LANGUAGE_PREFIX.DAILY[queryLanguage ?? 'pt'];
  const historyQuery = useDailyHistoryQuery(source, { enabled });

  // STEP 2: ARTE RUIM
  const drawingsQuery = useLoadDrawings(enabled, queryLanguage ?? 'pt');
  const areDrawingsLoading = drawingsQuery.some((q) => q.isLoading);
  const [arteRuimHistory] = useParsedHistory('arte-ruim', historyQuery.data);
  const arteRuimEntries = useMemo(() => {
    if (areDrawingsLoading || !historyQuery.isSuccess) {
      return [];
    }

    console.count('Creating Arte Ruim...');
    const drawings = (drawingsQuery ?? []).reduce(
      (acc: Record<CardId, DailyEntry['arte-ruim']>, drawingEntry) => {
        const drawingsLibrary = (drawingEntry.data ?? {}) as Record<string, DataDrawing>;
        Object.entries(drawingsLibrary).forEach(([key, dataDrawing]) => {
          const cardId = dataDrawing.cardId ?? dataDrawing.id;

          if (dataDrawing.drawing.trim().length < 10) {
            console.warn('Empty drawing', cardId);
            return acc;
          }

          if (acc[cardId] === undefined) {
            acc[cardId] = {
              id: cardId,
              type: 'arte-ruim',
              language: queryLanguage ?? 'pt',
              cardId: cardId,
              text: dataDrawing.text,
              drawings: [dataDrawing.drawing],
              number: 0,
              dataIds: [key],
            };
          } else {
            acc[cardId].drawings.push(dataDrawing.drawing);
            acc[cardId].dataIds.push(key);
          }
        });

        return acc;
      },
      {}
    );

    const atLeastTwoDrawingsList = Object.values(drawings).filter(
      (e) => e.drawings.length >= drawingsCount && e.cardId && !e.cardId?.includes('--')
    );

    const shortList = Object.values(atLeastTwoDrawingsList).filter(
      (e) => !arteRuimHistory.used.includes(e.cardId)
    );

    const shuffledShortList = sampleSize(shuffle(shortList), batchSize);

    let lastDate = arteRuimHistory.latestDate;

    return shuffledShortList.map((e, index) => {
      const id = getNextDay(lastDate);

      lastDate = id;
      return {
        ...e,
        id,
        number: arteRuimHistory.latestNumber + index + 1,
      };
    });
  }, [
    drawingsQuery,
    queryLanguage,
    arteRuimHistory,
    batchSize,
    drawingsCount,
    areDrawingsLoading,
    historyQuery.isSuccess,
  ]);

  // STEP 3: AQUI Ó
  const aquiOSetsQuery = useTDResource<DailyDiscSet>('daily-disc-sets');
  const [aquiOHistory] = useParsedHistory('aqui-o', historyQuery.data);
  const aquiOEntries = useMemo(() => {
    if (!aquiOSetsQuery.isSuccess || !historyQuery.isSuccess) {
      return {};
    }

    console.count('Creating Aqui Ó...');
    // Filter complete sets only
    const completeSets = shuffle(
      Object.values(aquiOSetsQuery.data).filter((setEntry) => setEntry.itemsIds.filter(Boolean).length >= 20)
    );
    // Filter not-used sets only
    let notUsedSets = completeSets.filter((setEntry) => !aquiOHistory.used.includes(setEntry.id));

    if (notUsedSets.length < batchSize) {
      notUsedSets.push(...shuffle(completeSets));
    }

    let lastDate = aquiOHistory.latestDate;
    // Get list, if not enough, get from complete
    const entries: Dictionary<DailyAquiOEntry> = {};
    for (let i = 0; i < batchSize; i++) {
      const setEntry = notUsedSets[i];
      if (!setEntry) {
        console.error('No aqui-o sets left');
      }
      const id = getNextDay(lastDate);
      lastDate = id;
      entries[id] = {
        id,
        type: 'aqui-o',
        number: aquiOHistory.latestNumber + i + 1,
        setId: setEntry.id,
        title: setEntry.title,
        itemsIds: ['0', ...sampleSize(setEntry.itemsIds, 20)],
      };
    }

    return entries;
  }, [aquiOSetsQuery, aquiOHistory, batchSize, historyQuery.isSuccess]);

  // STEP 4: Palavreado
  const wordsQuery = useLoadWordLibrary(4, queryLanguage, true, true);
  const [palavreadoHistory] = useParsedHistory('palavreado', historyQuery.data);
  const palavreadoEntries = useMemo(() => {
    if (!wordsQuery.data || !wordsQuery.data.length || !historyQuery.isSuccess) {
      return {};
    }
    console.count('Creating Palavreado...');
    let lastDate = palavreadoHistory.latestDate;
    // Get list, if not enough, get from complete
    const entries: Dictionary<DailyPalavreadoEntry> = {};
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(lastDate);
      lastDate = id;
      entries[id] = {
        id,
        type: 'palavreado',
        number: palavreadoHistory.latestNumber + i + 1,
        ...generatePalavreadoGame(wordsQuery.data ?? [], [
          ...Object.values(entries).map((e) => e.keyword),
          ...palavreadoHistory.used,
        ]),
      };
    }
    return entries;
  }, [wordsQuery, palavreadoHistory, batchSize, historyQuery.isSuccess]);

  // STEP 5: Artista
  const arteRuimCardsQuery = useTDResource<ArteRuimCard>(`arte-ruim-cards-${queryLanguage}`);
  const [artistaHistory] = useParsedHistory('artista', historyQuery.data);
  const artistaEntries = useMemo(() => {
    if (!arteRuimCardsQuery.isSuccess || !historyQuery.isSuccess) {
      return {};
    }

    console.count('Creating Artista...');

    let lastDate = artistaHistory.latestDate;
    // Get list, if not enough, get from complete
    const entries: Dictionary<DailyArtistaEntry> = {};
    for (let i = 0; i < batchSize; i++) {
      const id = getNextDay(lastDate);
      const availableCardsIds = Object.keys(arteRuimCardsQuery.data ?? {}).filter(
        (cardId) => !arteRuimHistory.used.includes(cardId)
      );
      const cards = sampleSize(availableCardsIds, 15).map((cardId) => arteRuimCardsQuery.data[cardId]);
      lastDate = id;
      entries[id] = {
        id,
        type: 'artista',
        number: artistaHistory.latestNumber + i + 1,
        cards,
      };
    }
    return entries;
  }, [arteRuimCardsQuery, arteRuimHistory, artistaHistory, batchSize, historyQuery.isSuccess]);

  // STEP 6: Filmaço
  const movieSetsQuery = useTDResource<DailyMovieSet>('daily-movie-sets');
  const [filmacoHistory] = useParsedHistory('filmaco', historyQuery.data);
  const filmacoEntries = useMemo(() => {
    if (!movieSetsQuery.isSuccess || !historyQuery.isSuccess) {
      return {};
    }

    console.count('Creating Filmaço...');

    // Filter complete sets only
    const completeSets = shuffle(
      Object.values(movieSetsQuery.data).filter((setEntry) => setEntry.itemsIds.filter(Boolean).length > 0)
    );
    // Filter not-used sets only
    let notUsedSets = completeSets.filter((setEntry) => !filmacoHistory.used.includes(setEntry.id));

    if (notUsedSets.length < batchSize) {
      notUsedSets.push(...shuffle(completeSets));
    }

    let lastDate = filmacoHistory.latestDate;
    // Get list, if not enough, get from complete
    const entries: Dictionary<DailyFilmacoEntry> = {};
    for (let i = 0; i < batchSize; i++) {
      const setEntry = notUsedSets[i];
      if (!setEntry) {
        console.error('No filmaço sets left');
        break;
      }
      const id = getNextDay(lastDate);
      lastDate = id;
      entries[id] = {
        id,
        type: 'filmaco',
        number: filmacoHistory.latestNumber + i + 1,
        setId: setEntry.id,
        title: setEntry.title,
        itemsIds: setEntry.itemsIds,
        year: setEntry.year,
      };
    }

    return entries;
  }, [movieSetsQuery, filmacoHistory, batchSize, historyQuery.isSuccess]);

  // STEP N: Create entries
  const entries = useMemo(() => {
    console.count('Bundling entries...');
    return arteRuimEntries.map((arteRuim) => {
      return {
        id: arteRuim.id,
        'arte-ruim': arteRuim,
        'aqui-o': aquiOEntries[arteRuim.id],
        palavreado: palavreadoEntries[arteRuim.id],
        artista: artistaEntries[arteRuim.id],
        filmaco: filmacoEntries[arteRuim.id],
      };
    });
  }, [arteRuimEntries, aquiOEntries, palavreadoEntries, artistaEntries, filmacoEntries]);

  return {
    isLoading:
      areDrawingsLoading ||
      historyQuery.isLoading ||
      wordsQuery.isLoading ||
      arteRuimCardsQuery.isLoading ||
      aquiOSetsQuery.isLoading ||
      movieSetsQuery.isLoading,
    entries,
  };
}
