import { Space, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import { DailyQuartetSet } from 'types';

import { ItemsQuartetsTable } from './ItemsQuartetsTable';
import { NewQuartetModal } from './NewQuartetModal';

function orderSets(givenSets: DailyQuartetSet[]) {
  return orderBy(givenSets, [
    // (s) => removeDuplicates(s.itemsIds).filter(Boolean).length !== 4,
    // (s) => removeDuplicates(s.itemsIds).filter(Boolean).length === 0,
    (s) => s.title,
  ]).map((s) => ({
    ...s,
    itemsIds: orderBy(s.itemsIds, (id) => Number(id)),
  }));
}

export function ItemsQuartetsContent({
  data,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<DailyQuartetSet>) {
  const { is } = useQueryParams();
  const showOnlyEmpty = is('emptyOnly');

  const rows = useMemo(() => {
    const sets = data ? orderSets(Object.values(data)) : [];
    return showOnlyEmpty ? sets.filter((s) => s.itemsIds.length === 0) : sets;
  }, [data, showOnlyEmpty]);

  const completeQuartetsCount = rows.filter((s) => s.itemsIds.length === 4).length;

  return (
    <Space direction="vertical">
      <Typography.Title level={5}>
        Total Quartets: {rows.length} | Complete Quartets: {completeQuartetsCount}
      </Typography.Title>
      <ItemsQuartetsTable rows={rows} addEntryToUpdate={addEntryToUpdate} />
      <NewQuartetModal data={data} addEntryToUpdate={addEntryToUpdate} />
    </Space>
  );
}
