import { Button, Divider, Space, Typography } from 'antd';
import { Fragment, useState } from 'react';
import type { Item as ItemT } from 'types';

import { EnvironmentOutlined } from '@ant-design/icons';
import { useItemsContext } from 'context/ItemsContext';
import { useQueryParams } from 'hooks/useQueryParams';
import { ItemCard } from '../ItemCard';
import { ItemsTypeahead } from '../ItemsTypeahead';

export function ItemSearch() {
  const { items, isLoading, isSaving } = useItemsContext();
  const [activeItem, setActiveItem] = useState<ItemT | null>(null);
  const { queryParams, addParam } = useQueryParams();

  const onFindInListing = () => {
    if (activeItem) {
      const pageSize = Number(queryParams.get('pageSize') ?? 64);
      const idNum = Number(activeItem.id);
      const page = Math.floor(idNum / pageSize) + 1;
      addParam('page', page.toString());
    }
  };

  return (
    <Fragment key={`item-search-${isLoading}`}>
      <Typography.Title level={2}>Search for an item</Typography.Title>

      <div>
        <ItemsTypeahead
          items={items}
          isPending={isLoading || isSaving}
          onFinish={(id) => setActiveItem(items[id])}
        />
      </div>

      {!!activeItem && (
        <Space direction="vertical" className="my-4" key={activeItem?.id}>
          <ItemCard item={activeItem} />
          <Button onClick={onFindInListing} block icon={<EnvironmentOutlined />}>
            Find in listing
          </Button>
        </Space>
      )}
    </Fragment>
  );
}
