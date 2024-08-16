import { DailyPalavreadoEntry, ParsedDailyHistoryEntry } from '../types';
import { difference, flatMap, intersection, shuffle, sortBy, uniq } from 'lodash';
import { getNextDay } from '../utils';

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
  fourLetterWords: string[]
) => {
  console.count('Creating Palavreado...');
  let lastDate = history.latestDate;
  const usedWords: string[] = [];

  // TODO: on Saturdays use 5 letter words

  const entries: Dictionary<DailyPalavreadoEntry> = {};
  for (let i = 0; i < batchSize; i++) {
    const id = getNextDay(lastDate);
    lastDate = id;
    entries[id] = {
      id,
      type: 'palavreado',
      number: history.latestNumber + i + 1,
      ...generatePalavreadoGame(
        fourLetterWords,
        [...Object.values(entries).map((e) => e.keyword), ...history.used],
        usedWords
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
  size = 4
) => {
  const shuffledWords = shuffle(difference(words, newUsedWords, previouslyUsedWords));

  // Select a random word from the list and call it 'keyword'
  const keyword = shuffledWords.pop() ?? '';

  const selectedWords: string[] = [];
  for (let i = 0; i < size; i++) {
    const newWord = getNewWord(words, keyword, selectedWords, i);
    selectedWords.push(newWord);
  }

  newUsedWords.push(keyword, ...selectedWords);

  return {
    keyword,
    words: selectedWords,
    letters: shuffleLetters(selectedWords),
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
    words.filter((word) => word[index] === keyword[index] && !selectedWords.includes(word))
  );
  const rankedList = sortBy(shortList, (word) => {
    const matchCount = intersection(word.split(''), usedLetters).length;

    return matchCount;
  });

  return rankedList[0];
};

const shuffleLetters = (selectedWords: string[]) => {
  const letters = flatMap(selectedWords.map((word) => word.split('')));
  const preservedIndexes = [0, 5, 10, 15];
  const otherLetters = shuffle(letters.filter((_, index) => !preservedIndexes.includes(index)));

  let shuffledLetters: string[] = [];
  for (let i = 0; i < letters.length; i++) {
    if (preservedIndexes.includes(i)) {
      shuffledLetters.push(letters[i]);
    } else {
      shuffledLetters.push(otherLetters.shift() ?? '');
    }
  }

  return shuffledLetters;
};