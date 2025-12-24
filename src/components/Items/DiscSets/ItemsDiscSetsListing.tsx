import { Space, Typography } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import type { DailyDiscSet } from 'types';
import { ItemsDiscSetsSearch } from './ItemsDiscSetsSearch';
import { ItemsDiscSetsTable } from './ItemsDiscSetsTable';

function orderSets(givenSets: DailyDiscSet[]): DailyDiscSet[] {
  return orderBy(givenSets, [(s) => s.title.en]).map((s) => ({
    ...s,
    itemsIds: orderBy(s.itemsIds, (id) => Number(id)),
  }));
}

export function ItemsDiscSetsListing({
  data,
  addEntryToUpdate,
}: Pick<UseResourceFirestoreDataReturnType<DailyDiscSet>, 'data' | 'addEntryToUpdate'>) {
  const sets = useMemo(() => orderSets(Object.values(data)), [data]);
  const completeSetsCount = useMemo(() => sets.filter((s) => s.itemsIds.length >= 20).length, [sets]);

  return (
    <Space orientation="vertical">
      <ItemsDiscSetsSearch addEntryToUpdate={addEntryToUpdate} data={data} />
      <Typography.Title level={5}>
        Total Disc Sets: {sets.length} | Complete Disc Sets: {completeSetsCount}
      </Typography.Title>
      <ItemsDiscSetsTable addEntryToUpdate={addEntryToUpdate} rows={sets} />
    </Space>
  );
}
