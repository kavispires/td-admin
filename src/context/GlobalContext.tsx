import { createContext, type ReactNode, useContext } from 'react';
import { useToggle } from 'react-use';

type GlobalContextType = {
  pendingSave: boolean;
  togglePendingSave: (nextValue?: boolean) => void;
};

const GlobalContext = createContext<GlobalContextType>({
  pendingSave: false,
  togglePendingSave: () => {},
});

type GlobalContextProviderProps = {
  children: ReactNode;
};

export const GlobalContextProvider = ({ children }: GlobalContextProviderProps) => {
  const [pendingSave, togglePendingSave] = useToggle(false);
  return (
    <GlobalContext.Provider value={{ pendingSave, togglePendingSave }}>{children}</GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
