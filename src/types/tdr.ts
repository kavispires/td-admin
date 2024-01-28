/**
 * Generic text card
 * Games that use: linhas-cruzadas, single-word
 */
export type TextCard = {
  id: CardId;
  text: string;
};

export type ArteRuimCard = {
  id: CardId;
  text: string;
  level: number;
};

export type ArteRuimGroup = {
  id: string;
  theme: string;
  cards: Record<CardId, string>;
};

export type ArteRuimPair = {
  id: string;
  values: [string, string];
};

export type ContenderCard = {
  id: CardId;
  name: DualLanguageValue;
  exclusivity?: Language;
  groups?: string[];
  nsfw?: boolean;
};

export type CrimeTile = {
  id: string;
  title: DualLanguageValue;
  description: DualLanguageValue;
  values: DualLanguageValue[];
  type: string;
  specific?: string | null;
  tags?: Record<number | string, string[]>;
};

export type GroupQuestionCard = {
  id: CardId;
  prefix: string;
  number: number;
  suffix: string;
};

export type NamingPromptCard = {
  id: CardId;
  text: string;
  set: string;
  level: number;
};

export type OpposingIdeaCard = {
  id: CardId;
  left: string;
  right: string;
};

export type SpyLocation = {
  id: CardId;
  name: string;
  roles: string[];
};

export type TestimonyQuestionCard = {
  id: CardId;
  question: string;
  answer: string;
  nsfw?: boolean;
};

export type ThemeCard = {
  id: CardId;
  text: string;
  description?: string;
};

export type Tweet = {
  id: CardId;
  text: string;
  custom?: boolean;
};

export type TopicCard = {
  id: CardId;
  label: string;
  category: string;
  level: number;
};

export type DatingCandidateCard = {
  id: CardId;
  text: string;
  type: 'fun-fact' | 'interest' | 'need';
};

export type DatingCandidateImageCard = {
  id: CardId;
  name: DualLanguageValue;
  type: 'head' | 'body';
};

export type DilemmaCard = {
  id: CardId;
  prompt: string;
  left: string;
  right: string;
  nsfw?: boolean;
};

export type QuantitativeQuestionCard = {
  id: CardId;
  question: string;
  scale?: boolean;
};

export type MovieCard = {
  id: CardId;
  prefix: string;
  suffix: string;
};

export type MovieReviewCard = {
  id: CardId;
  text: string;
  type: 'good' | 'bad';
  highlights?: string[];
};

export type AlienItem = {
  id: string;
  name: DualLanguageValue;
  attributes: Record<string, -5 | -3 | -1 | 0 | 1 | 3 | 5>;
  nsfw?: boolean;
  categories?: string[];
};

export type ObjectFeatureCard = {
  id: CardId;
  title: DualLanguageValue;
  description: DualLanguageValue;
  level: number;
};
