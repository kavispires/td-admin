import { sample } from 'lodash';
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
