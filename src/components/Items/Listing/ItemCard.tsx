import { EditOutlined, FireFilled, RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import { Card, Flex, Form, Input, Select, Space, Switch, Typography } from 'antd';
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
      title={<Typography.Text onClick={() => copyToClipboard(item.id)}>{item.id}</Typography.Text>}
      extra={<ItemPopoverOptions item={item} />}
      style={{ maxWidth: 250 }}
      size={isSimplified ? 'small' : 'default'}
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
    >
      <Item id={item.id} width={isSimplified ? 75 : 125} title={`${item.name.en} | ${item.name.pt}`} />
      <Space size="small" direction="vertical" className={isSimplified ? 'my-2' : 'my-4'}>
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
        {!isSimplified && (
          <>
            <>
              {!is('hideDecks') && (
                <div>
                  {is('deckCheckboxes') ? (
                    <ItemDeckCheckboxes item={item} isEditing={isEditing} onEdit={onEdit} decks={decks} />
                  ) : (
                    <Select
                      mode="multiple"
                      style={{ width: '100%' }}
                      placeholder="Select a deck"
                      defaultValue={item.decks}
                      disabled={!isEditing}
                      options={decks}
                      variant={isEditing ? 'outlined' : 'borderless'}
                      size="small"
                      key={String(item.decks)}
                      onChange={(value) => onEdit({ decks: value.sort() })}
                    />
                  )}
                </div>
              )}

              {!is('hideAliases') && (
                <>
                  <Flex gap={6}>
                    <LanguageFlag language="en" width="1em" />
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder="Other names EN"
                      defaultValue={item.aliasesEn}
                      options={[]}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'borderless'}
                      size="small"
                      onChange={(aliasesEn) => onEdit({ aliasesEn: aliasesEn.sort() })}
                    />
                  </Flex>

                  <Flex gap={6}>
                    <LanguageFlag language="pt" width="1em" />
                    <Select
                      mode="tags"
                      style={{ width: '100%' }}
                      placeholder="Other names PT"
                      defaultValue={item.aliasesPt}
                      options={[]}
                      disabled={!isEditing}
                      variant={isEditing ? 'outlined' : 'borderless'}
                      size="small"
                      onChange={(aliasesPt) => onEdit({ aliasesPt: aliasesPt.sort() })}
                    />
                  </Flex>
                </>
              )}
            </>

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
          </>
        )}
      </Space>
    </Card>
  );
}
