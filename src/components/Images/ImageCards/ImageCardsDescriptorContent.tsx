import { useQueryParams } from '@hooks/useQueryParams';
import type { UseResourceFirestoreDataReturnType } from '@hooks/useResourceFirestoreData';
import type { ImageCardDescriptorData } from '@types';
import { ImageCardsDescriptorKeywords } from './ImageCardsDescriptorKeywords';
import { ImageCardsDescriptorTable } from './ImageCardsDescriptorTable';

export function ImageCardsDescriptorContent(
  query: UseResourceFirestoreDataReturnType<ImageCardDescriptorData>,
) {
  const { queryParams } = useQueryParams();

  const displayMode = queryParams.get('display') || 'table';

  return (
    <>
      {displayMode === 'table' && <ImageCardsDescriptorTable {...query} />}
      {displayMode === 'keywords' && <ImageCardsDescriptorKeywords {...query} />}
    </>
  );
}
