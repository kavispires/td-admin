import { Checkbox, Form } from 'antd';
import { truncate } from 'lodash';
import type { Item as ItemT } from 'types';

type ItemDeckCheckboxesProps = {
  item: ItemT;
  isEditing?: boolean;
  onEdit: (data: Partial<ItemT>) => void;
  decks: {
    value: string;
  }[];
};

export function ItemDeckCheckboxes({ item, isEditing, onEdit, decks }: ItemDeckCheckboxesProps) {
  return (
    <div style={{ display: 'grid', gap: 4, gridTemplateColumns: 'repeat(2, 1fr)' }}>
      {decks.map((deck) => {
        const itemDecks = item.decks ?? [];
        const isChecked = itemDecks.includes(deck.value);
        return (
          <Form.Item key={deck.value} style={{ margin: 0, minHeight: 1 }}>
            <Checkbox
              checked={isChecked}
              disabled={!isEditing}
              onChange={(e) => {
                const checked = e.target.checked;
                const newDecks = checked
                  ? [...itemDecks, deck.value]
                  : itemDecks.filter((d) => d !== deck.value);
                console.log('onChange', e.target.checked, deck.value, newDecks);
                onEdit({ decks: newDecks });
              }}
              style={{ minHeight: 1 }}
            />

            <span> {truncate(deck.value, { length: 10 })}</span>
          </Form.Item>
        );
      })}
    </div>
  );
}
