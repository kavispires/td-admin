type AvailableResources = string[];

type Language = 'pt' | 'en';

type DualLanguageValue = {
  pt: string;
  en: string;
};

type PlainObject = {
  [key: string]: any;
};
type FirebaseContext = {
  [key: string]: any;
};

type BooleanDictionary = {
  [key: string]: boolean;
};

type NumberDictionary = {
  [key: string]: number;
};

type StringDictionary = {
  [key: string]: string;
};

type ObjectDictionary = {
  [key: string]: PlainObject;
};

type CardId = string;

type ArteRuimCard = {
  id: CardId;
  text: string;
  level: number;
};

type ArteRuimGroup = {
  id: string;
  theme: string;
  cards: Record<string, CardId>;
};

type Tag = string;

interface CrimesHediondosCard {
  id: CardId;
  type: 'weapon' | 'evidence';
  name: DualLanguageValue;
  tags?: Tag[];
}

interface CrimesHediondosTile {
  id: string;
  title: DualLanguageValue;
  description: DualLanguageValue;
  values: DualLanguageValue[];
  type: string;
  specific?: string | null;
  tags?: Record<number | string, string[]>;
}
