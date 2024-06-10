import { Divider, Flex } from 'antd';
import { FilterSelect, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { useItemsContext } from 'context/ItemsContext';
import { capitalize, orderBy } from 'lodash';
import { useMemo } from 'react';
import { AddNewItem } from './AddNewItem';
import { Item } from 'types';
import { sortJsonKeys } from 'utils';
import { useQueryParams } from 'hooks/useQueryParams';
import { SaveButton } from 'components/Common/SaveButton';

export function ItemListingFilters() {
  const { isDirty, save, items, decks, itemsToUpdate, isSaving } = useItemsContext();
  const { queryParams, is, addParam } = useQueryParams();

  const deckOptions = useMemo(() => {
    const includingOptions = orderBy(
      decks.map(({ value }) => ({ label: capitalize(value), value })),
      'label'
    );
    const excludingOptions = includingOptions.map(({ label, value }) => ({
      label: `NOT ${label}`,
      value: `!${value}`,
    }));
    return [...includingOptions, ...excludingOptions];
  }, [decks]);

  return (
    <SiderContent>
      <Flex vertical gap={6}>
        <SaveButton
          isDirty={isDirty}
          dirt={JSON.stringify(itemsToUpdate)}
          onSave={save}
          isSaving={isSaving}
        />

        <DownloadButton
          data={() => prepareFileForDownload(items)}
          fileName="items.json"
          disabled={isDirty}
          block
        />
      </Flex>
      <Divider />

      <FilterSwitch
        label="Show Search"
        value={!is('hideSearch')}
        onChange={(v) => addParam('hideSearch', v ? '' : 'true', '')}
      />

      <FilterSwitch
        label="Show Randomizer"
        value={is('showRandomizer')}
        onChange={(v) => addParam('showRandomizer', v ? 'true' : '', '')}
      />

      <FilterSwitch
        label="Verify Thing"
        value={is('showVerifyThing')}
        onChange={(v) => addParam('showVerifyThing', v ? 'true' : '')}
        className="full-width m-0"
      />

      <FilterSelect
        label="Deck"
        value={queryParams.get('deck') ?? 'all'}
        onChange={(value) => addParam('deck', value, 'all')}
        options={[
          { label: 'All', value: 'all' },
          { label: 'NSFW', value: 'nsfw' },
          { label: 'SFW', value: '!nsfw' },
          ...deckOptions,
          { label: 'No decks', value: '!all' },
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
      // Sort deck
      item.decks = (item?.decks ?? []).sort();

      // Remove decks if no deck is present
      if (item.decks.length === 0) {
        delete item.decks;

        acc[item.id] = item;
        return acc;
      }

      // Remove thing from deck if either evidence, dream, alien, or mesmice is present and both pt and en names are single words
      if (
        item.decks.includes('thing') &&
        item.name.en.split(' ').length === 1 &&
        item.name.pt.split(' ').length === 1
      ) {
        if (
          item.decks.includes('evidence') ||
          item.decks.includes('dream') ||
          item.decks.includes('alien') ||
          item.decks.includes('mesmice')
        ) {
          item.decks = item.decks.filter((deck) => deck !== 'thing');
        }

        acc[item.id] = item;
      }

      acc[item.id] = item;

      return acc;
    }, {})
  );
}
