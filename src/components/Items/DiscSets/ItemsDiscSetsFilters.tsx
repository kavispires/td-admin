import { Divider, Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep, isEmpty, omitBy } from 'lodash';
import type { DailyDiscSet } from 'types';
import { removeDuplicates, sortItemsIds, sortJsonKeys } from 'utils';

import { FrownOutlined, TableOutlined } from '@ant-design/icons';
import { FilterSegments } from 'components/Common';
import { useQueryParams } from 'hooks/useQueryParams';
import { AddNewSetFlow } from './AddNewSetFlow';

export function ItemsDiscSetsFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  addEntryToUpdate,
  hasFirestoreData,
}: UseResourceFirestoreDataReturnType<DailyDiscSet>) {
  const { queryParams, addParams } = useQueryParams();

  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <SaveButton
          isDirty={isDirty}
          onSave={save}
          isSaving={isSaving}
          dirt={JSON.stringify(prepareObjectToSave(entriesToUpdate))}
        />

        <DownloadButton
          data={() => prepareFileForDownload(data)}
          fileName="daily-disc-sets.json"
          disabled={isDirty}
          hasNewData={hasFirestoreData}
          block
        />
      </Flex>

      <Divider />

      <FilterSegments
        label="Display"
        value={queryParams.get('display') ?? 'sets'}
        onChange={(mode) => addParams({ display: mode, page: 1 }, { page: 1, display: 'table' })}
        options={[
          {
            title: 'Sets',
            icon: <TableOutlined />,
            value: 'sets',
          },
          {
            title: 'Orphan Items',
            icon: <FrownOutlined />,
            value: 'orphans',
          },
        ]}
      />

      <AddNewSetFlow addEntryToUpdate={addEntryToUpdate} ids={Object.keys(data)} />
    </SiderContent>
  );
}

function prepareObjectToSave(groups: Dictionary<DailyDiscSet>) {
  return omitBy(cloneDeep(groups), (group) => isEmpty(group.itemsIds));
}

function prepareFileForDownload(groups: Dictionary<DailyDiscSet>) {
  Object.keys(groups).forEach((key) => {
    groups[key].itemsIds = sortItemsIds(removeDuplicates(groups[key].itemsIds));
  });
  return sortJsonKeys(prepareObjectToSave(groups));
}
