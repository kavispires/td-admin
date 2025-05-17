// Singular
type CardId = string;
type ImageCardId = string;
type AvatarId = string;
type DateMilliseconds = number;
type GameCode = string;
type GameId = string;
type GameName = string;
type PlayerId = string;
type PlayerName = string;

// Composed
type Primitive = string | number | boolean | symbol | null;

/**
 * Represents a dictionary object with keys of type CardId and values of type T.
 */
type Dictionary<T> = Record<CardId, T>;

/**
 * Represents a plain object with dynamic keys and any values.
 */
type PlainObject = {
  [key: string]: any;
};

type BooleanDictionary = Dictionary<boolean>;

type NumberDictionary = Dictionary<number>;

type StringDictionary = Dictionary<string>;

type ObjectDictionary = Dictionary<PlainObject>;

// Function compositions
type GenericComponent = (...args: any) => any;
type GenericFunction = (...args: any) => void;
type BooleanFunction = (...args: any) => boolean;
type ButtonEvent = React.MouseEvent<HTMLButtonElement, MouseEvent>;

// Language
type Language = 'en' | 'pt';
type DualLanguageValue = {
  en: string;
  pt: string;
};

// Verify

type AvailableResources = string[];

type ResponseError = {
  message: string;
} | null;

type GenericCard = {
  id: string;
  [key: string]: any;
};

type Tag = string;
