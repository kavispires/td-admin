import { useMutation, useQueryClient } from '@tanstack/react-query';
import { App } from 'antd';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { firestore } from 'services/firebase';
import { removeDuplicates } from 'utils';
import { DAILY_GAMES_KEYS, LANGUAGE_PREFIX } from '../utils/constants';
import { gatherUsedQuartetosEntries } from '../utils/games/daily-quartetos';
import { gatherUsedTaNaCaraEntries } from '../utils/games/daily-ta-na-cara';
import type { DailyHistory } from '../utils/types';
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

      const docRec = doc(firestore, `${source}/history`);
      const previousHistory = historyQuery.data;

      if (!previousHistory) {
        throw new Error('No previous history');
      }

      const newHistory: DailyHistory = {
        ...previousHistory,
        [DAILY_GAMES_KEYS.ARTE_RUIM]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.ARTE_RUIM].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory[DAILY_GAMES_KEYS.ARTE_RUIM].used),
              ...data.map((e) => e[DAILY_GAMES_KEYS.ARTE_RUIM].cardId),
            ]),
          ),
        },
        [DAILY_GAMES_KEYS.AQUI_O]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.AQUI_O].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory[DAILY_GAMES_KEYS.AQUI_O].used ?? '[]'),
              ...data.map((e) => e[DAILY_GAMES_KEYS.AQUI_O].setId),
            ]),
          ),
        },
        [DAILY_GAMES_KEYS.PALAVREADO]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.PALAVREADO].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory.palavreado.used),
              ...data.map((e) => e[DAILY_GAMES_KEYS.PALAVREADO].keyword),
            ]),
          ),
        },
        [DAILY_GAMES_KEYS.ARTISTA]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.ARTISTA].number,
          used: '[]',
        },
        [DAILY_GAMES_KEYS.FILMACO]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.FILMACO].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory?.[DAILY_GAMES_KEYS.FILMACO]?.used ?? '[]'),
              ...data.map((e) => e[DAILY_GAMES_KEYS.FILMACO].setId),
            ]),
          ),
        },
        [DAILY_GAMES_KEYS.CONTROLE_DE_ESTOQUE]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.CONTROLE_DE_ESTOQUE].number,
          used: '[]',
        },
        [DAILY_GAMES_KEYS.TEORIA_DE_CONJUNTOS]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.TEORIA_DE_CONJUNTOS].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory?.[DAILY_GAMES_KEYS.TEORIA_DE_CONJUNTOS]?.used ?? '[]'),
              ...data.map((e) => e[DAILY_GAMES_KEYS.TEORIA_DE_CONJUNTOS].setId),
              ...data.map((e) => e[DAILY_GAMES_KEYS.TEORIA_DE_CONJUNTOS].intersectingThing.id),
            ]),
          ),
        },
        [DAILY_GAMES_KEYS.COMUNICACAO_ALIENIGENA]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.COMUNICACAO_ALIENIGENA].number,
          used: JSON.stringify(
            removeDuplicates([
              ...JSON.parse(previousHistory?.[DAILY_GAMES_KEYS.COMUNICACAO_ALIENIGENA]?.used ?? '[]'),
              ...data.map((e) => e[DAILY_GAMES_KEYS.COMUNICACAO_ALIENIGENA].setId),
            ]),
          ),
        },
        [DAILY_GAMES_KEYS.QUARTETOS]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.QUARTETOS].number,
          used: JSON.stringify(
            gatherUsedQuartetosEntries(
              JSON.parse(previousHistory?.[DAILY_GAMES_KEYS.QUARTETOS]?.used ?? '[]'),
              data.map((e) => e[DAILY_GAMES_KEYS.QUARTETOS]),
            ),
          ),
        },
        [DAILY_GAMES_KEYS.TA_NA_CARA]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.TA_NA_CARA].number,
          used: JSON.stringify(
            gatherUsedTaNaCaraEntries(
              JSON.parse(previousHistory?.[DAILY_GAMES_KEYS.TA_NA_CARA]?.used ?? '[]'),
              data.map((e) => e[DAILY_GAMES_KEYS.TA_NA_CARA]),
            ),
          ),
        },
        [DAILY_GAMES_KEYS.PORTAIS_MAGICOS]: {
          latestDate: data[data.length - 1].id,
          latestNumber: data[data.length - 1][DAILY_GAMES_KEYS.PORTAIS_MAGICOS].number,
          used: JSON.stringify(
            removeDuplicates(
              [
                ...JSON.parse(previousHistory?.[DAILY_GAMES_KEYS.PORTAIS_MAGICOS]?.used ?? '[]'),
                ...data.map((e) =>
                  e[DAILY_GAMES_KEYS.PORTAIS_MAGICOS].corridors.map((c: PlainObject) => c.passcode),
                ),
              ].flat(),
            ),
          ),
        },
      };
      setDoc(docRec, newHistory);

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
