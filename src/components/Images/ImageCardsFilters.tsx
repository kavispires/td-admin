import { Form } from 'antd';
import { FilterNumber, FilterSelect, FilterSwitch } from 'components/Common';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
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
  const { addParam, is } = useQueryParams();
  const deckOptions = useMemo(() => {
    return Object.keys(decksData)
      .filter((deck) => deck.startsWith('td-'))
      .map((deck) => deck.replace('td-', ''));
  }, [decksData]);
  return (
    <SiderContent>
      <Form layout="vertical">
        <FilterSelect label="Deck" onChange={setSelectedDeck} options={deckOptions} value={selectedDeck} />
        <FilterNumber
          label="Cards Per Row"
          max={8}
          min={1}
          onChange={(v) => setCardsPerRow(v ?? 8)}
          value={cardsPerRow}
        />
        <FilterSwitch
          label="Show Image IDs"
          onChange={(checked) => addParam('showImageIds', checked)}
          value={is('showImageIds')}
        />
      </Form>
    </SiderContent>
  );
}
