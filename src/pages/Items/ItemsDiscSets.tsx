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
    <PageLayout title="Items" subtitle="Disc Sets">
      <Layout hasSider>
        <PageSider>
          <ItemsDiscSetsFilters {...discSetsData} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={discSetsData.isLoading || discSetsData.isSaving}
            error={discSetsData.error}
            hasResponseData={!isEmpty(discSetsData.data)}
          >
            <ItemsDiscSetsSubPages {...discSetsData} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsDiscSets;
