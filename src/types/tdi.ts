export type CrimesHediondosCard = {
  id: CardId;
  type: string;
  name: DualLanguageValue;
  tags?: string[];
  itemId?: string;
  itemExclusive?: boolean;
};

export type MonsterCard = {
  id: string;
  orientation: string;
};

export type SuspectCard = {
  id: CardId;
  name: DualLanguageValue;
  gender: string;
  ethnicity: string;
  age: string;
};
