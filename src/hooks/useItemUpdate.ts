import { useItemsContext } from '@context/ItemsContext';
import type { ItemData as ItemT } from '@types';
import { cloneDeep } from 'lodash';
import { useState } from 'react';

export function useItemUpdate(currentItem: ItemT, editMode = false) {
  const { addItemToUpdate, itemsToUpdate } = useItemsContext();
  const [isEditing, setEditing] = useState(editMode);
  const [editableItem, setEditableItem] = useState<ItemT>(cloneDeep(currentItem));
  const originalItem = itemsToUpdate[currentItem.id] ?? currentItem;

  const onEdit = (change: Partial<ItemT>) => {
    const newItem = { ...cloneDeep(editableItem), ...change };
    if (Object.keys(change).includes('nsfw') && change.nsfw === false) {
      newItem.nsfw = undefined;
    }
    setEditableItem(newItem);
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
    editableItem,
    onEdit,
    isDirty,
    onModify,
    onReset,
  };
}
