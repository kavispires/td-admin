import { Button, Divider, Dropdown, Flex, Form, InputNumber, Space, Typography } from 'antd';
import { useState } from 'react';
import { Item as ItemT } from 'types';

import { ItemCard } from './ItemCard';
import { useItemsContext } from 'context/ItemsContext';
import { sampleSize } from 'lodash';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';

export function ItemRandomized() {
  const { listing } = useItemsContext();
  const [randomItems, setRandomItems] = useState<ItemT[]>([]);
  const copyToClipboard = useCopyToClipboardFunction();

  const [sampleQuantity, setSampleQuantity] = useState(5);

  const onRandomSample = () => {
    setRandomItems(sampleSize(listing, sampleQuantity));
  };

  const items = [
    { label: 'Copy IDs', key: 'copy_ids' },
    { label: 'Copy Names EN', key: 'copy_names_en' },
    { label: 'Copy Names PT', key: 'copy_names_pt' },
  ];

  const onMenuClick = ({ key }: { key: string }) => {
    console.log(key);

    if (key === 'copy_ids') {
      const ids = randomItems.map((item) => item.id);
      copyToClipboard(JSON.stringify(ids));
      return;
    }

    if (key === 'copy_names_en') {
      const names = randomItems.map((item) => item.name.en).join(', ');
      copyToClipboard(names);
      return;
    }

    if (key === 'copy_names_pt') {
      const names = randomItems.map((item) => item.name.pt).join(', ');
      copyToClipboard(names);
      return;
    }
  };

  return (
    <div>
      <Typography.Title level={2}>Randomized Sample</Typography.Title>

      <Flex gap={12}>
        <Form.Item label="Quantity"></Form.Item>
        <div>
          <InputNumber
            min={3}
            max={15}
            value={sampleQuantity}
            onChange={(v) => setSampleQuantity(Number(v))}
            style={{ minWidth: '100px' }}
          />
        </div>
        <Button onClick={onRandomSample} type="primary">
          Get Sample
        </Button>

        <Dropdown.Button
          menu={{ items, onClick: onMenuClick }}
          disabled={randomItems.length === 0}
          onClick={() => copyToClipboard(JSON.stringify(randomItems, null, 2))}
        >
          Copy
        </Dropdown.Button>
      </Flex>

      <Space wrap className="my-4">
        {randomItems.map((item) => (
          <ItemCard key={item.id} item={item} simplified />
        ))}
      </Space>

      <Divider />
    </div>
  );
}
