import { Button, Divider, Flex } from 'antd';
import { FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useItemsContext } from 'context/ItemsContext';

type ItemListingFiltersProps = {
  showSearch: boolean;
  toggleSearch: () => void;
};
export function ItemListingFilters({ showSearch, toggleSearch }: ItemListingFiltersProps) {
  const { isDirty, save, items } = useItemsContext();
  return (
    <SiderContent>
      <Flex vertical gap={6}>
        <Button block danger type="primary" disabled={!isDirty} onClick={save} size="large">
          Save
        </Button>
        <DownloadButton data={items} fileName="items.json" disabled={isDirty} block />
      </Flex>
      <Divider />

      <FilterSwitch label="Show Search" value={showSearch} onChange={toggleSearch} />
    </SiderContent>
  );
}
