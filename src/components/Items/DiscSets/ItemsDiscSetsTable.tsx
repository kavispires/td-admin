import { DeleteFilled } from '@ant-design/icons';
import { Button, Flex, Popconfirm, Space, Table, Typography } from 'antd';
import type { TableProps } from 'antd';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useTDResource } from 'hooks/useTDResource';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy } from 'lodash';
import { useMemo } from 'react';
import type { DailyDiscSet, Item as ItemT } from 'types';
import { removeDuplicates, sortItemsIds } from 'utils';
import { CopyIdsButton } from '../CopyIdsButton';
import { ItemsDiscSetExpandedRow } from './ItemsDiscSetExpandedRow';

function orderSets(givenSets: DailyDiscSet[]) {
  return orderBy(givenSets, [
    // (s) => removeDuplicates(s.itemsIds).filter(Boolean).length > 20,
    (s) => s.title.en,
  ]).map((s) => ({
    ...s,
    itemsIds: orderBy(s.itemsIds, (id) => Number(id)),
  }));
}

type ItemsDiscSetsTableProps = Pick<
  UseResourceFirebaseDataReturnType<DailyDiscSet>,
  'data' | 'addEntryToUpdate'
>;

export function ItemsDiscSetsTable({ data, addEntryToUpdate }: ItemsDiscSetsTableProps) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const sets = useMemo(() => orderSets(Object.values(data)), [data]);

  const copyToClipboard = useCopyToClipboardFunction();

  const paginationProps = useTablePagination({ total: sets.length, showQuickJumper: true });

  const columns: TableProps<DailyDiscSet>['columns'] = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'id',
      sorter: (a, b) => a.title.en.localeCompare(b.title.en),
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.en.localeCompare(b.title.en),
      render: (title, record) => (
        <DiscEditableTitleCell value={title} disc={record} addEntryToUpdate={addEntryToUpdate} />
      ),
    },
    Table.EXPAND_COLUMN,
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => (
        <DiscItemsCell
          disc={record}
          itemsIds={sortItemsIds(itemsIds)}
          copyToClipboard={copyToClipboard}
          addEntryToUpdate={addEntryToUpdate}
        />
      ),
    },
    {
      title: 'Count',
      dataIndex: 'itemsIds',
      key: 'count',
      render: (itemsIds: string[]) => removeDuplicates(itemsIds).filter(Boolean).length,
    },
  ];

  const expandableProps = useTableExpandableRows<DailyDiscSet>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => (
      <ItemsDiscSetExpandedRow disc={record} addEntryToUpdate={addEntryToUpdate} />
    ),
    rowExpandable: () => itemsTypeaheadQuery.isSuccess,
  });

  return (
    <Space direction="vertical">
      <Table
        columns={columns}
        dataSource={sets}
        pagination={paginationProps}
        rowKey="id"
        expandable={expandableProps}
      />
    </Space>
  );
}

type RemoveItemFlowProps = {
  disc: DailyDiscSet;
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiscSet>['addEntryToUpdate'];
  itemId: string;
};

export function RemoveItemFlow({ disc, addEntryToUpdate, itemId }: RemoveItemFlowProps) {
  const onRemove = () => {
    addEntryToUpdate(disc.id, {
      ...disc,
      itemsIds: disc.itemsIds.filter((id) => id !== itemId),
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

type DiscEditableTitleCellProps = {
  value: DualLanguageValue;
  disc: DailyDiscSet;
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function DiscEditableTitleCell({ value, disc, addEntryToUpdate }: DiscEditableTitleCellProps) {
  const handleChange = (newValue: string, language: Language) => {
    addEntryToUpdate(disc.id, {
      ...disc,
      title: {
        ...disc.title,
        [language]: newValue,
      },
    });
  };

  return (
    <Space direction="vertical" size="small">
      <Typography.Text
        editable={{
          onChange: (v) => handleChange(v, 'pt'),
        }}
      >
        {String(value.pt)}
      </Typography.Text>
      <Typography.Text
        editable={{
          onChange: (v) => handleChange(v, 'en'),
        }}
      >
        {String(value.en)}
      </Typography.Text>
    </Space>
  );
}

type DiscItemsCellProps = {
  disc: DailyDiscSet;
  itemsIds: string[];
  copyToClipboard: ReturnType<typeof useCopyToClipboardFunction>;
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function DiscItemsCell({ disc, itemsIds, copyToClipboard, addEntryToUpdate }: DiscItemsCellProps) {
  return (
    <Flex gap={6} wrap="wrap" key={`items-${disc.title}`}>
      {itemsIds.map((itemId, index) => (
        <Flex key={`${disc.title}-${itemId}-${index}`} gap={2} vertical>
          <Item id={itemId} width={60} />
          <Flex justify="center">
            <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
            <RemoveItemFlow disc={disc} addEntryToUpdate={addEntryToUpdate} itemId={itemId} />
          </Flex>
        </Flex>
      ))}
      <CopyIdsButton ids={itemsIds} />
    </Flex>
  );
}
