import { Space, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import type { DailyMovieSet } from 'types';
import { ItemsMoviesTable } from './ItemsMoviesTable';

function orderSets(givenSets: DailyMovieSet[]) {
  return orderBy(givenSets, [
    // (s) => removeDuplicates(s.itemsIds).filter(Boolean).length > 0,
    (s) => s.title,
  ]).map((s) => ({
    ...s,
    itemsIds: orderBy(s.itemsIds, (id) => Number(id)),
  }));
}

export function ItemMoviesListing({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<DailyMovieSet>) {
  const { is } = useQueryParams();
  const showOnlyEmpty = is('emptyOnly');

  // biome-ignore lint/correctness/useExhaustiveDependencies: do not update on data update
  const rows = useMemo(() => {
    const sets = data ? orderSets(Object.values(data)) : [];
    return showOnlyEmpty ? sets.filter((s) => s.itemsIds.length === 0) : sets;
  }, [showOnlyEmpty]);

  const completeMoviesCount = rows.filter((s) => s.itemsIds.length > 0).length;

  return (
    <Space orientation="vertical">
      <Typography.Title level={5}>
        Total Movies: {rows.length} | Complete Movies: {completeMoviesCount}
      </Typography.Title>
      <ItemsMoviesTable addEntryToUpdate={addEntryToUpdate} rows={rows} />
    </Space>
  );
}
