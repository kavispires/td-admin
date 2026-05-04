import { useSelector } from '@tanstack/react-store';
import { Store } from '@tanstack/store';

// Define the type for debug features
// Each key is a daily game ID and the value is a boolean indicating if debug mode is enabled
type DebugDailyState = {
  'aqui-o': boolean;
  'arte-ruim': boolean;
  picaco: boolean; // Renamed from 'artista'
  alienado: boolean; // Renamed from 'comunicacao-alienigena'
  estoquista: boolean; // Renamed from 'controle-de-estoque'
  investigacao: boolean; // Renamed from 'espionagem'
  filmaco: boolean;
  organiku: boolean;
  palavreado: boolean;
  portais: boolean; // Renamed from 'portais-magicos'
  quartetos: boolean;
  'ta-na-cara': boolean;
  conjuntos: boolean; // Renamed from 'teoria-de-conjuntos'
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
    picaco: false,
    alienado: false,
    estoquista: false,
    investigacao: false,
    filmaco: false,
    organiku: false,
    palavreado: false,
    portais: false,
    quartetos: false,
    'ta-na-cara': false,
    conjuntos: false,
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
      picaco: debugDailyStore.state.picaco,
      alienado: debugDailyStore.state.alienado,
      estoquista: debugDailyStore.state.estoquista,
      investigacao: debugDailyStore.state.investigacao,
      filmaco: debugDailyStore.state.filmaco,
      organiku: debugDailyStore.state.organiku,
      palavreado: debugDailyStore.state.palavreado,
      portais: debugDailyStore.state.portais,
      quartetos: debugDailyStore.state.quartetos,
      'ta-na-cara': debugDailyStore.state['ta-na-cara'],
      conjuntos: debugDailyStore.state.conjuntos,
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
    picaco: false,
    alienado: false,
    estoquista: false,
    investigacao: false,
    filmaco: false,
    organiku: false,
    palavreado: false,
    portais: false,
    quartetos: false,
    'ta-na-cara': false,
    conjuntos: false,
  }));
};

/**
 * Hook to access the debug state for all daily games
 */
export const useDebugDailyState = () => useSelector(debugDailyStore, (state) => state);

/**
 * Hook to access debug state for a specific daily game
 */
export const useDebugDailyGame = (gameId: DailyGameId) =>
  useSelector(debugDailyStore, (state) => state[gameId]);
