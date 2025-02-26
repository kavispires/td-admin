import { useLoadWordLibrary } from 'hooks/useLoadWordLibrary';
import { useTDResource } from 'hooks/useTDResource';
import { useDrawingsResourceData } from 'pages/ArteRuim/useArteRuimDrawings';
import { useEffect, useMemo, useState } from 'react';
import type {
  ArteRuimCard,
  DailyDiagramItem,
  DailyDiagramRule,
  DailyDiscSet,
  DailyMovieSet,
  ItemAttribute,
  ItemAttributesValues,
  SuspectCard,
  TestimonyQuestionCard,
} from 'types';
import { DAILY_GAMES_KEYS, LANGUAGE_PREFIX } from '../utils/constants';
import { type DailyAquiOEntry, buildDailyAquiOGames } from '../utils/games/daily-aqui-o';
import { type DailyArteRuimEntry, buildDailyArteRuimGames } from '../utils/games/daily-arte-ruim';
import { type DailyArtistaEntry, buildDailyArtistaGames } from '../utils/games/daily-artista';
import {
  type DailyComunicacaoAlienigenaEntry,
  buildDailyComunicacaoAlienigenaGames,
} from '../utils/games/daily-comunicacao-alienigena';
import {
  type DailyControleDeEstoqueEntry,
  buildDailyControleDeEstoqueGames,
} from '../utils/games/daily-controle-de-estoque';
import { type DailyFilmacoEntry, buildDailyFilmacoGames } from '../utils/games/daily-filmaco';
import { type DailyPalavreadoEntry, buildDailyPalavreadoGames } from '../utils/games/daily-palavreado';
import { type DailyTaNaCaraEntry, buildDailyTaNaCaraGames } from '../utils/games/daily-ta-na-cara';
import {
  type DailyTeoriaDeConjuntosEntry,
  buildDailyTeoriaDeConjuntosGames,
} from '../utils/games/daily-teoria-de-conjuntos';
import type { DateKey } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';
import { useParsedHistory } from './useParsedHistory';

