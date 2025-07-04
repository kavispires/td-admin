import { Layout } from 'antd';
import { ConnectionsContent } from 'components/Images/ImageCards/ConnectionsContent';
import { ConnectionsFilters } from 'components/Images/ImageCards/ConnectionsFilters';
import { ImagesRelationshipsProvider } from 'components/Images/ImageCards/ImagesRelationshipsContext';
import { PageLayout } from 'components/Layout';

function ImageCardsConnections() {
  return (
    <PageLayout subtitle="Connections" title="Image Cards">
      <ImagesRelationshipsProvider>
        <Layout hasSider>
          <ConnectionsFilters />

          <Layout.Content className="content">
            <ConnectionsContent />
          </Layout.Content>
        </Layout>
      </ImagesRelationshipsProvider>
    </PageLayout>
  );
}

export default ImageCardsConnections;
