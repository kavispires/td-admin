import { OpenAIOutlined } from '@ant-design/icons';
import { Divider, Flex, Typography } from 'antd';
import { FilterCheckBox, FilterSelect, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useItemsContext } from 'context/ItemsContext';
import { useQueryParams } from 'hooks/useQueryParams';
import { capitalize, cloneDeep, orderBy } from 'lodash';
import { useMemo } from 'react';
import type { Item } from 'types';
import { deepCleanObject, sortJsonKeys } from 'utils';
import { AddNewItem } from './AddNewItem';

export function ItemListingFilters() {
  const { isDirty, save, items, decks, itemsToUpdate, isSaving, hasFirestoreData } = useItemsContext();
  const { queryParams, is, addParam } = useQueryParams();

  const deckOptions = useMemo(() => {
    const includingOptions = orderBy(
      decks.map(({ value }) => ({ label: capitalize(value), value })),
      'label',
    );
    const excludingOptions = includingOptions
      .filter((e) => !e.value.startsWith('age'))
      .map(({ label, value }) => ({
        label: `NOT ${label}`,
        value: `!${value}`,
      }));
    return [...includingOptions, ...excludingOptions, { label: 'NOT any age', value: '!age' }];
  }, [decks]);

  return (
    <SiderContent>
      <Flex gap={6} vertical>
        <SaveButton
          dirt={JSON.stringify(itemsToUpdate)}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={save}
        />

        <DownloadButton
          block
          data={() => prepareFileForDownload(items)}
          disabled={isDirty}
          fileName="items.json"
          hasNewData={hasFirestoreData}
        />
      </Flex>
      <Divider className="my-4" />

      <Typography.Text type="secondary">Tools</Typography.Text>

      <FilterSwitch
        className="full-width m-0"
        label="Show Search"
        onChange={(v) => addParam('hideSearch', v ? '' : 'true', '')}
        value={!is('hideSearch')}
      />

      <FilterSwitch
        className="full-width m-0"
        label="Show Randomizer"
        onChange={(v) => addParam('showRandomizer', v ? 'true' : '', '')}
        value={is('showRandomizer')}
      />

      <Typography.Text type="secondary">Input</Typography.Text>

      <FilterCheckBox
        className="full-width m-0"
        label="Hide Decks"
        onChange={(v) => addParam('hideDecks', v ? 'true' : '')}
        value={is('hideDecks')}
      />

      <FilterCheckBox
        className="full-width m-0"
        label="Hide Aliases"
        onChange={(v) => addParam('hideAliases', v ? 'true' : '')}
        value={is('hideAliases')}
      />

      <Typography.Text type="secondary">Display</Typography.Text>

      <FilterSwitch
        className="full-width m-0"
        label="Simplified UI"
        onChange={(v) => addParam('simplified', v ? 'true' : '')}
        value={is('simplified')}
      />

      <FilterSwitch
        className="full-width m-0"
        label="Deck Checkboxes"
        onChange={(v) => addParam('deckCheckboxes', v ? 'true' : '')}
        value={is('deckCheckboxes')}
      />

      <FilterSwitch
        className="full-width m-0"
        disabled={is('simplified')}
        label="Thing Verifier"
        onChange={(v) => addParam('showVerifyThing', v ? 'true' : '')}
        value={is('showVerifyThing')}
      />

      <Divider className="my-4" />

      <FilterSelect
        label="Deck"
        onChange={(value) => addParam('deck', value, 'all')}
        options={[
          { label: 'All', value: 'all' },
          { label: 'NSFW', value: 'nsfw' },
          { label: 'SFW', value: '!nsfw' },
          ...deckOptions,
          { label: 'No decks', value: '!all' },
        ]}
        value={queryParams.get('deck') ?? 'all'}
      />

      <Divider className="my-4" />

      <AddNewItem />

      <Divider className="my-4" />

      <DownloadButton
        block
        data={() => prepareOpenAIFileForDownload(items)}
        disabled={isDirty}
        fileName="items-gpt.json"
        icon={<OpenAIOutlined />}
      >
        Open AI JSON
      </DownloadButton>
    </SiderContent>
  );
}

function prepareFileForDownload(items: Dictionary<Item>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(items);

  Object.values(copy).reduce((acc: Dictionary<Item>, item) => {
    // Fixed aliases
    item.aliasesEn = Object.values(item.aliasesEn ?? {}).sort();
    if (item.aliasesEn.length === 0) {
      item.aliasesEn = undefined;
    }
    item.aliasesPt = Object.values(item.aliasesPt ?? {}).sort();
    if (item.aliasesPt.length === 0) {
      item.aliasesPt = undefined;
    }

    // Sort deck
    item.decks = Object.values(item?.decks ?? {}).sort();

    // Remove decks if no deck is present
    if (item.decks.length === 0) {
      item.decks = undefined;
    }

    acc[item.id] = item;
    return acc;
  }, {});

  return sortJsonKeys(deepCleanObject(copy));
}

type OpenAiItem = {
  id: string;
  names: {
    'en-US': string;
    'pt-BR': string;
  };
  aliases: {
    'en-US'?: string[];
    'pt-BR'?: string[];
  };
};

function prepareOpenAIFileForDownload(items: Dictionary<Item>) {
  return sortJsonKeys(
    Object.values(cloneDeep(items)).reduce((acc: Dictionary<OpenAiItem>, item) => {
      const entry = {
        id: item.id,
        names: {
          'en-US': item.name.en,
          'pt-BR': item.name.pt,
        },
        aliases: {
          'en-US': item.aliasesEn,
          'pt-BR': item.aliasesPt,
        },
      };

      acc[entry.id] = entry;
      return acc;
    }, {}),
  );
}
