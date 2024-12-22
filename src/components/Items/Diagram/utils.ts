import { memoize } from 'lodash';
import type { DailyDiagramItem, DailyDiagramRule } from 'types';
import { stringRemoveAccents } from 'utils';

export const SYLLABLE_SEPARATOR = '|';
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
  // has 4 or less letters
  'ddr-8-pt': (word: string) => countLetters(word) <= 4,
  // Has exactly 5 letters
  'ddr-9-pt': (word: string) => countLetters(word) === 5,
  // Has 6 letters
  'ddr-10-pt': (word: string) => countLetters(word) === 6,
  // Has between 7
  'ddr-11-pt': (word: string) => countLetters(word) === 7,
  // Has more than 8 letters
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
          .includes(letter),
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
            .includes(letter),
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
            .includes(letter),
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
  // Double consecutive consonants
  'ddr-27-pt': (word: string) => {
    return cleanupWord(word)
      .split('')
      .some((letter, index) => CONSONANTS.includes(letter) && word[index + 1] === letter);
  },
  // Has an A
  'ddr-28-pt': (word: string) => cleanupWord(word).includes('a'),
  // Has an E
  'ddr-29-pt': (word: string) => cleanupWord(word).includes('e'),
  // Has an U
  'ddr-30-pt': (word: string) => cleanupWord(word).includes('u'),
  // Has a Q or J
  'ddr-31-pt': (word: string) => cleanupWord(word).includes('q'),
  // Has a C or Ç
  'ddr-32-pt': (word: string) => cleanupWord(word).includes('c') || cleanupWord(word).includes('ç'),
  // Has an M or N followed by a consonant
  'ddr-33-pt': (word: string) => {
    return cleanupWord(word)
      .split('')
      .some((letter, index) => {
        if (['m', 'n'].includes(letter) && CONSONANTS.includes(word[index + 1])) {
          return true;
        }
        return false;
      });
  },
  // Has an H
  'ddr-34-pt': (word: string) => cleanupWord(word).includes('h'),
  // Has H preceded by a consonant
  'ddr-35-pt': (word: string) => {
    return cleanupWord(word)
      .split('')
      .some((letter, index) => {
        if (letter === 'h' && CONSONANTS.includes(word[index - 1])) {
          return true;
        }
        return false;
      });
  },
  // Has K, W or Y
  'ddr-36-pt': (word: string) =>
    cleanupWord(word).includes('k') || cleanupWord(word).includes('w') || cleanupWord(word).includes('y'),
  // Has an accent
  'ddr-37-pt': (word: string) => countAccents(word) > 0,
  // Ends with a vowel
  'ddr-38-pt': (word: string) => {
    return VOWELS.includes(cleanupWord(word).slice(-1));
  },
  // Ends with a consonant
  'ddr-39-pt': (word: string) => CONSONANTS.includes(cleanupWord(word).slice(-1)),
  // Ends with an S
  'ddr-40-pt': (word: string) => cleanupWord(word).slice(-1) === 's',
  // Has an I
  'ddr-47-pt': (word: string) => cleanupWord(word).includes('i'),
  // Has an O
  'ddr-48-pt': (word: string) => cleanupWord(word).includes('o'),
  // Has an X
  'ddr-49-pt': (word: string) => cleanupWord(word).includes('x'),
  // Has an J
  'ddr-52-pt': (word: string) => cleanupWord(word).includes('j'),
};

export const syllableDependencyVerifier: Record<
  string,
  (word: string, syllables: string, isAcronym: boolean) => boolean
> = {
  // Has 2 syllables
  'ddr-3-pt': (word: string, syllables: string) =>
    countWords(word) === 1 && syllables.split(SYLLABLE_SEPARATOR).length === 2,
  // Has 3 syllables
  'ddr-4-pt': (word: string, syllables: string) =>
    countWords(word) === 1 && syllables.split(SYLLABLE_SEPARATOR).length === 3,
  // Has 4 syllables
  'ddr-22-pt': (word: string, syllables: string) =>
    countWords(word) === 1 && syllables.split(SYLLABLE_SEPARATOR).length === 4,
  // Has two consecutive vowels on the same syllable
  'ddr-41-pt': (word: string, syllables: string) => {
    return (
      countWords(word) === 1 &&
      syllables.split(SYLLABLE_SEPARATOR).some((syllable) => {
        return syllable.split('').some((letter, index) => {
          if (VOWELS.includes(letter) && VOWELS.includes(syllable[index + 1])) {
            return true;
          }
          return false;
        });
      })
    );
  },
  // Has two consecutive vowels on different syllables
  'ddr-42-pt': (_: string, syllables: string) => {
    return syllables.split(SYLLABLE_SEPARATOR).some((syllable, index) => {
      if (index === 0) {
        return false;
      }
      return syllable[0] === syllables.split(SYLLABLE_SEPARATOR)[index - 1].slice(-1);
    });
  },
  // Single syllable word
  'ddr-46-pt': (word: string, syllables: string, isAcronym: boolean) =>
    countWords(word) === 1 && !isAcronym && syllables.split(SYLLABLE_SEPARATOR).length === 1,
};

export const stressSyllableDependencyVerifier: Record<
  string,
  (word: string, syllables: string, stress: number) => boolean
> = {
  // The stress syllable is on the last syllable (oxitona)
  'ddr-43-pt': (word: string, _, stress: number) => {
    return countWords(word) === 1 && stress === 0;
  },
  // The stress syllable is on the second to last syllable (paroxitona)
  'ddr-44-pt': (word: string, _, stress: number) => {
    return countWords(word) === 1 && stress === 1;
  },
  // The stress syllable is on the third to last syllable (proparoxitona)
  'ddr-45-pt': (word: string, _, stress: number) => {
    return countWords(word) === 1 && stress === 2;
  },
};

