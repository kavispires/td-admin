/** * Represents a Unique Identifier used across the database.
 */
export type UID = string;

/**
 * Represents a specific playable variation of a Room to allow for replayability.
 */
export interface RoomVersion {
  /** Unique identifier for this version (e.g., 1, 2, 3) */
  versionId: number;

  /** Minimum number of cards each player must hold in their hand. */
  minCardsPerPlayer: number;

  /** The distribution of cards required for this specific version. */
  pools: {
    /** Cards that can be moved to the table to solve the mission, correct or not and are essential for gameplay. */
    playable: UID[];

    /** Non-playable cards required for deduction (e.g., maps, rules). */
    info: UID[];

    /** Unrelated cards used purely to meet the minimum card count per player and if any is omitted, the gameplay should not be affected. */
    fillers: UID[];

    /** The mission card(s) providing the instructions for this version. */
    missions: UID[];
  };

  /** The logic and required cards to successfully pass this version. */
  solution: {
    /**
     * 'ordered': Exact sequence required.
     * 'all': All listed cards must be played, any order.
     * 'any': If any or all of the listed cards are played, it is valid.
     */
    type: 'ordered' | 'all' | 'any';

    /** The specific Card UIDs that make up the solution. */
    cardIds: UID[];

    /** Optional narrative message displayed when the mission is passed. */
    message?: string;
  };
}

/**
 * The core Room definition containing the narrative and all its playable versions.
 */
export interface Room {
  /** Unique identifier for the room (e.g., "room-tutorial-01") */
  id: UID;

  /** The title of the room/episode */
  title: string;

  /** The language the room is written in */
  language: 'en' | 'pt';

  /** Categorization of the room (e.g., "tutorial", "logic", "math") */
  type: string;

  /** A brief summary of what the room is without giving details or spoilers */
  description: string;

  /** Internal developer reference containing spoilers and deep mechanics */
  doc: string;

  /** Visual rendering properties for the room environment */
  appearance: {
    backgroundId: string;
    colorScheme: 'light' | 'dark';
  };

  /** Difficulty scale (1 = Easy, 2 = Medium, 3 = Hard) */
  difficulty: number;

  /** Date the room was last modified (in milliseconds) */
  updatedAt: number;

  /** Determines if a room is complete and ready to be injected into a game */
  ready: boolean;

  /**
   * Array of variations available for this room.
   * Each variation represents a different playable version of the room.
   * Each room should have at least 3 ready versions.
   */
  versions: RoomVersion[];
}

/** * Actions that trigger specific engine mechanics when a card is played.
 */
export const CARD_ACTIONS = {
  COMPLETE_MISSION: 'COMPLETE_MISSION',
  HELP: 'HELP',
} as const;

/** * Type representing the available card actions.
 */
export type CardAction = (typeof CARD_ACTIONS)[keyof typeof CARD_ACTIONS];

/** * All possible card variations supported by the engine.
 */
export const CARD_TYPES = {
  MISSION: 'mission',
  ACTION: 'action',
  WORD: 'word',
  NUMBER: 'number',
  DIGIT: 'digit',
  LETTER: 'letter',
  ROUTE: 'route',
  PAPER_FRAGMENT: 'paperFragment',
  SPRITE_SHUFFLE: 'spriteShuffle',
  SPRITE: 'sprite',
  VOICE: 'voice',
  AUDIO: 'audio',
  LEVER: 'lever',
  PERSON: 'person',
  IMAGE: 'image',
  BATTERY: 'battery',
  CODEX: 'codex',
  DOUGHNUT: 'doughnut',
  SEQUENCE: 'sequence',
  GRID: 'grid',
  CALENDAR: 'calendar',
  IMAGE_SEQUENCE: 'imageSequence',
  CLOCK: 'clock',
  SURFACE: 'surface',
  DIAL: 'dial',
  COMPASS: 'compass',
  DECODER_WHEEL: 'decoderWheel',
} as const;

/** * Type representing the available card types.
 */
export type CardType = (typeof CARD_TYPES)[keyof typeof CARD_TYPES];

