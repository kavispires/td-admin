import { AlienSign, Emoji, Glyph, Item } from 'components/Sprites';
import { keyBy } from 'lodash';

export const SEARCH_THRESHOLD: number = 2;

export const RESOURCE_NAMES = {
  ADJECTIVES: 'adjectives',
  ALIEN_ITEMS: 'alien-items',
  ARTE_RUIM_CARDS: 'arte-ruim-cards',
  ARTE_RUIM_GROUPS: 'arte-ruim-groups',
  ARTE_RUIM_PAIRS: 'arte-ruim-pairs',
  CATEGORIES: 'categories',
  CHALLENGES: 'challenges',
  CHARACTERS: 'characters',
  CHOICES: 'choices',
  CONTENDERS: 'contenders',
  CRIME_EVIDENCE: 'crime-evidence',
  CRIME_TILES: 'crime-tiles',
  CRIME_WEAPONS: 'crime-weapons',
  DATING_CANDIDATE: 'dating-candidate',
  DATING_CANDIDATE_BODIES: 'dating-candidate-bodies',
  DATING_CANDIDATE_HEADS: 'dating-candidate-heads',
  DILEMMAS: 'dilemmas',
  DRAWING_WORDS: 'drawing-words',
  GROUP_QUESTIONS: 'group-questions',
  MONSTER_ORIENTATION: 'monster-orientation',
  MOVIE_REVIEWS: 'movie-reviews',
  MOVIES: 'movies',
  NAMING_PROMPTS: 'naming-prompts',
  OBJECT_FEATURES: 'object-features',
  QUANTITATIVE_QUESTIONS: 'quantitative-questions',
  SCENARIOS: 'scenarios',
  SPECTRUMS: 'spectrums',
  SINGLE_WORDS: 'single-words',
  SPY_LOCATIONS: 'spy-locations',
  SPY_QUESTIONS: 'spy-questions',
  SUSPECTS: 'suspects',
  TESTIMONY_QUESTIONS: 'testimony-questions',
  THEME_WORDS: 'theme-words',
  THING_PROMPTS: 'thing-prompts',
  THINGS_QUALITIES: 'things-qualities',
  TOPICS: 'topics',
  TREE_WORDS: 'tree-words',
  TWEETS: 'tweets',
};

export const DUAL_LANGUAGE_RESOURCES = [
  RESOURCE_NAMES.ALIEN_ITEMS,
  RESOURCE_NAMES.CONTENDERS,
  RESOURCE_NAMES.CRIME_EVIDENCE,
  RESOURCE_NAMES.CRIME_TILES,
  RESOURCE_NAMES.CRIME_WEAPONS,
  RESOURCE_NAMES.DATING_CANDIDATE_BODIES,
  RESOURCE_NAMES.DATING_CANDIDATE_HEADS,
  RESOURCE_NAMES.MONSTER_ORIENTATION,
  RESOURCE_NAMES.OBJECT_FEATURES,
  RESOURCE_NAMES.SUSPECTS,
];

export const LANGUAGES: Language[] = ['pt', 'en'];

export const DEFAULT_LANGUAGE: Language = 'pt';

export const SEARCH_PROPERTY: Record<string, string> = {
  adjectives: 'text',
  'arte-ruim-cards': 'text',
  'arte-ruim-groups': 'theme',
  'arte-ruim-pairs': 'values',
  categories: 'text',
  challenges: 'text',
  characters: 'text',
  contenders: '',
  'crime-tiles': '',
  'galeria-de-sonhos': 'text',
  'group-questions': 'text',
  'linhas-cruzadas': 'text',
  'naming-prompts': 'text',
  spectrums: '',
  'single-words': 'text',
  'spy-locations': '',
  'spy-questions': '',
  'testimony-questions': 'question',
  'thing-prompts': 'text',
  topics: 'text',
};

export const TOTAL_ITEMS = 1280;

export const SPRITE_LIBRARY = keyBy(
  [
    {
      key: 'alien-signs',
      name: 'Alien Signs',
      prefix: 'sign',
      quantity: 36,
      startAt: 0,
      component: AlienSign,
    },
    {
      key: 'emojis',
      name: 'Emojis',
      prefix: 'emoji',
      quantity: 30,
      startAt: 1,
      component: Emoji,
    },
    {
      key: 'glyphs',
      name: 'Glyphs',
      prefix: 'glyph',
      quantity: 365,
      startAt: 1,
      component: Glyph,
    },
    {
      key: 'items',
      name: 'Items',
      prefix: 'item',
      quantity: TOTAL_ITEMS,
      startAt: 1,
      component: Item,
    },
  ],
  'key'
);

/**
 * Options for the sample size selector
 */
export const TAGS_SELECTOR_OPTIONS = [
  { label: 'Any', value: '' },
  { label: '= 0', value: 0 },
  { label: '< 3', value: 3 },
  { label: '< 5', value: 5 },
  { label: '< 10', value: 10 },
];

/**
 * Options for the sample size selector
 */
export const SAMPLE_SIZE_OPTIONS = [
  {
    label: '9',
    value: 9,
  },
  {
    label: '15',
    value: 15,
  },
  {
    label: '30',
    value: 30,
  },
  {
    label: '50',
    value: 50,
  },
  {
    label: '100',
    value: 100,
  },
];

/**
 * Options for the card size selector
 */
export const CARD_SIZE_OPTIONS = [
  {
    label: 'Small',
    value: 100,
  },
  {
    label: 'Medium',
    value: 150,
  },
  {
    label: 'Large',
    value: 200,
  },
  {
    label: 'X-Large',
    value: 250,
  },
];
