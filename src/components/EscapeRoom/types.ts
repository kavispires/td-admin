type UID = string;
/**
 * Usually composed by `er-<episode>-<mission>-<type>-<number>`
 */
type ERCardId = string;

export interface EscapeRoomEpisode {
  /**
   * The unique id of the escape room episode
   */
  id: UID;
  /**
   * The language of the episode
   */
  language: Language;
  /**
   * The title of the room/episode
   */
  title: string;
  /**
   * The total number of missions in the episode
   * This is not how many missions are under mission, since that object composes all variants of the mission
   */
  total: number;
  /**
   * A episode can have up to 3 levels
   */
  difficulty: 'basic' | 'medium' | 'complex';
  /**
   * The missions
   * Each escape room has different missions, when setting up an episode the host will select if they want a short or long game that determines the number of missions
   */
  missions: Record<string, Mission[]>;
  /**
   * All cards used in all missions
   */
  cards: Record<string, EscapeRoomCardType>;
  /**
   * Last time the mission was updated
   */
  updatedAt: number;
  /**
   * Flag indicating the episode is ready to be played
   */
  ready: boolean;
}

export interface Mission {
  /**
   * The unique id of the mission (composed by cardId + number + variant)
   */
  id: UID;
  /**
   * The number of the mission (an episode must have at least 1 mission and the numbers are must be sequential from 1 to n)
   */
  number: number;
  /**
   * The card id of the mission
   */
  missionId: CardId;
  /**
   * The name of the episode (usually just a roman numeral)
   * TODO: is it needed?
   */
  name?: string;
  /**
   * All cards present in this episode
   */
  cardsIds: ERCardId[];
  /**
   * The cards that represent the solution
   */
  solution: {
    /**
     * The cards that represent the solution
     */
    cardsIds: ERCardId[];
    /**
     * Determine if the cards in the solution must be played in order
     */
    type: 'ordered' | 'all' | 'any';
    /**
     * The message displayed when the solution is played
     */
    message: string;
    /**
     * Each mission must have 10 filler cards
     */
    fillersIds: ERCardId[];
  };
}

export const CARD_TYPES = {
  /**
   * The basic card type that give the directives for the players
   */
  MISSION: 'mission',
  /**
   * Card that should be played when the mission is completed
   */
  COMPLETE_MISSION: 'complete-mission',
  /**
   * Simple text card
   */
  TEXT: 'text',
  /**
   * A single item card
   */
  ITEM: 'item',
  /**
   * A collection of items arranged in certain pattern
   */
  ITEM_COLLECTION: 'item-collection',
  /**
   * Card with an image exclusive to escape rooms
   */
  IMAGE_CLUE: 'image-clue',
  /**
   * Card with image from the td library
   */
  IMAGE_CARD: 'image-card',
  /**
   * Text that will be read to the player
   */
  VOICE: 'voice',
  /**
   * Audio that will be played to the player
   */
  AUDIO: 'audio',
  /**
   * List of text displayed with numbers
   */
  ORDERED_LIST: 'ordered-list',
  /**
   * List of text displayed with bullets
   */
  UNORDERED_LIST: 'unordered-list',
  /**
   *
   */
  GLYPH: 'glyph',
  /**
   *
   */
  WORD: 'word',
  /**
   * Card with a single number
   */
  DIGIT: 'digit',
  /**
   * Card with numbers
   */
  NUMBER: 'number',
  /**
   * Card with a single letter
   */
  LETTER: 'letter',
} as const;

/**
 * CARD TYPES
 * - mission
 * - Image clue (escape room exclusive)
 * - Clue sprite (escape room exclusive)
 * - Audio (phone call, call center, machine)
 * - Item
 * - Phone Text
 * - Image card
 * - Glyph
 * - Word
 */

export type ERDefaultCard = {
  /**
   * The unique id of the card (usually room prefix + number)
   */
  id: ERCardId;
  /**
   * The type of card which determines its content
   */
  type: (typeof CARD_TYPES)[keyof typeof CARD_TYPES];
  /**
   * Overall style variant (TBD)
   */
  variant?: 'default' | string;
  /**
   * Styles applied to the card
   * TODO: Is it needed? Maybe it should always be variants
   */
  style?: unknown;
  /**
   * All cards should be playable except for missions and some edge cases
   */
  unplayable?: boolean;
  /**
   * Flag indicating the card is a filler card
   * Each room should distribute equal number of cards among the players
   * So these are use to fill the gap
   */
  filler?: boolean;
  /**
   * The title of the card
   * It could be just 'card'
   */
  title?: string;
  /**
   * The representative icon of the card type/role
   */
  spriteId?: string;
  /**
   * Content that varies depending on the card type
   */
  content: unknown;
};

export type ERMissionCard = ERDefaultCard & {
  type: typeof CARD_TYPES.MISSION;
  content: {
    number: number;
    title: string;
    subtitle?: string;
    paragraphs: string[];
  };
};

export type ERCompleteMissionCard = ERDefaultCard & {
  type: typeof CARD_TYPES.COMPLETE_MISSION;
  content: null;
};

export type ERTextCard = ERDefaultCard & {
  type: typeof CARD_TYPES.TEXT;
  content: {
    spriteId?: string;
    text: string;
  };
};

export type ERItemCard = ERDefaultCard & {
  type: typeof CARD_TYPES.ITEM;
  content: {
    itemId: CardId;
    name?: string;
  };
};

export type ERItemCollectionCard = ERDefaultCard & {
  type: typeof CARD_TYPES.ITEM_COLLECTION;
  content: {
    itemsIds: CardId[];
    pattern: string;
    backgroundColor: string;
  };
};

export type ERImageClueCard = ERDefaultCard & {
  type: typeof CARD_TYPES.IMAGE_CLUE;
  content: {
    imageId: string;
    description?: string;
  };
};

export type ERImageCard = ERDefaultCard & {
  type: typeof CARD_TYPES.IMAGE_CARD;
  // TODO: TBD
  content: unknown;
};

export type ERVoiceCard = ERDefaultCard & {
  type: typeof CARD_TYPES.VOICE;
  // TODO: TBD
  content: unknown;
};

export type ERAudioCard = ERDefaultCard & {
  type: typeof CARD_TYPES.AUDIO;
  // TODO: TBD
  content: unknown;
};

export type EROrderedListCard = ERDefaultCard & {
  type: typeof CARD_TYPES.ORDERED_LIST;
  // TODO: TBD
  content: unknown;
};

export type ERUnorderedListCard = ERDefaultCard & {
  type: typeof CARD_TYPES.UNORDERED_LIST;
  // TODO: TBD
  content: unknown;
};

export type ERGlyphCard = ERDefaultCard & {
  type: typeof CARD_TYPES.GLYPH;
  // TODO: TBD
  content: unknown;
};

export type ERWordCard = ERDefaultCard & {
  type: typeof CARD_TYPES.WORD;
  // TODO: TBD
  content: unknown;
};

export type EscapeRoomCardType =
  | ERMissionCard
  | ERCompleteMissionCard
  | ERImageClueCard
  | ERImageCard
  | ERVoiceCard
  | ERAudioCard
  | ERTextCard
  | EROrderedListCard
  | ERUnorderedListCard
  | ERItemCard
  | ERGlyphCard
  | ERItemCollectionCard
  | ERWordCard;
