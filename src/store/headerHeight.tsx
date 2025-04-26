import { useStore } from '@tanstack/react-store';
import { Store } from '@tanstack/store';

// Define the type for the global state
type HeaderHeightState = {
  headerHeight?: number;
};

// Create the store with the initial state
export const headerHeightStore = new Store<HeaderHeightState>({
  headerHeight: undefined,
});

export const updateHeaderHeight = (headerHeight: number) => {
  headerHeightStore.setState(() => ({
    headerHeight,
  }));
};

export const useHeaderHeightState = () => useStore(headerHeightStore, () => headerHeightStore.state);
