import { DeleteFilled } from '@ant-design/icons';
import { Button, Flex, Popconfirm, Space, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import type { DailyMovieSet, Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';
import { AddItemFlow } from './AddItemsFlow';
import { useMovieUsedHistory } from './useMovieUsedHistory';

type ItemsMoviesTableProps = {
  rows: DailyMovieSet[];
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyMovieSet>['addEntryToUpdate'];
};

export function ItemsMoviesTable({ rows, addEntryToUpdate }: ItemsMoviesTableProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const usedHistory = useMovieUsedHistory();

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

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
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Year',
      dataIndex: 'year',
      render: (year, record) => (
        <MovieEditableCell property="year" value={year} movie={record} addEntryToUpdate={addEntryToUpdate} />
      ),
      sorter: (a, b) => a.year - b.year,
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
      sorter: (a, b) => a.itemsIds.length - b.itemsIds.length,
    },
    {
      title: 'Count',
      dataIndex: 'itemsIds',
      render: (itemsIds: string[]) => removeDuplicates(itemsIds).filter(Boolean).length,
    },
    {
      title: 'Used',
      dataIndex: 'id',
      render: (id: string) => (usedHistory[id] ? 'Yes' : 'No'),
      sorter: (a, b) => {
        if (usedHistory[a.id] && !usedHistory[b.id]) {
          return -1;
        }
        if (!usedHistory[a.id] && usedHistory[b.id]) {
          return 1;
        }
        return b.itemsIds.length - a.itemsIds.length;
      },
    },
  ];

  const expandableProps = useTableExpandableRows<DailyMovieSet>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => <AddItemFlow movie={record} addEntryToUpdate={addEntryToUpdate} />,
    rowExpandable: () => itemsTypeaheadQuery.isSuccess,
  });

  return (
    <Table
      columns={columns}
      rowKey="id"
      dataSource={rows}
      expandable={expandableProps}
      pagination={paginationProps}
    />
  );
}

type RemoveItemFlowProps = {
  movie: DailyMovieSet;
  addEntryToUpdate: (id: string, updatedMovie: DailyMovieSet) => void;
  itemId: string;
};

export function RemoveItemFlow({ movie, addEntryToUpdate, itemId }: RemoveItemFlowProps) {
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

type MovieItemsCellProps = {
  movie: DailyMovieSet;
  itemsIds: string[];
  copyToClipboard: ReturnType<typeof useCopyToClipboardFunction>;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyMovieSet>['addEntryToUpdate'];
};

export function MovieItemsCell({ movie, itemsIds, copyToClipboard, addEntryToUpdate }: MovieItemsCellProps) {
  return (
    <Flex gap={6} wrap="wrap" key={`items-${movie.title}`}>
      {itemsIds.map((itemId, index) => (
        <Flex key={`${movie.title}-${itemId}-${index}`} gap={2} vertical>
          <Item id={itemId} width={60} />
          <Flex justify="center">
            <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
            <RemoveItemFlow movie={movie} addEntryToUpdate={addEntryToUpdate} itemId={itemId} />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

type MovieEditableCellProps = {
  value: string | number;
  movie: DailyMovieSet;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyMovieSet>['addEntryToUpdate'];
  property: keyof DailyMovieSet;
};

export function MovieEditableCell({ value, movie, addEntryToUpdate, property }: MovieEditableCellProps) {
  const handleChange = (newValue: string) => {
    if (typeof value === 'number') {
      return newValue !== String(value)
        ? addEntryToUpdate(movie.id, { ...movie, [property]: Number(newValue) })
        : null;
    }

    return newValue !== value ? addEntryToUpdate(movie.id, { ...movie, [property]: newValue.trim() }) : null;
  };

  return (
    <Space>
      <Typography.Text
        editable={{
          onChange: handleChange,
        }}
      >
        {String(value)}
      </Typography.Text>
    </Space>
  );
}
