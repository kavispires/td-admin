/**
 * Generic text card
 * Used for: adjectives, categories, challenges, characters, galeria-de-sonhos, labirinto-secreto,
 * linhas-cruzadas, scenarios, single-words, spy-questions, things-qualities
 */
export type TextCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The text of the card
   */
  text: string;
  /**
   * Flag indicating if it's nsfw
   */
  nsfw?: boolean;
};

/**
 * Alien Item
 * Used for: alien-items
 */
export type AlienItem = {
  /**
   * Unique identifier for the card
   */
  id: string;
  /**
   * The name of the item
   */
  name: DualLanguageValue;
  /**
   * The dictionary of attribute keys and their values
   */
  attributes: Record<string, -5 | -3 | -1 | 0 | 1 | 3 | 5>;
  /**
   * Flag indicating if it's nsfw
   */
  nsfw?: boolean;
  /**
   * Any categories the item belongs to
   */
  categories?: string[];
};

/**
 * Arte Ruim Card
 * Used for: arte-ruim-cards
 */
export type ArteRuimCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * the text of the card
   */
  text: string;
  /**
   * The level of difficulty of the card (0-5)
   */
  level: number;
};

/**
 * Arte Ruim Card
 * Used for: arte-ruim-groups
 */
export type ArteRuimGroup = {
  /**
   * Unique identifier for the card
   */
  id: string;
  /**
   * The name of the group
   */
  theme: string;
  /**
   * The cards in the group
   */
  cards: Record<ArteRuimCard['id'], ArteRuimCard['text']>;
};

/**
 * Arte Ruim Pair
 * Used for: arte-ruim-pairs
 */
export type ArteRuimPair = {
  /**
   * Unique identifier for the card
   */
  id: string;
  /**
   * The two cards (text) in the pair
   */
  values: [string, string];
};

/**
 * Choice Card
 * Used for: choices
 */
export type ChoiceCard = {
  /**
   * Unique identifier for the card
   */
  id: string;
  /**
   * The type of the card
   */
  type: 'best-of-three' | 'this-that';
  /**
   * The list of options
   */
  options: string[];
  /**
   * The question (only present when type is best-of-three)
   */
  question?: string;
};

/**
 * Contender Card
 * Used for: contenders
 */
export type ContenderCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The name of the contender
   */
  name: DualLanguageValue;
  /**
   * If the contender is exclusive to a language
   */
  exclusivity?: Language;
  /**
   * The groups the contender belongs to
   */
  groups?: string[];
  /**
   * Flag indicating if it's NSFW
   */
  nsfw?: boolean;
};

/**
 * Crime Hediondo Card
 * Used for: crime-evidence, crime-weapons
 */
export type CrimesHediondosCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The type of the card
   */
  type: 'weapon' | 'evidence';
  /**
   * The name of the card
   */
  name: DualLanguageValue;
  /**
   * List of tags related to the card/.
   * It's used to help guess the value for given weapon and evidence pair tags in the scenario
   */
  tags?: string[];
  /**
   * Item Id for the illustration icon
   */
  itemId?: string;
  /**
   * Flag indicating if entry is exclusive to using itemIds
   */
  itemExclusive?: boolean;
};

/**
 * Crime Scene Tile
 * Used for: crime-tiles
 */
export type CrimeSceneTile = {
  /**
   * Unique identifier for the card
   */
  id: string;
  /**
   * The title of the crime scene tile
   */
  title: DualLanguageValue;
  /**
   * The description of the crime scene tile
   */
  description: DualLanguageValue;
  /**
   * Array of values of the crime scene tile (always 6)
   */
  values: DualLanguageValue[];
  /**
   * The type (cause, evidence, location, scene)
   */
  type: string;
  /**
   * Flag indicating if the tile is for evidence or weapons
   */
  specific?: string | null;
  /**
   * Object with a list of tags for each entry value. It's used to help guess the value for given weapon and evidence pair tags in the scenario
   */
  tags?: Record<number | string, string[]>;
};

/**
 * Dating Candidate Card
 * Used for: dating-candidate
 */
export type DatingCandidateCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The text of the card
   */
  text: string;
  /**
   * The type of the card
   */
  type: 'fun-fact' | 'interest' | 'need';
};

/**
 * Dating Candidate Image Card
 * Used for: dating-candidate-heads, dating-candidate-bodies
 */
export type DatingCandidateImageCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The name of the image
   */
  name: DualLanguageValue;
  /**
   * The type of the card
   */
  type: 'head' | 'body';
};

export type DiagramTopics = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The text of the card
   */
  text: string;
  /**
   * The type of the card
   */
  type: 'attribute' | 'word' | 'context';
};

