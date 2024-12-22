import { App } from 'antd';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { cloneDeep, merge, padStart, random } from 'lodash';
import { useEffect, useState } from 'react';
import { firestore, printFirebase } from 'services/firebase';
import { removeDuplicates } from 'utils';

import { type UseMutateFunction, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useQueryParams } from 'hooks/useQueryParams';
import { CARDS_PER_DECK, DEFAULT_ENTRY, TOTAL_DECKS } from './constants';
import type { FirebaseImageCardLibrary, ImageCardData, ImageCardRelationship } from './types';
import { cleanupData } from './utils';

const getRandomCardNumber = () => padStart(String(random(1, CARDS_PER_DECK)), 2, '0');

const getRandomDeck = () => random(1, TOTAL_DECKS);

const getRandomCardId = () => `td-d${getRandomDeck()}-${getRandomCardNumber()}`;

export type UseRandomCardReturnValue = {
  cardId: string;
  deck: number;
  onRandomCard: () => void;
  card: ImageCardData;
  add: (key: keyof ImageCardData, value: string) => void;
  remove: (key: keyof ImageCardData, value: string) => void;
  update: (key: keyof ImageCardData, value: string[]) => void;
  toggleHighlight: () => void;
};

export function useRandomCard(
  cardData: FirebaseImageCardLibrary,
  setDirty: (value: React.SetStateAction<boolean>) => void,
): UseRandomCardReturnValue {
  const [deck, setDeck] = useState(getRandomDeck());
  const [cardNumber, setCardNumber] = useState(getRandomCardNumber());
  const cardId = `td-d${deck}-${cardNumber}`;

  const onRandomCard = () => {
    setDeck(getRandomDeck());
    setCardNumber(getRandomCardNumber());
  };

  const card = merge(cloneDeep(DEFAULT_ENTRY), cardData?.[cardId] ?? {});

  const add = (key: keyof ImageCardData, value: string) => {
    if (key !== 'highlight' && card[key]) {
      card[key]?.push(value);
      setDirty(true);
    }
  };

  const remove = (key: keyof ImageCardData, value: string) => {
    if (key !== 'highlight' && card[key]) {
      const entry = card[key] ?? [];
      entry.splice(entry.indexOf(value), 1);
      setDirty(true);
    }
  };

  const update = (key: keyof ImageCardData, value: string[]) => {
    if (key !== 'highlight') {
      card[key] = value.map((v) => v.trim().toLowerCase());
      setDirty(true);
    }
  };

  const toggleHighlight = () => {
    card.highlight = !card.highlight;
    setDirty(true);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    cardData[cardId] = card;
  }, [card]);

  return {
    cardId,
    deck,
    onRandomCard,
    card,
    add,
    remove,
    update,
    toggleHighlight,
  };
}

