import { Layout } from 'antd';
import { ImagesRelationshipsProvider } from 'components/Images/ImageCards/ImagesRelationshipsContext';
import { PageLayout } from 'components/Layout';

function ImageCardsRelationships() {
  return (
    <PageLayout subtitle="Comparator" title="Image Cards">
      <ImagesRelationshipsProvider>
        <Layout hasSider>
          {/* <RelationshipsFilters /> */}

          <Layout.Content className="content">{/* <RelationshipsContent /> */}</Layout.Content>
        </Layout>
      </ImagesRelationshipsProvider>
    </PageLayout>
  );
}

export default ImageCardsRelationships;
