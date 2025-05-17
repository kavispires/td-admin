import { AlienSign, Emoji, Glyph } from 'components/Sprites';
import { WarehouseGood } from 'components/Sprites/WarehouseGood';
import { capitalize, invert, keyBy } from 'lodash';

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
  CITY_LOCATIONS: 'city-locations',
  COLORS: 'colors',
  CONCEPTS: 'concepts',
  CONTENDERS: 'contenders',
  CRIME_EVIDENCE: 'crime-evidence',
  CRIME_SCENES: 'crime-scenes',
  CRIME_WEAPONS: 'crime-weapons',
  DATING_CANDIDATE: 'dating-candidate',
  DATING_CANDIDATE_BODIES: 'dating-candidate-bodies',
  DATING_CANDIDATE_HEADS: 'dating-candidate-heads',
  DIAGRAM_TOPICS: 'diagram-topics',
  DILEMMAS: 'dilemmas',
  DRAWING_WORDS: 'drawing-words',
  EMOTIONS: 'emotions',
  GROUP_QUESTIONS: 'group-questions',
  ITEMS_ATTRIBUTES: 'items-attributes',
  MONSTER_ORIENTATION: 'monster-orientation',
  MOVIE_REVIEWS: 'movie-reviews',
  MOVIES: 'movies',
  NAMING_PROMPTS: 'naming-prompts',
  OBJECT_FEATURES: 'object-features',
  QUANTITATIVE_QUESTIONS: 'quantitative-questions',
  SCENARIOS: 'scenarios',
  SINGLE_WORDS: 'single-words',
  SPECTRUMS: 'spectrums',
  SPY_LOCATIONS: 'spy-locations',
  SPY_QUESTIONS: 'spy-questions',
  SUSPECTS: 'suspects',
  TEENAGE_RUMORS: 'teenage-rumors',
  TEENAGE_STUDENTS: 'teenage-students',
  TESTIMONY_QUESTIONS: 'testimony-questions',
  THEME_WORDS: 'theme-words',
  THING_PROMPTS: 'thing-prompts',
  THINGS_QUALITIES: 'things-qualities',
  TOPICS: 'topics',
  TREE_WORDS: 'tree-words',
  TWEETS: 'tweets',
  WAREHOUSE_BOSS_IDEAS: 'warehouse-boss-ideas',
  WARNING_SIGNS_DESCRIPTORS: 'warning-signs-descriptors',
  WARNING_SIGNS_SUBJECTS: 'warning-signs-subjects',
};

export const DUAL_LANGUAGE_RESOURCES = [
  RESOURCE_NAMES.ALIEN_ITEMS,
  RESOURCE_NAMES.CITY_LOCATIONS,
  RESOURCE_NAMES.CONTENDERS,
  RESOURCE_NAMES.CRIME_EVIDENCE,
  RESOURCE_NAMES.CRIME_SCENES,
  RESOURCE_NAMES.CRIME_WEAPONS,
  RESOURCE_NAMES.DATING_CANDIDATE_BODIES,
  RESOURCE_NAMES.DATING_CANDIDATE_HEADS,
  RESOURCE_NAMES.ITEMS_ATTRIBUTES,
  RESOURCE_NAMES.MONSTER_ORIENTATION,
  RESOURCE_NAMES.OBJECT_FEATURES,
  RESOURCE_NAMES.SUSPECTS,
  RESOURCE_NAMES.TEENAGE_RUMORS,
  RESOURCE_NAMES.TEENAGE_STUDENTS,
];

export const LANGUAGES: Language[] = ['pt', 'en'];

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
  'diagram-topics': 'text',
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

export const TOTAL_ITEMS = 2496;

export const SPRITE_LIBRARY = keyBy(
  [
    {
      key: 'alien-signs',
      name: 'Alien Signs',
      prefix: 'sign',
      quantity: 70,
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
      key: 'warehouse-goods',
      name: 'Warehouse Goods',
      prefix: 'good',
      quantity: 256,
      startAt: 1,
      component: WarehouseGood,
    },
  ],
  'key',
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

export const ATTRIBUTE_VALUE = {
  OPPOSITE: -10,
  UNRELATED: -3,
  UNCLEAR: -1,
  RELATED: 5,
  DETERMINISTIC: 10,
};

export const VALUE_ATTRIBUTE = invert(ATTRIBUTE_VALUE);

export const ATTRIBUTE_VALUE_PREFIX = {
  OPPOSITE: '^',
  UNRELATED: '!',
  UNCLEAR: '~',
  RELATED: '+',
  DETERMINISTIC: '*',
};

export const ATTRIBUTE_GROUP_VALUES = Object.keys(ATTRIBUTE_VALUE).map((key) => ({
  value: key.toLowerCase(),
  label: capitalize(key),
}));

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export const PLACEHOLDER_DUAL_LANGUAGE_OBJECT = { en: '', pt: '' };

export const SEPARATOR = ';;';
