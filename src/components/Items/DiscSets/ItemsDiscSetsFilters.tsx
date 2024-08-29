import { Button, Divider, Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { DailyDiscSet } from 'types';
import { removeDuplicates, sortItemsIds, sortJsonKeys } from 'utils';

import { SaveButton } from 'components/Common/SaveButton';
import { cloneDeep, isEmpty, omitBy } from 'lodash';

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
      <Button
        type="dashed"
        block
        onClick={() =>
          addEntryToUpdate('?', {
            id: '?',
            title: { pt: '', en: '' },
            itemsIds: [],
          })
        }
      >
        Add New Set
      </Button>
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
