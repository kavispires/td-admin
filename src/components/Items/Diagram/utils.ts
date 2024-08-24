import { memoize } from 'lodash';
import { stringRemoveAccents } from 'utils';

export const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
export const CONSONANTS = 'bcdfghjklmnpqrstvwxyz';
export const VOWELS = 'aeiou';
export const ACCENTS = /[áéíóúãẽĩõũâêîôûàèìòùäëïöü]/;

const cleanupWord = memoize((word: string) => {
  return stringRemoveAccents(word).toLowerCase();
});

const countLetters = (word: string) => {
  return cleanupWord(word).length;
};

const countVowels = (word: string) => {
  return cleanupWord(word)
    .split('')
    .filter((letter) => VOWELS.includes(letter)).length;
};

const countConsonants = (word: string) => {
  return cleanupWord(word)
    .split('')
    .filter((letter) => CONSONANTS.includes(letter)).length;
};

const countAccents = (word: string) => {
  return word
    .toLowerCase()
    .split('')
    .filter((letter) => ACCENTS.test(letter)).length;
};

const countWords = (text: string) => {
  return text.split(' ').length;
};

export const verifiers: Record<string, (word: string) => boolean> = {
  // The first two letters are in alphabetical order
  'ddr-7-pt': (word: string) => {
    return LETTERS.indexOf(cleanupWord(word)[0]) < LETTERS.indexOf(cleanupWord(word)[1]);
  },
  // Less than 5 letters
  'ddr-8-pt': (word: string) => countLetters(word) <= 5,
  // Has exactly 5 letters
  'ddr-9-pt': (word: string) => countLetters(word) === 5,
  // Has between 4 and 6 letters
  'ddr-10-pt': (word: string) => countLetters(word) >= 4 && countLetters(word) <= 6,
  // Has between 6 and 8 letters
  'ddr-11-pt': (word: string) => countLetters(word) >= 6 && countLetters(word) <= 8,
  // Has more than 7 letters
  'ddr-12-pt': (word: string) => countLetters(word) > 7,
  // Has more than 1 word
  'ddr-13-pt': (word: string) => countWords(word) > 1,
  // Has two or more different vowels
  'ddr-14-pt': (word: string) => {
    const vowels = cleanupWord(word)
      .split('')
      .filter((letter) => VOWELS.includes(letter));
    return new Set(vowels).size >= 2;
  },
  // Has 4 or less unique letters
  'ddr-15-pt': (word: string) => new Set(cleanupWord(word).split('')).size <= 4,
  // Has more consonants than vowels
  'ddr-16-pt': (word: string) => countConsonants(word) > countVowels(word),
  // Has more vowels than consonants
  'ddr-17-pt': (word: string) => countVowels(word) > countConsonants(word),
  // The first letter is repeated at least once
  'ddr-18-pt': (word: string) => {
    const firstLetter = cleanupWord(word)[0];
    return cleanupWord(word).slice(1).includes(firstLetter);
  },
  // has repeated letters
  'ddr-19-pt': (word: string) => {
    return cleanupWord(word)
      .split('')
      .some((letter, index) =>
        cleanupWord(word)
          .slice(index + 1)
          .includes(letter)
      );
  },
  // has repeated vowels
  'ddr-20-pt': (word: string) => {
    return cleanupWord(word)
      .split('')
      .some(
        (letter, index) =>
          VOWELS.includes(letter) &&
          cleanupWord(word)
            .slice(index + 1)
            .includes(letter)
      );
  },
  // has repeated consonants
  'ddr-21-pt': (word: string) => {
    return cleanupWord(word)
      .split('')
      .some(
        (letter, index) =>
          CONSONANTS.includes(letter) &&
          cleanupWord(word)
            .slice(index + 1)
            .includes(letter)
      );
  },
  // has consecutive vowels
  'ddr-22-pt': (word: string) => {
    return cleanupWord(word)
      .split('')
      .some((letter, index) => VOWELS.includes(letter) && VOWELS.includes(word[index + 1]));
  },
  // starts with letters from A to M
  'ddr-23-pt': (word: string) => 'abcdefghijklm'.includes(cleanupWord(word)[0]),
  // starts with letters from N to Z
  'ddr-24-pt': (word: string) => 'nopqrstuvwxyz'.includes(cleanupWord(word)[0]),
  // starts with a vowel
  'ddr-25-pt': (word: string) => VOWELS.includes(cleanupWord(word)[0]),
  // starts with a consonant
  'ddr-26-pt': (word: string) => CONSONANTS.includes(cleanupWord(word)[0]),
  // Double consecutive letters
  'ddr-27-pt': (word: string) => {
    return word.split('').some((letter, index) => letter === word[index + 1]);
  },
  // Has an A
  'ddr-28-pt': (word: string) => cleanupWord(word).includes('a'),
  // Has an R
  'ddr-29-pt': (word: string) => cleanupWord(word).includes('r'),
  // Has an U
  'ddr-30-pt': (word: string) => cleanupWord(word).includes('u'),
  // Has a Q or J
  'ddr-31-pt': (word: string) => cleanupWord(word).includes('q') || cleanupWord(word).includes('j'),
  // Has a C or Ç
  'ddr-32-pt': (word: string) => cleanupWord(word).includes('c') || cleanupWord(word).includes('ç'),
  // Has an M
  'ddr-33-pt': (word: string) => cleanupWord(word).includes('m'),
  // Has an H
  'ddr-34-pt': (word: string) => cleanupWord(word).includes('h'),
  // Has P or B
  'ddr-35-pt': (word: string) => cleanupWord(word).includes('p') || cleanupWord(word).includes('b'),
  // Has K, W or Y
  'ddr-36-pt': (word: string) =>
    cleanupWord(word).includes('k') || cleanupWord(word).includes('w') || cleanupWord(word).includes('y'),
  // Has an accent
  'ddr-37-pt': (word: string) => countAccents(word) > 0,
  // Does not end with an A or O
  'ddr-38-pt': (word: string) => !['a', 'o'].includes(cleanupWord(word).slice(-1)),
  // Ends with a consonant
  'ddr-39-pt': (word: string) => CONSONANTS.includes(cleanupWord(word).slice(-1)),
  // Ends with an S
  'ddr-40-pt': (word: string) => cleanupWord(word).slice(-1) === 's',
  // Does not have repeated vowels
  'ddr-41-pt': (word: string) => {
    const vowels = cleanupWord(word)
      .split('')
      .filter((letter) => VOWELS.includes(letter));
    return new Set(vowels).size === vowels.length;
  },
  // Does not have repeated consonants
  'ddr-42-pt': (word: string) => {
    const consonants = cleanupWord(word)
      .split('')
      .filter((letter) => CONSONANTS.includes(letter));
    return new Set(consonants).size === consonants.length;
  },
};
