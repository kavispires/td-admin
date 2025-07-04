import { Col, Row, Typography } from 'antd';
import { PaginationWrapper } from 'components/Common/PaginationWrapper';
import { useGridPagination } from 'hooks/useGridPagination';
import { useQueryParams } from 'hooks/useQueryParams';
import { useMemo } from 'react';
import type { Item as ItemT } from 'types';
import { ItemGroupsCard } from './ItemGroupsCard';

type ItemsGroupsTablesProps = {
  items: Dictionary<ItemT>;
  grousByItem: Record<string, string[]>;
  groupsTypeahead: { value: string; label: string }[];
  onUpdateItemGroups: (itemId: string, groupIds: string[]) => void;
  onUpdateGroupItems: (groupId: string, itemIds: string[]) => void;
  onUpdateName: (name: string, language: 'en' | 'pt', groupId: string) => void;
};

export function ItemsGroupsByItemTable({
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
        <Row className="my-4" gutter={[16, 16]}>
          {page.map((item) => (
            <Col key={item.id} lg={6} md={12} sm={24} xl={4} xs={24}>
              <ItemGroupsCard
                groupsTypeahead={groupsTypeahead}
                item={item}
                itemGroups={grousByItem[item.id]}
                onUpdateItemGroups={onUpdateItemGroups}
              />
            </Col>
          ))}
        </Row>
      </PaginationWrapper>
    </>
  );
}