export function useImageCardsData() {
  const [isDirty, setDirty] = useState(false);
  const queryKey = ['data/imageCards'];
  const queryClient = useQueryClient();
  const { notification } = App.useApp();

  const {
    data = {},
    isLoading,
    isSuccess,
    isError,
    refetch,
  } = useQuery<any>({
    queryKey,
    queryFn: async () => {
      const docRef = doc(firestore, 'data/imageCards');
      const querySnapshot = await getDoc(docRef);
      return (querySnapshot.data() ?? {}) as FirebaseImageCardLibrary;
    },
  });

  useEffect(() => {
    if (isSuccess) {
      printFirebase('Loaded data/imageCards');
    }
  }, [isSuccess]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: error handling
  useEffect(() => {
    if (isError) {
      notification.error({
        message: 'Error loading data/imageCards',
        placement: 'bottomLeft',
      });
    }
  }, [isError]);

  const {
    isPending: isSaving,
    isError: isMutationError,
    isSuccess: isSaved,
    mutate: save,
  } = useMutation<unknown, unknown, FirebaseImageCardLibrary, unknown>({
    mutationKey: queryKey,
    mutationFn: async () => {
      const docRef = doc(firestore, 'data/imageCards');
      const cleanData = cleanupData(data);
      await setDoc(docRef, cleanData);
      return data;
    },
    onSuccess: () => {
      notification.success({
        message: 'Saved',
        placement: 'bottomLeft',
      });
      queryClient.refetchQueries({
        queryKey: queryKey,
      });
      setDirty(false);
    },
  });

  return {
    data,
    isLoading,
    isSuccess,
    isError,
    hasData: isSuccess && Object.keys(data).length > 0,
    refetch,
    isSaving,
    isMutationError,
    isSaved,
    save,
    setDirty,
    isDirty,
  };
}

export function useRandomCards(
  cardData: ImageCardRelationship,
  setDirty: (value: React.SetStateAction<boolean>) => void,
) {
  const [deckA, setDeckA] = useState(getRandomDeck());
  const [cardNumberA, setCardNumberA] = useState(getRandomCardNumber());
  const [deckB, setDeckB] = useState(getRandomDeck());
  const [cardNumberB, setCardNumberB] = useState(getRandomCardNumber());
  const cardAId = `td-d${deckA}-${cardNumberA}`;
  const cardBId = `td-d${deckB}-${cardNumberB}`;
  const [unrelatedCount, setUnrelatedCount] = useState(0);
  const { queryParams } = useQueryParams();
  const unrelatedThreshold = Number(queryParams.get('cycle') ?? 3);

  const cardA = cardData?.[cardAId] ?? [];
  const cardB = cardData?.[cardBId] ?? [];

  const onRandomCards = () => {
    setUnrelatedCount(0);
    setDeckA(getRandomDeck());
    setCardNumberA(getRandomCardNumber());
    setDeckB(getRandomDeck());
    setCardNumberB(getRandomCardNumber());
  };

  const relate = () => {
    setUnrelatedCount(0);
    cardA.push(cardBId);
    cardData[cardAId] = removeDuplicates(cardA);
    cardB.push(cardAId);
    cardData[cardBId] = removeDuplicates(cardB);
    setDirty(true);
    setDeckA(deckB);
    setCardNumberA(cardNumberB);
    setDeckB(getRandomDeck());
    setCardNumberB(getRandomCardNumber());
  };

  const unrelate = () => {
    if (unrelatedCount >= unrelatedThreshold) {
      setUnrelatedCount(0);
      onRandomCards();
    } else {
      setUnrelatedCount((ps) => ps + 1);
      setDeckB(getRandomDeck());
      setCardNumberB(getRandomCardNumber());
    }
  };

  useEffect(() => {
    if (cardAId === cardBId) {
      setCardNumberB(getRandomCardNumber());
    }
  }, [cardAId, cardBId]);

  return {
    cardAId,
    cardA,
    cardBId,
    cardB,
    relate,
    unrelate,
    areRelated: cardA.includes(cardBId),
    onRandomCards,
  };
}

type Stats = {
  total: number;
  overdone: number;
  complete: number;
  single: number;
};

export type UseImageCardsRelationshipDataReturnValue = {
  data: ImageCardRelationship;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
  hasData: boolean;
  refetch: () => void;
  isSaving: boolean;
  isMutationError: boolean;
  isSaved: boolean;
  save: UseMutateFunction<unknown, unknown, ImageCardRelationship, unknown>;
  setDirty: (value: React.SetStateAction<boolean>) => void;
  isDirty: boolean;
  stats: Stats;
};

export function useImageCardsRelationshipData(): UseImageCardsRelationshipDataReturnValue {
  const [isDirty, setDirty] = useState(false);
  const queryKey = ['data/imageCardsRelationships'];
  const queryClient = useQueryClient();
  const { notification } = App.useApp();
  const [stats, setStats] = useState<Stats>({ total: 0, overdone: 0, complete: 0, single: 0 });

  const {
    data = {},
    isLoading,
    isSuccess,
    isError,
    error,
    isFetched,
    isRefetching,
    refetch,
  } = useQuery<Record<string, string[]>>({
    queryKey,
    queryFn: async () => {
      const docRef = doc(firestore, 'data/imageCardsRelationships');
      const querySnapshot = await getDoc(docRef);
      return (querySnapshot.data() ?? {}) as ImageCardRelationship;
    },
  });

  const {
    isPending: isSaving,
    isError: isMutationError,
    isSuccess: isSaved,
    mutate: save,
  } = useMutation<unknown, unknown, ImageCardRelationship, unknown>({
    mutationKey: queryKey,
    mutationFn: async () => {
      const docRef = doc(firestore, 'data/imageCardsRelationships');

      await setDoc(docRef, data);
      return data;
    },
    onSuccess: () => {
      notification.success({
        message: 'Saved',
        placement: 'bottomLeft',
      });
      queryClient.refetchQueries({
        queryKey: queryKey,
      });
      setDirty(false);
    },
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!isRefetching && isFetched) {
      const total = Object.keys(data).length;
      let overdone = 0;
      let complete = 0;
      let single = 0;
      Object.values(data).forEach((v) => {
        if (v.length > 8) {
          overdone += 1;
        }
        if (v.length === 1) {
          single += 1;
        }
        if (v.length > 2) {
          complete += 1;
        }
      });
      setStats({ total, overdone, complete, single });
    }
  }, [isFetched, isRefetching]);

  return {
    data,
    isLoading,
    isSuccess,
    isError,
    error,
    hasData: isSuccess && Object.keys(data).length > 0,
    refetch,
    isSaving,
    isMutationError,
    isSaved,
    save,
    setDirty,
    isDirty,
    stats,
  };
}

