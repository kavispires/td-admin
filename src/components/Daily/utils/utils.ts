import { difference, flatMap, intersection, sample, shuffle, sortBy, uniq } from 'lodash';
import moment from 'moment';

/**
 * Returns the current date in the format 'YYYY-MM-DD'.
 *
 * @returns {string} The current date in 'YYYY-MM-DD' format.
 */
export function getToday(): string {
  return moment().format('YYYY-MM-DD');
}

export function getNextDay(dateString: string): string {
  const inputDate = moment(dateString, 'YYYY-MM-DD');
  const nextDate = inputDate.add(1, 'days');

  return nextDate.format('YYYY-MM-DD');
}

const THRESHOLD = 500;
export function getWordsWithUniqueLetters(words: string[]): string[] {
  const selectedWords: string[] = [];
  const usedLetters: BooleanDictionary = {};
  let tries = 0;

  while (selectedWords.length < 4 && tries < THRESHOLD) {
    const word = sample(words) ?? '';
    const splitWord = word.split('');
    const isGood = splitWord.every((letter) => !usedLetters[letter]);
    if (isGood) {
      selectedWords.push(word);
      splitWord.forEach((letter) => {
        usedLetters[letter] = true;
      });
    } else {
      tries++;
    }
  }
  if (tries > THRESHOLD || selectedWords.length < 4) {
    console.count('Could not find 4 words with unique letters');
    while (selectedWords.length < 4) {
      const word = sample(words) ?? '';
      if (!selectedWords.includes(word)) {
        selectedWords.push(word);
      }
    }
  }

  if (selectedWords.length < 4) {
    console.error('Could not find 4 words with unique letters', selectedWords);
  }

  return selectedWords;
}

const usedWords: string[] = [];

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

export const generatePalavreadoGame = (words: string[], previouslyUsedWords: string[]) => {
  const shuffledWords = shuffle(difference(words, usedWords, previouslyUsedWords));

  // Select a random word from the list and call it 'keyword'
  const keyword = shuffledWords.pop() ?? '';

  const selectedWords: string[] = [];
  for (let i = 0; i < 4; i++) {
    const newWord = getNewWord(words, keyword, selectedWords, i);
    selectedWords.push(newWord);
  }

  usedWords.push(keyword, ...selectedWords);

  return {
    keyword,
    words: selectedWords,
    letters: shuffleLetters(selectedWords),
  };
};
