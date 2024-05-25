import { Button, Flex, Popconfirm, Space, Table, Typography } from 'antd';

import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { orderBy } from 'lodash';
import { DailyMovieSet, type Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';

import type { TableProps } from 'antd';
import { ItemsTypeahead } from './ItemsTypeahead';
import { DeleteFilled } from '@ant-design/icons';
import { useTDResource } from 'hooks/useTDResource';
import { Item } from 'components/Sprites';
import { useQueryParams } from 'hooks/useQueryParams';
import { useMemo } from 'react';
import { useTablePagination } from 'hooks/useTablePagination';
function orderSets(givenSets: DailyMovieSet[]) {
  return orderBy(givenSets, [
    // (s) => removeDuplicates(s.itemsIds).filter(Boolean).length > 0,
    (s) => s.title,
  ]).map((s) => ({
    ...s,
    itemsIds: orderBy(s.itemsIds, (id) => Number(id)),
  }));
}

export function ItemsMoviesTable({
  data,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<DailyMovieSet>) {
  const copyToClipboard = useCopyToClipboardFunction();
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const { is } = useQueryParams();
  const showOnlyEmpty = is('emptyOnly');

  const rows = useMemo(() => {
    const sets = data ? orderSets(Object.values(data)) : [];
    return showOnlyEmpty ? sets.filter((s) => s.itemsIds.length === 0) : sets;
  }, [data, showOnlyEmpty]);
  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

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
    <Space direction="vertical">
      <Table
        columns={columns}
        rowKey="id"
        dataSource={rows}
        expandable={{
          expandedRowRender: (record) => <AddItemFlow movie={record} addEntryToUpdate={addEntryToUpdate} />,
          rowExpandable: () => itemsTypeaheadQuery.isSuccess,
        }}
        pagination={paginationProps}
      />
    </Space>
  );
}

type AddItemFlowProps = {
  movie: DailyMovieSet;
  addEntryToUpdate: (id: string, item: DailyMovieSet) => void;
};

function AddItemFlow({ movie, addEntryToUpdate }: AddItemFlowProps) {
  const onUpdate = (itemId: string) => {
    addEntryToUpdate(movie.id, {
      ...movie,
      itemsIds: [...movie.itemsIds, itemId],
    });
  };

  return (
    <div>
      <ItemsTypeahead onFinish={onUpdate} />
    </div>
  );
}

type RemoveItemFlowProps = {
  movie: DailyMovieSet;
  addEntryToUpdate: (id: string, item: DailyMovieSet) => void;
  itemId: string;
};

function RemoveItemFlow({ movie, addEntryToUpdate, itemId }: RemoveItemFlowProps) {
  const onRemove = () => {
    addEntryToUpdate(movie.id, {
      ...movie,
      itemsIds: movie.itemsIds.filter((id) => id !== itemId),
    });
  };

  return (
    <Popconfirm
      title="Are you sure you want to remove this item?"
      onConfirm={onRemove}
      okText="Yes"
      cancelText="No"
    >
      <Button icon={<DeleteFilled />} size="small" type="text" />
    </Popconfirm>
  );
}
