import { Button, Divider, Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { FirestoreConsoleWipe } from 'components/Common/FirestoreConsoleLink';
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

        <Flex justify="center">
          <FirestoreConsoleWipe docId="imageCards" path="tdr" queryKey={['tdr', 'imageCards']} />
        </Flex>
      </Flex>

      <Divider />

      <Button block onClick={() => addParam('cardId', onRandomCard())}>
        Random Card
      </Button>

      <Divider />
    </SiderContent>
  );
}

/**
 * Checks if an image card descriptor is empty (only has id, no other meaningful data)
 */
function isEmptyEntry(entry: ImageCardDescriptor): boolean {
  const hasTitle = entry.title?.en || entry.title?.pt;
  const hasKeywords = entry.keywords && entry.keywords.length > 0;
  const hasTriggers = entry.triggers && entry.triggers.length > 0;
  const hasAssociatedDreams = entry.associatedDreams && entry.associatedDreams.length > 0;
  const hasFavorite = entry.favorite !== undefined;

  return !hasTitle && !hasKeywords && !hasTriggers && !hasAssociatedDreams && !hasFavorite;
}

function prepareFileForDownload(data: Dictionary<ImageCardDescriptor>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(data);

  // Filter out empty entries
  const filtered = Object.fromEntries(Object.entries(copy).filter(([_, entry]) => !isEmptyEntry(entry)));

  console.log(`Filtered out ${Object.keys(copy).length - Object.keys(filtered).length} empty entries`);

  return sortJsonKeys(filtered);
}
