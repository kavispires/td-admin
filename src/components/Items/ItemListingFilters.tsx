import { Button, Divider, Flex } from 'antd';
import { FilterSelect, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useItemsContext } from 'context/ItemsContext';
import { capitalize, orderBy } from 'lodash';
import { useMemo } from 'react';
import { AddNewItem } from './AddNewItem';
import { Item } from 'types';

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
        <DownloadButton
          data={() => prepareFileForDownload(items)}
          fileName="items.json"
          disabled={isDirty}
          block
        />
      </Flex>
      <Divider />

      <FilterSwitch label="Show Search" value={showSearch} onChange={toggleSearch} />

      <FilterSelect
        label="Group"
        value={listingType}
        onChange={(value) => setListingType(value)}
        options={[
          { label: 'All', value: 'all' },
          { label: 'NSFW', value: 'nswf' },
          { label: 'SFW', value: '!nswf' },
          ...groupOptions,
          { label: 'No groups', value: '!all' },
        ]}
      />

      <Divider />

      <AddNewItem />
    </SiderContent>
  );
}

function prepareFileForDownload(items: Dictionary<Item>) {
  return Object.values(items).reduce((acc: Dictionary<Item>, item) => {
    item.groups = (item?.groups ?? []).sort();

    if (item.groups.length === 0) {
      delete item.groups;

      acc[item.id] = item;
      return acc;
    }

    if (
      item.groups.includes('thing') &&
      item.name.en.split(' ').length === 1 &&
      item.name.pt.split(' ').length === 1
    ) {
      if (
        item.groups.includes('evidence') ||
        item.groups.includes('dream') ||
        item.groups.includes('alien') ||
        item.groups.includes('mesmice')
      ) {
        item.groups = item.groups.filter((group) => group !== 'thing');
      }

      acc[item.id] = item;
    }

    acc[item.id] = item;

    return acc;
  }, {});

  // Remove thing from groups if both names are single word and evidence, dream, alien, or mesmice are in the groups

  // Sort groups
}
