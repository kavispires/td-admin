import { Flex, Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsQuartetSearch } from 'components/Items/Quartets/ItemsQuartetSearch';
import { ItemsQuartetsContent } from 'components/Items/Quartets/ItemsQuartetsContent';
import { ItemsQuartetsFilters } from 'components/Items/Quartets/ItemsQuartetsFilters';
import { ItemsQuartetsSimulator } from 'components/Items/Quartets/ItemsQuartetsSimulator';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useQueryParams } from 'hooks/useQueryParams';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { DailyQuartetSet } from 'types';

export function ItemsQuartets() {
  const { queryParams } = useQueryParams();

  const quartetsData = useResourceFirestoreData<DailyQuartetSet>({
    tdrResourceName: 'daily-quartet-sets',
    firestoreDataCollectionName: 'quartetSets',
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
            {queryParams.get('display') === 'simulator' ? (
              <ItemsQuartetsSimulator {...quartetsData} />
            ) : (
              <Flex vertical gap={24}>
                <ItemsQuartetSearch {...quartetsData} />
                <ItemsQuartetsContent {...quartetsData} />
              </Flex>
            )}
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsQuartets;
