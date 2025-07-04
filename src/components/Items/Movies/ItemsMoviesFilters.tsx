import { App, Button, Divider, Flex } from 'antd';
import { FilterSwitch } from 'components/Common';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useCopyToClipboardFunction } from 'hooks/useCopyToClipboardFunction';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import type { DailyMovieSet } from 'types';
import { createIncrementalUID, sortJsonKeys } from 'utils';

export function ItemsMoviesFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  hasFirestoreData,
  addEntryToUpdate,
}: UseResourceFirestoreDataReturnType<DailyMovieSet>) {
  const { is, addParam } = useQueryParams();
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
          fileName="daily-movie-sets.json"
          hasNewData={hasFirestoreData}
        />
      </Flex>

      <Divider />

      <FilterSwitch
        label="Pending Only"
        onChange={(mode) => addParam('emptyOnly', mode, false)}
        value={is('emptyOnly')}
      />

      <NewPlaceholderMovieSet addEntryToUpdate={addEntryToUpdate} data={data} />
    </SiderContent>
  );
}
function prepareFileForDownload(movies: Dictionary<DailyMovieSet>) {
  return sortJsonKeys(movies);
}

type NewPlaceholderMovieSetProps = {
  data: UseResourceFirestoreDataReturnType<DailyMovieSet>['data'];
  addEntryToUpdate: UseResourceFirestoreDataReturnType<DailyMovieSet>['addEntryToUpdate'];
};

function NewPlaceholderMovieSet({ data, addEntryToUpdate }: NewPlaceholderMovieSetProps) {
  const { message } = App.useApp();
  const copyToClipboard = useCopyToClipboardFunction();

  const onNewMovieSet = () => {
    const id = createIncrementalUID(Object.keys(data), 'dms', 'pt', '-', 1);
    const PLACEHOLDER = '[New Movie Set]';
    addEntryToUpdate(id, {
      id,
      title: PLACEHOLDER,
      itemsIds: [],
      year: new Date().getFullYear(),
    });
    message.success(`New Movie Set created, search for ${PLACEHOLDER} to find it easily.`);
    copyToClipboard(PLACEHOLDER);
  };

  return (
    <Button block onClick={onNewMovieSet} variant="dashed">
      Add New Movie Set
    </Button>
  );
}