export type DailyEntry = {
  id: DateKey;
  // Games
  'arte-ruim': DailyArteRuimEntry;
  'aqui-o': DailyAquiOEntry;
  palavreado: DailyPalavreadoEntry;
  filmaco: DailyFilmacoEntry;
  'controle-de-estoque': DailyControleDeEstoqueEntry;
  'teoria-de-conjuntos': DailyTeoriaDeConjuntosEntry;
  'comunicacao-alienigena': DailyComunicacaoAlienigenaEntry;
  // Contributions
  artista: DailyArtistaEntry;
  'ta-na-cara': DailyTaNaCaraEntry;
};

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
  const tdrItemsQuery = useTDResource<ItemAttribute>('items', enabled);

  const updateWarnings = (newWarning: string) => {
    setWarnings((prev) => [...prev, newWarning]);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset warnings on change of basic props
  useEffect(() => {
    setWarnings([]);
  }, [batchSize, queryLanguage]);

  // STEP 2: ARTE RUIM
  const drawingsQuery = useDrawingsResourceData(enabled, queryLanguage);
  const areDrawingsLoading = drawingsQuery.isLoading;
  const [arteRuimHistory] = useParsedHistory(DAILY_GAMES_KEYS.ARTE_RUIM, historyQuery.data);
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
  const [aquiOHistory] = useParsedHistory(DAILY_GAMES_KEYS.AQUI_O, historyQuery.data);
  // biome-ignore lint/correctness/useExhaustiveDependencies: functions shouldn't be used as dependencies
  const aquiOEntries = useMemo(() => {
    if (!aquiOSetsQuery.isSuccess || !historyQuery.isSuccess || !tdrItemsQuery.isSuccess) {
      return {};
    }

    return buildDailyAquiOGames(
      batchSize,
      aquiOHistory,
      aquiOSetsQuery.data,
      tdrItemsQuery.data,
      updateWarnings,
    );
  }, [aquiOSetsQuery, aquiOHistory, batchSize, historyQuery.isSuccess, tdrItemsQuery]);

  // STEP 4: Palavreado
  const wordsFourQuery = useLoadWordLibrary(4, queryLanguage, true, true);
  const wordsFiveQuery = useLoadWordLibrary(5, queryLanguage, true, true);
  const [palavreadoHistory] = useParsedHistory(DAILY_GAMES_KEYS.PALAVREADO, historyQuery.data);
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
  const [artistaHistory] = useParsedHistory(DAILY_GAMES_KEYS.ARTISTA, historyQuery.data);
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
      drawingsQuery.drawings,
    );
  }, [
    arteRuimCardsQuery,
    arteRuimHistory,
    artistaHistory,
    batchSize,
    historyQuery.isSuccess,
    arteRuimEntries,
    drawingsQuery.drawings,
  ]);

  // SET 6: Controle de Estoque
  const [controleDeEstoqueHistory] = useParsedHistory(
    DAILY_GAMES_KEYS.CONTROLE_DE_ESTOQUE,
    historyQuery.data,
  );
  const controleDeEstoqueEntries = useMemo(() => {
    if (!historyQuery.isSuccess) {
      return {};
    }

    return buildDailyControleDeEstoqueGames(batchSize, controleDeEstoqueHistory);
  }, [batchSize, historyQuery.isSuccess, controleDeEstoqueHistory]);

  // SET 7: Teoria de Conjuntos
  const [teoriaDeConjuntosHistory] = useParsedHistory(
    DAILY_GAMES_KEYS.TEORIA_DE_CONJUNTOS,
    historyQuery.data,
  );
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

  // SET 8: Comunicação Alienígena
  const [comunicacaoAlienigenaHistory] = useParsedHistory(
    DAILY_GAMES_KEYS.COMUNICACAO_ALIENIGENA,
    historyQuery.data,
  );
  const tdrAttributesQuery = useTDResource<ItemAttribute>('items-attributes', enabled);
  const tdrItemsAttributesValuesQuery = useTDResource<ItemAttributesValues>(
    'items-attribute-values',
    enabled,
  );
  // biome-ignore lint/correctness/useExhaustiveDependencies: functions shouldn't be used as dependencies
  const comunicacaoAlienigenaEntries = useMemo(() => {
    if (
      !historyQuery.isSuccess ||
      !tdrAttributesQuery.isSuccess ||
      !tdrItemsAttributesValuesQuery.isSuccess ||
      !tdrItemsQuery.isSuccess
    ) {
      return {};
    }

    return buildDailyComunicacaoAlienigenaGames(
      batchSize,
      comunicacaoAlienigenaHistory,
      tdrAttributesQuery.data,
      tdrItemsAttributesValuesQuery.data,
      tdrItemsQuery.data,
      updateWarnings,
    );
  }, [
    batchSize,
    historyQuery.isSuccess,
    comunicacaoAlienigenaHistory,
    tdrAttributesQuery,
    tdrItemsAttributesValuesQuery,
    tdrItemsQuery,
  ]);

  // STEP 7: Filmaço
  const movieSetsQuery = useTDResource<DailyMovieSet>('daily-movie-sets', enabled);
  const [filmacoHistory] = useParsedHistory(DAILY_GAMES_KEYS.FILMACO, historyQuery.data);
  const filmacoEntries = useMemo(() => {
    if (!movieSetsQuery.isSuccess || !historyQuery.isSuccess) {
      return {};
    }

    return buildDailyFilmacoGames(batchSize, filmacoHistory, movieSetsQuery.data);
  }, [movieSetsQuery, filmacoHistory, batchSize, historyQuery.isSuccess]);

  // STEP 8: Ta na Cara
  const suspectsQuery = useTDResource<SuspectCard>('suspects', enabled);
  const testimoniesQuery = useTDResource<TestimonyQuestionCard>(
    `testimony-questions-${queryLanguage}`,
    enabled,
  );
  const [taNaCaraHistory] = useParsedHistory(DAILY_GAMES_KEYS.TA_NA_CARA, historyQuery.data);
  const taNaCaraEntries = useMemo(() => {
    if (!suspectsQuery.isSuccess || !testimoniesQuery.isSuccess || !historyQuery.isSuccess) {
      return {};
    }

    return buildDailyTaNaCaraGames(batchSize, taNaCaraHistory, suspectsQuery.data, testimoniesQuery.data);
  }, [suspectsQuery, testimoniesQuery, taNaCaraHistory, batchSize, historyQuery.isSuccess]);

  // STEP N: Create entries
  const entries = useMemo(() => {
    if (arteRuimEntries.length === 0) {
      return [];
    }
    console.count('Bundling entries...');
    return arteRuimEntries.map((arteRuim) => {
      return {
        id: arteRuim.id,
        // Games
        'arte-ruim': arteRuim,
        'aqui-o': aquiOEntries[arteRuim.id],
        palavreado: palavreadoEntries[arteRuim.id],
        filmaco: filmacoEntries[arteRuim.id],
        'controle-de-estoque': controleDeEstoqueEntries[arteRuim.id],
        'teoria-de-conjuntos': teoriaDeConjuntosHistoryEntries[arteRuim.id],
        'comunicacao-alienigena': comunicacaoAlienigenaEntries[arteRuim.id],
        // Contributions
        artista: artistaEntries[arteRuim.id],
        'ta-na-cara': taNaCaraEntries[arteRuim.id],
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
    taNaCaraEntries,
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
      tdrItemsAttributesValuesQuery.isLoading ||
      suspectsQuery.isLoading ||
      testimoniesQuery.isLoading,
    entries,
    warnings,
  };
}
