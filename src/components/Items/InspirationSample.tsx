import { PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Typography } from 'antd';
import { Item } from 'components/Sprites';
import { useTDResource } from 'hooks/useTDResource';
import { difference, sampleSize } from 'lodash';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    setUsedSampleIds([...excludeList]);
  }, [excludeList]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: function doesn't depend on any state
  useEffect(() => {
    if (sampledItems.length === 0 && initialQuantity > 0) {
      onSample();
      setUsedSampleIds([...excludeList]);
    }
  }, [sampledItems, excludeList]);

  return (
    <div className="mt-2">
      <Typography.Paragraph>
        Inspiration Sample{' '}
        <small>({Object.keys(itemsTypeaheadQuery.data ?? {}).length - usedSampleIds.length})</small>{' '}
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
                <Button size="small" shape="circle" onClick={() => onSelect(itemId)}>
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
