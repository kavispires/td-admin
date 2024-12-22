import { useLoadWordLibrary } from 'hooks/useLoadWordLibrary';
import { useTDResource } from 'hooks/useTDResource';
import { useEffect, useMemo, useState } from 'react';
import type {
  DailyDiscSet,
  ArteRuimCard,
  DailyMovieSet,
  DailyDiagramItem,
  DailyDiagramRule,
  ItemAttribute,
  ItemAtributesValues,
} from 'types';

import { LANGUAGE_PREFIX } from '../utils/constants';
import type { DailyEntry } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';
import { useLoadDrawings } from './useLoadDrawings';
import { useParsedHistory } from './useParsedHistory';
import { buildDailyArteRuimGames } from '../utils/games/daily-arte-ruim';
import { buildDailyAquiOGames } from '../utils/games/daily-aqui-o';
import { buildDailyPalavreadoGames } from '../utils/games/daily-palavreado';
import { buildDailyFilmacoGames } from '../utils/games/daily-filmaco';
import { buildDailyControleDeEstoqueGames } from '../utils/games/daily-controle-de-estoque';
import { buildDailyArtistaGames } from '../utils/games/daily-artista';
import { buildDailyTeoriaDeConjuntosGames } from '../utils/games/daily-teoria-de-conjuntos';
import { buildDailyComunicacaoAlienigenaGames } from '../utils/games/daily-comunicacao-alienigena';

export type UseLoadDailySetup = {
  isLoading: boolean;
  entries: DailyEntry[];
  warnings: string[];
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
  batchSize: number,
): UseLoadDailySetup {
  // STEP 1: HISTORY
  const source = LANGUAGE_PREFIX.DAILY[queryLanguage ?? 'pt'];
  const historyQuery = useDailyHistoryQuery(source, { enabled });
  const [warnings, setWarnings] = useState<string[]>([]);

  const updateWarnings = (newWarning: string) => {
    setWarnings((prev) => [...prev, newWarning]);
  };

  useEffect(() => {
    setWarnings([]);
  }, [batchSize, queryLanguage]);

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
  const aquiOSetsQuery = useTDResource<DailyDiscSet>('daily-disc-sets', enabled);
  const [aquiOHistory] = useParsedHistory('aqui-o', historyQuery.data);
  const aquiOEntries = useMemo(() => {
    if (!aquiOSetsQuery.isSuccess || !historyQuery.isSuccess) {
      return {};
    }

    return buildDailyAquiOGames(batchSize, aquiOHistory, aquiOSetsQuery.data, updateWarnings);
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
  const arteRuimCardsQuery = useTDResource<ArteRuimCard>(`arte-ruim-cards-${queryLanguage}`, enabled);
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
      usedArteRuimIds,
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
  const movieSetsQuery = useTDResource<DailyMovieSet>('daily-movie-sets', enabled);
  const [filmacoHistory] = useParsedHistory('filmaco', historyQuery.data);
  const filmacoEntries = useMemo(() => {
    if (!movieSetsQuery.isSuccess || !historyQuery.isSuccess) {
      return {};
    }

    return buildDailyFilmacoGames(batchSize, filmacoHistory, movieSetsQuery.data);
  }, [movieSetsQuery, filmacoHistory, batchSize, historyQuery.isSuccess]);

  // SET 7: Controle de Estoque
  const [controleDeEstoqueHistory] = useParsedHistory('controle-de-estoque', historyQuery.data);
  const controleDeEstoqueEntries = useMemo(() => {
    if (!historyQuery.isSuccess) {
      return {};
    }

    return buildDailyControleDeEstoqueGames(batchSize, controleDeEstoqueHistory);
  }, [batchSize, historyQuery.isSuccess, controleDeEstoqueHistory]);

  // SET 8: Teoria de Conjuntos
  const [teoriaDeConjuntosHistory] = useParsedHistory('teoria-de-conjuntos', historyQuery.data);
  const thingsQuery = useTDResource<DailyDiagramItem>('daily-diagram-items', enabled);
  const rulesQuery = useTDResource<DailyDiagramRule>('daily-diagram-rules', enabled);
  const teoriaDeConjuntosHistoryEntries = useMemo(() => {
    if (!historyQuery.isSuccess || !thingsQuery.isSuccess || !rulesQuery.isSuccess) {
      return {};
    }

    return buildDailyTeoriaDeConjuntosGames(
      batchSize,
      teoriaDeConjuntosHistory,
      rulesQuery.data,
      thingsQuery.data,
    );
  }, [batchSize, historyQuery.isSuccess, teoriaDeConjuntosHistory, rulesQuery, thingsQuery]);

  // SET 9: Comunicação Alienígena
  const [comunicacaoAlienigenaHistory] = useParsedHistory('comunicacao-alienigena', historyQuery.data);
  const tdrAttributesQuery = useTDResource<ItemAttribute>('items-attributes', enabled);
  const tdrItemsAttributesValuesQuery = useTDResource<ItemAtributesValues>('items-attribute-values', enabled);
  const comunicacaoAlienigenaEntries = useMemo(() => {
    if (
      !historyQuery.isSuccess ||
      !tdrAttributesQuery.isSuccess ||
      !tdrItemsAttributesValuesQuery.isSuccess
    ) {
      return {};
    }

    return buildDailyComunicacaoAlienigenaGames(
      batchSize,
      comunicacaoAlienigenaHistory,
      tdrAttributesQuery.data,
      tdrItemsAttributesValuesQuery.data,
      updateWarnings,
    );
  }, [
    batchSize,
    historyQuery.isSuccess,
    comunicacaoAlienigenaHistory,
    tdrAttributesQuery,
    tdrItemsAttributesValuesQuery,
  ]);

  // STEP N: Create entries
  const entries = useMemo(() => {
    if (arteRuimEntries.length === 0) {
      return [];
    }
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
        'teoria-de-conjuntos': teoriaDeConjuntosHistoryEntries[arteRuim.id],
        'comunicacao-alienigena': comunicacaoAlienigenaEntries[arteRuim.id],
      };
    });
  }, [
    arteRuimEntries,
    aquiOEntries,
    palavreadoEntries,
    artistaEntries,
    filmacoEntries,
    controleDeEstoqueEntries,
    teoriaDeConjuntosHistoryEntries,
    comunicacaoAlienigenaEntries,
  ]);

  return {
    isLoading:
      areDrawingsLoading ||
      historyQuery.isLoading ||
      wordsFourQuery.isLoading ||
      wordsFiveQuery.isLoading ||
      arteRuimCardsQuery.isLoading ||
      aquiOSetsQuery.isLoading ||
      movieSetsQuery.isLoading ||
      thingsQuery.isLoading ||
      rulesQuery.isLoading ||
      tdrAttributesQuery.isLoading ||
      tdrItemsAttributesValuesQuery.isLoading,
    entries,
    warnings,
  };
}
