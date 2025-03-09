import { useParsedHistory } from 'components/Daily/hooks/useParsedHistory';
import { useLoadWordLibrary } from 'hooks/useLoadWordLibrary';
import { difference, flatMap, intersection, shuffle, sortBy, uniq } from 'lodash';
import { useMemo } from 'react';
import { DAILY_GAMES_KEYS } from '../constants';
import type { DailyHistory, DateKey, ParsedDailyHistoryEntry } from '../types';
import { checkWeekend, getNextDay } from '../utils';

export type DailyPalavreadoEntry = {
  id: DateKey;
  number: number;
  type: 'palavreado';
  keyword: string;
  words: string[];
  letters: string[];
};

export const useDailyPalavreadoGames = (
  enabled: boolean,
  queryLanguage: Language,
  batchSize: number,
  dailyHistory: DailyHistory,
) => {
  const [palavreadoHistory] = useParsedHistory(DAILY_GAMES_KEYS.PALAVREADO, dailyHistory);

  const wordsFourQuery = useLoadWordLibrary(4, queryLanguage, enabled, true);
  const wordsFiveQuery = useLoadWordLibrary(5, queryLanguage, enabled, true);
  const entries = useMemo(() => {
    if (
      !enabled ||
      !wordsFourQuery.data ||
      !wordsFourQuery.data.length ||
      !wordsFiveQuery.data ||
      !wordsFiveQuery.data.length ||
      !palavreadoHistory
    ) {
      return {};
    }

    return buildDailyPalavreadoGames(batchSize, palavreadoHistory, wordsFourQuery.data, wordsFiveQuery.data);
  }, [enabled, wordsFourQuery, wordsFiveQuery, palavreadoHistory, batchSize]);

  return {
    entries,
    isLoading: wordsFourQuery.isLoading || wordsFiveQuery.isLoading,
  };
};

/**
 * Builds a dictionary of DailyPalavreadoEntry games.
 *
 * @param batchSize - The number of games to generate.
 * @param history - The parsed daily history entry.
 * @param fourLetterWords - An array of four-letter words.
 * @returns A dictionary of DailyPalavreadoEntry games.
 */
export const buildDailyPalavreadoGames = (
  batchSize: number,
  history: ParsedDailyHistoryEntry,
  fourLetterWords: string[],
  fiveLetterWords: string[],
) => {
  console.count('Creating Palavreado...');
  let lastDate = history.latestDate;
  const usedWords: string[] = [];

  const entries: Dictionary<DailyPalavreadoEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    const isWeekend = checkWeekend(id);
    const size = isWeekend ? 5 : 4;
    lastDate = id;
    entries[id] = {
      id,
      type: 'palavreado',
      number: history.latestNumber + i + 1,
      ...generatePalavreadoGame(
        isWeekend ? fiveLetterWords : fourLetterWords,
        [...Object.values(entries).map((e) => e.keyword), ...history.used],
        usedWords,
        size,
      ),
    };
  }
  return entries;
};

/**
 * Generates a Palavreado game.
 *
 * @param words - An array of words to choose from.
 * @param previouslyUsedWords - An array of words that have been used previously.
 * @param newUsedWords - An array of words that have been used in this game.
 * @param size - The number of words to generate.
 * @returns An object containing the keyword, selected words, and shuffled letters.
 */
export const generatePalavreadoGame = (
  words: string[],
  previouslyUsedWords: string[],
  newUsedWords: string[],
  size = 4,
  fixedKeyword?: string,
) => {
  let shuffledWords = shuffle(difference(words, newUsedWords, previouslyUsedWords));

  // Select a random word from the list and call it 'keyword'
  const keyword = fixedKeyword ? fixedKeyword : (shuffledWords.pop() ?? '');
  if (fixedKeyword) {
    shuffledWords = difference(shuffledWords, [fixedKeyword]);
  }

  const selectedWords: string[] = [];
  for (let i = 0; i < size; i++) {
    const newWord = getNewWord(words, keyword, selectedWords, i);
    selectedWords.push(newWord);
  }

  newUsedWords.push(keyword, ...selectedWords);

  return {
    keyword,
    words: selectedWords,
    letters: shuffleLetters(selectedWords, keyword.length),
  };
};

/**
 * Retrieves a new word from the given list of words based on the provided keyword, selected words, and index.
 *
 * @param words - The list of words to choose from.
 * @param keyword - The keyword to match against.
 * @param selectedWords - The list of already selected words.
 * @param index - The index to compare against in each word.
 * @returns The new word selected based on the keyword, selected words, and index.
 */
const getNewWord = (words: string[], keyword: string, selectedWords: string[], index: number) => {
  const usedLetters = uniq([...flatMap(selectedWords.map((word) => word.split(''))), ...keyword.split('')]);

  const shortList = shuffle(
    words.filter((word) => word[index] === keyword[index] && !selectedWords.includes(word)),
  );
  const rankedList = sortBy(shortList, (word) => {
    const matchCount = intersection(word.split(''), usedLetters).length;

    return matchCount;
  });

  return rankedList[0];
};

const shuffleLetters = (selectedWords: string[], size: number) => {
  const letters = flatMap(selectedWords.map((word) => word.split('')));
  const preservedIndexes = size === 4 ? [0, 5, 10, 15] : [0, 6, 12, 18, 24];
  const otherLetters = shuffle(letters.filter((_, index) => !preservedIndexes.includes(index)));

  const shuffledLetters: string[] = [];
  for (let i = 0; i < letters.length; i++) {
    if (preservedIndexes.includes(i)) {
      shuffledLetters.push(letters[i]);
    } else {
      shuffledLetters.push(otherLetters.shift() ?? '');
    }
  }

  return shuffledLetters;
};
