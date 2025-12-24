import { EditOutlined } from '@ant-design/icons';
import { Button, type ButtonProps, Modal, Space } from 'antd';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { cloneDeep } from 'lodash';
import { useToggle } from 'react-use';
import type { CrimesHediondosCard } from 'types';
import { CrimeItemCard } from './CrimeItemCard';
import type { CrimesHediondosInnerContentProps } from './CrimesHediondosContent';

type EditCrimeCardModalProps = {
  onUpdateCard: CrimesHediondosInnerContentProps['onUpdateCard'];
  card: CrimesHediondosCard;
  buttonProps?: Omit<ButtonProps, 'onClick'>;
};

export function EditCrimeCardModal({ onUpdateCard, card, buttonProps }: EditCrimeCardModalProps) {
  const [open, toggleOpen] = useToggle(false);

  const editName = (name: string, language: 'pt' | 'en', card: CrimesHediondosCard) => {
    const copy = cloneDeep(card);
    copy.name[language] = name;
    onUpdateCard(copy);
  };
  console.log('EditCrimeCardModal', card);

  return (
    <div>
      <Button
        {...buttonProps}
        icon={<EditOutlined />}
        onClick={toggleOpen}
        size="small"
        style={{ minWidth: 100 }}
      >
        Edit
      </Button>
      <Modal
        onCancel={toggleOpen}
        onOk={() => toggleOpen(false)}
        open={open}
        title={`Editing ${card.id} (${card.name.en})`}
        width={1000}
      >
        {open && (
          <Space>
            <Space orientation="vertical" style={{ minWidth: 150 }}>
              <CrimeItemCard cardWidth={100} item={card} />
              <DualLanguageTextField
                language="en"
                onPressEnter={(e: any) => editName(e.target?.value || card.name.en, 'en', card)}
                value={card.name}
              />
              <DualLanguageTextField
                language="pt"
                onPressEnter={(e: any) => editName(e.target?.value || card.name.pt, 'pt', card)}
                value={card.name}
              />
            </Space>
          </Space>
        )}
      </Modal>
    </div>
  );
}
