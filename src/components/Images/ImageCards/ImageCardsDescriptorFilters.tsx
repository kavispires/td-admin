import { Button, Divider, Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep } from 'lodash';
import type { ImageCardDescriptor } from 'types';
import { sortJsonKeys } from 'utils';
import { useImageCardsDecks } from './hooks/useImageCardsDecks';

export function ImageCardsDescriptorFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
}: UseResourceFirestoreDataReturnType<ImageCardDescriptor>) {
  const { addParam } = useQueryParams();
  const { onRandomCard } = useImageCardsDecks();
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
          fileName="image-cards.json"
        />
      </Flex>

      <Divider />

      <Button block onClick={() => addParam('cardId', onRandomCard())}>
        Random Card
      </Button>

      <Divider />
    </SiderContent>
  );
}

function prepareFileForDownload(diagramItems: Dictionary<ImageCardDescriptor>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(diagramItems);
  return sortJsonKeys(copy);
}
