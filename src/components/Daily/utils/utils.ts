import { addDays, format, getDay, parseISO, subDays } from 'date-fns';
import { sample } from 'lodash';
import { ATTEMPTS_THRESHOLD } from './constants';

/**
 * Returns the current date in the format 'YYYY-MM-DD'.
 *
 * @returns The current date in 'YYYY-MM-DD' format.
 */
export function getToday(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Returns the date of yesterday in the format 'YYYY-MM-DD'.
 *
 * @returns The date of yesterday in 'YYYY-MM-DD' format.
 */
export function getYesterday(): string {
  return format(subDays(new Date(), 1), 'yyyy-MM-dd');
}

/**
 * Calculates the next day based on the given date string.
 *
 * @param dateString - The date string in the format 'YYYY-MM-DD'.
 * @returns The next day in the format 'YYYY-MM-DD'.
 */
export function getNextDay(dateString: string): string {
  const inputDate = parseISO(dateString);
  const nextDate = addDays(inputDate, 1);

  return format(nextDate, 'yyyy-MM-dd');
}

/**
 * Checks if a given date is a Saturday or Sunday.
 *
 * @param dateString - The date in 'YYYY-MM-DD' format.
 * @returns True if the date is a Saturday or Sunday, false otherwise.
 */
export function checkWeekend(dateString: string): boolean {
  const date = parseISO(dateString);
  return [6, 0].includes(getDay(date)); // 0 represents Sunday and 6 represents Saturday in date-fns
}

/**
 * Returns the day of the week for a given date string.
 *
 * @param dateString - A date string in `YYYY-MM-DD` format.
 * @returns The day of the week as a number (0 for Sunday through 6 for Saturday).
 */
export const getDayOfTheWeek = (dateString: string): number => {
  const date = parseISO(dateString);
  return getDay(date); // Returns the day of the week as a number (0-6)
};

export function getWordsWithUniqueLetters(words: string[]): string[] {
  const selectedWords: string[] = [];
  const usedLetters: BooleanDictionary = {};
  let tries = 0;

  while (selectedWords.length < 4 && tries < ATTEMPTS_THRESHOLD) {
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
  if (tries > ATTEMPTS_THRESHOLD || selectedWords.length < 4) {
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
