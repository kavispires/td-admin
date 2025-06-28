import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { firestore } from 'services/firebase';
import { removeDuplicates } from 'utils';
import { DAILY_GAMES_KEYS, LANGUAGE_PREFIX } from '../utils/constants';
import type { DailyAquiOEntry } from '../utils/games/daily-aqui-o';
import type { DailyArteRuimEntry } from '../utils/games/daily-arte-ruim';
import type { DailyComunicacaoAlienigenaEntry } from '../utils/games/daily-comunicacao-alienigena';
import type { DailyEspionagemEntry } from '../utils/games/daily-espionagem';
import type { DailyFilmacoEntry } from '../utils/games/daily-filmaco';
import type { DailyPalavreadoEntry } from '../utils/games/daily-palavreado';
import type { DailyPortaisMagicosEntry } from '../utils/games/daily-portais-magicos';
import type { DailyQuartetosEntry } from '../utils/games/daily-quartetos';
import { gatherUsedTaNaCaraEntries } from '../utils/games/daily-ta-na-cara';
import type { DailyTeoriaDeConjuntosEntry } from '../utils/games/daily-teoria-de-conjuntos';
import type { DailyHistory, DailyHistoryEntry } from '../utils/types';
import { useDailyHistoryQuery } from './useDailyHistoryQuery';

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

  const historyQuery = useDailyHistoryQuery(source, { enabled: Boolean(source) });

  const mutation = useMutation({
    mutationFn: async (data: any[]) => {
      const saves = data.map((entry) => {
        const docRef = doc(firestore, `${source}/${entry.id}`);
        return setDoc(docRef, entry);
      });

      const historyDocRec = doc(firestore, `${source}/history`);
      const previousHistory = historyQuery.data;

      if (!previousHistory) {
        throw new Error('No previous history');
      }

      const newHistory: DailyHistory = {
        ...previousHistory,

        [DAILY_GAMES_KEYS.AQUI_O]: updateHistory(
          DAILY_GAMES_KEYS.AQUI_O,
          previousHistory,
          data,
          (e: DailyAquiOEntry) => e.setId,
        ),

        [DAILY_GAMES_KEYS.ARTE_RUIM]: updateHistory(
          DAILY_GAMES_KEYS.ARTE_RUIM,
          previousHistory,
          data,
          (e: DailyArteRuimEntry) => e.cardId,
        ),

        [DAILY_GAMES_KEYS.ARTISTA]: updateHistory(DAILY_GAMES_KEYS.ARTISTA, previousHistory, data, null),

        [DAILY_GAMES_KEYS.COMUNICACAO_ALIENIGENA]: updateHistory(
          DAILY_GAMES_KEYS.COMUNICACAO_ALIENIGENA,
          previousHistory,
          data,
          (e: DailyComunicacaoAlienigenaEntry) => e.setId,
        ),

        [DAILY_GAMES_KEYS.CONTROLE_DE_ESTOQUE]: updateHistory(
          DAILY_GAMES_KEYS.CONTROLE_DE_ESTOQUE,
          previousHistory,
          data,
          null,
        ),

        [DAILY_GAMES_KEYS.FILMACO]: updateHistory(
          DAILY_GAMES_KEYS.FILMACO,
          previousHistory,
          data,
          (e: DailyFilmacoEntry) => e.setId,
        ),

        [DAILY_GAMES_KEYS.PALAVREADO]: updateHistory(
          DAILY_GAMES_KEYS.PALAVREADO,
          previousHistory,
          data,
          (e: DailyPalavreadoEntry) => e.keyword,
        ),

        [DAILY_GAMES_KEYS.PORTAIS_MAGICOS]: updateHistory(
          DAILY_GAMES_KEYS.PORTAIS_MAGICOS,
          previousHistory,
          data,
          (e: DailyPortaisMagicosEntry) => e.corridors.map((c) => c.passcode),
        ),

        [DAILY_GAMES_KEYS.TA_NA_CARA]: updateHistory(
          DAILY_GAMES_KEYS.TA_NA_CARA,
          previousHistory,
          data,
          null,
          gatherUsedTaNaCaraEntries,
        ),

        [DAILY_GAMES_KEYS.QUARTETOS]: updateHistory(
          DAILY_GAMES_KEYS.QUARTETOS,
          previousHistory,
          data,
          (e: DailyQuartetosEntry) => e.sets.map((set) => set.id),
        ),

        [DAILY_GAMES_KEYS.TEORIA_DE_CONJUNTOS]: updateHistory(
          DAILY_GAMES_KEYS.TEORIA_DE_CONJUNTOS,
          previousHistory,
          data,
          (e: DailyTeoriaDeConjuntosEntry) => [e.intersectingThing.id, e.setId],
        ),

        [DAILY_GAMES_KEYS.ORGANIKU]: updateHistory(
          DAILY_GAMES_KEYS.ORGANIKU,
          previousHistory,
          data,
          (e: DailyTeoriaDeConjuntosEntry) => e.setId,
        ),

        [DAILY_GAMES_KEYS.ESPIONAGEM]: updateHistory(
          DAILY_GAMES_KEYS.ESPIONAGEM,
          previousHistory,
          data,
          (e: DailyEspionagemEntry) => e.culpritId,
        ),
      };

      setDoc(historyDocRec, newHistory);

      return Promise.all(saves);
    },

    onSuccess: () => {
      notification.info({
        message: 'Data saved',
        placement: 'bottomLeft',
      });
      queryClient.invalidateQueries({
        queryKey: [source, 'history'],
      });
      setIsDirty(false);
    },

    onError: () => {
      notification.error({
        message: 'Error saving data',
        placement: 'bottomLeft',
      });
    },
  });

  return {
    isDirty,
    setIsDirty,
    save: mutation.mutateAsync,
    isPending: mutation.isPending,
  };
}

/**
 * Updates the daily history entry for a specific key with new data.
 * @param key - The key in the history object to update.
 * @param previousHistory - The previous daily history object.
 * @param data - An array of new data entries to process.
 * @param parser - A function to parse each data entry, or `null` if no parsing is needed.
 * @param replacingParser - (Optional) A function to replace the used history with a new array based on previous and current data.
 * @returns The updated daily history entry for the specified key.
 */
const updateHistory = (
  key: string,
  previousHistory: DailyHistory,
  data: any[],
  parser: ((args: any) => any) | null,
  // key: keyof typeof DAILY_GAMES_KEYS,
  replacingParser?: (previousHistory: string[], currentData: any[]) => string[],
): DailyHistoryEntry => {
  const previouslyUsed: string[] = JSON.parse(previousHistory[key]?.used ?? '[]');

  if (replacingParser) {
    return {
      latestDate: data[data.length - 1].id,
      latestNumber: data[data.length - 1][key].number,
      used: JSON.stringify(
        replacingParser(
          previouslyUsed,
          data.map((e) => e[key]),
        ),
      ),
    };
  }

  if (parser === null) {
    return {
      latestDate: data[data.length - 1].id,
      latestNumber: data[data.length - 1][key].number,
      used: '[]',
    };
  }

  return {
    latestDate: data[data.length - 1].id,
    latestNumber: data[data.length - 1][key].number,
    used: JSON.stringify(
      removeDuplicates([...previouslyUsed, ...data.map((e) => e[key]).map(parser)]).flat(),
    ),
  };
};
