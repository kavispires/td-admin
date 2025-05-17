import { Button, Divider, Space, Table } from 'antd';
import type { TableProps } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { sample } from 'lodash';
import { useState } from 'react';
import type { DailyMovieSet, Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';
import { AddItemFlow, MovieEditableCell, MovieItemsCell } from './ItemsMoviesTable';
export function ItemsMoviesSample({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<DailyMovieSet>) {
  const [sampleEntryId, setSampleEntryId] = useState<string | null>(null);
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const copyToClipboard = useCopyToClipboardFunction();

  const onGetSample = () => {
    let newSampleId = sample(Object.keys(data ?? {}));
    let tries = 0;

    // Tries a maximum of 15 times to find a sample with no itemsIds

    while (tries < 15 && (data[String(newSampleId)]?.itemsIds ?? []).length > 0) {
      newSampleId = sample(Object.keys(data ?? {}));

      tries++;
    }

    if (tries >= 15) return console.warn('Could not find a sample with no itemsIds');

    setSampleEntryId(newSampleId ?? null);
  };

  const columns: TableProps<DailyMovieSet>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title, record) => (
        <MovieEditableCell
          property="title"
          value={title}
          movie={record}
          addEntryToUpdate={addEntryToUpdate}
        />
      ),
    },
    {
      title: 'Year',
      dataIndex: 'year',
      render: (year, record) => (
        <MovieEditableCell property="year" value={year} movie={record} addEntryToUpdate={addEntryToUpdate} />
      ),
    },
    Table.EXPAND_COLUMN,
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => (
        <MovieItemsCell
          movie={record}
          itemsIds={itemsIds}
          copyToClipboard={copyToClipboard}
          addEntryToUpdate={addEntryToUpdate}
        />
      ),
    },
    {
      title: 'Count',
      dataIndex: 'itemsIds',
      // key: 'count',
      render: (itemsIds: string[]) => removeDuplicates(itemsIds).filter(Boolean).length,
    },
  ];

  const expandableProps = useTableExpandableRows<DailyMovieSet>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => <AddItemFlow movie={record} addEntryToUpdate={addEntryToUpdate} />,
    rowExpandable: () => itemsTypeaheadQuery.isSuccess,
  });

  return (
    <Space direction="vertical" className="my-4">
      <Button onClick={onGetSample}>Get Sample</Button>
      {sampleEntryId && (
        <Table
          key={String(sampleEntryId)}
          columns={columns}
          rowKey="id"
          dataSource={[data[sampleEntryId]]}
          expandable={expandableProps}
          pagination={false}
        />
      )}

      <Divider />
    </Space>
  );
}
