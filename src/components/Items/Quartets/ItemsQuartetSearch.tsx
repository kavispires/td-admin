import { Space, Typography } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useMemo, useState } from 'react';
import type { DailyQuartetSet } from 'types';
import { ItemsQuartetTypeahead } from './ItemsQuartetTypeahead';
import { ItemsQuartetsTable } from './ItemsQuartetsTable';

export function ItemsQuartetSearch({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<DailyQuartetSet>) {
  const [activeQuartetId, setActiveQuartetId] = useState<string | null>(null);
  const activeQuartet = useMemo(() => {
    if (!activeQuartetId) return null;
    return data[activeQuartetId];
  }, [activeQuartetId, data]);
  return (
    <Space direction="vertical">
      <Typography.Title level={5}>Search Quartet</Typography.Title>

      <ItemsQuartetTypeahead quartets={data} onFinish={(id) => setActiveQuartetId(id)} />

      {!!activeQuartet && <ItemsQuartetsTable rows={[activeQuartet]} addEntryToUpdate={addEntryToUpdate} />}
    </Space>
  );
}
