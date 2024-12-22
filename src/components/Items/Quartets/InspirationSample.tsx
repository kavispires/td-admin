import { Button, Flex, Typography } from 'antd';
import { useState } from 'react';
import type { DailyQuartetSet, Item as ItemT } from 'types';
import { useTDResource } from 'hooks/useTDResource';
import { difference, sampleSize } from 'lodash';
import { Item } from 'components/Sprites';
import { PlusOutlined } from '@ant-design/icons';

type InspirationSampleProps = {
  onUpdate: (itemId: string) => void;
  quartet: DailyQuartetSet;
  initialQuantity?: number;
};

export function InspirationSample({ onUpdate, quartet, initialQuantity = 24 }: InspirationSampleProps) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const getSample = (quantity: number) => {
    return difference(sampleSize(Object.keys(itemsTypeaheadQuery.data ?? {}), quantity), quartet.itemsIds);
  };

  const [sampledItems, setSampledItems] = useState<string[]>(getSample(initialQuantity));

  const onSample = () => {
    setSampledItems(getSample(24));
  };

  return (
    <div className="mt-2">
      <Typography.Paragraph>
        Inspiration Sample{' '}
        <Button size="small" onClick={onSample}>
          Get
        </Button>
      </Typography.Paragraph>
      <Flex gap={16} wrap="wrap">
        {sampledItems.map((itemId, index) => {
          const item = itemsTypeaheadQuery.data?.[itemId];
          return (
            <Flex key={`sample-${itemId}-${index}`} gap={2} vertical>
              <Item id={itemId} width={60} title={`${item.name.en} | ${item.name.pt}`} />
              <Flex justify="center" gap={6}>
                <Typography.Text>{itemId}</Typography.Text>
                <Button size="small" shape="circle" onClick={() => onUpdate(itemId)}>
                  <PlusOutlined />
                </Button>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </div>
  );
}
