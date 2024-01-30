import { Divider, Form, InputNumber, Select } from 'antd';
import { useMemo } from 'react';

type ImageCardsFiltersProps = {
  decksData: NumberDictionary;
  selectedDeck: string;
  setSelectedDeck: (deck: string) => void;
  cardsPerRow: number;
  setCardsPerRow: (cardsPerRow: number) => void;
};

export function ImageCardsFilters({
  decksData,
  selectedDeck,
  setSelectedDeck,
  cardsPerRow,
  setCardsPerRow,
}: ImageCardsFiltersProps) {
  const deckOptions = useMemo(() => {
    return Object.keys(decksData)
      .filter((deck) => deck.startsWith('td-'))
      .map((deck) => deck.replace('td-', ''));
  }, [decksData]);
  return (
    <div className="sider-content">
      <Form.Item label="Deck">
        <Select style={{ minWidth: '150px' }} onChange={setSelectedDeck} value={selectedDeck}>
          {deckOptions.map((deck) => (
            <Select.Option key={deck} value={deck}>
              {deck}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="Cards Per Row">
        <InputNumber
          min={1}
          max={8}
          value={cardsPerRow}
          onChange={(v) => setCardsPerRow(v ?? 8)}
          style={{ minWidth: '150px' }}
        />
      </Form.Item>
      <Divider />
    </div>
  );
}