export type DilemmaCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The prompt of the card (usually a prefix)
   */
  prompt: string;
  /**
   * The left option
   */
  left: string;
  /**
   * The right option
   */
  right: string;
  /**
   * Flag indicating if it's nsfw
   */
  nsfw?: boolean;
};

/**
 * Group Question Card
 * Used to build a question with a prefix, number and suffix
 * eg: Name 3 fruits
 * Used for: group-questions
 */
export type GroupQuestionCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The prefix in the question
   */
  prefix: string;
  /**
   * The number in the question
   */
  number: number;
  /**
   * The suffix in the question
   */
  suffix: string;
};

/**
 * Monster Image Orientation data
 * Used for: monster-orientation
 */
export type MonsterImage = {
  /**
   * Unique identifier for the card
   */
  id: string;
  /**
   * The orientation of the card
   */
  orientation: string;
};

/**
 * Movie Card
 * Used for: movies
 */
export type MovieCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The prefix of the title of the movie
   */
  prefix: string;
  /**
   * The suffix of the title of the movie
   */
  suffix: string;
};

/**
 * Movie Review Card
 * Used for: movie-reviews
 */
export type MovieReviewCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * the text of the card
   */
  text: string;
  /**
   * The type of review
   */
  type: 'good' | 'bad';
  /**
   * The parts of the text that should be highlighted
   */
  highlights?: string[];
};

/**
 * Naming Prompt Card
 * Card with a prompt to name something specific
 * eg: Name an animal
 * Used for: naming-prompts
 */
export type NamingPromptCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * the text of the card
   */
  text: string;
  /**
   * The set the card comes from
   */
  set: string;
  /**
   *
   */
  level: number;
};

export type ObjectFeatureCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The text of the feature
   */
  title: DualLanguageValue;
  /**
   * The description of the feature
   */
  description: DualLanguageValue;
  /**
   * The level of difficulty
   */
  level: number;
};

/**
 * Quantitative Question Card
 * Used for: quantitative-questions
 */
export type QuantitativeQuestionCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The question of the card
   */
  question: string;
  /**
   * Flag indicating if the question refers to a range from 0 to 100
   */
  scale?: boolean;
};

/**
 * Spectrum Card
 * eg: Hot - Cold
 * Used for: spectrums
 */
export type SpectrumCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The left side of the spectrum (usually negative)
   */
  left: string;
  /**
   * The right side of the spectrum (usually positive)
   */
  right: string;
};

/**
 * Spy Location Card
 * Use for: spy-locations
 */
export type SpyLocation = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The name of the location
   */
  name: string;
  /**
   * The list of roles belonging to the location
   */
  roles: string[];
};

/**
 * Suspect Card
 * Used for: suspects
 */
export type SuspectCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The name of the suspect
   */
  name: DualLanguageValue;
  /**
   * The gender of the suspect
   */
  gender: string;
  /**
   * The ethnicity of the suspect
   */
  ethnicity: string;
  /**
   * The age range of the suspect
   */
  age: string;
};

/**
 * Testimony Question Card
 * Used for: testimony-questions
 */
export type TestimonyQuestionCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The testimony question text
   */
  question: string;
  /**
   * The testimony question in a form of a statement (that needs to be prefixed with a third person pronoun)
   */
  answer: string;
  /**
   * Flag indicating if it's nsfw
   */
  nsfw?: boolean;
};

/**
 * Thing Prompt Card to usually name something
 * Used for: things-qualities
 */
export type ThingPromptCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The text of the card
   */
  text: string;
  /**
   * Optional description to clarify the text
   */
  description?: string;
};

/**
 * Topic Card
 * Used for: topics
 */
export type TopicCard = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * The topic label
   */
  label: string;
  /**
   * The topic category
   */
  category: string;
  /**
   * The level of difficulty
   */
  level: number;
};

/**
 * Tweet Card
 * Used for: tweets
 */
export type Tweet = {
  /**
   * Unique identifier for the card
   */
  id: CardId;
  /**
   * the text of the card
   */
  text: string;
};

/**
 * Item Card
 * Used for: items
 */
export type Item = {
  /**
   * Unique identifier for the item
   */
  id: string;
  /**
   * The name of the item
   */
  name: DualLanguageValue;
  /**
   * The groups the item can be used in
   */
  groups: string[];
  /**
   * Flag indicating if it's nsfw
   */
  nsfw?: boolean;
};

/**
 * Item Atributes
 */
export type ItemAtributes = {
  /**
   * Unique identifier for the card
   */
  id: string;
  /**
   * The dictionary of attribute keys and their values
   */
  attributes: Record<string, -5 | -3 | -1 | 0 | 1 | 3 | 5>;
};
