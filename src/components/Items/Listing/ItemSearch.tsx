import { Button, Divider, Flex, Space, Typography } from 'antd';
import { Fragment, useState } from 'react';
import type { Item as ItemT } from 'types';

import { EnvironmentOutlined } from '@ant-design/icons';
import { useItemsContext } from 'context/ItemsContext';
import { useQueryParams } from 'hooks/useQueryParams';
import { ItemCard } from '../ItemCard';
import { ItemsTypeahead } from '../ItemsTypeahead';

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
          onFinish={() => {}}
          onFinishMultiple={(ids) => setActiveItems(ids.map((id) => items[id]))}
        />
      </div>

      <Flex className="my-4" gap={8}>
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
