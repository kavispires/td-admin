import { Button, Divider } from 'antd';
import { FilterSwitch } from 'components/Common';
import { SiderContent } from 'components/Layout';
import { useItemsContext } from 'context/ItemsContext';

type ItemListingFiltersProps = {
  showSearch: boolean;
  toggleSearch: () => void;
};
export function ItemListingFilters({ showSearch, toggleSearch }: ItemListingFiltersProps) {
  const { isDirty, save } = useItemsContext();
  return (
    <SiderContent>
      <Button block danger type="primary" disabled={!isDirty} onClick={save}>
        Save
      </Button>
      <Divider />
      <FilterSwitch label="Show Search" value={showSearch} onChange={toggleSearch} />
    </SiderContent>
  );
}
