import { useLoadWordLibrary } from 'hooks/useLoadWordLibrary';
import { useTDResource } from 'hooks/useTDResource';
import { useMemo } from 'react';
import { DailyDiscSet, ArteRuimCard, DailyMovieSet } from 'types';

import { LANGUAGE_PREFIX } from '../utils/constants';
import { DailyEntry } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';
import { useLoadDrawings } from './useLoadDrawings';
import { useParsedHistory } from './useParsedHistory';
import { buildDailyArteRuimGames } from '../utils/games/daily-arte-ruim';
import { buildDailyAquiOGames } from '../utils/games/daily-aqui-o';
import { buildDailyPalavreadoGames } from '../utils/games/daily-palavreado';
import { buildDailyFilmacoGames } from '../utils/games/daily-filmaco';
import { buildDailyControleDeEstoqueGames } from '../utils/games/daily-controle-de-estoque';
import { buildDailyArtistaGames } from '../utils/games/daily-artista';

export type UseLoadDailySetup = {
  isLoading: boolean;
  entries: DailyEntry[];
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

    return buildDailyArteRuimGames(batchSize, arteRuimHistory, drawingsQuery, queryLanguage, drawingsCount);
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

    return buildDailyAquiOGames(batchSize, aquiOHistory, aquiOSetsQuery.data);
  }, [aquiOSetsQuery, aquiOHistory, batchSize, historyQuery.isSuccess]);

  // STEP 4: Palavreado
  const wordsFourQuery = useLoadWordLibrary(4, queryLanguage, true, true);
  const wordsFiveQuery = useLoadWordLibrary(5, queryLanguage, true, true);
  const [palavreadoHistory] = useParsedHistory('palavreado', historyQuery.data);
  const palavreadoEntries = useMemo(() => {
    if (
      !wordsFourQuery.data ||
      !wordsFourQuery.data.length ||
      !wordsFiveQuery.data ||
      !wordsFiveQuery.data.length ||
      !historyQuery.isSuccess
    ) {
      return {};
    }

    return buildDailyPalavreadoGames(batchSize, palavreadoHistory, wordsFourQuery.data, wordsFiveQuery.data);
  }, [wordsFourQuery, wordsFiveQuery, palavreadoHistory, batchSize, historyQuery.isSuccess]);

  // STEP 5: Artista
  const arteRuimCardsQuery = useTDResource<ArteRuimCard>(`arte-ruim-cards-${queryLanguage}`);
  const [artistaHistory] = useParsedHistory('artista', historyQuery.data);
  const artistaEntries = useMemo(() => {
    if (!arteRuimCardsQuery.isSuccess || !historyQuery.isSuccess) {
      return {};
    }

    const usedArteRuimIds = arteRuimEntries.map((arteRuim) => arteRuim.cardId);

    return buildDailyArtistaGames(
      batchSize,
      artistaHistory,
      arteRuimHistory,
      arteRuimCardsQuery.data,
      usedArteRuimIds
    );
  }, [
    arteRuimCardsQuery,
    arteRuimHistory,
    artistaHistory,
    batchSize,
    historyQuery.isSuccess,
    arteRuimEntries,
  ]);

  // STEP 6: Filmaço
  const movieSetsQuery = useTDResource<DailyMovieSet>('daily-movie-sets');
  const [filmacoHistory] = useParsedHistory('filmaco', historyQuery.data);
  const filmacoEntries = useMemo(() => {
    if (!movieSetsQuery.isSuccess || !historyQuery.isSuccess) {
      return {};
    }

    return buildDailyFilmacoGames(batchSize, filmacoHistory, movieSetsQuery.data);
  }, [movieSetsQuery, filmacoHistory, batchSize, historyQuery.isSuccess]);

  const [controleDeEstoqueHistory] = useParsedHistory('controle-de-estoque', historyQuery.data);
  // SET 7: Controle de Estoque
  const controleDeEstoqueEntries = useMemo(() => {
    if (!historyQuery.isSuccess) {
      return {};
    }

    return buildDailyControleDeEstoqueGames(batchSize, controleDeEstoqueHistory);
  }, [batchSize, historyQuery.isSuccess, controleDeEstoqueHistory]);

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
        'controle-de-estoque': controleDeEstoqueEntries[arteRuim.id],
      };
    });
  }, [
    arteRuimEntries,
    aquiOEntries,
    palavreadoEntries,
    artistaEntries,
    filmacoEntries,
    controleDeEstoqueEntries,
  ]);

  return {
    isLoading:
      areDrawingsLoading ||
      historyQuery.isLoading ||
      wordsFourQuery.isLoading ||
      wordsFiveQuery.isLoading ||
      arteRuimCardsQuery.isLoading ||
      aquiOSetsQuery.isLoading ||
      movieSetsQuery.isLoading,
    entries,
  };
}