export const getLatestRuleUpdate = (rules: Dictionary<DailyDiagramRule>) => {
  return Object.values(rules).reduce((acc, rule) => {
    return Math.max(acc, rule.updatedAt);
  }, 0);
};

export const getIsThingOutdated = (thing: DailyDiagramItem, latestRuleUpdate: number) => {
  return latestRuleUpdate > thing.updatedAt;
};

const checkIsVowel = (char: string) => VOWELS.includes(stringRemoveAccents(char));
const checkIsConsonant = (char: string) => CONSONANTS.includes(stringRemoveAccents(char));
const LMNRS = ['s', 'r', 'l', 'm', 'n'];
const DOUBLE_LETTERS = [
  'rr',
  'ss',
  'st',
  'sc',
  'lm',
  'ld',
  'mp',
  'mb',
  'rn',
  'rm',
  'rt',
  'rd',
  'lt',
  'ld',
  'nt',
  'nd',
  'sp',
  'ls',
];
/**
 * Guesses the separation of syllables in a given word.
 * @param word - The word for which to guess the syllables separation.
 * @returns The guessed syllables separation as a string.
 */
export const guessSyllablesSeparation = (word: string): string => {
  let syllables: string[] = [];
  let currentSyllable = '';

  const stringWithoutAccents = stringRemoveAccents(word);

  for (let i = 0; i < word.length; i++) {
    const char = stringWithoutAccents[i];
    // Space makes a syllable
    if (char === ' ') {
      syllables.push(currentSyllable);
      currentSyllable = '';
      continue;
    }

    // Hyphen makes a syllable
    if (char === '-') {
      syllables.push(`${currentSyllable}-`);
      currentSyllable = '';
      continue;
    }

    if (checkIsVowel(char) && i < stringWithoutAccents.length - 2) {
      const nextChar = stringWithoutAccents[i + 1];
      const nextNextChar = stringWithoutAccents[i + 2];
      // If the next character is a consonant and the next next character is a consonant, the first pair is a syllable
      if (LMNRS.includes(nextChar) && checkIsConsonant(nextNextChar)) {
        currentSyllable += word[i] + word[i + 1];
        i++; // Skip the next character
        continue;
      }
    }

    // Handle "c" followed by "h", "r", or "l"
    if (
      char === 'c' &&
      i < stringWithoutAccents.length - 2 &&
      ['h', 'r', 'l'].includes(stringWithoutAccents[i + 1]) &&
      checkIsVowel(stringWithoutAccents[i + 2])
    ) {
      currentSyllable += word[i] + word[i + 1] + word[i + 2];
      i += 2; // Skip the next two characters
      continue;
    }

    // Handle "l" or "n" followed by "h"
    if (
      ['l', 'n'].includes(char) &&
      i < stringWithoutAccents.length - 2 &&
      stringWithoutAccents[i + 1] === 'h' &&
      checkIsVowel(stringWithoutAccents[i + 2])
    ) {
      currentSyllable += word[i] + word[i + 1] + word[i + 2];
      i += 2; // Skip the next two characters
      continue;
    }

    // Handle consonant followed by vowel followed by consonant cluster
    if (
      checkIsConsonant(char) &&
      i < stringWithoutAccents.length - 3 &&
      checkIsVowel(stringWithoutAccents[i + 1]) &&
      LMNRS.includes(stringWithoutAccents[i + 2]) &&
      checkIsConsonant(stringWithoutAccents[i + 3])
    ) {
      currentSyllable += word[i] + word[i + 1] + word[i + 2];
      i += 2; // Skip the next two characters
      continue;
    }

    currentSyllable += word[i];

    if (
      checkIsVowel(char) &&
      i < stringWithoutAccents.length - 1 &&
      !checkIsVowel(stringWithoutAccents[i + 1]) &&
      !['l', 'r', 'n'].includes(stringWithoutAccents[i + 1])
    ) {
      syllables.push(currentSyllable);
      currentSyllable = '';
    }
  }

  if (currentSyllable !== '') {
    syllables.push(currentSyllable);
  }

  // As a final effort, if there are syllables with "rr" or "ss", split them but keep the characters. e.g. carro -> car:ro
  syllables = syllables.map((syllable) => {
    for (const doubleLetter of DOUBLE_LETTERS) {
      if (syllable.includes(doubleLetter)) {
        return syllable.split(doubleLetter).join(`${doubleLetter[0]}${SYLLABLE_SEPARATOR}${doubleLetter[1]}`);
      }
    }
    return syllable;
  });

  return syllables.filter(Boolean).join(SYLLABLE_SEPARATOR);
};

/**
 * Separates the syllables of a given word.
 * @param word - The word to separate syllables from.
 * @returns The word with syllables separated by '|'.
 */
export function separateSyllables(word: string): string {
  const syllablePattern =
    /([^aeiouáéíóúâêîôûàèìòùãõäëïöüAEIOUÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÄËÏÖÜ]*[aeiouáéíóúâêîôûàèìòùãõäëïöüAEIOUÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÄËÏÖÜ]{1,3}[^aeiouáéíóúâêîôûàèìòùãõäëïöüAEIOUÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÄËÏÖÜ]*)(?=[^aeiouáéíóúâêîôûàèìòùãõäëïöüAEIOUÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÄËÏÖÜ]|$)/gi;

  const proposed = word.replace(syllablePattern, '$1|').slice(0, -1);

  return proposed.replace(/\s/g, '');
}
