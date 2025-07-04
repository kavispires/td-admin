import { Flex, Typography } from 'antd';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { DailyDiscSet } from 'types';
import { removeDuplicates, sortItemsIds } from 'utils';
import { InspirationSample } from '../InspirationSample';
import { ItemsTypeahead } from '../ItemsTypeahead';
import { PasteIds } from '../ParseIds';

type ItemsDiscSetExpandedRowProps = {
  disc: DailyDiscSet;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
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

      <InspirationSample excludeList={disc.itemsIds} onSelect={onUpdate} />

      <PasteIds onUpdateBatch={onUpdateBatch} />
    </Flex>
  );
}
