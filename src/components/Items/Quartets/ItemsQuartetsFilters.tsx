import { RobotOutlined, TableOutlined } from '@ant-design/icons';
import { Divider, Flex } from 'antd';
import { FilterSegments, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { useEffect } from 'react';
import type { DailyQuartetSet, Item } from 'types';
import { sortJsonKeys } from 'utils';
import { NewQuartetFlow } from './NewQuartetFlow';

export function ItemsQuartetsFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  addEntryToUpdate,
  hasFirestoreData,
}: UseResourceFirestoreDataReturnType<DailyQuartetSet>) {
  const { is, addParam, queryParams, addParams } = useQueryParams();

  useGroupItemsByNameEnding();

  return (
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
          fileName="daily-quartet-sets.json"
          hasNewData={hasFirestoreData}
        />
      </Flex>

      <Divider />

      <FilterSwitch
        label="Pending Only"
        onChange={(mode) => addParam('emptyOnly', mode, false)}
        value={is('emptyOnly')}
      />

      <NewQuartetFlow addEntryToUpdate={addEntryToUpdate} data={data} />

      <Divider />

      <FilterSegments
        label="Display"
        onChange={(mode) => addParams({ display: mode, page: 1 }, { page: 1, display: 'table' })}
        options={[
          {
            title: 'Table',
            icon: <TableOutlined />,
            value: 'table',
          },
          {
            title: 'Simulator',
            icon: <RobotOutlined />,
            value: 'simulator',
          },
        ]}
        value={queryParams.get('display') ?? 'table'}
      />
    </SiderContent>
  );
}

function prepareFileForDownload(quartets: Dictionary<DailyQuartetSet>) {
  // let latestId = 1;
  // console.log(quartets);
  // const clearedIds = Object.values(quartets).reduce((acc: Dictionary<DailyQuartetSet>, quartet) => {
  //   const { id, ...rest } = quartet;
  //   if (!rest.title) {
  //     return acc;
  //   }

  //   const newId = `dqs-${String(latestId).padStart(4, '0')}-pt`;
  //   acc[newId] = { ...rest, id: newId };
  //   console.log(rest.title);
  //   latestId += 1;
  //   return acc;
  // }, {});
  // console.log(clearedIds);

  return sortJsonKeys(quartets);
}

function useGroupItemsByNameEnding() {
  const tdrItemsQuery = useTDResource<Item>('items');

  // biome-ignore lint/correctness/useExhaustiveDependencies: only rerun during data updates
  useEffect(() => {
    if (!tdrItemsQuery.dataUpdatedAt) return;

    // Group items by the last two, three, and four characters of their names
    // Use only item.name.pt if it's a single word, otherwise search item.aliasesPt for a single word name, if there is none, use the regular one only two words.
    const groupedItems: any = {
      twoChars: {},
      threeChars: {},
      fourChars: {},
    };
    Object.values(tdrItemsQuery.data ?? {}).forEach((item) => {
      const name = item.name.pt || item.aliasesPt?.find((alias) => alias.split(' ').length === 1);
      if (!name || name.length < 3) return;

      const twoChars = name.slice(-2).trim();
      if (twoChars.length < 2) return; // Ensure we have at least two characters
      if (!groupedItems.twoChars[twoChars]) {
        groupedItems.twoChars[twoChars] = [];
      }
      groupedItems.twoChars[twoChars].push(item);

      const threeChars = name.slice(-3).trim();
      if (threeChars.length < 3) return; // Ensure we have at least three characters
      if (!groupedItems.threeChars[threeChars]) {
        groupedItems.threeChars[threeChars] = [];
      }
      groupedItems.threeChars[threeChars].push(item);

      const fourChars = name.slice(-4).trim();
      if (fourChars.length < 4) return; // Ensure we have at least four characters

      if (!groupedItems.fourChars[fourChars]) {
        groupedItems.fourChars[fourChars] = [];
      }
      groupedItems.fourChars[fourChars].push(item);
    });

    // Remove any groups with less than 4 items
    Object.keys(groupedItems).forEach((key) => {
      Object.keys(groupedItems[key]).forEach((subKey) => {
        if (groupedItems[key][subKey].length < 4) {
          delete groupedItems[key][subKey];
        }
      });
    });

    console.log('Grouped Items by Name Ending:', groupedItems);
  }, [tdrItemsQuery.dataUpdatedAt]);
}
