import { Button, Divider, Flex } from 'antd';
import { FilterSelect, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useItemsContext } from 'context/ItemsContext';
import { capitalize, orderBy } from 'lodash';
import { useMemo } from 'react';

type ItemListingFiltersProps = {
  showSearch: boolean;
  toggleSearch: () => void;
};
export function ItemListingFilters({ showSearch, toggleSearch }: ItemListingFiltersProps) {
  const { isDirty, save, items, listingType, setListingType, groups } = useItemsContext();

  const groupOptions = useMemo(() => {
    const includingOptions = orderBy(
      groups.map(({ value }) => ({ label: capitalize(value), value })),
      'label'
    );
    const excludingOptions = includingOptions.map(({ label, value }) => ({
      label: `NOT ${label}`,
      value: `!${value}`,
    }));
    return [...includingOptions, ...excludingOptions];
  }, [groups]);
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

      <FilterSelect
        label="Group"
        value={listingType}
        onChange={(value) => setListingType(value)}
        options={[{ label: 'All', value: 'all' }, { label: 'NSFW', value: 'nswf' }, ...groupOptions]}
      />
    </SiderContent>
  );
}
