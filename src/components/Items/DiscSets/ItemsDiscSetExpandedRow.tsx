import { Button, Flex, Typography } from 'antd';
import { Item } from 'components/Sprites';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { useTDResource } from 'hooks/useTDResource';
import { sampleSize } from 'lodash';
import { useState } from 'react';
import { DailyDiscSet, Item as ItemT } from 'types';
import { removeDuplicates, sortItemsIds } from 'utils';

import { PlusOutlined } from '@ant-design/icons';

import { ItemsTypeahead } from '../ItemsTypeahead';
import { PasteIds } from '../ParseIds';

type ItemsDiscSetExpandedRowProps = {
  disc: DailyDiscSet;
  addEntryToUpdate: UseResourceFirebaseDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function ItemsDiscSetExpandedRow({ disc, addEntryToUpdate }: ItemsDiscSetExpandedRowProps) {
  const onUpdate = (itemId: string) => {
    addEntryToUpdate(disc.id, {
      ...disc,
      itemsIds: removeDuplicates(sortItemsIds([...disc.itemsIds, itemId])),
    });
  };

  const onUpdateBatch = (itemIds: string[]) => {
    addEntryToUpdate(disc.id, {
      ...disc,
      itemsIds: removeDuplicates(sortItemsIds([...disc.itemsIds, ...itemIds])),
    });
  };

  return (
    <Flex gap={16}>
      <div>
        <Typography.Paragraph>Add Item</Typography.Paragraph>
        <ItemsTypeahead onFinish={onUpdate} />
      </div>

      <RandomSample onUpdate={onUpdate} />

      <PasteIds onUpdateBatch={onUpdateBatch} />
    </Flex>
  );
}

type RandomSampleProps = {
  onUpdate: (itemId: string) => void;
};

function RandomSample({ onUpdate }: RandomSampleProps) {
  const itemsTypeaheadQuery = useTDResource<ItemT>('items');
  const [sampledItems, setSampledItems] = useState<string[]>(
    sampleSize(Object.keys(itemsTypeaheadQuery.data ?? {}), 5)
  );

  const onSample = () => {
    setSampledItems(sampleSize(Object.keys(itemsTypeaheadQuery.data ?? {}), 20));
  };

  return (
    <div>
      <Typography.Paragraph>
        Random Sample{' '}
        <Button size="small" onClick={onSample}>
          Get
        </Button>
      </Typography.Paragraph>
      <Flex gap={16} wrap="wrap">
        {sampledItems.map((itemId, index) => (
          <Flex key={`sample-${itemId}-${index}`} gap={2} vertical>
            <Item id={itemId} width={60} />
            <Flex justify="center" gap={6}>
              <Typography.Text>{itemId}</Typography.Text>
              <Button size="small" shape="circle" onClick={() => onUpdate(itemId)}>
                <PlusOutlined />
              </Button>
            </Flex>
          </Flex>
        ))}
      </Flex>
    </div>
  );
}
