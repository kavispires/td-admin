import { Button, Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SiderContent } from 'components/Layout';
import { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import { DailyMovieSet } from 'types';
import { sortJsonKeys } from 'utils';

export function ItemsMoviesFilters({
  data,
  save,
  isDirty,
  isSaving,
}: UseResourceFirebaseDataReturnType<DailyMovieSet>) {
  return (
    <SiderContent>
      <Flex vertical gap={12}>
        <Button
          block
          danger
          type="primary"
          loading={isSaving}
          disabled={!isDirty}
          onClick={save}
          size="large"
        >
          Save
        </Button>
        <DownloadButton
          data={() => prepareFileForDownload(data)}
          fileName="daily-movie-sets.json"
          disabled={isDirty}
          block
        />
      </Flex>
    </SiderContent>
  );
}
function prepareFileForDownload(movies: Dictionary<DailyMovieSet>) {
  return sortJsonKeys(movies);
}
