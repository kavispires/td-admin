import { useTDResource } from 'hooks/useTDResource';
import { useEffect, useMemo } from 'react';
import type { Item } from 'types/tdr';
import { LANGUAGE_PREFIX } from '../utils/constants';
import { type DailyAlienadoEntry, useDailyAlienadoGames } from '../utils/games/daily-alienado';
import { type DailyAquiOEntry, useDailyAquiOGames } from '../utils/games/daily-aqui-o';
import { type DailyArteRuimEntry, useDailyArteRuimGames } from '../utils/games/daily-arte-ruim';
import { type DailyConexoesEntry, useDailyConexoesGames } from '../utils/games/daily-conexoes';
import { type DailyConjuntosEntry, useDailyConjuntosGames } from '../utils/games/daily-conjuntos';
import { type DailyEstoquistaEntry, useDailyEstoquistaGames } from '../utils/games/daily-estoquista';
import { type DailyFilmacoEntry, useDailyFilmacoGames } from '../utils/games/daily-filmaco';
import { type DailyInvestigacaoEntry, useDailyInvestigacaoGames } from '../utils/games/daily-investigacao';
import { type DailyMapeamentoEntry, useDailyMapeamentoGames } from '../utils/games/daily-mapeamento';
import { type DailyOrganikuEntry, useDailyOrganikuGames } from '../utils/games/daily-organiku';
import { type DailyPalavreadoEntry, useDailyPalavreadoGames } from '../utils/games/daily-palavreado';
import { type DailyPicacoEntry, useDailyPicacoGames } from '../utils/games/daily-picaco';
import { type DailyPortaisEntry, useDailyPortaisGames } from '../utils/games/daily-portais';
import { type DailyQuartetosEntry, useDailyQuartetosGames } from '../utils/games/daily-quartetos';
import { type DailyTaNaCaraEntry, useDailyTaNaCaraGames } from '../utils/games/daily-ta-na-cara';
import { type DailyVitralEntry, useDailyVitralGames } from '../utils/games/daily-vitral';
import type { DateKey } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';

export type DailyEntry = {
  id: DateKey;
  // Games
  'arte-ruim': DailyArteRuimEntry;
  'aqui-o': DailyAquiOEntry;
  alienado: DailyAlienadoEntry; // Renamed from 'comunicacao-alienigena'
  estoquista: DailyEstoquistaEntry; // Renamed from 'controle-de-estoque'
  investigacao: DailyInvestigacaoEntry; // Renamed from 'espionagem'
  filmaco: DailyFilmacoEntry;
  mapeamento: DailyMapeamentoEntry; // Renamed from 'mapeamento'
  organiku: DailyOrganikuEntry;
  palavreado: DailyPalavreadoEntry;
  portais: DailyPortaisEntry; // Renamed from 'portais-magicos'
  quartetos: DailyQuartetosEntry;
  conjuntos: DailyConjuntosEntry; // Renamed from 'teoria-de-conjuntos'
  vitral: DailyVitralEntry; // Renamed from 'vitrais'
  // Contributions
  picaco: DailyPicacoEntry; // Renamed from 'artista'
  conexoes: DailyConexoesEntry;
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
    // clearWarnings();
  }, [batchSize]);

  const enableBuilders = enabled && historyQuery.isSuccess;

  // GET ITEMS FOR DICTIONARY
  const tdrItemsQuery = useTDResource<Item>('items', { enabled: enableBuilders });

  // BUILD AQUI Ó
  const aquiO = useDailyAquiOGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD ARTE RUIM
  const arteRuim = useDailyArteRuimGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD ALIENADO
  const alienado = useDailyAlienadoGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD ESTOQUISTA
  const estoquista = useDailyEstoquistaGames(
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

  // BUILD CONJUNTOS
  const conjuntos = useDailyConjuntosGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD PORTAL
  const portais = useDailyPortaisGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD ORGANIKU
  const organiku = useDailyOrganikuGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD INVESTIGAÇÃO
  const investigacao = useDailyInvestigacaoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );

  // BUILD VITRAL
  const vitral = useDailyVitralGames(enableBuilders, batchSize, historyQuery.data ?? {});

  // BUILD MAPEAMENTO
  const mapeamento = useDailyMapeamentoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},
  );

  // BUILD PICAÇO
  const artista = useDailyPicacoGames(
    enableBuilders,
    queryLanguage,
    batchSize,
    historyQuery.data ?? {},

    arteRuim.entries,
  );

  // BUILD TA NA CARA
  const taNaCara = useDailyTaNaCaraGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

  // BUILD CONEXOES
  const conexoes = useDailyConexoesGames(enableBuilders, queryLanguage, batchSize, historyQuery.data ?? {});

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
        alienado: alienado.entries[arteRuim.id],
        estoquista: estoquista.entries[arteRuim.id],
        investigacao: investigacao.entries[arteRuim.id],
        filmaco: filmaco.entries[arteRuim.id],
        organiku: organiku.entries[arteRuim.id],
        palavreado: palavreado.entries[arteRuim.id],
        portais: portais.entries[arteRuim.id],
        quartetos: quartetos.entries[arteRuim.id],
        conjuntos: conjuntos.entries[arteRuim.id],
        vitral: vitral.entries[arteRuim.id],
        mapeamento: mapeamento.entries[arteRuim.id],
        // Contributions
        picaco: artista.entries[arteRuim.id],
        conexoes: conexoes.entries[arteRuim.id],
        'ta-na-cara': taNaCara.entries[arteRuim.id],
        // Additional info
        dictionary: {},
      };

      // Generate dictionary for the entry
      dailyEntry.dictionary = generateItemNamesDictionary(dailyEntry, tdrItemsQuery.data);

      return dailyEntry;
    });
  }, [
    arteRuim.entries,
    aquiO.entries,
    alienado.entries,
    estoquista.entries,
    filmaco.entries,
    organiku.entries,
    palavreado.entries,
    portais.entries,
    quartetos.entries,
    conjuntos.entries,
    artista.entries,
    conexoes.entries,
    taNaCara.entries,
    investigacao.entries,
    vitral.entries,
    mapeamento.entries,
    tdrItemsQuery.data,
  ]);

  return {
    isLoading:
      historyQuery.isLoading ||
      aquiO.isLoading ||
      arteRuim.isLoading ||
      alienado.isLoading ||
      estoquista.isLoading ||
      filmaco.isLoading ||
      palavreado.isLoading ||
      portais.isLoading ||
      quartetos.isLoading ||
      conjuntos.isLoading ||
      artista.isLoading ||
      conexoes.isLoading ||
      taNaCara.isLoading ||
      investigacao.isLoading ||
      organiku.isLoading ||
      vitral.isLoading ||
      mapeamento.isLoading ||
      tdrItemsQuery.isLoading,
    entries,
  };
}

const generateItemNamesDictionary = (entry: DailyEntry, items: Dictionary<Item>): Dictionary<string> => {
  const dictionary: Dictionary<string> = {};

  // Gather Aqui Ó items
  entry['aqui-o'].itemsIds.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });

  // Gather Alienado items
  entry.alienado.itemsIds.forEach((itemId) => {
    const item = items[itemId];
    if (item) {
      dictionary[itemId] = item.name.pt;
    }
  });
  entry.alienado.attributes.forEach((attribute) => {
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
