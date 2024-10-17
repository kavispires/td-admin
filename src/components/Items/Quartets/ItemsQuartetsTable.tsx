import { Button, Flex, Popconfirm, Rate, Select, Space, Table, Typography } from 'antd';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useTablePagination } from 'hooks/useTablePagination';
import { useTDResource } from 'hooks/useTDResource';
import { DailyQuartetSet, Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';

import { CheckCircleFilled, DeleteFilled } from '@ant-design/icons';

import { ItemsTypeahead } from '../ItemsTypeahead';

import type { TableProps } from 'antd';

const TYPES = ['general', 'visual', 'word', 'thematic', 'attribute'].map((t) => ({ label: t, value: t }));

type ItemsQuartetsTableProps = {
  rows: DailyQuartetSet[];
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyQuartetSet>['addEntryToUpdate'];
  expandedRowKeys?: string[];
};

export function ItemsQuartetsTable({ rows, addEntryToUpdate, expandedRowKeys }: ItemsQuartetsTableProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');

  const paginationProps = useTablePagination({ total: rows.length, showQuickJumper: true });

  const columns: TableProps<DailyQuartetSet>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (title, record) => (
        <QuartetEditableCell
          property="title"
          value={title}
          quartet={record}
          addEntryToUpdate={addEntryToUpdate}
        />
      ),
    },
    Table.EXPAND_COLUMN,
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => (
        <QuartetItemsCell
          quartet={record}
          itemsIds={itemsIds}
          copyToClipboard={copyToClipboard}
          addEntryToUpdate={addEntryToUpdate}
        />
      ),
    },
    {
      title: 'Count',
      dataIndex: 'itemsIds',
      render: (itemsIds: string[]) => removeDuplicates(itemsIds).filter(Boolean).length,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type, record) => (
        <Select
          defaultValue={type}
          options={TYPES}
          size="small"
          style={{ width: 100 }}
          onChange={(type) => addEntryToUpdate(record.id, { ...record, type })}
        />
      ),
    },
    {
      title: 'Level',
      dataIndex: 'level',
      render: (level, record) => (
        <Rate
          count={3}
          value={level}
          onChange={(v) => addEntryToUpdate(record.id, { ...record, level: v })}
        />
      ),
    },
    {
      title: 'Perfect Quartet',
      dataIndex: 'itemsIds',
      render: (itemsIds: string[]) => {
        const uniqueItems = removeDuplicates(itemsIds).filter(Boolean);
        return uniqueItems.length === 4 && <CheckCircleFilled style={{ color: 'dodgerblue' }} />;
      },
    },
  ];

  return (
    <Table
      columns={columns}
      rowKey="id"
      dataSource={rows}
      expandable={{
        expandedRowRender: (record) => <AddItemFlow quartet={record} addEntryToUpdate={addEntryToUpdate} />,
        rowExpandable: () => itemsTypeaheadQuery.isSuccess,
        expandedRowKeys,
      }}
      pagination={paginationProps}
    />
  );
}

type AddItemFlowProps = {
  quartet: DailyQuartetSet;
  addEntryToUpdate: (id: string, item: DailyQuartetSet) => void;
};

export function AddItemFlow({ quartet, addEntryToUpdate }: AddItemFlowProps) {
  const onUpdate = (itemId: string) => {
    addEntryToUpdate(quartet.id, {
      ...quartet,
      itemsIds: [...quartet.itemsIds, itemId],
    });
  };

  return (
    <div>
      <ItemsTypeahead onFinish={onUpdate} />
    </div>
  );
}

type RemoveItemFlowProps = {
  quartet: DailyQuartetSet;
  addEntryToUpdate: (id: string, item: DailyQuartetSet) => void;
  itemId: string;
};

export function RemoveItemFlow({ quartet, addEntryToUpdate, itemId }: RemoveItemFlowProps) {
  const onRemove = () => {
    addEntryToUpdate(quartet.id, {
      ...quartet,
      itemsIds: quartet.itemsIds.filter((id) => id !== itemId),
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

type QuartetItemsCellProps = {
  quartet: DailyQuartetSet;
  itemsIds: string[];
  copyToClipboard: ReturnType<typeof useCopyToClipboardFunction>;
  addEntryToUpdate: AddItemFlowProps['addEntryToUpdate'];
};

export function QuartetItemsCell({
  quartet,
  itemsIds,
  copyToClipboard,
  addEntryToUpdate,
}: QuartetItemsCellProps) {
  return (
    <Flex gap={6} wrap="wrap" key={`items-${quartet.title}`}>
      {itemsIds.map((itemId) => (
        <Flex key={`${quartet.title}-${itemId}`} gap={2} vertical>
          {!!itemId ? <Item id={String(itemId)} width={60} /> : <>{console.log(itemId)}</>}
          <Flex justify="center">
            <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
            <RemoveItemFlow quartet={quartet} addEntryToUpdate={addEntryToUpdate} itemId={itemId} />
          </Flex>
        </Flex>
      ))}
    </Flex>
  );
}

type QuartetEditableCellProps = {
  value: string | number;
  quartet: DailyQuartetSet;
  addEntryToUpdate: AddItemFlowProps['addEntryToUpdate'];
  property: keyof DailyQuartetSet;
};

export function QuartetEditableCell({
  value,
  quartet,
  addEntryToUpdate,
  property,
}: QuartetEditableCellProps) {
  const handleChange = (newValue: string) => {
    if (typeof value === 'number') {
      return newValue !== String(value)
        ? addEntryToUpdate(quartet.id, { ...quartet, [property]: Number(newValue) })
        : null;
    }

    return newValue !== value
      ? addEntryToUpdate(quartet.id, { ...quartet, [property]: newValue.trim() })
      : null;
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
