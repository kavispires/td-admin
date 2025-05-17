import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import type { ImageCardDescriptor } from 'types';
import { ImageCardsDescriptorModal } from './ImageCardsDescriptorModal';
import { ImageCardsDescriptorTable } from './ImageCardsDescriptorTable';
import { useImageCardsDecks } from './hooks/useImageCardsDecks';

export function ImageCardsDescriptorContent(query: UseResourceFirestoreDataReturnType<ImageCardDescriptor>) {
  const imageCardsDecksQuery = useImageCardsDecks();
  const tdrImagesCredoQuery = useTDResource('images-credo');
  const { addParam, removeParam } = useQueryParams();

  return (
    <DataLoadingWrapper
      isLoading={imageCardsDecksQuery.isLoading || tdrImagesCredoQuery.isLoading}
      hasResponseData={imageCardsDecksQuery.hasResponseData || tdrImagesCredoQuery.hasResponseData}
      error={tdrImagesCredoQuery.error ?? imageCardsDecksQuery.error}
    >
      <ImageCardsDescriptorTable {...query} />
      <ImageCardsDescriptorModal
        {...query}
        onNewCard={() => addParam('cardId', imageCardsDecksQuery.onRandomCard())}
        onClose={() => removeParam('cardId')}
      />
    </DataLoadingWrapper>
  );
}
