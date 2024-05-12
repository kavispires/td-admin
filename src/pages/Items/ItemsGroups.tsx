import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsSetsTable } from 'components/Items/ItemSetsTable';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirebaseData } from 'hooks/useResourceFirebaseData';
import { isEmpty } from 'lodash';
import { ItemGroup } from 'types';

export function ItemsGroups() {
  const { data, isLoading, error, isSaving, save, addEntryToUpdate, entriesToUpdate, isDirty } =
    useResourceFirebaseData<ItemGroup>({
      tdrResourceName: 'items-groups',
      firebaseDataCollectionName: 'itemsGroups',
      serialize: true,
    });

  console.log(data);

  return (
    <PageLayout title="Items" subtitle="Groups Sets">
      <Layout hasSider>
        <PageSider>
          <>-</>
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper isLoading={isLoading} error={error} hasResponseData={!isEmpty(data)}>
            {/* <ItemsSetsTable /> */}
            <></>
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsGroups;
