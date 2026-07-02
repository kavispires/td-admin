import { DeleteFilled } from '@ant-design/icons';
import type { UseResourceFirestoreDataReturnType } from '@hooks/useResourceFirestoreData';
import type { DailyDiscSet } from '@types';
import { Button, Popconfirm } from 'antd';

type RemoveItemFlowProps = {
  disc: DailyDiscSet;
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyDiscSet>['addEntryToUpdate'];
  itemId: string;
};

export function RemoveItemFlow({ disc, addEntryToUpdate, itemId }: RemoveItemFlowProps) {
  const onRemove = () => {
    addEntryToUpdate(disc.id, {
      ...disc,
      itemsIds: disc.itemsIds.filter((id) => id !== itemId),
    });
  };

  return (
    <Popconfirm
      cancelText="No"
      okText="Yes"
      onConfirm={onRemove}
      title="Are you sure you want to remove this item?"
    >
      <Button
        icon={<DeleteFilled />}
        size="small"
        type="text"
      />
    </Popconfirm>
  );
}
