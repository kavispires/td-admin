import { Space, Typography } from 'antd';
import { Typeahead } from 'components/Common/Typeahead';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useMemo, useState } from 'react';
import type { DailyQuartetSet } from 'types';
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

      <Typeahead
        data={data}
        onFinish={(id) => setActiveQuartetId(id)}
        parser={typeaheadParser}
        placeholder="Search quartet by title..."
      />

      {!!activeQuartet && <ItemsQuartetsTable addEntryToUpdate={addEntryToUpdate} rows={[activeQuartet]} />}
    </Space>
  );
}

const typeaheadParser = (data: Record<string, DailyQuartetSet>) => {
  return Object.values(data ?? {}).reduce((acc: Record<string, string>, quartet) => {
    acc[quartet.title] = quartet.id;
    return acc;
  }, {});
};
