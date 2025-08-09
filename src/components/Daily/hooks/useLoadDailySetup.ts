import { useTDResource } from 'hooks/useTDResource';
import { useEffect, useMemo } from 'react';
import type { Item } from 'types/tdr';
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
import { type DailyEspionagemEntry, useDailyEspionagemGames } from '../utils/games/daily-espionagem';
import { type DailyFilmacoEntry, useDailyFilmacoGames } from '../utils/games/daily-filmaco';
import { type DailyOrganikuEntry, useDailyOrganikuGames } from '../utils/games/daily-organiku';
import { type DailyPalavreadoEntry, useDailyPalavreadoGames } from '../utils/games/daily-palavreado';
import {
  type DailyPortaisMagicosEntry,
  useDailyPortaisMagicosGames,
} from '../utils/games/daily-portais-magicos';
import { type DailyQuartetosEntry, useDailyQuartetosGames } from '../utils/games/daily-quartetos';
import { type DailyTaNaCaraEntry, useDailyTaNaCaraGames } from '../utils/games/daily-ta-na-cara';
import {
  type DailyTeoriaDeConjuntosEntry,
  useDailyTeoriaDeConjuntosGames,
} from '../utils/games/daily-teoria-de-conjuntos';
import type { DateKey } from '../utils/types';
import { clearWarnings } from '../utils/warnings';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';

export type DailyEntry = {
  id: DateKey;
  // Games
  'arte-ruim': DailyArteRuimEntry;
  'aqui-o': DailyAquiOEntry;
  'comunicacao-alienigena': DailyComunicacaoAlienigenaEntry;
  'controle-de-estoque': DailyControleDeEstoqueEntry;
  espionagem: DailyEspionagemEntry;
  filmaco: DailyFilmacoEntry;
  organiku: DailyOrganikuEntry;
  palavreado: DailyPalavreadoEntry;
  'portais-magicos': DailyPortaisMagicosEntry;
  quartetos: DailyQuartetosEntry;
  'teoria-de-conjuntos': DailyTeoriaDeConjuntosEntry;
  // Contributions
  artista: DailyArtistaEntry;
  'ta-na-cara': DailyTaNaCaraEntry;
  // Additional info
  dictionary: Dictionary<string>;
};

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
  batchSize: number,
): UseLoadDailySetup {
  // STEP 1: HISTORY
  const source = LANGUAGE_PREFIX.DAILY[queryLanguage ?? 'pt'];
  const historyQuery = useDailyHistoryQuery(source, { enabled });

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset warnings on change of basic props
  useEffect(() => {
    clearWarnings();
  }, [batchSize, queryLanguage]);

  const enableBuilders = enabled && historyQuery.isSuccess;

  // GET ITEMS FOR DICTIONARY
  const tdrItemsQuery = useTDResource<Item>('items', enableBuilders);

  // BUILD AQUI Ó
  const aquiO = useDailyAquiOGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD ARTE RUIM
  const arteRuim = useDailyArteRuimGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD COMUNICAÇÃO ALIENÍGENA
  const comunicacaoAlienigena = useDailyComunicacaoAlienigenaGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );

  // BUILD CONTROLE DE ESTOQUE
  const controleDeEstoque = useDailyControleDeEstoqueGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );

  // BUILD FILMAÇO
  const filmaco = useDailyFilmacoGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD PALAVREADO
  const palavreado = useDailyPalavreadoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );

  // BUILD QUARTETOS
  const quartetos = useDailyQuartetosGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD TEORIA DE CONJUNTOS
  const teoriaDeConjuntos = useDailyTeoriaDeConjuntosGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );

  // BUILD PORTAIS MAGICOS
  const portaisMagicos = useDailyPortaisMagicosGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );

  // BUILD ORGANIKU
  const organiku = useDailyOrganikuGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD ESPIONAGEM
  const espionagem = useDailyEspionagemGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );

  // BUILD ARTISTA
  const artista = useDailyArtistaGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},

    arteRuim.entries,
  );

  // BUILD TA NA CARA
  const taNaCara = useDailyTaNaCaraGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // STEP N: Create entries
  const entries = useMemo(() => {
    if (arteRuim.entries.length === 0) {
      return [];
    }
    console.count('Bundling entries...');
    return arteRuim.entries.map((arteRuim) => {
      const dailyEntry = {
        id: arteRuim.id,
        // Games
        'arte-ruim': arteRuim,
        'aqui-o': aquiO.entries[arteRuim.id],
        'comunicacao-alienigena': comunicacaoAlienigena.entries[arteRuim.id],
        'controle-de-estoque': controleDeEstoque.entries[arteRuim.id],
        espionagem: espionagem.entries[arteRuim.id],
        filmaco: filmaco.entries[arteRuim.id],
        organiku: organiku.entries[arteRuim.id],
        palavreado: palavreado.entries[arteRuim.id],
        'portais-magicos': portaisMagicos.entries[arteRuim.id],
        quartetos: quartetos.entries[arteRuim.id],
        'teoria-de-conjuntos': teoriaDeConjuntos.entries[arteRuim.id],
        // Contributions
        artista: artista.entries[arteRuim.id],
        'ta-na-cara': taNaCara.entries[arteRuim.id],
        // Additional info
        dictionary: {},
      };

      // Generate dictionary for the entry
      dailyEntry.dictionary = generateDictionary(dailyEntry, tdrItemsQuery.data);

      return dailyEntry;
    });
  }, [
    arteRuim.entries,
    aquiO.entries,
    comunicacaoAlienigena.entries,
    controleDeEstoque.entries,
    filmaco.entries,
    organiku.entries,
    palavreado.entries,
    portaisMagicos.entries,
    quartetos.entries,
    teoriaDeConjuntos.entries,
    artista.entries,
    taNaCara.entries,
    espionagem.entries,
    tdrItemsQuery.data,
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
      portaisMagicos.isLoading ||
      quartetos.isLoading ||
      teoriaDeConjuntos.isLoading ||
      artista.isLoading ||
      taNaCara.isLoading ||
      espionagem.isLoading ||
      organiku.isLoading ||
      tdrItemsQuery.isLoading,
    entries,
  };
}

const generateDictionary = (entry: DailyEntry, items: Dictionary<Item>): Dictionary<string> => {
  const dictionary: Dictionary<string> = {};

  // Gather Aqui Ó items
  entry['aqui-o'].itemsIds.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });

  // Gather Comunicacao Alienigena items
  entry['comunicacao-alienigena'].itemsIds.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });
  entry['comunicacao-alienigena'].attributes.forEach((attribute) => {
    attribute.itemsIds.forEach((itemId) => {
      const item = items[itemId];
      if (item) {
        dictionary[itemId] = item.name.pt;
      }
    });
  });

  // Gather Filmaço items
  entry.filmaco.itemsIds.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });

  // Gather Quartetos items
  entry.quartetos.grid.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });

  // Gather Organiku items
  entry.organiku.itemsIds.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });

  return dictionary;
};
