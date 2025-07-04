import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { DailyDiscSet } from 'types';
import { ItemsDiscSetsListing } from './ItemsDiscSetsListing';
import { OrphanItems } from './OrphanItems';

export function ItemsDiscSetsSubPages({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<DailyDiscSet>) {
  const { is, queryParams } = useQueryParams();

  return (
    <>
      {(is('display', 'sets') || !queryParams.has('display')) && (
        <ItemsDiscSetsListing addEntryToUpdate={addEntryToUpdate} data={data} />
      )}

      {(is('display', 'orphans') || !queryParams.has('display')) && (
        <OrphanItems addEntryToUpdate={addEntryToUpdate} data={data} />
      )}
    </>
  );
}
