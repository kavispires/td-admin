import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsSetsTable } from 'components/Items/ItemSetsTable';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import { DailyMovieSet, DailyQuartetSet } from 'types';

export function ItemsQuartets() {
  const { data, isLoading, error, isSaving, save, addEntryToUpdate, entriesToUpdate, isDirty } =
    useResourceFirebaseData<DailyQuartetSet>({
      tdrResourceName: 'daily-quartet-sets',
      firebaseDataCollectionName: 'quartetSets',
    });

  return (
    <PageLayout title="Items" subtitle="Quartet Sets">
      <Layout hasSider>
        <PageSider>
          <>-</>
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={!isEmpty(data)}>
            <ItemsSetsTable />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsQuartets;
