import { useItemsData } from 'hooks/useItemsData';
import { orderBy } from 'lodash';
import { ReactNode, useContext, createContext, useMemo } from 'react';
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
});

type ItemsProviderProps = {
  children: ReactNode;
};

export const ItemsProvider = ({ children }: ItemsProviderProps) => {
  const { items, isLoading, error } = useItemsData();

  const { namesDict, names, groupsDict, groups, listing } = useMemo(() => {
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

    const listing = orderBy(Object.values(items), [(item) => Number(item.id)], 'asc');

    return { namesDict, names, groupsDict, groups, listing };
  }, [items]);

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
      }}
    >
      {children}
    </ItemsContext.Provider>
  );
};

export const useItemsContext = () => useContext(ItemsContext);
