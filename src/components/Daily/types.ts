export type DateKey = string; // Format YYYY-MM-DD

interface UnknownFields {
  [key: string]: any;
}

export type DailyHistory = {
  latestDate: DateKey;
  latestNumber: number;

  used: CardId[];
};

export type DailyEntry = {
  id: DateKey;
  number: number;
  type: string;
  language: Language;
  cardId: CardId;
  text: string;
  drawings: string[];
  dataIds: string[];
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
