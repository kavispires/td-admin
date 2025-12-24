import { MenuOutlined } from '@ant-design/icons';
import { Button, Popover, Space } from 'antd';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { snakeCase } from 'lodash';
import { useToggle } from 'react-use';
import type { Item as ItemT } from 'types';

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

type ItemPopoverOptionsProps = {
  item: ItemT;
};

export function ItemPopoverOptions({ item }: ItemPopoverOptionsProps) {
  const [open, toggleOpen] = useToggle(false);
  const copyToClipboard = useCopyToClipboardFunction();
  return (
    <Popover
      content={
        <Space orientation="vertical">
          <Button onClick={() => copyToClipboard(JSON.stringify(item, null, 2))} size="small">
            Complete Item
          </Button>
          <Button onClick={() => copyToClipboard(item.name.en)} size="small">
            EN Name
          </Button>
          <Button onClick={() => copyToClipboard(item.name.pt)} size="small">
            PT Name
          </Button>
          <Button
            onClick={() => copyToClipboard(JSON.stringify(buildEscapeRoomItemCard(item), null, 2))}
            size="small"
          >
            Escape Room Item
          </Button>
        </Space>
      }
      onOpenChange={toggleOpen}
      open={open}
      title="Copy"
      trigger="click"
    >
      <Button icon={<MenuOutlined />} type="text" />
    </Popover>
  );
}
