import { useStore } from '@tanstack/react-store';
import { Store } from '@tanstack/store';

// Define the type for the global state
type GlobalSaveState = {
  pendingSave: boolean;
};

// Create the store with the initial state
export const globalSaveStore = new Store<GlobalSaveState>({
  pendingSave: false,
});

// Function to toggle `pendingSave`
export const togglePendingSave = (nextValue?: boolean) => {
  globalSaveStore.setState((prev) => ({
    pendingSave: nextValue !== undefined ? nextValue : !prev.pendingSave,
  }));
};

export const useGlobalSaveState = () => useStore(globalSaveStore, () => globalSaveStore.state);
