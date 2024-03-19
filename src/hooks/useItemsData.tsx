import { merge } from 'lodash';
import { useMemo } from 'react';
import { Item } from 'types';

import { useTDFirebaseDoc } from './useTDFirebaseDoc';
import { useTDResource } from './useTDResource';

export function useItemsData() {
  // Gather basic item data
  const tdrItemsQuery = useTDResource<Dictionary<Item>>('items');
  const firebaseItemsQuery = useTDFirebaseDoc<Dictionary<Item>>('data', 'items');

  const items = useMemo(() => {
    if (tdrItemsQuery.isLoading || firebaseItemsQuery.isLoading) return {};
    console.log('Merging items data');
    return merge(tdrItemsQuery.data ?? {}, firebaseItemsQuery.data ?? {});
  }, [tdrItemsQuery.data, firebaseItemsQuery.data, tdrItemsQuery.isLoading, firebaseItemsQuery.isLoading]);

  return {
    items,
    isLoading: tdrItemsQuery.isLoading || firebaseItemsQuery.isLoading,
    error: tdrItemsQuery.error || firebaseItemsQuery.error,
  };
}
