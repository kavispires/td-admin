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
  words: string[];
  letters: string[];
};

export type DailyArtistaEntry = {
  id: DateKey;
  number: number;
  type: 'artista';
  cards: ArteRuimCard[];
};

export type DailyEntry = {
  id: DateKey;
  'arte-ruim': DailyArteRuimEntry;
  'aqui-o': DailyAquiOEntry;
  palavreado: DailyPalavreadoEntry;
  artista: DailyArtistaEntry;
};

export type DataDrawing = {
  cardId: CardId;
  drawing: string;
  level: number;
  playerId: string;
  successRate?: number;
  text: string;
};

export type DataSuffixCounts = {
  drawingsPT: number;
} & UnknownFields;
