import { ArteRuimCard } from 'types';

export type DateKey = string; // Format YYYY-MM-DD

interface UnknownFields {
  [key: string]: any;
}

export type DailyHistoryEntry = {
  latestDate: DateKey;
  latestNumber: number;
  used: string;
};

export type ParsedDailyHistoryEntry = {
  latestDate: DateKey;
  latestNumber: number;
  used: string[];
};

export type DailyHistory = {
  'arte-ruim': DailyHistoryEntry;
  'aqui-o': DailyHistoryEntry;
  palavreado: DailyHistoryEntry;
  artista: DailyHistoryEntry;
  filmaco: DailyHistoryEntry;
  'controle-de-estoque': DailyHistoryEntry;
  'teoria-de-conjuntos': DailyHistoryEntry;
  'comunicacao-alienigena': DailyHistoryEntry;
};

export type DailyArteRuimEntry = {
  id: DateKey;
  number: number;
  type: 'arte-ruim';
  language: Language;
  cardId: CardId;
  text: string;
  drawings: string[];
  dataIds: string[];
};

export type DailyAquiOEntry = {
  id: DateKey;
  number: number;
  type: 'aqui-o';
  setId: string;
  title: DualLanguageValue;
  itemsIds: string[];
};

export type DailyPalavreadoEntry = {
  id: DateKey;
  number: number;
  type: 'palavreado';
  keyword: string;
  words: string[];
  letters: string[];
};

export type DailyArtistaEntry = {
  id: DateKey;
  number: number;
  type: 'artista';
  cards: ArteRuimCard[];
};

export type DailyFilmacoEntry = {
  id: DateKey;
  number: number;
  type: 'filmaco';
  setId: string;
  title: string;
  itemsIds: string[];
  year: number;
};

export type DailyControleDeEstoqueEntry = {
  id: DateKey;
  number: number;
  type: 'controle-de-estoque';
  language: Language;
  title: string;
  goods: string[];
  orders: string[];
};

export type DailyTeoriaDeConjuntosEntry = {
  id: DateKey;
  number: number;
  type: 'teoria-de-conjuntos';
  title: string;
  level: number;
  setId: string;
  rule1: {
    id: string;
    text: string;
    level: number;
    thing: {
      id: string;
      name: string;
    };
  };
  rule2: {
    id: string;
    text: string;
    level: number;
    thing: {
      id: string;
      name: string;
    };
  };
  intersectingThing: {
    id: string;
    name: string;
  };
  things: {
    id: string;
    name: string;
    rule: number;
  }[];
};

type DailyAlienGameAttribute = {
  id: string;
  name: string;
  description: string;
  spriteId: string;
  itemsIds: string[];
};

type DailyAlienGameRequest = {
  spritesIds: string[];
  itemId: string;
};

export type DailyComunicacaoAlienigenaEntry = {
  id: string;
  setId: string;
  number: number;
  type: 'comunicação-alienígena';
  attributes: DailyAlienGameAttribute[];
  requests: DailyAlienGameRequest[];
  solution: string;
  itemsIds: string[];
  valid?: boolean;
};

export type DailyEntry = {
  id: DateKey;
  'arte-ruim': DailyArteRuimEntry;
  'aqui-o': DailyAquiOEntry;
  palavreado: DailyPalavreadoEntry;
  artista: DailyArtistaEntry;
  filmaco: DailyFilmacoEntry;
  'controle-de-estoque': DailyControleDeEstoqueEntry;
  'teoria-de-conjuntos': DailyTeoriaDeConjuntosEntry;
  'comunicacao-alienigena': DailyComunicacaoAlienigenaEntry;
};

export type DataDrawing = {
  cardId: CardId; // this or id?
  id: CardId; // this or cardId?
  drawing: string;
  level: number;
  playerId: string;
  successRate?: number;
  text: string;
};

export type DataSuffixCounts = {
  drawingsPT: number;
} & UnknownFields;
