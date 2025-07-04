import { PlusOutlined, SyncOutlined } from '@ant-design/icons';
import { Button, Flex, Popconfirm, Typography } from 'antd';
import { Item } from 'components/Sprites';
import { useTDResource } from 'hooks/useTDResource';
import { difference, sampleSize } from 'lodash';
import { useState } from 'react';
import type { Item as ItemT } from 'types';

type InspirationSampleProps = {
  /**
   * Function to call when an item is selected.
   */
  onSelect: (itemId: string) => void;
  /**
   * List of item IDs to exclude from the sample.
   */
  excludeList: string[];
  /**
   * Initial quantity of items to sample.
   */
  initialQuantity?: number;
};

/**
 * InspirationSample component to display a sample of items for inspiration.
 */
export function InspirationSample({ onSelect, excludeList, initialQuantity = 24 }: InspirationSampleProps) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const [usedSampleIds, setUsedSampleIds] = useState<string[]>([...excludeList]);

  const getSample = (quantity: number) => {
    const availableItems = difference(Object.keys(itemsTypeaheadQuery.data ?? {}), usedSampleIds);
    return sampleSize(availableItems, quantity);
  };

  const [sampledItems, setSampledItems] = useState<string[]>(getSample(initialQuantity));

  const onSample = () => {
    const newSample = getSample(24);
    setSampledItems(newSample);
    setUsedSampleIds([...usedSampleIds, ...newSample]);
  };

  const onRefresh = () => {
    setUsedSampleIds([...excludeList]);
  };

  return (
    <div className="mt-2">
      <Flex className="mb-2" gap={12}>
        <Typography.Text>
          Inspiration Sample{' '}
          <small>({Object.keys(itemsTypeaheadQuery.data ?? {}).length - usedSampleIds.length})</small>{' '}
        </Typography.Text>
        <Button onClick={onSample} size="small">
          Get
        </Button>
        <Popconfirm cancelText="No" okText="Yes" onConfirm={onRefresh} title="Are you sure?">
          <Button icon={<SyncOutlined />} size="small" />
        </Popconfirm>
      </Flex>
      <Flex gap={16} wrap="wrap">
        {sampledItems.map((itemId, index) => {
          const item = itemsTypeaheadQuery.data?.[itemId];
          return (
            <Flex gap={2} key={`sample-${itemId}-${index}`} vertical>
              <Item id={itemId} title={`${item.name.en} | ${item.name.pt}`} width={60} />
              <Flex gap={6} justify="center">
                <Typography.Text>{itemId}</Typography.Text>
                <Button onClick={() => onSelect(itemId)} shape="circle" size="small">
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
