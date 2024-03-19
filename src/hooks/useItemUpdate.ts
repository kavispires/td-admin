import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { Item as ItemT } from 'types';
import { useItemsContext } from 'context/ItemsContext';

export function useItemUpdate(currentItem: ItemT) {
  const { addItemToUpdate, itemsToUpdate } = useItemsContext();
  const [isEditing, setEditing] = useState(false);
  const [editableItem, setEditableItem] = useState<ItemT>(cloneDeep(currentItem));
  const originalItem = itemsToUpdate[currentItem.id] ?? currentItem;

  const onEdit = (value: Partial<ItemT>) => {
    setEditableItem({ ...editableItem, ...value });
  };

  const onModify = async () => {
    addItemToUpdate(editableItem.id, editableItem);
  };

  const onReset = () => {
    setEditableItem(cloneDeep(currentItem));
    setEditing(false);
  };

  const isDirty = JSON.stringify(originalItem) !== JSON.stringify(editableItem);

  return {
    isEditing,
    toggleEditMode: () => setEditing((e) => !e),
    onEdit,
    isDirty,
    onModify,
    onReset,
  };
}
