import { AlienSign, Emoji, Glyph } from 'components/Sprites';
import { WarehouseGood } from 'components/Sprites/WarehouseGood';
import { capitalize, invert, keyBy } from 'lodash';

export const SEARCH_THRESHOLD: number = 2;

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
      idProperty: 'signId',
    },
    {
      key: 'emojis',
      name: 'Emojis',
      prefix: 'emoji',
      quantity: 30,
      startAt: 1,
      component: Emoji,
      idProperty: 'emojiId',
    },
    {
      key: 'glyphs',
      name: 'Glyphs',
      prefix: 'glyph',
      quantity: 365,
      startAt: 1,
      component: Glyph,
      idProperty: 'glyphId',
    },
    {
      key: 'warehouse-goods',
      name: 'Warehouse Goods',
      prefix: 'good',
      quantity: 256,
      startAt: 1,
      component: WarehouseGood,
      idProperty: 'goodId',
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
