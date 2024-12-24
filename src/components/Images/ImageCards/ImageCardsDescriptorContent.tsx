import { useQueryParams } from 'hooks/useQueryParams';
import type { UseResourceFirebaseDataReturnType } from 'hooks/useResourceFirebaseData';
import type { ImageCardDescriptor } from 'types';
import { useTDResource } from 'hooks/useTDResource';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { useImageCardsDecks } from './hooks/useImageCardsDecks';
import { ImageCardsDescriptorTable } from './ImageCardsDescriptorTable';
import { ImageCardsDescriptorModal } from './ImageCardsDescriptorModal';

export function ImageCardsDescriptorContent(query: UseResourceFirebaseDataReturnType<ImageCardDescriptor>) {
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
