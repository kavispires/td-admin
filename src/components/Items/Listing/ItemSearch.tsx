import { CloseCircleOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Button, Flex, Space, Typography } from 'antd';
import { useItemsContext } from 'context/ItemsContext';
import { useQueryParams } from 'hooks/useQueryParams';
import { Fragment, useState } from 'react';
import type { Item as ItemT } from 'types';
import { removeDuplicates } from 'utils';
import { ItemsTypeahead } from '../ItemsTypeahead';
import { ItemCard } from './ItemCard';

export function ItemSearch() {
  const { items, isLoading, isSaving } = useItemsContext();
  const [activeItems, setActiveItems] = useState<ItemT[] | null>(null);
  const { queryParams, addParam } = useQueryParams();

  const onFindInListing = (itemId: string) => {
    const pageSize = Number(queryParams.get('pageSize') ?? 64);
    const idNum = Number(itemId);
    const page = Math.floor(idNum / pageSize) + 1;
    addParam('page', page.toString());
  };

  return (
    <Fragment key={`item-search-${isLoading}`}>
      <Typography.Title level={2}>Search for an item</Typography.Title>

      <div>
        <ItemsTypeahead
          items={items}
          isPending={isLoading || isSaving}
          onFinish={(id) => setActiveItems([items[id]])}
          onFinishMultiple={(ids) => setActiveItems(removeDuplicates(ids).map((id) => items[id]))}
        />
      </div>

      {activeItems && activeItems?.length > 0 && (
        <Flex gap={8}>
          <Typography.Paragraph className="mt-1 italic">
            {activeItems?.length} items found
          </Typography.Paragraph>
          <Button
            icon={<CloseCircleOutlined />}
            onClick={() => setActiveItems(null)}
            size="small"
            type="text"
          />
        </Flex>
      )}
      <Flex className="my-4" gap={8} wrap="wrap">
        {activeItems?.map((item) => (
          <Space direction="vertical" className="my-4" key={item.id}>
            <ItemCard item={item} />
            <Button onClick={() => onFindInListing(item.id)} block icon={<EnvironmentOutlined />}>
              Find in listing
            </Button>
          </Space>
        ))}
      </Flex>
    </Fragment>
  );
}
