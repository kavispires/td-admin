import { AutoComplete, Divider, Space, Typography } from 'antd';
import { useItems } from 'hooks/useItems';
import { useState } from 'react';
import { Item as ItemT } from 'types';

import { ItemCard } from './ItemCard';

export function ItemSearch() {
  const { items, namesDict, names } = useItems();
  const [activeItem, setActiveItem] = useState<ItemT | null>(null);

  const onSelect = (name: string) => {
    if (namesDict[name] !== undefined) {
      setActiveItem(items[namesDict[name]]);
    }
  };

  return (
    <>
      <Typography.Title level={2}>Search for an item</Typography.Title>

      <div>
        <AutoComplete
          options={names}
          style={{ width: 250 }}
          onSelect={onSelect}
          size="large"
          placeholder="Search by name or id..."
          allowClear
          filterOption={(inputValue, option) =>
            option!.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
          }
        />
      </div>

      {Boolean(activeItem) && (
        <Space direction="vertical" className="my-4">
          <ItemCard item={activeItem!} />
        </Space>
      )}
      <Divider />
    </>
  );
}
