import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useLoadWordLibrary } from 'hooks/useLoadWordLibrary';
import { useTDResource } from 'hooks/useTDResource';
import { sample, sampleSize, shuffle } from 'lodash';
import { useMemo } from 'react';
import type { ImageCardPasscodeSet } from 'types';
import { SEPARATOR } from 'utils/constants';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { getNextDay } from '../utils';

type Corridor = {
  passcode: string;
  imagesIds: string[];
  words: string[];
};

export type DailyPortaisMagicosEntry = {
  id: DateKey;
  setId: string;
  number: number;
  type: 'portais-magicos';
  corridors: Corridor[];
};

export const useDailyPortaisMagicosGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [portaisMagicosHistory] = useParsedHistory(DAILY_GAMES_KEYS.PORTAIS_MAGICOS, dailyHistory);

  const imageCardPasscodeSetsQuery = useTDResource<ImageCardPasscodeSet>('daily-passcode-sets', enabled);
  const wordsThreeQuery = useLoadWordLibrary(3, queryLanguage, enabled, true);

  const entries = useMemo(() => {
    if (
      !enabled ||
      !imageCardPasscodeSetsQuery.isSuccess ||
      !wordsThreeQuery.isSuccess ||
      !portaisMagicosHistory
    ) {
      return {};
    }

    const wordsLettersDict = wordsThreeQuery.data.reduce(
      (acc: Dictionary<string[]>, word) => {
        word.split('').forEach((letter) => {
          if (!acc[letter]) {
            acc[letter] = [];
          }
          acc[letter].push(word);
        });

        return acc;
      },
      {
        ' ': [''],
        '-': ['-'],
      },
    );
    console.log(wordsLettersDict);

    return buildDailyPortaisMagicosGames(
      batchSize,
      portaisMagicosHistory,
      imageCardPasscodeSetsQuery.data,
      wordsLettersDict,
    );
  }, [
    enabled,
    batchSize,
    imageCardPasscodeSetsQuery.isSuccess,
    imageCardPasscodeSetsQuery.data,
    wordsThreeQuery.isSuccess,
    wordsThreeQuery.data,
    portaisMagicosHistory,
  ]);

  return {
    entries,
    isLoading: imageCardPasscodeSetsQuery.isLoading || wordsThreeQuery.isLoading,
  };
};

export const buildDailyPortaisMagicosGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  passcodeSets: Dictionary<ImageCardPasscodeSet>,
  wordsLettersDict: Dictionary<string[]>,
) => {
  console.count('Creating Portais Mágicos...');

  let lastDate = history.latestDate;

  const takenSetsIds: BooleanDictionary = {};
  let availableSets = shuffle(Object.values(passcodeSets).filter((s) => s.imageCardsIds.length > 0));

  const entries: Dictionary<DailyPortaisMagicosEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    const setsIds: string[] = [];

    let entryAvailableSets = [...availableSets];

    const corridors: Corridor[] = [];
    for (let j = 1; j < 4; j++) {
      const selectedSet = entryAvailableSets.pop();
      if (!selectedSet) {
        throw new Error('Not enough sets available');
      }
      setsIds.push(selectedSet.id);
      takenSetsIds[selectedSet.id] = true;

      // Select a random passcode
      const passcode = sample(selectedSet.passcode);
      if (!passcode) {
        throw new Error(`No passcode available in set ${selectedSet.id}`);
      }

      // Get the words that will build the passcode
      const words = passcode.split('').map((letter) => sample(wordsLettersDict[letter]) || '');

      // Select the image cards according to the index
      const imagesIds = sampleSize(selectedSet.imageCardsIds, j);

      corridors.push({
        passcode,
        imagesIds,
        words,
      });

      entryAvailableSets = entryAvailableSets.filter(
        (s) => !takenSetsIds[s.id] && s.imageCardsIds.length > j,
      );
    }

    lastDate = id;
    entries[id] = {
      id,
      type: 'portais-magicos',
      setId: setsIds.join(SEPARATOR),
      number: history.latestNumber + i + 1,
      corridors: corridors.reverse(),
    };

    // Cleanup available sets
    availableSets = availableSets.filter((s) => !takenSetsIds[s.id]);
  }
  return entries;
};
