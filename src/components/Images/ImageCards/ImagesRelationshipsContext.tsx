import { createContext, type ReactNode, useContext, useState } from 'react';
import {
  type UseImageCardsRelationshipDataReturnValue,
  type UseRandomGroupReturnValue,
  useImageCardsRelationshipData,
  useRandomGroups,
} from './hooks/hooks';

export type ImagesRelationshipsContextType = {
  sampleSize: number;
  setSampleSize: (size: number) => void;
  tagThreshold: number;
  setTagThreshold: (threshold: number) => void;
  cardSize: number;
  setCardSize: (size: number) => void;
  showIds: boolean;
  setShowIds: (show: boolean) => void;
  randomGroups: UseRandomGroupReturnValue;
  query: UseImageCardsRelationshipDataReturnValue;
};

const ImagesRelationshipsContext = createContext<ImagesRelationshipsContextType | PlainObject>({});

type ImagesRelationshipsProviderProps = {
  children: ReactNode;
};

export const ImagesRelationshipsProvider = ({ children }: ImagesRelationshipsProviderProps) => {
  const query = useImageCardsRelationshipData();

  const [sampleSize, setSampleSize] = useState(15);
  const [tagThreshold, setTagThreshold] = useState(5);
  const [cardSize, setCardSize] = useState(150);
  const [showIds, setShowIds] = useState(false);

  // Selects a random deck, but gives option select for a specific deck (1-10)
  const randomGroups = useRandomGroups(query.data, query.setDirty, sampleSize, tagThreshold);

  return (
    <ImagesRelationshipsContext.Provider
      value={{
        sampleSize,
        setSampleSize,
        tagThreshold,
        setTagThreshold,
        cardSize,
        setCardSize,
        showIds,
        setShowIds,
        randomGroups,
        query,
      }}
    >
      {children}
    </ImagesRelationshipsContext.Provider>
  );
};

export const useImagesRelationshipsContext = () => useContext(ImagesRelationshipsContext);
