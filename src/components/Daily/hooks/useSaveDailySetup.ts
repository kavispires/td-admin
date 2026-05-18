import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { firestore } from 'services/firebase';
import { removeDuplicates } from 'utils';
import { DAILY_GAMES_KEYS, LANGUAGE_PREFIX } from '../utils/constants';
import type { DailyAlienadoEntry } from '../utils/games/daily-alienado';
import type { DailyAquiOEntry } from '../utils/games/daily-aqui-o';
import type { DailyArteRuimEntry } from '../utils/games/daily-arte-ruim';
import type { DailyConjuntosEntry } from '../utils/games/daily-conjuntos';
import type { DailyFilmacoEntry } from '../utils/games/daily-filmaco';
import type { DailyInvestigacaoEntry } from '../utils/games/daily-investigacao';
import type { DailyMapeamentoEntry } from '../utils/games/daily-mapeamento';
import type { DailyPalavreadoEntry } from '../utils/games/daily-palavreado';
import type { DailyPortaisEntry } from '../utils/games/daily-portais';
import type { DailyQuartetosEntry } from '../utils/games/daily-quartetos';
import { gatherUsedTaNaCaraEntries } from '../utils/games/daily-ta-na-cara';
import type { DailyVitralEntry } from '../utils/games/daily-vitral';
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

        [DAILY_GAMES_KEYS.PICACO]: updateHistory(DAILY_GAMES_KEYS.PICACO, previousHistory, data, null),

        [DAILY_GAMES_KEYS.ALIENADO]: updateHistory(
          DAILY_GAMES_KEYS.ALIENADO,
          previousHistory,
          data,
          (e: DailyAlienadoEntry) => e.setId,
        ),

        [DAILY_GAMES_KEYS.ESTOQUISTA]: updateHistory(
          DAILY_GAMES_KEYS.ESTOQUISTA,
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

        [DAILY_GAMES_KEYS.PORTAIS]: updateHistory(
          DAILY_GAMES_KEYS.PORTAIS,
          previousHistory,
          data,
          (e: DailyPortaisEntry) => e.corridors.map((c) => c.passcode),
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

        [DAILY_GAMES_KEYS.CONJUNTOS]: updateHistory(
          DAILY_GAMES_KEYS.CONJUNTOS,
          previousHistory,
          data,
          (e: DailyConjuntosEntry) => [e.intersectingThing.id, e.setId],
        ),

        [DAILY_GAMES_KEYS.MAPEAMENTO]: updateHistory(
          DAILY_GAMES_KEYS.MAPEAMENTO,
          previousHistory,
          data,
          (e: DailyMapeamentoEntry) => e.setId,
        ),

        [DAILY_GAMES_KEYS.ORGANIKU]: updateHistory(
          DAILY_GAMES_KEYS.ORGANIKU,
          previousHistory,
          data,
          (e: DailyConjuntosEntry) => e.setId,
        ),

        [DAILY_GAMES_KEYS.INVESTIGACAO]: updateHistory(
          DAILY_GAMES_KEYS.INVESTIGACAO,
          previousHistory,
          data,
          (e: DailyInvestigacaoEntry) => e.culpritId,
        ),

        [DAILY_GAMES_KEYS.VITRAL]: updateHistory(
          DAILY_GAMES_KEYS.VITRAL,
          previousHistory,
          data,
          (e: DailyVitralEntry) => e.cardId,
        ),

        [DAILY_GAMES_KEYS.CONEXOES]: updateHistory(DAILY_GAMES_KEYS.CONEXOES, previousHistory, data, null),
      };

      setDoc(historyDocRec, newHistory);

      return Promise.all(saves);
    },

    onSuccess: () => {
      notification.info({
        title: 'Data saved',
        placement: 'bottomLeft',
      });
      queryClient.invalidateQueries({
        queryKey: [source, 'history'],
      });
      setIsDirty(false);
    },

    onError: () => {
      notification.error({
        title: 'Error saving data',
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
      removeDuplicates([...previouslyUsed, ...data.map((e) => e[key]).map(parser)])
        .flat()
        .sort(),
    ),
  };
};
