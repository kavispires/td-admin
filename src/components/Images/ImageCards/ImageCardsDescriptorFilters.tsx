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
      <Flex vertical gap={12}>
        <SaveButton
          isDirty={isDirty}
          onSave={save}
          isSaving={isSaving}
          dirt={JSON.stringify(entriesToUpdate)}
        />

        <DownloadButton
          data={() => prepareFileForDownload(data)}
          fileName="image-cards.json"
          disabled={isDirty}
          block
        />
      </Flex>

      <Divider />

      <Button onClick={() => addParam('cardId', onRandomCard())} block>
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
