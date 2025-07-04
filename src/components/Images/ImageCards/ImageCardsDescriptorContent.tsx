import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import type { ImageCardDescriptor } from 'types';
import { useImageCardsDecks } from './hooks/useImageCardsDecks';
import { ImageCardsDescriptorModal } from './ImageCardsDescriptorModal';
import { ImageCardsDescriptorTable } from './ImageCardsDescriptorTable';

export function ImageCardsDescriptorContent(query: UseResourceFirestoreDataReturnType<ImageCardDescriptor>) {
  const imageCardsDecksQuery = useImageCardsDecks();
  const tdrImagesCredoQuery = useTDResource('images-credo');
  const { addParam, removeParam } = useQueryParams();

  return (
    <DataLoadingWrapper
      error={tdrImagesCredoQuery.error ?? imageCardsDecksQuery.error}
      hasResponseData={imageCardsDecksQuery.hasResponseData || tdrImagesCredoQuery.hasResponseData}
      isLoading={imageCardsDecksQuery.isLoading || tdrImagesCredoQuery.isLoading}
    >
      <ImageCardsDescriptorTable {...query} />
      <ImageCardsDescriptorModal
        {...query}
        onClose={() => removeParam('cardId')}
        onNewCard={() => addParam('cardId', imageCardsDecksQuery.onRandomCard())}
      />
    </DataLoadingWrapper>
  );
}
