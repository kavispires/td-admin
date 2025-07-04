import { Layout } from 'antd';
import { ImagesRelationshipsProvider } from 'components/Images/ImageCards/ImagesRelationshipsContext';
import { RelationshipsContent } from 'components/Images/ImageCards/RelationshipsContent';
import { RelationshipsFilters } from 'components/Images/ImageCards/RelationshipsFilters';
import { PageLayout } from 'components/Layout';

function ImageCardsRelationships() {
  return (
    <PageLayout subtitle="Relationships" title="Image Cards">
      <ImagesRelationshipsProvider>
        <Layout hasSider>
          <RelationshipsFilters />

          <Layout.Content className="content">
            <RelationshipsContent />
          </Layout.Content>
        </Layout>
      </ImagesRelationshipsProvider>
    </PageLayout>
  );
}

export default ImageCardsRelationships;
