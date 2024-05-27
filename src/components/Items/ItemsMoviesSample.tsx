import { Button, Divider, Space } from 'antd';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { sample } from 'lodash';
import { useState } from 'react';
import { DailyMovieSet, type Item as ItemT } from 'types';
import { Flex, Table, Typography } from 'antd';

import { removeDuplicates } from 'utils';

import type { TableProps } from 'antd';
import { Item } from 'components/Sprites';
import { AddItemFlow, RemoveItemFlow } from './ItemsMoviesTable';
import { useTDResource } from 'hooks/useTDResource';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';

export function ItemsMoviesSample({
  data,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<DailyMovieSet>) {
  const [sampleEntryId, setSampleEntryId] = useState<string | null>(null);
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const copyToClipboard = useCopyToClipboardFunction();

  const onGetSample = () => {
    setSampleEntryId(sample(Object.keys(data ?? {})) ?? null);
  };

  const columns: TableProps<DailyMovieSet>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      // key: 'title',
      render: (title) => <span key={title}>{title}</span>,
    },
    {
      title: 'Year',
      dataIndex: 'year',
      // key: 'year',
      render: (year) => <span>{year}</span>,
    },
    Table.EXPAND_COLUMN,
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => (
        <Flex gap={6} wrap="wrap" key={`items-${record.title}`}>
          {itemsIds.map((itemId) => (
            <Flex key={`${record.title}-${itemId}`} gap={2} vertical>
              <Item id={itemId} width={60} />
              <Flex justify="center">
                <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
                <RemoveItemFlow movie={record} addEntryToUpdate={addEntryToUpdate} itemId={itemId} />
              </Flex>
            </Flex>
          ))}
        </Flex>
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
