import { memoize } from 'lodash';
import { DailyDiagramItem, DailyDiagramRule } from 'types';
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
  'ddr-31-pt': (word: string) => cleanupWord(word).includes('q') || cleanupWord(word).includes('j'),
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
};

export const syllableDependencyVerifier: Record<string, (syllables: string) => boolean> = {
  // Has 2 syllables
  'ddr-3-pt': (syllables: string) => syllables.split(SYLLABLE_SEPARATOR).length === 2,
  // Has 3 syllables
  'ddr-4-pt': (syllables: string) => syllables.split(SYLLABLE_SEPARATOR).length === 3,
  // Has 4 syllables
  'ddr-22-pt': (syllables: string) => syllables.split(SYLLABLE_SEPARATOR).length === 4,
  // Has two consecutive vowels on the same syllable
  'ddr-41-pt': (syllables: string) => {
    return syllables.split(SYLLABLE_SEPARATOR).some((syllable) => {
      return syllable.split('').some((letter, index) => {
        if (VOWELS.includes(letter) && VOWELS.includes(syllable[index + 1])) {
          return true;
        }
        return false;
      });
    });
  },
  // Has two consecutive vowels on different syllables
  'ddr-42-pt': (syllables: string) => {
    return syllables.split(SYLLABLE_SEPARATOR).some((syllable, index) => {
      if (index === 0) {
        return false;
      }
      return syllable[0] === syllables.split(SYLLABLE_SEPARATOR)[index - 1].slice(-1);
    });
  },
  // Single syllable word
  'ddr-46-pt': (syllables: string) => syllables.split(SYLLABLE_SEPARATOR).length === 1,
};

export const stressSyllableDependencyVerifier: Record<
  string,
  (syllables: string, stress: number) => boolean
> = {
  // The stress syllable is on the last syllable (oxitona)
  'ddr-43-pt': (_syllables: string, stress: number) => {
    return stress === 0;
  },
  // The stress syllable is on the second to last syllable (paroxitona)
  'ddr-44-pt': (_syllables: string, stress: number) => {
    return stress === 1;
  },
  // The stress syllable is on the third to last syllable (proparoxitona)
  'ddr-45-pt': (_syllables: string, stress: number) => {
    return stress === 2;
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
