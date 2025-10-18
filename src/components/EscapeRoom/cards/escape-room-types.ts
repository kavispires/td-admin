/**
 * Version 1.0.0 // Oct, 13, 2025
 */

type UID = string;

/**
 * Usually composed by `er-<type>-<number>`
 * TODO: TBD
 */
type ERCardId = string;

export interface EscapeRoomDatabase {
  missionSets: EscapeRoomSet[];
  cards: Record<ERCardId, EscapeRoomCardType>;
}

export interface EscapeRoomSet {
  /**
   * The unique id of the escape room set (it should prefix the mission card id)
   */
  id: UID;
  /**
   * The language of the set
   */
  language: Language;
  /**
   * The title of the room/set
   */
  title: string;
  /**
   * The documentation for the room/set (short description)
   */
  doc: string;
  /**
   * A episode can have up to 3 levels
   */
  difficulty: 'basic' | 'medium' | 'complex';
  /**
   * Mission variations (they all do the same mission with small differences, or slightly different solutions)
   */
  missions: MissionBriefing[];
  /**
   * Last time the mission was updated
   */
  updatedAt: number;
  /**
   * Flag indicating the episode is ready to be played
   */
  ready: boolean;
}

export interface MissionBriefing {
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
   * The name of the mission
   */
  name: string;
  /**
   * The level of difficulty for the mission
   */
  level: 1 | 2 | 3 | 4 | 5;
  /**
   * Background illustration for the mission (if any)
   */
  illustrationId?: CardId;
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
     * - 'ordered': the cards must be played in the exact order as in the array
     * - 'all': all cards must be played but order doesn't matter
     * - 'any': any of the cards can be played to complete the mission
     */
    type: 'ordered' | 'all' | 'any';
    /**
     *  custom message displayed when the solution is played (if any)
     * If none is provided a default message will be shown
     */
    message?: string;
  };
}

export const CARD_TYPES = {
  ANNOUNCEMENT: 'announcement',
  MISSION: 'mission',
  IMAGE: 'image',
  LEVER: 'lever',
  WORD: 'word',
  NUMBER: 'number',
  LETTER: 'letter',
  SPRITE: 'sprite',
  CONTENT: 'content',
} as const;

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
   * Quick description of the card
   */
  doc: string;
  /**
   * Overall style variant (TBD)
   */
  background: string;
  /**
   * All cards should be playable except for missions and some edge cases
   */
  unplayable?: boolean;
  /**
   * Last time the card was updated
   */
  updatedAt: number;
};

export const CARD_CONTENT_TYPES = {
  TITLE: 'title',
  TEXT_BOX: 'text-box',
  LABEL: 'label',
  SVG_ICON: 'svg-icon',
  MISSION: 'mission',
  // COMPLETE_MISSION: 'complete-mission',
  // MISSION_HELP: 'mission-help',
  SPRITE: 'sprite',
  SPRITE_GRID: 'sprite-grid',
  SPRITE_SEQUENCE: 'sprite-sequence',
  SPRITE_SHUFFLE: 'sprite-shuffle',
  SPRITE_WHEEL: 'sprite-wheel',
  IMAGE_CARD_COVER: 'image-card-cover',
  IMAGE_CARD: 'image-card',
  IMAGE_CARD_SEQUENCE: 'image-card-sequence',
  VOICE: 'voice',
  AUDIO: 'audio',
  CALENDAR: 'calendar',
  CODEX: 'codex',
  DIGIT: 'digit',
  NUMBER: 'number',
  LETTER: 'letter',
  // CLOCK: 'clock',
  // BATTERY: 'battery',
  // SPEECH_BUBBLE: 'speech-bubble',
  // SURFACE: 'surface', // menu, paper, note, panel
  // PAPER_FRAGMENT: 'paper-fragment',
} as const;

/**
 * Card to announce something to the players
 * It has a title and an optional subtitle
 * e.g Complete Mission, Help Card
 */
export type EscapeRoomAnnouncementType = ERDefaultCard & {
  type: typeof CARD_TYPES.ANNOUNCEMENT;
  content: {
    title?: {
      value: string;
      position: Pos;
      color?: string;
      align?: Align;
      variant?: BoxVariant;
      size?: Size;
    };
    subtitle?: {
      value: string;
      position: Pos;
      color?: string;
      align?: Align;
      variant?: BoxVariant;
      size?: Size;
    };
  };
};

/**
 * Card to describe a mission
 * It has blocks of text with title, subtitle and paragraphs
 */
export type EscapeRoomMissionCardType = ERDefaultCard & {
  type: typeof CARD_TYPES.MISSION;
  number: number;
  content: {
    title: {
      value: string;
    };
    paragraphs: {
      value: string; // markdown
    };
    action: {
      value: string; // markdown
    };
  };
};

export type EscapeRoomWordCardType = ERDefaultCard & {
  type: typeof CARD_TYPES.WORD;
  content: {
    word: string;
    position: Pos;
    align?: Align;
    size?: Size;
    color?: string;
    borderColor?: string;
    borderWidth?: number;
  };
};

export type EscapeRoomSpriteCardType = ERDefaultCard & {
  type: typeof CARD_TYPES.SPRITE;
  content: {
    position: Pos;
    sprite: SpriteEntry;
    name?: string;
    description?: string;
  };
};

export type EscapeRoomImageCardType = ERDefaultCard & {
  type: typeof CARD_TYPES.IMAGE;
  content: never;
};

/**
 * Card with various content types
 */
export type EscapeRoomContentCardType = ERDefaultCard & {
  type: typeof CARD_TYPES.CONTENT;
  content: EscapeRoomCardContentType[];
};

/**
 * Position in the rows grid of the content
 */
export type Pos = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;
type GridPos = { pos: Pos };

