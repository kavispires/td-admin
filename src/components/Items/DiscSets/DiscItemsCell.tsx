import { Flex, Typography } from 'antd';
import { Item } from 'components/Sprites';
import type { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { DailyDiscSet } from 'types';
import { CopyIdsButton } from '../CopyIdsButton';
import { RemoveItemFlow } from './RemoveItemFlow';

type DiscItemsCellProps = {
  disc: DailyDiscSet;
  itemsIds: string[];
  copyToClipboard: ReturnType<typeof useCopyToClipboardFunction>;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
};

export function DiscItemsCell({ disc, itemsIds, copyToClipboard, addEntryToUpdate }: DiscItemsCellProps) {
  return (
    <Flex gap={6} wrap="wrap" key={`items-${disc.title}`}>
      {itemsIds.map((itemId, index) => (
        <Flex key={`${disc.title}-${itemId}-${index}`} gap={2} vertical>
          <Item id={itemId} width={60} />
          <Flex justify="center">
            <Typography.Text onClick={() => copyToClipboard(itemId)}>{itemId}</Typography.Text>
            <RemoveItemFlow disc={disc} addEntryToUpdate={addEntryToUpdate} itemId={itemId} />
          </Flex>
        </Flex>
      ))}
      <CopyIdsButton ids={itemsIds} />
    </Flex>
  );
}
