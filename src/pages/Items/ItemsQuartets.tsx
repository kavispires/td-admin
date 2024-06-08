import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsQuartetsFilters } from 'components/Items/ItemsQuartetsFilters';
import { ItemsQuartetsTable } from 'components/Items/ItemsQuartetsTable';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import { DailyQuartetSet } from 'types';

export function ItemsQuartets() {
  const quartetsData = useResourceFirebaseData<DailyQuartetSet>({
    tdrResourceName: 'daily-quartet-sets',
    firebaseDataCollectionName: 'quartetSets',
  });

  return (
    <PageLayout title="Items" subtitle="Quartet Sets">
      <Layout hasSider>
        <PageSider>
          <ItemsQuartetsFilters {...quartetsData} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={quartetsData.isLoading}
            error={quartetsData.error}
            hasResponseData={!isEmpty(quartetsData.data)}
          >
            <ItemsQuartetsTable {...quartetsData} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsQuartets;
