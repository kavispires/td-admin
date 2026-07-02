import { useTDResource } from '@hooks/useTDResource';
import type { ItemData } from '@types';
import { useMemo } from 'react';

import { LANGUAGE_PREFIX } from '../utils/constants';
import { type DailyAlienadoEntry, useDailyAlienadoGames } from '../utils/games/daily-alienado';
import { type DailyAquiOEntry, useDailyAquiOGames } from '../utils/games/daily-aqui-o';
import { type DailyArteRuimEntry, useDailyArteRuimGames } from '../utils/games/daily-arte-ruim';
import { type DailyConjuntosEntry, useDailyConjuntosGames } from '../utils/games/daily-conjuntos';
import { type DailyFilmacoEntry, useDailyFilmacoGames } from '../utils/games/daily-filmaco';
import { type DailyInvestigacaoEntry, useDailyInvestigacaoGames } from '../utils/games/daily-investigacao';
import { type DailyMapeamentoEntry, useDailyMapeamentoGames } from '../utils/games/daily-mapeamento';
import { type DailyOrganikuEntry, useDailyOrganikuGames } from '../utils/games/daily-organiku';
import { type DailyPalavreadoEntry, useDailyPalavreadoGames } from '../utils/games/daily-palavreado';
import { type DailyPicacoEntry, useDailyPicacoGames } from '../utils/games/daily-picaco';
import { type DailyPirralhosEntry, useDailyPirralhosGames } from '../utils/games/daily-pirralhos';
import { type DailyPortaisEntry, useDailyPortaisGames } from '../utils/games/daily-portais';
import { type DailyQuartetosEntry, useDailyQuartetosGames } from '../utils/games/daily-quartetos';
import { type DailyTaNaCaraEntry, useDailyTaNaCaraGames } from '../utils/games/daily-ta-na-cara';
import { type DailyVitralEntry, useDailyVitralGames } from '../utils/games/daily-vitral';
import type { DateKey, UseDailyGeneratorResponse } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';

type GamesEntries = {
  'arte-ruim': DailyArteRuimEntry;
  'aqui-o': DailyAquiOEntry;
  alienado: DailyAlienadoEntry;
  investigacao: DailyInvestigacaoEntry;
  filmaco: DailyFilmacoEntry;
  mapeamento: DailyMapeamentoEntry;
  organiku: DailyOrganikuEntry;
  palavreado: DailyPalavreadoEntry;
  portais: DailyPortaisEntry;
  quartetos: DailyQuartetosEntry;
  conjuntos: DailyConjuntosEntry;
  vitral: DailyVitralEntry;
  pirralhos: DailyPirralhosEntry;
  // Contributions
  picaco: DailyPicacoEntry;
  'ta-na-cara': DailyTaNaCaraEntry;
};

export type DailyEntry = {
  id: DateKey;
  // Games
  // Additional info
  dictionary: Dictionary<string>;
} & GamesEntries;

// Extracted the history payload type from our standard response
type HistoryPayload = UseDailyGeneratorResponse<GamesEntries[keyof GamesEntries]>['historyUpdate'];

export type DailyHistoryUpdates = {
  'arte-ruim': HistoryPayload;
  'aqui-o': HistoryPayload;
  alienado: HistoryPayload;
  investigacao: HistoryPayload;
  filmaco: HistoryPayload;
  mapeamento: HistoryPayload;
  organiku: HistoryPayload;
  palavreado: HistoryPayload;
  portais: HistoryPayload;
  quartetos: HistoryPayload;
  conjuntos: HistoryPayload;
  vitral: HistoryPayload;
  pirralhos: HistoryPayload;
  picaco: HistoryPayload;
  'ta-na-cara': HistoryPayload;
};

export type UseLoadDailySetupResponse = {
  isLoading: boolean;
  isGenerating: boolean;
  isError: boolean;
  isSuccess: boolean;
  errors: string[];
  entries: DailyEntry[];
  historyUpdates: DailyHistoryUpdates;
  /**
   * A boolean indicating whether there are any missing entries in the generated data.
   */
  isMissingEntries: boolean;
  /**
   * An array of IDs of the generated entries that are missing or incomplete.
   */
  missingEntries: string[];
};

/**
 * Custom hook for loading daily setup data.
 */
