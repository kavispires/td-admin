import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { Comparator } from 'components/Images/ImageCards/Comparator';
import { ComparatorFilters } from 'components/Images/ImageCards/ComparatorFilters';
import { useImageCardsRelationshipData } from 'components/Images/ImageCards/hooks/hooks';
import { PageLayout } from 'components/Layout';
import { isEmpty } from 'lodash';

function ImageCardsComparator() {
  const query = useImageCardsRelationshipData();

  return (
    <PageLayout title="Image Cards" subtitle="Comparator">
      <DataLoadingWrapper
        isLoading={query.isLoading}
        error={query.error}
        hasResponseData={!isEmpty(query.data)}
      >
        <Layout hasSider>
          <ComparatorFilters query={query} />

          <Layout.Content className="content">
            <Comparator query={query} />
          </Layout.Content>
        </Layout>
      </DataLoadingWrapper>
    </PageLayout>
  );
}

export default ImageCardsComparator;
