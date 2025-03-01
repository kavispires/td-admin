import { useCallback, useEffect, useMemo, useState } from 'react';
import { LANGUAGE_PREFIX } from '../utils/constants';
import { type DailyAquiOEntry, useDailyAquiOGames } from '../utils/games/daily-aqui-o';
import { type DailyArteRuimEntry, useDailyArteRuimGames } from '../utils/games/daily-arte-ruim';
import { type DailyArtistaEntry, useDailyArtistaGames } from '../utils/games/daily-artista';
import {
  type DailyComunicacaoAlienigenaEntry,
  useDailyComunicacaoAlienigenaGames,
} from '../utils/games/daily-comunicacao-alienigena';
import {
  type DailyControleDeEstoqueEntry,
  useDailyControleDeEstoqueGames,
} from '../utils/games/daily-controle-de-estoque';
import { type DailyFilmacoEntry, useDailyFilmacoGames } from '../utils/games/daily-filmaco';
import { type DailyPalavreadoEntry, useDailyPalavreadoGames } from '../utils/games/daily-palavreado';
import { useDailyPortaisMagicosGames } from '../utils/games/daily-portais-magicos';
import { type DailyQuartetosEntry, useDailyQuartetosGames } from '../utils/games/daily-quartetos';
import { type DailyTaNaCaraEntry, useDailyTaNaCaraGames } from '../utils/games/daily-ta-na-cara';
import {
  type DailyTeoriaDeConjuntosEntry,
  useDailyTeoriaDeConjuntosGames,
} from '../utils/games/daily-teoria-de-conjuntos';
import type { DateKey } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';

export type DailyEntry = {
  id: DateKey;
  // Games
  'arte-ruim': DailyArteRuimEntry;
  'aqui-o': DailyAquiOEntry;
  'comunicacao-alienigena': DailyComunicacaoAlienigenaEntry;
  'controle-de-estoque': DailyControleDeEstoqueEntry;
  filmaco: DailyFilmacoEntry;
  palavreado: DailyPalavreadoEntry;
  quartetos: DailyQuartetosEntry;
  'teoria-de-conjuntos': DailyTeoriaDeConjuntosEntry;
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
  batchSize: number,
): UseLoadDailySetup {
  // STEP 1: HISTORY
  const source = LANGUAGE_PREFIX.DAILY[queryLanguage ?? 'pt'];
  const historyQuery = useDailyHistoryQuery(source, { enabled });
  const [warnings, setWarnings] = useState<string[]>([]);

  const updateWarnings = useCallback((newWarning: string) => {
    setWarnings((prev) => [...prev, newWarning]);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset warnings on change of basic props
  useEffect(() => {
    setWarnings([]);
  }, [batchSize, queryLanguage]);

  const enableBuilders = enabled && historyQuery.isSuccess;

  // BUILD AQUI Ó
  const aquiO = useDailyAquiOGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );

  // BUILD ARTE RUIM
  const arteRuim = useDailyArteRuimGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );

  // BUILD COMUNICAÇÃO ALIENÍGENA
  const comunicacaoAlienigena = useDailyComunicacaoAlienigenaGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );

  // BUILD CONTROLE DE ESTOQUE
  const controleDeEstoque = useDailyControleDeEstoqueGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );

  // BUILD FILMAÇO
  const filmaco = useDailyFilmacoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );

  // BUILD PALAVREADO
  const palavreado = useDailyPalavreadoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );

  // QUARTETOS
  const quartetos = useDailyQuartetosGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );

  // BUILD TEORIA DE CONJUNTOS
  const teoriaDeConjuntos = useDailyTeoriaDeConjuntosGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );

  // BUILD PORTAIS MAGICOS
  const portaisMagicos = useDailyPortaisMagicosGames(
    // enableBuilders,
    false,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );
  console.log(portaisMagicos);

  // BUILD ARTISTA
  const artista = useDailyArtistaGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
    arteRuim.entries,
  );

  // BUILD TA NA CARA
  const taNaCara = useDailyTaNaCaraGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    updateWarnings,
  );

  // STEP N: Create entries
  const entries = useMemo(() => {
    if (arteRuim.entries.length === 0) {
      return [];
    }
    console.count('Bundling entries...');
    return arteRuim.entries.map((arteRuim) => {
      return {
        id: arteRuim.id,
        // Games
        'arte-ruim': arteRuim,
        'aqui-o': aquiO.entries[arteRuim.id],
        'comunicacao-alienigena': comunicacaoAlienigena.entries[arteRuim.id],
        'controle-de-estoque': controleDeEstoque.entries[arteRuim.id],
        filmaco: filmaco.entries[arteRuim.id],
        palavreado: palavreado.entries[arteRuim.id],
        quartetos: quartetos.entries[arteRuim.id],
        'teoria-de-conjuntos': teoriaDeConjuntos.entries[arteRuim.id],
        // Contributions
        artista: artista.entries[arteRuim.id],
        'ta-na-cara': taNaCara.entries[arteRuim.id],
      };
    });
  }, [
    arteRuim.entries,
    aquiO.entries,
    filmaco.entries,
    comunicacaoAlienigena.entries,
    controleDeEstoque.entries,
    palavreado.entries,
    quartetos.entries,
    teoriaDeConjuntos.entries,
    artista.entries,
    taNaCara.entries,
  ]);

  return {
    isLoading:
      historyQuery.isLoading ||
      aquiO.isLoading ||
      arteRuim.isLoading ||
      comunicacaoAlienigena.isLoading ||
      controleDeEstoque.isLoading ||
      filmaco.isLoading ||
      palavreado.isLoading ||
      quartetos.isLoading ||
      teoriaDeConjuntos.isLoading ||
      artista.isLoading ||
      taNaCara.isLoading,
    entries,
    warnings,
  };
}