export function useLoadDailySetup(
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
): UseLoadDailySetupResponse {
  // STEP 1: HISTORY
  const source = LANGUAGE_PREFIX.DAILY[queryLanguage ?? 'pt'];
  const historyQuery = useDailyHistoryQuery(source, { enabled });

  const enableBuilders = enabled && historyQuery.isSuccess;

  // GET ITEMS FOR DICTIONARY
  const tdrItemsQuery = useTDResource<ItemData>('items', { enabled: enableBuilders });

  // BUILD GAMES
  const aquiO = useDailyAquiOGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});
  const arteRuim = useDailyArteRuimGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});
  const alienado = useDailyAlienadoGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});
  const filmaco = useDailyFilmacoGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});
  const palavreado = useDailyPalavreadoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );
  const quartetos = useDailyQuartetosGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});
  const conjuntos = useDailyConjuntosGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});
  const portais = useDailyPortaisGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});
  const organiku = useDailyOrganikuGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});
  const investigacao = useDailyInvestigacaoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );
  const vitral = useDailyVitralGames(enableBuilders, batchSize, historyQuery.data ?? {});
  const mapeamento = useDailyMapeamentoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );
  const pirralhos = useDailyPirralhosGames(enableBuilders, batchSize, historyQuery.data ?? {});
  const taNaCara = useDailyTaNaCaraGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  const picaco = useDailyPicacoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
    arteRuim.entries, // This is now a Record/Dictionary as required
  );

  // STEP N: Create entries bundle
  const entries = useMemo(() => {
    const dates = Object.keys(arteRuim.entries).sort();

    if (dates.length === 0) {
      return [];
    }

    // biome-ignore lint/suspicious/noConsole: on purpose
    console.count('Bundling entries...');

    return dates.map((id) => {
      const dailyEntry: DailyEntry = {
        id,
        // Games
        'arte-ruim': arteRuim.entries[id],
        'aqui-o': aquiO.entries[id],
        alienado: alienado.entries[id],
        investigacao: investigacao.entries[id],
        filmaco: filmaco.entries[id],
        organiku: organiku.entries[id],
        palavreado: palavreado.entries[id],
        portais: portais.entries[id],
        quartetos: quartetos.entries[id],
        conjuntos: conjuntos.entries[id],
        vitral: vitral.entries[id],
        mapeamento: mapeamento.entries[id],
        pirralhos: pirralhos.entries[id],
        // Contributions
        picaco: picaco.entries[id],
        'ta-na-cara': taNaCara.entries[id],
        // Additional info
        dictionary: {},
      };

      // Generate dictionary for the entry
      // Using fallback `{}` in case items are still loading so it doesn't crash
      dailyEntry.dictionary = generateItemNamesDictionary(dailyEntry, tdrItemsQuery.data ?? {});

      return dailyEntry;
    });
  }, [
    arteRuim.entries,
    aquiO.entries,
    alienado.entries,
    filmaco.entries,
    organiku.entries,
    palavreado.entries,
    portais.entries,
    quartetos.entries,
    conjuntos.entries,
    picaco.entries,
    taNaCara.entries,
    investigacao.entries,
    vitral.entries,
    mapeamento.entries,
    pirralhos.entries,
    tdrItemsQuery.data,
  ]);

  // STEP N+1: Aggregate History Updates
  const historyUpdates: DailyHistoryUpdates = useMemo(
    () => ({
      'arte-ruim': arteRuim.historyUpdate,
      'aqui-o': aquiO.historyUpdate,
      alienado: alienado.historyUpdate,
      investigacao: investigacao.historyUpdate,
      filmaco: filmaco.historyUpdate,
      mapeamento: mapeamento.historyUpdate,
      organiku: organiku.historyUpdate,
      palavreado: palavreado.historyUpdate,
      portais: portais.historyUpdate,
      quartetos: quartetos.historyUpdate,
      conjuntos: conjuntos.historyUpdate,
      vitral: vitral.historyUpdate,
      pirralhos: pirralhos.historyUpdate,
      picaco: picaco.historyUpdate,
      'ta-na-cara': taNaCara.historyUpdate,
    }),
    [
      arteRuim.historyUpdate,
      aquiO.historyUpdate,
      alienado.historyUpdate,
      investigacao.historyUpdate,
      filmaco.historyUpdate,
      mapeamento.historyUpdate,
      organiku.historyUpdate,
      palavreado.historyUpdate,
      portais.historyUpdate,
      quartetos.historyUpdate,
      conjuntos.historyUpdate,
      vitral.historyUpdate,
      pirralhos.historyUpdate,
      picaco.historyUpdate,
      taNaCara.historyUpdate,
    ],
  );

  // STEP N+2: Aggregate Errors with prefixes
  const errors = useMemo(
    () => [
      ...arteRuim.errors.map((e) => `[Arte Ruim] ${e}`),
      ...aquiO.errors.map((e) => `[Aqui Ó] ${e}`),
      ...alienado.errors.map((e) => `[Alienado] ${e}`),
      ...investigacao.errors.map((e) => `[Investigação] ${e}`),
      ...filmaco.errors.map((e) => `[Filmaço] ${e}`),
      ...mapeamento.errors.map((e) => `[Mapeamento] ${e}`),
      ...organiku.errors.map((e) => `[Organiku] ${e}`),
      ...palavreado.errors.map((e) => `[Palavreado] ${e}`),
      ...portais.errors.map((e) => `[Portais] ${e}`),
      ...quartetos.errors.map((e) => `[Quartetos] ${e}`),
      ...conjuntos.errors.map((e) => `[Conjuntos] ${e}`),
      ...vitral.errors.map((e) => `[Vitral] ${e}`),
      ...pirralhos.errors.map((e) => `[Pirralhos] ${e}`),
      ...picaco.errors.map((e) => `[Picaço] ${e}`),
      ...taNaCara.errors.map((e) => `[Tá Na Cara] ${e}`),
    ],
    [
      arteRuim.errors,
      aquiO.errors,
      alienado.errors,
      investigacao.errors,
      filmaco.errors,
      mapeamento.errors,
      organiku.errors,
      palavreado.errors,
      portais.errors,
      quartetos.errors,
      conjuntos.errors,
      vitral.errors,
      pirralhos.errors,
      picaco.errors,
      taNaCara.errors,
    ],
  );

  const isLoading =
    historyQuery.isLoading ||
    tdrItemsQuery.isLoading ||
    arteRuim.isLoading ||
    aquiO.isLoading ||
    alienado.isLoading ||
    filmaco.isLoading ||
    palavreado.isLoading ||
    portais.isLoading ||
    quartetos.isLoading ||
    conjuntos.isLoading ||
    picaco.isLoading ||
    taNaCara.isLoading ||
    investigacao.isLoading ||
    organiku.isLoading ||
    vitral.isLoading ||
    mapeamento.isLoading ||
    pirralhos.isLoading;

  const isGenerating =
    arteRuim.isGenerating ||
    aquiO.isGenerating ||
    alienado.isGenerating ||
    filmaco.isGenerating ||
    palavreado.isGenerating ||
    portais.isGenerating ||
    quartetos.isGenerating ||
    conjuntos.isGenerating ||
    picaco.isGenerating ||
    taNaCara.isGenerating ||
    investigacao.isGenerating ||
    organiku.isGenerating ||
    vitral.isGenerating ||
    mapeamento.isGenerating ||
    pirralhos.isGenerating;

  const isError =
    historyQuery.isError ||
    tdrItemsQuery.isError ||
    arteRuim.isError ||
    aquiO.isError ||
    alienado.isError ||
    filmaco.isError ||
    palavreado.isError ||
    portais.isError ||
    quartetos.isError ||
    conjuntos.isError ||
    picaco.isError ||
    taNaCara.isError ||
    investigacao.isError ||
    organiku.isError ||
    vitral.isError ||
    mapeamento.isError ||
    pirralhos.isError;

  // STEP N+3: Check for missing entries
  const { isMissingEntries, missingEntries } = useMemo(() => {
    const missing: string[] = [];

    entries.forEach((entry) => {
      if (
        !entry.id ||
        !entry['arte-ruim'] ||
        !entry['aqui-o'] ||
        !entry.alienado ||
        !entry.investigacao ||
        !entry.filmaco ||
        !entry.organiku ||
        !entry.palavreado ||
        !entry.portais ||
        !entry.quartetos ||
        !entry.conjuntos ||
        !entry.vitral ||
        !entry.mapeamento ||
        !entry.pirralhos ||
        !entry.picaco ||
        !entry['ta-na-cara']
      ) {
        missing.push(entry.id);
      }
    });

    return {
      isMissingEntries: missing.length > 0,
      missingEntries: missing,
    };
  }, [entries]);

  return {
    isLoading,
    isGenerating,
    isError,
    isSuccess: entries.length > 0 && !isLoading && !isGenerating,
    errors,
    entries,
    historyUpdates,
    isMissingEntries,
    missingEntries,
  };
}

const generateItemNamesDictionary = (entry: DailyEntry, items: Dictionary<ItemData>): Dictionary<string> => {
  const dictionary: Dictionary<string> = {};

  // Gather Aqui Ó items
  entry['aqui-o']?.itemsIds?.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });

  // Gather Alienado items
  entry.alienado?.itemsIds?.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });
  entry.alienado?.attributes?.forEach((attribute) => {
    attribute.itemsIds.forEach((itemId) => {
      const item = items[itemId];
      if (item) {
        dictionary[itemId] = item.name.pt;
      }
    });
  });

  // Gather Filmaço items
  entry.filmaco?.itemsIds?.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });

  // Gather Quartetos items
  entry.quartetos?.grid?.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });

  // Gather Organiku items
  entry.organiku?.itemsIds?.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });

  return dictionary;
};
