import { Layout } from 'antd';
import { DataLoadingWrapper } from 'components/DataLoadingWrapper';
import { ItemsGroupsContent } from 'components/Items/Groups/ItemsGroupsContent';
import { ItemsGroupsFilters } from 'components/Items/Groups/ItemsGroupsFilters';
import { PageLayout } from 'components/Layout';
import { PageSider } from 'components/Layout/PageSider';
import { useResourceFirestoreData } from 'hooks/useResourceFirestoreData';
import { useTDResource } from 'hooks/useTDResource';
import { isEmpty } from 'lodash';
import type { Item, ItemGroup } from 'types';

export function ItemsGroups() {
  const groupsQuery = useResourceFirestoreData<ItemGroup>({
    tdrResourceName: 'items-groups',
    firestoreDataCollectionName: 'itemsGroups',
    serialize: true,
  });
  const itemsTypeaheadQuery = useTDResource<Item>('items');

  return (
    <PageLayout title="Items" subtitle="Groups Sets">
      <Layout hasSider>
        <PageSider>
          <ItemsGroupsFilters {...groupsQuery} />
        </PageSider>

        <Layout.Content className="content">
          <DataLoadingWrapper
            isLoading={groupsQuery.isLoading || itemsTypeaheadQuery.isLoading}
            error={groupsQuery.error || itemsTypeaheadQuery.error}
            hasResponseData={!isEmpty(groupsQuery.data) && !isEmpty(itemsTypeaheadQuery.data)}
          >
            <ItemsGroupsContent {...groupsQuery} />
          </DataLoadingWrapper>
        </Layout.Content>
      </Layout>
    </PageLayout>
  );
}

export default ItemsGroups;
