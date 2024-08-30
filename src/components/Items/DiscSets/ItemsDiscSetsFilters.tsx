import { Divider, Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { cloneDeep, isEmpty, omitBy } from 'lodash';
import { DailyDiscSet } from 'types';
import { removeDuplicates, sortItemsIds, sortJsonKeys } from 'utils';

import { AddNewSetFlow } from './AddNewSetFlow';

export function ItemsDiscSetsFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  addEntryToUpdate,
}: UseResourceFirebaseDataReturnType<DailyDiscSet>) {
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
          block
        />
      </Flex>
      <Divider />
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
