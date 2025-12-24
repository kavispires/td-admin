import { EditOutlined, FireFilled, RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import { Card, Checkbox, Flex, Form, Input, Select, Space, Switch, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useItemsContext } from 'context/ItemsContext';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useItemUpdate } from 'hooks/useItemUpdate';
import { useQueryParams } from 'hooks/useQueryParams';
import type { Item as ItemT } from 'types';
import { ItemDeckCheckboxes } from './ItemCard/ItemDecksCheckboxes';
import { ItemPopoverOptions } from './ItemCard/ItemPopoverOptions';
import { VerifyIfThing } from './ItemCard/VerifyIfThing';

type ItemCardProps = {
  item: ItemT;
  editMode?: boolean;
  simplified?: boolean;
};

export function ItemCard({ item, editMode = false, simplified: simplifiedProp }: ItemCardProps) {
  const { decks } = useItemsContext();
  const { isEditing, toggleEditMode, onEdit, isDirty, onModify, onReset, editableItem } = useItemUpdate(
    item,
    editMode,
  );
  const copyToClipboard = useCopyToClipboardFunction();
  const { is } = useQueryParams();
  const isSimplified = simplifiedProp || is('simplified');

  return (
    <Card
      actions={
        isSimplified
          ? undefined
          : isDirty
            ? [
                <RollbackOutlined key="reset" onClick={onReset} />,
                <SaveOutlined key="save" onClick={onModify} />,
              ]
            : [<EditOutlined key="edit" onClick={toggleEditMode} />]
      }
      extra={<ItemPopoverOptions item={item} />}
      size={isSimplified ? 'small' : 'default'}
      style={{ maxWidth: 250 }}
      title={<Typography.Text onClick={() => copyToClipboard(item.id)}>{item.id}</Typography.Text>}
    >
      <Item itemId={item.id} title={`${item.name.en} | ${item.name.pt}`} width={isSimplified ? 75 : 125} />
      <Space className={isSimplified ? 'my-2' : 'my-4'} orientation="vertical" size="small">
        <Input
          defaultValue={item.name.en}
          key={`en-${item.name.en}`}
          onChange={(e) => onEdit({ name: { ...editableItem.name, en: e.target.value } })}
          placeholder="Name in EN"
          prefix={<LanguageFlag language="en" width="1em" />}
          readOnly={!isEditing}
          size="small"
          variant={isEditing ? 'outlined' : 'borderless'}
        />
        <Input
          defaultValue={item.name.pt}
          key={`pt-${item.name.pt}`}
          onChange={(e) => onEdit({ name: { ...editableItem.name, pt: e.target.value } })}
          placeholder="Name in PT"
          prefix={<LanguageFlag language="pt" width="1em" />}
          readOnly={!isEditing}
          size="small"
          variant={isEditing ? 'outlined' : 'borderless'}
        />
        {!isSimplified && (
          <>
            {!is('hideDecks') && (
              <div>
                {is('deckCheckboxes') ? (
                  <ItemDeckCheckboxes decks={decks} isEditing={isEditing} item={item} onEdit={onEdit} />
                ) : (
                  <Select
                    defaultValue={item.decks}
                    disabled={!isEditing}
                    key={String(item.decks)}
                    mode="multiple"
                    onChange={(value) => onEdit({ decks: value.sort() })}
                    options={decks}
                    placeholder="Select a deck"
                    size="small"
                    style={{ width: '100%' }}
                    variant={isEditing ? 'outlined' : 'borderless'}
                  />
                )}
              </div>
            )}

            {!is('hideAliases') && (
              <>
                <Flex gap={6}>
                  <LanguageFlag language="en" width="1em" />
                  <Select
                    defaultValue={item.aliasesEn}
                    disabled={!isEditing}
                    mode="tags"
                    onChange={(aliasesEn) => onEdit({ aliasesEn: aliasesEn.sort() })}
                    options={[]}
                    placeholder="Other names EN"
                    size="small"
                    style={{ width: '100%' }}
                    variant={isEditing ? 'outlined' : 'borderless'}
                  />
                </Flex>

                <Flex gap={6}>
                  <LanguageFlag language="pt" width="1em" />
                  <Select
                    defaultValue={item.aliasesPt}
                    disabled={!isEditing}
                    mode="tags"
                    onChange={(aliasesPt) => onEdit({ aliasesPt: aliasesPt.sort() })}
                    options={[]}
                    placeholder="Other names PT"
                    size="small"
                    style={{ width: '100%' }}
                    variant={isEditing ? 'outlined' : 'borderless'}
                  />
                </Flex>
              </>
            )}

            <AgeDecks item={item} onEdit={onEdit} />

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
                    checkedChildren={<FireFilled style={{ color: 'hotpink' }} />}
                    disabled={!isEditing}
                    onChange={(checked) => onEdit({ nsfw: checked })}
                    size="small"
                  />
                </Form.Item>
              </div>
            )}
          </>
        )}
      </Space>
    </Card>
  );
}

type AgeDecksProps = {
  item: ItemT;
  onEdit: (change: Partial<ItemT>) => void;
};

function AgeDecks({ item, onEdit }: AgeDecksProps) {
  const itemDecks = item.decks || [];

  const handleCheckboxChange = async (age: string) => {
    const updatedDecks = itemDecks.includes(age)
      ? itemDecks.filter((deck) => deck !== age)
      : [...itemDecks, age];
    onEdit({ decks: updatedDecks });
  };

  return (
    <div>
      <Typography.Text strong>Ages</Typography.Text>
      <Flex gap={6}>
        <Checkbox checked={itemDecks.includes('age1')} onChange={() => handleCheckboxChange('age1')} />1
        <Checkbox checked={itemDecks.includes('age2')} onChange={() => handleCheckboxChange('age2')} />2
        <Checkbox checked={itemDecks.includes('age3')} onChange={() => handleCheckboxChange('age3')} />3
        <Checkbox checked={itemDecks.includes('age4')} onChange={() => handleCheckboxChange('age4')} />4
        <Checkbox checked={itemDecks.includes('age5')} onChange={() => handleCheckboxChange('age5')} />5
      </Flex>
    </div>
  );
}
