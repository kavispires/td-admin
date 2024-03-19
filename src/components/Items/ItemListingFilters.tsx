import { FilterSwitch } from 'components/Common';
import { SiderContent } from 'components/Layout';

type ItemListingFiltersProps = {
  showSearch: boolean;
  toggleSearch: () => void;
};
export function ItemListingFilters({ showSearch, toggleSearch }: ItemListingFiltersProps) {
  return (
    <SiderContent>
      <FilterSwitch label="Show Search" value={showSearch} onChange={toggleSearch} />
    </SiderContent>
  );
}
