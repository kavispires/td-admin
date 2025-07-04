import { FrownOutlined, TableOutlined } from '@ant-design/icons';
import { Divider, Flex } from 'antd';
import { FilterSegments } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep, isEmpty, omitBy } from 'lodash';
import type { DailyDiscSet } from 'types';
import { removeDuplicates, sortItemsIds, sortJsonKeys } from 'utils';
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
      <Flex gap={12} vertical>
        <SaveButton
          dirt={JSON.stringify(prepareObjectToSave(entriesToUpdate))}
          isDirty={isDirty}
          isSaving={isSaving}
          onSave={save}
        />

        <DownloadButton
          block
          data={() => prepareFileForDownload(data)}
          disabled={isDirty}
          fileName="daily-disc-sets.json"
          hasNewData={hasFirestoreData}
        />
      </Flex>

      <Divider />

      <FilterSegments
        label="Display"
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
        value={queryParams.get('display') ?? 'sets'}
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
