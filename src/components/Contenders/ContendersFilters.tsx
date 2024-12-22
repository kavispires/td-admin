import { Divider, Flex, Typography } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { cloneDeep } from 'lodash';
import { useMemo } from 'react';
import type { ContenderCard } from 'types';
import { sortJsonKeys } from 'utils';
import { SaveButton } from 'components/Common/SaveButton';
import { DataFilters } from 'components/Common/DataFilters';
import type { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { DECKS } from './ContenderEditCard';

export type ContendersFiltersProps = ReturnType<typeof useResourceFirebaseData<ContenderCard>>;

export function ContendersFilters({
  data,
  isDirty,
  save,
  isSaving,
  entriesToUpdate,
}: ContendersFiltersProps) {
  return (
    <>
      <SiderContent>
        <Flex vertical gap={12}>
          <SaveButton
            isDirty={isDirty}
            onSave={save}
            isSaving={isSaving}
            dirt={JSON.stringify(entriesToUpdate)}
          />

          <DownloadButton
            data={() => prepareFileForDownload(data)}
            fileName="contenders.json"
            disabled={isDirty}
            block
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
      delete entry.exclusivity;
    }
  });

  return sortJsonKeys(copy);
}

function DeckCounts({ data }: Pick<ContendersFiltersProps, 'data'>) {
  const counts = useMemo(() => {
    let englishExclusivity = 0;
    let portugueseExclusivity = 0;
    let bothExclusivity = 0;
    const deckCounts = Object.values(data).reduce((acc: Dictionary<number>, contender) => {
      (contender.decks ?? []).forEach((deck) => {
        acc[deck] = acc[deck] ? acc[deck] + 1 : 1;
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
    <Flex vertical gap={8}>
      <Typography.Text strong>Deck Counts</Typography.Text>

      <Flex vertical gap={8} style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {DECKS.map((entry) => (
          <Typography.Text key={entry.value}>
            {entry.label}: {counts.deckCounts[entry.value] ?? 0}
          </Typography.Text>
        ))}
      </Flex>

      <Divider className="my-2" />

      <Typography.Text strong>Invalid Decks</Typography.Text>
      <Flex vertical gap={8} style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {counts.invalidDecks.map((deck) => (
          <Typography.Text key={deck}>{deck}</Typography.Text>
        ))}
      </Flex>

      <Divider className="my-2" />

      <Typography.Text strong>Exclusivity</Typography.Text>
      <Flex vertical gap={8}>
        <Typography.Text>English: {counts.englishExclusivity}</Typography.Text>
        <Typography.Text>Portuguese: {counts.portugueseExclusivity}</Typography.Text>
        <Typography.Text>Both: {counts.bothExclusivity}</Typography.Text>
      </Flex>
    </Flex>
  );
}
