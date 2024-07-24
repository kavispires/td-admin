import { Button, Divider, Space, Table } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useTDResource } from 'hooks/useTDResource';
import { sample } from 'lodash';
import { useState } from 'react';
import { DailyMovieSet, Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';

import { AddItemFlow, MovieEditableCell, MovieItemsCell } from './ItemsMoviesTable';

import type { TableProps } from 'antd';
export function ItemsMoviesSample({
  data,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<DailyMovieSet>) {
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

  return (
    <Space direction="vertical" className="my-4">
      <Button onClick={onGetSample}>Get Sample</Button>
      {sampleEntryId && (
        <Table
          key={String(sampleEntryId)}
          columns={columns}
          rowKey="id"
          dataSource={[data[sampleEntryId]]}
          expandable={{
            expandedRowRender: (record) => <AddItemFlow movie={record} addEntryToUpdate={addEntryToUpdate} />,
            rowExpandable: () => itemsTypeaheadQuery.isSuccess,
          }}
          pagination={false}
        />
      )}

      <Divider />
    </Space>
  );
}
