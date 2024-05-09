import { Button, Divider, Flex } from 'antd';
import { FilterSelect, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useItemsContext } from 'context/ItemsContext';
import { capitalize, orderBy } from 'lodash';
import { useMemo } from 'react';
import { AddNewItem } from './AddNewItem';
import { Item } from 'types';
import { sortJsonKeys } from 'utils';

type ItemListingFiltersProps = {
  showSearch: boolean;
  toggleSearch: () => void;
};
export function ItemListingFilters({ showSearch, toggleSearch }: ItemListingFiltersProps) {
  const { isDirty, save, items, listingType, setListingType, categories } = useItemsContext();

  const categoryOptions = useMemo(() => {
    const includingOptions = orderBy(
      categories.map(({ value }) => ({ label: capitalize(value), value })),
      'label'
    );
    const excludingOptions = includingOptions.map(({ label, value }) => ({
      label: `NOT ${label}`,
      value: `!${value}`,
    }));
    return [...includingOptions, ...excludingOptions];
  }, [categories]);
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
        label="Category"
        value={listingType}
        onChange={(value) => setListingType(value)}
        options={[
          { label: 'All', value: 'all' },
          { label: 'NSFW', value: 'nsfw' },
          { label: 'SFW', value: '!nsfw' },
          ...categoryOptions,
          { label: 'No categories', value: '!all' },
        ]}
      />

      <Divider />

      <AddNewItem />
    </SiderContent>
  );
}

function prepareFileForDownload(items: Dictionary<Item>) {
  return sortJsonKeys(
    Object.values(items).reduce((acc: Dictionary<Item>, item) => {
      // Sort categories
      item.categories = (item?.categories ?? []).sort();

      // Remove categories if no category is present
      if (item.categories.length === 0) {
        delete item.categories;

        acc[item.id] = item;
        return acc;
      }

      // Remove thing from category if either evidence, dream, alien, or mesmice is present and both pt and en names are single words
      if (
        item.categories.includes('thing') &&
        item.name.en.split(' ').length === 1 &&
        item.name.pt.split(' ').length === 1
      ) {
        if (
          item.categories.includes('evidence') ||
          item.categories.includes('dream') ||
          item.categories.includes('alien') ||
          item.categories.includes('mesmice')
        ) {
          item.categories = item.categories.filter((category) => category !== 'thing');
        }

        acc[item.id] = item;
      }

      acc[item.id] = item;

      return acc;
    }, {})
  );
}