/**
 * Basic internal types
 */
export type Size = 'small' | 'medium' | 'large';
export type Align = 'left' | 'center' | 'right';
export type Direction = 'horizontal' | 'vertical';
export type BoxVariant = 'contained' | 'boxed' | 'button' | 'transparent' | 'highlighted';
export type ImageCardScale = 1 | 2 | 3;
export type SpriteLibraries = 'items' | 'warehouse-goods' | 'glyphs' | 'alien-signs' | 'emojis';
export type SpriteEntry = {
  library: SpriteLibraries;
  spriteId: string;
  scale?: number;
  rotate?: number;
};

/**
 * Renders a title
 */
export type TitleContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.TITLE;
  text: string;
  variant?: BoxVariant;
  size?: Size;
  align?: Align;
};

/**
 * Renders a larger text, used for single word or short phase
 */
export type LabelContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.LABEL;
  label: string;
  variant?: BoxVariant;
  size?: Size;
  align?: Align;
};

/**
 * Renders a container with text, paragraph
 */
export type TextBoxContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.TEXT_BOX;
  text: string;
  variant?: BoxVariant;
  size?: Size;
  align?: Align;
};

/**
 * Renders a icon from the Escape Room sprite internal library
 */
export type SGVIconContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.SVG_ICON;
  iconId: string;
  align?: Align;
};

/**
 * Renders a sprite from the TD libraries
 */
export type SpriteContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.SPRITE;
  size?: Size;
} & SpriteEntry;

/**
 * Renders a collection of sprites in a random (predictable) order.
 * Max of 24 sprites
 */
export type SpriteShuffleContent = GridPos & {
  pos: number;
  type: typeof CARD_CONTENT_TYPES.SPRITE_SHUFFLE;
  library: SpriteLibraries;
  spriteIds: string[];
};

/**
 * Renders a grid of sprites.
 * Max of 12 sprites
 */
export type SpriteGridContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.SPRITE_GRID;
  library: SpriteLibraries;
  spriteIds: (string | null)[];
  scale?: number[];
  rotate?: number[];
};

/**
 * Renders a sequence of sprites.
 * Max of 10 sprites (5 recommended)
 */
export type SpriteSequenceContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.SPRITE_SEQUENCE;
  library: SpriteLibraries;
  spriteIds: string[];
  direction?: Direction;
};

/**
 * Renders a wheel of sprites.
 * Max of 12 sprites
 */
export type SpriteWheelContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.SPRITE_WHEEL;
  library: SpriteLibraries;
  /**
   * Max: 12
   */
  spriteIds: (string | null)[];
  colors: (string | null)[];
  pointer?: number;
};

/**
 * Renders a background image.
 * This replaces the background image
 */
export type ImageCardCoverContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.IMAGE_CARD_COVER;
  cardId: string;
};

/**
 * Renders an image card
 */
export type ImageCardContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.IMAGE_CARD;
  cardId: string;
  /**
   * Value 1-3
   * The images are roughly 1/5 of the card width and default at scale 1
   */
  scale?: ImageCardScale;
  align?: Align;
};

/**
 * Renders a sequence of image cards
 */
export type ImageCardSequenceContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.IMAGE_CARD_SEQUENCE;
  cardIds: string[];
  scale?: ImageCardScale;
  align?: Align;
};

/**
 * Renders a browser voice button.
 * It may have a illustrative iconId from the ER illustrative icon sprites
 */
export type VoiceContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.VOICE;
  text: string;
  iconId?: string;
  speaker?: SpriteEntry;
};

/**
 * Renders a playable audio file.
 * It may have a illustrative iconId from the ER illustrative icon sprites
 */
export type AudioContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.AUDIO;
  url: string;
  iconId?: string;
  device?: SpriteEntry;
};

/**
 * Renders a calendar with some das highlighted in given color
 */
export type CalendarContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.CALENDAR;
  /**
   * 0-6 (Sunday-Saturday)
   */
  startAt?: number;
  /**
   * 28, 29, 30, 31 (default: 30)
   */
  totalDays?: number;
  /**
   * What days should be highlighted
   */
  highlights: number[];
  /**
   * The color of the highlights
   */
  highlightsColor?: string;
};

/**
 * Renders a 2xN table of entries, usually indicating that values on the left correspond to the right
 */
export type CodexContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.CODEX;
  /**
   * The 2xN table of entries
   */
  table: (SpriteEntry | string)[];
};

/**
 * Renders a single digit (0-9)
 */
export type DigitContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.DIGIT;
  value: number;
  size?: Size;
  align?: Align;
};

/**
 * Renders a single letter (A-Z)
 */
export type LetterContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.LETTER;
  letter: string;
  size?: Size;
  align?: Align;
};

/**
 * TODO: I don't know if this is needed
 */
export type NumberContent = GridPos & {
  type: typeof CARD_CONTENT_TYPES.NUMBER;
  value: number;
  size?: Size;
  align?: Align;
};

export type EscapeRoomCardType =
  | EscapeRoomAnnouncementType
  | EscapeRoomMissionCardType
  | EscapeRoomWordCardType
  | EscapeRoomSpriteCardType
  | EscapeRoomImageCardType
  | EscapeRoomContentCardType;

export type EscapeRoomCardContentType =
  | TitleContent
  | TextBoxContent
  | LabelContent
  | SGVIconContent
  | SpriteContent
  | SpriteGridContent
  | SpriteShuffleContent
  | SpriteSequenceContent
  | SpriteWheelContent
  | ImageCardCoverContent
  | ImageCardContent
  | ImageCardSequenceContent
  | VoiceContent
  | AudioContent
  | CalendarContent
  | CodexContent
  | DigitContent
  | LetterContent
  | NumberContent;
