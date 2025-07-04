import { Space, Typography } from 'antd';
import { Typeahead } from 'components/Common/Typeahead';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useMemo, useState } from 'react';
import type { DailyDiscSet } from 'types';
import { ItemsDiscSetsTable } from './ItemsDiscSetsTable';

export function ItemsDiscSetsSearch({
  data,
  addEntryToUpdate,
}: Pick<UseResourceFirestoreDataReturnType<DailyDiscSet>, 'data' | 'addEntryToUpdate'>) {
  const [activeDiscSetId, setActiveDiscSetId] = useState<string | null>(null);
  const activeDiscSet = useMemo(() => {
    if (!activeDiscSetId) return null;
    return data[activeDiscSetId];
  }, [activeDiscSetId, data]);
  return (
    <Space direction="vertical">
      <Typography.Title level={5}>Search Disc Set</Typography.Title>

      <Typeahead
        data={data}
        onFinish={(id) => setActiveDiscSetId(id)}
        parser={typeaheadParser}
        placeholder="Search disc set by title..."
        style={{ width: '100%', minWidth: 450 }}
      />

      {!!activeDiscSet && <ItemsDiscSetsTable addEntryToUpdate={addEntryToUpdate} rows={[activeDiscSet]} />}
    </Space>
  );
}

const typeaheadParser = (data: Record<string, DailyDiscSet>) => {
  return Object.values(data ?? {}).reduce((acc: Record<string, string>, discSet) => {
    acc[`${discSet.title.en}`] = discSet.id;
    acc[`${discSet.title.pt}`] = discSet.id;
    return acc;
  }, {});
};
