import { Col, Flex, Pagination, Row, Table, TableProps, Typography } from 'antd';
import { Item } from 'components/Sprites';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useTDResource } from 'hooks/useTDResource';
import { useMemo } from 'react';
import { Item as ItemT, ItemGroup } from 'types';
import { removeDuplicates } from 'utils';
import { ItemGroupsCard } from './ItemGroupsCard';
import { orderBy } from 'lodash';

export function ItemsGroupsContent({ data, addEntryToUpdate }: UseResourceFirebaseDataReturnType<ItemGroup>) {
  const { queryParams } = useQueryParams();
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
        Object.keys(data).map((id) => ({ label: id, value: id })),
        'label'
      ),
    [data]
  );

  const onAddToGroup = (groupId: string, itemId: string) => {
    // If group exist, add item to group
    const group = data[groupId] ?? { itemIds: [] };
    if (group.itemsIds.includes(itemId)) {
      addEntryToUpdate(groupId, {
        id: groupId,
        itemsIds: group.itemsIds.filter((id) => id !== itemId),
      });
    } else {
      addEntryToUpdate(groupId, {
        id: groupId,
        itemsIds: removeDuplicates([...group.itemsIds, itemId]),
      });
    }
  };

  return (
    <>
      {queryParams.display === 'group' && <ItemsGroupsByGroupTable data={data} />}
      {queryParams.display === 'item' && (
        <ItemsGroupsByItemTable
          items={itemsTypeaheadQuery.data}
          grousByItem={grousByItem}
          groupsTypeahead={groupsTypeahead}
          onAddToGroup={onAddToGroup}
        />
      )}
    </>
  );
}

function ItemsGroupsByGroupTable({ data }: Pick<UseResourceFirebaseDataReturnType<ItemGroup>, 'data'>) {
  const copyToClipboard = useCopyToClipboardFunction();

  const columns: TableProps<ItemGroup>['columns'] = [
    {
      title: 'id',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span>{id}</span>,
    },
    {
      title: 'Items',
      dataIndex: 'itemsIds',
      key: 'itemsIds',
      render: (itemsIds: string[], record) => (
        <Flex gap={6} wrap="wrap" key={`items-${record.id}`}>
          {itemsIds.map((itemId) => (
            <Flex key={`${record.id}-${itemId}`} gap={2} vertical>
              <Item id={itemId} width={60} />
              <Flex justify="center">
                <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
              </Flex>
            </Flex>
          ))}
        </Flex>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'itemsIds',
      key: 'count',
      render: (itemsIds: string[]) => removeDuplicates(itemsIds).filter(Boolean).length,
    },
  ];

  return <Table columns={columns} dataSource={Object.values(data)} className="my-4" />;
}

type ItemsGroupsByItemTableProps = {
  items: Dictionary<ItemT>;
  grousByItem: Record<string, string[]>;
  groupsTypeahead: { value: string; label: string }[];
  onAddToGroup: (groupId: string, itemId: string) => void;
};

function ItemsGroupsByItemTable({
  items,
  grousByItem,
  groupsTypeahead,
  onAddToGroup,
}: ItemsGroupsByItemTableProps) {
  const { queryParams, addParam } = useQueryParams();
  const currentPage = Number(queryParams.page ?? '1');
  const pageSize = Number(queryParams.pageSize ?? '64');
  const showOnlyEmpty = queryParams.emptyOnly === 'true';

  const page = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return Object.values(items)
      .filter((v) => (showOnlyEmpty ? !grousByItem[v.id] : true))
      .slice(start, end);
  }, [currentPage, pageSize, items, showOnlyEmpty, grousByItem]);

  const onChange = (page: number) => {
    addParam('page', page.toString());
  };
  const onPageSizeChange = (_: number, size: number) => {
    addParam('pageSize', size.toString());
  };

  const pagination = (
    <Pagination
      onChange={onChange}
      current={currentPage}
      total={Object.keys(items).length}
      pageSizeOptions={[16, 32, 64, 128]}
      pageSize={pageSize}
      onShowSizeChange={onPageSizeChange}
      className="fixed-pagination"
    />
  );

  return (
    <>
      <Typography.Title level={2}>Groups by Items</Typography.Title>

      {pagination}

      <Row gutter={[16, 16]} className="my-4">
        {page.map((item) => (
          <Col key={item.id} xs={24} sm={24} md={12} lg={6} xl={4}>
            <ItemGroupsCard
              item={item}
              itemGroups={grousByItem[item.id]}
              groupsTypeahead={groupsTypeahead}
              onAddToGroup={onAddToGroup}
            />
          </Col>
        ))}
      </Row>

      {pagination}
    </>
  );
}
