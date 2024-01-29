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
  CRIME_TILES: 'crime-tiles',
  DATING_CANDIDATE: 'dating-candidate',
  DILEMMAS: 'dilemmas',
  GALERIA_DE_SONHOS: 'galeria-de-sonhos',
  GROUP_QUESTIONS: 'group-questions',
  LABIRINTO_SECRETO: 'labirinto-secreto',
  LINHAS_CRUZADAS: 'linhas-cruzadas',
  MOVIE_REVIEWS: 'movie-reviews',
  MOVIES: 'movies',
  NAMING_PROMPTS: 'naming-prompts',
  OPPOSING_IDEAS: 'opposing-ideas',
  OBJECT_FEATURES: 'object-features',
  QUANTITATIVE_QUESTIONS: 'quantitative-questions',
  SCENARIOS: 'scenarios',
  SINGLE_WORDS: 'single-words',
  SPY_LOCATIONS: 'spy-locations',
  // SPY_QUESTIONS: 'spy-questions',
  TESTIMONY_QUESTIONS: 'testimony-questions',
  THEMES: 'themes',
  TOPICS: 'topics',
  TWEETS: 'tweets',
};

export const DUAL_LANGUAGE_RESOURCES = [
  RESOURCE_NAMES.ALIEN_ITEMS,
  RESOURCE_NAMES.CONTENDERS,
  RESOURCE_NAMES.CRIME_TILES,
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
  'opposing-ideas': '',
  'single-words': 'text',
  'spy-locations': '',
  'spy-questions': '',
  'testimony-questions': 'question',
  themes: 'text',
  topics: 'text',
};
