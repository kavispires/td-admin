import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { SuspectsContent } from 'components/Suspects/SuspectsContent';
import { SuspectsFilters } from 'components/Suspects/SuspectsFilters';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { SuspectCard } from 'types';

function Suspects() {
  const suspectsQuery = useResourceFirestoreData<SuspectCard>({
    tdrResourceName: 'suspects',
    firestoreDataCollectionName: 'suspects',
    serialize: true,
  });

  return (
    <PageLayout subtitle="Information" title="Suspects">
      <Layout hasSider>
        <PageSider>
          <SuspectsFilters {...suspectsQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={suspectsQuery.error}
            hasResponseData={!isEmpty(suspectsQuery.data)}
            isLoading={suspectsQuery.isLoading}
          >
            <SuspectsContent {...suspectsQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default Suspects;
