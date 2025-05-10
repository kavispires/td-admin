import { Flex, Typography } from 'antd';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import type { DailyDiscSet } from 'types';
import { removeDuplicates, sortItemsIds } from 'utils';
import { InspirationSample } from '../InspirationSample';
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

      <InspirationSample onSelect={onUpdate} excludeList={disc.itemsIds} />

      <PasteIds onUpdateBatch={onUpdateBatch} />
    </Flex>
  );
}
