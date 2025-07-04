import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsDiscSetsFilters } from 'components/Items/DiscSets/ItemsDiscSetsFilters';
import { ItemsDiscSetsSubPages } from 'components/Items/DiscSets/ItemsDiscSetsSubPages';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { isEmpty } from 'lodash';
import type { DailyDiscSet } from 'types';

export function ItemsDiscSets() {
  const discSetsData = useResourceFirestoreData<DailyDiscSet>({
    tdrResourceName: 'daily-disc-sets',
    firestoreDataCollectionName: 'discSets',
    serialize: true,
  });

  return (
    <PageLayout subtitle="Disc Sets" title="Items">
      <Layout hasSider>
        <PageSider>
          <ItemsDiscSetsFilters {...discSetsData} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            error={discSetsData.error}
            hasResponseData={!isEmpty(discSetsData.data)}
            isLoading={discSetsData.isLoading || discSetsData.isSaving}
          >
            <ItemsDiscSetsSubPages {...discSetsData} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsDiscSets;
