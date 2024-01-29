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
  GALERIA_DE_SONHOS: 'galeria-de-sonhos',
  GROUP_QUESTIONS: 'group-questions',
  LABIRINTO_SECRETO: 'labirinto-secreto',
  LINHAS_CRUZADAS: 'linhas-cruzadas',
  MONSTER_ORIENTATION: 'monster-orientation',
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
  SUSPECTS: 'suspects',
  TESTIMONY_QUESTIONS: 'testimony-questions',
  THEMES: 'themes',
  TOPICS: 'topics',
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
  'opposing-ideas': '',
  'single-words': 'text',
  'spy-locations': '',
  'spy-questions': '',
  'testimony-questions': 'question',
  themes: 'text',
  topics: 'text',
};
