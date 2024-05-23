import { Card, Flex, Form, Input, Select, Space, Switch, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useItemsContext } from 'context/ItemsContext';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useItemUpdate } from 'hooks/useItemUpdate';
import { memoize } from 'lodash';
import { Item as ItemT } from 'types';

import { EditOutlined, FireFilled, RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import { useQueryParams } from 'hooks/useQueryParams';

type ItemCardProps = {
  item: ItemT;
  editMode?: boolean;
};

export function ItemCard({ item, editMode = false }: ItemCardProps) {
  const { categories } = useItemsContext();
  const { isEditing, toggleEditMode, onEdit, isDirty, onModify, onReset, editableItem } = useItemUpdate(
    item,
    editMode
  );
  const copyToClipboard = useCopyToClipboardFunction();
  const { is } = useQueryParams();

  return (
    <Card
      title={<Typography.Text onClick={() => copyToClipboard(item.id)}>{item.id}</Typography.Text>}
      style={{ maxWidth: 250 }}
      actions={
        isDirty
          ? [
              <RollbackOutlined key="reset" onClick={onReset} />,
              <SaveOutlined key="save" onClick={onModify} />,
            ]
          : [<EditOutlined key="edit" onClick={toggleEditMode} />]
      }
    >
      <Item id={item.id} width={125} title={`${item.name.en} | ${item.name.pt}`} />
      <Space size="small" direction="vertical" className="my-4">
        <Input
          prefix={<LanguageFlag language="en" width="1em" />}
          placeholder="Name in EN"
          variant={isEditing ? 'outlined' : 'borderless'}
          size="small"
          defaultValue={item.name.en}
          readOnly={!isEditing}
          key={`en-${item.name.en}`}
          onChange={(e) => onEdit({ name: { ...editableItem.name, en: e.target.value } })}
        />
        <Input
          prefix={<LanguageFlag language="pt" width="1em" />}
          placeholder="Name in PT"
          variant={isEditing ? 'outlined' : 'borderless'}
          size="small"
          defaultValue={item.name.pt}
          readOnly={!isEditing}
          key={`pt-${item.name.pt}`}
          onChange={(e) => onEdit({ name: { ...editableItem.name, pt: e.target.value } })}
        />
        <div>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Select a category"
            defaultValue={item.categories}
            disabled={!isEditing}
            options={categories}
            variant={isEditing ? 'outlined' : 'borderless'}
            size="small"
            key={String(item.categories)}
            onChange={(value) => onEdit({ categories: value.sort() })}
          />
        </div>
        {is('showVerifyThing') && (
          <div>
            <VerifyIfThing item={item} />
          </div>
        )}
        {(isEditing || item.nsfw) && (
          <div>
            <Form.Item label="nsfw" valuePropName="checked">
              <Switch
                checked={item.nsfw}
                onChange={(checked) => onEdit({ nsfw: checked })}
                size="small"
                checkedChildren={<FireFilled style={{ color: 'hotpink' }} />}
                disabled={!isEditing}
              />
            </Form.Item>
          </div>
        )}
      </Space>
    </Card>
  );
}

type VerifyIfThingProps = {
  item: ItemT;
};

const verifyIfThingCheck = memoize((item: ItemT) => {
  const hasThing = !!item.categories?.includes('thing');
  const hasMesmice = !!item.categories?.includes('mesmice');
  const singleWordNameEn = item.name.en.split(' ').length === 1;
  const singleWordNamePt = item.name.pt.split(' ').length === 1;

  const result = {
    en: hasThing || (singleWordNameEn && hasMesmice),
    pt: hasThing || (singleWordNamePt && hasMesmice),
  };

  if (!result.pt && !result.en) return '';

  return (
    <>
      {result.en && <LanguageFlag language="en" width="1em" />}
      {result.pt && <LanguageFlag language="pt" width="1em" />}
    </>
  );
});

const VerifyIfThing = ({ item }: VerifyIfThingProps) => {
  const result = verifyIfThingCheck(item);

  if (result) {
    return <Flex gap={6}>Thing: {result}</Flex>;
  }

  return <></>;
};
