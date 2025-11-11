import { Button, Modal } from 'antd';
import { useItemsContext } from 'context/ItemsContext';
import { cloneDeep } from 'lodash';
import { useState } from 'react';
import { ItemCard } from './ItemCard';

const PLACEHOLDER_ITEM = {
  id: '',
  name: {
    en: '',
    pt: '',
  },
  groups: [],
};

type NewItemModalProps = {
  isModalOpen: boolean;
  handleCancel: () => void;
  newId: string;
};

function NewItemModal({ isModalOpen, handleCancel, newId }: NewItemModalProps) {
  const [newItem] = useState(cloneDeep({ ...PLACEHOLDER_ITEM, id: newId }));
  return (
    <Modal footer={null} maskClosable={false} onCancel={handleCancel} open={isModalOpen} title="Add new item">
      <ItemCard editMode item={newItem} />
    </Modal>
  );
}

export function AddNewItem() {
  const [isModalOpen, setOpenModal] = useState(false);

  const { newId } = useItemsContext();

  const showModal = () => {
    setOpenModal(true);
  };

  const handleCancel = () => {
    setOpenModal(false);
  };

  return (
    <>
      <Button block onClick={showModal}>
        Add New Item
      </Button>
      {isModalOpen && (
        <NewItemModal handleCancel={handleCancel} isModalOpen={isModalOpen} key={newId} newId={newId} />
      )}
    </>
  );
}
