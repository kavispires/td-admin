import { Button, Divider, Space, Typography } from 'antd';
import { useState } from 'react';
import { Item as ItemT } from 'types';

import { ItemCard } from './ItemCard';
import { useItemsContext } from 'context/ItemsContext';
import { sampleSize } from 'lodash';

export function ItemRandomized() {
  const { listing } = useItemsContext();
  const [randomItems, setRandomItems] = useState<ItemT[]>([]);

  const onRandomSample = () => {
    setRandomItems(sampleSize(listing, 5));
  };

  return (
    <div>
      <Typography.Title level={2}>Randomized Sample</Typography.Title>

      <div>
        <Button onClick={onRandomSample}>Get Sample</Button>
      </div>

      <Space wrap className="my-4">
        {randomItems.map((item) => (
          <ItemCard key={item.id} item={item} simplified />
        ))}
      </Space>

      <Divider />
    </div>
  );
}
