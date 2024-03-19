import { useItemsData } from 'hooks/useItemsData';
import { orderBy } from 'lodash';
import { ReactNode, useContext, createContext, useMemo, useState } from 'react';
import { Item } from 'types';

export type ItemsContextType = {
  items: Dictionary<Item>;
  isLoading: boolean;
  error: ResponseError;
  hasResponseData: boolean;
  namesDict: Dictionary<string>;
  names: { value: string }[];
  groupsDict: Dictionary<string>;
  groups: { value: string }[];
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
  namesDict: {},
  names: [],
  groupsDict: {},
  groups: [],
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
  const { items, isLoading, error, isSaving, save, addItemToUpdate, itemsToUpdate, isDirty } = useItemsData();

  const { namesDict, names, groupsDict, groups } = useMemo(() => {
    console.log('Recomputing items context data...');
    const groupsDict: Dictionary<string> = {};
    const duplicationCheckEn: Dictionary<string> = {};
    const duplicationCheckPt: Dictionary<string> = {};
    const duplicatedNames: string[][] = [];

    const namesDict = Object.values(items).reduce((acc: Dictionary<string>, entry) => {
      const nameEn = `${entry.name.en} (${entry.id})`;
      const namePt = `${entry.name.pt} (${entry.id})`;
      acc[nameEn] = entry.id;
      acc[namePt] = entry.id;

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

      entry.groups.forEach((group) => {
        groupsDict[group] = group;
      });

      return acc;
    }, {});

    const names = orderBy(Object.keys(namesDict), [(name) => name.toLowerCase()]).map((name) => ({
      value: name,
    }));

    const groups = Object.keys(groupsDict).map((name) => ({ value: name }));

    if (duplicatedNames.length > 0) {
      console.warn('Possible duplicated items', duplicatedNames);
    }

    return { namesDict, names, groupsDict, groups };
  }, [items, isSaving, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const [listingType, setListingType] = useState('all');
  const listing = useMemo(() => {
    const orderedList = orderBy(Object.values(items), [(item) => Number(item.id)], 'asc');

    if (listingType.startsWith('!')) {
      return orderedList.filter((item) => !item.groups.includes(listingType.slice(1)));
    }

    switch (listingType) {
      case 'all':
        return orderedList;
      case 'nswf':
        return orderedList.filter((item) => item.nsfw);
      default:
        return orderedList.filter((item) => item.groups.includes(listingType));
    }
  }, [items, listingType]);

  // Handle id for new items
  const newId = useMemo(() => {
    const newIds = orderBy(Object.keys(itemsToUpdate), [(id) => Number(id)], 'asc');
    const latestSavedId = listing[listing.length - 1]?.id;
    const newId = orderBy([...newIds, latestSavedId], [(id) => Number(id)], 'asc')[0];
    return String(Number(newId) + 1);
  }, [listing, itemsToUpdate]);

  return (
    <ItemsContext.Provider
      value={{
        items,
        listing,
        isLoading,
        error,
        namesDict,
        names,
        groupsDict,
        groups,
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
