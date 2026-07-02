import { FileMarkdownOutlined, TableOutlined } from '@ant-design/icons';
import { Button, Divider, Flex } from 'antd';
import { DownloadButton } from 'components/Common/DownloadButton';
import { FilterSegments } from 'components/Common/FilterEntries';
import { FirestoreConsoleWipe } from 'components/Common/FirestoreConsoleLink';
import { LanguageToggle } from 'components/Common/LanguageToggle';
import { SaveButton } from 'components/Common/SaveButton';
import { SiderContent } from 'components/Layout';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { cloneDeep } from 'lodash';
import type { ImageCardDescriptorData } from 'types';
import { sortJsonKeys } from 'utils/json';
import { AddImageCardDataModal } from './AddImageCardDataModal';
import { useImageCardsDecks } from './hooks/useImageCardsDecks';
import { ImageCardsDescriptorModal } from './ImageCardsDescriptorModal';

export function ImageCardsDescriptorFilters({
  data,
  save,
  isDirty,
  isSaving,
  entriesToUpdate,
  addEntryToUpdate,
  hasFirestoreData,
}: UseResourceFirestoreDataReturnType<ImageCardDescriptorData>) {
  const { addParam, addParams, queryParams } = useQueryParams();
  const { onRandomCard } = useImageCardsDecks();

  return (
    <SiderContent>
      <Flex
        gap={12}
        vertical
      >
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
          hasNewData={hasFirestoreData}
        />

        <Flex justify="center">
          <FirestoreConsoleWipe
            docId="imageCards"
            path="tdr"
            queryKey={['tdr', 'imageCards']}
          />
        </Flex>
      </Flex>

      <Divider />

      <FilterSegments
        label="Display"
        onChange={(mode) => addParams({ display: mode, page: 1 }, { page: 1, display: 'table' })}
        options={[
          {
            title: 'Table',
            icon: <TableOutlined />,
            value: 'table',
          },
          {
            title: 'Keywords',
            icon: <FileMarkdownOutlined />,
            value: 'keywords',
          },
        ]}
        value={queryParams.get('display') ?? 'table'}
      />

      <ImageCardsDescriptorModal
        addEntryToUpdate={addEntryToUpdate}
        data={data}
      />

      <Divider />

      <LanguageToggle
        withLabel
        withQueryParams
      />

      <Divider />

      <Button
        block
        className="mb-4"
        onClick={() => addParam('cardId', onRandomCard())}
      >
        Random Card
      </Button>

      <AddImageCardDataModal addEntryToUpdate={addEntryToUpdate} />
    </SiderContent>
  );
}

/**
 * Checks if an image card descriptor is empty (only has id, no other meaningful data)
 */
function isEmptyEntry(entry: ImageCardDescriptorData): boolean {
  const hasTitle = entry.title?.en || entry.title?.pt;
  const hasDescription = entry.description?.en || entry.description?.pt;
  const hasKeywords = entry.keywords?.en || entry.keywords?.pt;
  const hasTriggers = entry.triggers && entry.triggers.length > 0;
  const hasAssociatedDreams = entry.associatedDreams && entry.associatedDreams.length > 0;
  const hasFavorite = entry.favorite !== undefined;

  return !hasTitle && !hasDescription && !hasKeywords && !hasTriggers && !hasAssociatedDreams && !hasFavorite;
}

function prepareFileForDownload(data: Dictionary<ImageCardDescriptorData>) {
  console.log('Preparing file for download...');
  const copy = cloneDeep(data);

  // Filter out empty entries
  const filtered = Object.fromEntries(Object.entries(copy).filter(([_, entry]) => !isEmptyEntry(entry)));

  if (Object.keys(filtered).length > 0) {
    console.log(`Filtered out ${Object.keys(copy).length - Object.keys(filtered).length} empty entries`);
  }

  return sortJsonKeys(filtered);
}
