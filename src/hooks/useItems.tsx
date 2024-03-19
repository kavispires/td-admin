import { useMemo } from 'react';

import { useTDResource } from './useTDResource';
import { Item } from 'types';
import { useTDFirebaseDoc } from './useTDFirebaseDoc';
import { isEmpty, merge, orderBy } from 'lodash';

type UseItemsOptions = {
  enabled?: boolean;
  enableAttributes?: boolean;
  enableCriminology?: boolean;
};

type UseItemsReturnValue = {
  items: Dictionary<Item>;
  list: Item[];
  isLoading: boolean;
  error: ResponseError;
  hasResponseData: boolean;
  namesDict: Dictionary<string>;
  names: { value: string }[];
  groupsDict: Dictionary<string>;
  groups: { value: string }[];
};

export function useItems({ enabled = true }: UseItemsOptions = {}): UseItemsReturnValue {
  // Gather basic item data
  const tdrItemsQuery = useTDResource<Dictionary<Item>>('items', enabled);
  const firebaseItemsQuery = useTDFirebaseDoc<Dictionary<Item>>('data', 'items', { enabled });

  const items = useMemo(() => {
    if (tdrItemsQuery.isLoading || firebaseItemsQuery.isLoading) return {};
    return merge(tdrItemsQuery.data ?? {}, firebaseItemsQuery.data ?? {});
  }, [tdrItemsQuery.data, firebaseItemsQuery.data, tdrItemsQuery.isLoading, firebaseItemsQuery.isLoading]);

  // Creates dictionary of item names and groups
  const { namesDict, names, groupsDict, groups, list } = useMemo(() => {
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

    const list = orderBy(Object.values(items), 'id', 'asc');

    return { namesDict, names, groupsDict, groups, list };
  }, [items]);

  // TODO: Load attributes

  // TODO: Load crime classifications

  return {
    items,
    list,
    isLoading: tdrItemsQuery.isLoading || firebaseItemsQuery.isLoading,
    error: tdrItemsQuery.error || firebaseItemsQuery.error,
    hasResponseData: !isEmpty(items),
    namesDict,
    names,
    groupsDict,
    groups,
  };
}
