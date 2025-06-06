import { Col, Drawer, Flex, Row, Table, type TableProps, Typography } from 'antd';
import { TransparentButton } from 'components/Common';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useGridPagination } from 'hooks/useGridPagination';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { useTableExpandableRows } from 'hooks/useTableExpandableRows';
import { useTablePagination } from 'hooks/useTablePagination';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';
import type { ItemGroup, Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';
import { CopyIdsButton } from '../CopyIdsButton';
import { InspirationSample } from '../InspirationSample';
import { ItemsTypeahead } from '../ItemsTypeahead';
import { ItemGroupsCard } from './ItemGroupsCard';

export function ItemsGroupsContent({
  data,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<ItemGroup>) {
  const { is, queryParams } = useQueryParams();
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');

  const grousByItem = useMemo(() => {
    return Object.values(data ?? []).reduce((acc: Record<string, string[]>, group) => {
      if (!group.itemsIds) {
        console.warn('Group without items', group);
      }
      group.itemsIds.forEach((itemId) => {
        if (!acc[itemId]) {
          acc[itemId] = [];
        }
        acc[itemId].push(group.id);
      });

      return acc;
    }, {});
  }, [data]);

  const groupsTypeahead = useMemo(
    () =>
      orderBy(
        Object.values(data).flatMap(({ id, name }) => [{ label: `${name.en} [${id}]`, value: id }]),
        'label',
      ),
    [data],
  );

  const onUpdateItemGroups = (itemId: string, groupIds: string[]) => {
    // Compare previous groups in items with new groups
    const previousGroups = grousByItem[itemId] ?? [];
    const groupsToAdd = groupIds.filter((id) => !previousGroups.includes(id));
    const groupsToRemove = previousGroups.filter((id) => !groupIds.includes(id));

    // Add item to groups
    groupsToAdd.forEach((groupId) => {
      const group = data[groupId];
      addEntryToUpdate(groupId, {
        ...group,
        itemsIds: removeDuplicates([...(group?.itemsIds ?? []), itemId]),
      });
    });

    // Remove item from groups
    groupsToRemove.forEach((groupId) => {
      const group = data[groupId];
      addEntryToUpdate(groupId, {
        ...group,
        itemsIds: removeDuplicates(group?.itemsIds.filter((id) => id !== itemId)),
      });
    });
  };

  const onUpdateGroupItems = (groupId: string, itemIds: string[]) => {
    const group = data[groupId];
    addEntryToUpdate(groupId, {
      ...group,
      itemsIds: removeDuplicates(itemIds),
    });
  };

  const onUpdateName = (name: string, language: 'en' | 'pt', groupId: string) => {
    const group = data[groupId];
    addEntryToUpdate(groupId, {
      ...group,
      name: {
        ...group.name,
        [language]: name,
      },
    });
  };

  return (
    <>
      {(is('display', 'group') || !queryParams.has('display')) && (
        <ItemsGroupsByGroupTable
          data={data}
          items={itemsTypeaheadQuery.data}
          grousByItem={grousByItem}
          groupsTypeahead={groupsTypeahead}
          onUpdateItemGroups={onUpdateItemGroups}
          onUpdateGroupItems={onUpdateGroupItems}
          onUpdateName={onUpdateName}
        />
      )}
      {is('display', 'item') && (
        <ItemsGroupsByItemTable
          data={data}
          items={itemsTypeaheadQuery.data}
          grousByItem={grousByItem}
          groupsTypeahead={groupsTypeahead}
          onUpdateItemGroups={onUpdateItemGroups}
          onUpdateGroupItems={onUpdateGroupItems}
          onUpdateName={onUpdateName}
        />
      )}
    </>
  );
}

type ItemsGroupsTablesProps = {
  items: Dictionary<ItemT>;
  grousByItem: Record<string, string[]>;
  groupsTypeahead: { value: string; label: string }[];
  onUpdateItemGroups: (itemId: string, groupIds: string[]) => void;
  onUpdateGroupItems: (groupId: string, itemIds: string[]) => void;
  onUpdateName: (name: string, language: 'en' | 'pt', groupId: string) => void;
} & Pick<UseResourceFirestoreDataReturnType<ItemGroup>, 'data'>;

function ItemsGroupsByGroupTable({
  data,
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
    total: Object.keys(data).length,
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
        dataSource={Object.values(data)}
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

type AddItemFlowProps = {
  group: ItemGroup;
  onUpdateGroupItems: (groupId: string, itemIds: string[]) => void;
};

export function AddItemFlow({ group, onUpdateGroupItems }: AddItemFlowProps) {
  const onUpdate = (itemId: string) => {
    onUpdateGroupItems(group.id, [...group.itemsIds, itemId]);
  };

  return (
    <div>
      <ItemsTypeahead onFinish={onUpdate} />
      <InspirationSample onSelect={onUpdate} excludeList={group.itemsIds} initialQuantity={0} />
    </div>
  );
}

function ItemsGroupsByItemTable({
  items,
  grousByItem,
  groupsTypeahead,
  onUpdateItemGroups,
}: ItemsGroupsTablesProps) {
  const { is } = useQueryParams();
  const showOnlyEmpty = is('emptyOnly');

  const data = useMemo(
    () => (showOnlyEmpty ? Object.values(items).filter((v) => !grousByItem[v.id]) : Object.values(items)),
    [items, grousByItem, showOnlyEmpty],
  );

  const { page, pagination } = useGridPagination({ data });

  return (
    <>
      <Typography.Title level={2}>Groups by Items ({data.length})</Typography.Title>
      <PaginationWrapper pagination={pagination}>
        <Row gutter={[16, 16]} className="my-4">
          {page.map((item) => (
            <Col key={item.id} xs={24} sm={24} md={12} lg={6} xl={4}>
              <ItemGroupsCard
                item={item}
                itemGroups={grousByItem[item.id]}
                groupsTypeahead={groupsTypeahead}
                onUpdateItemGroups={onUpdateItemGroups}
              />
            </Col>
          ))}
        </Row>
      </PaginationWrapper>
    </>
  );
}
