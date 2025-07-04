import type { TableProps } from 'antd';
import { Button, Space, Table } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTDResource } from 'hooks/useTDResource';
import { sample } from 'lodash';
import { useState } from 'react';
import type { DailyMovieSet, Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';
import { AddItemFlow } from './AddItemsFlow';
import { MovieEditableCell, MovieItemsCell } from './ItemsMoviesTable';

const SEARCH_THRESHOLD = 30; // Maximum number of tries to find a sample with no itemsIds

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

    // Tries a maximum of 30 times to find a sample with no itemsIds
    while (tries < SEARCH_THRESHOLD && (data[String(newSampleId)]?.itemsIds ?? []).length > 0) {
      newSampleId = sample(Object.keys(data ?? {}));

      tries++;
    }

    if (tries >= SEARCH_THRESHOLD) return console.warn('Could not find a sample with no itemsIds');

    setSampleEntryId(newSampleId ?? null);
  };

  const columns: TableProps<DailyMovieSet>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title, record) => (
        <MovieEditableCell
          addEntryToUpdate={addEntryToUpdate}
          movie={record}
          property="title"
          value={title}
        />
      ),
    },
    {
      title: 'Year',
      dataIndex: 'year',
      render: (year, record) => (
        <MovieEditableCell addEntryToUpdate={addEntryToUpdate} movie={record} property="year" value={year} />
      ),
    },
    Table.EXPAND_COLUMN,
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => (
        <MovieItemsCell
          addEntryToUpdate={addEntryToUpdate}
          copyToClipboard={copyToClipboard}
          itemsIds={itemsIds}
          movie={record}
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
    expandedRowRender: (record) => <AddItemFlow addEntryToUpdate={addEntryToUpdate} movie={record} />,
    rowExpandable: () => itemsTypeaheadQuery.isSuccess,
  });

  return (
    <Space className="my-4" direction="vertical">
      <Button onClick={onGetSample}>Get Random Movie</Button>
      {sampleEntryId && (
        <Table
          columns={columns}
          dataSource={[data[sampleEntryId]]}
          expandable={expandableProps}
          key={String(sampleEntryId)}
          pagination={false}
          rowKey="id"
        />
      )}
    </Space>
  );
}
