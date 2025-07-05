import { Flex, Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsQuartetSearch } from 'components/Items/Quartets/ItemsQuartetSearch';
import { ItemsQuartetsContent } from 'components/Items/Quartets/ItemsQuartetsContent';
import { ItemsQuartetsFilters } from 'components/Items/Quartets/ItemsQuartetsFilters';
import { ItemsQuartetsOrphans } from 'components/Items/Quartets/ItemsQuartetsOrphans';
import { ItemsQuartetsSimulator } from 'components/Items/Quartets/ItemsQuartetsSimulator';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useQueryParams } from 'hooks/useQueryParams';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { DailyQuartetSet } from 'types';

export function ItemsQuartets() {
  const { queryParams } = useQueryParams();
  const display = queryParams.get('display');

  const quartetsData = useResourceFirestoreData<DailyQuartetSet>({
    tdrResourceName: 'daily-quartet-sets',
    firestoreDataCollectionName: 'quartetSets',
  });

  return (
    <PageLayout subtitle="Quartet Sets" title="Items">
      <Layout hasSider>
        <PageSider>
          <ItemsQuartetsFilters {...quartetsData} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={quartetsData.error}
            hasResponseData={!isEmpty(quartetsData.data)}
            isLoading={quartetsData.isLoading}
          >
            {display === 'simulator' && <ItemsQuartetsSimulator />}
            {display === 'orphans' && (
              <Flex gap={24} vertical>
                <ItemsQuartetSearch {...quartetsData} />
                <ItemsQuartetsOrphans {...quartetsData} />
              </Flex>
            )}
            {!display && (
              <Flex gap={24} vertical>
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
