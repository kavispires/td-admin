import { useQueryParams } from 'hooks/useQueryParams';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { orderBy } from 'lodash';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import type { Item } from 'types';

export type ItemsContextType = {
  items: Dictionary<Item>;
  isLoading: boolean;
  error: ResponseError;
  hasResponseData: boolean;
  decksDict: Dictionary<string>;
  decks: { value: string }[];
  listing: Item[];
  isDirty: boolean;
  addItemToUpdate: (id: string, item: Item) => void;
  itemsToUpdate: Dictionary<Item>;
  isSaving: boolean;
  save: () => void;
  newId: string;
  hasFirestoreData: boolean;
};

const ItemsContext = createContext<ItemsContextType>({
  items: {},
  isLoading: true,
  error: null,
  hasResponseData: false,
  decksDict: {},
  decks: [],
  listing: [],
  isDirty: false,
  addItemToUpdate: () => {},
  itemsToUpdate: {},
  isSaving: false,
  save: () => {},
  newId: '-1',
  hasFirestoreData: false,
});

type ItemsProviderProps = {
  children: ReactNode;
};

export const ItemsProvider = ({ children }: ItemsProviderProps) => {
  const { queryParams } = useQueryParams();

  const {
    data: items,
    isLoading,
    error,
    isSaving,
    save,
    addEntryToUpdate: addItemToUpdate,
    entriesToUpdate: itemsToUpdate,
    isDirty,
    hasFirestoreData,
  } = useResourceFirestoreData<Item>({
    tdrResourceName: 'items',
    firestoreDataCollectionName: 'items',
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  const { decksDict, decks } = useMemo(() => {
    console.log('Recomputing item decks typeahead...');
    const decksDict: Dictionary<string> = {};
    const duplicationCheckEn: Dictionary<string> = {};
    const duplicationCheckPt: Dictionary<string> = {};
    const duplicatedNames: string[][] = [];

    Object.values(items).forEach((entry) => {
      const nameEn = `${entry.name.en} (${entry.id})`;
      const namePt = `${entry.name.pt} (${entry.id})`;

      if (duplicationCheckEn[entry.name.en]) {
        duplicatedNames.push([`${entry.name.en} (${duplicationCheckEn[entry.name.en]})`, nameEn]);
      } else {
        duplicationCheckEn[entry.name.en] = entry.id;
      }
      if (duplicationCheckPt[entry.name.pt]) {
        duplicatedNames.push([`${entry.name.pt} (${duplicationCheckPt[entry.name.pt]})`, namePt]);
      } else {
        duplicationCheckPt[entry.name.pt] = entry.id;
      }

      entry?.decks?.forEach((deck) => {
        decksDict[deck] = deck;
      });
    });

    // Add default decks
    decksDict.age1 = 'age1';
    decksDict.age2 = 'age2';
    decksDict.age3 = 'age3';
    decksDict.age4 = 'age4';
    decksDict.age5 = 'age5';

    const decks = orderBy(Object.keys(decksDict)).map((name) => ({ value: name }));

    if (duplicatedNames.length > 0) {
      console.warn('Possible duplicated items', duplicatedNames);
    }

    return { decksDict, decks };
  }, [items, isSaving, isLoading]);

  const deck = queryParams.get('deck') ?? 'all';

  const listing = useMemo(() => {
    const orderedList = orderBy(Object.values(items), [(item) => Number(item.id)], 'asc');

    switch (deck) {
      case 'all':
        return orderedList;
      case '!all':
        return orderedList.filter((item) => !item?.decks?.length || true);
      case 'nsfw':
        return orderedList.filter((item) => item.nsfw);
      case '!nsfw':
        return orderedList.filter((item) => !item.nsfw);
      default:
        if (deck.startsWith('!')) {
          // If it's an 'age' deck, it should not include any items from that age or any other age
          if (deck.slice(1).startsWith('age')) {
            return orderedList.filter((item) => !item?.decks?.some((d) => d.startsWith('age')));
          }
          return orderedList.filter((item) => !item?.decks?.includes(deck.slice(1)));
        }
        return orderedList.filter((item) => item?.decks?.includes(deck));
    }
  }, [deck, items]);

  // Handle id for new items
  const newId = useMemo(() => {
    const newIds = orderBy(Object.keys(itemsToUpdate), [(id) => Number(id)], 'asc');
    const latestSavedId = listing[listing.length - 1]?.id;
    const newestId = orderBy([...newIds, latestSavedId], [(id) => Number(id)], 'desc')[0];
    return String(Number(newestId) + 1);
  }, [listing, itemsToUpdate]);

  return (
    <ItemsContext.Provider
      value={{
        items,
        listing,
        isLoading,
        error,
        decksDict,
        decks,
        hasResponseData: listing.length > 0,
        isDirty,
        addItemToUpdate,
        isSaving,
        save,
        itemsToUpdate,
        newId,
        hasFirestoreData,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItemsContext = () => useContext(ItemsContext);
