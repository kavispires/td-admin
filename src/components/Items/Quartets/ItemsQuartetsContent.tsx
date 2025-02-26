import { Space, Typography } from 'antd';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import type { DailyQuartetSet } from 'types';

import { ItemsQuartetsTable } from './ItemsQuartetsTable';
import { NewQuartetModal } from './NewQuartetModal';

export function ItemsQuartetsContent({
  data,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<DailyQuartetSet>) {
  const { is } = useQueryParams();
  const showOnlyEmpty = is('emptyOnly');

  const rows = useMemo(() => {
    if (showOnlyEmpty) {
      return orderBy(
        Object.values(data).filter((s) => s.itemsIds.length < 4),
        ['id'],
        ['asc'],
      );
    }
    return orderBy(Object.values(data), ['id'], ['asc']);
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
