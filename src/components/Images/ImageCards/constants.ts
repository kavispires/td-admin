import { ImageCardData } from './types';

export const TOTAL_DECKS = 10;

export const CARDS_PER_DECK = 252;

export const SUGGESTED_MOODS = [
  'anxious',
  'bright',
  'chaotic',
  'colorful',
  'confusion',
  'cozy',
  'creepy',
  'dark',
  'dramatic',
  'dreamy',
  'fear',
  'gloomy',
  'happy',
  'intense',
  'magical',
  'melancholic',
  'muted',
  'mysterious',
  'professional',
  'reflective',
  'scary',
  'serene',
  'surreal',
  'tension',
  'vibrant',
  'warm',
  'whimsical',
];

export const SUGGESTED_COLORS = [
  'beige',
  'black',
  'blue',
  'brown',
  'colorful',
  'gray',
  'green',
  'mixed',
  'orange',
  'pink',
  'purple',
  'red',
  'white',
  'yellow',
];

export const DEFAULT_ENTRY: ImageCardData = {
  focus: [],
  actions: [],
  colors: [],
  mood: [],
  elements: [],
  highlight: false,
};
