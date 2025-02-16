import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ImageCardsDescriptorContent } from 'components/Images/ImageCards/ImageCardsDescriptorContent';
import { ImageCardsDescriptorFilters } from 'components/Images/ImageCards/ImageCardsDescriptorFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import type { ImageCardDescriptor } from 'types';

export function ImageCardsDescriptor() {
  const imageCardsQuery = useResourceFirebaseData<ImageCardDescriptor>({
    tdrResourceName: 'image-cards',
    firebaseDataCollectionName: 'imageCards',
    serialize: true,
  });

  return (
    <PageLayout title="Image Cards" subtitle="Descriptors">
      <Layout hasSider>
        <PageSider>
          <ImageCardsDescriptorFilters {...imageCardsQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={imageCardsQuery.isLoading}
            error={imageCardsQuery.error}
            hasResponseData={!isEmpty(imageCardsQuery.data)}
          >
            <ImageCardsDescriptorContent {...imageCardsQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ImageCardsDescriptor;
