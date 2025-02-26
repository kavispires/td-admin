import type { DAILY_GAMES_KEYS } from './constants';

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

type DailyHistoryKey = (typeof DAILY_GAMES_KEYS)[keyof typeof DAILY_GAMES_KEYS];

export type DailyHistory = {
  [key: DailyHistoryKey]: DailyHistoryEntry;
};

export type FirebaseDataDrawing = {
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
