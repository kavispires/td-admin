import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ImageCardsDescriptorContent } from 'components/Images/ImageCards/ImageCardsDescriptorContent';
import { ImageCardsDescriptorFilters } from 'components/Images/ImageCards/ImageCardsDescriptorFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { ImageCardDescriptor } from 'types';

export function ImageCardsDescriptor() {
  const imageCardsQuery = useResourceFirestoreData<ImageCardDescriptor>({
    tdrResourceName: 'image-cards',
    firestoreDataCollectionName: 'imageCards',
    serialize: true,
  });

  return (
    <PageLayout subtitle="Descriptors" title="Image Cards">
      <Layout hasSider>
        <PageSider>
          <ImageCardsDescriptorFilters {...imageCardsQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={imageCardsQuery.error}
            hasResponseData={!isEmpty(imageCardsQuery.data)}
            isLoading={imageCardsQuery.isLoading}
          >
            <ImageCardsDescriptorContent {...imageCardsQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ImageCardsDescriptor;
