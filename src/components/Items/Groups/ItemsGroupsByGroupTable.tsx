import { Drawer, Flex, Table, type TableProps, Typography } from 'antd';
import { TransparentButton } from 'components/Common';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { useTDResource } from 'hooks/useTDResource';
import { useState } from 'react';
import type { ItemGroup, Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';
import { CopyIdsButton } from '../CopyIdsButton';
import { AddItemFlow } from './AddItemFlow';
import { ItemGroupsCard } from './ItemGroupsCard';

type ItemsGroupsTablesProps = {
  rows: ItemGroup[];
  items: Dictionary<ItemT>;
  grousByItem: Record<string, string[]>;
  groupsTypeahead: { value: string; label: string }[];
  onUpdateItemGroups: (itemId: string, groupIds: string[]) => void;
  onUpdateGroupItems: (groupId: string, itemIds: string[]) => void;
  onUpdateName: (name: string, language: 'en' | 'pt', groupId: string) => void;
};

export function ItemsGroupsByGroupTable({
  rows,
  items,
  grousByItem,
  groupsTypeahead,
  onUpdateItemGroups,
  onUpdateGroupItems,
  onUpdateName,
}: ItemsGroupsTablesProps) {
  const copyToClipboard = useCopyToClipboardFunction();
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const [selectedItemId, setSelectedItemId] = useState<null | string>(null);

  const paginationProps = useTablePagination({
    showQuickJumper: true,
    total: rows.length,
  });

  const columns: TableProps<ItemGroup>['columns'] = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span>{id}</span>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: DualLanguageValue, record) => (
        <Flex vertical gap={4}>
          <DualLanguageTextField
            value={name}
            language="en"
            style={{ minWidth: 150 }}
            onChange={(e) => onUpdateName(e.target.value, 'en', record.id)}
          />
          <DualLanguageTextField
            value={name}
            language="pt"
            style={{ minWidth: 150 }}
            onChange={(e) => onUpdateName(e.target.value, 'pt', record.id)}
          />
        </Flex>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => (
        <Flex gap={6} wrap="wrap" key={`items-${record.id}`}>
          {itemsIds.map((itemId) => (
            <Flex key={`${record.id}-${itemId}`} gap={2} vertical>
              <TransparentButton onClick={() => setSelectedItemId(itemId)}>
                <Item id={itemId} width={60} />
              </TransparentButton>
              <Flex justify="center">
                <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
              </Flex>
            </Flex>
          ))}
        </Flex>
      ),
    },
    Table.EXPAND_COLUMN,
    {
      title: 'Count',
      dataIndex: 'itemsIds',
      key: 'count',
      render: (itemsIds: string[]) => removeDuplicates(itemsIds).filter(Boolean).length,
    },
    {
      title: 'Actions',
      dataIndex: 'itemsIds',
      key: 'actions',
      render: (itemsIds: string[]) => <CopyIdsButton ids={itemsIds} />,
    },
  ];

  const selectedItem = selectedItemId ? items[selectedItemId] : null;

  const expandableProps = useTableExpandableRows<ItemGroup>({
    maxExpandedRows: 1,
    expandedRowRender: (record) => <AddItemFlow group={record} onUpdateGroupItems={onUpdateGroupItems} />,
    rowExpandable: () => itemsTypeaheadQuery.isSuccess,
  });

  return (
    <>
      <Table
        columns={columns}
        dataSource={rows}
        className="my-4"
        rowKey="id"
        pagination={paginationProps}
        expandable={expandableProps}
      />
      <Drawer title="Edit Item Group" onClose={() => setSelectedItemId(null)} open={!!selectedItem}>
        {selectedItem && (
          <ItemGroupsCard
            item={selectedItem}
            itemGroups={grousByItem[selectedItem.id]}
            groupsTypeahead={groupsTypeahead}
            onUpdateItemGroups={onUpdateItemGroups}
          />
        )}
      </Drawer>
    </>
  );
}
