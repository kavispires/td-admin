import { Button, Card, Flex, Form, Input, Popover, Select, Space, Switch, Typography } from 'antd';
import { LanguageFlag } from 'components/Common/LanguageFlag';
import { Item } from 'components/Sprites';
import { useItemsContext } from 'context/ItemsContext';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useItemUpdate } from 'hooks/useItemUpdate';
import { memoize, snakeCase } from 'lodash';
import type { Item as ItemT } from 'types';

import { EditOutlined, FireFilled, MenuOutlined, RollbackOutlined, SaveOutlined } from '@ant-design/icons';
import { useQueryParams } from 'hooks/useQueryParams';
import { useToggle } from 'react-use';

type ItemCardProps = {
  item: ItemT;
  editMode?: boolean;
  simplified?: boolean;
};

export function ItemCard({ item, editMode = false, simplified }: ItemCardProps) {
  const { decks } = useItemsContext();
  const { isEditing, toggleEditMode, onEdit, isDirty, onModify, onReset, editableItem } = useItemUpdate(
    item,
    editMode,
  );
  const copyToClipboard = useCopyToClipboardFunction();
  const { is } = useQueryParams();

  return (
    <Card
      title={<Typography.Text onClick={() => copyToClipboard(item.id)}>{item.id}</Typography.Text>}
      extra={<ItemPopoverOptions item={item} />}
      style={{ maxWidth: 250 }}
      size={simplified ? 'small' : 'default'}
      actions={
        simplified
          ? undefined
          : isDirty
            ? [
                <RollbackOutlined key="reset" onClick={onReset} />,
                <SaveOutlined key="save" onClick={onModify} />,
              ]
            : [<EditOutlined key="edit" onClick={toggleEditMode} />]
      }
    >
      <Item id={item.id} width={simplified ? 75 : 125} title={`${item.name.en} | ${item.name.pt}`} />
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
        {!simplified && (
          <>
            {!is('simplified') && (
              <>
                <div>
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
                </div>

                <Flex gap={6}>
                  <LanguageFlag language="en" width="1em" />
                  <Select
                    mode="tags"
                    style={{ width: '100%' }}
                    placeholder="Other names EN"
                    defaultValue={item.aliasesEn}
                    options={[]}
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
                    size="small"
                    onChange={(aliasesPt) => onEdit({ aliasesPt: aliasesPt.sort() })}
                  />
                </Flex>
              </>
            )}

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

type VerifyIfThingProps = {
  item: ItemT;
};

const verifyIfThingCheck = memoize((item: ItemT) => {
  const hasThing = !!item.decks?.includes('thing');
  const hasManufactured = !!item.decks?.includes('manufactured');
  const singleWordNameEn = item.name.en.split(' ').length === 1;
  const singleWordNamePt = item.name.pt.split(' ').length === 1;

  const result = {
    en: hasThing || (singleWordNameEn && hasManufactured),
    pt: hasThing || (singleWordNamePt && hasManufactured),
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

export type EscapeRoomItemCard = {
  /**
   * The unique identifier of the card.
   * Usually used to verify the end game played cards condition.
   */
  id: string;
  /**
   * The type of the card.
   */
  type: 'item';
  /**
   * The header of the card
   */
  header: {
    /**
     * The title of the header in both languages.
     */
    title: DualLanguageValue;
    /**
     * Illustrative small icon in the header.
     */
    iconId?: string;
  };
  /**
   * The metadata of the card.
   */
  metadata?: {
    /**
     * The level of the card to determine the difficulty.
     */
    level: 'basic';
    /**
     * When played, adds this keyword to the result.
     */
    keyword?: string;
  };
  content: {
    /**
     * The item id for the Item Sprite
     */
    itemId: string;
    /**
     * Descriptive text of the item, usually its name
     */
    caption?: DualLanguageValue;
  };
};

const buildEscapeRoomItemCard = (item: ItemT): EscapeRoomItemCard => ({
  id: item.id,
  type: 'item',
  header: {
    title: {
      en: 'Item',
      pt: 'Item',
    },
    iconId: '2077',
  },
  metadata: {
    level: 'basic',
    keyword: snakeCase(item.name.en).toUpperCase(),
  },
  content: {
    itemId: item.id,
    caption: item.name,
  },
});

export function ItemPopoverOptions({ item }: Pick<ItemCardProps, 'item'>) {
  const [open, toggleOpen] = useToggle(false);
  const copyToClipboard = useCopyToClipboardFunction();
  return (
    <Popover
      content={
        <Space direction="vertical">
          <Button size="small" onClick={() => copyToClipboard(JSON.stringify(item, null, 2))}>
            Complete Item
          </Button>
          <Button size="small" onClick={() => copyToClipboard(item.name.en)}>
            EN Name
          </Button>
          <Button size="small" onClick={() => copyToClipboard(item.name.pt)}>
            PT Name
          </Button>
          <Button
            size="small"
            onClick={() => copyToClipboard(JSON.stringify(buildEscapeRoomItemCard(item), null, 2))}
          >
            Escape Room Item
          </Button>
        </Space>
      }
      title="Copy"
      trigger="click"
      open={open}
      onOpenChange={toggleOpen}
    >
      <Button type="text" icon={<MenuOutlined />} />
    </Popover>
  );
}