export type UseRandomGroupReturnValue = {
  cardIds: string[];
  cards: string[][];
  selection: string[];
  onSelect: (id: string) => void;
  relate: () => void;
  nextSet: () => void;
  deselectAll: () => void;
  cycles: number;
  filters: { useCycles: boolean; toggleUseCycles: () => void };
};

export function useRandomGroups(
  cardData: ImageCardRelationship,
  setDirty: (value: React.SetStateAction<boolean>) => void,
  sampleSize: number,
  tagThreshold: number,
): UseRandomGroupReturnValue {
  const [cardIds, setCardIds] = useState<string[]>([]);
  const [cards, setCards] = useState<string[][]>([]);
  const [cycledCards, setCycleCards] = useState<string[]>([]);
  const [cycles, setCycles] = useState(0);
  const [filterUseCycles, setFIlterUseCycles] = useState(true);

  const [selection, setSelection] = useState<string[]>([]);

  const updateCards = (ids?: string[]) => {
    setCards((ids ?? cardIds).map((id) => cardData?.[id] ?? []));
  };

  const onRandomCards = () => {
    // setSelection([]);
    const ids: string[] = [...selection];
    let cycleCount = 0;
    const cycledCardsSample = cycledCards.length < 2000 ? cycledCards : [];

    // Avoid infinite loop failsafe
    let tries = 0;
    while (tries < 400 && ids.length < sampleSize) {
      const id = getRandomCardId();
      const card = cardData[id] ?? [];
      const isNew = tagThreshold > 0 ? card.length < tagThreshold : true;
      const isCycled = filterUseCycles ? cycledCardsSample.includes(id) : false;
      if (!ids.includes(id) && !isCycled && isNew) {
        ids.push(id);
        cycleCount += 1;
      }
      tries += 1;
    }
    setCardIds(ids);
    setCycleCards((pv) => [...pv, ...ids]);
    updateCards(ids);
    setCycles((ps) => ps + cycleCount);
  };

  // On Load get sample of cards
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (cardIds.length === 0) {
      onRandomCards();
    }
  }, [cardIds]);

  /**
   * Selects or deselects a card
   */
  const onSelect = (id: string) => {
    setSelection((ps) => {
      const copy = [...ps];
      const index = copy.indexOf(id);
      if (index > -1) {
        copy.splice(index, 1);
      } else {
        copy.push(id);
      }
      return copy;
    });
  };

  /**
   * Relates all selected cards in the selection array
   */
  const relate = () => {
    selection.forEach((id) => {
      const card = cardData[id] ?? [];

      card.push(...selection.filter((s) => s !== id));
      cardData[id] = removeDuplicates(card);
    });
    setDirty(true);
    setSelection([]);
    updateCards();
    setCycleCards([]);
    setCycles(0);
  };

  /**
   * Deselects all cards
   */
  const deselectAll = () => {
    setSelection([]);
  };

  const toggleFilterUseCycles = () => {
    setFIlterUseCycles((ps) => !ps);
  };

  return {
    cardIds,
    cards,
    selection,
    onSelect,
    relate,
    nextSet: onRandomCards,
    deselectAll,
    cycles,
    filters: {
      useCycles: filterUseCycles,
      toggleUseCycles: toggleFilterUseCycles,
    },
  };
}