/** * Alignment options for positioning elements within a card.
 */
export type Alignment =
  | 'topLeft'
  | 'topCenter'
  | 'topRight'
  | 'centerLeft'
  | 'center'
  | 'centerRight'
  | 'bottomLeft'
  | 'bottomCenter'
  | 'bottomRight';

/** * A standardized value used across complex data structures like Grids, Dials, and Sequences.
 */
export interface CardValue {
  /** The semantic type of the value being represented. */
  type: 'sprite' | 'digit' | 'letter';
  /** The actual text character or the spriteId reference. */
  value: string;
}

/** * The fundamental properties that every card must have.
 */
export interface BaseCard {
  /** Unique identifier for the card (e.g., "er-bp-word-1-pt"). */
  id: UID;
  /** Determines the layout, logic, and expected data payload of the card. */
  type: CardType;
  /** Internal developer reference and notes for maintaining the library. */
  doc: string;
  /** Date the card was last modified (in milliseconds). */
  updatedAt: number;
  /** Image identifier used for the background of the card. */
  backgroundId?: string;
  /** High-level animation trigger for the card component wrapper. */
  animate?: boolean;
  /** Meta-rule restricting how the player can interact with or communicate about the card. */
  condition?: 'secret';
}

// --- SPECIFIC DATA PAYLOADS ---

/** * Data payload for cards that trigger engine mechanics.
 */
export interface ActionData {
  /** The specific action constant to fire when played. */
  action: CardAction;
}

/** * Data payload for cards providing instructions and narrative.
 */
export interface MissionData {
  /** The title or headline of the mission card. */
  title: string;
  /** The ordered number that the mission card should be read */
  number: number;
  /** The main body text of the mission card, supporting Markdown formatting. */
  markdownText: string;
}

/** * Data payload for Word and Number cards containing multi-character text.
 */
export interface TextData {
  /** The text to display. */
  text: string;
  /** Optional hex code or named color. */
  color?: string;
  /** Font sizing category. */
  size?: 'small' | 'medium' | 'large';
  /** Where the text should sit on the card. */
  alignment?: Alignment;
}

/** * Data payload for single characters (Digit or Letter).
 */
export interface CharData {
  /** The single character string to display. */
  text: string;
  /** Optional hex code or named color. */
  color?: string;
  /** * Font sizing category.
   * Note: In the UI, these sizes render substantially larger than TextData sizes.
   */
  size?: 'small' | 'medium' | 'large';
  /** Where the character should sit on the card. */
  alignment?: Alignment;
}

/** * Data payload for a card displaying a single sprite or icon.
 */
export interface SpriteData {
  /** The reference ID for the sprite asset. */
  spriteId: string;
  /** Optional text displayed alongside or underneath the sprite. */
  name?: string;
  /** Sizing category for the sprite image. */
  size?: 'small' | 'medium' | 'large';
  /** Where the sprite should sit on the card. */
  alignment?: Alignment;
}

/** * Data payload for cards that overlay text onto a background image (Routes, Levers, etc.).
 */
export interface OverlayData {
  /** Array of labels to absolute-position over the background image. */
  labels: Array<{
    /** The text to display. */
    text: string;
    /** X coordinate as a percentage (0-100). */
    x: number;
    /** Y coordinate as a percentage (0-100). */
    y: number;
    /** Optional hex code or named color. */
    color?: string;
    /** Font sizing category. */
    size?: 'small' | 'medium' | 'large';
  }>;
}

/** * Data payload for counting puzzles where sprites are deterministically scattered.
 */
export interface SpriteShuffleData {
  /** Array defining the specific sprites and their quantities to render. */
  seedItems: Array<{
    /** The reference ID for the sprite asset. */
    spriteId: string;
    /** The exact number of times this sprite should appear. */
    count: number;
  }>;
}

/** * Data payload for cards that output sound via audio file or text-to-speech.
 */
export interface MediaData {
  /** URL reference for an 'audio' type card. */
  audioUrl?: string;
  /** The string to be read aloud for a 'voice' type card. */
  script?: string;
  /** The specific TTS voice profile to use (e.g., 'pt-BR-standard-A'). */
  voiceId?: string;
}

