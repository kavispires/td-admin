import { FilterNumber, FilterSelect } from 'components/Common';
import { SiderContent } from 'components/Layout';
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
    <SiderContent>
      <FilterSelect label="Deck" onChange={setSelectedDeck} options={deckOptions} value={selectedDeck} />
      <FilterNumber
        label="Cards Per Row"
        max={8}
        min={1}
        onChange={(v) => setCardsPerRow(v ?? 8)}
        value={cardsPerRow}
      />
    </SiderContent>
  );
}
