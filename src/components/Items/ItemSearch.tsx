import { Divider, Space, Typography } from 'antd';
import { Fragment, useState } from 'react';
import { Item as ItemT } from 'types';

import { ItemCard } from './ItemCard';
import { useItemsContext } from 'context/ItemsContext';
import { ItemsTypeahead } from './ItemsTypeahead';

export function ItemSearch() {
  const { items, isLoading, isSaving } = useItemsContext();
  const [activeItem, setActiveItem] = useState<ItemT | null>(null);

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

      {Boolean(activeItem) && (
        <Space direction="vertical" className="my-4" key={activeItem?.id}>
          <ItemCard item={activeItem!} />
        </Space>
      )}
      <Divider />
    </Fragment>
  );
}