/** * Data payload for a battery state indicator.
 */
export interface BatteryData {
  /** Text written under or on the battery. */
  label?: string;
}

/** * Data payload for a table/grid used as a deciphering key or reference sheet.
 */
export interface CodexData {
  /** Defines the table column count. */
  cols: number;
  /** Defines the table row count. */
  rows: number;
  /** Array of cells, read left-to-right, top-to-bottom. */
  cells: Array<{
    /** The type of content within the cell. */
    type: 'text' | 'sprite';
    /** The text string or the spriteId reference. */
    value: string;
    /** Optional background color for specific cells to stand out. */
    highlightColor?: string;
  }>;
}

/** * Data payload for circular logic wheels with segmented portions.
 */
export interface DoughnutData {
  /** The individual slices of the doughnut chart. */
  segments: Array<{
    /** Text to display inside the segment. */
    label: string;
    /** The relative size/proportion of this slice compared to others. */
    weight: number;
    /** The background color of the slice. */
    color: string;
  }>;
}

/** * Data payload for a linear sequence of values.
 */
export interface SequenceData {
  /** Determines the layout direction of the sequence. */
  orientation: 'horizontal' | 'vertical';
  /** The ordered items comprising the sequence. */
  items: Array<CardValue>;
}

/** * Data payload for multidimensional sequences or deduction logic grids.
 */
export interface GridData {
  /** Total number of columns (1-6). */
  cols: 1 | 2 | 3 | 4 | 5 | 6;
  /** Total number of rows (1-6). */
  rows: 1 | 2 | 3 | 4 | 5 | 6;

  /** Optional headers for deduction grids. Omit for standard Sequence Grids. */
  colHeaders?: CardValue[];
  /** Optional headers for deduction grids. Omit for standard Sequence Grids. */
  rowHeaders?: CardValue[];

  /** The individual cells defined by x/y coordinates. */
  cells: Array<{
    /** 0-indexed column coordinate. */
    x: number;
    /** 0-indexed row coordinate. */
    y: number;
    /** * The visual state of the cell.
     * 'value' = standard grid item (shows CardValue)
     * 'check' / 'cross' = logic grid deduction marks
     * 'empty' = explicitly blank cell
     */
    state: 'value' | 'check' | 'cross' | 'empty';
    /** Required if state is 'value'. */
    value?: CardValue;
  }>;
}

/** * Data payload for a calendar month visual puzzle.
 */
export interface CalendarData {
  /** Optional title for the calendar (e.g., "October"). */
  monthName?: string;
  /** Total days to display in the month block. */
  totalDays: number;
  /** The weekday the 1st of the month falls on (0 = Sunday, 1 = Monday, etc.). */
  startDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** Specific days to annotate for a puzzle. */
  markedDays: Array<{
    /** The day number to annotate. */
    day: number;
    /** The visual style of the annotation. */
    markType: 'circle' | 'cross' | 'square' | 'highlight';
    /** Color override for the annotation. */
    color?: string;
  }>;
}

/** * Data payload for displaying a grid of images.
 */
export interface ImageSequenceData {
  /** The predefined layout format for the images. */
  layout: '1x2' | '2x2' | '3x3' | '2x3';
  /** Array of backgroundIds or image URLs. */
  imageIds: string[];
}

/** * Data payload for a clock face puzzle.
 */
export interface ClockData {
  /** The hour hand position (1-12 or 0-23). */
  hours: number;
  /** The minute hand position (0-59). */
  minutes: number;
  /** Determines if a third hand is rendered. */
  hasSecondHand?: boolean;
  /** The second hand position (0-59). */
  seconds?: number;
}

/** * Data payload for rendering text over specific thematic UI surfaces.
 */
export interface SurfaceData {
  /** Determines the UI background and standard layout applied to the text. */
  surfaceType: 'restaurantMenu' | 'notebook' | 'postIt' | 'panel';
  /** Supports Markdown for formatting lists, bold text, etc., mapped to the surface. */
  markdownText: string;
}

/** * Data payload for a character card with optional dialogue.
 */
