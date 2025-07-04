import { Divider, Flex, Typography } from 'antd';
import { DataFilters } from 'components/Common/DataFilters';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import type { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { cloneDeep } from 'lodash';
import { useMemo } from 'react';
import type { ContenderCard } from 'types';
import { deepCleanObject, sortJsonKeys } from 'utils';
import { DECKS } from './ContenderEditCard';

export type ContendersFiltersProps = ReturnType<typeof useResourceFirestoreData<ContenderCard>>;

export function ContendersFilters({
  data,
  isDirty,
  save,
  isSaving,
  entriesToUpdate,
  hasFirestoreData,
}: ContendersFiltersProps) {
  return (
    <>
      <SiderContent>
        <Flex gap={12} vertical>
          <SaveButton
            dirt={JSON.stringify(entriesToUpdate)}
            isDirty={isDirty}
            isSaving={isSaving}
            onSave={save}
          />

          <DownloadButton
            block
            data={() => prepareFileForDownload(data)}
            disabled={isDirty}
            fileName="contenders.json"
            hasNewData={hasFirestoreData}
          />
        </Flex>
      </SiderContent>

      <SiderContent>
        <DataFilters data={data} ignoreKeys={['description']} />
      </SiderContent>

      <SiderContent>
        <DeckCounts data={data} />
      </SiderContent>
    </>
  );
}

function prepareFileForDownload(entriesToUpdate: Dictionary<ContenderCard>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(entriesToUpdate);
  // Remove any undefined values of any keys in each entry
  Object.values(copy).forEach((entry) => {
    const exclusivity = entry.exclusivity as string;
    if (entry.exclusivity === undefined || exclusivity === 'none') {
      entry.exclusivity = undefined;
    }
  });

  return sortJsonKeys(deepCleanObject(copy));
}

function DeckCounts({ data }: Pick<ContendersFiltersProps, 'data'>) {
  const counts = useMemo(() => {
    let englishExclusivity = 0;
    let portugueseExclusivity = 0;
    let bothExclusivity = 0;
    const deckCounts = Object.values(data).reduce((acc: Dictionary<number>, contender) => {
      (contender.decks ?? []).forEach((deck, _, arr) => {
        if (deck === 'base' || !arr.includes('base')) {
          acc[deck] = acc[deck] ? acc[deck] + 1 : 1;
        }
      });
      if (contender.exclusivity === 'en') {
        englishExclusivity++;
      }
      if (contender.exclusivity === 'pt') {
        portugueseExclusivity++;
      }
      if (!contender.exclusivity) {
        bothExclusivity++;
      }

      return acc;
    }, {});

    const invalidDecks = Object.keys(deckCounts).filter((deck) => !DECKS.some((d) => d.value === deck));

    return { deckCounts, invalidDecks, englishExclusivity, portugueseExclusivity, bothExclusivity };
  }, [data]);

  return (
    <Flex gap={8} vertical>
      <Typography.Text strong>Deck Counts</Typography.Text>

      <Flex gap={8} style={{ maxHeight: '300px', overflowY: 'auto' }} vertical>
        {DECKS.map((entry) => (
          <Typography.Text key={entry.value}>
            {entry.label}: {counts.deckCounts[entry.value] ?? 0}
          </Typography.Text>
        ))}
      </Flex>

      <Divider className="my-2" />

      <Typography.Text strong>Invalid Decks</Typography.Text>
      <Flex gap={8} style={{ maxHeight: '300px', overflowY: 'auto' }} vertical>
        {counts.invalidDecks.map((deck) => (
          <Typography.Text key={deck}>{deck}</Typography.Text>
        ))}
      </Flex>

      <Divider className="my-2" />

      <Typography.Text strong>Exclusivity</Typography.Text>
      <Flex gap={8} vertical>
        <Typography.Text>English: {counts.englishExclusivity}</Typography.Text>
        <Typography.Text>Portuguese: {counts.portugueseExclusivity}</Typography.Text>
        <Typography.Text>Both: {counts.bothExclusivity}</Typography.Text>
      </Flex>
    </Flex>
  );
}
