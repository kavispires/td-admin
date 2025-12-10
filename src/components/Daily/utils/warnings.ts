import { useStore } from '@tanstack/react-store';
import { Store } from '@tanstack/store';

// Define the type for warnings
type WarningsState = Record<string, string>;

// Initialize the store with an empty object
export const warningsStore = new Store<WarningsState>({});

// Function to add a warning
export const addWarning = (key: string, message: string) => {
  console.log('Adding warning:', { key, message });
  warningsStore.setState((prev) => ({
    ...prev,
    [key]: message,
  }));
};

// Function to remove a warning
export const removeWarning = (key: string) => {
  warningsStore.setState((prev) => {
    const newState = { ...prev };
    delete newState[key];
    return newState;
  });
};

// Function to clear all warnings
export const clearWarnings = () => {
  warningsStore.setState(() => ({}));
};

export const useGetWarnings = () => useStore(warningsStore, (state) => state);
