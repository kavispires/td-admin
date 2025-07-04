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
    <PageLayout subtitle="Comparator" title="Image Cards">
      <DataLoadingWrapper
        error={query.error}
        hasResponseData={!isEmpty(query.data)}
        isLoading={query.isLoading}
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
