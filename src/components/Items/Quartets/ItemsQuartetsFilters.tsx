import { GlobalOutlined, TableOutlined } from '@ant-design/icons';
import { Divider, Flex } from 'antd';
import { FilterSegments, FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { DailyQuartetSet } from 'types';
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
  return (
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
          fileName="daily-quartet-sets.json"
          disabled={isDirty}
          hasNewData={hasFirestoreData}
          block
        />
      </Flex>

      <Divider />

      <FilterSwitch
        label="Pending Only"
        value={is('emptyOnly')}
        onChange={(mode) => addParam('emptyOnly', mode, false)}
      />

      <NewQuartetFlow data={data} addEntryToUpdate={addEntryToUpdate} />

      <Divider />

      <FilterSegments
        label="Display"
        value={queryParams.get('display') ?? 'table'}
        onChange={(mode) => addParams({ display: mode, page: 1 }, { page: 1, display: 'table' })}
        options={[
          {
            title: 'Table',
            icon: <TableOutlined />,
            value: 'table',
          },
          {
            title: 'Simulator',
            icon: <GlobalOutlined />,
            value: 'simulator',
          },
        ]}
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
