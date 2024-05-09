import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { orderBy } from 'lodash';
import { ReactNode, useContext, createContext, useMemo, useState } from 'react';
import { Item } from 'types';

export type ItemsContextType = {
  items: Dictionary<Item>;
  isLoading: boolean;
  error: ResponseError;
  hasResponseData: boolean;
  categoriesDict: Dictionary<string>;
  categories: { value: string }[];
  listing: Item[];
  isDirty: boolean;
  addItemToUpdate: (id: string, item: Item) => void;
  itemsToUpdate: Dictionary<Item>;
  isSaving: boolean;
  save: () => void;
  newId: string;
  listingType: string;
  setListingType: (type: string) => void;
};

const ItemsContext = createContext<ItemsContextType>({
  items: {},
  isLoading: true,
  error: null,
  hasResponseData: false,
  categoriesDict: {},
  categories: [],
  listing: [],
  isDirty: false,
  addItemToUpdate: () => {},
  itemsToUpdate: {},
  isSaving: false,
  save: () => {},
  newId: '-1',
  listingType: 'all',
  setListingType: () => {},
});

type ItemsProviderProps = {
  children: ReactNode;
};

export const ItemsProvider = ({ children }: ItemsProviderProps) => {
  const {
    data: items,
    isLoading,
    error,
    isSaving,
    save,
    addEntryToUpdate: addItemToUpdate,
    entriesToUpdate: itemsToUpdate,
    isDirty,
  } = useResourceFirebaseData<Item>({
    tdrResourceName: 'items',
    firebaseDataCollectionName: 'items',
  });

  const { categoriesDict, categories } = useMemo(() => {
    console.log('Recomputing item categories typeahead...');
    const categoriesDict: Dictionary<string> = {};
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

      entry?.categories?.forEach((category) => {
        categoriesDict[category] = category;
      });
    });

    const categories = orderBy(Object.keys(categoriesDict)).map((name) => ({ value: name }));

    if (duplicatedNames.length > 0) {
      console.warn('Possible duplicated items', duplicatedNames);
    }

    return { categoriesDict, categories };
  }, [items, isSaving, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const [listingType, setListingType] = useState('all');
  const listing = useMemo(() => {
    const orderedList = orderBy(Object.values(items), [(item) => Number(item.id)], 'asc');

    switch (listingType) {
      case 'all':
        return orderedList;
      case '!all':
        return orderedList.filter((item) => !item?.categories?.length ?? true);
      case 'nsfw':
        return orderedList.filter((item) => item.nsfw);
      case '!nsfw':
        return orderedList.filter((item) => !item.nsfw);
      default:
        if (listingType.startsWith('!')) {
          return orderedList.filter((item) => !item?.categories?.includes(listingType.slice(1)));
        }
        return orderedList.filter((item) => item?.categories?.includes(listingType));
    }
  }, [items, listingType]);

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
        categoriesDict,
        categories,
        hasResponseData: listing.length > 0,
        isDirty,
        addItemToUpdate,
        isSaving,
        save,
        itemsToUpdate,
        newId,
        listingType,
        setListingType,
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItemsContext = () => useContext(ItemsContext);
