import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsDiscSetsContent } from 'components/Items/DiscSets/ItemsDiscSetsContent';
import { ItemsDiscSetsFilters } from 'components/Items/DiscSets/ItemsDiscSetsFilters';

import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import { DailyDiscSet } from 'types';

export function ItemsDiscSets() {
  const discSetsData = useResourceFirebaseData<DailyDiscSet>({
    tdrResourceName: 'daily-disc-sets',
    firebaseDataCollectionName: 'discSets',
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
            <ItemsDiscSetsContent {...discSetsData} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsDiscSets;
