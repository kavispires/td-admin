import { Button, Divider, Flex } from 'antd';
import { FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { DailyQuartetSet } from 'types';
import { sortJsonKeys } from 'utils';

export function ItemsQuartetsFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
}: UseResourceFirebaseDataReturnType<DailyQuartetSet>) {
  const { is, addParam } = useQueryParams();
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
          block
        />
      </Flex>

      <Divider />

      <FilterSwitch
        label="Pending Only"
        value={is('emptyOnly')}
        onChange={(mode) => addParam('emptyOnly', mode, false)}
      />

      <Button block onClick={() => addParam('newQuartet', 'true', false)} disabled={is('newQuartet')}>
        Add New Quartet
      </Button>
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
