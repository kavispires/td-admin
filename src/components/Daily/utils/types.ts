import type { DAILY_GAMES_KEYS } from './constants';

export type DateKey = string; // Format YYYY-MM-DD

interface UnknownFields {
  [key: string]: any;
}

export type DailyHistoryEntry = {
  latestDate: DateKey;
  latestNumber: number;
  used: string;
  reset?: number;
};

export type ParsedDailyHistoryEntry = {
  latestDate: DateKey;
  latestNumber: number;
  used: string[];
  reset: number;
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

/**
 * The result type of a daily generator hook, containing the generated entries, loading state, error state, and history update information.
 */
export type UseDailyGeneratorResponse<T> = {
  /**
   * A dictionary of generated daily game entries, where the key is the entry ID and the value is the corresponding entry object.
   */
  entries: Record<string, T>;
  /**
   * A boolean indicating whether the generator is currently loading data.
   */
  isLoading: boolean;
  /**
   * A boolean indicating whether the generator is currently generating entries.
   */
  isGenerating: boolean;
  /**
   * A boolean indicating whether an error occurred during the generation process.
   */
  isError: boolean;
  /**
   * List of error messages encountered during the generation process.
   */
  errors: string[];
  /**
   * A boolean indicating whether the generator successfully generated entries.
   */
  isSuccess: boolean;
  /**
   * An object containing information about the history update.
   */
  historyUpdate: {
    /**
     * The latest date for which entries were generated.
     */
    latestDate: DateKey;
    /**
     * The latest number assigned to the generated entries.
     */
    latestNumber: number;
    /**
     * An array of IDs of the generated entries that were used in the history update.
     */
    used: string[];
    /**
     * The type of update performed on the history, either adding new entries or replacing existing ones.
     */
    updateType: 'add' | 'replace';
  };
};
