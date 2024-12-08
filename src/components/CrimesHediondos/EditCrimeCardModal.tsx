import { Button, ButtonProps, Modal, Space } from 'antd';
import { CrimesHediondosInnerContentProps } from './CrimesHediondosContent';
import { CrimesHediondosCard } from 'types';

import { useToggle } from 'react-use';
import { CardEditTags } from './CardEditTags';
import { DualLanguageTextField } from 'components/Common/EditableFields';
import { cloneDeep } from 'lodash';
import { EditOutlined } from '@ant-design/icons';
import { CrimeItemCard } from './CrimeItemCard';

type EditCrimeCardModalProps = {
  allTags: CrimesHediondosInnerContentProps['allTags'];
  onUpdateCard: CrimesHediondosInnerContentProps['onUpdateCard'];
  card: CrimesHediondosCard;
  buttonProps?: Omit<ButtonProps, 'onClick'>;
};

export function EditCrimeCardModal({ allTags, onUpdateCard, card, buttonProps }: EditCrimeCardModalProps) {
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
        onClick={toggleOpen}
        size="small"
        icon={<EditOutlined />}
        style={{ minWidth: 100 }}
      >
        Edit
      </Button>
      <Modal
        title={`Editing ${card.id} (${card.name.en})`}
        open={open}
        onOk={() => toggleOpen(false)}
        onCancel={toggleOpen}
        width={1000}
      >
        {open && (
          <>
            <Space>
              <Space direction="vertical" style={{ minWidth: 150 }}>
                <CrimeItemCard item={card} cardWidth={100} />
                <DualLanguageTextField
                  value={card.name}
                  language="en"
                  onPressEnter={(e: any) => editName(e.target?.value || card.name.en, 'en', card)}
                />
                <DualLanguageTextField
                  value={card.name}
                  language="pt"
                  onPressEnter={(e: any) => editName(e.target?.value || card.name.pt, 'pt', card)}
                />
              </Space>

              <CardEditTags allTags={allTags} onUpdateCard={onUpdateCard} card={card} />
            </Space>
          </>
        )}
      </Modal>
    </div>
  );
}