export interface PersonData {
  /** The name of the character. */
  name?: string;
  /** Supports Markdown for formatting the character's dialogue over their image. */
  speechBubble?: string;
}

/** * Data payload for a visual meter/gauge puzzle.
 */
export interface DialData {
  /** Visual flavor of the gauge UI. */
  dialType?: 'speedometer' | 'thermometer' | 'pressure';
  /** The values distributed around the perimeter of the dial. */
  ticks: CardValue[];
  /** The exact index of the `ticks` array that the needle points toward. */
  pointerIndex: number;
}

/** * Data payload for directional/compass rose puzzles.
 */
export interface CompassData {
  /** Optional icon or value sitting in the center of the compass rose. */
  center?: CardValue;
  /** The points around the compass rose. */
  points: Array<{
    /** Directional label (e.g., 'N', 'NE', '045', or simply '1', '2'). */
    bearing: string;
    /** Optional value to place at this bearing. */
    value?: CardValue;
    /** Highlights the specific path/bearing for routing deduction. */
    isHighlighted?: boolean;
  }>;
}

/** * Data payload for cryptex/decoder wheel alignment puzzles.
 */
export interface DecoderWheelData {
  /** The concentric circles making up the decoder. Index 0 is the innermost ring. */
  rings: Array<{
    /** The ordered values around the ring. */
    values: CardValue[];
    /** How many "steps" this ring is rotated relative to a fixed baseline. */
    rotationOffset: number;
  }>;
}

// --- THE DISCRIMINATED UNION ---

/** * The main Card type.
 * TypeScript will automatically infer the correct 'data' shape based on the 'type' field.
 */
export type Card =
  | (BaseCard & { type: typeof CARD_TYPES.MISSION; data: MissionData })
  | (BaseCard & { type: typeof CARD_TYPES.ACTION; data: ActionData })
  | (BaseCard & { type: typeof CARD_TYPES.WORD | typeof CARD_TYPES.NUMBER; data: TextData })
  | (BaseCard & { type: typeof CARD_TYPES.DIGIT | typeof CARD_TYPES.LETTER; data: CharData })
  | (BaseCard & { type: typeof CARD_TYPES.SPRITE; data: SpriteData })
  | (BaseCard & { type: typeof CARD_TYPES.SPRITE_SHUFFLE; data: SpriteShuffleData })
  | (BaseCard & {
      type:
        | typeof CARD_TYPES.ROUTE
        | typeof CARD_TYPES.PAPER_FRAGMENT
        | typeof CARD_TYPES.LEVER
        | typeof CARD_TYPES.IMAGE;
      data: OverlayData;
    })
  | (BaseCard & { type: typeof CARD_TYPES.VOICE | typeof CARD_TYPES.AUDIO; data: MediaData })
  | (BaseCard & { type: typeof CARD_TYPES.BATTERY; data: BatteryData })
  | (BaseCard & { type: typeof CARD_TYPES.CODEX; data: CodexData })
  | (BaseCard & { type: typeof CARD_TYPES.DOUGHNUT; data: DoughnutData })
  | (BaseCard & { type: typeof CARD_TYPES.SEQUENCE; data: SequenceData })
  | (BaseCard & { type: typeof CARD_TYPES.GRID; data: GridData })
  | (BaseCard & { type: typeof CARD_TYPES.CALENDAR; data: CalendarData })
  | (BaseCard & { type: typeof CARD_TYPES.IMAGE_SEQUENCE; data: ImageSequenceData })
  | (BaseCard & { type: typeof CARD_TYPES.CLOCK; data: ClockData })
  | (BaseCard & { type: typeof CARD_TYPES.SURFACE; data: SurfaceData })
  | (BaseCard & { type: typeof CARD_TYPES.PERSON; data: PersonData })
  | (BaseCard & { type: typeof CARD_TYPES.DIAL; data: DialData })
  | (BaseCard & { type: typeof CARD_TYPES.COMPASS; data: CompassData })
  | (BaseCard & { type: typeof CARD_TYPES.DECODER_WHEEL; data: DecoderWheelData });
