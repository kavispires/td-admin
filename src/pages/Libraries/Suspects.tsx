import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { SuspectsContent } from 'components/Suspects/SuspectsContent';
import { SuspectsFilters } from 'components/Suspects/SuspectsFilters';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { SuspectCard, SuspectExtendedInfo } from 'types';

function Suspects() {
  const suspectsQuery = useResourceFirestoreData<SuspectCard>({
    tdrResourceName: 'suspects',
    firestoreDataCollectionName: 'suspects',
    serialize: true,
  });
  const suspectsExtendedInfoQuery = useResourceFirestoreData<SuspectExtendedInfo>({
    tdrResourceName: 'suspects-extended-info',
    firestoreDataCollectionName: 'suspectsExtendedInfo',
    serialize: true,
  });

  return (
    <PageLayout subtitle="Information" title="Suspects">
      <Layout hasSider>
        <PageSider>
          <SuspectsFilters
            suspectsExtendedInfoQuery={suspectsExtendedInfoQuery}
            suspectsQuery={suspectsQuery}
          />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={suspectsQuery.error || suspectsExtendedInfoQuery.error}
            hasResponseData={!isEmpty(suspectsQuery.data) && !isEmpty(suspectsExtendedInfoQuery.data)}
            isLoading={suspectsQuery.isLoading || suspectsExtendedInfoQuery.isLoading}
          >
            <SuspectsContent
              suspectsExtendedInfoQuery={suspectsExtendedInfoQuery}
              suspectsQuery={suspectsQuery}
            />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default Suspects;
