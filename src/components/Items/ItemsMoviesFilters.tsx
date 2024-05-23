import { Divider, Flex } from 'antd';
import { FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { DailyMovieSet } from 'types';
import { sortJsonKeys } from 'utils';

export function ItemsMoviesFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
}: UseResourceFirebaseDataReturnType<DailyMovieSet>) {
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
          fileName="daily-movie-sets.json"
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
    </SiderContent>
  );
}
function prepareFileForDownload(movies: Dictionary<DailyMovieSet>) {
  return sortJsonKeys(movies);
}
