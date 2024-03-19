import { Card, Input, Select, Space } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useItems } from 'hooks/useItems';
import { useState } from 'react';
import { Item as ItemT } from 'types';

import { EditOutlined } from '@ant-design/icons';

type ItemCardProps = {
  item: ItemT;
  editMode?: boolean;
};

export function ItemCard({ item, editMode = false }: ItemCardProps) {
  const { groups } = useItems();
  const [isEditing, setEditing] = useState(editMode);

  return (
    <Card
      title={item.id}
      style={{ maxWidth: 250 }}
      actions={[<EditOutlined key="edit" onClick={() => setEditing((e) => !e)} />]}
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
          key={item.name.en}
        />

        <Input
          prefix={<LanguageFlag language="pt" width="1em" />}
          placeholder="Name in PT"
          variant={isEditing ? 'outlined' : 'borderless'}
          size="small"
          defaultValue={item.name.pt}
          readOnly={!isEditing}
          key={item.name.pt}
        />

        <div>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Please select groups"
            defaultValue={item.groups}
            onChange={() => {}}
            disabled={!isEditing}
            options={groups}
            variant={isEditing ? 'outlined' : 'borderless'}
            size="small"
            key={String(item.groups)}
          />
        </div>
      </Space>
    </Card>
  );
}
