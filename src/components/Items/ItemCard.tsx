import { Card, Input, Select, Space } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { Item as ItemT } from 'types';

import { EditOutlined, RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import { useItemsContext } from 'context/ItemsContext';
import { useItemUpdate } from 'hooks/useItemUpdate';

type ItemCardProps = {
  item: ItemT;
  editMode?: boolean;
};

export function ItemCard({ item, editMode = false }: ItemCardProps) {
  const { groups } = useItemsContext();
  const { isEditing, toggleEditMode, onEdit, isDirty, onModify, onReset } = useItemUpdate(item);

  return (
    <Card
      title={item.id}
      style={{ maxWidth: 300 }}
      actions={
        isDirty
          ? [
              <RollbackOutlined key="reset" onClick={onReset} />,
              <SaveOutlined key="save" onClick={onModify} />,
            ]
          : [<EditOutlined key="edit" onClick={toggleEditMode} />]
      }
    >
      <Item id={item.id} width={150} title={`${item.name.en} | ${item.name.pt}`} />
      <Space size="small" direction="vertical" className="my-4">
        <Input
          prefix={<LanguageFlag language="en" width="1em" />}
          placeholder="Name in EN"
          variant={isEditing ? 'outlined' : 'borderless'}
          size="small"
          defaultValue={item.name.en}
          readOnly={!isEditing}
          key={`en-${item.name.en}`}
          onChange={(e) => onEdit({ name: { ...item.name, en: e.target.value } })}
        />

        <Input
          prefix={<LanguageFlag language="pt" width="1em" />}
          placeholder="Name in PT"
          variant={isEditing ? 'outlined' : 'borderless'}
          size="small"
          defaultValue={item.name.pt}
          readOnly={!isEditing}
          key={`pt-${item.name.pt}`}
          onChange={(e) => onEdit({ name: { ...item.name, pt: e.target.value } })}
        />

        <div>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select groups"
            defaultValue={item.groups}
            disabled={!isEditing}
            options={groups}
            variant={isEditing ? 'outlined' : 'borderless'}
            size="small"
            key={String(item.groups)}
            onChange={(value) => onEdit({ groups: value })}
          />
        </div>
      </Space>
    </Card>
  );
}
