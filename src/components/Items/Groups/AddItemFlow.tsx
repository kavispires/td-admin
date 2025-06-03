import type { ItemGroup } from 'types';
import { InspirationSample } from '../InspirationSample';
import { ItemsTypeahead } from '../ItemsTypeahead';

type AddItemFlowProps = {
  group: ItemGroup;
  onUpdateGroupItems: (groupId: string, itemIds: string[]) => void;
};

export function AddItemFlow({ group, onUpdateGroupItems }: AddItemFlowProps) {
  const onUpdate = (itemId: string) => {
    onUpdateGroupItems(group.id, [...group.itemsIds, itemId]);
  };

  return (
    <div>
      <ItemsTypeahead onFinish={onUpdate} />
      <InspirationSample onSelect={onUpdate} excludeList={group.itemsIds} initialQuantity={0} />
    </div>
  );
}
