import { FilterNumber, FilterSelect } from 'components/Common';
import { SiderContent } from 'components/Layout';

type SuspectsFiltersProps = {
  selectedVersion: string;
  setSelectedVersion: (deck: string) => void;
  cardsPerRow: number;
  setCardsPerRow: (cardsPerRow: number) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
};

const VERSIONS = [
  { value: 'ct', label: 'Cartoon' },
  { value: 'ai', label: 'AI' },
  { value: 'md', label: 'Models' },
  { value: 'wc', label: 'Wacky' },
  { value: 'original', label: 'Original' },
];

const SORT_BY = [
  { value: 'id', label: 'Id' },
  { value: 'name.pt', label: 'Name (PT)' },
  { value: 'name.en', label: 'Name (EN)' },
  { value: 'ethnicity', label: 'Ethnicity' },
  { value: 'gender', label: 'Gender' },
];

export function SuspectsFilters({
  selectedVersion,
  setSelectedVersion,
  cardsPerRow,
  setCardsPerRow,
  sortBy,
  setSortBy,
}: SuspectsFiltersProps) {
  return (
    <SiderContent>
      <FilterSelect
        label="Version"
        value={selectedVersion}
        onChange={setSelectedVersion}
        options={VERSIONS}
      />
      <FilterNumber label="Cards Per Row" value={cardsPerRow} onChange={setCardsPerRow} min={1} max={8} />
      <FilterSelect label="Sort By" value={sortBy} onChange={setSortBy} options={SORT_BY} />
    </SiderContent>
  );
}
