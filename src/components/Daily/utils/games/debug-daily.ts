import { useStore } from '@tanstack/react-store';
import { Store } from '@tanstack/store';

// Define the type for debug features
// Each key is a daily game ID and the value is a boolean indicating if debug mode is enabled
type DebugDailyState = {
  'aqui-o': boolean;
  'arte-ruim': boolean;
  artista: boolean;
  'comunicacao-alienigena': boolean;
  'controle-de-estoque': boolean;
  espionagem: boolean;
  filmaco: boolean;
  organiku: boolean;
  palavreado: boolean;
  'portais-magicos': boolean;
  quartetos: boolean;
  'ta-na-cara': boolean;
  'teoria-de-conjuntos': boolean;
};

// Type for identifying each daily game
export type DailyGameId = keyof DebugDailyState;

// Storage key for persisting debug state
const STORAGE_KEY = 'td-admin-debug-daily';

// Load initial state from localStorage if available
const loadInitialState = (): DebugDailyState => {
  const defaultState: DebugDailyState = {
    'aqui-o': false,
    'arte-ruim': false,
    artista: false,
    'comunicacao-alienigena': false,
    'controle-de-estoque': false,
    espionagem: false,
    filmaco: false,
    organiku: false,
    palavreado: false,
    'portais-magicos': false,
    quartetos: false,
    'ta-na-cara': false,
    'teoria-de-conjuntos': false,
  };

  try {
    const savedState = localStorage.getItem(STORAGE_KEY);
    return savedState ? JSON.parse(savedState) : defaultState;
  } catch {
    return defaultState;
  }
};

// Create the store with initial state from localStorage or defaults
export const debugDailyStore = new Store<DebugDailyState>(loadInitialState());

// Save state to localStorage whenever it changes
debugDailyStore.subscribe(() => {
  try {
    // Extract only the keys defined in DebugDailyState
    const stateToSave: DebugDailyState = {
      'aqui-o': debugDailyStore.state['aqui-o'],
      'arte-ruim': debugDailyStore.state['arte-ruim'],
      artista: debugDailyStore.state.artista,
      'comunicacao-alienigena': debugDailyStore.state['comunicacao-alienigena'],
      'controle-de-estoque': debugDailyStore.state['controle-de-estoque'],
      espionagem: debugDailyStore.state.espionagem,
      filmaco: debugDailyStore.state.filmaco,
      organiku: debugDailyStore.state.organiku,
      palavreado: debugDailyStore.state.palavreado,
      'portais-magicos': debugDailyStore.state['portais-magicos'],
      quartetos: debugDailyStore.state.quartetos,
      'ta-na-cara': debugDailyStore.state['ta-na-cara'],
      'teoria-de-conjuntos': debugDailyStore.state['teoria-de-conjuntos'],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch {
    // Ignore errors (e.g., localStorage not available)
  }
});

/**
 * Toggles debug mode for a specific daily game
 */
export const toggleDebugMode = (gameId: DailyGameId, enabled?: boolean) => {
  debugDailyStore.setState((prev) => ({
    ...prev,
    [gameId]: enabled !== undefined ? enabled : !prev[gameId],
  }));
};

/**
 * Resets all debug modes to false
 */
export const resetAllDebugModes = () => {
  debugDailyStore.setState(() => ({
    'aqui-o': false,
    'arte-ruim': false,
    artista: false,
    'comunicacao-alienigena': false,
    'controle-de-estoque': false,
    espionagem: false,
    filmaco: false,
    organiku: false,
    palavreado: false,
    'portais-magicos': false,
    quartetos: false,
    'ta-na-cara': false,
    'teoria-de-conjuntos': false,
  }));
};

/**
 * Hook to access the debug state for all daily games
 */
export const useDebugDailyState = () => useStore(debugDailyStore, () => debugDailyStore.state);

/**
 * Hook to access debug state for a specific daily game
 */
export const useDebugDailyGame = (gameId: DailyGameId) => useStore(debugDailyStore, (state) => state[gameId]);
